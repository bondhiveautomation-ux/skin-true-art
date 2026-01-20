import { useNavigate } from "react-router-dom";
import { LucideIcon, Diamond } from "lucide-react";
import { getGemCost } from "@/lib/gemCosts";

interface ToolCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  path: string;
  gemCostKey: string;
  gradient: string;
  delay?: number;
}

export const ToolCard = ({
  name,
  description,
  icon: Icon,
  path,
  gemCostKey,
  gradient,
  delay = 0,
}: ToolCardProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(path)}
      className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm p-4 sm:p-6 text-left transition-all duration-500 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 animate-fade-in"
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      {/* Gradient background on hover */}
      <div 
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`}
      />
      
      {/* Icon container */}
      <div className="relative mb-4 sm:mb-6">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
        </div>
      </div>

      {/* Content */}
      <div className="relative space-y-2 sm:space-y-3">
        <h3 className="font-serif text-lg sm:text-xl font-semibold text-cream group-hover:text-primary transition-colors duration-300">
          {name}
        </h3>
        <p className="text-xs sm:text-sm text-cream/50 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* Gem cost badge */}
      <div className="relative mt-4 sm:mt-6 flex items-center gap-1.5">
        <Diamond className="w-3.5 h-3.5 text-primary/70" />
        <span className="text-xs text-cream/40">
          {getGemCost(gemCostKey)} gems
        </span>
      </div>

      {/* Arrow indicator */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </button>
  );
};
