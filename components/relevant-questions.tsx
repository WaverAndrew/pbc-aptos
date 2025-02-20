'use client';

import { useState } from 'react';
import { LightbulbIcon, LoaderIcon, ExternalLinkIcon } from './icons';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';
import { cn } from '@/lib/utils';

interface RelevantQuestion {
  text: string;
  source: string;
  timestamp: string;
  score: number;
}

export function RelevantQuestions({ messageContent }: { messageContent: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<RelevantQuestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchRelevantQuestions = async () => {
    if (questions.length > 0) return; // Don't fetch if we already have questions
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/relevant-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: messageContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch relevant questions');
      }

      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching relevant questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tooltip open={isOpen} onOpenChange={setIsOpen}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 p-0 opacity-50 hover:opacity-100 transition-opacity"
          onClick={() => {
            fetchRelevantQuestions();
            setIsOpen(true);
          }}
        >
          {isLoading ? (
            <div className="animate-spin">
              <LoaderIcon size={14} />
            </div>
          ) : (
            <div className="text-primary-foreground">
              <LightbulbIcon size={14} />
            </div>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent 
        side="bottom" 
        align="start" 
        className="p-3"
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">See what other developers are asking</div>
            <div className="text-xs text-muted-foreground">Similar questions from the community:</div>
          </div>
          <div className="flex flex-col gap-2 max-w-sm">
            {questions.length > 0 ? (
              questions.map((question, index) => (
                <a
                  key={index}
                  href={question.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-3",
                    "px-3 py-2 rounded-lg",
                    "bg-secondary hover:bg-secondary/80",
                    "text-secondary-foreground",
                    "transition-colors"
                  )}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {question.text}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {new URL(question.source).hostname.replace('www.', '')}
                      <ExternalLinkIcon size={12} />
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                Click to find similar questions
              </div>
            )}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
} 