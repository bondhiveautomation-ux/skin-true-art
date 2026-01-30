import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";

export const LandingNavbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 header-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg gold-icon flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
            <span className="font-serif text-lg sm:text-xl lg:text-2xl font-semibold text-cream tracking-tight">
              BH Studio
            </span>
          </div>

          {/* Desktop Nav - Center */}
          <nav className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-xs font-medium text-cream/60 hover:text-gold transition-colors duration-300 tracking-wide uppercase"
            >
              Features
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="text-xs font-medium text-cream/60 hover:text-gold transition-colors duration-300 tracking-wide uppercase"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("examples")}
              className="text-xs font-medium text-cream/60 hover:text-gold transition-colors duration-300 tracking-wide uppercase"
            >
              Examples
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-xs font-medium text-cream/60 hover:text-gold transition-colors duration-300 tracking-wide uppercase"
            >
              FAQ
            </button>
          </nav>

          {/* Desktop CTAs - Right */}
          <div className="hidden lg:flex items-center gap-4">
            <Button
              onClick={() => navigate("/auth")}
              variant="ghost"
              className="text-sm font-medium text-cream/70 hover:text-gold hover:bg-gold/5"
            >
              Sign In
            </Button>
            <div className="relative group">
              <Button
                onClick={() => navigate("/auth")}
                variant="gold"
                size="sm"
                className="btn-glow"
              >
                Sign Up Free
              </Button>
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-cream/40 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                No card required
              </span>
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              onClick={() => navigate("/auth")}
              variant="gold"
              size="sm"
            >
              Sign Up
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-cream/70 hover:text-gold transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gold/10 animate-fade-in">
            <nav className="flex flex-col gap-3">
              <button
                onClick={() => scrollToSection("features")}
                className="text-sm text-cream/70 hover:text-gold py-2 text-left"
              >
                Features
              </button>
              <button
                onClick={() => { navigate("/pricing"); setMobileMenuOpen(false); }}
                className="text-sm text-cream/70 hover:text-gold py-2 text-left"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection("examples")}
                className="text-sm text-cream/70 hover:text-gold py-2 text-left"
              >
                Examples
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-sm text-cream/70 hover:text-gold py-2 text-left"
              >
                FAQ
              </button>
              <button
                onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}
                className="text-sm text-cream/70 hover:text-gold py-2 text-left"
              >
                Sign In
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
