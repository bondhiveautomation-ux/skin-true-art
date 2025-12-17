import { Target, RefreshCw, Zap, Shield } from "lucide-react";
import { useContent } from "@/hooks/useSiteContent";

const valueIcons = [Target, RefreshCw, Zap, Shield];

export const ValueSection = () => {
  const { content } = useContent("value");

  // Check if section is visible
  const isVisible = content.section_visible !== "false";
  if (!isVisible) return null;

  // Defaults
  const badgeText = content.badge_text || "Our Promise";
  const headline1 = content.headline_1 || "Built for";
  const headline2 = content.headline_2 || "Excellence";
  const subheadline = content.subheadline || "Trusted by professionals who demand nothing less than perfection.";

  const values = [
    {
      icon: valueIcons[0],
      title: content.item_1_title || "Precision",
      description: content.item_1_description || "Every tool is fine-tuned for accurate, high-quality results you can rely on."
    },
    {
      icon: valueIcons[1],
      title: content.item_2_title || "Consistency",
      description: content.item_2_description || "Maintain identity and style across all your generated content."
    },
    {
      icon: valueIcons[2],
      title: content.item_3_title || "Creator-First",
      description: content.item_3_description || "Designed with the workflow of professional creators in mind."
    },
    {
      icon: valueIcons[3],
      title: content.item_4_title || "Professional Results",
      description: content.item_4_description || "Output quality that meets industry standards for commercial use."
    }
  ];

  return (
    <section className="py-28 lg:py-36 relative overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-charcoal to-background" />
      
      {/* Subtle accent gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-gold/5 via-transparent to-gold/5 rounded-full blur-3xl" />
      
      {/* Noise texture */}
      <div className="absolute inset-0 noise-texture" />
      
      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-20 lg:mb-24">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 border border-gold/25 mb-8 section-animate backdrop-blur-sm">
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">{badgeText}</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-cream tracking-tight section-animate delay-1">
            {headline1} <span className="gradient-text">{headline2}</span>
          </h2>
          <p className="mt-6 text-lg text-cream/50 max-w-xl mx-auto section-animate delay-2 font-light">
            {subheadline}
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
              <div className="w-16 h-16 rounded-2xl gold-icon flex items-center justify-center mx-auto mb-6 group-hover:shadow-gold transition-all duration-500">
                <value.icon className="w-7 h-7 text-gold" />
              </div>
              
              {/* Title */}
              <h3 className="font-serif text-xl font-semibold text-cream mb-4 group-hover:text-gold transition-colors duration-300">
                {value.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-cream/40 leading-relaxed font-light">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
