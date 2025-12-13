import { ArrowDown, Sparkles, Wand2, Palette, Camera } from "lucide-react";

interface HeroProps {
  onExplore: () => void;
}

export const Hero = ({ onExplore }: HeroProps) => {
  const features = [
    { icon: Wand2, label: "AI-Powered" },
    { icon: Palette, label: "Premium Quality" },
    { icon: Camera, label: "Pro Results" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float delay-300" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Creative Suite</span>
        </div>

        {/* Main heading */}
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 animate-fade-in-up delay-100">
          Transform Your
          <br />
          <span className="gradient-text">Creative Vision</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
          Professional AI tools for influencers, creators, and brands. 
          Enhance portraits, generate consistent characters, transfer poses, and more.
        </p>

        {/* Feature pills */}
        <div className="flex items-center justify-center gap-4 mb-12 animate-fade-in-up delay-300">
          {features.map((feature, index) => (
            <div 
              key={feature.label}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border/50"
            >
              <feature.icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-400">
          <button 
            onClick={onExplore}
            className="group relative px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all duration-300 glow-button"
          >
            <span className="relative z-10">Explore Tools</span>
          </button>
          <button className="px-8 py-4 rounded-xl bg-secondary/50 text-foreground font-semibold text-lg border border-border/50 hover:bg-secondary hover:border-primary/30 transition-all duration-300">
            View Examples
          </button>
        </div>

        {/* Scroll indicator */}
        <button 
          onClick={onExplore}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors animate-fade-in delay-500"
        >
          <span className="text-sm">Scroll to explore</span>
          <ArrowDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>
    </section>
  );
};
