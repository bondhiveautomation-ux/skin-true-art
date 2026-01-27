import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Loader2, Download, RefreshCw, Diamond, Play, Pause, 
  Volume2, VolumeX, Image as ImageIcon, Type, Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { getGemCost } from "@/lib/gemCosts";
import { getToolById } from "@/config/tools";

type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9";
type CameraMotion = "none" | "static" | "pan_left" | "pan_right" | "tilt_up" | "tilt_down" | "zoom_in" | "zoom_out" | "dolly_in" | "orbit" | "crane_up";
type VideoPreset = "cinematic" | "commercial" | "social" | "artistic" | "documentary" | "fashion" | "product" | "nature";

const VideographyStudioPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { deductGems, hasEnoughGems } = useGems();
  const { toast } = useToast();
  const tool = getToolById("videography-studio")!;
  const videoRef = useRef<HTMLVideoElement>(null);

  const [mode, setMode] = useState<"text" | "image">("text");
  const [prompt, setPrompt] = useState("");
  const [startingImage, setStartingImage] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [cameraMotion, setCameraMotion] = useState<CameraMotion>("none");
  const [videoPreset, setVideoPreset] = useState<VideoPreset>("cinematic");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [generationProgress, setGenerationProgress] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  // Progress simulation for better UX
  useEffect(() => {
    if (isGenerating) {
      setGenerationProgress(0);
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 3;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setGenerationProgress(0);
    }
  }, [isGenerating]);

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
      setStartingImage(e.target?.result as string);
      setGeneratedVideoUrl(null);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (mode === "text" && !prompt.trim()) {
      toast({ title: "No prompt", description: "Please enter a prompt to generate video", variant: "destructive" });
      return;
    }
    if (mode === "image" && !startingImage) {
      toast({ title: "No image", description: "Please upload a starting image", variant: "destructive" });
      return;
    }
    if (!hasEnoughGems("generate-video")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("generate-video")} gems for this feature`, variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGeneratedVideoUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: {
          prompt: mode === "text" ? prompt : (prompt || "Animate this image with subtle, natural motion"),
          startingImage: mode === "image" ? startingImage : undefined,
          aspectRatio,
          cameraMotion,
          videoPreset,
          userId: user?.id,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "Generation failed", description: data.error, variant: "destructive" });
        return;
      }

      if (data?.generatedVideoUrl) {
        const charge = await deductGems("generate-video");
        if (!charge.success) {
          toast({ title: "Couldn't charge gems", description: "Please try again.", variant: "destructive" });
          return;
        }
        setGeneratedVideoUrl(data.generatedVideoUrl);
        toast({ title: "Video generated!", description: "Your 5-second video is ready" });
      }
    } catch (error: any) {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedVideoUrl) return;
    
    try {
      const response = await fetch(generatedVideoUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback: open in new tab
      window.open(generatedVideoUrl, '_blank');
    }
  };

  const handleReset = () => {
    setStartingImage(null);
    setPrompt("");
    setGeneratedVideoUrl(null);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const aspectRatios: { value: AspectRatio; label: string; icon: string }[] = [
    { value: "16:9", label: "Landscape", icon: "🖥️" },
    { value: "9:16", label: "Portrait", icon: "📱" },
    { value: "1:1", label: "Square", icon: "⬜" },
    { value: "4:3", label: "Standard", icon: "📺" },
    { value: "21:9", label: "Cinematic", icon: "🎬" },
  ];

  const cameraMotions: { value: CameraMotion; label: string }[] = [
    { value: "none", label: "Auto" },
    { value: "static", label: "Static" },
    { value: "pan_left", label: "Pan Left" },
    { value: "pan_right", label: "Pan Right" },
    { value: "tilt_up", label: "Tilt Up" },
    { value: "tilt_down", label: "Tilt Down" },
    { value: "zoom_in", label: "Zoom In" },
    { value: "zoom_out", label: "Zoom Out" },
    { value: "dolly_in", label: "Dolly In" },
    { value: "orbit", label: "Orbit" },
    { value: "crane_up", label: "Crane Up" },
  ];

  const videoPresets: { value: VideoPreset; label: string; emoji: string; desc: string }[] = [
    { value: "cinematic", label: "Cinematic", emoji: "🎬", desc: "Film-quality motion" },
    { value: "commercial", label: "Commercial", emoji: "📺", desc: "Polished ads" },
    { value: "social", label: "Social", emoji: "📱", desc: "Dynamic content" },
    { value: "artistic", label: "Artistic", emoji: "🎨", desc: "Creative style" },
    { value: "documentary", label: "Documentary", emoji: "📽️", desc: "Natural feel" },
    { value: "fashion", label: "Fashion", emoji: "👗", desc: "Luxury aesthetic" },
    { value: "product", label: "Product", emoji: "🛍️", desc: "Showcase items" },
    { value: "nature", label: "Nature", emoji: "🌿", desc: "Organic motion" },
  ];

  const promptSuggestions = [
    "A golden sunset over calm ocean waves, drone shot",
    "Elegant fashion model walking through baroque palace",
    "Luxury perfume bottle with swirling golden particles",
    "Coffee being poured in slow motion, steam rising",
    "Abstract fluid art morphing through vibrant colors",
    "City skyline transitioning from day to night"
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
        {/* Mode Tabs */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as "text" | "image")} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-charcoal-light">
            <TabsTrigger value="text" className="gap-2 data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
              <Type className="w-4 h-4" />
              Text to Video
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-2 data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
              <ImageIcon className="w-4 h-4" />
              Image to Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-6 space-y-6">
            {/* Prompt Input */}
            <div className="max-w-2xl mx-auto space-y-3">
              <label className="block text-sm font-medium text-cream">Describe your video</label>
              <Textarea
                placeholder="A cinematic shot of a luxury watch rotating slowly, golden light reflections..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] bg-charcoal-light border-gold/20 text-cream placeholder:text-cream/40 resize-none"
              />
              {/* Quick Suggestions */}
              <div className="flex flex-wrap gap-2">
                {promptSuggestions.slice(0, 3).map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(suggestion)}
                    className="px-3 py-1.5 text-xs bg-charcoal-light border border-gold/10 rounded-full text-cream/60 hover:text-gold hover:border-gold/30 transition-colors"
                  >
                    {suggestion.slice(0, 40)}...
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="image" className="mt-6 space-y-6">
            {/* Image Upload */}
            <div className="max-w-md mx-auto">
              <ImageUploader
                id="video-starting-image"
                image={startingImage}
                onUpload={handleImageUpload}
                onRemove={() => setStartingImage(null)}
                label="Upload Starting Frame"
                description="This image will be animated into a 5-second video"
              />
            </div>
            
            {/* Optional prompt for image mode */}
            {startingImage && (
              <div className="max-w-2xl mx-auto space-y-2 animate-fade-in">
                <label className="block text-sm font-medium text-cream/70">Motion Instructions (Optional)</label>
                <Textarea
                  placeholder="Describe how you want the image to move... (e.g., 'gentle wind blowing through hair')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[80px] bg-charcoal-light border-gold/20 text-cream placeholder:text-cream/40 resize-none"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Preset Selection */}
        <div className="max-w-4xl mx-auto space-y-3">
          <label className="block text-sm font-medium text-cream text-center">Video Style</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {videoPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setVideoPreset(preset.value)}
                className={`p-4 rounded-xl border text-center transition-all duration-300 ${
                  videoPreset === preset.value
                    ? "border-gold/50 bg-gold/10 shadow-gold"
                    : "border-gold/15 bg-charcoal-light hover:border-gold/30"
                }`}
              >
                <span className="block text-2xl mb-1">{preset.emoji}</span>
                <span className={`block text-sm font-medium ${videoPreset === preset.value ? "text-gold" : "text-cream"}`}>
                  {preset.label}
                </span>
                <span className="block text-xs text-cream/50 mt-1">{preset.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Aspect Ratio */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-cream">Aspect Ratio</label>
            <div className="grid grid-cols-5 gap-2">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => setAspectRatio(ratio.value)}
                  className={`py-3 px-2 rounded-xl border text-center transition-all duration-300 ${
                    aspectRatio === ratio.value
                      ? "border-gold/50 bg-gold/10 shadow-gold"
                      : "border-gold/15 bg-charcoal-light hover:border-gold/30"
                  }`}
                >
                  <span className="block text-lg mb-1">{ratio.icon}</span>
                  <span className={`block text-[10px] font-medium ${aspectRatio === ratio.value ? "text-gold" : "text-cream/70"}`}>
                    {ratio.value}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Camera Motion */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-cream">Camera Motion</label>
            <div className="grid grid-cols-4 gap-2">
              {cameraMotions.slice(0, 8).map((motion) => (
                <button
                  key={motion.value}
                  onClick={() => setCameraMotion(motion.value)}
                  className={`py-2 px-2 rounded-lg border text-center transition-all duration-300 ${
                    cameraMotion === motion.value
                      ? "border-gold/50 bg-gold/10 shadow-gold"
                      : "border-gold/15 bg-charcoal-light hover:border-gold/30"
                  }`}
                >
                  <span className={`block text-xs font-medium ${cameraMotion === motion.value ? "text-gold" : "text-cream/70"}`}>
                    {motion.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Duration Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20">
            <Video className="w-4 h-4 text-gold" />
            <span className="text-sm text-gold font-medium">5 Second Video</span>
          </div>
        </div>

        {/* Generate Button */}
        {!generatedVideoUrl && (
          <div className="flex flex-col items-center gap-3">
            {isGenerating && (
              <div className="w-full max-w-md">
                <div className="flex justify-between text-xs text-cream/50 mb-1">
                  <span>Generating video...</span>
                  <span>{Math.round(generationProgress)}%</span>
                </div>
                <div className="h-2 bg-charcoal-light rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-gold to-gold/60 transition-all duration-500"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <p className="text-xs text-cream/40 text-center mt-2">
                  Video generation takes 1-3 minutes. Please wait...
                </p>
              </div>
            )}
            
            <LoadingButton
              onClick={handleGenerate}
              isLoading={isGenerating}
              loadingText="Generating video..."
              disabled={(mode === "text" && !prompt.trim()) || (mode === "image" && !startingImage)}
              size="lg"
              className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-12"
            >
              Generate Video
            </LoadingButton>
            <div className="flex items-center gap-1.5 text-cream/50 text-xs">
              <Diamond className="w-3.5 h-3.5 text-purple-400" />
              <span>Costs {getGemCost("generate-video")} gems</span>
            </div>
          </div>
        )}

        {/* Video Result */}
        {generatedVideoUrl && (
          <div className="space-y-6 animate-fade-in">
            <div className="max-w-3xl mx-auto">
              <div className="relative rounded-xl overflow-hidden border border-gold/20 bg-black">
                <video
                  ref={videoRef}
                  src={generatedVideoUrl}
                  className="w-full"
                  loop
                  muted={isMuted}
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={togglePlayPause}
                        className="text-white hover:bg-white/20"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>
                    </div>
                    <span className="text-xs text-white/70">5 seconds • {aspectRatio}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />
                Download Video
              </Button>
              <Button onClick={handleGenerate} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </Button>
              <Button onClick={handleReset} variant="ghost" className="gap-2">
                New Video
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
};

export default VideographyStudioPage;
