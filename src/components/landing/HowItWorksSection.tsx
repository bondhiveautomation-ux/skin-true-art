import { Upload, MousePointer, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Image",
    description: "Upload your source image in any common format."
  },
  {
    icon: MousePointer,
    step: "02",
    title: "Choose Tool",
    description: "Select the AI tool that fits your creative needs."
  },
  {
    icon: Download,
    step: "03",
    title: "Generate & Download",
    description: "Get your result instantly and download in high quality."
  }
];

interface HowItWorksSectionProps {
  id: string;
}

export const HowItWorksSection = ({ id }: HowItWorksSectionProps) => {
  return (
    <section id={id} className="py-24 lg:py-32 bg-card/30">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 section-animate">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight section-animate delay-1">
            Simple & intuitive
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className={`text-center section-animate delay-${index + 2}`}
            >
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-accent/50 flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-foreground/70" />
                </div>
                <span className="absolute -top-2 -right-2 text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-full border border-border/50">
                  {step.step}
                </span>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
