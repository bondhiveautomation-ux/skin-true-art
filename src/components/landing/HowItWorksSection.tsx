import { Upload, MousePointer, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Image",
    description: "Select your source image in any common format. Our system handles the rest with precision."
  },
  {
    icon: MousePointer,
    step: "02",
    title: "Choose Your Tool",
    description: "Select from our suite of AI tools tailored to your creative vision and brand aesthetic."
  },
  {
    icon: Download,
    step: "03",
    title: "Generate & Download",
    description: "Receive your results instantly in stunning high quality, ready for your content."
  }
];

interface HowItWorksSectionProps {
  id: string;
}

export const HowItWorksSection = ({ id }: HowItWorksSectionProps) => {
  return (
    <section id={id} className="py-28 lg:py-36 relative overflow-hidden">
      {/* Deep dark cinematic background */}
      <div className="absolute inset-0 bg-charcoal-deep" />
      
      {/* Dramatic gradient overlays */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background to-transparent" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-rose-gold/3 to-transparent" />
      
      {/* Noise texture */}
      <div className="absolute inset-0 noise-texture" />
      
      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-20 lg:mb-28">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 border border-gold/25 mb-8 section-animate backdrop-blur-sm">
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">The Process</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-cream tracking-tight section-animate delay-1">
            Effortless <span className="gradient-text">Elegance</span>
          </h2>
          <p className="mt-6 text-lg text-cream/50 max-w-xl mx-auto section-animate delay-2 font-light">
            Three simple steps to transform your creative vision into reality.
          </p>
        </div>

        {/* Steps - Cinematic layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className={`relative text-center section-animate delay-${index + 3} group`}
            >
              {/* Large step number */}
              <div className="step-number mb-6 opacity-30 group-hover:opacity-60 transition-opacity duration-500">
                {step.step}
              </div>
              
              {/* Icon container */}
              <div className="relative inline-flex items-center justify-center mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold/15 to-gold/5 border border-gold/25 flex items-center justify-center backdrop-blur-sm group-hover:shadow-gold transition-all duration-500">
                  <step.icon className="w-8 h-8 text-gold" />
                </div>
              </div>
              
              {/* Title */}
              <h3 className="font-serif text-2xl font-semibold text-cream mb-4 group-hover:text-gold transition-colors duration-300">
                {step.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-cream/40 leading-relaxed font-light max-w-xs mx-auto">
                {step.description}
              </p>

              {/* Connection line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-24 left-[calc(50%+60px)] w-[calc(100%-120px)] h-px">
                  <div className="w-full h-full bg-gradient-to-r from-gold/30 via-gold/10 to-gold/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
