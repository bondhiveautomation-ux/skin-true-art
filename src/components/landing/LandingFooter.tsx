import { Sparkles, MessageCircle } from "lucide-react";

export const LandingFooter = () => {
  const whatsappNumber = "17059884080";
  const whatsappMessage = encodeURIComponent("Hi, I have a question about BH Studio.");

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

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
                BH Studio
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-cream/40 font-light">
              Premium content tools for business
            </p>
            <p className="font-bangla text-[10px] sm:text-[11px] text-cream/50 mt-1">
              ব্যবসার জন্য প্রিমিয়াম কনটেন্ট টুল
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8">
            <button 
              onClick={() => scrollToSection("features")}
              className="text-cream/40 hover:text-gold transition-colors duration-300 uppercase text-[10px] sm:text-xs font-medium py-2 px-1"
            >
              Features
            </button>
            <a 
              href="/pricing" 
              className="text-cream/40 hover:text-gold transition-colors duration-300 uppercase text-[10px] sm:text-xs font-medium py-2 px-1"
            >
              Pricing
            </a>
            <button 
              onClick={() => scrollToSection("faq")}
              className="text-cream/40 hover:text-gold transition-colors duration-300 uppercase text-[10px] sm:text-xs font-medium py-2 px-1"
            >
              FAQ
            </button>
            <a 
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/40 hover:text-gold transition-colors duration-300 uppercase text-[10px] sm:text-xs font-medium py-2 px-1 inline-flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              Contact
            </a>
            <a 
              href="#" 
              className="text-cream/40 hover:text-gold transition-colors duration-300 uppercase text-[10px] sm:text-xs font-medium py-2 px-1"
            >
              Privacy
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="luxury-divider my-6 sm:my-10" />

        {/* Copyright */}
        <div className="text-center">
          <p className="text-[9px] sm:text-[10px] text-cream/25 tracking-wider uppercase font-light px-2">
            © {new Date().getFullYear()} BH Studio. Crafted with elegance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
