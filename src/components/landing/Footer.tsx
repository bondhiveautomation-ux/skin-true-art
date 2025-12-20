import { Sparkles } from "lucide-react";
import { useContent } from "@/hooks/useSiteContent";

export const Footer = () => {
  const { content } = useContent("footer");

  // Defaults
  const brandName = content.brand_name || "Brandify";
  const tagline = content.tagline || "Your all-in-one content & branding studio";
  const copyright = (content.copyright || "© {year} Brandify. Crafted with elegance. All rights reserved.")
    .replace("{year}", new Date().getFullYear().toString());
  const linkPrivacy = content.link_privacy || "Privacy";
  const linkTerms = content.link_terms || "Terms";
  const linkContact = content.link_contact || "Contact";

  return (
    <footer className="py-12 sm:py-20 border-t border-gold/10 bg-charcoal-deep relative overflow-hidden">
      {/* Subtle gradient */}
      <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gradient-to-b from-gold/5 to-transparent blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 sm:gap-10 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg gold-icon flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold" />
              </div>
              <span className="font-serif text-xl sm:text-2xl font-semibold text-cream">
                {brandName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-cream/40 font-light tracking-wide">
              {tagline}
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 sm:gap-10 text-sm">
            <a href="#" className="text-cream/40 hover:text-gold transition-colors duration-300 tracking-wide uppercase text-xs font-medium py-2">
              {linkPrivacy}
            </a>
            <a href="#" className="text-cream/40 hover:text-gold transition-colors duration-300 tracking-wide uppercase text-xs font-medium py-2">
              {linkTerms}
            </a>
            <a href="#" className="text-cream/40 hover:text-gold transition-colors duration-300 tracking-wide uppercase text-xs font-medium py-2">
              {linkContact}
            </a>
          </div>
        </div>

        {/* Luxury divider */}
        <div className="luxury-divider my-8 sm:my-12" />

        {/* Copyright */}
        <div className="text-center">
          <p className="text-[10px] sm:text-xs text-cream/25 tracking-widest uppercase font-light px-4">
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};
