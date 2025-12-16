import { Target, RefreshCw, Zap, Shield } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Precision",
    description: "Every tool is fine-tuned for accurate, high-quality results you can rely on."
  },
  {
    icon: RefreshCw,
    title: "Consistency",
    description: "Maintain identity and style across all your generated content."
  },
  {
    icon: Zap,
    title: "Creator-First",
    description: "Designed with the workflow of professional creators in mind."
  },
  {
    icon: Shield,
    title: "Professional Results",
    description: "Output quality that meets industry standards for commercial use."
  }
];

export const ValueSection = () => {
  return (
    <section className="py-24 lg:py-32 relative">
      {/* Subtle luxury background */}
      <div className="absolute inset-0 bg-gradient-to-b from-ivory via-background to-cream/30" />
      
      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/5 border border-gold/20 mb-6 section-animate">
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">Our Promise</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal tracking-tight section-animate delay-1">
            Built for <span className="gradient-text">Excellence</span>
          </h2>
          <p className="mt-4 text-lg text-charcoal-muted max-w-xl mx-auto section-animate delay-2">
            Trusted by professionals who demand nothing less than perfection.
          </p>
        </div>

        {/* Values grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {values.map((value, index) => (
            <div 
              key={value.title}
              className={`text-center group section-animate delay-${index + 3}`}
            >
              {/* Icon with gold accent */}
              <div className="w-14 h-14 rounded-2xl gold-icon flex items-center justify-center mx-auto mb-5 group-hover:shadow-gold transition-all duration-300">
                <value.icon className="w-6 h-6 text-gold" />
              </div>
              
              {/* Title */}
              <h3 className="font-serif text-lg font-semibold text-charcoal mb-3 group-hover:text-gold transition-colors duration-300">
                {value.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-charcoal-muted leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};