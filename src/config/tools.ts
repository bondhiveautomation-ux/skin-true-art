import { 
  Image, 
  FileText, 
  Shirt, 
  Users, 
  Move, 
  Palette, 
  Layers, 
  Film, 
  Camera, 
  Type, 
  Wand2,
  Sparkles
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface ToolConfig {
  id: string;
  name: string;
  shortName: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  path: string;
  gemCostKey: string;
  gradient: string;
  badge?: string;
}

export const TOOLS: ToolConfig[] = [
  {
    id: "character-generator",
    name: "Character Generator",
    shortName: "Character",
    description: "Generate new images while keeping your character's face and identity perfectly consistent.",
    longDescription: "Create stunning, character-consistent images with AI. Upload a reference photo and generate new scenarios, outfits, and backgrounds while maintaining 100% identity consistency.",
    icon: Image,
    path: "/tools/character-generator",
    gemCostKey: "generate-character-image",
    gradient: "bg-gradient-to-br from-purple-500/10 to-pink-500/5",
    badge: "AI Identity",
  },
  {
    id: "prompt-extractor",
    name: "Prompt Extractor",
    shortName: "Prompt",
    description: "Extract detailed AI prompts from any image to recreate similar visuals.",
    longDescription: "Analyze any image in extreme detail and extract a comprehensive AI prompt. Perfect for understanding how to recreate specific styles, compositions, and aesthetics.",
    icon: FileText,
    path: "/tools/prompt-extractor",
    gemCostKey: "extract-image-prompt",
    gradient: "bg-gradient-to-br from-blue-500/10 to-cyan-500/5",
    badge: "Quick Tool",
  },
  {
    id: "dress-extractor",
    name: "Dress Extractor",
    shortName: "Dress",
    description: "Isolate outfits from photos and display them on professional mannequins.",
    longDescription: "Extract garments from any photo and place them on elegant mannequins with premium backgrounds. Perfect for e-commerce product displays and fashion catalogs.",
    icon: Shirt,
    path: "/tools/dress-extractor",
    gemCostKey: "extract-dress-to-dummy",
    gradient: "bg-gradient-to-br from-rose-500/10 to-orange-500/5",
    badge: "E-Commerce",
  },
  {
    id: "background-saver",
    name: "Background Saver",
    shortName: "Background",
    description: "Remove unwanted people from photos while preserving the background perfectly.",
    longDescription: "Intelligently remove people from your photos while keeping the background intact and natural. Ideal for real estate, travel, and product photography.",
    icon: Users,
    path: "/tools/background-saver",
    gemCostKey: "remove-people-from-image",
    gradient: "bg-gradient-to-br from-green-500/10 to-emerald-500/5",
    badge: "Cleanup",
  },
  {
    id: "pose-transfer",
    name: "Pose Transfer",
    shortName: "Pose",
    description: "Transfer poses from reference images while keeping your character's identity.",
    longDescription: "Apply any pose from a reference image onto your character while preserving their face, body, outfit, and style. Create dynamic content without photoshoots.",
    icon: Move,
    path: "/tools/pose-transfer",
    gemCostKey: "pose-transfer",
    gradient: "bg-gradient-to-br from-amber-500/10 to-yellow-500/5",
    badge: "High-Impact",
  },
  {
    id: "makeup-studio",
    name: "Makeup Studio",
    shortName: "Makeup",
    description: "Apply professional makeup styles to portraits with AI precision.",
    longDescription: "Transform any portrait with professional-grade makeup styles. Choose from curated presets or customize looks while maintaining natural skin texture.",
    icon: Palette,
    path: "/tools/makeup-studio",
    gemCostKey: "apply-makeup",
    gradient: "bg-gradient-to-br from-pink-500/10 to-rose-500/5",
    badge: "Beauty",
  },
  {
    id: "face-swap",
    name: "Face Swap Studio",
    shortName: "Swap",
    description: "Seamlessly swap faces between images with professional quality.",
    longDescription: "Transfer faces between photos with AI precision. Perfect for content creation, marketing visuals, and creative projects.",
    icon: Layers,
    path: "/tools/face-swap",
    gemCostKey: "face-swap",
    gradient: "bg-gradient-to-br from-indigo-500/10 to-purple-500/5",
    badge: "High-Impact",
  },
  {
    id: "cinematic-studio",
    name: "Cinematic Studio",
    shortName: "Cinematic",
    description: "Transform photos into stunning cinematic shots with one click.",
    longDescription: "Apply professional cinematic styles and backgrounds to your photos. Perfect for bridal photography, fashion shoots, and editorial content.",
    icon: Film,
    path: "/tools/cinematic-studio",
    gemCostKey: "cinematic-transform",
    gradient: "bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5",
    badge: "Editorial",
  },
  {
    id: "background-creator",
    name: "Background Creator",
    shortName: "BG Create",
    description: "Generate beautiful AI backgrounds for your product photography.",
    longDescription: "Create stunning, professional backgrounds using AI. Choose from curated presets or describe your ideal backdrop for product and portrait photography.",
    icon: Wand2,
    path: "/tools/background-creator",
    gemCostKey: "generate-background",
    gradient: "bg-gradient-to-br from-teal-500/10 to-cyan-500/5",
    badge: "Creative",
  },
  {
    id: "photography-studio",
    name: "Photography Studio",
    shortName: "Photo",
    description: "Transform raw photos into DSLR-quality professional images.",
    longDescription: "Enhance your photos to ultra-HD DSLR quality with AI. Automatic fixes for angle, framing, lighting, and composition while preserving identity.",
    icon: Camera,
    path: "/tools/photography-studio",
    gemCostKey: "enhance-photo",
    gradient: "bg-gradient-to-br from-sky-500/10 to-blue-500/5",
    badge: "Studio",
  },
  {
    id: "caption-studio",
    name: "Caption Studio",
    shortName: "Caption",
    description: "Generate high-converting product captions in Bangla or English.",
    longDescription: "Create CTA-ready product captions with AI. Customize language, tone, length, and emoji style for your perfect social media content.",
    icon: Type,
    path: "/tools/caption-studio",
    gemCostKey: "generate-caption",
    gradient: "bg-gradient-to-br from-orange-500/10 to-red-500/5",
    badge: "Quick Tool",
  },
  {
    id: "branding-studio",
    name: "Branding Studio",
    shortName: "Brand",
    description: "Apply logos and watermarks professionally to protect your content.",
    longDescription: "Add professional branding to your images. Control logo position, transparency, and style with batch processing support.",
    icon: Sparkles,
    path: "/tools/branding-studio",
    gemCostKey: "apply-branding",
    gradient: "bg-gradient-to-br from-fuchsia-500/10 to-pink-500/5",
    badge: "Protect",
  },
];

export const getToolByPath = (path: string): ToolConfig | undefined => {
  return TOOLS.find(tool => tool.path === path || tool.path.endsWith(path.replace('/tools/', '')));
};

export const getToolById = (id: string): ToolConfig | undefined => {
  return TOOLS.find(tool => tool.id === id);
};
