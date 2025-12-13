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
    <section className="py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 section-animate">
            Why Choose Us
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight section-animate delay-1">
            Built for professionals
          </h2>
        </div>

        {/* Values grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div 
              key={value.title}
              className={`text-center section-animate delay-${index + 2}`}
            >
              <div className="w-12 h-12 rounded-xl bg-accent/50 flex items-center justify-center mx-auto mb-4">
                <value.icon className="w-6 h-6 text-foreground/70" />
              </div>
              <h3 className="text-base font-medium text-foreground mb-2">
                {value.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
