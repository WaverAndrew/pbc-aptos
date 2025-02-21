"use client";

import { Message } from "ai";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { PencilEditIcon } from "./icons";
import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";
import { MessageSources } from "./message-sources";
import { RelevantQuestions } from "./relevant-questions";
import { MessageEditor } from "./message-editor";
import { Dispatch, SetStateAction } from "react";

interface MessageContentProps {
  message: Message;
  mode: "view" | "edit";
  setMode: Dispatch<SetStateAction<"view" | "edit">>;
  isReadonly: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  reload: () => Promise<string | null | undefined>;
}

export function MessageContent({
  message,
  mode,
  setMode,
  isReadonly,
  setMessages,
  reload,
}: MessageContentProps) {
  if (mode === "edit") {
    return (
      <div className="flex flex-row gap-2 items-start">
        <div className="size-8" />
        <MessageEditor
          key={message.id}
          message={message}
          setMode={setMode}
          setMessages={setMessages}
          reload={reload}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-2 items-start">
      {message.role === "user" && !isReadonly && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
              onClick={() => {
                setMode("edit");
              }}
            >
              <PencilEditIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit message</TooltipContent>
        </Tooltip>
      )}

      <div
        className={cn("flex flex-col gap-4 w-full", {
          "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
            message.role === "user",
        })}
      >
        <div className="w-full prose dark:prose-invert max-w-none">
          <Markdown>
            {(message.content as string)?.replace(/\{\{.*?\}\}/g, "")}
          </Markdown>
        </div>

        {message.content && (
          <div className="flex flex-row items-center gap-2">
            <MessageSources content={message.content} />
            {message.role === "user" && (
              <RelevantQuestions messageContent={message.content} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
