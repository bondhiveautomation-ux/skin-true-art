import { Upload, MousePointer, Download, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickStartProgressProps {
  currentStep: number; // 1 = Upload, 2 = Select Tool, 3 = Download
  isComplete?: boolean;
  onDismiss?: () => void;
}

const steps = [
  {
    id: 1,
    icon: Upload,
    label: "Upload",
    labelBn: "আপলোড",
  },
  {
    id: 2,
    icon: MousePointer,
    label: "Select Tool",
    labelBn: "টুল নির্বাচন",
  },
  {
    id: 3,
    icon: Download,
    label: "Download",
    labelBn: "ডাউনলোড",
  },
];

export const QuickStartProgress = ({
  currentStep,
  isComplete = false,
  onDismiss,
}: QuickStartProgressProps) => {
  if (isComplete) return null;

  return (
    <div className="w-full bg-card/50 backdrop-blur-sm border-b border-border/50 py-4 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-cream">Quick Start</h3>
            <p className="font-bangla text-xs text-cream/50">দ্রুত শুরু করুন</p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs text-cream/40 hover:text-cream/70 transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-8 right-8 h-0.5 bg-border/50 -z-10" />
          <div 
            className="absolute top-6 left-8 h-0.5 bg-primary transition-all duration-500 -z-10"
            style={{ width: `calc(${((currentStep - 1) / 2) * 100}% - 32px)` }}
          />

          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const Icon = isCompleted ? Check : step.icon;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center gap-2 transition-all duration-300",
                  isActive && "scale-105"
                )}
              >
                {/* Step Icon */}
                <div
                  className={cn(
                    "w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center",
                    "border-2 transition-all duration-300",
                    isCompleted
                      ? "bg-primary/20 border-primary text-primary"
                      : isActive
                      ? "bg-primary border-primary text-primary-foreground animate-pulse"
                      : "bg-card/50 border-border/50 text-cream/40"
                  )}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Step Label */}
                <div className="text-center">
                  <p
                    className={cn(
                      "text-xs sm:text-sm font-medium transition-colors",
                      isActive || isCompleted ? "text-cream" : "text-cream/40"
                    )}
                  >
                    {step.label}
                  </p>
                  <p
                    className={cn(
                      "font-bangla text-[10px] sm:text-xs transition-colors",
                      isActive || isCompleted ? "text-cream/60" : "text-cream/30"
                    )}
                  >
                    {step.labelBn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
