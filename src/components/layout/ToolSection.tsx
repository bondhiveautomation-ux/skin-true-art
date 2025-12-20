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
      className="py-12 sm:py-20 lg:py-28 scroll-mt-16 sm:scroll-mt-20 relative overflow-hidden"
    >
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-charcoal to-background" />
      
      {/* Subtle accent - hidden on mobile for performance */}
      <div className="hidden sm:block absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-gold/3 to-transparent rounded-full blur-3xl" />
      
      {/* Noise texture */}
      <div className="absolute inset-0 noise-texture" />
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-14">
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-cream tracking-tight mb-3 sm:mb-4">
            {title} <span className="text-cream/50">{subtitle}</span>
          </h2>
          {description && (
            <p className="text-xs sm:text-sm text-cream/40 max-w-xl mx-auto leading-relaxed font-light px-2">
              {description}
            </p>
          )}
        </div>

        {/* Content card with luxury dark styling */}
        <div className="glass-card p-4 sm:p-6 md:p-8 lg:p-10 border border-gold/15 hover:border-gold/25 transition-all duration-500 hover:shadow-glow rounded-2xl sm:rounded-3xl">
          {children}
        </div>
      </div>
    </section>
  );
};