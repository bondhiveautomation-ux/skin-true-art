import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const comparisonRef = useRef<HTMLDivElement>(null);
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
    };
    reader.readAsDataURL(file);
  };

  const handleEnhance = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-skin', {
        body: { imageUrl: selectedImage }
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
              {/* Image Display */}
              {showComparison && enhancedImage ? (
                // Before/After Comparison
                <div className="relative overflow-hidden rounded-xl">
                  <div 
                    ref={comparisonRef}
                    className="relative aspect-[3/4] w-full max-w-2xl mx-auto select-none"
                    onMouseMove={(e) => {
                      if (!isDragging || !comparisonRef.current) return;
                      const rect = comparisonRef.current.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                      setSliderPosition(percentage);
                    }}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                  >
                    {/* Enhanced Image (Background) */}
                    <img
                      src={enhancedImage}
                      alt="Enhanced"
                      className="absolute inset-0 h-full w-full object-contain pointer-events-none"
                      draggable={false}
                    />
                    
                    {/* Original Image (Overlay with clip) */}
                    <div
                      className="absolute inset-0 h-full w-full pointer-events-none"
                      style={{
                        clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                      }}
                    >
                      <img
                        src={selectedImage}
                        alt="Original"
                        className="h-full w-full object-contain"
                        draggable={false}
                      />
                    </div>

                    {/* Slider */}
                    <div
                      className="absolute inset-y-0 w-1 bg-accent cursor-ew-resize z-10"
                      style={{ left: `${sliderPosition}%` }}
                      onMouseDown={(e) => {
                        e.preventDefault();
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
