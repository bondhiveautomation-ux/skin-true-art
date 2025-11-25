import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancementMode, setEnhancementMode] = useState<"preserve" | "remove">("preserve");
  const [showComparison, setShowComparison] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const comparisonRef = useRef<HTMLDivElement>(null);
  const [generationPrompt, setGenerationPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [characterImage, setCharacterImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCharacterImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCharacterImage(e.target?.result as string);
      setGeneratedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setEnhancedImage(null);
      setShowComparison(false);
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleEnhance = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-skin', {
        body: { imageUrl: selectedImage, mode: enhancementMode }
      });

      if (error) throw error;

      if (data?.enhancedImageUrl) {
        setEnhancedImage(data.enhancedImageUrl);
        setShowComparison(true);
        toast({
          title: "Enhancement complete",
          description: "Your portrait has been enhanced with natural skin texture",
        });
      }
    } catch (error: any) {
      console.error('Enhancement error:', error);
      toast({
        title: "Enhancement failed",
        description: error.message || "Failed to enhance image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!enhancedImage) return;
    
    const link = document.createElement('a');
    link.href = enhancedImage;
    link.download = 'enhanced-portrait.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setEnhancedImage(null);
    setShowComparison(false);
    setSliderPosition(50);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
    if (zoomLevel <= 1.5) {
      setPanPosition({ x: 0, y: 0 });
    }
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handlePanStart = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (isPanning && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  const handleGenerateImage = async () => {
    if (!characterImage) {
      toast({
        title: "No character image",
        description: "Please upload a character reference image first",
        variant: "destructive",
      });
      return;
    }

    if (!generationPrompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a scenario prompt",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-character-image', {
        body: { 
          characterImage: characterImage,
          prompt: generationPrompt.trim()
        }
      });

      if (error) throw error;

      if (data?.generatedImageUrl) {
        setGeneratedImage(data.generatedImageUrl);
        toast({
          title: "Image generated",
          description: "Character-consistent image created successfully",
        });
      }
    } catch (error: any) {
      console.error('Image generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownloadGenerated = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'generated-character-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetGenerator = () => {
    setCharacterImage(null);
    setGeneratedImage(null);
    setGenerationPrompt("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary p-6 md:p-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="mb-3 text-5xl font-bold tracking-tight text-foreground">
            Skin Texture
            <span className="ml-3 text-accent">Enhancement</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Ultra-realistic skin enhancement that preserves your identity
          </p>
        </header>

        {/* Main Content */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl">
          {!selectedImage ? (
            // Upload Area
            <div className="flex min-h-[500px] flex-col items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="group cursor-pointer"
              >
                <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-border p-16 transition-all hover:border-accent hover:bg-secondary/50">
                  <div className="rounded-full bg-accent/10 p-6 transition-all group-hover:bg-accent/20">
                    <Upload className="h-12 w-12 text-accent" />
                  </div>
                  <div className="text-center">
                    <p className="mb-2 text-xl font-semibold text-foreground">
                      Upload Portrait
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Click to select or drag and drop
                    </p>
                  </div>
                </div>
              </label>
            </div>
          ) : (
            // Image Processing & Results
            <div className="space-y-6">
              {/* Enhancement Mode Selector */}
              {!showComparison && (
                <div className="flex items-center justify-center gap-4 pb-4 border-b border-border">
                  <label className="text-sm font-medium text-foreground">Enhancement Mode:</label>
                  <div className="flex gap-2">
                    <Button
                      variant={enhancementMode === "preserve" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEnhancementMode("preserve")}
                    >
                      Preserve Makeup
                    </Button>
                    <Button
                      variant={enhancementMode === "remove" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEnhancementMode("remove")}
                    >
                      Remove Makeup
                    </Button>
                  </div>
                </div>
              )}

              {/* Image Display */}
              {showComparison && enhancedImage ? (
                // Before/After Comparison with Zoom
                <div className="space-y-4">
                  {/* Zoom Controls */}
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 1}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <ZoomOut className="h-4 w-4" />
                      Zoom Out
                    </Button>
                    <Button
                      onClick={handleResetZoom}
                      disabled={zoomLevel === 1}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Maximize2 className="h-4 w-4" />
                      Reset ({Math.round(zoomLevel * 100)}%)
                    </Button>
                    <Button
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 4}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <ZoomIn className="h-4 w-4" />
                      Zoom In
                    </Button>
                  </div>

                  <div className="relative overflow-hidden rounded-xl bg-secondary/50">
                    <div 
                      ref={comparisonRef}
                      className="relative w-full max-w-2xl mx-auto select-none"
                      style={{
                        cursor: zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
                      }}
                      onMouseMove={(e) => {
                        if (isDragging && !isPanning && comparisonRef.current) {
                          const rect = comparisonRef.current.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                          setSliderPosition(percentage);
                        }
                        handlePanMove(e);
                      }}
                      onMouseDown={(e) => {
                        if (zoomLevel > 1 && !(e.target as HTMLElement).closest('.slider-handle')) {
                          handlePanStart(e);
                        }
                      }}
                      onMouseUp={() => {
                        setIsDragging(false);
                        handlePanEnd();
                      }}
                      onMouseLeave={() => {
                        setIsDragging(false);
                        handlePanEnd();
                      }}
                    >
                      {/* Enhanced Image (Background) */}
                      <div
                        className="relative w-full"
                        style={{
                          transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                          transformOrigin: 'center center',
                          transition: isPanning ? 'none' : 'transform 0.2s ease-out',
                        }}
                      >
                        <img
                          src={enhancedImage}
                          alt="Enhanced"
                          className="w-full h-auto object-contain pointer-events-none"
                          draggable={false}
                        />
                      </div>
                      
                      {/* Original Image (Overlay with clip) */}
                      <div
                        className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
                        style={{
                          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                        }}
                      >
                        <div
                          className="relative w-full h-full"
                          style={{
                            transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                            transformOrigin: 'center center',
                            transition: isPanning ? 'none' : 'transform 0.2s ease-out',
                          }}
                        >
                          <img
                            src={selectedImage}
                            alt="Original"
                            className="w-full h-auto object-contain"
                            draggable={false}
                          />
                        </div>
                      </div>

                      {/* Slider */}
                      <div
                        className="slider-handle absolute inset-y-0 w-1 bg-accent cursor-ew-resize z-10"
                        style={{ left: `${sliderPosition}%` }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(true);
                        }}
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full bg-accent p-2 shadow-lg pointer-events-none">
                          <ChevronLeft className="h-4 w-4 text-background" />
                          <ChevronRight className="h-4 w-4 text-background" />
                        </div>
                      </div>

                      {/* Labels */}
                      <div className="absolute bottom-4 left-4 rounded-lg bg-background/80 px-3 py-1 backdrop-blur-sm pointer-events-none">
                        <span className="text-sm font-medium text-foreground">Original</span>
                      </div>
                      <div className="absolute bottom-4 right-4 rounded-lg bg-background/80 px-3 py-1 backdrop-blur-sm pointer-events-none">
                        <span className="text-sm font-medium text-foreground">Enhanced</span>
                      </div>
                    </div>

                    {/* Pan instruction */}
                    {zoomLevel > 1 && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-lg bg-accent/90 px-3 py-1 text-xs text-background backdrop-blur-sm">
                        Click and drag to pan
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Single Image Display
                <div className="flex justify-center">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="max-h-[600px] rounded-xl object-contain"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                {!showComparison ? (
                  <>
                    <Button
                      onClick={handleEnhance}
                      disabled={isProcessing}
                      className="bg-accent text-background hover:bg-accent/90"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        'Enhance Skin Texture'
                      )}
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="lg"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleDownload}
                      className="bg-accent text-background hover:bg-accent/90"
                      size="lg"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download Enhanced
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="lg"
                    >
                      Upload New Photo
                    </Button>
                  </>
                )}
              </div>

              {/* Processing Message */}
              {isProcessing && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Adding natural skin texture while preserving your identity...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Character-Consistent Image Generator Section */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-3xl font-bold text-foreground">
              Character-Consistent <span className="text-accent">Image Generator</span>
            </h2>
            <p className="text-muted-foreground">
              Generate images with the exact same character in any scenario
            </p>
          </div>

          <div className="space-y-6">
            {/* Character Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Character Reference Image
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Upload an influencer or character image - the AI will keep their exact face and body in all generated images
              </p>
              
              {!characterImage ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCharacterImageUpload}
                    className="hidden"
                    id="character-upload"
                  />
                  <label
                    htmlFor="character-upload"
                    className="group cursor-pointer block"
                  >
                    <div className="flex items-center gap-4 rounded-lg border-2 border-dashed border-border p-8 transition-all hover:border-accent hover:bg-secondary/50">
                      <div className="rounded-full bg-accent/10 p-4 transition-all group-hover:bg-accent/20">
                        <Upload className="h-8 w-8 text-accent" />
                      </div>
                      <div>
                        <p className="text-base font-medium text-foreground">
                          Upload Character Reference
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Click to select an influencer or character image
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg border border-accent/20 bg-accent/5 p-4">
                    <img
                      src={characterImage}
                      alt="Character reference"
                      className="max-h-[300px] rounded-lg object-contain mx-auto"
                    />
                    <Button
                      onClick={handleResetGenerator}
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                    >
                      Reset
                    </Button>
                    <div className="mt-3 text-center">
                      <p className="text-sm font-medium text-accent">
                        ✓ Character locked - Face and body will remain identical
                      </p>
                    </div>
                  </div>

                  {/* Scenario Prompt */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Scenario Prompt
                    </label>
                    <textarea
                      value={generationPrompt}
                      onChange={(e) => setGenerationPrompt(e.target.value)}
                      placeholder="Describe the scenario... (e.g., 'walking on a beach at sunset, wearing a white dress, golden hour lighting')"
                      className="min-h-[120px] w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                      disabled={isGeneratingImage}
                    />
                  </div>

                  {/* Generate Button */}
                  <div className="flex justify-center">
                    <Button
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage || !generationPrompt.trim()}
                      className="bg-accent text-background hover:bg-accent/90"
                      size="lg"
                    >
                      {isGeneratingImage ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating Image...
                        </>
                      ) : (
                        'Generate Character-Consistent Image'
                      )}
                    </Button>
                  </div>

                  {/* Generated Image Display */}
                  {generatedImage && (
                    <div className="space-y-4 rounded-lg border border-accent/20 bg-accent/5 p-6">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">Generated Image</label>
                        <Button
                          onClick={handleDownloadGenerated}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                      <div className="rounded-lg bg-background p-4">
                        <img
                          src={generatedImage}
                          alt="Generated"
                          className="w-full rounded-lg object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Our AI enhances skin texture naturally while preserving your exact facial features and identity
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
