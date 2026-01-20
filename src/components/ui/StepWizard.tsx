import { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  icon?: ReactNode;
}

interface StepWizardProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export const StepWizard = ({
  steps,
  currentStep,
  onStepClick,
  className,
}: StepWizardProps) => {
  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = onStepClick && index <= currentStep;

        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => isClickable && onStepClick?.(index)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300",
                isCompleted && "bg-primary/20 text-primary",
                isCurrent && "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                !isCompleted && !isCurrent && "bg-muted/50 text-muted-foreground",
                isClickable && "cursor-pointer hover:scale-105",
                !isClickable && "cursor-default"
              )}
            >
              <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                isCompleted && "bg-primary text-primary-foreground",
                isCurrent && "bg-primary-foreground text-primary",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
              )}>
                {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
              </span>
              <span className="hidden xs:inline sm:inline">{step.title}</span>
            </button>
            
            {index < steps.length - 1 && (
              <div className={cn(
                "w-4 sm:w-8 h-0.5 mx-1",
                isCompleted ? "bg-primary" : "bg-muted/50"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
};
