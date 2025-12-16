import { Button } from "@/components/ui/button";
import { ArrowRight, Crown } from "lucide-react";

interface CTASectionProps {
  onGetStarted: () => void;
}

export const CTASection = ({ onGetStarted }: CTASectionProps) => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Elegant gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-cream/50 to-ivory" />
      
      {/* Gold accent elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-gold/5 via-rose-gold/5 to-gold/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-3xl mx-auto px-6 lg:px-8 text-center">
        {/* Crown icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gold-icon mb-8 section-animate">
          <Crown className="w-7 h-7 text-gold" />
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal tracking-tight mb-6 section-animate delay-1">
          Ready to <span className="gradient-text">Transform</span>?
        </h2>
        
        <p className="text-lg text-charcoal-muted mb-12 max-w-xl mx-auto leading-relaxed section-animate delay-2">
          Join professional creators who trust our AI studio to elevate their content to new heights of excellence.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 section-animate delay-3">
          <Button 
            onClick={onGetStarted}
            variant="gold"
            size="xl"
            className="min-w-[220px]"
          >
            Begin Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Trust elements */}
        <div className="mt-16 section-animate delay-4">
          <div className="luxury-divider max-w-xs mx-auto mb-6" />
          <p className="text-sm text-charcoal-muted/50 tracking-wide">
            No commitment required • Professional results guaranteed
          </p>
        </div>
      </div>
    </section>
  );
};