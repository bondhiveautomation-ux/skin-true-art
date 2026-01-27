import { useNavigate } from "react-router-dom";
import { LucideIcon, Diamond } from "lucide-react";
import { getGemCost } from "@/lib/gemCosts";
import { cn } from "@/lib/utils";

// Default fallback preview images
const DEFAULT_PREVIEWS: Record<string, string> = {
  "Character Generator": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop",
  "Prompt Extractor": "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=400&h=500&fit=crop",
  "Dress Extractor": "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=500&fit=crop",
  "Background Saver": "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&h=500&fit=crop",
  "Pose Transfer": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
  "Makeup Studio": "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=400&h=500&fit=crop",
  "Face Swap Studio": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
  "Cinematic Studio": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=500&fit=crop",
  "Background Creator": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=500&fit=crop",
  "Photography Studio": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop",
  "Caption Studio": "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=500&fit=crop",
  "Branding Studio": "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=500&fit=crop",
  "AI Prompt Engineer": "https://images.unsplash.com/photo-1676299081847-824916de030a?w=400&h=500&fit=crop",
};

// Bangla tool names
const BANGLA_NAMES: Record<string, string> = {
  "Character Generator": "ক্যারেক্টার জেনারেটর",
  "Prompt Extractor": "প্রম্পট এক্সট্র্যাক্টর",
  "Dress Extractor": "ড্রেস এক্সট্র্যাক্টর",
  "Background Saver": "ব্যাকগ্রাউন্ড সেভার",
  "Pose Transfer": "পোজ ট্রান্সফার",
  "Makeup Studio": "মেকআপ স্টুডিও",
  "Face Swap Studio": "ফেস সোয়াপ স্টুডিও",
  "Cinematic Studio": "সিনেমাটিক স্টুডিও",
  "Background Creator": "ব্যাকগ্রাউন্ড ক্রিয়েটর",
  "Photography Studio": "ফটোগ্রাফি স্টুডিও",
  "Caption Studio": "ক্যাপশন স্টুডিও",
  "Branding Studio": "ব্র্যান্ডিং স্টুডিও",
  "AI Prompt Engineer": "AI প্রম্পট ইঞ্জিনিয়ার",
};

interface VisualToolCardProps {
  name: string;
  icon: LucideIcon;
  path: string;
  gemCostKey: string;
  delay?: number;
  previewImageUrl?: string | null;
}

export const VisualToolCard = ({
  name,
  icon: Icon,
  path,
  gemCostKey,
  delay = 0,
  previewImageUrl,
}: VisualToolCardProps) => {
  const navigate = useNavigate();
  const banglaName = BANGLA_NAMES[name] || name;
  const gemCost = getGemCost(gemCostKey);
  
  // Use database image if provided, otherwise fall back to defaults
  const imageUrl = previewImageUrl || DEFAULT_PREVIEWS[name] || "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop";

  return (
    <button
      onClick={() => navigate(path)}
      className={cn(
        "group relative overflow-hidden rounded-2xl sm:rounded-3xl",
        "border border-border/30 bg-card/20 backdrop-blur-sm",
        "transition-all duration-300 ease-out",
        "hover:scale-[1.04] hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10",
        "active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "min-h-[220px] sm:min-h-[280px] w-full"
      )}
      style={{ animationDelay: `${delay * 60}ms` }}
    >
      {/* Visual Preview Area */}
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      {/* Gem Cost Badge - Fixed top-right */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-primary/30">
        <Diamond className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-cream">{gemCost}</span>
      </div>

      {/* Tool Icon - Top left for visual identity */}
      <div className="absolute top-3 left-3 z-20">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
          <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-primary" />
        </div>
      </div>

      {/* Tool Name - Bottom centered */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-5 text-center">
        <h3 className="font-serif text-base sm:text-lg font-bold text-cream tracking-tight mb-0.5 group-hover:text-primary transition-colors duration-300">
          {name}
        </h3>
        <p className="font-bangla text-xs sm:text-sm text-cream/60">
          {banglaName}
        </p>
      </div>

      {/* Hover indicator - Arrow */}
      <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
        <div className="w-8 h-8 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 flex items-center justify-center">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </button>
  );
};
