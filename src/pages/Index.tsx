import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Copy, Sparkles, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/layout/Hero";
import { ToolSection } from "@/components/layout/ToolSection";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { ResultDisplay } from "@/components/ui/ResultDisplay";
import { SelectionGrid } from "@/components/ui/SelectionGrid";

const Index = () => {
  const [activeSection, setActiveSection] = useState("hero");
  
  // Skin Enhancement states
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
  
  // Character Generator states
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
  
  // Prompt Extractor states
  const [extractorImage, setExtractorImage] = useState<string | null>(null);
  const [extractedPrompt, setExtractedPrompt] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  
  // Dress Extractor states
  const [dressImage, setDressImage] = useState<string | null>(null);
  const [extractedDressImage, setExtractedDressImage] = useState<string | null>(null);
  const [isExtractingDress, setIsExtractingDress] = useState(false);
  
  // Background Saver states
  const [peopleImage, setPeopleImage] = useState<string | null>(null);
  const [cleanBackground, setCleanBackground] = useState<string | null>(null);
  const [isRemovingPeople, setIsRemovingPeople] = useState(false);
  
  // Pose Transfer states
  const [poseInfluencerImage, setPoseInfluencerImage] = useState<string | null>(null);
  const [poseReferenceImage, setPoseReferenceImage] = useState<string | null>(null);
  const [poseTransferResult, setPoseTransferResult] = useState<string | null>(null);
  const [isTransferringPose, setIsTransferringPose] = useState(false);
  
  // Makeup Studio states
  const [makeupImage, setMakeupImage] = useState<string | null>(null);
  const [selectedMakeupStyle, setSelectedMakeupStyle] = useState<string>("");
  const [makeupResult, setMakeupResult] = useState<string | null>(null);
  const [isApplyingMakeup, setIsApplyingMakeup] = useState(false);
  
  // Full Look Transfer states
  const [fullLookFaceImage, setFullLookFaceImage] = useState<string | null>(null);
  const [fullLookReferenceImage, setFullLookReferenceImage] = useState<string | null>(null);
  const [fullLookResult, setFullLookResult] = useState<string | null>(null);
  const [isTransferringLook, setIsTransferringLook] = useState(false);
  
  const { toast } = useToast();

  // Scroll to section handler
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Generic image upload handler
  const createImageUploadHandler = (
    setter: (val: string | null) => void,
    resetters?: (() => void)[]
  ) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
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

      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be smaller than 20MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setter(e.target?.result as string);
        resetters?.forEach(reset => reset());
      };
      reader.readAsDataURL(file);
    };
  };

  // ==================== SKIN ENHANCEMENT ====================
  const handleImageUpload = createImageUploadHandler(setSelectedImage, [
    () => setEnhancedImage(null),
    () => setShowComparison(false),
    () => setZoomLevel(1),
    () => setPanPosition({ x: 0, y: 0 }),
  ]);

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
        toast({ title: "Enhancement complete", description: "Your portrait has been enhanced" });
      }
    } catch (error: any) {
      toast({ title: "Enhancement failed", description: error.message, variant: "destructive" });
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

  // Zoom/Pan handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
    if (zoomLevel <= 1.5) setPanPosition({ x: 0, y: 0 });
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
      setPanPosition({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };
  const handlePanEnd = () => setIsPanning(false);

  // ==================== CHARACTER GENERATOR ====================
  const handleCharacterImageUpload = createImageUploadHandler(setCharacterImage, [
    () => setGeneratedImage(null),
    () => setProductImage(null),
    () => setSelectedPreset(""),
  ]);

  const handleProductImageUpload = createImageUploadHandler(setProductImage, [() => setGeneratedImage(null)]);
  const handleBackgroundImageUpload = createImageUploadHandler(setBackgroundImage, [() => setGeneratedImage(null)]);

  const handleSideProfileUpload = (side: 'left' | 'right') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (side === 'left') setCharacterLeftProfile(e.target?.result as string);
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
    if (!productImage && !generationPrompt.trim()) {
      toast({ title: "Empty prompt", description: "Please enter a scenario prompt or upload a product", variant: "destructive" });
      return;
    }

    setIsGeneratingImage(true);
    setGenerationProgress(0);
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => prev >= 90 ? prev : prev + Math.random() * 15);
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke('generate-character-image', {
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
        }
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
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'generated-character-image.png';
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

  // ==================== PROMPT EXTRACTOR ====================
  const handleExtractorImageUpload = createImageUploadHandler(setExtractorImage, [() => setExtractedPrompt("")]);

  const handleExtractPrompt = async () => {
    if (!extractorImage) {
      toast({ title: "No image uploaded", description: "Please upload an image first", variant: "destructive" });
      return;
    }
    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-image-prompt', { body: { image: extractorImage } });
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

  // ==================== DRESS EXTRACTOR ====================
  const handleDressImageUpload = createImageUploadHandler(setDressImage, [() => setExtractedDressImage(null)]);

  const handleExtractDress = async () => {
    if (!dressImage) {
      toast({ title: "No image uploaded", description: "Please upload an image first", variant: "destructive" });
      return;
    }
    setIsExtractingDress(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-dress-to-dummy', { body: { image: dressImage } });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Extraction failed", description: data.error, variant: "destructive" });
        return;
      }
      if (data?.extractedImage) {
        setExtractedDressImage(data.extractedImage);
        toast({ title: "Success!", description: "Dress extracted and placed on mannequin" });
      }
    } catch (error: any) {
      toast({ title: "Extraction failed", description: error.message, variant: "destructive" });
    } finally {
      setIsExtractingDress(false);
    }
  };

  const handleDownloadDress = () => {
    if (!extractedDressImage) return;
    const link = document.createElement('a');
    link.href = extractedDressImage;
    link.download = 'extracted-dress-on-dummy.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==================== BACKGROUND SAVER ====================
  const handlePeopleImageUpload = createImageUploadHandler(setPeopleImage, [() => setCleanBackground(null)]);

  const handleRemovePeople = async () => {
    if (!peopleImage) {
      toast({ title: "No image uploaded", description: "Please upload an image first", variant: "destructive" });
      return;
    }
    setIsRemovingPeople(true);
    try {
      const { data, error } = await supabase.functions.invoke('remove-people-from-image', { body: { image: peopleImage } });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Processing failed", description: data.error, variant: "destructive" });
        return;
      }
      if (data?.cleanBackground) {
        setCleanBackground(data.cleanBackground);
        toast({ title: "Success!", description: "People removed successfully" });
      }
    } catch (error: any) {
      toast({ title: "Processing failed", description: error.message, variant: "destructive" });
    } finally {
      setIsRemovingPeople(false);
    }
  };

  const handleDownloadBackground = (format: 'png' | 'jpg') => {
    if (!cleanBackground) return;
    const link = document.createElement('a');
    link.href = cleanBackground;
    link.download = `clean-background.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetPeopleRemoval = () => {
    setPeopleImage(null);
    setCleanBackground(null);
  };

  // ==================== POSE TRANSFER ====================
  const handlePoseInfluencerUpload = createImageUploadHandler(setPoseInfluencerImage, [() => setPoseTransferResult(null)]);
  const handlePoseReferenceUpload = createImageUploadHandler(setPoseReferenceImage, [() => setPoseTransferResult(null)]);

  const handlePoseTransfer = async () => {
    if (!poseInfluencerImage) {
      toast({ title: "Missing Influencer Image", description: "Please upload the main influencer photo", variant: "destructive" });
      return;
    }
    if (!poseReferenceImage) {
      toast({ title: "Missing Pose Reference", description: "Please upload a pose reference image", variant: "destructive" });
      return;
    }
    setIsTransferringPose(true);
    setPoseTransferResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('pose-transfer', {
        body: { influencerImage: poseInfluencerImage, poseReferenceImage }
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Transfer Failed", description: data.error, variant: "destructive" });
        return;
      }
      if (data?.generatedImageUrl) {
        setPoseTransferResult(data.generatedImageUrl);
        toast({ title: "Pose Transfer Complete!", description: "Your influencer has been recreated in the new pose" });
      }
    } catch (error: any) {
      toast({ title: "Transfer Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsTransferringPose(false);
    }
  };

  const handleDownloadPoseTransfer = () => {
    if (!poseTransferResult) return;
    const link = document.createElement('a');
    link.href = poseTransferResult;
    link.download = 'pose-transfer-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetPoseTransfer = () => {
    setPoseInfluencerImage(null);
    setPoseReferenceImage(null);
    setPoseTransferResult(null);
  };

  // ==================== MAKEUP STUDIO ====================
  const handleMakeupImageUpload = createImageUploadHandler(setMakeupImage, [() => setMakeupResult(null)]);

  const makeupStyles = [
    { id: "soft-glam", name: "Soft Glam", description: "Subtle contour, nude lips, warm eyeshadow", emoji: "✨" },
    { id: "bridal-glow", name: "Bridal Glow", description: "Dewy base, highlighted cheeks, bold lashes", emoji: "💍" },
    { id: "bridal-luxe-glam", name: "Bridal Luxe Glam", description: "South Asian bridal glam, champagne-gold eyes", emoji: "👑" },
    { id: "bold-night-out", name: "Bold Night Out", description: "Smokey eyes, winged liner, deep lipstick", emoji: "🌙" },
    { id: "clean-girl", name: "Clean Girl", description: "Minimal makeup, glossy lips, fresh skin", emoji: "🌿" },
    { id: "instagram-trendy", name: "Instagram Trendy", description: "Sharp brows, light contour, vibrant eyeshadow", emoji: "📸" },
    { id: "matte-professional", name: "Matte Professional", description: "Smooth matte finish, neutral tones", emoji: "💼" },
    { id: "classic-red-glam", name: "Classic Red Glam", description: "Red lips, cat eyeliner, vintage glamour", emoji: "💄" },
  ];

  const handleApplyMakeup = async () => {
    if (!makeupImage) {
      toast({ title: "Missing Image", description: "Please upload a face photo first", variant: "destructive" });
      return;
    }
    if (!selectedMakeupStyle) {
      toast({ title: "No Style Selected", description: "Please select a makeup style", variant: "destructive" });
      return;
    }
    setIsApplyingMakeup(true);
    setMakeupResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('apply-makeup', {
        body: { image: makeupImage, makeupStyle: selectedMakeupStyle }
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Makeup Application Failed", description: data.error, variant: "destructive" });
        return;
      }
      if (data?.generatedImageUrl) {
        setMakeupResult(data.generatedImageUrl);
        toast({ title: "Makeup Applied!", description: "Your look has been created successfully" });
      }
    } catch (error: any) {
      toast({ title: "Application Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsApplyingMakeup(false);
    }
  };

  const handleDownloadMakeup = () => {
    if (!makeupResult) return;
    const link = document.createElement('a');
    link.href = makeupResult;
    link.download = 'makeup-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetMakeup = () => {
    setMakeupImage(null);
    setSelectedMakeupStyle("");
    setMakeupResult(null);
  };

  // ==================== FULL LOOK TRANSFER ====================
  const handleFullLookFaceUpload = createImageUploadHandler(setFullLookFaceImage, [() => setFullLookResult(null)]);
  const handleFullLookReferenceUpload = createImageUploadHandler(setFullLookReferenceImage, [() => setFullLookResult(null)]);

  const handleFullLookTransfer = async () => {
    if (!fullLookFaceImage) {
      toast({ title: "Missing Face Image", description: "Please upload the influencer face photo", variant: "destructive" });
      return;
    }
    if (!fullLookReferenceImage) {
      toast({ title: "Missing Reference Image", description: "Please upload the reference look image", variant: "destructive" });
      return;
    }
    setIsTransferringLook(true);
    setFullLookResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('full-look-transfer', {
        body: { influencerFaceImage: fullLookFaceImage, referenceLookImage: fullLookReferenceImage }
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Transfer Failed", description: data.error, variant: "destructive" });
        return;
      }
      if (data?.generatedImageUrl) {
        setFullLookResult(data.generatedImageUrl);
        toast({ title: "Full Look Transfer Complete!", description: "Your influencer look has been created successfully" });
      }
    } catch (error: any) {
      toast({ title: "Transfer Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsTransferringLook(false);
    }
  };

  const handleDownloadFullLook = () => {
    if (!fullLookResult) return;
    const link = document.createElement('a');
    link.href = fullLookResult;
    link.download = 'full-look-transfer-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFullLook = () => {
    setFullLookFaceImage(null);
    setFullLookReferenceImage(null);
    setFullLookResult(null);
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
    { id: "hands-in-pockets", name: "Hands in Pockets", description: "Relaxed pose" },
    { id: "dynamic-action", name: "Dynamic Action", description: "Active, energetic pose" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar activeSection={activeSection} onSectionChange={scrollToSection} />
      
      {/* Hero Section */}
      <Hero onExplore={() => scrollToSection("skin-enhancement")} />

      {/* Skin Enhancement Section */}
      <ToolSection
        id="skin-enhancement"
        title="Skin Texture"
        subtitle="Enhancement"
        description="Ultra-realistic skin enhancement that preserves your identity"
        badge="AI-Powered"
      >
        {!selectedImage ? (
          <div className="flex justify-center">
            <ImageUploader
              id="skin-upload"
              image={selectedImage}
              onUpload={handleImageUpload}
              onRemove={handleReset}
              label=""
              className="w-full max-w-md"
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Mode selector */}
            {!showComparison && (
              <div className="flex items-center justify-center gap-4 pb-6 border-b border-border/50">
                <span className="text-sm font-medium text-muted-foreground">Mode:</span>
                <div className="flex gap-2">
                  <Button
                    variant={enhancementMode === "preserve" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEnhancementMode("preserve")}
                    className={enhancementMode === "preserve" ? "bg-primary" : ""}
                  >
                    Preserve Makeup
                  </Button>
                  <Button
                    variant={enhancementMode === "remove" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEnhancementMode("remove")}
                    className={enhancementMode === "remove" ? "bg-primary" : ""}
                  >
                    Remove Makeup
                  </Button>
                </div>
              </div>
            )}

            {/* Comparison view */}
            {showComparison && enhancedImage ? (
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  <Button onClick={handleZoomOut} disabled={zoomLevel <= 1} variant="outline" size="sm">
                    <ZoomOut className="h-4 w-4 mr-1" /> Zoom Out
                  </Button>
                  <Button onClick={handleResetZoom} disabled={zoomLevel === 1} variant="outline" size="sm">
                    <Maximize2 className="h-4 w-4 mr-1" /> {Math.round(zoomLevel * 100)}%
                  </Button>
                  <Button onClick={handleZoomIn} disabled={zoomLevel >= 4} variant="outline" size="sm">
                    <ZoomIn className="h-4 w-4 mr-1" /> Zoom In
                  </Button>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-secondary/30">
                  <div
                    ref={comparisonRef}
                    className="relative w-full max-w-2xl mx-auto select-none"
                    style={{ cursor: zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
                    onMouseMove={(e) => {
                      if (isDragging && !isPanning && comparisonRef.current) {
                        const rect = comparisonRef.current.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        setSliderPosition(Math.max(0, Math.min(100, (x / rect.width) * 100)));
                      }
                      handlePanMove(e);
                    }}
                    onMouseDown={(e) => {
                      if (zoomLevel > 1 && !(e.target as HTMLElement).closest('.slider-handle')) {
                        handlePanStart(e);
                      }
                    }}
                    onMouseUp={() => { setIsDragging(false); handlePanEnd(); }}
                    onMouseLeave={() => { setIsDragging(false); handlePanEnd(); }}
                  >
                    <div
                      className="relative w-full"
                      style={{
                        transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                        transformOrigin: 'center center',
                        transition: isPanning ? 'none' : 'transform 0.2s ease-out',
                      }}
                    >
                      <img src={enhancedImage} alt="Enhanced" className="w-full h-auto object-contain pointer-events-none" draggable={false} />
                    </div>
                    <div
                      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <div
                        className="relative w-full h-full"
                        style={{
                          transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                          transformOrigin: 'center center',
                          transition: isPanning ? 'none' : 'transform 0.2s ease-out',
                        }}
                      >
                        <img src={selectedImage} alt="Original" className="w-full h-auto object-contain" draggable={false} />
                      </div>
                    </div>
                    <div
                      className="slider-handle absolute inset-y-0 w-1 bg-primary cursor-ew-resize z-10"
                      style={{ left: `${sliderPosition}%` }}
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full bg-primary p-2 shadow-lg">
                        <ChevronLeft className="h-4 w-4 text-primary-foreground" />
                        <ChevronRight className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 rounded-lg bg-background/80 px-3 py-1 backdrop-blur-sm">
                      <span className="text-sm font-medium text-foreground">Original</span>
                    </div>
                    <div className="absolute bottom-4 right-4 rounded-lg bg-background/80 px-3 py-1 backdrop-blur-sm">
                      <span className="text-sm font-medium text-foreground">Enhanced</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative flex justify-center">
                <img src={selectedImage} alt="Selected" className="max-h-[500px] rounded-2xl object-contain" />
                <Button onClick={handleReset} variant="outline" size="sm" className="absolute top-3 right-3">
                  Remove
                </Button>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              {!showComparison ? (
                <>
                  <LoadingButton
                    onClick={handleEnhance}
                    isLoading={isProcessing}
                    loadingText="Enhancing..."
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Enhance Skin Texture
                  </LoadingButton>
                  <Button onClick={handleReset} variant="outline" size="lg">Cancel</Button>
                </>
              ) : (
                <>
                  <Button onClick={handleDownload} size="lg" className="bg-primary hover:bg-primary/90">
                    <Download className="mr-2 h-5 w-5" /> Download Enhanced
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="lg">Upload New Photo</Button>
                </>
              )}
            </div>
          </div>
        )}
      </ToolSection>

      {/* Character Generator Section */}
      <ToolSection
        id="character-generator"
        title="Character-Consistent"
        subtitle="Image Generator"
        description="Generate images with the exact same character in any scenario"
        badge="Pro Feature"
      >
        <div className="space-y-8">
          {/* Character Upload */}
          <div className="grid md:grid-cols-3 gap-6">
            <ImageUploader
              id="character-upload"
              image={characterImage}
              onUpload={handleCharacterImageUpload}
              onRemove={() => { setCharacterImage(null); setGeneratedImage(null); }}
              label="Character Reference"
              description="Upload an influencer or character image"
              aspectRatio="portrait"
            />
            
            {/* Side profiles */}
            {characterImage && (
              <>
                <ImageUploader
                  id="left-profile"
                  image={characterLeftProfile}
                  onUpload={handleSideProfileUpload('left')}
                  onRemove={() => setCharacterLeftProfile(null)}
                  label="Left Profile (Optional)"
                  description="For better consistency"
                  aspectRatio="portrait"
                />
                <ImageUploader
                  id="right-profile"
                  image={characterRightProfile}
                  onUpload={handleSideProfileUpload('right')}
                  onRemove={() => setCharacterRightProfile(null)}
                  label="Right Profile (Optional)"
                  description="For better consistency"
                  aspectRatio="portrait"
                />
              </>
            )}
          </div>

          {characterImage && (
            <>
              {/* Product upload */}
              <div className="grid md:grid-cols-2 gap-6">
                <ImageUploader
                  id="product-upload"
                  image={productImage}
                  onUpload={handleProductImageUpload}
                  onRemove={() => { setProductImage(null); setSelectedPreset(""); }}
                  label="Product Image (Optional)"
                  description="Upload a product for the character to showcase"
                />
                
                {productImage && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-foreground">Styling Preset</label>
                    <SelectionGrid
                      options={presetOptions}
                      selectedId={selectedPreset}
                      onSelect={setSelectedPreset}
                      disabled={isGeneratingImage}
                      columns={2}
                      size="sm"
                    />
                  </div>
                )}
              </div>

              {/* Background */}
              <div className="grid md:grid-cols-2 gap-6">
                <ImageUploader
                  id="background-upload"
                  image={backgroundImage}
                  onUpload={handleBackgroundImageUpload}
                  onRemove={() => { setBackgroundImage(null); setSelectedPose(""); }}
                  label="Background Image (Optional)"
                  description="Custom background for your character"
                />
                
                {backgroundImage && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-foreground">Character Pose</label>
                    <SelectionGrid
                      options={poseOptions}
                      selectedId={selectedPose}
                      onSelect={setSelectedPose}
                      disabled={isGeneratingImage}
                      columns={2}
                      size="sm"
                    />
                  </div>
                )}
              </div>

              {/* Prompt input */}
              {!productImage && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">Scenario Prompt</label>
                  <Textarea
                    value={generationPrompt}
                    onChange={(e) => setGenerationPrompt(e.target.value)}
                    placeholder="Describe the scenario you want to generate..."
                    className="min-h-[100px] bg-secondary/30 border-border/50 focus:border-primary/50"
                  />
                </div>
              )}

              {/* Generate button */}
              <div className="flex justify-center">
                <LoadingButton
                  onClick={handleGenerateImage}
                  isLoading={isGeneratingImage}
                  loadingText={`Generating... ${Math.round(generationProgress)}%`}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-12"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Image
                </LoadingButton>
              </div>

              {/* Result */}
              {generatedImage && (
                <ResultDisplay
                  result={generatedImage}
                  originalImages={[{ src: characterImage, label: "Character" }]}
                  onDownload={handleDownloadGenerated}
                  onRegenerate={handleGenerateImage}
                  onReset={handleResetGenerator}
                  isProcessing={isGeneratingImage}
                />
              )}
            </>
          )}
        </div>
      </ToolSection>

      {/* Prompt Extractor Section */}
      <ToolSection
        id="prompt-extractor"
        title="Image Prompt"
        subtitle="Extractor"
        description="Extract detailed prompts from any image for recreation"
        badge="Utility"
      >
        <div className="space-y-6">
          <div className="max-w-md mx-auto">
            <ImageUploader
              id="extractor-upload"
              image={extractorImage}
              onUpload={handleExtractorImageUpload}
              onRemove={() => { setExtractorImage(null); setExtractedPrompt(""); }}
              label="Upload Image to Analyze"
              description="The AI will extract a detailed prompt from this image"
            />
          </div>

          <div className="flex justify-center">
            <LoadingButton
              onClick={handleExtractPrompt}
              isLoading={isExtracting}
              loadingText="Analyzing..."
              disabled={!extractorImage}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              Extract Prompt
            </LoadingButton>
          </div>

          {extractedPrompt && (
            <div className="space-y-4 max-w-2xl mx-auto animate-fade-in-up">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Extracted Prompt</label>
                <Button onClick={handleCopyPrompt} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" /> Copy
                </Button>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                <p className="text-sm text-foreground whitespace-pre-wrap">{extractedPrompt}</p>
              </div>
            </div>
          )}
        </div>
      </ToolSection>

      {/* Dress Extractor Section */}
      <ToolSection
        id="dress-extractor"
        title="Dress-to-Dummy"
        subtitle="Extractor"
        description="Extract clothing from photos and display on a neutral mannequin"
        badge="E-commerce"
      >
        <div className="space-y-6">
          <div className="max-w-md mx-auto">
            <ImageUploader
              id="dress-upload"
              image={dressImage}
              onUpload={handleDressImageUpload}
              onRemove={() => { setDressImage(null); setExtractedDressImage(null); }}
              label="Upload Photo of Person Wearing Outfit"
              description="The AI will extract the clothing and place it on a mannequin"
            />
          </div>

          <div className="flex justify-center">
            <LoadingButton
              onClick={handleExtractDress}
              isLoading={isExtractingDress}
              loadingText="Extracting..."
              disabled={!dressImage}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              Generate Dress on Dummy
            </LoadingButton>
          </div>

          {extractedDressImage && (
            <ResultDisplay
              result={extractedDressImage}
              originalImages={dressImage ? [{ src: dressImage, label: "Original" }] : []}
              onDownload={handleDownloadDress}
              onRegenerate={handleExtractDress}
              onReset={() => { setDressImage(null); setExtractedDressImage(null); }}
              isProcessing={isExtractingDress}
            />
          )}
        </div>
      </ToolSection>

      {/* Background Saver Section */}
      <ToolSection
        id="background-saver"
        title="Remove People,"
        subtitle="Keep Background"
        description="AI-powered people removal while preserving the original background"
        badge="Editor"
      >
        <div className="space-y-6">
          <div className="max-w-md mx-auto">
            <ImageUploader
              id="people-upload"
              image={peopleImage}
              onUpload={handlePeopleImageUpload}
              onRemove={handleResetPeopleRemoval}
              label="Upload Image with People"
              description="Clear photo where people are visible"
            />
          </div>

          <div className="flex justify-center">
            <LoadingButton
              onClick={handleRemovePeople}
              isLoading={isRemovingPeople}
              loadingText="Removing People..."
              disabled={!peopleImage}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              Generate Clean Background
            </LoadingButton>
          </div>

          {cleanBackground && (
            <div className="space-y-6 animate-fade-in-up">
              <ResultDisplay
                result={cleanBackground}
                originalImages={peopleImage ? [{ src: peopleImage, label: "Original" }] : []}
                onDownload={() => handleDownloadBackground('png')}
                onRegenerate={handleRemovePeople}
                onReset={handleResetPeopleRemoval}
                isProcessing={isRemovingPeople}
              />
            </div>
          )}
        </div>
      </ToolSection>

      {/* Pose Transfer Section */}
      <ToolSection
        id="pose-transfer"
        title="Pose Transfer"
        subtitle="Studio"
        description="Transfer any pose to your influencer while keeping their identity intact"
        badge="Pro Feature"
      >
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <ImageUploader
              id="pose-influencer"
              image={poseInfluencerImage}
              onUpload={handlePoseInfluencerUpload}
              onRemove={() => { setPoseInfluencerImage(null); setPoseTransferResult(null); }}
              label="Influencer Photo"
              description="Face, outfit & background will be kept"
              aspectRatio="portrait"
            />
            <ImageUploader
              id="pose-reference"
              image={poseReferenceImage}
              onUpload={handlePoseReferenceUpload}
              onRemove={() => { setPoseReferenceImage(null); setPoseTransferResult(null); }}
              label="Pose Reference"
              description="Only the pose/body position will be used"
              aspectRatio="portrait"
            />
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">How it works:</strong> The AI keeps your influencer's face, outfit, and background from the first image, and applies only the pose from the reference photo.
            </p>
          </div>

          <div className="flex justify-center">
            <LoadingButton
              onClick={handlePoseTransfer}
              isLoading={isTransferringPose}
              loadingText="Transferring Pose..."
              disabled={!poseInfluencerImage || !poseReferenceImage}
              size="lg"
              className="bg-primary hover:bg-primary/90 px-12"
            >
              Generate Pose Transfer
            </LoadingButton>
          </div>

          {poseTransferResult && (
            <ResultDisplay
              result={poseTransferResult}
              originalImages={[
                ...(poseInfluencerImage ? [{ src: poseInfluencerImage, label: "Original" }] : []),
                ...(poseReferenceImage ? [{ src: poseReferenceImage, label: "Pose Ref" }] : []),
              ]}
              onDownload={handleDownloadPoseTransfer}
              onRegenerate={handlePoseTransfer}
              onReset={handleResetPoseTransfer}
              isProcessing={isTransferringPose}
              resetLabel="Try New Pose"
            />
          )}
        </div>
      </ToolSection>

      {/* Makeup Studio Section */}
      <ToolSection
        id="makeup-studio"
        title="Make Me Up –"
        subtitle="AI Makeup Studio"
        description="Apply professional makeup styles while preserving your natural features"
        badge="Beauty"
      >
        <div className="space-y-8">
          <div className="max-w-md mx-auto">
            <ImageUploader
              id="makeup-upload"
              image={makeupImage}
              onUpload={handleMakeupImageUpload}
              onRemove={handleResetMakeup}
              label="Upload a Clear Face Photo"
              description="Front-facing portrait works best"
            />
          </div>

          {makeupImage && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground text-center">Select Makeup Style</label>
              <SelectionGrid
                options={makeupStyles}
                selectedId={selectedMakeupStyle}
                onSelect={setSelectedMakeupStyle}
                disabled={isApplyingMakeup}
                columns={4}
              />
            </div>
          )}

          <div className="flex justify-center">
            <LoadingButton
              onClick={handleApplyMakeup}
              isLoading={isApplyingMakeup}
              loadingText="Applying Makeup..."
              disabled={!makeupImage || !selectedMakeupStyle}
              size="lg"
              className="bg-primary hover:bg-primary/90 px-12"
            >
              Apply Selected Makeup
            </LoadingButton>
          </div>

          {makeupResult && (
            <ResultDisplay
              result={makeupResult}
              originalImages={makeupImage ? [{ src: makeupImage, label: "Original" }] : []}
              onDownload={handleDownloadMakeup}
              onRegenerate={handleApplyMakeup}
              onReset={handleResetMakeup}
              isProcessing={isApplyingMakeup}
              resetLabel="Try Another Style"
            />
          )}
        </div>
      </ToolSection>

      {/* Full Look Transfer Section */}
      <ToolSection
        id="full-look-transfer"
        title="Full Look Transfer"
        subtitle="(Face Keep)"
        description="Transfer dress, ornaments, pose, and location while keeping your influencer's face"
        badge="Virtual Try-On"
      >
        <div className="space-y-8">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
            <p className="text-sm text-muted-foreground">
              💡 The AI will keep the influencer's face from Image 1 and copy the dress, pose, jewellery, and background from Image 2.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <ImageUploader
              id="face-upload"
              image={fullLookFaceImage}
              onUpload={handleFullLookFaceUpload}
              onRemove={() => { setFullLookFaceImage(null); setFullLookResult(null); }}
              label="Image 1: Influencer Face"
              description="The face/identity you want to keep"
              aspectRatio="portrait"
            />
            <ImageUploader
              id="reference-upload"
              image={fullLookReferenceImage}
              onUpload={handleFullLookReferenceUpload}
              onRemove={() => { setFullLookReferenceImage(null); setFullLookResult(null); }}
              label="Image 2: Reference Look"
              description="Dress, pose, ornaments & location will be copied"
              aspectRatio="portrait"
            />
          </div>

          <div className="flex justify-center">
            <LoadingButton
              onClick={handleFullLookTransfer}
              isLoading={isTransferringLook}
              loadingText="Generating Full Look..."
              disabled={!fullLookFaceImage || !fullLookReferenceImage}
              size="lg"
              className="bg-primary hover:bg-primary/90 px-12"
            >
              Generate Full Look
            </LoadingButton>
          </div>

          {fullLookResult && (
            <ResultDisplay
              result={fullLookResult}
              originalImages={[
                ...(fullLookFaceImage ? [{ src: fullLookFaceImage, label: "Face Source" }] : []),
                ...(fullLookReferenceImage ? [{ src: fullLookReferenceImage, label: "Look Ref" }] : []),
              ]}
              onDownload={handleDownloadFullLook}
              onRegenerate={handleFullLookTransfer}
              onReset={handleResetFullLook}
              isProcessing={isTransferringLook}
              resetLabel="Try Another Look"
            />
          )}
        </div>
      </ToolSection>

      {/* Footer */}
      <footer className="py-16 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold text-foreground">Influencer Tool</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            AI-powered creative tools for influencers, creators, and brands. Transform your creative vision with professional-grade results.
          </p>
          <div className="mt-6 text-xs text-muted-foreground/60">
            © 2024 Influencer Tool. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
