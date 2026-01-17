import { Diamond, Sparkles } from "lucide-react";
import { getGemCost } from "@/lib/gemCosts";
import { useState, useEffect } from "react";

interface ProcessingModalProps {
  isOpen: boolean;
  featureName: string;
  customMessage?: string;
}

export const ProcessingModal = ({ isOpen, featureName, customMessage }: ProcessingModalProps) => {
  const [gemCost, setGemCost] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && featureName) {
      // Get cached value synchronously for immediate display
      setGemCost(getGemCost(featureName));
    }
  }, [isOpen, featureName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="text-center space-y-6 p-8 max-w-sm">
        {/* Animated icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full animate-ping" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-xl font-serif text-cream">
            {customMessage || "Generating magic..."}
          </h3>
          <p className="text-cream/60 text-sm">
            Please wait while we process your request
          </p>
        </div>

        {/* Gem cost indicator */}
        {gemCost !== null && (
          <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 mx-auto w-fit">
            <Diamond className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Cost: {gemCost} {gemCost === 1 ? 'Gem' : 'Gems'}
            </span>
          </div>
        )}

        {/* Loading bar */}
        <div className="w-48 h-1 bg-muted rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-shimmer" 
            style={{ 
              width: '40%',
              animation: 'shimmer 1.5s ease-in-out infinite',
            }} 
          />
        </div>
      </div>
    </div>
  );
};
