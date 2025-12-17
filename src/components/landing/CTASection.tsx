import { Button } from "@/components/ui/button";
import { ArrowRight, Crown } from "lucide-react";

interface CTASectionProps {
  onGetStarted: () => void;
}

export const CTASection = ({ onGetStarted }: CTASectionProps) => {
  return (
    <section className="py-28 lg:py-36 relative overflow-hidden">
      {/* Deep dark background */}
      <div className="absolute inset-0 bg-charcoal-deep" />
      
      {/* Dramatic gradient overlays */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-gold/8 via-gold/3 to-gold/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-rose-gold/5 to-transparent blur-3xl" />
      
      {/* Noise texture */}
      <div className="absolute inset-0 noise-texture" />
      
      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {/* Crown icon with glow */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gold-icon mb-10 section-animate animate-pulse-glow">
          <Crown className="w-9 h-9 text-gold" />
        </div>

        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-cream tracking-tight mb-8 section-animate delay-1">
          Ready to <span className="gradient-text">Transform</span>?
        </h2>
        
        <p className="text-lg sm:text-xl text-cream/50 mb-14 max-w-2xl mx-auto leading-relaxed section-animate delay-2 font-light">
          Join the creators shaping the future of fashion and beauty with AI.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 section-animate delay-3">
          <Button 
            onClick={onGetStarted}
            variant="gold"
            size="xl"
            className="min-w-[260px] btn-glow text-lg"
          >
            Begin Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Trust elements */}
        <div className="mt-20 section-animate delay-4">
          <div className="luxury-divider max-w-sm mx-auto mb-8" />
          <p className="text-sm text-cream/30 tracking-widest uppercase font-light">
            No commitment required • Professional results guaranteed
          </p>
        </div>
      </div>
    </section>
  );
};
