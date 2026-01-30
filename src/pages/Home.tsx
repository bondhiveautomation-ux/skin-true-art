import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { SocialProofStrip } from "@/components/landing/SocialProofStrip";
import { AudienceSection } from "@/components/landing/AudienceSection";
import { FeaturesGridSection } from "@/components/landing/FeaturesGridSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { WhyBHStudioSection } from "@/components/landing/WhyBHStudioSection";
import { ExamplesSection } from "@/components/landing/ExamplesSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

const Home = () => {
  return (
    <div className="min-h-screen bg-charcoal-deep relative overflow-hidden">
      {/* Animated background blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-rose-gold/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gold/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 noise-texture" />
      </div>

      {/* Navigation */}
      <LandingNavbar />

      {/* 1) Hero Section */}
      <LandingHero />

      {/* 2) Social Proof Strip */}
      <SocialProofStrip />

      {/* 3) Who Is This For? */}
      <AudienceSection />

      {/* 4) What You Can Do Inside */}
      <FeaturesGridSection />

      {/* 5) How It Works */}
      <HowItWorksSection />

      {/* 6) Why BH Studio */}
      <WhyBHStudioSection />

      {/* 7) Examples Section */}
      <ExamplesSection />

      {/* 8) FAQ Section */}
      <FAQSection />

      {/* 9) Final CTA Section */}
      <FinalCTASection />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default Home;
