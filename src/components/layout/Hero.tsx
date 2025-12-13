import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface HeroProps {
  onExplore: () => void;
}

export const Hero = ({ onExplore }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Subtle gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-muted/30 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-muted/20 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-foreground leading-[1.1] tracking-tight mb-6 section-animate">
          Premium AI Tools
          <br />
          <span className="text-muted-foreground">for Creators</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed section-animate delay-1">
          Professional-grade AI studio designed for influencers, photographers, and creative professionals. Transform your content with precision.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 section-animate delay-2">
          <Button 
            onClick={onExplore}
            size="lg"
            className="btn-glow bg-foreground text-background hover:bg-foreground/90 text-base font-medium px-8 h-12 rounded-xl"
          >
            Explore Tools
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            onClick={onExplore}
            variant="outline"
            size="lg"
            className="text-base font-medium px-8 h-12 rounded-xl border-border/50 hover:bg-accent/50"
          >
            View Features
          </Button>
        </div>

        {/* Trust indicator */}
        <p className="mt-16 text-sm text-muted-foreground/60 section-animate delay-3">
          Trusted by professional creators worldwide
        </p>
      </div>
    </section>
  );
};
