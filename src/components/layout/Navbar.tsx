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
        isScrolled ? "header-blur shadow-soft" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 lg:h-22 py-4">
          {/* Logo - Elegant serif */}
          <button 
            onClick={() => onNavigate("hero")}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg gold-icon flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
            <span className="font-serif text-xl lg:text-2xl font-semibold text-charcoal tracking-tight group-hover:text-gold transition-colors duration-300">
              Influencer Tool
            </span>
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            <button 
              onClick={() => onNavigate("features")}
              className="text-sm font-medium text-charcoal-muted hover:text-gold transition-colors duration-300 tracking-wide"
            >
              Features
            </button>
            <button 
              onClick={() => onNavigate("how-it-works")}
              className="text-sm font-medium text-charcoal-muted hover:text-gold transition-colors duration-300 tracking-wide"
            >
              How It Works
            </button>
            <button 
              onClick={() => onNavigate("tools")}
              className="text-sm font-medium text-charcoal-muted hover:text-gold transition-colors duration-300 tracking-wide"
            >
              Studio
            </button>
          </nav>

          {/* User section */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button
                onClick={() => navigate("/admin")}
                variant="gold-outline"
                size="sm"
              >
                <Shield className="w-4 h-4 mr-1.5" />
                Admin
              </Button>
            )}
            {credits !== null && credits !== undefined && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30">
                <Coins className="w-4 h-4 text-gold" />
                <span className="text-sm font-semibold text-gold">{credits}</span>
              </div>
            )}
            {userEmail && (
              <span className="hidden sm:block text-sm text-charcoal-muted truncate max-w-[150px]">
                {userEmail}
              </span>
            )}
            {onSignOut ? (
              <Button 
                onClick={onSignOut}
                variant="outline"
                className="text-sm font-medium border-charcoal/20 hover:border-gold/40 hover:bg-gold/5"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Button 
                onClick={() => onNavigate("tools")}
                variant="gold"
                size="default"
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