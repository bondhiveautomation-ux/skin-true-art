import { X, Shield, LogOut, Sparkles, CreditCard, GraduationCap, Play, ExternalLink, Camera, Pen, Palette, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GemBalance } from "@/components/gems/GemBalance";

const STUDIOS = [
  { name: "Photography Studio", path: "/photography-studio", icon: Camera },
  { name: "Caption Studio", path: "/caption-studio", icon: Pen },
  { name: "Branding Studio", path: "/branding-studio", icon: Palette },
  { name: "Cinematic Studio", path: "/#cinematic-studio", icon: Film },
];

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
      <div className="fixed top-0 right-0 h-full w-[85vw] max-w-[320px] bg-card/98 backdrop-blur-xl border-l border-gold/20 z-50 lg:hidden animate-slide-in-right shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gold/10 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg gold-icon flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
            <span className="font-serif text-base sm:text-lg font-semibold text-cream">Menu</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-xl bg-secondary/50 text-cream/60 hover:text-cream transition-colors active:scale-95"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        {userEmail && (
          <div className="p-4 sm:p-5 border-b border-gold/10 flex-shrink-0">
            <p className="text-xs sm:text-sm text-cream/50 truncate mb-2">{userEmail}</p>
            {credits !== null && credits !== undefined && (
              <GemBalance gems={credits} size="md" showLabel className="rounded-xl" />
            )}
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-3 sm:p-4 space-y-1 overflow-y-auto flex-1">
          <button
            onClick={() => handleNavigate("features")}
            className="w-full flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-cream/70 hover:text-gold hover:bg-gold/5 transition-all text-left active:scale-[0.98] min-h-[48px]"
          >
            <span className="text-sm font-medium tracking-wide">Features</span>
          </button>
          <button
            onClick={() => handleNavigate("how-it-works")}
            className="w-full flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-cream/70 hover:text-gold hover:bg-gold/5 transition-all text-left active:scale-[0.98] min-h-[48px]"
          >
            <span className="text-sm font-medium tracking-wide">Process</span>
          </button>
          <a
            href="https://www.facebook.com/share/v/17WGy9jeFi/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-cream/70 hover:text-gold hover:bg-gold/5 transition-all text-left active:scale-[0.98] min-h-[48px]"
          >
            <Play className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium tracking-wide">Tutorial</span>
            <ExternalLink className="w-3 h-3 opacity-50 ml-auto flex-shrink-0" />
          </a>
          <div className="py-2">
            <p className="px-4 py-2 text-xs text-cream/40 uppercase tracking-wider">Studios</p>
            {STUDIOS.map((studio) => (
              <button
                key={studio.path}
                onClick={() => {
                  if (studio.path.startsWith("/#")) {
                    navigate("/");
                    setTimeout(() => onNavigate(studio.path.replace("/#", "")), 100);
                    onClose();
                  } else {
                    handleRoute(studio.path);
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-cream/70 hover:text-gold hover:bg-gold/5 transition-all text-left active:scale-[0.98] min-h-[48px]"
              >
                <studio.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium tracking-wide">{studio.name}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => handleRoute("/pricing")}
            className="w-full flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-cream/70 hover:text-gold hover:bg-gold/5 transition-all text-left active:scale-[0.98] min-h-[48px]"
          >
            <CreditCard className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium tracking-wide">Pricing</span>
          </button>
          <button
            onClick={() => handleRoute("/classes")}
            className="w-full flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-cream/70 hover:text-gold hover:bg-gold/5 transition-all text-left active:scale-[0.98] min-h-[48px]"
          >
            <GraduationCap className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium tracking-wide">Classes</span>
          </button>
          
          {isAdmin && (
            <button
              onClick={() => handleRoute("/admin")}
              className="w-full flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-cream/70 hover:text-gold hover:bg-gold/5 transition-all text-left active:scale-[0.98] min-h-[48px]"
            >
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium tracking-wide">Admin</span>
            </button>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-gold/10 bg-card/80 backdrop-blur-sm flex-shrink-0 safe-area-bottom">
          {onSignOut ? (
            <Button 
              onClick={() => {
                onSignOut();
                onClose();
              }}
              variant="ghost"
              className="w-full justify-start text-cream/60 hover:text-gold hover:bg-gold/5 h-12 active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          ) : (
            <Button 
              onClick={() => handleNavigate("tools")}
              variant="gold"
              className="w-full btn-glow h-12 active:scale-[0.98]"
            >
              Get Started
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
