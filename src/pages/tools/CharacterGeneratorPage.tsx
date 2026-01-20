import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { ResultDisplay } from "@/components/ui/ResultDisplay";
import { SelectionGrid } from "@/components/ui/SelectionGrid";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { getGemCost } from "@/lib/gemCosts";
import { getToolById } from "@/config/tools";

const CharacterGeneratorPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { deductGems, hasEnoughGems } = useGems();
  const { toast } = useToast();
  const tool = getToolById("character-generator")!;

  // States
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [characterImage, setCharacterImage] = useState<string | null>(null);
  const [characterLeftProfile, setCharacterLeftProfile] = useState<string | null>(null);
  const [characterRightProfile, setCharacterRightProfile] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [selectedCameraAngle, setSelectedCameraAngle] = useState<string>("");
  const [selectedPose, setSelectedPose] = useState<string>("");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isRefiningPrompt, setIsRefiningPrompt] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Image upload handlers
  const createImageUploadHandler = (
    setter: (val: string | null) => void,
    resetters?: (() => void)[]
  ) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast({ title: "File too large", description: "Image must be smaller than 20MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setter(e.target?.result as string);
        resetters?.forEach((reset) => reset());
      };
      reader.readAsDataURL(file);
    };
  };

  const handleCharacterImageUpload = createImageUploadHandler(setCharacterImage, [
    () => setGeneratedImage(null),
    () => setProductImage(null),
    () => setSelectedPreset(""),
    () => setSelectedCameraAngle(""),
    () => setBackgroundImage(null),
    () => setSelectedPose(""),
    () => setGenerationPrompt(""),
  ]);

  const handleProductImageUpload = createImageUploadHandler(setProductImage, [() => setSelectedPreset("")]);
  const handleBackgroundImageUpload = createImageUploadHandler(setBackgroundImage, [() => setSelectedPose("")]);

  const handleProfileImageUpload = (side: "left" | "right") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (side === "left") setCharacterLeftProfile(e.target?.result as string);
      else setCharacterRightProfile(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateImage = async () => {
    if (!characterImage) {
      toast({ title: "No character image", description: "Please upload a character reference image first", variant: "destructive" });
      return;
    }
    if (productImage && !selectedPreset) {
      toast({ title: "No preset selected", description: "Please select a styling preset for the product", variant: "destructive" });
      return;
    }
    if (backgroundImage && !selectedPose) {
      toast({ title: "No pose selected", description: "Please select a character pose for the background integration", variant: "destructive" });
      return;
    }
    if (!productImage && !backgroundImage && !generationPrompt.trim()) {
      toast({ title: "Empty prompt", description: "Please enter a scenario prompt, upload a product, or add a background", variant: "destructive" });
      return;
    }
    if (!hasEnoughGems("generate-character-image")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("generate-character-image")} gems for this feature`, variant: "destructive" });
      return;
    }
    const gemResult = await deductGems("generate-character-image");
    if (!gemResult.success) {
      toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
      return;
    }

    setIsGeneratingImage(true);
    setGenerationProgress(0);
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => (prev >= 90 ? prev : prev + Math.random() * 15));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke("generate-character-image", {
        body: {
          characterImage,
          characterLeftProfile: characterLeftProfile || undefined,
          characterRightProfile: characterRightProfile || undefined,
          prompt: generationPrompt.trim(),
          productImage,
          preset: selectedPreset,
          cameraAngle: selectedCameraAngle || undefined,
          backgroundImage: backgroundImage || undefined,
          pose: selectedPose || undefined,
          userId: user?.id,
        },
      });
      if (error) throw error;
      if (data?.generatedImageUrl) {
        setGenerationProgress(100);
        setTimeout(() => setGeneratedImage(data.generatedImageUrl), 300);
        toast({ title: "Image generated", description: "Character-consistent image created successfully" });
      }
    } catch (error: any) {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsGeneratingImage(false);
        setGenerationProgress(0);
      }, 500);
    }
  };

  const handleDownloadGenerated = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = "generated-character-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetGenerator = () => {
    setCharacterImage(null);
    setCharacterLeftProfile(null);
    setCharacterRightProfile(null);
    setGeneratedImage(null);
    setGenerationPrompt("");
    setProductImage(null);
    setSelectedPreset("");
    setSelectedCameraAngle("");
    setBackgroundImage(null);
    setSelectedPose("");
  };

  const handleRefinePrompt = async () => {
    if (!generationPrompt.trim()) {
      toast({ title: "Empty prompt", description: "Please write a prompt to refine.", variant: "destructive" });
      return;
    }
    setIsRefiningPrompt(true);
    try {
      const { data, error } = await supabase.functions.invoke("refine-prompt", {
        body: { prompt: generationPrompt.trim() },
      });
      if (error) throw error;
      if (data?.refinedPrompt) {
        setGenerationPrompt(data.refinedPrompt);
        toast({ title: "Prompt refined ✨", description: "Your prompt has been improved for better results" });
      }
    } catch (error: any) {
      toast({ title: "Refinement failed", description: error.message || "Please try again", variant: "destructive" });
    } finally {
      setIsRefiningPrompt(false);
    }
  };

  // Preset options
  const presetOptions = [
    { id: "wearing", name: "Wearing", description: "Character wearing the product" },
    { id: "holding", name: "Holding", description: "Character holding the product" },
    { id: "showcasing", name: "Showcasing", description: "Product beside character" },
    { id: "floating", name: "Floating Display", description: "Artistic product highlight" },
    { id: "lifestyle", name: "Lifestyle", description: "Natural interaction with product" },
  ];

  const cameraAngleOptions = [
    { id: "front", name: "Front View", description: "Straight-on view" },
    { id: "side", name: "Side View", description: "Profile view from side" },
    { id: "three-quarter", name: "3/4 View", description: "Three-quarter angle" },
    { id: "back", name: "Back View", description: "Rear view showing back" },
    { id: "top-down", name: "Top-Down View", description: "Elevated angle looking down" },
  ];

  const poseOptions = [
    { id: "standing", name: "Standing", description: "Standing naturally" },
    { id: "sitting", name: "Sitting", description: "Sitting comfortably" },
    { id: "walking", name: "Walking", description: "Walking naturally" },
    { id: "leaning", name: "Leaning", description: "Leaning casually" },
    { id: "arms-crossed", name: "Arms Crossed", description: "Confident pose" },
  ];

  return (
    <ToolPageLayout
      toolName={tool.name}
      toolDescription={tool.longDescription}
      gemCostKey={tool.gemCostKey}
      icon={tool.icon}
      badge={tool.badge}
    >
      <div className="space-y-8">
        {/* Character Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-cream text-center">Upload Character Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="md:col-span-1">
              <ImageUploader
                id="character-main"
                image={characterImage}
                onUpload={handleCharacterImageUpload}
                onRemove={() => setCharacterImage(null)}
                label="Main Photo"
                description="Front-facing photo"
                aspectRatio="portrait"
              />
            </div>
            <div>
              <ImageUploader
                id="character-left"
                image={characterLeftProfile}
                onUpload={handleProfileImageUpload("left")}
                onRemove={() => setCharacterLeftProfile(null)}
                label="Left Profile"
                description="Optional side view"
                aspectRatio="portrait"
              />
            </div>
            <div>
              <ImageUploader
                id="character-right"
                image={characterRightProfile}
                onUpload={handleProfileImageUpload("right")}
                onRemove={() => setCharacterRightProfile(null)}
                label="Right Profile"
                description="Optional side view"
                aspectRatio="portrait"
              />
            </div>
          </div>
        </div>

        {characterImage && (
          <>
            {/* Product Upload (Optional) */}
            <div className="space-y-4 pt-6 border-t border-border/30">
              <h3 className="text-lg font-semibold text-cream text-center">Add Product (Optional)</h3>
              <div className="max-w-xs mx-auto">
                <ImageUploader
                  id="product-upload"
                  image={productImage}
                  onUpload={handleProductImageUpload}
                  onRemove={() => {
                    setProductImage(null);
                    setSelectedPreset("");
                  }}
                  label="Product Image"
                  description="Saree, jewelry, dress, etc."
                  aspectRatio="square"
                />
              </div>
              {productImage && (
                <div className="space-y-2">
                  <p className="text-sm text-cream/70 text-center">Product Styling</p>
                  <SelectionGrid
                    options={presetOptions}
                    selectedId={selectedPreset}
                    onSelect={setSelectedPreset}
                  />
                </div>
              )}
              {selectedPreset && (
                <div className="space-y-2">
                  <p className="text-sm text-cream/70 text-center">Camera Angle</p>
                  <SelectionGrid
                    options={cameraAngleOptions}
                    selectedId={selectedCameraAngle}
                    onSelect={setSelectedCameraAngle}
                  />
                </div>
              )}
            </div>

            {/* Background Upload (Optional) */}
            <div className="space-y-4 pt-6 border-t border-border/30">
              <h3 className="text-lg font-semibold text-cream text-center">Custom Background (Optional)</h3>
              <div className="max-w-xs mx-auto">
                <ImageUploader
                  id="background-upload"
                  image={backgroundImage}
                  onUpload={handleBackgroundImageUpload}
                  onRemove={() => {
                    setBackgroundImage(null);
                    setSelectedPose("");
                  }}
                  label="Background Image"
                  description="Scene or location"
                  aspectRatio="landscape"
                />
              </div>
              {backgroundImage && (
                <div className="space-y-2">
                  <p className="text-sm text-cream/70 text-center">Character Pose</p>
                  <SelectionGrid
                    options={poseOptions}
                    selectedId={selectedPose}
                    onSelect={setSelectedPose}
                  />
                </div>
              )}
            </div>

            {/* Prompt Section */}
            <div className="space-y-4 pt-6 border-t border-border/30">
              <h3 className="text-lg font-semibold text-cream text-center">Scenario Prompt</h3>
              <Textarea
                placeholder="Describe the scenario you want to generate... e.g., 'Standing in a luxury palace garden wearing an elegant red saree'"
                value={generationPrompt}
                onChange={(e) => setGenerationPrompt(e.target.value)}
                className="min-h-[100px] bg-secondary/30 border-border/50 text-cream placeholder:text-cream/40 resize-none"
              />
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefinePrompt}
                  disabled={isRefiningPrompt || !generationPrompt.trim()}
                  className="text-sm"
                >
                  {isRefiningPrompt ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Refining...
                    </>
                  ) : (
                    "✨ Refine Prompt (Free)"
                  )}
                </Button>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex flex-col items-center gap-2 pt-4">
              <LoadingButton
                onClick={handleGenerateImage}
                isLoading={isGeneratingImage}
                loadingText={`Generating... ${generationProgress.toFixed(0)}%`}
                disabled={!characterImage}
                size="lg"
                className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-10"
              >
                Generate Image
              </LoadingButton>
              <div className="flex items-center gap-1.5 text-cream/50 text-xs">
                <Diamond className="w-3.5 h-3.5 text-primary" />
                <span>Costs {getGemCost("generate-character-image")} gems</span>
              </div>
            </div>

            {/* Result */}
            {generatedImage && (
              <ResultDisplay
                result={generatedImage}
                originalImages={characterImage ? [{ src: characterImage, label: "Character" }] : []}
                onDownload={handleDownloadGenerated}
                onRegenerate={handleGenerateImage}
                onReset={handleResetGenerator}
                isProcessing={isGeneratingImage}
                resetLabel="Start New"
              />
            )}
          </>
        )}
      </div>
    </ToolPageLayout>
  );
};

export default CharacterGeneratorPage;
