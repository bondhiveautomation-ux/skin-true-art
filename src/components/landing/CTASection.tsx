import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
  onGetStarted: () => void;
}

export const CTASection = ({ onGetStarted }: CTASectionProps) => {
  return (
    <section className="py-24 lg:py-32 bg-card/30">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight mb-6 section-animate">
          Ready to create?
        </h2>
        <p className="text-lg text-muted-foreground mb-10 section-animate delay-1">
          Start using our professional AI tools today and elevate your content.
        </p>
        <Button 
          onClick={onGetStarted}
          size="lg"
          className="btn-glow bg-foreground text-background hover:bg-foreground/90 text-base font-medium px-10 h-12 rounded-xl section-animate delay-2"
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};
