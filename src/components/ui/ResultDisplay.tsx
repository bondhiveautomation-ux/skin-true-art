import { Download } from "lucide-react";
import { Button } from "./button";

interface ResultDisplayProps {
  result: string;
  originalImages?: Array<{ src: string; label: string }>;
  onDownload: () => void;
  onRegenerate: () => void;
  onReset: () => void;
  isProcessing?: boolean;
  downloadLabel?: string;
  regenerateLabel?: string;
  resetLabel?: string;
}

export const ResultDisplay = ({
  result,
  originalImages = [],
  onDownload,
  onRegenerate,
  onReset,
  isProcessing = false,
  downloadLabel = "Download",
  regenerateLabel = "Regenerate",
  resetLabel = "Start Over",
}: ResultDisplayProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-lg font-medium text-foreground text-center">
        Result
      </h3>

      {/* Thumbnails comparison */}
      {originalImages.length > 0 && (
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {originalImages.map((img, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-secondary/30">
                <img
                  src={img.src}
                  alt={img.label}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{img.label}</p>
            </div>
          ))}
          <div className="text-center">
            <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-foreground/20 bg-secondary/30">
              <img
                src={result}
                alt="Result"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-foreground font-medium mt-1">Result</p>
          </div>
        </div>
      )}

      {/* Full result image */}
      <div className="rounded-xl overflow-hidden border border-border bg-secondary/30 max-w-xl mx-auto">
        <img
          src={result}
          alt="Generated result"
          className="w-full object-contain"
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
        <Button
          onClick={onDownload}
          className="w-full sm:w-auto btn-glow bg-foreground text-background hover:bg-foreground/90"
        >
          <Download className="mr-2 h-4 w-4" />
          {downloadLabel}
        </Button>
        <Button
          onClick={onRegenerate}
          variant="outline"
          disabled={isProcessing}
          className="w-full sm:w-auto"
        >
          {regenerateLabel}
        </Button>
        <Button
          onClick={onReset}
          variant="ghost"
          className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
        >
          {resetLabel}
        </Button>
      </div>
    </div>
  );
};
