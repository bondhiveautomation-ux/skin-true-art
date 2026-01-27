import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useContent } from "@/hooks/useSiteContent";
import { 
  Sparkles, 
  MessageCircle, 
  ArrowRight,
  Palette,
  Camera,
  Shield,
  Users,
  Target,
  RefreshCw,
  Zap,
  Award
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { content: homeContent } = useContent("home");
  const { content: headerContent } = useContent("header");
  const { content: footerContent } = useContent("footer");

  // Home page content with defaults
  const brandName = headerContent.brand_name || "BH Studio";
  const whatsappNumber = headerContent.whatsapp_number || "17059884080";
  const whatsappMessage = encodeURIComponent(homeContent.whatsapp_message || "Hi, I'd like to request access to BH Studio.");
  
  // Hero section
  const heroBadge = homeContent.hero_badge || "Private Access Platform";
  const heroHeadline1 = homeContent.hero_headline_1 || "Your Personal AI Studio for";
  const heroHeadline2 = homeContent.hero_headline_2 || "Beauty, Fashion & Content Creation";
  const heroSubheadline = homeContent.hero_subheadline || "One platform. Multiple professional AI studios — built for makeup artists, creators, and modern brands.";
  const heroCtaSignin = homeContent.hero_cta_signin || "Sign In";
  const heroCtaAccess = homeContent.hero_cta_access || "Request Access";
  const heroCtaLearnMore = homeContent.hero_cta_learn || "Learn How BH Studio Works";
  
  // Feature groups section
  const featuresBadge = homeContent.features_badge || "The Studio Collection";
  const featuresHeadline1 = homeContent.features_headline_1 || "Professional AI Tools,";
  const featuresHeadline2 = homeContent.features_headline_2 || "One Platform";
  const featuresSubheadline = homeContent.features_subheadline || "Everything you need to create stunning content, organized by workflow.";
  
  // Feature groups
  const featureGroups = [
    {
      title: homeContent.feature_group_1_title || "Identity & Character Control",
      description: homeContent.feature_group_1_desc || "Generate consistent character images and maintain visual identity across all content.",
      tools: (homeContent.feature_group_1_tools || "Character Generator, Pose Transfer, Face Swap").split(", ")
    },
    {
      title: homeContent.feature_group_2_title || "Fashion & Look Transformation",
      description: homeContent.feature_group_2_desc || "Transform outfits, apply professional makeup, and create stunning fashion content.",
      tools: (homeContent.feature_group_2_tools || "Dress Change, Makeup Studio, Dress Extractor").split(", ")
    },
    {
      title: homeContent.feature_group_3_title || "Professional Content Creation",
      description: homeContent.feature_group_3_desc || "Create DSLR-quality photos and cinematic visuals for your brand.",
      tools: (homeContent.feature_group_3_tools || "Photography Studio, Cinematic Studio, Background Saver").split(", ")
    },
    {
      title: homeContent.feature_group_4_title || "Branding & Marketing",
      description: homeContent.feature_group_4_desc || "Generate captions, apply branding, and extract prompts for consistent marketing.",
      tools: (homeContent.feature_group_4_tools || "Caption Studio, Branding Studio, Prompt Extractor").split(", ")
    }
  ];
  
  // Audiences section
  const audiencesBadge = homeContent.audiences_badge || "Built For Creators";
  const audiencesHeadline = homeContent.audiences_headline || "Who Uses";
  const audiences = [
    {
      icon: Palette,
      title: homeContent.audience_1_title || "Makeup Artists",
      benefit: homeContent.audience_1_benefit || "Showcase your artistry with AI-powered look transfers and character consistency."
    },
    {
      icon: Camera,
      title: homeContent.audience_2_title || "Fashion Creators",
      benefit: homeContent.audience_2_benefit || "Transform outfits and create stunning fashion content in seconds."
    },
    {
      icon: Shield,
      title: homeContent.audience_3_title || "Beauty Brands",
      benefit: homeContent.audience_3_benefit || "Maintain brand consistency across all visual content and campaigns."
    },
    {
      icon: Users,
      title: homeContent.audience_4_title || "Influencers",
      benefit: homeContent.audience_4_benefit || "Create professional-grade content that stands out in crowded feeds."
    }
  ];
  
  // Value pillars section
  const valueBadge = homeContent.value_badge || "Our Promise";
  const valueHeadline = homeContent.value_headline || "Why";
  const valuePillars = [
    {
      icon: Target,
      title: homeContent.value_1_title || "Precision",
      description: homeContent.value_1_desc || "Fine-tuned AI for accurate, high-quality results."
    },
    {
      icon: RefreshCw,
      title: homeContent.value_2_title || "Consistency",
      description: homeContent.value_2_desc || "Maintain identity across all generated content."
    },
    {
      icon: Zap,
      title: homeContent.value_3_title || "Creator-First",
      description: homeContent.value_3_desc || "Built for professional creative workflows."
    },
    {
      icon: Award,
      title: homeContent.value_4_title || "Professional Results",
      description: homeContent.value_4_desc || "Industry-standard output for commercial use."
    }
  ];
  
  // Footer content
  const footerBrandName = footerContent.brand_name || "BondHive";
  const footerTagline = footerContent.tagline || "Private access platform";
  const footerCopyright = (footerContent.copyright || "© {year} BondHive Studio. All rights reserved.")
    .replace("{year}", new Date().getFullYear().toString());

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-charcoal-deep relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-rose-gold/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gold/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 noise-texture" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 header-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg gold-icon flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-gold" />
              </div>
              <span className="font-serif text-lg sm:text-xl lg:text-2xl font-semibold text-cream tracking-tight">
                {brandName}
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <button
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                className="text-xs font-medium text-cream/60 hover:text-gold transition-colors duration-300 tracking-wide uppercase"
              >
                Features
              </button>
              <button
                onClick={() => navigate("/info")}
                className="text-xs font-medium text-cream/60 hover:text-gold transition-colors duration-300 tracking-wide uppercase"
              >
                Info
              </button>
              <Button
                onClick={() => navigate("/auth")}
                variant="ghost"
                className="text-sm font-medium text-cream/70 hover:text-gold hover:bg-gold/5"
              >
                {heroCtaSignin}
              </Button>
              <Button
                onClick={handleWhatsAppClick}
                variant="gold"
                size="sm"
                className="btn-glow"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {heroCtaAccess}
              </Button>
            </nav>

            {/* Mobile Nav */}
            <div className="flex md:hidden items-center gap-2">
              <Button
                onClick={() => navigate("/auth")}
                variant="ghost"
                size="sm"
                className="text-cream/70 hover:text-gold"
              >
                {heroCtaSignin}
              </Button>
              <Button
                onClick={handleWhatsAppClick}
                variant="gold"
                size="sm"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/25 mb-8 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">{heroBadge}</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-cream leading-[1.1] tracking-tight mb-3">
            {heroHeadline1}{" "}
            <span className="gradient-text">{heroHeadline2}</span>
          </h1>
          
          {/* Bangla subheading */}
          <p className="font-bangla text-base sm:text-lg text-cream/60 mb-6">
            সৌন্দর্য, ফ্যাশন ও কন্টেন্ট তৈরির জন্য আপনার ব্যক্তিগত AI স্টুডিও
          </p>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-cream/50 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            {heroSubheadline}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button
              onClick={() => navigate("/auth")}
              variant="gold"
              size="xl"
              className="btn-glow w-full sm:w-auto"
            >
              {heroCtaSignin}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={handleWhatsAppClick}
              variant="luxury"
              size="xl"
              className="w-full sm:w-auto"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {heroCtaAccess}
            </Button>
          </div>

          {/* Secondary CTA */}
          <button
            onClick={() => navigate("/info")}
            className="inline-flex items-center gap-2 text-sm text-gold/70 hover:text-gold transition-colors duration-300"
          >
            {heroCtaLearnMore}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Feature Overview Section */}
      <section id="features" className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-charcoal to-transparent" />
        
        <div className="relative max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/25 mb-6 backdrop-blur-sm">
              <span className="text-xs font-semibold text-gold uppercase tracking-widest">{featuresBadge}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-cream tracking-tight mb-2">
              {featuresHeadline1}{" "}
              <span className="gradient-text">{featuresHeadline2}</span>
            </h2>
            <p className="font-bangla text-sm sm:text-base text-cream/60 mb-4">
              পেশাদার AI টুলস, একটি প্ল্যাটফর্ম
            </p>
            <p className="text-base sm:text-lg text-cream/50 max-w-xl mx-auto font-light">
              {featuresSubheadline}
            </p>
          </div>

          {/* Feature Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {featureGroups.map((group, index) => {
              // Bangla translations for feature group titles
              const banglaTitles: Record<string, string> = {
                "Identity & Character Control": "পরিচয় ও চরিত্র নিয়ন্ত্রণ",
                "Fashion & Look Transformation": "ফ্যাশন ও লুক রূপান্তর",
                "Professional Content Creation": "পেশাদার কন্টেন্ট তৈরি",
                "Branding & Marketing": "ব্র্যান্ডিং ও মার্কেটিং"
              };
              const banglaTitle = banglaTitles[group.title] || "";
              
              return (
                <div
                  key={group.title}
                  className="group p-6 sm:p-8 rounded-2xl bg-card/30 border border-gold/10 backdrop-blur-sm hover:border-gold/25 transition-all duration-500"
                >
                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-cream mb-1 group-hover:text-gold transition-colors duration-300">
                    {group.title}
                  </h3>
                  {banglaTitle && (
                    <p className="font-bangla text-sm text-cream/60 mb-3">
                      {banglaTitle}
                    </p>
                  )}
                  <p className="text-sm text-cream/50 mb-5 leading-relaxed">
                    {group.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-3 py-1.5 text-xs font-medium text-gold/70 bg-gold/5 border border-gold/15 rounded-full"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/25 mb-6 backdrop-blur-sm">
              <span className="text-xs font-semibold text-gold uppercase tracking-widest">{audiencesBadge}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-cream tracking-tight mb-2">
              {audiencesHeadline} <span className="gradient-text">BH Studio</span>?
            </h2>
            <p className="font-bangla text-sm sm:text-base text-cream/60">
              ক্রিয়েটরদের জন্য তৈরি
            </p>
          </div>

          {/* Audience Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {audiences.map((audience) => (
              <div
                key={audience.title}
                className="group p-6 rounded-2xl bg-card/20 border border-gold/10 text-center hover:border-gold/25 transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-xl gold-icon flex items-center justify-center mx-auto mb-5 group-hover:shadow-gold transition-all duration-500">
                  <audience.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-cream mb-3 group-hover:text-gold transition-colors duration-300">
                  {audience.title}
                </h3>
                <p className="text-sm text-cream/50 leading-relaxed">
                  {audience.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why BondHive Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-charcoal-deep to-transparent" />
        
        <div className="relative max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/25 mb-6 backdrop-blur-sm">
              <span className="text-xs font-semibold text-gold uppercase tracking-widest">{valueBadge}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-cream tracking-tight mb-2">
              {valueHeadline} <span className="gradient-text">BH Studio</span>?
            </h2>
            <p className="font-bangla text-sm sm:text-base text-cream/60">
              আমাদের প্রতিশ্রুতি
            </p>
          </div>

          {/* Value Pillars */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {valuePillars.map((pillar) => (
              <div
                key={pillar.title}
                className="text-center group"
              >
                <div className="w-16 h-16 rounded-2xl gold-icon flex items-center justify-center mx-auto mb-5 group-hover:shadow-gold transition-all duration-500">
                  <pillar.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-cream mb-2 group-hover:text-gold transition-colors duration-300">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-cream/40 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 sm:py-16 border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo & Tagline */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg gold-icon flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                </div>
                <span className="font-serif text-lg font-semibold text-cream">
                  {footerBrandName}
                </span>
              </div>
              <p className="text-xs text-cream/40">
                {footerTagline}
              </p>
              <p className="font-bangla text-[10px] text-cream/50 mt-1">
                সৌন্দর্য ও কন্টেন্টের জন্য আপনার ব্যক্তিগত AI স্টুডিও
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <button
                onClick={handleWhatsAppClick}
                className="text-cream/40 hover:text-gold transition-colors duration-300 text-xs font-medium uppercase tracking-wider"
              >
                Contact via WhatsApp
              </button>
              <button
                onClick={() => navigate("/info")}
                className="text-cream/40 hover:text-gold transition-colors duration-300 text-xs font-medium uppercase tracking-wider"
              >
                Info
              </button>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-gold/10 text-center">
            <p className="text-[10px] text-cream/25 tracking-wider uppercase">
              {footerCopyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
