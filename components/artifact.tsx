import { memo, Dispatch, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWindowSize } from "usehooks-ts";
import { ArtifactCloseButton } from "./artifact-close-button";
import { useArtifact } from "@/hooks/use-artifact";
import { Attachment, ChatRequestOptions, Message, CreateMessage } from "ai";

export type ArtifactKind = "code" | "text";

export interface UIArtifact {
  title: string;
  documentId: string;
  kind: ArtifactKind;
  content: string;
  isVisible: boolean;
  status: "streaming" | "idle";
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

interface ArtifactProps {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  handleSubmit: (
    event?: { preventDefault?: () => void },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  messages: Message[];
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
}

function PureArtifact(props: ArtifactProps) {
  const { artifact } = useArtifact();
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth ? windowWidth < 768 : false;

  return (
    <AnimatePresence>
      {artifact.isVisible && (
        <motion.div
          className="fixed z-50"
          initial={{
            opacity: 0,
            x: artifact.boundingBox.left,
            y: artifact.boundingBox.top,
            width: artifact.boundingBox.width,
            height: artifact.boundingBox.height,
          }}
          animate={{
            opacity: 1,
            x: isMobile ? 16 : "calc(50% - 300px)",
            y: 80,
            width: "600px",
            height: "auto",
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 300,
          }}
          style={{ pointerEvents: "none" }}
        >
          <div
            className="bg-background border rounded-lg shadow-lg overflow-hidden w-full"
            style={{ pointerEvents: "auto" }}
          >
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-background">
              <h3 className="font-medium">{artifact.title}</h3>
              <ArtifactCloseButton />
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              <pre className="text-sm p-4 whitespace-pre-wrap break-words">
                <code>{artifact.content}</code>
              </pre>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const Artifact = memo(PureArtifact);
