import { Sparkles } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-20 border-t border-gold/10 bg-charcoal-deep relative overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gradient-to-b from-gold/5 to-transparent blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg gold-icon flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-gold" />
              </div>
              <span className="font-serif text-2xl font-semibold text-cream">
                Influencer Tool
              </span>
            </div>
            <p className="text-sm text-cream/40 font-light tracking-wide">
              AI-powered tools for the modern creator
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-10 text-sm">
            <a href="#" className="text-cream/40 hover:text-gold transition-colors duration-300 tracking-wide uppercase text-xs font-medium">
              Privacy
            </a>
            <a href="#" className="text-cream/40 hover:text-gold transition-colors duration-300 tracking-wide uppercase text-xs font-medium">
              Terms
            </a>
            <a href="#" className="text-cream/40 hover:text-gold transition-colors duration-300 tracking-wide uppercase text-xs font-medium">
              Contact
            </a>
          </div>
        </div>

        {/* Luxury divider */}
        <div className="luxury-divider my-12" />

        {/* Copyright */}
        <div className="text-center">
          <p className="text-xs text-cream/25 tracking-widest uppercase font-light">
            © {new Date().getFullYear()} Influencer Tool. Crafted with elegance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
