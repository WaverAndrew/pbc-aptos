import { ChatRequestOptions, Message } from "ai";
import { PreviewMessage, ThinkingMessage } from "./message";
import { useScrollToBottom } from "./use-scroll-to-bottom";
import { Overview } from "./overview";
import { memo } from "react";
import { Vote } from "@/lib/db/schema";
import equal from "fast-deep-equal";

interface MessagesProps {
  chatId: string;
  isLoading: boolean;

  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
  isArtifactVisible: boolean;
}

function PureMessages({
  chatId,
  isLoading,

  messages,
  setMessages,
  reload,
  isReadonly,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div className="flex-1 overflow-y-auto w-full pointer-events-auto">
      {messages.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <img
            src="/images/aptos-white.svg"
            alt="Aptos Logo"
            className="w-32 h-32 opacity-10"
          />
          <p className="text-muted-foreground mt-4 text-6xl font-bold opacity-10">
            Aptos Dev AI
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 py-4 md:py-6 pointer-events-auto">
          {messages.map((message) => (
            <PreviewMessage
              key={message.id}
              chatId={chatId}
              message={message}
              isLoading={isLoading}
              setMessages={setMessages}
              reload={reload}
              isReadonly={isReadonly}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) return true;

  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.isLoading && nextProps.isLoading) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;

  return true;
});
