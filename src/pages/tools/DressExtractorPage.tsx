import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { ResultDisplay } from "@/components/ui/ResultDisplay";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { getGemCost } from "@/lib/gemCosts";
import { getToolById } from "@/config/tools";

const DressExtractorPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { deductGems, hasEnoughGems } = useGems();
  const { toast } = useToast();
  const tool = getToolById("dress-extractor")!;

  const [dressImage, setDressImage] = useState<string | null>(null);
  const [extractedDressImage, setExtractedDressImage] = useState<string | null>(null);
  const [isExtractingDress, setIsExtractingDress] = useState(false);
  const [dummyStyle, setDummyStyle] = useState<"standard" | "premium-wood" | "luxury-marble" | "royal-velvet" | "garden-elegance" | "modern-minimal">("standard");
  const [dressMismatchFeedback, setDressMismatchFeedback] = useState<string | null>(null);

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
      setDressImage(e.target?.result as string);
      setExtractedDressImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleExtractDress = async () => {
    if (!dressImage) {
      toast({ title: "No image uploaded", description: "Please upload an image first", variant: "destructive" });
      return;
    }
    if (!hasEnoughGems("extract-dress-to-dummy")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("extract-dress-to-dummy")} gems for this feature`, variant: "destructive" });
      return;
    }
    const gemResult = await deductGems("extract-dress-to-dummy");
    if (!gemResult.success) {
      toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
      return;
    }
    setIsExtractingDress(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-dress-to-dummy", {
        body: { image: dressImage, userId: user?.id, dummyStyle, correctionFeedback: dressMismatchFeedback },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Extraction failed", description: data.error, variant: "destructive" });
        return;
      }
      if (data?.extractedImage) {
        setExtractedDressImage(data.extractedImage);
        setDressMismatchFeedback(null);
        toast({ title: "Dress extracted!", description: "The garment has been placed on the mannequin" });
      }
    } catch (error: any) {
      toast({ title: "Extraction failed", description: error.message, variant: "destructive" });
    } finally {
      setIsExtractingDress(false);
    }
  };

  const handleDownload = () => {
    if (!extractedDressImage) return;
    const link = document.createElement("a");
    link.href = extractedDressImage;
    link.download = "dress-extracted.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setDressImage(null);
    setExtractedDressImage(null);
    setDressMismatchFeedback(null);
  };

  const dummyStyles = [
    { id: "standard", name: "Standard", desc: "Clean white background" },
    { id: "premium-wood", name: "Premium Wood", desc: "Elegant wooden backdrop" },
    { id: "luxury-marble", name: "Luxury Marble", desc: "Sophisticated marble finish" },
    { id: "royal-velvet", name: "Royal Velvet", desc: "Regal velvet draping" },
    { id: "garden-elegance", name: "Garden Elegance", desc: "Dreamy floral garden" },
    { id: "modern-minimal", name: "Modern Minimal", desc: "Contemporary industrial chic" },
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
        {/* Image Upload */}
        <div className="max-w-md mx-auto">
          <ImageUploader
            id="dress-extractor"
            image={dressImage}
            onUpload={handleImageUpload}
            onRemove={() => {
              setDressImage(null);
              setExtractedDressImage(null);
            }}
            label="Upload Photo with Dress"
            description="We'll extract the garment and display it on a mannequin"
          />
        </div>

        {dressImage && !extractedDressImage && (
          <>
            {/* Dummy Style Selection */}
            <div className="space-y-4">
              <h3 className="text-center text-sm font-medium text-cream/80">Choose Background Style</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {dummyStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setDummyStyle(style.id as any)}
                    className={`px-4 py-3 rounded-xl border text-center transition-all duration-300 ${
                      dummyStyle === style.id
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border/30 bg-secondary/20 text-cream/70 hover:border-primary/30"
                    }`}
                  >
                    <span className="block text-sm font-medium">{style.name}</span>
                    <span className="block text-xs opacity-60 mt-0.5">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex flex-col items-center gap-2">
              <LoadingButton
                onClick={handleExtractDress}
                isLoading={isExtractingDress}
                loadingText="Extracting dress..."
                disabled={!dressImage}
                size="lg"
                className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-10"
              >
                Extract Dress
              </LoadingButton>
              <div className="flex items-center gap-1.5 text-cream/50 text-xs">
                <Diamond className="w-3.5 h-3.5 text-primary" />
                <span>Costs {getGemCost("extract-dress-to-dummy")} gems</span>
              </div>
            </div>
          </>
        )}

        {/* Result */}
        {extractedDressImage && (
          <ResultDisplay
            result={extractedDressImage}
            originalImages={dressImage ? [{ src: dressImage, label: "Original" }] : []}
            onDownload={handleDownload}
            onRegenerate={handleExtractDress}
            onReset={handleReset}
            isProcessing={isExtractingDress}
            resetLabel="Extract Another"
          />
        )}
      </div>
    </ToolPageLayout>
  );
};

export default DressExtractorPage;
