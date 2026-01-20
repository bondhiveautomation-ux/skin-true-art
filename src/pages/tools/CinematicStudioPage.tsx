import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Download, RefreshCw, Diamond, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { getGemCost } from "@/lib/gemCosts";
import { getToolById } from "@/config/tools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const CinematicStudioPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { deductGems, hasEnoughGems } = useGems();
  const { toast } = useToast();
  const tool = getToolById("cinematic-studio")!;

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [customBackgroundImage, setCustomBackgroundImage] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("presets");

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
      setSelectedBackground(null); // Clear preset background when custom is uploaded
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
        toast({ title: "Processing failed", description: data.error, variant: "destructive" });
        return;
      }
      
      const gemResult = await deductGems("cinematic-transform");
      if (!gemResult.success) {
        toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
        return;
      }
      
      if (data?.resultImage) {
        setResultImage(data.resultImage);
        toast({ title: "Cinematic transformation complete!", description: "Your photo has been transformed" });
      }
    } catch (error: any) {
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
        {/* Image Upload */}
        <div className="max-w-md mx-auto">
          <ImageUploader
            id="cinematic-upload"
            image={uploadedImage}
            onUpload={handleImageUpload}
            onRemove={() => { setUploadedImage(null); setResultImage(null); }}
            label="Upload Your Photo"
            description="We'll transform it into a cinematic masterpiece"
          />
        </div>

        {/* Options Tabs */}
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="presets" className="text-sm">
                🎬 Cinematic Styles ({CINEMATIC_PRESETS.length})
              </TabsTrigger>
              <TabsTrigger value="backgrounds" className="text-sm">
                🖼️ Backgrounds ({BACKGROUND_OPTIONS.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="mt-0">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Choose a camera angle, pose, or framing style for your bridal shot
                </p>
                <ScrollArea className="h-[320px] rounded-xl border border-border/50 p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {CINEMATIC_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedPreset(selectedPreset === preset.id ? null : preset.id)}
                        className={`p-3 rounded-xl border text-left transition-all duration-300 ${
                          selectedPreset === preset.id
                            ? "border-gold/50 bg-gold/10 shadow-gold ring-1 ring-gold/30"
                            : "border-border/50 bg-card hover:border-gold/30 hover:bg-card/80"
                        }`}
                      >
                        <span className="block text-xl mb-1">{preset.emoji}</span>
                        <span className={`block text-xs font-medium leading-tight ${
                          selectedPreset === preset.id ? "text-gold" : "text-foreground/80"
                        }`}>
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="backgrounds" className="mt-0">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Choose a studio background or upload your own
                </p>
                
                {/* Preset Backgrounds */}
                <ScrollArea className="h-[240px] rounded-xl border border-border/50 p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {BACKGROUND_OPTIONS.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => {
                          setSelectedBackground(selectedBackground === bg.id ? null : bg.id);
                          if (selectedBackground !== bg.id) setCustomBackgroundImage(null);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all duration-300 ${
                          selectedBackground === bg.id
                            ? "border-gold/50 bg-gold/10 shadow-gold ring-1 ring-gold/30"
                            : "border-border/50 bg-card hover:border-gold/30 hover:bg-card/80"
                        }`}
                      >
                        <span className="block text-xl mb-1">{bg.emoji}</span>
                        <span className={`block text-xs font-medium leading-tight ${
                          selectedBackground === bg.id ? "text-gold" : "text-foreground/80"
                        }`}>
                          {bg.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>

                {/* Custom Background Upload */}
                <div className="border-t border-border/30 pt-4">
                  <p className="text-sm font-medium text-foreground/80 mb-3 text-center">
                    Or upload your own background
                  </p>
                  <div className="max-w-xs mx-auto">
                    {customBackgroundImage ? (
                      <div className="relative rounded-xl overflow-hidden border border-gold/30">
                        <img src={customBackgroundImage} alt="Custom background" className="w-full h-32 object-cover" />
                        <button
                          onClick={() => setCustomBackgroundImage(null)}
                          className="absolute top-2 right-2 bg-background/80 rounded-full p-1.5 hover:bg-background"
                        >
                          <span className="sr-only">Remove</span>
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-border/50 hover:border-gold/30 cursor-pointer transition-colors bg-card/50">
                        <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">Upload background image</span>
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
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Selection Summary */}
        {(selectedPreset || selectedBackground || customBackgroundImage) && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex flex-wrap items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50">
              {selectedPreset && (
                <span className="text-sm text-foreground/80">
                  🎬 {CINEMATIC_PRESETS.find(p => p.id === selectedPreset)?.name}
                </span>
              )}
              {selectedPreset && (selectedBackground || customBackgroundImage) && (
                <span className="text-muted-foreground">+</span>
              )}
              {selectedBackground && (
                <span className="text-sm text-foreground/80">
                  🖼️ {BACKGROUND_OPTIONS.find(b => b.id === selectedBackground)?.name}
                </span>
              )}
              {customBackgroundImage && (
                <span className="text-sm text-foreground/80">
                  🖼️ Custom Background
                </span>
              )}
            </div>
          </div>
        )}

        {/* Generate Button */}
        {!resultImage && (
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
              <Diamond className="w-3.5 h-3.5 text-purple-400" />
              <span>Costs {getGemCost("cinematic-transform")} gems</span>
            </div>
          </div>
        )}

        {/* Result Display */}
        {resultImage && (
          <div className="space-y-6 animate-fade-in">
            <div className="max-w-2xl mx-auto">
              <div className="relative rounded-xl overflow-hidden border border-gold/20">
                <img src={resultImage} alt="Result" className="w-full" />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button onClick={handleProcess} variant="outline" className="gap-2">
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

export default CinematicStudioPage;
