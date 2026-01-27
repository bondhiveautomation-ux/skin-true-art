import { Image, FileText, Shirt, Users, Move, Palette, Layers, Type, Camera, Shield, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useContent, useFeatureContent } from "@/hooks/useSiteContent";

const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  feature_2: Image,
  feature_3: FileText,
  feature_4: Shirt,
  feature_5: Users,
  feature_6: Move,
  feature_7: Palette,
  feature_8: Layers,
  
  feature_10: Type,
  feature_11: Camera,
  feature_12: Shield,
  feature_13: Film,
};

const featureSectionIds: Record<string, string> = {
  feature_2: "character-generator",
  feature_3: "prompt-extractor",
  feature_4: "dress-extractor",
  feature_5: "background-saver",
  feature_6: "pose-transfer",
  feature_7: "makeup-studio",
  
  feature_10: "/caption-studio",
  feature_11: "/photography-studio",
  feature_12: "/branding-studio",
  feature_13: "cinematic-studio",
};

interface FeaturesSectionProps {
  id: string;
  onFeatureClick?: (sectionId: string) => void;
}

export const FeaturesSection = ({ id, onFeatureClick }: FeaturesSectionProps) => {
  const navigate = useNavigate();
  const { content: sectionContent } = useContent("features");
  const { features } = useFeatureContent();
  
  // Check if section is visible
  const isVisible = sectionContent.section_visible !== "false";
  if (!isVisible) return null;

  // Section header defaults
  const badgeText = sectionContent.badge_text || "The Collection";
  const headline1 = sectionContent.headline_1 || "AI-Powered";
  const headline2 = sectionContent.headline_2 || "Creative Tools";
  const subheadline = sectionContent.subheadline || "A curated suite of professional tools designed for beauty artists, influencers, and fashion brands.";

  const handleCardClick = (sectionId: string) => {
    // If it's a route (starts with /), navigate to it
    if (sectionId.startsWith('/')) {
      navigate(sectionId);
      return;
    }
    
    if (onFeatureClick) {
      onFeatureClick(sectionId);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Build feature list from database content
  const featureList = Object.entries(featureSectionIds).map(([key, sectionId]) => {
    const featureData = features[key] || {};
    const Icon = featureIcons[key];
    const isFeatureVisible = featureData.visible !== "false";
    const isFeatured = featureData.featured === "true";
    
    return {
      key,
      icon: Icon,
      name: featureData.name || key.replace("_", " "),
      description: featureData.description || "",
      sectionId,
      visible: isFeatureVisible,
      featured: isFeatured,
    };
  }).filter(f => f.visible);

  return (
    <section id={id} className="py-16 sm:py-28 lg:py-36 relative overflow-hidden">
      {/* Dark background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-charcoal to-background" />
      
      {/* Accent gradients - reduced on mobile */}
      <div className="hidden sm:block absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-gold/5 to-transparent blur-3xl" />
      <div className="hidden sm:block absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-rose-gold/3 to-transparent blur-3xl" />
      
      {/* Noise texture */}
      <div className="absolute inset-0 noise-texture" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-20 lg:mb-24">
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gold/10 border border-gold/25 mb-6 sm:mb-8 section-animate backdrop-blur-sm">
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">{badgeText}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-cream tracking-tight section-animate delay-1">
            {headline1}
            <br />
            <span className="gradient-text">{headline2}</span>
          </h2>
          <p className="font-bangla text-sm sm:text-base text-cream/60 mt-2 section-animate delay-1">
            AI-চালিত সৃজনশীল টুলস
          </p>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-cream/50 max-w-2xl mx-auto section-animate delay-2 leading-relaxed font-light px-2">
            {subheadline}
          </p>
        </div>

        {/* Feature grid - 2 columns on mobile, 3 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {featureList.map((feature, index) => (
            <button 
              key={feature.key}
              onClick={() => handleCardClick(feature.sectionId)}
              className={`group feature-card glow-outline section-animate delay-${Math.min(index + 1, 9)} text-left cursor-pointer rounded-xl sm:rounded-2xl p-4 sm:p-6 active:scale-[0.98] transition-transform ${
                feature.featured ? 'lg:col-span-1 border-gold/20' : ''
              }`}
            >
              {/* Icon container with gold accent */}
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl gold-icon flex items-center justify-center mb-3 sm:mb-6 group-hover:shadow-gold transition-all duration-500">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
              </div>
              
              {/* Feature name */}
              <h3 className="font-serif text-sm sm:text-xl font-semibold text-cream mb-2 sm:mb-4 group-hover:text-gold transition-colors duration-300 line-clamp-2">
                {feature.name}
              </h3>
              
              {/* Description - hidden on small mobile */}
              <p className="hidden sm:block text-sm text-cream/50 leading-relaxed font-light">
                {feature.description}
              </p>

              {/* Hover indicator - desktop only */}
              <div className="hidden sm:flex mt-6 items-center gap-2 text-gold opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Explore</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>

              {/* Featured badge */}
              {feature.featured && (
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gold/20 border border-gold/30">
                  <span className="text-[10px] sm:text-xs font-semibold text-gold uppercase tracking-wider">Featured</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
