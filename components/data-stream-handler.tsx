"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import { ArtifactKind } from "./artifact";
import { Suggestion } from "@/lib/db/schema";
import { initialArtifactData, useArtifact } from "@/hooks/use-artifact";

export type DataStreamDelta = {
  type:
    | "text-delta"
    | "code-delta"
    | "title"
    | "id"
    | "kind"
    | "clear"
    | "finish";
  content: string;
};

export function DataStreamHandler({ id }: { id: string }) {
  const { data: dataStream } = useChat({ id });
  const { setArtifact } = useArtifact();
  const lastProcessedIndex = useRef(-1);

  useEffect(() => {
    if (!dataStream?.length) return;

    const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
    lastProcessedIndex.current = dataStream.length - 1;

    (newDeltas as DataStreamDelta[]).forEach((delta: DataStreamDelta) => {
      setArtifact((draftArtifact) => {
        if (!draftArtifact) {
          return { ...initialArtifactData, status: "streaming" };
        }

        switch (delta.type) {
          case "id":
            return {
              ...draftArtifact,
              documentId: delta.content,
              status: "streaming",
            };

          case "title":
            return {
              ...draftArtifact,
              title: delta.content,
              status: "streaming",
            };

          case "kind":
            return {
              ...draftArtifact,
              kind: delta.content as ArtifactKind,
              status: "streaming",
            };

          case "code-delta":
            return {
              ...draftArtifact,
              content: draftArtifact.content + delta.content,
              status: "streaming",
            };

          case "clear":
            return {
              ...draftArtifact,
              content: "",
              status: "streaming",
            };

          case "finish":
            return {
              ...draftArtifact,
              status: "idle",
            };

          default:
            return draftArtifact;
        }
      });
    });
  }, [dataStream, setArtifact]);

  return null;
}
