import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/layout/Hero";
import { Footer } from "@/components/landing/Footer";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ValueSection } from "@/components/landing/ValueSection";
import { CTASection } from "@/components/landing/CTASection";
import { VisualToolCard } from "@/components/dashboard/VisualToolCard";
import { WhatsAppFloat } from "@/components/dashboard/WhatsAppFloat";
import { QuickStartProgress } from "@/components/dashboard/QuickStartProgress";
import { UserBadge, getUserBadgeType } from "@/components/dashboard/UserBadge";
import { TOOLS } from "@/config/tools";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { useAdmin } from "@/hooks/useAdmin";
import { WelcomePopup } from "@/components/WelcomePopup";
import { useToolConfigs } from "@/hooks/useToolConfigs";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { gems, subscriptionType } = useGems();
  const { isAdmin } = useAdmin();
  const { toolConfigs } = useToolConfigs();
  const toolsRef = useRef<HTMLElement>(null);
  const [toolsVisible, setToolsVisible] = useState(false);
  
  // Quick start progress - check localStorage for completion
  const [quickStartComplete, setQuickStartComplete] = useState(() => {
    return localStorage.getItem("bh_quickstart_complete") === "true";
  });
  const [quickStartStep, setQuickStartStep] = useState(1);

  // Merge database configs with static tool configs (db overrides static)
  const mergedTools = TOOLS.map(staticTool => {
    const dbConfig = toolConfigs?.find(t => t.tool_id === staticTool.id);
    if (dbConfig && dbConfig.is_active) {
      return {
        ...staticTool,
        name: dbConfig.name,
        shortName: dbConfig.short_name,
        description: dbConfig.description,
        longDescription: dbConfig.long_description,
        badge: dbConfig.badge || undefined,
        previewImageUrl: dbConfig.preview_image_url || null,
      };
    }
    // If not in DB or inactive, use static config (but check if explicitly hidden)
    const isHidden = toolConfigs?.find(t => t.tool_id === staticTool.id && !t.is_active);
    if (isHidden) return null;
    return { ...staticTool, previewImageUrl: null };
  }).filter(Boolean) as (typeof TOOLS[number] & { previewImageUrl: string | null })[];

  // Smooth scroll to tools section with animation
  const scrollToTools = () => {
    if (toolsRef.current) {
      const targetPosition = toolsRef.current.offsetTop - 80;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 600;
      let start: number | null = null;

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Ease-in-out function
        const ease = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        window.scrollTo(0, startPosition + distance * ease);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        } else {
          // Trigger visibility animation after scroll completes
          setToolsVisible(true);
        }
      };

      requestAnimationFrame(animation);
    }
  };

  const scrollToSection = (sectionId: string) => {
    if (sectionId === "tools") {
      scrollToTools();
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Observe tools section for visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setToolsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (toolsRef.current) {
      observer.observe(toolsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Get user badge type
  const badgeType = getUserBadgeType(isAdmin, subscriptionType);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Welcome popup for new users */}
      <WelcomePopup />
      
      {/* Quick Start Progress Bar - Below Navbar, not fixed */}
      {user && !quickStartComplete && (
        <div className="pt-16 sm:pt-20">
          <QuickStartProgress
            currentStep={quickStartStep}
            isComplete={quickStartComplete}
            onDismiss={() => {
              setQuickStartComplete(true);
              localStorage.setItem("bh_quickstart_complete", "true");
            }}
          />
        </div>
      )}
      
      {/* Navigation */}
      <Navbar 
        onNavigate={scrollToSection}
        onSignOut={signOut}
        userEmail={user?.email}
        credits={gems}
        isAdmin={isAdmin}
        subscriptionType={subscriptionType}
      />

      {/* Hero Section */}
      <Hero onExplore={scrollToTools} />

      {/* Tools Showcase Section - Visual-First Grid */}
      <section 
        ref={toolsRef}
        id="tools" 
        className="py-12 sm:py-24 lg:py-32 relative overflow-hidden scroll-mt-20"
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-charcoal to-background" />
        <div className="absolute top-0 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-br from-primary/8 to-transparent rounded-full blur-3xl" />
        <div className="hidden sm:block absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 noise-texture" />

        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${toolsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Section header */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-primary/10 border border-primary/25 mb-4 sm:mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">AI Tools</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-cream tracking-tight mb-2 sm:mb-3">
              Your Creative <span className="gradient-text">Arsenal</span>
            </h2>
            <p className="font-bangla text-sm sm:text-base text-cream/60 mb-3 sm:mb-4">
              আপনার সৃজনশীল অস্ত্রাগার
            </p>
            <p className="text-sm sm:text-base text-cream/50 max-w-xl mx-auto font-light">
              Tap any tool to start creating
            </p>
          </div>

          {/* Visual Tools Grid - Single column on mobile, 2-3-4 on larger */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {mergedTools.map((tool, index) => (
              <VisualToolCard
                key={tool.id}
                name={tool.name}
                icon={tool.icon}
                path={tool.path}
                gemCostKey={tool.gemCostKey}
                delay={index}
                previewImageUrl={tool.previewImageUrl}
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
      <CTASection onGetStarted={scrollToTools} />

      {/* Footer */}
      <Footer />

      {/* Floating WhatsApp Support - Only for signed-in users */}
      {user && <WhatsAppFloat isVisible={true} />}
    </div>
  );
};

export default Dashboard;
