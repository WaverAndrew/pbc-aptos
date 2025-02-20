import { ExternalLinkIcon } from "./icons";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface SourcePreview {
  url: string;
  title: string;
  icon?: string;
  hostname: string;
}

interface MessageSourcesProps {
  content: string;
}

export function MessageSources({ content }: MessageSourcesProps) {
  const [sourcesPreviews, setSourcesPreviews] = useState<SourcePreview[]>([]);

  useEffect(() => {
    const extractUrls = () => {
      // Extract content from {{}} and split by commas
      const matches = content.match(/\{\{(.*?)\}\}/g);
      if (!matches) return [];
      
      return matches
        .flatMap(match => 
          match
            .replace('{{', '')
            .replace('}}', '')
            .split(',')
        )
        .map(url => url.trim())
        .filter(url => url.length > 0);
    };

    const fetchSourcePreviews = async () => {
      const urls = extractUrls();
      const previews = await Promise.all(
        urls.map(async (url) => {
          try {
            const urlObj = new URL(url);
            
            // For GitHub links, create a custom preview
            if (urlObj.hostname === 'github.com') {
              const pathParts = urlObj.pathname.split('/');
              const title = pathParts[pathParts.length - 1]
                .replace('.mdx', '')
                .replace('.md', '')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word

              return {
                url,
                title,
                hostname: 'GitHub',
                icon: 'https://github.com/favicon.ico'
              };
            }

            // For other URLs, try to fetch the page title
            // Note: This might not work due to CORS restrictions
            const response = await fetch(url);
            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const title = doc.title || urlObj.pathname.split('/').pop() || urlObj.hostname;

            return {
              url,
              title,
              hostname: urlObj.hostname.replace('www.', ''),
              icon: `${urlObj.origin}/favicon.ico`
            };
          } catch (error) {
            // Fallback for invalid URLs or failed fetches
            return {
              url,
              title: url,
              hostname: 'Unknown Source',
              icon: undefined
            };
          }
        })
      );

      setSourcesPreviews(previews);
    };

    fetchSourcePreviews();
  }, [content]);

  if (sourcesPreviews.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="text-sm text-muted-foreground">Sources:</div>
      <div className="flex flex-col gap-2">
        {sourcesPreviews.map((preview, index) => (
          <a
            key={index}
            href={preview.url}
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
            {preview.icon && (
              <img 
                src={preview.icon} 
                alt={`${preview.hostname} icon`}
                className="w-4 h-4"
                onError={(e) => {
                  // Remove broken image
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="text-sm font-medium truncate">
                {preview.title}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {preview.hostname}
                <ExternalLinkIcon size={12} />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
} 