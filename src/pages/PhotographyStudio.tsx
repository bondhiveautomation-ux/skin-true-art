import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Download, RefreshCw, ArrowLeft, Camera, Sparkles, Maximize2, ZoomIn, ZoomOut, Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ProcessingModal } from "@/components/gems/ProcessingModal";
import { LowBalanceAlert } from "@/components/gems/LowBalanceAlert";
import { getGemCost } from "@/lib/gemCosts";

type PhotoType = "product" | "portrait" | "lifestyle";
type StylePreset = "clean_studio" | "luxury_brand" | "soft_natural" | "dark_premium" | "ecommerce_white" | "royal_monochrome" | "instagram_editorial";
type BackgroundOption = "keep_original" | "clean_studio" | "premium_lifestyle" | "royal_bridal_chamber" | "garden_pavilion" | "palace_corridor";
type OutputQuality = "hd" | "ultra_hd";
type SkinFinishIntensity = "light" | "medium" | "pro";

const PhotographyStudio = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { gems, deductGems, hasEnoughGems, refetchGems } = useGems();
  const { toast } = useToast();
  const comparisonRef = useRef<HTMLDivElement>(null);
  const [showLowBalance, setShowLowBalance] = useState(false);

  // States
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [creativeBrief, setCreativeBrief] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [photoType, setPhotoType] = useState<PhotoType>("portrait");
  const [stylePreset, setStylePreset] = useState<StylePreset>("clean_studio");
  const [backgroundOption, setBackgroundOption] = useState<BackgroundOption>("keep_original");
  const [outputQuality, setOutputQuality] = useState<OutputQuality>("ultra_hd");
  const [aiPhotographerMode, setAiPhotographerMode] = useState(true);
  const [skinFinishEnabled, setSkinFinishEnabled] = useState(false);
  const [skinFinishIntensity, setSkinFinishIntensity] = useState<SkinFinishIntensity>("medium");
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Helper function to log generation
  const logGeneration = async (
    featureName: string,
    inputImages: string[] = [],
    outputImages: string[] = []
  ) => {
    if (!user?.id) return;

    const onlyUrls = (arr: string[]) => arr.filter((v) => typeof v === "string" && v.startsWith("http"));

    try {
      await supabase.rpc("log_generation", {
        p_user_id: user.id,
        p_feature_name: featureName,
        p_input_images: onlyUrls(inputImages),
        p_output_images: onlyUrls(outputImages),
      });
    } catch (error) {
      console.error("Failed to log generation:", error);
    }
  };

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  // Show loading state while checking auth
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

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be smaller than 20MB",
        variant: "destructive",
      });
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
      toast({
        title: "No image",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    if (!hasEnoughGems("enhance-photo")) {
      setShowLowBalance(true);
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
          outputQuality,
          aiPhotographerMode,
          skinFinishEnabled: photoType !== "product" && skinFinishEnabled,
          skinFinishIntensity:
            photoType !== "product" && skinFinishEnabled ? skinFinishIntensity : undefined,
          userId: user?.id,
        },
      });

      // The backend always returns 200 with { error } on failure, but keep this
      // for safety in case the runtime returns a non-2xx.
      if (error) {
        throw error;
      }

      if (data?.error) {
        toast({
          title: "Enhancement failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data?.enhancedImage) {
        // Only deduct gems after a successful enhancement (prevents charging on failures).
        const charge = await deductGems("enhance-photo");
        if (!charge.success) {
          toast({
            title: "Couldn’t charge gems",
            description: "Please try again.",
            variant: "destructive",
          });
          return;
        }

        setEnhancedImage(data.enhancedImage);
        setCreativeBrief(data.creativeBrief || null);
        await logGeneration("Photography Studio", [], [data.enhancedImage]);
        toast({
          title: "Photo enhanced!",
          description: data.creativeBrief
            ? data.creativeBrief.substring(0, 100) + "..."
            : "Your professional-quality image is ready",
        });
      } else {
        toast({
          title: "Enhancement failed",
          description: "No image returned. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Enhancement error:", error);
      toast({
        title: "Enhancement failed",
        description: error.message || "Failed to enhance photo",
        variant: "destructive",
      });
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
    setCreativeBrief(null);
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
    { value: "portrait", label: "Portrait / Influencer", emoji: "👤" },
    { value: "lifestyle", label: "Lifestyle / Brand", emoji: "✨" },
  ];

  const stylePresets = [
    { value: "clean_studio", label: "Clean Studio", desc: "Professional studio lighting" },
    { value: "luxury_brand", label: "Couture Mood", desc: "Luxury brand editorial" },
    { value: "soft_natural", label: "Soft Natural Light", desc: "Golden hour warmth" },
    { value: "dark_premium", label: "Dark Premium", desc: "Dramatic shadows" },
    { value: "ecommerce_white", label: "E-commerce White", desc: "Pure white backdrop" },
    { value: "royal_monochrome", label: "Silver Screen", desc: "Classic B&W glamour" },
    { value: "instagram_editorial", label: "Instagram Editorial", desc: "Trendy lifestyle" },
  ];

  const backgroundOptions = [
    { value: "keep_original", label: "Keep Original (Enhanced)", desc: "Refine existing background" },
    { value: "clean_studio", label: "Clean Studio Background", desc: "Seamless gradient" },
    { value: "premium_lifestyle", label: "Premium Lifestyle", desc: "Aspirational interior" },
    { value: "royal_bridal_chamber", label: "Royal Bridal Chamber", desc: "Gold trim & ivory panels" },
    { value: "garden_pavilion", label: "Garden Pavilion", desc: "Elegant outdoor setting" },
    { value: "palace_corridor", label: "Palace Corridor", desc: "Grand royal heritage" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onNavigate={(section) => navigate(`/#${section}`)} 
        credits={gems}
      />

      {/* Hero Section */}
      <section className="pt-28 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-charcoal to-background" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-bl from-gold/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 noise-texture" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-cream/60 hover:text-gold transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </button>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 border border-gold/25 mb-6 backdrop-blur-sm">
              <Camera className="w-4 h-4 text-gold" />
              <span className="text-xs font-semibold text-gold uppercase tracking-widest">Photography Studio</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-cream tracking-tight mb-4">
              Transform Any Photo Into <span className="gradient-text">DSLR Quality</span>
            </h1>
            <p className="text-cream/50 max-w-2xl mx-auto leading-relaxed font-light">
              Upload any low-quality photo. We handle lighting, pose, framing, clarity, and studio aesthetics—no photographer required.
            </p>
          </div>
        </div>
      </section>

      {/* Main Tool Section */}
      <section className="pb-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-background to-background" />
        <div className="absolute inset-0 noise-texture" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
          <div className="glass-card p-6 sm:p-8 lg:p-10 border border-gold/15 hover:border-gold/25 transition-all duration-500">
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

              {/* Smart Enhancement Info */}
              <div className="text-center py-4 px-6 rounded-xl bg-secondary/20 border border-gold/10">
                <p className="text-sm text-cream/60 leading-relaxed">
                  <span className="text-gold font-medium">Smart Auto-Enhancement:</span> Our AI automatically fixes everything a professional photographer would—lighting, composition, sharpness, and color grading while preserving natural realism.
                </p>
              </div>

              {/* Upload Section */}
              <div className="max-w-md mx-auto">
                <ImageUploader
                  id="photo-upload"
                  image={originalImage}
                  onUpload={handleImageUpload}
                  onRemove={() => {
                    setOriginalImage(null);
                    setEnhancedImage(null);
                  }}
                  label="Upload Your Photo"
                  description="Product photos, creator shots, or lifestyle images"
                />
                {originalImage && !enhancedImage && (
                  <p className="text-center text-xs text-cream/40 mt-2">Original Preview</p>
                )}
              </div>

                {/* Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo Type */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-cream">Photo Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {photoTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          setPhotoType(type.value as PhotoType);
                          // Auto-disable skin finish for product photos
                          if (type.value === "product") {
                            setSkinFinishEnabled(false);
                          }
                        }}
                        className={`py-3 px-3 rounded-xl border text-center transition-all duration-300 ${
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

                {/* Skin Finish (Frequency Separation) - Only for Portrait/Lifestyle */}
                <div className={`space-y-3 ${photoType === "product" ? "opacity-40 pointer-events-none" : ""}`}>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-cream">
                      Skin Finish <span className="text-cream/40 font-normal">(Frequency Separation)</span>
                    </label>
                    <Switch
                      id="skin-finish"
                      checked={skinFinishEnabled && photoType !== "product"}
                      onCheckedChange={setSkinFinishEnabled}
                      disabled={photoType === "product"}
                      className="data-[state=checked]:bg-gold"
                    />
                  </div>
                  <p className="text-xs text-cream/50">
                    {photoType === "product" 
                      ? "Not available for product photos" 
                      : "Treats skin as texture layer—prevents 'plastic AI face' look."}
                  </p>
                  
                  {/* Intensity Selector - Only visible when enabled */}
                  {skinFinishEnabled && photoType !== "product" && (
                    <div className="grid grid-cols-3 gap-2 pt-2 animate-fade-in">
                      <button
                        onClick={() => setSkinFinishIntensity("light")}
                        className={`py-2.5 px-3 rounded-xl border text-center transition-all duration-300 ${
                          skinFinishIntensity === "light"
                            ? "border-gold/50 bg-gold/10 shadow-gold"
                            : "border-gold/15 bg-charcoal-light hover:border-gold/30"
                        }`}
                      >
                        <span className={`block text-xs font-medium ${skinFinishIntensity === "light" ? "text-gold" : "text-cream/70"}`}>
                          Light
                        </span>
                        <span className="block text-[10px] text-cream/40 mt-0.5">Subtle</span>
                      </button>
                      <button
                        onClick={() => setSkinFinishIntensity("medium")}
                        className={`py-2.5 px-3 rounded-xl border text-center transition-all duration-300 relative ${
                          skinFinishIntensity === "medium"
                            ? "border-gold/50 bg-gold/10 shadow-gold"
                            : "border-gold/15 bg-charcoal-light hover:border-gold/30"
                        }`}
                      >
                        <span className="absolute -top-1.5 right-1 text-[8px] text-gold bg-charcoal px-1 rounded">REC</span>
                        <span className={`block text-xs font-medium ${skinFinishIntensity === "medium" ? "text-gold" : "text-cream/70"}`}>
                          Medium
                        </span>
                        <span className="block text-[10px] text-cream/40 mt-0.5">Balanced</span>
                      </button>
                      <button
                        onClick={() => setSkinFinishIntensity("pro")}
                        className={`py-2.5 px-3 rounded-xl border text-center transition-all duration-300 ${
                          skinFinishIntensity === "pro"
                            ? "border-gold/50 bg-gold/10 shadow-gold"
                            : "border-gold/15 bg-charcoal-light hover:border-gold/30"
                        }`}
                      >
                        <span className={`block text-xs font-medium ${skinFinishIntensity === "pro" ? "text-gold" : "text-cream/70"}`}>
                          Pro Retouch
                        </span>
                        <span className="block text-[10px] text-cream/40 mt-0.5">High-end</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Output Fidelity */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-cream">Output Fidelity</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOutputQuality("hd")}
                      className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-300 ${
                        outputQuality === "hd"
                          ? "border-gold/50 bg-gold/10 shadow-gold"
                          : "border-gold/15 bg-charcoal-light hover:border-gold/30"
                      }`}
                    >
                      <span className={`block text-sm font-medium ${outputQuality === "hd" ? "text-gold" : "text-cream/70"}`}>
                        Editorial Print
                      </span>
                      <span className="block text-[10px] text-cream/40 mt-0.5">HD Quality</span>
                    </button>
                    <button
                      onClick={() => setOutputQuality("ultra_hd")}
                      className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-300 relative ${
                        outputQuality === "ultra_hd"
                          ? "border-gold/50 bg-gold/10 shadow-gold"
                          : "border-gold/15 bg-charcoal-light hover:border-gold/30"
                      }`}
                    >
                      <span className="absolute -top-1.5 right-2 text-[8px] text-gold bg-charcoal px-1.5 rounded">PRO</span>
                      <span className={`block text-sm font-medium ${outputQuality === "ultra_hd" ? "text-gold" : "text-cream/70"}`}>
                        Master Portfolio
                      </span>
                      <span className="block text-[10px] text-cream/40 mt-0.5">Ultra HD • DSLR</span>
                    </button>
                  </div>
                </div>

                {/* Artistic Direction - Style Presets */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-cream">Artistic Direction <span className="text-cream/40 font-normal">(Global Illumination)</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {stylePresets.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setStylePreset(preset.value as StylePreset)}
                        className={`py-2.5 px-3 rounded-xl border text-left transition-all duration-300 ${
                          stylePreset === preset.value
                            ? "border-gold/50 bg-gold/10 shadow-gold"
                            : "border-gold/15 bg-charcoal-light hover:border-gold/30"
                        }`}
                      >
                        <span className={`block text-xs font-medium ${stylePreset === preset.value ? "text-gold" : "text-cream/70"}`}>
                          {preset.label}
                        </span>
                        <span className="block text-[10px] text-cream/40 mt-0.5">{preset.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Logic - Environmental Set */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-cream">Background Logic <span className="text-cream/40 font-normal">(Environmental Set)</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {backgroundOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setBackgroundOption(option.value as BackgroundOption)}
                        className={`py-2.5 px-3 rounded-xl border text-left transition-all duration-300 ${
                          backgroundOption === option.value
                            ? "border-gold/50 bg-gold/10 shadow-gold"
                            : "border-gold/15 bg-charcoal-light hover:border-gold/30"
                        }`}
                      >
                        <span className={`block text-xs font-medium ${backgroundOption === option.value ? "text-gold" : "text-cream/70"}`}>
                          {option.label}
                        </span>
                        <span className="block text-[10px] text-cream/40 mt-0.5">{option.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhance Button */}
              <div className="flex flex-col items-center gap-2">
                <LoadingButton
                  onClick={handleEnhance}
                  isLoading={isEnhancing}
                  loadingText="AI Working..."
                  disabled={!originalImage}
                  size="lg"
                  className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-12"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Enhance Photo
                </LoadingButton>
                <div className="flex items-center gap-1.5 text-cream/50 text-xs">
                  <Diamond className="w-3.5 h-3.5 text-purple-400" />
                  <span>Costs {getGemCost("enhance-photo")} gems</span>
                </div>
              </div>

              {/* Before/After Comparison */}
              {enhancedImage && originalImage && (
                <div className="space-y-4 sm:space-y-6 animate-fade-in">
                  {/* Header with zoom controls */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <h3 className="text-base sm:text-lg font-serif font-semibold text-cream">Before / After</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))}
                        className="p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary text-cream/60 hover:text-cream transition-colors active:scale-95"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-cream/50 w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                      <button
                        onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.5))}
                        className="p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary text-cream/60 hover:text-cream transition-colors active:scale-95"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Comparison Slider */}
                  <div
                    ref={comparisonRef}
                    className="relative w-full aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden border border-gold/20 cursor-ew-resize select-none touch-none"
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                    onMouseMove={handleCompareMouseMove}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={() => setIsDragging(false)}
                    onTouchMove={handleTouchMove}
                  >
                    {/* Enhanced Image (Full) */}
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={enhancedImage}
                        alt="Enhanced"
                        className="w-full h-full object-cover"
                        style={{ transform: `scale(${zoomLevel})` }}
                        draggable={false}
                      />
                    </div>

                    {/* Original Image (Clipped) */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <img
                        src={originalImage}
                        alt="Original"
                        className="w-full h-full object-cover"
                        style={{ transform: `scale(${zoomLevel})` }}
                        draggable={false}
                      />
                    </div>

                    {/* Slider Line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 sm:w-1 bg-gold shadow-gold cursor-ew-resize"
                      style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gold flex items-center justify-center shadow-lg">
                        <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4 text-background rotate-45" />
                      </div>
                    </div>

                    {/* Labels - Positioned to avoid overlap */}
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-charcoal/90 backdrop-blur-sm">
                      <span className="text-[10px] sm:text-xs font-medium text-cream">Original</span>
                    </div>
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                      <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-gold/20 backdrop-blur-sm border border-gold/30">
                        <span className="text-[10px] sm:text-xs font-medium text-gold">Enhanced</span>
                      </div>
                    </div>
                    
                    {/* Skin Finish Label - Bottom positioned on mobile to avoid overlap */}
                    {skinFinishEnabled && photoType !== "product" && (
                      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-auto px-2 py-1 rounded-lg bg-charcoal/90 backdrop-blur-sm border border-gold/20">
                        <span className="text-[9px] sm:text-[10px] font-medium text-cream/70 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-gold" />
                          Studio Skin Finish – Natural Retouch
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Stacked on mobile */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
                    <Button
                      onClick={handleDownload}
                      variant="gold"
                      size="lg"
                      className="w-full sm:w-auto px-8 py-3 text-base font-semibold btn-glow"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Image
                    </Button>
                    <div className="flex gap-2 sm:gap-3">
                      <Button
                        onClick={handleEnhance}
                        variant="outline"
                        disabled={isEnhancing}
                        className="flex-1 sm:flex-none border-gold/30 text-cream hover:bg-gold/10 py-3"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isEnhancing ? "animate-spin" : ""}`} />
                        Regenerate
                      </Button>
                      <Button
                        onClick={() => {
                          setEnhancedImage(null);
                          setStylePreset("clean_studio");
                        }}
                        variant="ghost"
                        className="flex-1 sm:flex-none text-cream/60 hover:text-cream hover:bg-secondary/50 py-3"
                      >
                        Try Different Style
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PhotographyStudio;
