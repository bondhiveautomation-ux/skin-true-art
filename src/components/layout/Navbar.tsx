import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Coins, Shield } from "lucide-react";

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "header-blur border-b border-border/50" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo - Text only */}
          <button 
            onClick={() => onNavigate("hero")}
            className="text-xl lg:text-2xl font-semibold text-foreground tracking-tight hover:opacity-80 transition-opacity"
          >
            Influencer Tool
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => onNavigate("features")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => onNavigate("how-it-works")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </button>
            <button 
              onClick={() => onNavigate("tools")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Tools
            </button>
          </nav>

          {/* User section */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button
                onClick={() => navigate("/admin")}
                variant="outline"
                size="sm"
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                <Shield className="w-4 h-4 mr-1.5" />
                Admin
              </Button>
            )}
            {credits !== null && credits !== undefined && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Coins className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{credits}</span>
              </div>
            )}
            {userEmail && (
              <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-[150px]">
                {userEmail}
              </span>
            )}
            {onSignOut ? (
              <Button 
                onClick={onSignOut}
                variant="outline"
                className="text-sm font-medium px-4 border-border/50 hover:bg-accent/50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Button 
                onClick={() => onNavigate("tools")}
                className="btn-glow bg-foreground text-background hover:bg-foreground/90 text-sm font-medium px-5"
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
