import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Download, RefreshCw, Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { getGemCost } from "@/lib/gemCosts";
import { getToolById } from "@/config/tools";

type BackgroundPreset = "studio_white" | "luxury_marble" | "nature_garden" | "urban_street" | "custom";

const BackgroundCreatorPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { deductGems, refundGems, hasEnoughGems } = useGems();
  const { toast } = useToast();
  const tool = getToolById("background-creator")!;

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<BackgroundPreset>("studio_white");
  const [customPrompt, setCustomPrompt] = useState("");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const presets = [
    { value: "studio_white", label: "Studio White", emoji: "⚪" },
    { value: "luxury_marble", label: "Luxury Marble", emoji: "🏛️" },
    { value: "nature_garden", label: "Nature Garden", emoji: "🌿" },
    { value: "urban_street", label: "Urban Street", emoji: "🏙️" },
    { value: "custom", label: "Custom", emoji: "✨" },
  ];

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

  const handleProcess = async () => {
    if (!uploadedImage) {
      toast({ title: "No image uploaded", description: "Please upload an image first", variant: "destructive" });
      return;
    }
    if (selectedPreset === "custom" && !customPrompt.trim()) {
      toast({ title: "Missing prompt", description: "Please describe your desired background", variant: "destructive" });
      return;
    }
    if (!hasEnoughGems("generate-background")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("generate-background")} gems for this feature`, variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);
    
    // Deduct gems immediately
    const gemResult = await deductGems("generate-background");
    if (!gemResult.success) {
      setIsProcessing(false);
      toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("generate-background", { 
        body: { 
          image: uploadedImage, 
          preset: selectedPreset,
          customPrompt: selectedPreset === "custom" ? customPrompt : undefined,
          userId: user?.id 
        } 
      });
      if (error) throw error;
      if (data?.error) {
        await refundGems("generate-background");
        toast({ title: "Processing failed", description: data.error, variant: "destructive" });
        return;
      }
      
      if (data?.result) {
        setResultImage(data.result);
        toast({ title: "Background created!", description: "Your new background is ready" });
      } else {
        await refundGems("generate-background");
        toast({ title: "Processing failed", description: "No result received", variant: "destructive" });
      }
    } catch (error: any) {
      await refundGems("generate-background");
      toast({ title: "Processing failed", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'background-creator-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setResultImage(null);
    setCustomPrompt("");
  };

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
            id="background-creator"
            image={uploadedImage}
            onUpload={handleImageUpload}
            onRemove={handleReset}
            label="Upload Your Product/Subject"
            description="We'll generate a beautiful background for it"
          />
        </div>

        {/* Preset Selection */}
        <div className="max-w-2xl mx-auto">
          <label className="block text-sm font-medium text-cream mb-3 text-center">Choose Background Style</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setSelectedPreset(preset.value as BackgroundPreset)}
                className={`py-3 px-3 rounded-xl border text-center transition-all duration-300 ${
                  selectedPreset === preset.value
                    ? "border-gold/50 bg-gold/10 shadow-gold"
                    : "border-gold/15 bg-charcoal-light hover:border-gold/30"
                }`}
              >
                <span className="block text-lg mb-1">{preset.emoji}</span>
                <span className={`block text-xs font-medium ${selectedPreset === preset.value ? "text-gold" : "text-cream/70"}`}>
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompt */}
        {selectedPreset === "custom" && (
          <div className="max-w-xl mx-auto animate-fade-in">
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe your ideal background... (e.g., 'Elegant marble floor with soft natural lighting and minimalist decor')"
              className="min-h-[100px] bg-secondary/30 border-border/50 text-cream placeholder:text-cream/40"
            />
          </div>
        )}

        {/* Generate Button */}
        {!resultImage && (
          <div className="flex flex-col items-center gap-2">
            <LoadingButton
              onClick={handleProcess}
              isLoading={isProcessing}
              loadingText="Creating background..."
              disabled={!uploadedImage || (selectedPreset === "custom" && !customPrompt.trim())}
              size="lg"
              className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-12"
            >
              Generate Background
            </LoadingButton>
            <div className="flex items-center gap-1.5 text-cream/50 text-xs">
              <Diamond className="w-3.5 h-3.5 text-purple-400" />
              <span>Costs {getGemCost("generate-background")} gems</span>
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

export default BackgroundCreatorPage;
