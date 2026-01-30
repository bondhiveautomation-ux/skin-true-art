import { Button } from "@/components/ui/button";
import { ArrowRight, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const FinalCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 sm:py-28 lg:py-36 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-charcoal-deep" />
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-gold/8 via-gold/3 to-gold/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-rose-gold/5 to-transparent blur-3xl" />
      <div className="absolute inset-0 noise-texture" />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Crown icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gold-icon mb-8 sm:mb-10 section-animate animate-pulse-glow">
          <Crown className="w-7 h-7 sm:w-9 sm:h-9 text-gold" />
        </div>

        {/* Headline */}
        <h2 className="font-bangla text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-cream tracking-tight mb-3 sm:mb-4 section-animate delay-1">
          আপনার কনটেন্টকে <span className="gradient-text">প্রিমিয়াম করুন</span> — আজ থেকেই
        </h2>
        
        <p className="text-sm sm:text-base lg:text-lg text-cream/50 mb-8 sm:mb-10 section-animate delay-2 font-light">
          Start free. Upgrade when you're ready.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 section-animate delay-3 mb-6">
          <Button 
            onClick={() => navigate("/auth")}
            variant="gold"
            size="xl"
            className="w-full sm:w-auto min-w-[200px] btn-glow text-base sm:text-lg"
          >
            Sign Up Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            onClick={() => navigate("/auth")}
            variant="luxury"
            size="xl"
            className="w-full sm:w-auto min-w-[160px]"
          >
            Sign In
          </Button>
        </div>

        {/* Micro-trust */}
        <div className="section-animate delay-4">
          <div className="luxury-divider max-w-xs mx-auto mb-4 sm:mb-6" />
          <p className="text-xs sm:text-sm text-cream/40 tracking-wide">
            Free account • No card • Premium experience
          </p>
        </div>
      </div>
    </section>
  );
};
