import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Download, RefreshCw, Diamond } from "lucide-react";
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

type CinematicStyle = "bridal_romance" | "fashion_editorial" | "dark_moody" | "golden_hour" | "vintage_film";

const CinematicStudioPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { deductGems, hasEnoughGems } = useGems();
  const { toast } = useToast();
  const tool = getToolById("cinematic-studio")!;

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<CinematicStyle>("bridal_romance");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const styles = [
    { value: "bridal_romance", label: "Bridal Romance", emoji: "💒" },
    { value: "fashion_editorial", label: "Fashion Editorial", emoji: "📸" },
    { value: "dark_moody", label: "Dark & Moody", emoji: "🌙" },
    { value: "golden_hour", label: "Golden Hour", emoji: "🌅" },
    { value: "vintage_film", label: "Vintage Film", emoji: "🎞️" },
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
    if (!hasEnoughGems("cinematic-transform")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("cinematic-transform")} gems for this feature`, variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("cinematic-transform", { 
        body: { 
          image: uploadedImage, 
          style: selectedStyle,
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
    setResultImage(null);
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
            id="cinematic-upload"
            image={uploadedImage}
            onUpload={handleImageUpload}
            onRemove={handleReset}
            label="Upload Your Photo"
            description="We'll transform it into a cinematic masterpiece"
          />
        </div>

        {/* Style Selection */}
        <div className="max-w-2xl mx-auto">
          <label className="block text-sm font-medium text-cream mb-3 text-center">Choose Cinematic Style</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {styles.map((style) => (
              <button
                key={style.value}
                onClick={() => setSelectedStyle(style.value as CinematicStyle)}
                className={`py-3 px-3 rounded-xl border text-center transition-all duration-300 ${
                  selectedStyle === style.value
                    ? "border-gold/50 bg-gold/10 shadow-gold"
                    : "border-gold/15 bg-charcoal-light hover:border-gold/30"
                }`}
              >
                <span className="block text-lg mb-1">{style.emoji}</span>
                <span className={`block text-xs font-medium ${selectedStyle === style.value ? "text-gold" : "text-cream/70"}`}>
                  {style.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        {!resultImage && (
          <div className="flex flex-col items-center gap-2">
            <LoadingButton
              onClick={handleProcess}
              isLoading={isProcessing}
              loadingText="Transforming..."
              disabled={!uploadedImage}
              size="lg"
              className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-12"
            >
              Apply Cinematic Style
            </LoadingButton>
            <div className="flex items-center gap-1.5 text-cream/50 text-xs">
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
