"use client";

import {
  memo,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArtifactKind, UIArtifact } from "./artifact";
import { FileIcon, ImageIcon, LoaderIcon, CopyIcon } from "./icons";
import { cn, fetcher } from "@/lib/utils";
import { Document } from "@/lib/db/schema";
import { InlineDocumentSkeleton } from "./document-skeleton";
import useSWR from "swr";
import { Editor } from "./text-editor";
import { DocumentToolCall, DocumentToolResult } from "./document";
import { CodeEditor } from "./code-editor";
import { useArtifact } from "@/hooks/use-artifact";
import equal from "fast-deep-equal";
import { SpreadsheetEditor } from "./sheet-editor";
import { ImageEditor } from "./image-editor";

interface DocumentPreviewProps {
  isReadonly: boolean;
  result?: any;
  args?: any;
}

export function DocumentPreview({
  isReadonly,
  result,
  args,
}: DocumentPreviewProps) {
  const { artifact, setArtifact } = useArtifact();

  const { data: documents, isLoading: isDocumentsFetching } = useSWR<
    Array<Document>
  >(result ? `/api/document?id=${result.id}` : null, fetcher);

  const previewDocument = useMemo(() => documents?.[0], [documents]);
  const hitboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boundingBox = hitboxRef.current?.getBoundingClientRect();

    if (artifact.documentId && boundingBox) {
      setArtifact((artifact) => ({
        ...artifact,
        boundingBox: {
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        },
      }));
    }
  }, [artifact.documentId, setArtifact]);

  const handleCopy = useCallback(() => {
    if (previewDocument?.content) {
      navigator.clipboard
        .writeText(previewDocument.content)
        .then(() => {
          // Could add a toast notification here
          console.log("Code copied to clipboard");
        })
        .catch((err) => {
          console.error("Failed to copy code:", err);
        });
    }
  }, [previewDocument?.content]);

  if (artifact.isVisible) {
    if (result) {
      return (
        <DocumentToolResult
          type="create"
          result={{ id: result.id, title: result.title, kind: result.kind }}
          isReadonly={isReadonly}
        />
      );
    }

    if (args) {
      return (
        <DocumentToolCall
          type="create"
          args={{ title: args.title }}
          isReadonly={isReadonly}
        />
      );
    }
  }

  if (isDocumentsFetching) {
    return <LoadingSkeleton artifactKind={result.kind ?? args.kind} />;
  }

  const document: Document | null = previewDocument
    ? previewDocument
    : artifact.status === "streaming"
    ? {
        title: artifact.title,
        kind: artifact.kind,
        content: artifact.content,
        id: artifact.documentId,
        createdAt: new Date(),
        userId: "noop",
      }
    : null;

  if (!document) return <LoadingSkeleton artifactKind={artifact.kind} />;

  return (
    <div className="relative w-full">
      <DocumentHeader
        title={document.title}
        kind={document.kind}
        isStreaming={artifact.status === "streaming"}
        onCopy={handleCopy}
      />
      <DocumentContent document={document} />
    </div>
  );
}

const LoadingSkeleton = ({ artifactKind }: { artifactKind: ArtifactKind }) => (
  <div className="w-full">
    <div className="p-4 border rounded-t-2xl flex flex-row gap-2 items-center justify-between dark:bg-muted h-[57px] dark:border-zinc-700 border-b-0">
      <div className="flex flex-row items-center gap-3">
        <div className="text-muted-foreground">
          <div className="animate-pulse rounded-md size-4 bg-muted-foreground/20" />
        </div>
        <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-24" />
      </div>
    </div>
  </div>
);

const PureDocumentHeader = ({
  title,
  kind,
  isStreaming,
  onCopy,
}: {
  title: string;
  kind: string;
  isStreaming: boolean;
  onCopy?: () => void;
}) => {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = () => {
    onCopy?.();
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div className="p-4 border rounded-t-2xl flex flex-row gap-2 items-start sm:items-center justify-between dark:bg-muted border-b-0 dark:border-zinc-700">
      <div className="flex flex-row items-start sm:items-center gap-3">
        <div className="text-muted-foreground">
          {isStreaming ? (
            <div className="animate-spin">
              <LoaderIcon />
            </div>
          ) : kind === "image" ? (
            <ImageIcon />
          ) : (
            <FileIcon />
          )}
        </div>
        <div className="-translate-y-1 sm:translate-y-0 font-medium">
          {title}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {kind === "code" && (
          <button
            onClick={handleCopy}
            className="p-2 hover:dark:bg-zinc-700 rounded-md hover:bg-zinc-100 text-muted-foreground relative"
            title="Copy code"
          >
            <CopyIcon size={16} />
            {showCopied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-zinc-800 text-white px-2 py-1 rounded">
                Copied!
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const DocumentHeader = memo(PureDocumentHeader, (prevProps, nextProps) => {
  if (prevProps.title !== nextProps.title) return false;
  if (prevProps.isStreaming !== nextProps.isStreaming) return false;
  if (prevProps.kind !== nextProps.kind) return false;
  return true;
});

const DocumentContent = ({ document }: { document: Document }) => {
  const { artifact } = useArtifact();

  const containerClassName = cn(
    "h-[257px] overflow-y-auto border rounded-b-2xl dark:bg-muted border-t-0 dark:border-zinc-700",
    {
      "p-4 sm:px-14 sm:py-16": document.kind === "text",
      "p-0": document.kind === "code",
    }
  );

  const commonProps = {
    content: document.content ?? "",
    isCurrentVersion: true,
    currentVersionIndex: 0,
    status: artifact.status,
    saveContent: () => {},
    suggestions: [],
  };

  return (
    <div className={containerClassName}>
      {document.kind === "text" ? (
        <Editor {...commonProps} onSaveContent={() => {}} />
      ) : document.kind === "code" ? (
        <div className="flex flex-1 relative w-full">
          <div className="absolute inset-0">
            <CodeEditor {...commonProps} onSaveContent={() => {}} />
          </div>
        </div>
      ) : document.kind === "sheet" ? (
        <div className="flex flex-1 relative size-full p-4">
          <div className="absolute inset-0">
            <SpreadsheetEditor {...commonProps} />
          </div>
        </div>
      ) : document.kind === "image" ? (
        <ImageEditor
          title={document.title}
          content={document.content ?? ""}
          isCurrentVersion={true}
          currentVersionIndex={0}
          status={artifact.status}
          isInline={true}
        />
      ) : null}
    </div>
  );
};
