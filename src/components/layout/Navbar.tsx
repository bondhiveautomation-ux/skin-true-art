import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, Sparkles, Menu, Play, ExternalLink, Diamond } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useContent } from "@/hooks/useSiteContent";
import { MobileNavDrawer } from "./MobileNavDrawer";
import UserInbox from "@/components/user/UserInbox";

interface NavbarProps {
  onNavigate: (section: string) => void;
  onSignOut?: () => void;
  userEmail?: string;
  credits?: number | null;
  isAdmin?: boolean;
}

export const Navbar = ({ onNavigate, onSignOut, userEmail, credits, isAdmin }: NavbarProps) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { content } = useContent("header");

  // Default values
  const brandName = content.brand_name || "Brandify";
  const navFeatures = content.nav_features || "Features";
  const navProcess = content.nav_process || "Process";
  const navStudio = content.nav_studio || "Studio";
  const ctaGetStarted = content.cta_get_started || "Get Started";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled ? "header-blur shadow-elegant" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-22 py-3 sm:py-4">
            {/* Logo - Fashion Serif */}
            <button 
              onClick={() => onNavigate("hero")}
              className="flex items-center gap-2 sm:gap-3 group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg gold-icon flex items-center justify-center group-hover:animate-pulse-glow transition-all duration-300">
                <Sparkles className="w-4 h-4 text-gold" />
              </div>
              <span className="font-serif text-lg sm:text-xl lg:text-2xl font-semibold text-cream tracking-tight group-hover:text-gold transition-colors duration-300">
                {brandName}
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
              <button 
                onClick={() => onNavigate("features")}
                className="text-xs font-medium text-cream/60 hover:text-gold transition-colors duration-300 tracking-wide uppercase whitespace-nowrap"
              >
                {navFeatures}
              </button>
              <button 
                onClick={() => onNavigate("how-it-works")}
                className="text-xs font-medium text-cream/60 hover:text-gold transition-colors duration-300 tracking-wide uppercase whitespace-nowrap"
              >
                {navProcess}
              </button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a 
                    href="https://www.facebook.com/share/v/17WGy9jeFi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-cream/60 hover:text-gold transition-colors duration-300 tracking-wide uppercase whitespace-nowrap"
                  >
                    <Play className="w-3 h-3" />
                    Tutorial
                    <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Watch the full Brandify tutorial</p>
                </TooltipContent>
              </Tooltip>
              <button 
                onClick={() => onNavigate("tools")}
                className="text-xs font-medium text-cream/60 hover:text-gold transition-colors duration-300 tracking-wide uppercase whitespace-nowrap"
              >
                {navStudio}
              </button>
              <button 
                onClick={() => navigate("/pricing")}
                className="text-xs font-medium text-cream/60 hover:text-gold transition-colors duration-300 tracking-wide uppercase whitespace-nowrap"
              >
                Pricing
              </button>
              <button 
                onClick={() => navigate("/classes")}
                className="text-xs font-medium text-cream/60 hover:text-gold transition-colors duration-300 tracking-wide uppercase whitespace-nowrap"
              >
                Classes
              </button>
            </nav>

            {/* Desktop User section */}
            <div className="hidden lg:flex items-center gap-2">
              {isAdmin && (
                <Button
                  onClick={() => navigate("/admin")}
                  variant="luxury"
                  size="sm"
                >
                  <Shield className="w-4 h-4 mr-1.5" />
                  Admin
                </Button>
              )}
              {credits !== null && credits !== undefined && (
                <div className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-sm">
                  <Diamond className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">{credits}</span>
                </div>
              )}
              {userEmail && (
                <>
                  <UserInbox />
                  <span className="hidden lg:block text-sm text-cream/50 truncate max-w-[150px]">
                    {userEmail}
                  </span>
                </>
              )}
              {onSignOut ? (
                <Button 
                  onClick={onSignOut}
                  variant="ghost"
                  className="text-sm font-medium text-cream/60 hover:text-gold hover:bg-gold/5"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Button 
                  onClick={() => onNavigate("tools")}
                  variant="gold"
                  size="default"
                  className="btn-glow"
                >
                  {ctaGetStarted}
                </Button>
              )}
            </div>

            {/* Mobile/Tablet: Inbox + Gems + Hamburger */}
            <div className="flex lg:hidden items-center gap-2">
              {userEmail && <UserInbox />}
              {credits !== null && credits !== undefined && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30">
                  <Diamond className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">{credits}</span>
                </div>
              )}
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="p-2.5 rounded-xl bg-secondary/50 text-cream/70 hover:text-gold transition-colors active:scale-95"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={onNavigate}
        onSignOut={onSignOut}
        userEmail={userEmail}
        credits={credits}
        isAdmin={isAdmin}
      />
    </>
  );
};
