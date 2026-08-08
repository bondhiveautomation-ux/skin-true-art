import { Loader2 } from "lucide-react";

interface ProcessingModalProps {
  isOpen: boolean;
  /** Optional key kept for backwards compatibility; unused. */
  featureName?: string;
  customMessage?: string;
}

export const ProcessingModal = ({ isOpen, customMessage }: ProcessingModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border/40 bg-card/95 p-8 text-center shadow-2xl">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
        <p className="font-serif text-lg text-foreground">Processing</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {customMessage || "This may take a moment. Please keep this tab open."}
        </p>
      </div>
    </div>
  );
};

export default ProcessingModal;
