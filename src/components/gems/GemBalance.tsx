import { Diamond } from "lucide-react";
import { cn } from "@/lib/utils";

interface GemBalanceProps {
  gems: number | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export const GemBalance = ({ gems, size = "md", showLabel = false, className }: GemBalanceProps) => {
  if (gems === null || gems === undefined) return null;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div 
      className={cn(
        "flex items-center rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-sm",
        sizeClasses[size],
        className
      )}
    >
      <Diamond className={cn("text-purple-400", iconSizes[size])} />
      <span className="font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
        {gems}
      </span>
      {showLabel && (
        <span className="text-cream/60 ml-0.5">Gems</span>
      )}
    </div>
  );
};
