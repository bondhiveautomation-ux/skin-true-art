import { Sparkles } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-16 border-t border-gold/10 bg-gradient-to-b from-background to-cream/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg gold-icon flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-gold" />
              </div>
              <span className="font-serif text-xl font-semibold text-charcoal">
                Influencer Tool
              </span>
            </div>
            <p className="text-sm text-charcoal-muted">
              Professional AI tools for modern creators
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm">
            <a href="#" className="text-charcoal-muted hover:text-gold transition-colors duration-300 tracking-wide">
              Privacy
            </a>
            <a href="#" className="text-charcoal-muted hover:text-gold transition-colors duration-300 tracking-wide">
              Terms
            </a>
            <a href="#" className="text-charcoal-muted hover:text-gold transition-colors duration-300 tracking-wide">
              Contact
            </a>
          </div>
        </div>

        {/* Luxury divider */}
        <div className="luxury-divider my-10" />

        {/* Copyright */}
        <div className="text-center">
          <p className="text-xs text-charcoal-muted/50 tracking-wide">
            © {new Date().getFullYear()} Influencer Tool. Crafted with elegance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};