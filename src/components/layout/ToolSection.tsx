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
    <section id={id} className="py-16 lg:py-20 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-2">
            {title} <span className="text-muted-foreground">{subtitle}</span>
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              {description}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="glass-card p-6 sm:p-8">
          {children}
        </div>
      </div>
    </section>
  );
};
