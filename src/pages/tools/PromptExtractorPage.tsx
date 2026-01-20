import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Copy, Diamond } from "lucide-react";
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

const PromptExtractorPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { deductGems, hasEnoughGems } = useGems();
  const { toast } = useToast();
  const tool = getToolById("prompt-extractor")!;

  const [extractorImage, setExtractorImage] = useState<string | null>(null);
  const [extractedPrompt, setExtractedPrompt] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);

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
      setExtractorImage(e.target?.result as string);
      setExtractedPrompt("");
    };
    reader.readAsDataURL(file);
  };

  const handleExtractPrompt = async () => {
    if (!extractorImage) {
      toast({ title: "No image uploaded", description: "Please upload an image first", variant: "destructive" });
      return;
    }
    if (!hasEnoughGems("extract-image-prompt")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("extract-image-prompt")} gem for this feature`, variant: "destructive" });
      return;
    }
    const gemResult = await deductGems("extract-image-prompt");
    if (!gemResult.success) {
      toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
      return;
    }
    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-image-prompt", { body: { image: extractorImage } });
      if (error) throw error;
      if (data?.prompt) {
        setExtractedPrompt(data.prompt);
        toast({ title: "Prompt extracted", description: "Image analyzed successfully" });
      }
    } catch (error: any) {
      toast({ title: "Extraction failed", description: error.message, variant: "destructive" });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(extractedPrompt);
    toast({ title: "Copied!", description: "Prompt copied to clipboard" });
  };

  const handleReset = () => {
    setExtractorImage(null);
    setExtractedPrompt("");
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
            id="prompt-extractor"
            image={extractorImage}
            onUpload={handleImageUpload}
            onRemove={handleReset}
            label="Upload Image to Analyze"
            description="We'll extract a detailed prompt from this image"
          />
        </div>

        {/* Generate Button */}
        {!extractedPrompt && (
          <div className="flex flex-col items-center gap-2">
            <LoadingButton
              onClick={handleExtractPrompt}
              isLoading={isExtracting}
              loadingText="Analyzing image..."
              disabled={!extractorImage}
              size="lg"
              className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-10"
            >
              Extract Prompt
            </LoadingButton>
            <div className="flex items-center gap-1.5 text-cream/50 text-xs">
              <Diamond className="w-3.5 h-3.5 text-primary" />
              <span>Costs {getGemCost("extract-image-prompt")} gem</span>
            </div>
          </div>
        )}

        {/* Result */}
        {extractedPrompt && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-6 rounded-xl bg-secondary/30 border border-border/50">
              <p className="text-cream/90 whitespace-pre-wrap leading-relaxed">{extractedPrompt}</p>
            </div>
            <div className="flex justify-center gap-3">
              <Button onClick={handleCopyPrompt} variant="gold" size="lg">
                <Copy className="w-4 h-4 mr-2" />
                Copy Prompt
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                Try Another Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
};

export default PromptExtractorPage;
