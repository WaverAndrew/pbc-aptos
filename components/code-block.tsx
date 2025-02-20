"use client";

import { useState } from "react";
import { ChevronDownIcon, CopyIcon } from "./icons";

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
  const [isCopied, setIsCopied] = useState(false);

  const getCodeContent = (children: any): string => {
    if (!children) return '';
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) {
      return children.map((child): string => getCodeContent(child)).join('');
    }
    return children.toString?.() || '';
  };

  const handleCopy = async () => {
    const codeContent = getCodeContent(children);
    await navigator.clipboard.writeText(codeContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!inline) {
    const codeContent = getCodeContent(children);
    const lineCount = codeContent.split("\n").length;
    const shouldBeCollapsible = lineCount > 15;

    return (
      <pre className="code-block not-prose relative max-w-full z-10">
        <span className="absolute right-4 top-4">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
            aria-label="Copy code"
          >
            {isCopied ? (
              <span className="text-green-500">✓</span>
            ) : (
              <CopyIcon size={16} />
            )}
          </button>
        </span>
        <code
          {...props}
          className={`block whitespace-pre text-sm dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900 ${
            isExpanded ? "max-h-none" : "max-h-[400px] overflow-hidden"
          }`}
        >
          {children}
        </code>

        {shouldBeCollapsible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm flex items-center gap-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {isExpanded ? (
              <>Show less</>
            ) : (
              <>
                Show more <ChevronDownIcon size={14} />
              </>
            )}
          </button>
        )}
      </pre>
    );
  }

  return (
    <code
      className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1.5 rounded-md`}
      {...props}
    >
      {children}
    </code>
  );
}