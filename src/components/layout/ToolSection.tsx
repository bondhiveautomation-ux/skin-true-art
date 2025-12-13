import { ReactNode } from "react";

interface ToolSectionProps {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  badge?: string;
  children: ReactNode;
}

export const ToolSection = ({ 
  id, 
  title, 
  subtitle, 
  description,
  badge,
  children 
}: ToolSectionProps) => {
  return (
    <section id={id} className="relative py-24 scroll-mt-20">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          {badge && (
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary uppercase tracking-wider mb-4">
              {badge}
            </span>
          )}
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
            {title} <span className="gradient-text">{subtitle}</span>
          </h2>
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="glass-card p-8 sm:p-10">
          {children}
        </div>
      </div>
    </section>
  );
};
