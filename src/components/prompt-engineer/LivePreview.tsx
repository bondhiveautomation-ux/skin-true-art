import { useState, useEffect } from "react";
import { Eye, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LivePreviewProps {
  content: string;
  isProcessing: boolean;
  currentAgent?: string;
}

export const LivePreview = ({ content, isProcessing, currentAgent }: LivePreviewProps) => {
  const [copied, setCopied] = useState(false);
  const [displayedContent, setDisplayedContent] = useState("");

  // Typewriter effect
  useEffect(() => {
    if (!content) {
      setDisplayedContent("");
      return;
    }

    // If not processing, show full content immediately
    if (!isProcessing) {
      setDisplayedContent(content);
      return;
    }

    // Typewriter effect during processing
    let index = displayedContent.length;
    if (index >= content.length) return;

    const timer = setTimeout(() => {
      setDisplayedContent(content.substring(0, index + 3)); // Add 3 chars at a time for speed
    }, 15);

    return () => clearTimeout(timer);
  }, [content, isProcessing, displayedContent]);

  // Reset displayed content when content is cleared
  useEffect(() => {
    if (!content) {
      setDisplayedContent("");
    }
  }, [content]);

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-400" />
          <span className="font-medium text-sm text-white/80">
            {isProcessing ? `Processing: ${currentAgent || 'Agent'}...` : 'Live Preview'}
          </span>
          {isProcessing && (
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse delay-75" />
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse delay-150" />
            </div>
          )}
        </div>
        {content && !isProcessing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-3 text-xs hover:bg-white/10"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className={cn(
        "p-4 min-h-[200px] max-h-[400px] overflow-y-auto",
        "prose prose-invert prose-sm max-w-none"
      )}>
        {displayedContent ? (
          <pre className="whitespace-pre-wrap font-sans text-sm text-white/80 leading-relaxed">
            {displayedContent}
            {isProcessing && displayedContent.length < content.length && (
              <span className="inline-block w-2 h-4 bg-amber-400 animate-pulse ml-0.5" />
            )}
          </pre>
        ) : (
          <p className="text-white/30 text-center py-8">
            Your refined prompt will appear here as each agent processes it...
          </p>
        )}
      </div>
    </div>
  );
};
