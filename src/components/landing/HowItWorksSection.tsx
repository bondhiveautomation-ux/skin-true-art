import { Upload, MousePointer, Download } from "lucide-react";
import { useContent } from "@/hooks/useSiteContent";

interface HowItWorksSectionProps {
  id: string;
}

export const HowItWorksSection = ({ id }: HowItWorksSectionProps) => {
  const { content } = useContent("how_it_works");

  // Check if section is visible
  const isVisible = content.section_visible !== "false";
  if (!isVisible) return null;

  // Defaults
  const badgeText = content.badge_text || "The Process";
  const headline1 = content.headline_1 || "Effortless";
  const headline2 = content.headline_2 || "Elegance";
  const subheadline = content.subheadline || "Three simple steps to transform your creative vision into reality.";

  const steps = [
    {
      icon: Upload,
      step: "01",
      title: content.step_1_title || "Upload Your Image",
      description: content.step_1_description || "Select your source image in any common format. Our system handles the rest with precision."
    },
    {
      icon: MousePointer,
      step: "02",
      title: content.step_2_title || "Choose Your Tool",
      description: content.step_2_description || "Select from our suite of AI tools tailored to your creative vision and brand aesthetic."
    },
    {
      icon: Download,
      step: "03",
      title: content.step_3_title || "Generate & Download",
      description: content.step_3_description || "Receive your results instantly in stunning high quality, ready for your content."
    }
  ];

  return (
    <section id={id} className="py-16 sm:py-28 lg:py-36 relative overflow-hidden">
      {/* Deep dark cinematic background */}
      <div className="absolute inset-0 bg-charcoal-deep" />
      
      {/* Dramatic gradient overlays - reduced on mobile */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background to-transparent" />
      <div className="hidden sm:block absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/5 to-transparent" />
      <div className="hidden sm:block absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-rose-gold/3 to-transparent" />
      
      {/* Noise texture */}
      <div className="absolute inset-0 noise-texture" />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-20 lg:mb-28">
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gold/10 border border-gold/25 mb-6 sm:mb-8 section-animate backdrop-blur-sm">
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">{badgeText}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-cream tracking-tight section-animate delay-1">
            {headline1} <span className="gradient-text">{headline2}</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-cream/50 max-w-xl mx-auto section-animate delay-2 font-light px-2">
            {subheadline}
          </p>
        </div>

        {/* Steps - Responsive layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className={`relative text-center section-animate delay-${index + 3} group`}
            >
              {/* Large step number */}
              <div className="step-number text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6 opacity-30 group-hover:opacity-60 transition-opacity duration-500">
                {step.step}
              </div>
              
              {/* Icon container */}
              <div className="relative inline-flex items-center justify-center mb-5 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gold/15 to-gold/5 border border-gold/25 flex items-center justify-center backdrop-blur-sm group-hover:shadow-gold transition-all duration-500">
                  <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
                </div>
              </div>
              
              {/* Title */}
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-cream mb-3 sm:mb-4 group-hover:text-gold transition-colors duration-300">
                {step.title}
              </h3>
              
              {/* Description */}
              <p className="text-xs sm:text-sm text-cream/40 leading-relaxed font-light max-w-xs mx-auto px-4 sm:px-0">
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
