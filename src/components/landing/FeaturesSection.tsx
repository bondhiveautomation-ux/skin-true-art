import { Sparkles, Image, FileText, Shirt, Users, Move, Palette, Layers, Repeat } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    name: "Skin Texture Enhancement",
    description: "Enhance facial skin texture naturally while preserving realism. Smooth, refine, and balance details without over-editing.",
    sectionId: "skin-enhancement"
  },
  {
    icon: Image,
    name: "Character-Consistent Image Generator",
    description: "Generate new images while keeping the exact same face and identity consistent across all outputs.",
    sectionId: "character-generator"
  },
  {
    icon: FileText,
    name: "Image Prompt Extractor",
    description: "Extract detailed AI prompts from any image to recreate, remix, or study styles with precision.",
    sectionId: "prompt-extractor"
  },
  {
    icon: Shirt,
    name: "Dress-to-Dummy Extractor",
    description: "Isolate outfits cleanly from reference images for seamless reuse on different characters or poses.",
    sectionId: "dress-extractor"
  },
  {
    icon: Users,
    name: "Remove People, Keep Background",
    description: "Remove unwanted people while perfectly preserving the original background with AI accuracy.",
    sectionId: "background-saver"
  },
  {
    icon: Move,
    name: "Pose Transfer Studio",
    description: "Apply the pose from one image to another character while maintaining natural proportions and realism.",
    sectionId: "pose-transfer"
  },
  {
    icon: Palette,
    name: "Make Me Up – AI Makeup Studio",
    description: "Apply professional-grade makeup styles digitally—ideal for beauty creators and makeup artists.",
    sectionId: "makeup-studio"
  },
  {
    icon: Layers,
    name: "Full Look Transfer (Face Keep)",
    description: "Transfer the complete look—outfit, lighting, and style—while keeping the original face unchanged.",
    sectionId: "full-look-transfer"
  },
  {
    icon: Repeat,
    name: "Dress Change Studio",
    description: "Try on outfits from our curated library while keeping your face and pose 100% unchanged.",
    sectionId: "dress-change-studio",
    featured: true
  }
];

interface FeaturesSectionProps {
  id: string;
  onFeatureClick?: (sectionId: string) => void;
}

export const FeaturesSection = ({ id, onFeatureClick }: FeaturesSectionProps) => {
  const handleCardClick = (sectionId: string) => {
    if (onFeatureClick) {
      onFeatureClick(sectionId);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section id={id} className="py-28 lg:py-36 relative overflow-hidden">
      {/* Dark background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-charcoal to-background" />
      
      {/* Accent gradients */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-gold/5 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-rose-gold/3 to-transparent blur-3xl" />
      
      {/* Noise texture */}
      <div className="absolute inset-0 noise-texture" />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-20 lg:mb-24">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 border border-gold/25 mb-8 section-animate backdrop-blur-sm">
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">The Collection</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-cream tracking-tight section-animate delay-1">
            AI-Powered
            <br />
            <span className="gradient-text">Creative Tools</span>
          </h2>
          <p className="mt-8 text-lg text-cream/50 max-w-2xl mx-auto section-animate delay-2 leading-relaxed font-light">
            A curated suite of professional tools designed for beauty artists, influencers, and fashion brands.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <button 
              key={feature.name}
              onClick={() => handleCardClick(feature.sectionId)}
              className={`group feature-card glow-outline section-animate delay-${Math.min(index + 1, 9)} text-left cursor-pointer ${
                feature.featured ? 'lg:col-span-1 border-gold/20' : ''
              }`}
            >
              {/* Icon container with gold accent */}
              <div className="w-14 h-14 rounded-xl gold-icon flex items-center justify-center mb-6 group-hover:shadow-gold transition-all duration-500">
                <feature.icon className="w-6 h-6 text-gold" />
              </div>
              
              {/* Feature name */}
              <h3 className="font-serif text-xl font-semibold text-cream mb-4 group-hover:text-gold transition-colors duration-300">
                {feature.name}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-cream/50 leading-relaxed font-light">
                {feature.description}
              </p>

              {/* Hover indicator */}
              <div className="mt-6 flex items-center gap-2 text-gold opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Explore</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>

              {/* Featured badge */}
              {feature.featured && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gold/20 border border-gold/30">
                  <span className="text-xs font-semibold text-gold uppercase tracking-wider">Featured</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
