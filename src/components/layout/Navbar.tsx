import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, Sparkles, Menu, Play, ExternalLink, ChevronDown, Camera, Pen, Palette, Film } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContent } from "@/hooks/useSiteContent";
import { MobileNavDrawer } from "./MobileNavDrawer";
import UserInbox from "@/components/user/UserInbox";
import { GemBalance } from "@/components/gems/GemBalance";

const STUDIOS = [
  { name: "Photography Studio", path: "/photography-studio", icon: Camera },
  { name: "Caption Studio", path: "/caption-studio", icon: Pen },
  { name: "Branding Studio", path: "/branding-studio", icon: Palette },
  { name: "Cinematic Studio", path: "/#cinematic-studio", icon: Film },
];

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
  const brandName = content.brand_name || "BondHive";
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
              onClick={() => navigate("/dashboard")}
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
                  <p>Watch the full BondHive Studio tutorial</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-xs font-medium text-cream/60 hover:text-gold transition-colors duration-300 tracking-wide uppercase whitespace-nowrap">
                  Studios
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="bg-card/95 backdrop-blur-xl border-gold/20">
                  {STUDIOS.map((studio) => (
                    <DropdownMenuItem 
                      key={studio.path}
                      onClick={() => {
                        if (studio.path.startsWith("/#")) {
                          navigate("/");
                          setTimeout(() => onNavigate(studio.path.replace("/#", "")), 100);
                        } else {
                          navigate(studio.path);
                        }
                      }}
                      className="flex items-center gap-2 text-cream/70 hover:text-gold cursor-pointer"
                    >
                      <studio.icon className="w-4 h-4" />
                      {studio.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
            <div className="hidden lg:flex items-center gap-3 xl:gap-4 ml-4">
              {isAdmin && (
                <Button
                  onClick={() => navigate("/admin")}
                  variant="luxury"
                  size="sm"
                  className="shrink-0"
                >
                  <Shield className="w-4 h-4 mr-1.5" />
                  Admin
                </Button>
              )}
              {credits !== null && credits !== undefined && (
                <div className="shrink-0">
                  <GemBalance gems={credits} size="md" />
                </div>
              )}
              {userEmail && (
                <div className="flex items-center gap-2 shrink-0">
                  <UserInbox />
                  <span className="text-sm text-cream/50 truncate max-w-[120px] xl:max-w-[150px]">
                    {userEmail}
                  </span>
                </div>
              )}
              {onSignOut ? (
                <Button 
                  onClick={onSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium text-cream/60 hover:text-gold hover:bg-gold/5 shrink-0"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Sign Out
                </Button>
              ) : (
                <Button 
                  onClick={() => onNavigate("tools")}
                  variant="gold"
                  size="default"
                  className="btn-glow shrink-0"
                >
                  {ctaGetStarted}
                </Button>
              )}
            </div>

            {/* Mobile/Tablet: Inbox + Gems + Hamburger */}
            <div className="flex lg:hidden items-center gap-2">
              {userEmail && <UserInbox />}
              {credits !== null && credits !== undefined && (
                <GemBalance gems={credits} size="sm" />
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
