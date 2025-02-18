"use client";

import { useState } from "react";
import { ChevronDownIcon } from "./icons";

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!inline) {
    const codeContent = children.toString();
    const lineCount = codeContent.split("\n").length;
    const shouldBeCollapsible = lineCount > 10;

    return (
      <div className="not-prose relative max-w-full z-10">
        <pre
          {...props}
          className={`text-sm dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900 ${
            isExpanded ? "max-h-none" : "max-h-[250px] overflow-hidden"
          }`}
        >
          <code className="block whitespace-pre">{children}</code>
        </pre>

        {shouldBeCollapsible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm flex items-center gap-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {isExpanded ? (
              <>
                <p>Show less </p>
              </>
            ) : (
              <>
                Show more <ChevronDownIcon size={14} />
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <code
      className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
      {...props}
    >
      {children}
    </code>
  );
}
