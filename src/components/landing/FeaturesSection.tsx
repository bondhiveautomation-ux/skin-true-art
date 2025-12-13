import { Sparkles, Image, FileText, Shirt, Users, Move, Palette, Layers } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    name: "Skin Texture Enhancement",
    description: "Enhance facial skin texture naturally while preserving realism. Smooth, refine, and balance details without over-editing."
  },
  {
    icon: Image,
    name: "Character-Consistent Image Generator",
    description: "Generate new images while keeping the exact same face and identity consistent across all outputs."
  },
  {
    icon: FileText,
    name: "Image Prompt Extractor",
    description: "Extract detailed AI prompts from any image to recreate, remix, or study styles with precision."
  },
  {
    icon: Shirt,
    name: "Dress-to-Dummy Extractor",
    description: "Isolate outfits cleanly from reference images for seamless reuse on different characters or poses."
  },
  {
    icon: Users,
    name: "Remove People, Keep Background",
    description: "Remove unwanted people while perfectly preserving the original background with AI accuracy."
  },
  {
    icon: Move,
    name: "Pose Transfer Studio",
    description: "Apply the pose from one image to another character while maintaining natural proportions and realism."
  },
  {
    icon: Palette,
    name: "Make Me Up – AI Makeup Studio",
    description: "Apply professional-grade makeup styles digitally—ideal for beauty creators and makeup artists."
  },
  {
    icon: Layers,
    name: "Full Look Transfer (Face Keep)",
    description: "Transfer the complete look—outfit, lighting, and style—while keeping the original face unchanged."
  }
];

interface FeaturesSectionProps {
  id: string;
}

export const FeaturesSection = ({ id }: FeaturesSectionProps) => {
  return (
    <section id={id} className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 section-animate">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight section-animate delay-1">
            Everything you need
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto section-animate delay-2">
            A complete suite of AI-powered tools designed for professional content creation.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {features.map((feature, index) => (
            <div 
              key={feature.name}
              className={`feature-card section-animate delay-${Math.min(index + 1, 8)}`}
            >
              <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-foreground/70" />
              </div>
              <h3 className="text-base font-medium text-foreground mb-2">
                {feature.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
