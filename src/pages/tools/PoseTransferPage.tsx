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

const PoseTransferPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { deductGems, hasEnoughGems } = useGems();
  const { toast } = useToast();
  const tool = getToolById("pose-transfer")!;

  const [characterImage, setCharacterImage] = useState<string | null>(null);
  const [poseImage, setPoseImage] = useState<string | null>(null);
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

  const handleCharacterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setCharacterImage(e.target?.result as string);
      setResultImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handlePoseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setPoseImage(e.target?.result as string);
      setResultImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!characterImage || !poseImage) {
      toast({ title: "Missing images", description: "Please upload both character and pose images", variant: "destructive" });
      return;
    }
    if (!hasEnoughGems("pose-transfer")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("pose-transfer")} gems for this feature`, variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("pose-transfer", { 
        body: { 
          influencerImage: characterImage, 
          poseReferenceImage: poseImage,
          userId: user?.id 
        } 
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Processing failed", description: data.error, variant: "destructive" });
        return;
      }
      
      const gemResult = await deductGems("pose-transfer");
      if (!gemResult.success) {
        toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
        return;
      }
      
      if (data?.resultImage) {
        setResultImage(data.resultImage);
        toast({ title: "Pose transferred!", description: "Your character now has the new pose" });
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
    link.download = 'pose-transfer-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setCharacterImage(null);
    setPoseImage(null);
    setResultImage(null);
  };

  return (
    <ToolPageLayout
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
              id="character-image"
              image={characterImage}
              onUpload={handleCharacterUpload}
              onRemove={() => { setCharacterImage(null); setResultImage(null); }}
              label="Your Character"
              description="Upload the person whose identity to keep"
            />
          </div>
          <div>
            <ImageUploader
              id="pose-reference"
              image={poseImage}
              onUpload={handlePoseUpload}
              onRemove={() => { setPoseImage(null); setResultImage(null); }}
              label="Pose Reference"
              description="Upload the pose you want to apply"
            />
          </div>
        </div>

        {/* Generate Button */}
        {!resultImage && (
          <div className="flex flex-col items-center gap-2">
            <LoadingButton
              onClick={handleProcess}
              isLoading={isProcessing}
              loadingText="Transferring pose..."
              disabled={!characterImage || !poseImage}
              size="lg"
              className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-12"
            >
              Transfer Pose
            </LoadingButton>
            <div className="flex items-center gap-1.5 text-cream/50 text-xs">
              <Diamond className="w-3.5 h-3.5 text-purple-400" />
              <span>Costs {getGemCost("pose-transfer")} gems</span>
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

export default PoseTransferPage;
