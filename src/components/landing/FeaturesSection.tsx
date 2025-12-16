import { Sparkles, Image, FileText, Shirt, Users, Move, Palette, Layers } from "lucide-react";

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
    <section id={id} className="py-24 lg:py-32 relative">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-cream/30 to-background" />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/5 border border-gold/20 mb-6 section-animate">
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">Our Suite</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal tracking-tight section-animate delay-1">
            Professional Tools for
            <br />
            <span className="gradient-text">Exceptional Results</span>
          </h2>
          <p className="mt-6 text-lg text-charcoal-muted max-w-2xl mx-auto section-animate delay-2 leading-relaxed">
            A curated collection of AI-powered tools designed for beauty professionals and content creators.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <button 
              key={feature.name}
              onClick={() => handleCardClick(feature.sectionId)}
              className={`group feature-card section-animate delay-${Math.min(index + 1, 8)} text-left cursor-pointer`}
            >
              {/* Icon container with gold accent */}
              <div className="w-12 h-12 rounded-xl gold-icon flex items-center justify-center mb-5 group-hover:shadow-gold transition-all duration-300">
                <feature.icon className="w-5 h-5 text-gold" />
              </div>
              
              {/* Feature name */}
              <h3 className="font-serif text-lg font-semibold text-charcoal mb-3 group-hover:text-gold transition-colors duration-300">
                {feature.name}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-charcoal-muted leading-relaxed">
                {feature.description}
              </p>

              {/* Hover indicator */}
              <div className="mt-5 flex items-center gap-2 text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs font-semibold uppercase tracking-wider">Explore</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};