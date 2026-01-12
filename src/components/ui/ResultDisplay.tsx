import { Download, Search, Loader2 } from "lucide-react";
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
  // Inspect feature props
  showInspect?: boolean;
  onInspect?: () => void;
  isInspecting?: boolean;
  inspectTimeRemaining?: number; // seconds remaining
  inspectDisabled?: boolean;
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
  showInspect = false,
  onInspect,
  isInspecting = false,
  inspectTimeRemaining,
  inspectDisabled = false,
}: ResultDisplayProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <h3 className="text-base sm:text-lg font-serif font-medium text-cream text-center">
        Result
      </h3>

      {/* Thumbnails comparison */}
      {originalImages.length > 0 && (
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          {originalImages.map((img, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-gold/20 bg-charcoal">
                <img
                  src={img.src}
                  alt={img.label}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[10px] sm:text-xs text-cream/40 mt-1 sm:mt-1.5 font-light">{img.label}</p>
            </div>
          ))}
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 border-gold/40 bg-charcoal">
              <img
                src={result}
                alt="Result"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[10px] sm:text-xs text-gold font-medium mt-1 sm:mt-1.5">Result</p>
          </div>
        </div>
      )}

      {/* Full result image */}
      <div className="rounded-lg sm:rounded-xl overflow-hidden border border-gold/20 bg-charcoal max-w-xl mx-auto">
        <img
          src={result}
          alt="Generated result"
          className="w-full object-contain"
        />
      </div>

      {/* Inspect button - shown above action buttons if enabled */}
      {showInspect && onInspect && (
        <div className="flex flex-col items-center gap-2 max-w-sm mx-auto px-2">
          <Button
            onClick={onInspect}
            variant="outline"
            size="sm"
            disabled={isInspecting || inspectDisabled}
            className="w-full sm:w-auto h-10 sm:h-11 text-sm border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300"
          >
            {isInspecting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                Inspecting...
              </>
            ) : (
              <>
                <Search className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Inspect Result
              </>
            )}
          </Button>
          {inspectTimeRemaining !== undefined && inspectTimeRemaining > 0 && !inspectDisabled && (
            <p className="text-xs text-orange-400/70">
              ⏱ {formatTime(inspectTimeRemaining)} remaining to inspect
            </p>
          )}
          {inspectDisabled && (
            <p className="text-xs text-muted-foreground">
              Inspection time expired
            </p>
          )}
          <p className="text-[10px] text-cream/50 text-center">
            If the result doesn't match the original, AI will verify and refund your gems
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 max-w-sm mx-auto px-2">
        <Button
          onClick={onDownload}
          variant="gold"
          size="sm"
          className="w-full sm:w-auto btn-glow h-10 sm:h-11 text-sm"
        >
          <Download className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {downloadLabel}
        </Button>
        <Button
          onClick={onRegenerate}
          variant="luxury"
          size="sm"
          disabled={isProcessing}
          className="w-full sm:w-auto h-10 sm:h-11 text-sm"
        >
          {regenerateLabel}
        </Button>
        <Button
          onClick={onReset}
          variant="ghost"
          size="sm"
          className="w-full sm:w-auto text-cream/40 hover:text-cream h-10 sm:h-11 text-sm"
        >
          {resetLabel}
        </Button>
      </div>
    </div>
  );
};
