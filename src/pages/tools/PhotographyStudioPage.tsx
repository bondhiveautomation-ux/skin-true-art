import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Download, RefreshCw, Diamond, Sparkles, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { getGemCost } from "@/lib/gemCosts";
import { getToolById } from "@/config/tools";

type PhotoType = "product" | "portrait" | "lifestyle";
type StylePreset = "clean_studio" | "luxury_brand" | "soft_natural" | "dark_premium" | "ecommerce_white" | "royal_monochrome" | "instagram_editorial";
type BackgroundOption = "keep_original" | "clean_studio" | "premium_lifestyle" | "royal_bridal_chamber" | "garden_pavilion" | "palace_corridor";
type SkinFinishIntensity = "light" | "medium" | "pro";

const PhotographyStudioPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { deductGems, hasEnoughGems } = useGems();
  const { toast } = useToast();
  const tool = getToolById("photography-studio")!;
  const comparisonRef = useRef<HTMLDivElement>(null);

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [photoType, setPhotoType] = useState<PhotoType>("portrait");
  const [stylePreset, setStylePreset] = useState<StylePreset>("clean_studio");
  const [backgroundOption, setBackgroundOption] = useState<BackgroundOption>("keep_original");
  const [aiPhotographerMode, setAiPhotographerMode] = useState(true);
  const [skinFinishEnabled, setSkinFinishEnabled] = useState(false);
  const [skinFinishIntensity, setSkinFinishIntensity] = useState<SkinFinishIntensity>("medium");
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setEnhancedImage(null);
      setSliderPosition(50);
      setZoomLevel(1);
    };
    reader.readAsDataURL(file);
  };

  const handleEnhance = async () => {
    if (!originalImage) {
      toast({ title: "No image", description: "Please upload an image first", variant: "destructive" });
      return;
    }
    if (!hasEnoughGems("enhance-photo")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("enhance-photo")} gems for this feature`, variant: "destructive" });
      return;
    }

    setIsEnhancing(true);
    setEnhancedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("enhance-photo", {
        body: {
          image: originalImage,
          photoType,
          stylePreset,
          backgroundOption,
          outputQuality: "ultra_hd",
          aiPhotographerMode,
          skinFinishEnabled: photoType !== "product" && skinFinishEnabled,
          skinFinishIntensity: photoType !== "product" && skinFinishEnabled ? skinFinishIntensity : undefined,
          userId: user?.id,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "Enhancement failed", description: data.error, variant: "destructive" });
        return;
      }

      if (data?.enhancedImage) {
        const charge = await deductGems("enhance-photo");
        if (!charge.success) {
          toast({ title: "Couldn't charge gems", description: "Please try again.", variant: "destructive" });
          return;
        }
        setEnhancedImage(data.enhancedImage);
        toast({ title: "Photo enhanced!", description: "Your professional-quality image is ready" });
      }
    } catch (error: any) {
      toast({ title: "Enhancement failed", description: error.message, variant: "destructive" });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleDownload = () => {
    if (!enhancedImage) return;
    const link = document.createElement('a');
    link.href = enhancedImage;
    link.download = 'enhanced-photo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setEnhancedImage(null);
    setSliderPosition(50);
    setZoomLevel(1);
  };

  const handleCompareMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !comparisonRef.current) return;
    const rect = comparisonRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !comparisonRef.current) return;
    const rect = comparisonRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const photoTypes = [
    { value: "product", label: "Product", emoji: "📦" },
    { value: "portrait", label: "Portrait", emoji: "👤" },
    { value: "lifestyle", label: "Lifestyle", emoji: "✨" },
  ];

  const stylePresets = [
    { value: "clean_studio", label: "Clean Studio" },
    { value: "luxury_brand", label: "Couture Mood" },
    { value: "soft_natural", label: "Soft Natural" },
    { value: "dark_premium", label: "Dark Premium" },
    { value: "ecommerce_white", label: "E-commerce" },
    { value: "royal_monochrome", label: "Silver Screen" },
    { value: "instagram_editorial", label: "Instagram" },
  ];

  const backgroundOptions = [
    { value: "keep_original", label: "Keep Original" },
    { value: "clean_studio", label: "Clean Studio" },
    { value: "premium_lifestyle", label: "Premium Lifestyle" },
    { value: "royal_bridal_chamber", label: "Royal Bridal" },
    { value: "garden_pavilion", label: "Garden Pavilion" },
    { value: "palace_corridor", label: "Palace Corridor" },
  ];

  return (
    <ToolPageLayout
      toolId={tool.id}
      toolName={tool.name}
      toolDescription={tool.longDescription}
      gemCostKey={tool.gemCostKey}
      icon={tool.icon}
      badge={tool.badge}
    >
      <div className="space-y-8">
        {/* AI Photographer Mode Toggle */}
        <div className="flex items-center justify-center gap-4 py-4 px-6 rounded-xl bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5 border border-gold/20">
          <Sparkles className="w-5 h-5 text-gold" />
          <div className="flex items-center gap-3">
            <Switch
              id="ai-mode"
              checked={aiPhotographerMode}
              onCheckedChange={setAiPhotographerMode}
              className="data-[state=checked]:bg-gold"
            />
            <Label htmlFor="ai-mode" className="text-sm text-cream cursor-pointer">
              <span className="font-medium">AI Photographer Mode</span>
              <span className="text-cream/50 ml-2">(Auto-optimize everything)</span>
            </Label>
          </div>
        </div>

        {/* Upload Section */}
        <div className="max-w-md mx-auto">
          <ImageUploader
            id="photo-upload"
            image={originalImage}
            onUpload={handleImageUpload}
            onRemove={handleReset}
            label="Upload Your Photo"
            description="Product photos, creator shots, or lifestyle images"
          />
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Photo Type */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-cream">Photo Type</label>
            <div className="grid grid-cols-3 gap-2">
              {photoTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setPhotoType(type.value as PhotoType);
                    if (type.value === "product") setSkinFinishEnabled(false);
                  }}
                  className={`py-3 px-2 rounded-xl border text-center transition-all duration-300 ${
                    photoType === type.value
                      ? "border-gold/50 bg-gold/10 shadow-gold"
                      : "border-gold/15 bg-charcoal-light hover:border-gold/30"
                  }`}
                >
                  <span className="block text-lg mb-1">{type.emoji}</span>
                  <span className={`block text-xs font-medium ${photoType === type.value ? "text-gold" : "text-cream/70"}`}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Style Preset */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-cream">Style Preset</label>
            <div className="grid grid-cols-2 gap-2">
              {stylePresets.slice(0, 4).map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setStylePreset(preset.value as StylePreset)}
                  className={`py-2 px-2 rounded-lg border text-center transition-all duration-300 ${
                    stylePreset === preset.value
                      ? "border-gold/50 bg-gold/10 shadow-gold"
                      : "border-gold/15 bg-charcoal-light hover:border-gold/30"
                  }`}
                >
                  <span className={`block text-xs font-medium ${stylePreset === preset.value ? "text-gold" : "text-cream/70"}`}>
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Background Option */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-cream">Background</label>
            <div className="grid grid-cols-2 gap-2">
              {backgroundOptions.slice(0, 4).map((bg) => (
                <button
                  key={bg.value}
                  onClick={() => setBackgroundOption(bg.value as BackgroundOption)}
                  className={`py-2 px-2 rounded-lg border text-center transition-all duration-300 ${
                    backgroundOption === bg.value
                      ? "border-gold/50 bg-gold/10 shadow-gold"
                      : "border-gold/15 bg-charcoal-light hover:border-gold/30"
                  }`}
                >
                  <span className={`block text-xs font-medium ${backgroundOption === bg.value ? "text-gold" : "text-cream/70"}`}>
                    {bg.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skin Finish (Portrait/Lifestyle only) */}
        {photoType !== "product" && (
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-gold/10">
              <div>
                <Label className="text-sm font-medium text-cream">Skin Finish</Label>
                <p className="text-xs text-cream/50">Frequency separation for natural skin</p>
              </div>
              <Switch
                checked={skinFinishEnabled}
                onCheckedChange={setSkinFinishEnabled}
                className="data-[state=checked]:bg-gold"
              />
            </div>
            {skinFinishEnabled && (
              <div className="flex gap-2 mt-3 animate-fade-in">
                {(["light", "medium", "pro"] as SkinFinishIntensity[]).map((intensity) => (
                  <button
                    key={intensity}
                    onClick={() => setSkinFinishIntensity(intensity)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-center transition-all ${
                      skinFinishIntensity === intensity
                        ? "border-gold/50 bg-gold/10"
                        : "border-gold/15 bg-charcoal-light hover:border-gold/30"
                    }`}
                  >
                    <span className={`text-xs font-medium capitalize ${skinFinishIntensity === intensity ? "text-gold" : "text-cream/70"}`}>
                      {intensity}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Generate Button */}
        {!enhancedImage && (
          <div className="flex flex-col items-center gap-2">
            <LoadingButton
              onClick={handleEnhance}
              isLoading={isEnhancing}
              loadingText="Enhancing photo..."
              disabled={!originalImage}
              size="lg"
              className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-12"
            >
              Enhance Photo
            </LoadingButton>
            <div className="flex items-center gap-1.5 text-cream/50 text-xs">
              <Diamond className="w-3.5 h-3.5 text-purple-400" />
              <span>Costs {getGemCost("enhance-photo")} gems</span>
            </div>
          </div>
        )}

        {/* Comparison Slider */}
        {enhancedImage && originalImage && (
          <div className="space-y-6 animate-fade-in">
            <div className="max-w-3xl mx-auto">
              <div
                ref={comparisonRef}
                className="relative rounded-xl overflow-hidden border border-gold/20 cursor-ew-resize select-none"
                onMouseMove={handleCompareMouseMove}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onTouchMove={handleTouchMove}
                onTouchStart={() => setIsDragging(true)}
                onTouchEnd={() => setIsDragging(false)}
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
              >
                {/* Enhanced Image (full) */}
                <img src={enhancedImage} alt="Enhanced" className="w-full" />
                
                {/* Original Image (clipped) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
                </div>
                
                {/* Slider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-gold cursor-ew-resize"
                  style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gold rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-background text-xs font-bold">↔</span>
                  </div>
                </div>

                {/* Labels */}
                <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-background/80 rounded-lg text-xs font-medium text-cream">
                  Original
                </div>
                <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-gold/80 rounded-lg text-xs font-medium text-background">
                  Enhanced
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.25))}
                  disabled={zoomLevel <= 1}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="flex items-center px-3 text-sm text-cream/70">{Math.round(zoomLevel * 100)}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                  disabled={zoomLevel >= 3}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />
                Download Enhanced
              </Button>
              <Button onClick={handleEnhance} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </Button>
              <Button onClick={handleReset} variant="ghost">
                Start Over
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
};

export default PhotographyStudioPage;
