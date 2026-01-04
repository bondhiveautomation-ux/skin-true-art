import { ReactNode, useEffect, useRef } from "react";
import { usePresenceContext } from "@/components/PresenceProvider";

interface ToolSectionProps {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  children: ReactNode;
}

export const ToolSection = ({ 
  id, 
  title, 
  subtitle, 
  description,
  children 
}: ToolSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { setCurrentTool } = usePresenceContext();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // User is viewing this tool section
            const toolName = `${title} ${subtitle}`.trim();
            setCurrentTool(toolName);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: "-10% 0px -10% 0px",
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [title, subtitle, setCurrentTool]);

  return (
    <section 
      ref={sectionRef}
      id={id} 
      className="py-10 sm:py-16 lg:py-24 scroll-mt-16 sm:scroll-mt-20 relative overflow-hidden"
    >
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-charcoal to-background" />
      
      {/* Subtle accent - hidden on mobile for performance */}
      <div className="hidden sm:block absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-gold/3 to-transparent rounded-full blur-3xl" />
      
      {/* Noise texture */}
      <div className="absolute inset-0 noise-texture" />
      
      <div className="relative max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-6 sm:mb-10 lg:mb-12">
          <h2 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-cream tracking-tight mb-2 sm:mb-3">
            {title} <span className="text-cream/50">{subtitle}</span>
          </h2>
          {description && (
            <p className="text-[11px] sm:text-xs md:text-sm text-cream/40 max-w-md sm:max-w-xl mx-auto leading-relaxed font-light px-3">
              {description}
            </p>
          )}
        </div>

        {/* Content card with luxury dark styling */}
        <div className="glass-card p-3 sm:p-5 md:p-8 lg:p-10 border border-gold/15 hover:border-gold/25 transition-all duration-500 hover:shadow-glow rounded-xl sm:rounded-2xl lg:rounded-3xl">
          {children}
        </div>
      </div>
    </section>
  );
};