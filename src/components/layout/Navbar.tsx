import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Coins, Shield, Sparkles } from "lucide-react";

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "header-blur shadow-elegant" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 lg:h-22 py-4">
          {/* Logo - Fashion Serif */}
          <button 
            onClick={() => onNavigate("hero")}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-lg gold-icon flex items-center justify-center group-hover:animate-pulse-glow transition-all duration-300">
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
            <span className="font-serif text-xl lg:text-2xl font-semibold text-cream tracking-tight group-hover:text-gold transition-colors duration-300">
              Influencer Tool
            </span>
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-12">
            <button 
              onClick={() => onNavigate("features")}
              className="text-sm font-medium text-cream/60 hover:text-gold transition-colors duration-300 tracking-wide uppercase"
            >
              Features
            </button>
            <button 
              onClick={() => onNavigate("how-it-works")}
              className="text-sm font-medium text-cream/60 hover:text-gold transition-colors duration-300 tracking-wide uppercase"
            >
              Process
            </button>
            <button 
              onClick={() => onNavigate("tools")}
              className="text-sm font-medium text-cream/60 hover:text-gold transition-colors duration-300 tracking-wide uppercase"
            >
              Studio
            </button>
          </nav>

          {/* User section */}
          <div className="flex items-center gap-3">
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
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 backdrop-blur-sm">
                <Coins className="w-4 h-4 text-gold" />
                <span className="text-sm font-semibold text-gold">{credits}</span>
              </div>
            )}
            {userEmail && (
              <span className="hidden sm:block text-sm text-cream/50 truncate max-w-[150px]">
                {userEmail}
              </span>
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
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
