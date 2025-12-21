import { X, Coins, Shield, LogOut, Sparkles, CreditCard, GraduationCap, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
  onSignOut?: () => void;
  userEmail?: string;
  credits?: number | null;
  isAdmin?: boolean;
}

export const MobileNavDrawer = ({
  isOpen,
  onClose,
  onNavigate,
  onSignOut,
  userEmail,
  credits,
  isAdmin,
}: MobileNavDrawerProps) => {
  const navigate = useNavigate();

  const handleNavigate = (section: string) => {
    onNavigate(section);
    onClose();
  };

  const handleRoute = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[280px] bg-card/95 backdrop-blur-xl border-l border-gold/20 z-50 md:hidden animate-slide-in-right shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gold/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gold-icon flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
            <span className="font-serif text-lg font-semibold text-cream">Menu</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-secondary/50 text-cream/60 hover:text-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        {userEmail && (
          <div className="p-5 border-b border-gold/10">
            <p className="text-sm text-cream/50 truncate mb-2">{userEmail}</p>
            {credits !== null && credits !== undefined && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold/10 border border-gold/30">
                <Coins className="w-4 h-4 text-gold" />
                <span className="text-sm font-semibold text-gold">{credits} Credits</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          <button
            onClick={() => handleNavigate("features")}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-cream/70 hover:text-gold hover:bg-gold/5 transition-all text-left"
          >
            <span className="text-sm font-medium tracking-wide">Features</span>
          </button>
          <button
            onClick={() => handleNavigate("how-it-works")}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-cream/70 hover:text-gold hover:bg-gold/5 transition-all text-left"
          >
            <span className="text-sm font-medium tracking-wide">Process</span>
          </button>
          <a
            href="https://www.facebook.com/share/v/17WGy9jeFi/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-cream/70 hover:text-gold hover:bg-gold/5 transition-all text-left"
          >
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wide">Tutorial</span>
            <ExternalLink className="w-3 h-3 opacity-50 ml-auto" />
          </a>
          <button
            onClick={() => handleNavigate("tools")}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-cream/70 hover:text-gold hover:bg-gold/5 transition-all text-left"
          >
            <span className="text-sm font-medium tracking-wide">Studio</span>
          </button>
          <button
            onClick={() => handleRoute("/pricing")}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-cream/70 hover:text-gold hover:bg-gold/5 transition-all text-left"
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wide">Pricing</span>
          </button>
          <button
            onClick={() => handleRoute("/classes")}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-cream/70 hover:text-gold hover:bg-gold/5 transition-all text-left"
          >
            <GraduationCap className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wide">Classes</span>
          </button>
          
          {isAdmin && (
            <button
              onClick={() => handleRoute("/admin")}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-cream/70 hover:text-gold hover:bg-gold/5 transition-all text-left"
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium tracking-wide">Admin</span>
            </button>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-gold/10 bg-card/50 backdrop-blur-sm">
          {onSignOut ? (
            <Button 
              onClick={() => {
                onSignOut();
                onClose();
              }}
              variant="ghost"
              className="w-full justify-start text-cream/60 hover:text-gold hover:bg-gold/5 h-12"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          ) : (
            <Button 
              onClick={() => handleNavigate("tools")}
              variant="gold"
              className="w-full btn-glow h-12"
            >
              Get Started
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
