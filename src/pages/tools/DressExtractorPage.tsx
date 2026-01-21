import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Diamond, Search, RefreshCw, User, Users } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { ResultDisplay } from "@/components/ui/ResultDisplay";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { getGemCost, getGemCostAsync } from "@/lib/gemCosts";
import { getToolById } from "@/config/tools";
import { fileToNormalizedDataUrl } from "@/lib/image";

type ExtractionType = "single-upper" | "single-full" | "couple";

const DressExtractorPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { deductGems, hasEnoughGems, refetchGems } = useGems();
  const { toast } = useToast();
  const tool = getToolById("dress-extractor")!;

  const [dressImage, setDressImage] = useState<string | null>(null);
  const [dressFile, setDressFile] = useState<File | null>(null);
  const [extractedDressImage, setExtractedDressImage] = useState<string | null>(null);
  const [isExtractingDress, setIsExtractingDress] = useState(false);
  const [dummyStyle, setDummyStyle] = useState<"standard" | "premium-wood" | "luxury-marble" | "royal-velvet" | "garden-elegance" | "modern-minimal">("standard");
  const [dressMismatchFeedback, setDressMismatchFeedback] = useState<string | null>(null);
  const [extractionType, setExtractionType] = useState<ExtractionType>("single-full");
  
  // Inspect feature state
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<{ verdict: string; explanation: string; gemsRefunded: number } | null>(null);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [generationTimestamp, setGenerationTimestamp] = useState<number | null>(null);
  const [inputImageUrl, setInputImageUrl] = useState<string | null>(null);

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

    setDressFile(file);
    fileToNormalizedDataUrl(file)
      .then((dataUrl) => {
        setDressImage(dataUrl);
        setExtractedDressImage(null);
        setInspectionResult(null);
        setShowFeedbackInput(false);
        setFeedbackText("");
        setGenerationTimestamp(null);
        setInputImageUrl(null);
      })
      .catch((err) => {
        console.error("Failed to read image", err);
        toast({
          title: "Upload failed",
          description: "Could not read this image file.",
          variant: "destructive",
        });
      });
  };

  const handleExtractDress = async () => {
    if (!dressImage || !dressFile) {
      toast({ title: "No image uploaded", description: "Please upload an image first", variant: "destructive" });
      return;
    }
    if (!hasEnoughGems("extract-dress-to-dummy")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("extract-dress-to-dummy")} gems for this feature`, variant: "destructive" });
      return;
    }
    
    setIsExtractingDress(true);
    setInspectionResult(null);
    setShowFeedbackInput(false);
    
    try {
      // Upload input image first to keep the request payload small and reduce network failures
      const inputPath = `${user?.id}/dress-extractor/input_${Date.now()}_${Math.random().toString(16).slice(2)}.${(dressFile.type.split("/")[1] || "png").toLowerCase()}`;

      const { error: uploadError } = await supabase.storage
        .from("temp-uploads")
        .upload(inputPath, dressFile, {
          contentType: dressFile.type || "image/png",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Failed to upload image. Please try again. (${uploadError.message})`);
      }

      const { data: publicUrlData } = supabase.storage.from("temp-uploads").getPublicUrl(inputPath);
      const uploadedInputUrl = publicUrlData?.publicUrl;
      if (!uploadedInputUrl) {
        throw new Error("Failed to prepare image for processing. Please try again.");
      }

      // Store for inspect feature
      setInputImageUrl(uploadedInputUrl);

      // Retry once on transient request failures
      let lastErr: any = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        const { data, error } = await supabase.functions.invoke("extract-dress-to-dummy", {
          body: { 
            image: uploadedInputUrl, 
            userId: user?.id, 
            dummyStyle, 
            extractionType,
            correctionFeedback: dressMismatchFeedback 
          },
        });

        if (!error) {
          if (data?.error) {
            toast({ title: "Extraction failed", description: data.error, variant: "destructive" });
            return;
          }
          if (data?.extractedImage) {
            // Only deduct gems AFTER successful generation
            const gemResult = await deductGems("extract-dress-to-dummy");
            if (!gemResult.success) {
              console.error("Gem deduction failed after successful generation");
            }
            
            setExtractedDressImage(data.extractedImage);
            setDressMismatchFeedback(null);
            setGenerationTimestamp(Date.now());
            toast({ title: "Dress extracted!", description: "The garment has been placed on the mannequin" });
          }
          lastErr = null;
          break;
        }

        lastErr = error;
        const msg = (error as any)?.message || "";
        if (!/Failed to send a request/i.test(msg) || attempt === 1) break;
        await new Promise((r) => setTimeout(r, 600));
      }

      if (lastErr) throw lastErr;
    } catch (error: any) {
      toast({ title: "Extraction failed", description: error.message, variant: "destructive" });
    } finally {
      setIsExtractingDress(false);
    }
  };

  // Check if inspect is still available (within 5 minutes)
  const canInspect = () => {
    if (!generationTimestamp) return false;
    const fiveMinutesMs = 5 * 60 * 1000;
    return Date.now() - generationTimestamp < fiveMinutesMs;
  };

  const handleInspect = async () => {
    if (!inputImageUrl || !extractedDressImage) {
      toast({ title: "Cannot inspect", description: "Missing original or generated image", variant: "destructive" });
      return;
    }
    
    if (!canInspect()) {
      toast({ title: "Inspection expired", description: "Inspection is only available within 5 minutes of generation", variant: "destructive" });
      return;
    }

    setIsInspecting(true);
    
    try {
      const gemCost = await getGemCostAsync("extract-dress-to-dummy");
      
      const { data, error } = await supabase.functions.invoke("inspect-generation", {
        body: {
          inputImage: inputImageUrl,
          outputImage: extractedDressImage,
          featureName: "Dress Extractor",
          userId: user?.id,
          gemCost: gemCost
        }
      });

      if (error) throw error;

      setInspectionResult(data);
      
      if (data.verdict === "mismatch") {
        setShowFeedbackInput(true);
        if (data.gemsRefunded > 0) {
          await refetchGems();
          toast({ 
            title: "Mismatch detected!", 
            description: `${data.gemsRefunded} gems have been refunded. You can provide feedback and regenerate.`,
          });
        } else {
          toast({ 
            title: "Mismatch detected!", 
            description: "You can provide feedback and regenerate.",
          });
        }
      } else {
        toast({ 
          title: "Match confirmed", 
          description: "The dress extraction looks correct!",
        });
      }
    } catch (error: any) {
      console.error("Inspection error:", error);
      toast({ title: "Inspection failed", description: error.message || "Please try again", variant: "destructive" });
    } finally {
      setIsInspecting(false);
    }
  };

  const handleRegenerateWithFeedback = async () => {
    if (feedbackText.trim()) {
      setDressMismatchFeedback(feedbackText.trim());
    }
    setShowFeedbackInput(false);
    setInspectionResult(null);
    setExtractedDressImage(null);
    
    // Trigger regeneration
    setTimeout(() => {
      handleExtractDress();
    }, 100);
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
    setDressFile(null);
    setExtractedDressImage(null);
    setDressMismatchFeedback(null);
    setInspectionResult(null);
    setShowFeedbackInput(false);
    setFeedbackText("");
    setGenerationTimestamp(null);
    setInputImageUrl(null);
  };

  const dummyStyles = [
    { id: "standard", name: "Standard", desc: "Clean white background" },
    { id: "premium-wood", name: "Premium Wood", desc: "Elegant wooden backdrop" },
    { id: "luxury-marble", name: "Luxury Marble", desc: "Sophisticated marble finish" },
    { id: "royal-velvet", name: "Royal Velvet", desc: "Regal velvet draping" },
    { id: "garden-elegance", name: "Garden Elegance", desc: "Dreamy floral garden" },
    { id: "modern-minimal", name: "Modern Minimal", desc: "Contemporary industrial chic" },
  ];

  const extractionTypes = [
    { 
      id: "single-upper" as ExtractionType, 
      name: "Upper Body Only", 
      desc: "Top/blouse only - upper mannequin",
      icon: User
    },
    { 
      id: "single-full" as ExtractionType, 
      name: "Full Body", 
      desc: "Full dress - complete mannequin",
      icon: User
    },
    { 
      id: "couple" as ExtractionType, 
      name: "Couple (2 People)", 
      desc: "Extract both outfits",
      icon: Users
    },
  ];

  // Calculate remaining time for inspect
  const getInspectTimeRemaining = () => {
    if (!generationTimestamp) return null;
    const fiveMinutesMs = 5 * 60 * 1000;
    const elapsed = Date.now() - generationTimestamp;
    const remaining = Math.max(0, fiveMinutesMs - elapsed);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
            id="dress-extractor"
            image={dressImage}
            onUpload={handleImageUpload}
            onRemove={() => {
              setDressImage(null);
              setDressFile(null);
              setExtractedDressImage(null);
              setInspectionResult(null);
              setShowFeedbackInput(false);
            }}
            label="Upload Photo with Dress"
            description="We'll extract the garment and display it on a mannequin"
          />
        </div>

        {dressImage && !extractedDressImage && (
          <>
            {/* Extraction Type Selection */}
            <div className="space-y-4">
              <h3 className="text-center text-sm font-medium text-cream/80">What's in your photo?</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {extractionTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setExtractionType(type.id)}
                      className={`px-5 py-4 rounded-xl border text-center transition-all duration-300 min-w-[140px] ${
                        extractionType === type.id
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border/30 bg-secondary/20 text-cream/70 hover:border-primary/30"
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 mx-auto mb-2 ${type.id === "couple" ? "" : ""}`} />
                      <span className="block text-sm font-medium">{type.name}</span>
                      <span className="block text-xs opacity-60 mt-0.5">{type.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

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
          <>
            <ResultDisplay
              result={extractedDressImage}
              originalImages={dressImage ? [{ src: dressImage, label: "Original" }] : []}
              onDownload={handleDownload}
              onRegenerate={handleExtractDress}
              onReset={handleReset}
              isProcessing={isExtractingDress}
              resetLabel="Extract Another"
            />

            {/* Inspect Feature */}
            {!inspectionResult && canInspect() && (
              <div className="flex flex-col items-center gap-3 p-4 bg-secondary/20 rounded-xl border border-border/30">
                <p className="text-sm text-cream/70 text-center">
                  Not happy with the result? Inspect within <span className="font-semibold text-primary">{getInspectTimeRemaining()}</span> to get a refund if there's a mismatch.
                </p>
                <Button
                  onClick={handleInspect}
                  disabled={isInspecting}
                  variant="outline"
                  className="gap-2"
                >
                  {isInspecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Inspecting...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Inspect Result
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Inspection Result */}
            {inspectionResult && (
              <div className={`p-4 rounded-xl border ${
                inspectionResult.verdict === "mismatch" 
                  ? "bg-destructive/10 border-destructive/30" 
                  : "bg-primary/10 border-primary/30"
              }`}>
                <div className="text-center space-y-2">
                  <p className={`font-semibold ${
                    inspectionResult.verdict === "mismatch" ? "text-destructive" : "text-primary"
                  }`}>
                    {inspectionResult.verdict === "mismatch" ? "❌ Mismatch Detected" : "✅ Match Confirmed"}
                  </p>
                  <p className="text-sm text-cream/70">{inspectionResult.explanation}</p>
                  {inspectionResult.gemsRefunded > 0 && (
                    <p className="text-sm text-primary font-medium">
                      💎 {inspectionResult.gemsRefunded} gems refunded!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Feedback Input for Mismatch */}
            {showFeedbackInput && (
              <div className="space-y-4 p-4 bg-secondary/20 rounded-xl border border-border/30">
                <div className="text-center">
                  <h4 className="font-medium text-cream">Help us fix it!</h4>
                  <p className="text-sm text-cream/60">Tell us what's wrong so we can regenerate it correctly.</p>
                </div>
                <Textarea
                  placeholder="e.g., 'The neckline should be V-neck, not round' or 'The color should be red, not pink'"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="min-h-[80px] bg-secondary/30 border-border/50 text-cream placeholder:text-cream/40 resize-none"
                />
                <div className="flex justify-center">
                  <Button
                    onClick={handleRegenerateWithFeedback}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate with Feedback
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolPageLayout>
  );
};

export default DressExtractorPage;
