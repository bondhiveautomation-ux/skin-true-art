import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroProps {
  onExplore: () => void;
}

export const Hero = ({ onExplore }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Luxury gradient background */}
      <div className="absolute inset-0">
        {/* Cream to white gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-ivory via-cream to-background" />
        
        {/* Subtle gold accent gradients */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-gold/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-rose-gold/5 via-transparent to-transparent rounded-full blur-3xl" />
        
        {/* Silk texture overlay */}
        <div className="absolute inset-0 silk-texture" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Luxury badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/5 border border-gold/20 mb-8 section-animate">
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-sm font-medium text-charcoal-muted tracking-wide">Premium AI Beauty Studio</span>
        </div>

        {/* Main headline - Serif font */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-charcoal leading-[1.1] tracking-tight mb-6 section-animate delay-1">
          Elevate Your
          <br />
          <span className="gradient-text">Creative Vision</span>
        </h1>

        {/* Sub-headline - Sans-serif */}
        <p className="text-lg sm:text-xl text-charcoal-muted max-w-2xl mx-auto mb-12 leading-relaxed section-animate delay-2">
          Professional AI tools crafted for influencers, makeup artists, and creative visionaries. 
          Transform your content with precision and elegance.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 section-animate delay-3">
          <Button 
            onClick={onExplore}
            variant="gold"
            size="xl"
            className="min-w-[200px]"
          >
            Explore Studio
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            onClick={onExplore}
            variant="gold-outline"
            size="xl"
            className="min-w-[200px]"
          >
            View Features
          </Button>
        </div>

        {/* Trust indicator */}
        <div className="mt-20 section-animate delay-4">
          <div className="luxury-divider max-w-xs mx-auto mb-6" />
          <p className="text-sm text-charcoal-muted/60 tracking-wider uppercase">
            Trusted by professional creators worldwide
          </p>
        </div>
      </div>
    </section>
  );
};