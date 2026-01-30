import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Download, RefreshCw, Diamond, ImageIcon, Camera, Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { StepWizard } from "@/components/ui/StepWizard";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { MobileStickyFooter } from "@/components/ui/MobileStickyFooter";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { getGemCost } from "@/lib/gemCosts";
import { getToolById } from "@/config/tools";
import { useIsMobile } from "@/hooks/use-mobile";
import { logGeneration } from "@/lib/logGeneration";

const CINEMATIC_PRESETS = [
  { id: "over-shoulder", name: "Over-the-Shoulder Grace", emoji: "🔄" },
  { id: "birds-eye", name: "Bird's-Eye Bridal Symphony", emoji: "🦅" },
  { id: "high-angle", name: "High-Angle Royal Gaze", emoji: "👑" },
  { id: "joy-closeup", name: "Spontaneous Joy Close-Up", emoji: "😄" },
  { id: "neckline", name: "Neckline Elegance Detail", emoji: "💎" },
  { id: "eyes", name: "Eyes of the Bride", emoji: "👁️" },
  { id: "full-frame", name: "Full-Frame Royal Stance", emoji: "🖼️" },
  { id: "window-light", name: "Window-Light Serenity", emoji: "🪟" },
  { id: "candid-walk", name: "Candid Side Walk", emoji: "🚶‍♀️" },
  { id: "floor-seated", name: "Floor-Seated Royal Pose", emoji: "🧘‍♀️" },
  { id: "jewellery-glow", name: "Jewellery Glow Portrait", emoji: "✨" },
  { id: "mirror", name: "Mirror Reflection Elegance", emoji: "🪞" },
  { id: "golden-hour-silhouette", name: "Golden Hour Silhouette", emoji: "🌅" },
  { id: "dramatic-low-angle", name: "Dramatic Low-Angle Power", emoji: "💪" },
  { id: "hands-henna-detail", name: "Mehndi Hands Artistry", emoji: "🤲" },
  { id: "veil-mystery", name: "Veiled Mystery Portrait", emoji: "🧕" },
  { id: "twirl-motion", name: "Lehenga Twirl Motion", emoji: "💃" },
  { id: "dutch-angle-editorial", name: "Dutch Angle Editorial", emoji: "📐" },
  { id: "reflection-floor", name: "Floor Reflection Glamour", emoji: "🏛️" },
  { id: "intimate-profile", name: "Intimate Profile Silhouette", emoji: "👤" },
  { id: "dreamy-bokeh-lights", name: "Dreamy Bokeh Fairylights", emoji: "✨" },
  { id: "staircase-regal", name: "Staircase Regal Descent", emoji: "🏰" },
  { id: "backless-elegance", name: "Backless Blouse Elegance", emoji: "👗" },
];

const BACKGROUND_OPTIONS = [
  { id: "warm-neutral-luxury", name: "Warm Neutral Luxury Wall", emoji: "🏠" },
  { id: "dark-mocha-editorial", name: "Dark Mocha Editorial Studio", emoji: "☕" },
  { id: "classic-off-white-panel", name: "Classic Off-White Panel Room", emoji: "⬜" },
  { id: "window-light-corner", name: "Window-Light Studio Corner", emoji: "🪟" },
  { id: "luxury-fabric-backdrop", name: "Luxury Fabric Backdrop", emoji: "🎭" },
  { id: "royal-burgundy-editorial", name: "Royal Burgundy Editorial Wall", emoji: "🍷" },
  { id: "minimal-grey-studio", name: "Minimal Grey Studio Interior", emoji: "⬛" },
  { id: "warm-indoor-apartment", name: "Warm Indoor Apartment Lounge", emoji: "🛋️" },
  { id: "soft-shadow-editorial", name: "Soft Shadow Editorial Backdrop", emoji: "🌓" },
  { id: "classic-dark-studio-fade", name: "Classic Dark Studio Fade", emoji: "🖤" },
];

const STEPS = [
  { id: "upload", title: "Upload" },
  { id: "style", title: "Style" },
  { id: "generate", title: "Generate" },
];

const CinematicStudioPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { deductGems, refundGems, hasEnoughGems } = useGems();
  const { toast } = useToast();
  const tool = getToolById("cinematic-studio")!;
  const isMobile = useIsMobile();

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [customBackgroundImage, setCustomBackgroundImage] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate current step
  const currentStep = resultImage ? 2 : (uploadedImage ? 1 : 0);

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
      setUploadedImage(e.target?.result as string);
      setResultImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomBackgroundImage(e.target?.result as string);
      setSelectedBackground(null);
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!uploadedImage) {
      toast({ title: "No image uploaded", description: "Please upload your photo first", variant: "destructive" });
      return;
    }
    
    if (!selectedPreset && !selectedBackground && !customBackgroundImage) {
      toast({ title: "Select an option", description: "Please select a cinematic style or background", variant: "destructive" });
      return;
    }

    if (!hasEnoughGems("cinematic-transform")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("cinematic-transform")} gems for this feature`, variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);
    
    // Deduct gems immediately
    const gemResult = await deductGems("cinematic-transform");
    if (!gemResult.success) {
      setIsProcessing(false);
      toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("cinematic-transform", { 
        body: { 
          image: uploadedImage, 
          presetId: selectedPreset,
          backgroundId: selectedBackground,
          customBackgroundImage: customBackgroundImage,
          userId: user?.id 
        } 
      });
      if (error) throw error;
      if (data?.error) {
        await refundGems("cinematic-transform");
        toast({ title: "Processing failed", description: data.error, variant: "destructive" });
        return;
      }
      
      if (data?.result) {
        setResultImage(data.result);
        toast({ title: "Cinematic transformation complete!", description: "Your photo has been transformed" });
        // Log generation
        await logGeneration("cinematic-transform", [uploadedImage!], [data.result], user?.id);
      } else {
        await refundGems("cinematic-transform");
        toast({ title: "No result", description: "Failed to generate image. Please try again.", variant: "destructive" });
      }
    } catch (error: any) {
      await refundGems("cinematic-transform");
      toast({ title: "Processing failed", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'cinematic-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setCustomBackgroundImage(null);
    setSelectedPreset(null);
    setSelectedBackground(null);
    setResultImage(null);
  };

  const canProcess = uploadedImage && (selectedPreset || selectedBackground || customBackgroundImage);
  const hasStyleSelected = selectedPreset || selectedBackground || customBackgroundImage;

  // Selection summary for mobile
  const getSelectionSummary = () => {
    const parts = [];
    if (selectedPreset) {
      parts.push(CINEMATIC_PRESETS.find(p => p.id === selectedPreset)?.name);
    }
    if (selectedBackground) {
      parts.push(BACKGROUND_OPTIONS.find(b => b.id === selectedBackground)?.name);
    }
    if (customBackgroundImage) {
      parts.push("Custom Background");
    }
    return parts.join(" + ");
  };

  // Render option button
  const OptionButton = ({ id, name, emoji, selected, onSelect }: {
    id: string;
    name: string;
    emoji: string;
    selected: boolean;
    onSelect: () => void;
  }) => (
    <button
      onClick={onSelect}
      className={`relative p-3 rounded-xl border text-left transition-all duration-300 min-h-[60px] ${
        selected
          ? "border-primary/50 bg-primary/10 shadow-lg ring-1 ring-primary/30"
          : "border-border/50 bg-card hover:border-primary/30 hover:bg-card/80"
      }`}
    >
      {selected && (
        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-primary-foreground" />
        </div>
      )}
      <span className="block text-lg mb-1">{emoji}</span>
      <span className={`block text-xs font-medium leading-tight ${
        selected ? "text-primary" : "text-foreground/80"
      }`}>
        {name}
      </span>
    </button>
  );

  return (
    <ToolPageLayout
      toolId={tool.id}
      toolName={tool.name}
      toolDescription={tool.longDescription}
      gemCostKey={tool.gemCostKey}
      icon={tool.icon}
      badge={tool.badge}
    >
      <div className="space-y-6 pb-20 lg:pb-0">
        {/* Step Wizard - Mobile focused */}
        <div className="lg:hidden">
          <StepWizard
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={(step) => {
              if (step === 0) handleReset();
            }}
          />
        </div>

        {/* Step 1: Upload */}
        {!resultImage && (
          <div className="space-y-6">
            {/* Image Upload - Compact on mobile */}
            <div className={`mx-auto ${uploadedImage ? 'max-w-xs' : 'max-w-md'}`}>
              <ImageUploader
                id="cinematic-upload"
                image={uploadedImage}
                onUpload={handleImageUpload}
                onRemove={() => { setUploadedImage(null); setResultImage(null); }}
                label={uploadedImage ? "Your Photo" : "Upload Your Photo"}
                description={uploadedImage ? undefined : "We'll transform it into a cinematic masterpiece"}
                aspectRatio={uploadedImage ? "portrait" : "auto"}
              />
            </div>

            {/* Step 2: Style Selection - Only show after upload */}
            {uploadedImage && (
              <div className="space-y-4">
                {/* Mobile: Collapsible sections */}
                {isMobile ? (
                  <div className="space-y-3">
                    {/* Cinematic Styles */}
                    <CollapsibleSection
                      title="Cinematic Styles"
                      subtitle="Camera angles & poses"
                      icon={<Camera className="w-4 h-4" />}
                      badge={CINEMATIC_PRESETS.length}
                      defaultOpen={!selectedPreset && !selectedBackground}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {CINEMATIC_PRESETS.map((preset) => (
                          <OptionButton
                            key={preset.id}
                            id={preset.id}
                            name={preset.name}
                            emoji={preset.emoji}
                            selected={selectedPreset === preset.id}
                            onSelect={() => setSelectedPreset(selectedPreset === preset.id ? null : preset.id)}
                          />
                        ))}
                      </div>
                    </CollapsibleSection>

                    {/* Backgrounds */}
                    <CollapsibleSection
                      title="Studio Backgrounds"
                      subtitle="Or upload your own"
                      icon={<Palette className="w-4 h-4" />}
                      badge={BACKGROUND_OPTIONS.length}
                      defaultOpen={false}
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          {BACKGROUND_OPTIONS.map((bg) => (
                            <OptionButton
                              key={bg.id}
                              id={bg.id}
                              name={bg.name}
                              emoji={bg.emoji}
                              selected={selectedBackground === bg.id}
                              onSelect={() => {
                                setSelectedBackground(selectedBackground === bg.id ? null : bg.id);
                                if (selectedBackground !== bg.id) setCustomBackgroundImage(null);
                              }}
                            />
                          ))}
                        </div>

                        {/* Custom Background Upload */}
                        <div className="border-t border-border/30 pt-4">
                          <p className="text-xs font-medium text-foreground/80 mb-2 text-center">
                            Or upload your own
                          </p>
                          {customBackgroundImage ? (
                            <div className="relative rounded-xl overflow-hidden border border-primary/30">
                              <img src={customBackgroundImage} alt="Custom background" className="w-full h-24 object-cover" />
                              <button
                                onClick={() => setCustomBackgroundImage(null)}
                                className="absolute top-2 right-2 bg-background/80 rounded-full p-1.5 hover:bg-background"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center h-20 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/30 cursor-pointer transition-colors bg-card/50">
                              <ImageIcon className="w-6 h-6 text-muted-foreground mb-1" />
                              <span className="text-xs text-muted-foreground">Upload background</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleBackgroundImageUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </CollapsibleSection>

                    {/* Selection Summary - Mobile */}
                    {hasStyleSelected && (
                      <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                        <p className="text-xs text-muted-foreground mb-1">Selected:</p>
                        <p className="text-sm font-medium text-foreground">{getSelectionSummary()}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Desktop: Tab-like layout */
                  <div className="max-w-4xl mx-auto space-y-6">
                    {/* Cinematic Presets */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Camera className="w-4 h-4 text-primary" />
                          Cinematic Styles
                        </h3>
                        <span className="text-xs text-muted-foreground">{CINEMATIC_PRESETS.length} options</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[280px] overflow-y-auto p-1 rounded-xl border border-border/30">
                        {CINEMATIC_PRESETS.map((preset) => (
                          <OptionButton
                            key={preset.id}
                            id={preset.id}
                            name={preset.name}
                            emoji={preset.emoji}
                            selected={selectedPreset === preset.id}
                            onSelect={() => setSelectedPreset(selectedPreset === preset.id ? null : preset.id)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Backgrounds */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Palette className="w-4 h-4 text-primary" />
                          Studio Backgrounds
                        </h3>
                        <span className="text-xs text-muted-foreground">{BACKGROUND_OPTIONS.length} options</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                        {BACKGROUND_OPTIONS.map((bg) => (
                          <OptionButton
                            key={bg.id}
                            id={bg.id}
                            name={bg.name}
                            emoji={bg.emoji}
                            selected={selectedBackground === bg.id}
                            onSelect={() => {
                              setSelectedBackground(selectedBackground === bg.id ? null : bg.id);
                              if (selectedBackground !== bg.id) setCustomBackgroundImage(null);
                            }}
                          />
                        ))}
                        
                        {/* Custom Background Upload - Desktop inline */}
                        {customBackgroundImage ? (
                          <div className="relative rounded-xl overflow-hidden border border-primary/30">
                            <img src={customBackgroundImage} alt="Custom" className="w-full h-full object-cover" />
                            <button
                              onClick={() => setCustomBackgroundImage(null)}
                              className="absolute top-1 right-1 bg-background/80 rounded-full p-1 hover:bg-background text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 hover:border-primary/30 cursor-pointer transition-colors bg-card/50 min-h-[60px]">
                            <ImageIcon className="w-5 h-5 text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground text-center px-1">Custom</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleBackgroundImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Selection Summary - Desktop */}
                    {hasStyleSelected && (
                      <div className="flex items-center justify-center gap-2 p-3 rounded-full bg-card border border-border/50 max-w-2xl mx-auto">
                        <span className="text-sm text-foreground/80">{getSelectionSummary()}</span>
                      </div>
                    )}

                    {/* Generate Button - Desktop */}
                    <div className="flex flex-col items-center gap-2">
                      <LoadingButton
                        onClick={handleProcess}
                        isLoading={isProcessing}
                        loadingText="Transforming..."
                        disabled={!canProcess}
                        size="lg"
                        className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-12"
                      >
                        Apply Cinematic Transformation
                      </LoadingButton>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <Diamond className="w-3.5 h-3.5 text-primary" />
                        <span>Costs {getGemCost("cinematic-transform")} gems</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Result Display */}
        {resultImage && (
          <div className="space-y-6 animate-fade-in">
            <div className="max-w-2xl mx-auto">
              <div className="relative rounded-xl overflow-hidden border border-primary/20">
                <img src={resultImage} alt="Result" className="w-full" />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button onClick={handleDownload} className="gap-2 min-h-[44px]">
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button onClick={handleProcess} variant="outline" className="gap-2 min-h-[44px]">
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </Button>
              <Button onClick={handleReset} variant="ghost" className="min-h-[44px]">
                Start Over
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Sticky Footer */}
        <MobileStickyFooter show={uploadedImage !== null && !resultImage}>
          <div className="flex flex-col gap-2">
            {hasStyleSelected && (
              <p className="text-xs text-muted-foreground text-center truncate px-2">
                {getSelectionSummary()}
              </p>
            )}
            <LoadingButton
              onClick={handleProcess}
              isLoading={isProcessing}
              loadingText="Transforming..."
              disabled={!canProcess}
              className="w-full h-12 btn-glow bg-foreground text-background hover:bg-foreground/90 font-medium"
            >
              <Diamond className="w-4 h-4 mr-2 text-primary" />
              Generate ({getGemCost("cinematic-transform")} gems)
            </LoadingButton>
          </div>
        </MobileStickyFooter>
      </div>
    </ToolPageLayout>
  );
};

export default CinematicStudioPage;
