import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  MessageCircle, 
  ArrowRight,
  Image,
  Shirt,
  Users,
  Palette,
  Camera,
  Type,
  Shield,
  Film,
  Target,
  RefreshCw,
  Zap,
  Award
} from "lucide-react";

const WHATSAPP_NUMBER = "8801234567890"; // Replace with actual WhatsApp number
const WHATSAPP_MESSAGE = encodeURIComponent("Hi, I'd like to request access to Brandify.");

const FEATURE_GROUPS = [
  {
    title: "Identity & Character Control",
    description: "Generate consistent character images and maintain visual identity across all content.",
    tools: ["Character Generator", "Pose Transfer", "Face Swap"]
  },
  {
    title: "Fashion & Look Transformation",
    description: "Transform outfits, apply professional makeup, and create stunning fashion content.",
    tools: ["Dress Change", "Makeup Studio", "Full Look Transfer", "Dress Extractor"]
  },
  {
    title: "Professional Content Creation",
    description: "Create DSLR-quality photos and cinematic visuals for your brand.",
    tools: ["Photography Studio", "Cinematic Studio", "Background Saver"]
  },
  {
    title: "Branding & Marketing",
    description: "Generate captions, apply branding, and extract prompts for consistent marketing.",
    tools: ["Caption Studio", "Branding Studio", "Prompt Extractor"]
  }
];

const AUDIENCES = [
  {
    icon: Palette,
    title: "Makeup Artists",
    benefit: "Showcase your artistry with AI-powered look transfers and character consistency."
  },
  {
    icon: Camera,
    title: "Fashion Creators",
    benefit: "Transform outfits and create stunning fashion content in seconds."
  },
  {
    icon: Shield,
    title: "Beauty Brands",
    benefit: "Maintain brand consistency across all visual content and campaigns."
  },
  {
    icon: Users,
    title: "Influencers",
    benefit: "Create professional-grade content that stands out in crowded feeds."
  }
];

const VALUE_PILLARS = [
  {
    icon: Target,
    title: "Precision",
    description: "Fine-tuned AI for accurate, high-quality results."
  },
  {
    icon: RefreshCw,
    title: "Consistency",
    description: "Maintain identity across all generated content."
  },
  {
    icon: Zap,
    title: "Creator-First",
    description: "Built for professional creative workflows."
  },
  {
    icon: Award,
    title: "Professional Results",
    description: "Industry-standard output for commercial use."
  }
];

const Home = () => {
  const navigate = useNavigate();

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`, "_blank");
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
                Brandify
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
                Sign In
              </Button>
              <Button
                onClick={handleWhatsAppClick}
                variant="gold"
                size="sm"
                className="btn-glow"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Request Access
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
                Sign In
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
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">Private Access Platform</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-cream leading-[1.1] tracking-tight mb-6">
            Your Personal AI Studio for{" "}
            <span className="gradient-text">Beauty, Fashion & Content Creation</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-cream/50 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            One platform. Multiple professional AI studios — built for makeup artists, creators, and modern brands.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button
              onClick={() => navigate("/auth")}
              variant="gold"
              size="xl"
              className="btn-glow w-full sm:w-auto"
            >
              Sign In
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={handleWhatsAppClick}
              variant="luxury"
              size="xl"
              className="w-full sm:w-auto"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Request Access
            </Button>
          </div>

          {/* Secondary CTA */}
          <button
            onClick={() => navigate("/info")}
            className="inline-flex items-center gap-2 text-sm text-gold/70 hover:text-gold transition-colors duration-300"
          >
            Learn How Brandify Works
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
              <span className="text-xs font-semibold text-gold uppercase tracking-widest">The Studio Collection</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-cream tracking-tight mb-4">
              Professional AI Tools,{" "}
              <span className="gradient-text">One Platform</span>
            </h2>
            <p className="text-base sm:text-lg text-cream/50 max-w-xl mx-auto font-light">
              Everything you need to create stunning content, organized by workflow.
            </p>
          </div>

          {/* Feature Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {FEATURE_GROUPS.map((group, index) => (
              <div
                key={group.title}
                className="group p-6 sm:p-8 rounded-2xl bg-card/30 border border-gold/10 backdrop-blur-sm hover:border-gold/25 transition-all duration-500"
              >
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-cream mb-3 group-hover:text-gold transition-colors duration-300">
                  {group.title}
                </h3>
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
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/25 mb-6 backdrop-blur-sm">
              <span className="text-xs font-semibold text-gold uppercase tracking-widest">Built For Creators</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-cream tracking-tight">
              Who Uses <span className="gradient-text">Brandify</span>
            </h2>
          </div>

          {/* Audience Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AUDIENCES.map((audience) => (
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

      {/* Why Brandify Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-charcoal-deep to-transparent" />
        
        <div className="relative max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/25 mb-6 backdrop-blur-sm">
              <span className="text-xs font-semibold text-gold uppercase tracking-widest">Our Promise</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-cream tracking-tight">
              Why <span className="gradient-text">Brandify</span>
            </h2>
          </div>

          {/* Value Pillars */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {VALUE_PILLARS.map((pillar) => (
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
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg gold-icon flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                </div>
                <span className="font-serif text-lg font-semibold text-cream">
                  Brandify
                </span>
              </div>
              <p className="text-xs text-cream/40">
                Private access platform
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
              © {new Date().getFullYear()} Brandify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
