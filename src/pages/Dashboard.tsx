import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/layout/Hero";
import { Footer } from "@/components/landing/Footer";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ValueSection } from "@/components/landing/ValueSection";
import { CTASection } from "@/components/landing/CTASection";
import { ToolCard } from "@/components/dashboard/ToolCard";
import { TOOLS } from "@/config/tools";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { useAdmin } from "@/hooks/useAdmin";
import { WelcomePopup } from "@/components/WelcomePopup";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { gems } = useGems();
  const { isAdmin } = useAdmin();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Welcome popup for new users */}
      <WelcomePopup />
      
      {/* Navigation */}
      <Navbar 
        onNavigate={scrollToSection}
        onSignOut={signOut}
        userEmail={user?.email}
        credits={gems}
        isAdmin={isAdmin}
      />

      {/* Hero Section */}
      <Hero onExplore={() => scrollToSection("tools")} />

      {/* Tools Showcase Section */}
      <section id="tools" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden scroll-mt-20">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-charcoal to-background" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 noise-texture" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-primary/10 border border-primary/25 mb-6 sm:mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">AI Tools</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-cream tracking-tight mb-4 sm:mb-6">
              Your Creative <span className="gradient-text">Arsenal</span>
            </h2>
            <p className="text-base sm:text-lg text-cream/50 max-w-2xl mx-auto leading-relaxed font-light px-4">
              Professional AI tools for content creation, image enhancement, and brand building. Click any tool to get started.
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {TOOLS.map((tool, index) => (
              <ToolCard
                key={tool.id}
                name={tool.name}
                description={tool.description}
                icon={tool.icon}
                path={tool.path}
                gemCostKey={tool.gemCostKey}
                gradient={tool.gradient}
                delay={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorksSection id="how-it-works" />

      {/* Value Section */}
      <ValueSection />

      {/* CTA Section */}
      <CTASection onGetStarted={() => scrollToSection("tools")} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;
