import { ReactNode } from "react";

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
  return (
    <section id={id} className="py-16 lg:py-24 scroll-mt-20 relative">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-cream/20 to-background" />
      
      <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-10 lg:mb-12">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal tracking-tight mb-3">
            {title} <span className="text-charcoal-muted">{subtitle}</span>
          </h2>
          {description && (
            <p className="text-sm text-charcoal-muted max-w-xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Content card with luxury styling */}
        <div className="glass-card p-6 sm:p-8 lg:p-10 border border-gold/10 hover:border-gold/20 transition-all duration-500">
          {children}
        </div>
      </div>
    </section>
  );
};