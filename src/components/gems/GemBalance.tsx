import { Diamond } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface GemBalanceProps {
  gems: number | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
  clickable?: boolean;
}

export const GemBalance = ({ gems, size = "md", showLabel = false, className, clickable = true }: GemBalanceProps) => {
  const navigate = useNavigate();
  
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

  const handleClick = () => {
    if (clickable) {
      navigate("/pricing");
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "flex items-center rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-sm",
        sizeClasses[size],
        clickable && "cursor-pointer hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400/50 transition-all duration-200",
        className
      )}
      title={clickable ? "Click to top up gems" : undefined}
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
