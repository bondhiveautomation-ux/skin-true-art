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

const FaceSwapPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { deductGems, refundGems, hasEnoughGems } = useGems();
  const { toast } = useToast();
  const tool = getToolById("face-swap")!;

  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [targetImage, setTargetImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleSourceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setSourceImage(e.target?.result as string);
      setResultImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleTargetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setTargetImage(e.target?.result as string);
      setResultImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!sourceImage || !targetImage) {
      toast({ title: "Missing images", description: "Please upload both source and target images", variant: "destructive" });
      return;
    }
    if (!hasEnoughGems("face-swap")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("face-swap")} gems for this feature`, variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);
    
    // Deduct gems immediately
    const gemResult = await deductGems("face-swap");
    if (!gemResult.success) {
      setIsProcessing(false);
      toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("face-swap", { 
        body: { 
          sourceImage, 
          targetImage,
          userId: user?.id 
        } 
      });
      if (error) throw error;
      if (data?.error) {
        await refundGems("face-swap");
        toast({ title: "Processing failed", description: data.error, variant: "destructive" });
        return;
      }
      
      if (data?.generatedImageUrl) {
        setResultImage(data.generatedImageUrl);
        toast({ title: "Face swapped!", description: "Your face swap is ready" });
      } else {
        await refundGems("face-swap");
        toast({ title: "Processing failed", description: "No result received", variant: "destructive" });
      }
    } catch (error: any) {
      await refundGems("face-swap");
      toast({ title: "Processing failed", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'face-swap-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSourceImage(null);
    setTargetImage(null);
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
        {/* Image Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div>
            <ImageUploader
              id="source-face"
              image={sourceImage}
              onUpload={handleSourceUpload}
              onRemove={() => { setSourceImage(null); setResultImage(null); }}
              label="Source Face"
              description="The face you want to use"
            />
          </div>
          <div>
            <ImageUploader
              id="target-image"
              image={targetImage}
              onUpload={handleTargetUpload}
              onRemove={() => { setTargetImage(null); setResultImage(null); }}
              label="Target Image"
              description="The image to put the face on"
            />
          </div>
        </div>

        {/* Generate Button */}
        {!resultImage && (
          <div className="flex flex-col items-center gap-2">
            <LoadingButton
              onClick={handleProcess}
              isLoading={isProcessing}
              loadingText="Swapping face..."
              disabled={!sourceImage || !targetImage}
              size="lg"
              className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-12"
            >
              Swap Face
            </LoadingButton>
            <div className="flex items-center gap-1.5 text-cream/50 text-xs">
              <Diamond className="w-3.5 h-3.5 text-purple-400" />
              <span>Costs {getGemCost("face-swap")} gems</span>
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

export default FaceSwapPage;
