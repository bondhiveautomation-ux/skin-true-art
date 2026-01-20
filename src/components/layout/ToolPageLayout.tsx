import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Diamond } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { useAdmin } from "@/hooks/useAdmin";
import { useToolConfigs } from "@/hooks/useToolConfigs";
import { getGemCost } from "@/lib/gemCosts";
import { LucideIcon } from "lucide-react";

interface ToolPageLayoutProps {
  children: ReactNode;
  toolId?: string;
  toolName: string;
  toolDescription: string;
  gemCostKey: string;
  icon: LucideIcon;
  badge?: string;
}

export const ToolPageLayout = ({
  children,
  toolId,
  toolName,
  toolDescription,
  gemCostKey,
  icon: Icon,
  badge,
}: ToolPageLayoutProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { gems } = useGems();
  const { isAdmin } = useAdmin();
  const { getToolConfig } = useToolConfigs();

  // Get dynamic config from database if available
  const dbConfig = toolId ? getToolConfig(toolId) : null;
  const displayName = dbConfig?.name || toolName;
  const displayDescription = dbConfig?.long_description || toolDescription;
  const displayBadge = dbConfig?.badge || badge;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onNavigate={scrollToSection}
        onSignOut={signOut}
        credits={gems}
        isAdmin={isAdmin}
      />

      {/* Hero Section */}
      <section className="pt-28 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-charcoal to-background" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 noise-texture" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-cream/60 hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Tools</span>
          </button>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/25 mb-6 backdrop-blur-sm">
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                {displayBadge || displayName}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-cream tracking-tight mb-4">
              {displayName}
            </h1>
            <p className="text-cream/50 max-w-xl mx-auto leading-relaxed font-light mb-6">
              {displayDescription}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 border border-border/30">
              <Diamond className="w-4 h-4 text-primary" />
              <span className="text-sm text-cream/70">
                <span className="font-semibold text-primary">{getGemCost(gemCostKey)}</span> gems per generation
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tool Section */}
      <section className="pb-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-background to-background" />
        <div className="absolute inset-0 noise-texture" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-4 sm:p-6 md:p-8 lg:p-10 border border-primary/15 hover:border-primary/25 transition-all duration-500 rounded-xl sm:rounded-2xl lg:rounded-3xl">
            {children}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
