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
  const [basicPrompt, setBasicPrompt] = useState("");
  const [detailedPrompt, setDetailedPrompt] = useState("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const { toast } = useToast();

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

  const handleGeneratePrompt = async () => {
    if (!basicPrompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a basic prompt first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPrompt(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-prompt', {
        body: { basicPrompt: basicPrompt.trim() }
      });

      if (error) throw error;

      if (data?.detailedPrompt) {
        setDetailedPrompt(data.detailedPrompt);
        toast({
          title: "Prompt generated",
          description: "Ultra-detailed prompt created successfully",
        });
      }
    } catch (error: any) {
      console.error('Prompt generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(detailedPrompt);
    toast({
      title: "Copied",
      description: "Prompt copied to clipboard",
    });
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

        {/* Prompt Generator Section */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-3xl font-bold text-foreground">
              Ultra-Detailed <span className="text-accent">Prompt Generator</span>
            </h2>
            <p className="text-muted-foreground">
              Transform basic ideas into hyper-realistic, professional image generation prompts
            </p>
          </div>

          <div className="space-y-6">
            {/* Input Area */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Basic Prompt</label>
              <textarea
                value={basicPrompt}
                onChange={(e) => setBasicPrompt(e.target.value)}
                placeholder="Enter your basic idea... (e.g., 'a woman in a red dress')"
                className="min-h-[100px] w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                disabled={isGeneratingPrompt}
              />
            </div>

            {/* Generate Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleGeneratePrompt}
                disabled={isGeneratingPrompt || !basicPrompt.trim()}
                className="bg-accent text-background hover:bg-accent/90"
                size="lg"
              >
                {isGeneratingPrompt ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Ultra-Detailed Prompt...
                  </>
                ) : (
                  'Generate Ultra-Detailed Prompt'
                )}
              </Button>
            </div>

            {/* Generated Prompt Display */}
            {detailedPrompt && (
              <div className="space-y-3 rounded-lg border border-accent/20 bg-accent/5 p-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Ultra-Detailed Prompt</label>
                  <Button
                    onClick={handleCopyPrompt}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                </div>
                <div className="max-h-[400px] overflow-y-auto rounded-md bg-background p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {detailedPrompt}
                  </p>
                </div>
              </div>
            )}
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
