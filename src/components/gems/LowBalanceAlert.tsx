import { Diamond, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getGemCost } from "@/lib/gemCosts";

interface LowBalanceAlertProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  requiredGems?: number;
  featureName?: string;
}

export const LowBalanceAlert = ({ 
  isOpen, 
  onClose, 
  currentBalance, 
  requiredGems,
  featureName 
}: LowBalanceAlertProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const needed = requiredGems ?? (featureName ? getGemCost(featureName) : 0);
  const shortage = needed - currentBalance;

  const handleTopUp = () => {
    onClose();
    navigate("/pricing");
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative bg-card border border-purple-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-purple-500/20">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-cream/50 hover:text-cream transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Diamond className="w-8 h-8 text-purple-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">!</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3 mb-6">
          <h3 className="text-xl font-serif text-cream">Low on Gems!</h3>
          <p className="text-cream/70 text-sm">
            Your creative flow shouldn't stop. You need {shortage > 0 ? shortage : needed} more gems to continue.
          </p>
          
          {/* Balance indicator */}
          <div className="flex items-center justify-center gap-4 py-3 px-4 bg-muted/50 rounded-xl">
            <div className="text-center">
              <p className="text-xs text-cream/50">You have</p>
              <p className="text-lg font-bold text-red-400">{currentBalance}</p>
            </div>
            <div className="text-cream/30">→</div>
            <div className="text-center">
              <p className="text-xs text-cream/50">You need</p>
              <p className="text-lg font-bold text-purple-400">{needed}</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button 
          onClick={handleTopUp}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold h-12"
        >
          <Zap className="w-4 h-4 mr-2" />
          Top-up Now
        </Button>

        {/* Quick options */}
        <div className="mt-4 text-center">
          <p className="text-xs text-cream/50">
            Starting from just <span className="text-purple-400 font-semibold">৳50</span> for 100 gems
          </p>
        </div>
      </div>
    </div>
  );
};
