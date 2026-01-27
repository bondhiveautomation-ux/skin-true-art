import { Sparkles } from "lucide-react";
import { useContent } from "@/hooks/useSiteContent";

export const Footer = () => {
  const { content } = useContent("footer");

  // Defaults
  const brandName = content.brand_name || "BH Studio";
  const tagline = content.tagline || "Your personal AI studio for beauty & content";
  const copyright = (content.copyright || "© {year} BH Studio. Crafted with elegance. All rights reserved.")
    .replace("{year}", new Date().getFullYear().toString());
  const linkPrivacy = content.link_privacy || "Privacy";
  const linkTerms = content.link_terms || "Terms";
  const linkContact = content.link_contact || "Contact";

  return (
    <footer className="py-10 sm:py-16 border-t border-gold/10 bg-charcoal-deep relative overflow-hidden">
      {/* Subtle gradient */}
      <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gradient-to-b from-gold/5 to-transparent blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:gap-8 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1 sm:mb-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gold-icon flex items-center justify-center">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold" />
              </div>
              <span className="font-serif text-lg sm:text-xl font-semibold text-cream">
                {brandName}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-cream/40 font-light">
              {tagline}
            </p>
            <p className="font-bangla text-[10px] sm:text-[11px] text-cream/50 mt-1">
              সৌন্দর্য ও কন্টেন্টের জন্য আপনার ব্যক্তিগত AI স্টুডিও
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-5 sm:gap-8">
            <a href="#" className="text-cream/40 hover:text-gold transition-colors duration-300 uppercase text-[10px] sm:text-xs font-medium py-2 px-1">
              {linkPrivacy}
            </a>
            <a href="#" className="text-cream/40 hover:text-gold transition-colors duration-300 uppercase text-[10px] sm:text-xs font-medium py-2 px-1">
              {linkTerms}
            </a>
            <a href="#" className="text-cream/40 hover:text-gold transition-colors duration-300 uppercase text-[10px] sm:text-xs font-medium py-2 px-1">
              {linkContact}
            </a>
          </div>
        </div>

        {/* Luxury divider */}
        <div className="luxury-divider my-6 sm:my-10" />

        {/* Copyright */}
        <div className="text-center">
          <p className="text-[9px] sm:text-[10px] text-cream/25 tracking-wider uppercase font-light px-2">
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};
