import { Upload, MousePointer, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Image",
    description: "Select your source image in any common format. Our system handles the rest."
  },
  {
    icon: MousePointer,
    step: "02",
    title: "Choose Your Tool",
    description: "Select from our suite of AI tools tailored to your creative vision."
  },
  {
    icon: Download,
    step: "03",
    title: "Generate & Download",
    description: "Receive your results instantly in stunning high quality."
  }
];

interface HowItWorksSectionProps {
  id: string;
}

export const HowItWorksSection = ({ id }: HowItWorksSectionProps) => {
  return (
    <section id={id} className="py-24 lg:py-32 relative overflow-hidden">
      {/* Luxury background */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal to-charcoal-light" />
      
      {/* Gold accent overlay */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-rose-gold/5 to-transparent" />
      
      <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 mb-6 section-animate">
            <span className="text-xs font-semibold text-gold-light uppercase tracking-widest">Simple Process</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-cream tracking-tight section-animate delay-1">
            Effortless <span className="text-gold">Elegance</span>
          </h2>
          <p className="mt-4 text-lg text-cream/60 max-w-xl mx-auto section-animate delay-2">
            Three simple steps to transform your creative vision into reality.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className={`text-center section-animate delay-${index + 3}`}
            >
              {/* Step number with gold circle */}
              <div className="relative inline-flex items-center justify-center mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center backdrop-blur-sm">
                  <step.icon className="w-8 h-8 text-gold" />
                </div>
                <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gold text-charcoal text-xs font-bold flex items-center justify-center shadow-gold">
                  {step.step}
                </span>
              </div>
              
              {/* Title */}
              <h3 className="font-serif text-xl font-semibold text-cream mb-3">
                {step.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-cream/50 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Connection lines (decorative) */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 w-2/3 justify-between px-20">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        </div>
      </div>
    </section>
  );
};