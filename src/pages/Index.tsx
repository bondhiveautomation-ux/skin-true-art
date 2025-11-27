import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Loader2, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Copy, Music } from "lucide-react";
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
  const [productImage, setProductImage] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [selectedCameraAngle, setSelectedCameraAngle] = useState<string>("");
  const [selectedPose, setSelectedPose] = useState<string>("");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [extractorImage, setExtractorImage] = useState<string | null>(null);
  const [extractedPrompt, setExtractedPrompt] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  
  // Dress-to-Dummy Extractor states
  const [dressImage, setDressImage] = useState<string | null>(null);
  const [extractedDressImage, setExtractedDressImage] = useState<string | null>(null);
  const [isExtractingDress, setIsExtractingDress] = useState(false);
  
  // Background Saver (People Removal) states
  const [peopleImage, setPeopleImage] = useState<string | null>(null);
  const [cleanBackground, setCleanBackground] = useState<string | null>(null);
  const [isRemovingPeople, setIsRemovingPeople] = useState(false);
  
  // Music Generator states
  const [musicMode, setMusicMode] = useState<"lyrics" | "instrumental">("lyrics");
  const [musicLyrics, setMusicLyrics] = useState("");
  const [musicLanguage, setMusicLanguage] = useState("English");
  const [musicGenre, setMusicGenre] = useState("");
  const [instrumentalType, setInstrumentalType] = useState("");
  const [musicPrompt, setMusicPrompt] = useState("");
  const [generatedMusicUrl, setGeneratedMusicUrl] = useState<string | null>(null);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  
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
      setProductImage(null);
      setSelectedPreset("");
    };
    reader.readAsDataURL(file);
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setProductImage(e.target?.result as string);
      setGeneratedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setBackgroundImage(e.target?.result as string);
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

    if (productImage && !selectedPreset) {
      toast({
        title: "No preset selected",
        description: "Please select a styling preset for the product",
        variant: "destructive",
      });
      return;
    }

    if (!productImage && !generationPrompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a scenario prompt or upload a product",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingImage(true);
    setGenerationProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev; // Stop at 90% until complete
        return prev + Math.random() * 15;
      });
    }, 500);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-character-image', {
        body: { 
          characterImage: characterImage,
          prompt: generationPrompt.trim(),
          productImage: productImage,
          preset: selectedPreset,
          cameraAngle: selectedCameraAngle || undefined,
          backgroundImage: backgroundImage || undefined,
          pose: selectedPose || undefined,
        }
      });

      if (error) throw error;

      if (data?.generatedImageUrl) {
        setGenerationProgress(100); // Complete the progress
        setTimeout(() => {
          setGeneratedImage(data.generatedImageUrl);
          toast({
            title: "Image generated",
            description: "Character-consistent image created successfully",
          });
        }, 300); // Small delay to show 100%
      }
    } catch (error: any) {
      console.error('Image generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive",
      });
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
    setGeneratedImage(null);
    setGenerationPrompt("");
    setProductImage(null);
    setSelectedPreset("");
    setSelectedCameraAngle("");
    setBackgroundImage(null);
    setSelectedPose("");
  };

  const handleExtractorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 20MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setExtractorImage(reader.result as string);
        setExtractedPrompt("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractPrompt = async () => {
    if (!extractorImage) {
      toast({
        title: "No image uploaded",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-image-prompt', {
        body: { image: extractorImage }
      });

      if (error) throw error;

      if (data?.prompt) {
        setExtractedPrompt(data.prompt);
        toast({
          title: "Prompt extracted",
          description: "Image analyzed successfully",
        });
      }
    } catch (error: any) {
      console.error('Prompt extraction error:', error);
      toast({
        title: "Extraction failed",
        description: error.message || "Failed to extract prompt from image",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(extractedPrompt);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard",
    });
  };

  const handleDressImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be smaller than 20MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setDressImage(reader.result as string);
      setExtractedDressImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleExtractDress = async () => {
    if (!dressImage) {
      toast({
        title: "No image uploaded",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    setIsExtractingDress(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-dress-to-dummy', {
        body: { image: dressImage }
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Extraction failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data?.extractedImage) {
        setExtractedDressImage(data.extractedImage);
        toast({
          title: "Success!",
          description: "Dress extracted and placed on mannequin",
        });
      } else {
        toast({
          title: "No result",
          description: "Failed to extract dress",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Dress extraction error:', error);
      toast({
        title: "Extraction failed",
        description: error.message || "Failed to extract dress. Please try again.",
        variant: "destructive",
      });
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
    toast({
      title: "Downloaded!",
      description: "Image saved to your device",
    });
  };

  const handlePeopleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be smaller than 20MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPeopleImage(reader.result as string);
      setCleanBackground(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePeople = async () => {
    if (!peopleImage) {
      toast({
        title: "No image uploaded",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    setIsRemovingPeople(true);
    try {
      const { data, error } = await supabase.functions.invoke('remove-people-from-image', {
        body: { image: peopleImage }
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Processing failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data?.cleanBackground) {
        setCleanBackground(data.cleanBackground);
        toast({
          title: "Success!",
          description: "People removed successfully",
        });
      } else {
        toast({
          title: "No result",
          description: "Failed to process image",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('People removal error:', error);
      toast({
        title: "Processing failed",
        description: error.message || "Failed to remove people. Please try again.",
        variant: "destructive",
      });
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
    toast({
      title: "Downloaded!",
      description: `Image saved as ${format.toUpperCase()}`,
    });
  };

  const handleResetPeopleRemoval = () => {
    setPeopleImage(null);
    setCleanBackground(null);
  };

  const handleGenerateMusic = async () => {
    if (musicMode === "lyrics" && (!musicLyrics || !musicLanguage || !musicGenre)) {
      toast({
        title: "Missing Information",
        description: "Please provide lyrics, select language, and choose a genre",
        variant: "destructive",
      });
      return;
    }

    if (musicMode === "instrumental" && !instrumentalType) {
      toast({
        title: "Missing Information",
        description: "Please select an instrumental type",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingMusic(true);
    setGeneratedMusicUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: {
          mode: musicMode,
          lyrics: musicMode === "lyrics" ? musicLyrics : undefined,
          language: musicMode === "lyrics" ? musicLanguage : undefined,
          genre: musicMode === "lyrics" ? musicGenre : undefined,
          instrumentalType: musicMode === "instrumental" ? instrumentalType : undefined,
          prompt: musicPrompt || undefined,
        }
      });

      if (error) throw error;

      if (data.audioUrl) {
        setGeneratedMusicUrl(data.audioUrl);
        toast({
          title: "Music Generated!",
          description: "Your music is ready to listen and download",
        });
      }
    } catch (error) {
      console.error('Music generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate music",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const handleDownloadMusic = (format: 'mp3' | 'wav') => {
    if (!generatedMusicUrl) return;

    const link = document.createElement('a');
    link.href = generatedMusicUrl;
    link.download = `generated-music.${format}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Downloaded!",
      description: `Music saved as ${format.toUpperCase()}`,
    });
  };

  const handleResetMusicGenerator = () => {
    setMusicLyrics("");
    setMusicLanguage("English");
    setMusicGenre("");
    setInstrumentalType("");
    setMusicPrompt("");
    setGeneratedMusicUrl(null);
  };

  // Pose Transfer handlers
  const handlePoseInfluencerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be smaller than 20MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPoseInfluencerImage(reader.result as string);
      setPoseTransferResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handlePoseReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be smaller than 20MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPoseReferenceImage(reader.result as string);
      setPoseTransferResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handlePoseTransfer = async () => {
    if (!poseInfluencerImage) {
      toast({
        title: "Missing Influencer Image",
        description: "Please upload the main influencer photo",
        variant: "destructive",
      });
      return;
    }

    if (!poseReferenceImage) {
      toast({
        title: "Missing Pose Reference",
        description: "Please upload a pose reference image",
        variant: "destructive",
      });
      return;
    }

    setIsTransferringPose(true);
    setPoseTransferResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('pose-transfer', {
        body: {
          influencerImage: poseInfluencerImage,
          poseReferenceImage: poseReferenceImage,
        }
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Transfer Failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data?.generatedImageUrl) {
        setPoseTransferResult(data.generatedImageUrl);
        toast({
          title: "Pose Transfer Complete!",
          description: "Your influencer has been recreated in the new pose",
        });
      }
    } catch (error: any) {
      console.error('Pose transfer error:', error);
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to transfer pose. Please try again.",
        variant: "destructive",
      });
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
    toast({
      title: "Downloaded!",
      description: "Image saved to your device",
    });
  };

  const handleResetPoseTransfer = () => {
    setPoseInfluencerImage(null);
    setPoseReferenceImage(null);
    setPoseTransferResult(null);
  };

  // Makeup Studio handlers
  const handleMakeupImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be smaller than 20MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMakeupImage(reader.result as string);
      setMakeupResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyMakeup = async () => {
    if (!makeupImage) {
      toast({
        title: "Missing Image",
        description: "Please upload a face photo first",
        variant: "destructive",
      });
      return;
    }

    if (!selectedMakeupStyle) {
      toast({
        title: "No Style Selected",
        description: "Please select a makeup style",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingMakeup(true);
    setMakeupResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('apply-makeup', {
        body: {
          image: makeupImage,
          makeupStyle: selectedMakeupStyle,
        }
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Makeup Application Failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data?.generatedImageUrl) {
        setMakeupResult(data.generatedImageUrl);
        toast({
          title: "Makeup Applied!",
          description: "Your look has been created successfully",
        });
      }
    } catch (error: any) {
      console.error('Makeup application error:', error);
      toast({
        title: "Application Failed",
        description: error.message || "Failed to apply makeup. Please try again.",
        variant: "destructive",
      });
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
    toast({
      title: "Downloaded!",
      description: "Image saved to your device",
    });
  };

  const handleResetMakeup = () => {
    setMakeupImage(null);
    setSelectedMakeupStyle("");
    setMakeupResult(null);
  };

  const makeupStyles = [
    { id: "soft-glam", name: "Soft Glam", description: "Subtle contour, nude lips, warm eyeshadow", emoji: "✨" },
    { id: "bridal-glow", name: "Bridal Glow", description: "Dewy base, highlighted cheeks, bold lashes", emoji: "💍" },
    { id: "bold-night-out", name: "Bold Night Out", description: "Smokey eyes, winged liner, deep lipstick", emoji: "🌙" },
    { id: "clean-girl", name: "Clean Girl", description: "Minimal makeup, glossy lips, fresh skin", emoji: "🌿" },
    { id: "instagram-trendy", name: "Instagram Trendy", description: "Sharp brows, light contour, vibrant eyeshadow", emoji: "📸" },
    { id: "matte-professional", name: "Matte Professional", description: "Smooth matte finish, neutral tones", emoji: "💼" },
    { id: "classic-red-glam", name: "Classic Red Glam", description: "Red lips, cat eyeliner, vintage glamour", emoji: "💄" },
  ];

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
                <div className="relative flex justify-center">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="max-h-[600px] rounded-xl object-contain"
                  />
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    Remove
                  </Button>
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

                  {/* Product Integration (Optional) */}
                  <div className="rounded-lg border border-accent/30 bg-accent/5 p-6 space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        Product Integration <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Upload a product to create styled images with your character
                      </p>
                    </div>

                    {!productImage ? (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProductImageUpload}
                          className="hidden"
                          id="product-upload"
                        />
                        <label
                          htmlFor="product-upload"
                          className="group cursor-pointer block"
                        >
                          <div className="flex items-center gap-4 rounded-lg border-2 border-dashed border-border p-6 transition-all hover:border-accent hover:bg-secondary/50">
                            <div className="rounded-full bg-accent/10 p-3 transition-all group-hover:bg-accent/20">
                              <Upload className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                Upload Product Image
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Saree, dress, jewelry, makeup, shoes, bags, etc.
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative rounded-lg border border-border bg-background p-3">
                          <img
                            src={productImage}
                            alt="Product"
                            className="max-h-[200px] rounded object-contain mx-auto"
                          />
                          <Button
                            onClick={() => {
                              setProductImage(null);
                              setSelectedPreset("");
                              setSelectedCameraAngle("");
                            }}
                            variant="outline"
                            size="sm"
                            className="absolute top-1 right-1"
                          >
                            Remove
                          </Button>
                        </div>

                        {/* Preset Selection */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Select Styling Preset
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setSelectedPreset("wearing")}
                              disabled={isGeneratingImage}
                              className={`rounded-lg border p-3 text-left transition-all ${
                                selectedPreset === "wearing"
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
                              }`}
                            >
                              <p className="text-sm font-medium">Wearing</p>
                              <p className="text-xs opacity-80">Character wearing the product</p>
                            </button>
                            <button
                              onClick={() => setSelectedPreset("holding")}
                              disabled={isGeneratingImage}
                              className={`rounded-lg border p-3 text-left transition-all ${
                                selectedPreset === "holding"
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
                              }`}
                            >
                              <p className="text-sm font-medium">Holding</p>
                              <p className="text-xs opacity-80">Character holding the product</p>
                            </button>
                            <button
                              onClick={() => setSelectedPreset("showcasing")}
                              disabled={isGeneratingImage}
                              className={`rounded-lg border p-3 text-left transition-all ${
                                selectedPreset === "showcasing"
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
                              }`}
                            >
                              <p className="text-sm font-medium">Showcasing</p>
                              <p className="text-xs opacity-80">Product beside character</p>
                            </button>
                            <button
                              onClick={() => setSelectedPreset("floating")}
                              disabled={isGeneratingImage}
                              className={`rounded-lg border p-3 text-left transition-all ${
                                selectedPreset === "floating"
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
                              }`}
                            >
                              <p className="text-sm font-medium">Floating Display</p>
                              <p className="text-xs opacity-80">Artistic product highlight</p>
                            </button>
                            <button
                              onClick={() => setSelectedPreset("lifestyle")}
                              disabled={isGeneratingImage}
                              className={`rounded-lg border p-3 text-left transition-all col-span-2 ${
                                selectedPreset === "lifestyle"
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
                              }`}
                            >
                              <p className="text-sm font-medium">Lifestyle Interaction</p>
                              <p className="text-xs opacity-80">Natural interaction with product in context</p>
                            </button>
                          </div>
                        </div>

                        {/* Camera Angle Selection (Optional) */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Select Camera Angle <span className="text-xs text-muted-foreground">(Optional)</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setSelectedCameraAngle("front")}
                              disabled={isGeneratingImage}
                              className={`rounded-lg border p-3 text-left transition-all ${
                                selectedCameraAngle === "front"
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
                              }`}
                            >
                              <p className="text-sm font-medium">Front View</p>
                              <p className="text-xs opacity-80">Straight-on view</p>
                            </button>

                            <button
                              onClick={() => setSelectedCameraAngle("side")}
                              disabled={isGeneratingImage}
                              className={`rounded-lg border p-3 text-left transition-all ${
                                selectedCameraAngle === "side"
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
                              }`}
                            >
                              <p className="text-sm font-medium">Side View</p>
                              <p className="text-xs opacity-80">Profile view from side</p>
                            </button>

                            <button
                              onClick={() => setSelectedCameraAngle("three-quarter")}
                              disabled={isGeneratingImage}
                              className={`rounded-lg border p-3 text-left transition-all ${
                                selectedCameraAngle === "three-quarter"
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
                              }`}
                            >
                              <p className="text-sm font-medium">3/4 View</p>
                              <p className="text-xs opacity-80">Three-quarter angle</p>
                            </button>

                            <button
                              onClick={() => setSelectedCameraAngle("back")}
                              disabled={isGeneratingImage}
                              className={`rounded-lg border p-3 text-left transition-all ${
                                selectedCameraAngle === "back"
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
                              }`}
                            >
                              <p className="text-sm font-medium">Back View</p>
                              <p className="text-xs opacity-80">Rear view showing back</p>
                            </button>

                            <button
                              onClick={() => setSelectedCameraAngle("top-down")}
                              disabled={isGeneratingImage}
                              className={`rounded-lg border p-3 text-left transition-all col-span-2 ${
                                selectedCameraAngle === "top-down"
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
                              }`}
                            >
                              <p className="text-sm font-medium">Top-Down View</p>
                              <p className="text-xs opacity-80">Elevated angle looking down</p>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Background Integration (Optional) */}
                  <div className="rounded-lg border border-accent/30 bg-accent/5 p-6 space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        Background Integration <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Upload a background and select a pose to place your character in a custom scene
                      </p>
                    </div>

                    {!backgroundImage ? (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBackgroundImageUpload}
                          className="hidden"
                          id="background-upload"
                        />
                        <label
                          htmlFor="background-upload"
                          className="group cursor-pointer block"
                        >
                          <div className="flex items-center gap-4 rounded-lg border-2 border-dashed border-border p-6 transition-all hover:border-accent hover:bg-secondary/50">
                            <div className="rounded-full bg-accent/10 p-3 transition-all group-hover:bg-accent/20">
                              <Upload className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                Upload Background Image
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Beach, park, studio, city, nature, etc.
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative rounded-lg border border-border bg-background p-3">
                          <img
                            src={backgroundImage}
                            alt="Background"
                            className="max-h-[200px] rounded object-contain mx-auto"
                          />
                          <Button
                            onClick={() => {
                              setBackgroundImage(null);
                              setSelectedPose("");
                            }}
                            variant="outline"
                            size="sm"
                            className="absolute top-1 right-1"
                          >
                            Remove
                          </Button>
                        </div>

                        {/* Pose Selection */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Select Character Pose
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setSelectedPose("standing")}
                              disabled={isGeneratingImage}
                              className={`rounded-lg border p-3 text-left transition-all ${
                                selectedPose === "standing"
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
                              }`}
                            >
                              <p className="text-sm font-medium">Standing</p>
                              <p className="text-xs opacity-80">Standing naturally</p>
                            </button>
                            <button
                              onClick={() => setSelectedPose("sitting")}
                              disabled={isGeneratingImage}
                              className={`rounded-lg border p-3 text-left transition-all ${
                                selectedPose === "sitting"
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
                              }`}
                            >
                              <p className="text-sm font-medium">Sitting</p>
                              <p className="text-xs opacity-80">Sitting comfortably</p>
                            </button>
                            <button
                              onClick={() => setSelectedPose("walking")}
                              disabled={isGeneratingImage}
                              className={`rounded-lg border p-3 text-left transition-all ${
                                selectedPose === "walking"
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
                              }`}
                            >
                              <p className="text-sm font-medium">Walking</p>
                              <p className="text-xs opacity-80">Walking naturally</p>
                            </button>
                            <button
                              onClick={() => setSelectedPose("leaning")}
                              disabled={isGeneratingImage}
                              className={`rounded-lg border p-3 text-left transition-all ${
                                selectedPose === "leaning"
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
                              }`}
                            >
                              <p className="text-sm font-medium">Leaning</p>
                              <p className="text-xs opacity-80">Leaning casually</p>
                            </button>
                            <button
                              onClick={() => setSelectedPose("arms-crossed")}
                              disabled={isGeneratingImage}
                              className={`rounded-lg border p-3 text-left transition-all ${
                                selectedPose === "arms-crossed"
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
                              }`}
                            >
                              <p className="text-sm font-medium">Arms Crossed</p>
                              <p className="text-xs opacity-80">Confident pose</p>
                            </button>
                            <button
                              onClick={() => setSelectedPose("hands-in-pockets")}
                              disabled={isGeneratingImage}
                              className={`rounded-lg border p-3 text-left transition-all ${
                                selectedPose === "hands-in-pockets"
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
                              }`}
                            >
                              <p className="text-sm font-medium">Hands in Pockets</p>
                              <p className="text-xs opacity-80">Relaxed pose</p>
                            </button>
                            <button
                              onClick={() => setSelectedPose("dynamic-action")}
                              disabled={isGeneratingImage}
                              className={`rounded-lg border p-3 text-left transition-all col-span-2 ${
                                selectedPose === "dynamic-action"
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-accent/50"
                              }`}
                            >
                              <p className="text-sm font-medium">Dynamic Action</p>
                              <p className="text-xs opacity-80">Active, energetic pose</p>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scenario Prompt */}
                  {!productImage && !backgroundImage && (
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
                  )}

                  {/* Generate Button */}
                  <div className="flex justify-center">
                    <Button
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage || (!generationPrompt.trim() && !productImage && !backgroundImage) || (productImage && !selectedPreset) || (backgroundImage && !selectedPose)}
                      className="bg-accent text-background hover:bg-accent/90 relative overflow-hidden"
                      size="lg"
                    >
                      {isGeneratingImage ? (
                        <>
                          <div className="absolute inset-0 bg-accent/20">
                            <div 
                              className="h-full bg-accent/40 transition-all duration-300 ease-out"
                              style={{ width: `${generationProgress}%` }}
                            />
                          </div>
                          <span className="relative z-10">
                            Generating Image... {Math.round(generationProgress)}%
                          </span>
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
                        <div className="flex gap-2">
                          <Button
                            onClick={handleDownloadGenerated}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          <Button
                            onClick={() => setGeneratedImage(null)}
                            variant="outline"
                            size="sm"
                          >
                            Remove
                          </Button>
                        </div>
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

        {/* Image Prompt Extractor Section */}
        <div className="mt-8 bg-card rounded-xl shadow-lg p-8 border border-border">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-primary mb-2">Image Prompt Extractor</h2>
            <p className="text-muted-foreground">
              Upload any image and get a detailed, generator-ready prompt that can recreate it
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Upload Image to Analyze
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleExtractorImageUpload}
                className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-background hover:file:bg-accent/90 cursor-pointer"
              />
              {extractorImage && (
                <div className="mt-4 relative">
                  <img
                    src={extractorImage}
                    alt="Image to analyze"
                    className="w-full max-w-md rounded-lg border-2 border-border"
                  />
                  <Button
                    onClick={() => {
                      setExtractorImage(null);
                      setExtractedPrompt("");
                    }}
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            <Button
              onClick={handleExtractPrompt}
              disabled={isExtracting || !extractorImage}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Image...
                </>
              ) : (
                'Extract Prompt'
              )}
            </Button>

            {extractedPrompt && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-foreground">
                    Generated Prompt
                  </label>
                  <Button
                    onClick={() => setExtractedPrompt("")}
                    variant="outline"
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {extractedPrompt}
                  </p>
                </div>
                <Button
                  onClick={handleCopyPrompt}
                  variant="outline"
                  className="w-full"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Prompt
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Dress-to-Dummy Extractor Section */}
        <div className="mt-8 bg-card rounded-xl shadow-lg p-8 border border-border">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-primary mb-2">Extract Dress to Dummy</h2>
            <p className="text-muted-foreground">
              Upload a photo of a person wearing an outfit. AI will extract the clothing and place it on a neutral mannequin.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Upload Photo of Person Wearing Dress
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Upload a clear photo where the full dress is visible
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleDressImageUpload}
                className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-background hover:file:bg-accent/90 cursor-pointer"
              />
              {dressImage && (
                <div className="mt-4 relative">
                  <p className="text-sm font-medium text-foreground mb-2">Original Image:</p>
                  <img
                    src={dressImage}
                    alt="Person wearing dress"
                    className="w-full max-w-md rounded-lg border-2 border-border"
                  />
                  <Button
                    onClick={() => {
                      setDressImage(null);
                      setExtractedDressImage(null);
                    }}
                    variant="outline"
                    size="sm"
                    className="absolute top-8 right-2"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            <Button
              onClick={handleExtractDress}
              disabled={isExtractingDress || !dressImage}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
            >
              {isExtractingDress ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Extracting Dress...
                </>
              ) : (
                'Generate Dress on Dummy'
              )}
            </Button>

            {extractedDressImage && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-foreground">
                    Dress on Mannequin:
                  </label>
                  <Button
                    onClick={() => setExtractedDressImage(null)}
                    variant="outline"
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <img
                    src={extractedDressImage}
                    alt="Dress on dummy"
                    className="w-full max-w-md rounded-lg mx-auto"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleDownloadDress}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    onClick={handleExtractDress}
                    variant="outline"
                    className="flex-1"
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Background Saver (People Removal) Section */}
        <div className="mt-8 bg-card rounded-xl shadow-lg p-8 border border-border">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-primary mb-2">Remove People, Keep Background</h2>
            <p className="text-muted-foreground">
              Upload a photo that contains people. The AI will remove them and keep the background untouched.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Upload Image with People
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Upload a clear photo where people are visible
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handlePeopleImageUpload}
                className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-background hover:file:bg-accent/90 cursor-pointer"
              />
              {peopleImage && (
                <div className="mt-4 relative">
                  <p className="text-sm font-medium text-foreground mb-2">Original Image:</p>
                  <img
                    src={peopleImage}
                    alt="Image with people"
                    className="w-full max-w-md rounded-lg border-2 border-border"
                  />
                  <Button
                    onClick={() => {
                      setPeopleImage(null);
                      setCleanBackground(null);
                    }}
                    variant="outline"
                    size="sm"
                    className="absolute top-8 right-2"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            <Button
              onClick={handleRemovePeople}
              disabled={isRemovingPeople || !peopleImage}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
            >
              {isRemovingPeople ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Removing People...
                </>
              ) : (
                'Generate Clean Background'
              )}
            </Button>

            {cleanBackground && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-foreground">
                    Clean Background:
                  </label>
                  <Button
                    onClick={() => setCleanBackground(null)}
                    variant="outline"
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <img
                    src={cleanBackground}
                    alt="Clean background"
                    className="w-full max-w-md rounded-lg mx-auto"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleDownloadBackground('png')}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PNG
                  </Button>
                  <Button
                    onClick={() => handleDownloadBackground('jpg')}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download JPG
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleRemovePeople}
                    variant="outline"
                    className="flex-1"
                  >
                    Regenerate
                  </Button>
                  <Button
                    onClick={handleResetPeopleRemoval}
                    variant="outline"
                    className="flex-1"
                  >
                    Start Over
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Song & Music Generator */}
        <div className="mt-20 rounded-2xl bg-card p-8 shadow-lg border border-border">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
              <Music className="h-8 w-8 text-accent" />
              AI Song & Music Generator
            </h2>
            <p className="text-muted-foreground">
              Create professional songs with vocals or high-quality instrumental tracks
            </p>
          </div>

          <Tabs value={musicMode} onValueChange={(value) => setMusicMode(value as "lyrics" | "instrumental")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="lyrics">Lyrics to Song</TabsTrigger>
              <TabsTrigger value="instrumental">Instrumental Only</TabsTrigger>
            </TabsList>

            <TabsContent value="lyrics" className="space-y-6">
              {/* Language Selector */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Lyrics Language
                </label>
                <Select value={musicLanguage} onValueChange={setMusicLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Bangla">Bangla</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lyrics Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Lyrics
                </label>
                <Textarea
                  value={musicLyrics}
                  onChange={(e) => setMusicLyrics(e.target.value)}
                  placeholder="Enter your song lyrics here..."
                  className="min-h-[200px] resize-none"
                />
              </div>

              {/* Genre Selector */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Music Genre / Style
                </label>
                <Select value={musicGenre} onValueChange={setMusicGenre}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Romantic">Romantic</SelectItem>
                    <SelectItem value="Sad">Sad</SelectItem>
                    <SelectItem value="Lo-fi">Lo-fi</SelectItem>
                    <SelectItem value="Bollywood style">Bollywood Style</SelectItem>
                    <SelectItem value="Classical">Classical</SelectItem>
                    <SelectItem value="Acoustic">Acoustic</SelectItem>
                    <SelectItem value="EDM">EDM</SelectItem>
                    <SelectItem value="Hip-hop">Hip-hop</SelectItem>
                    <SelectItem value="Pop">Pop</SelectItem>
                    <SelectItem value="Modern slow reverb">Modern Slow Reverb</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Optional Prompt */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Additional Style Guidance (Optional)
                </label>
                <Textarea
                  value={musicPrompt}
                  onChange={(e) => setMusicPrompt(e.target.value)}
                  placeholder="Describe the vibe, mood, tempo, instruments, or cinematic style..."
                  className="min-h-[100px] resize-none"
                />
              </div>
            </TabsContent>

            <TabsContent value="instrumental" className="space-y-6">
              {/* Instrumental Type Selector */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Instrumental Type
                </label>
                <Select value={instrumentalType} onValueChange={setInstrumentalType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select instrumental type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lo-fi beats">Lo-fi Beats</SelectItem>
                    <SelectItem value="Cinematic background score">Cinematic Background Score</SelectItem>
                    <SelectItem value="Emotional piano">Emotional Piano</SelectItem>
                    <SelectItem value="Sad violin">Sad Violin</SelectItem>
                    <SelectItem value="EDM drop">EDM Drop</SelectItem>
                    <SelectItem value="Hip-hop beat">Hip-hop Beat</SelectItem>
                    <SelectItem value="Relaxing spa music">Relaxing Spa Music</SelectItem>
                    <SelectItem value="Horror ambience">Horror Ambience</SelectItem>
                    <SelectItem value="Romantic guitar">Romantic Guitar</SelectItem>
                    <SelectItem value="Upbeat modern electronic">Upbeat Modern Electronic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Optional Prompt */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Additional Style Guidance (Optional)
                </label>
                <Textarea
                  value={musicPrompt}
                  onChange={(e) => setMusicPrompt(e.target.value)}
                  placeholder="Guide the style: mood, tempo, energy, specific instruments..."
                  className="min-h-[100px] resize-none"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Generate Button */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleGenerateMusic}
              disabled={isGeneratingMusic}
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-12"
            >
              {isGeneratingMusic ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Music...
                </>
              ) : (
                <>
                  <Music className="mr-2 h-5 w-5" />
                  Generate {musicMode === "lyrics" ? "Song" : "Instrumental"}
                </>
              )}
            </Button>
          </div>

          {/* Audio Player and Download */}
          {generatedMusicUrl && (
            <div className="mt-8 space-y-4">
              <div className="rounded-lg bg-muted p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Your Generated Music</h3>
                <audio
                  controls
                  className="w-full"
                  src={generatedMusicUrl}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleDownloadMusic('mp3')}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download MP3
                  </Button>
                  <Button
                    onClick={() => handleDownloadMusic('wav')}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download WAV
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleGenerateMusic}
                    variant="outline"
                    className="flex-1"
                  >
                    Regenerate
                  </Button>
                  <Button
                    onClick={handleResetMusicGenerator}
                    variant="outline"
                    className="flex-1"
                  >
                    New Music
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pose Transfer Studio Section */}
        <div className="mt-16 rounded-2xl border border-border bg-card p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Pose Transfer <span className="text-accent">Studio</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Transfer any pose to your influencer while keeping their face, outfit, and background intact
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Influencer Image Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Upload Influencer Photo
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                This face, outfit & background will be kept
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handlePoseInfluencerUpload}
                className="hidden"
                id="pose-influencer-upload"
              />
              <label
                htmlFor="pose-influencer-upload"
                className="block cursor-pointer"
              >
                {poseInfluencerImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img
                      src={poseInfluencerImage}
                      alt="Influencer"
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-medium">Click to change</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.preventDefault();
                        setPoseInfluencerImage(null);
                        setPoseTransferResult(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-border p-8 transition-all hover:border-accent hover:bg-secondary/50">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload influencer image</span>
                  </div>
                )}
              </label>
            </div>

            {/* Pose Reference Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Upload Pose Reference
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Only the pose/body position will be used
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handlePoseReferenceUpload}
                className="hidden"
                id="pose-reference-upload"
              />
              <label
                htmlFor="pose-reference-upload"
                className="block cursor-pointer"
              >
                {poseReferenceImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img
                      src={poseReferenceImage}
                      alt="Pose Reference"
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-medium">Click to change</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.preventDefault();
                        setPoseReferenceImage(null);
                        setPoseTransferResult(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-border p-8 transition-all hover:border-accent hover:bg-secondary/50">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload pose reference</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-muted/50 rounded-lg p-4 mb-8">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">How it works:</strong> The AI will keep your influencer's face, outfit, and background from the first image, and apply only the pose from the reference photo. The result will look like a real photoshoot where the influencer changed their pose.
            </p>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center mb-8">
            <Button
              onClick={handlePoseTransfer}
              disabled={isTransferringPose || !poseInfluencerImage || !poseReferenceImage}
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-12"
            >
              {isTransferringPose ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Transferring Pose...
                </>
              ) : (
                "Generate Pose Transfer"
              )}
            </Button>
          </div>

          {/* Results */}
          {poseTransferResult && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground text-center">Result</h3>
              
              {/* Thumbnails */}
              <div className="flex justify-center gap-4 flex-wrap">
                {poseInfluencerImage && (
                  <div className="text-center">
                    <img
                      src={poseInfluencerImage}
                      alt="Original"
                      className="w-24 h-24 object-cover rounded-lg border border-border"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Original</p>
                  </div>
                )}
                {poseReferenceImage && (
                  <div className="text-center">
                    <img
                      src={poseReferenceImage}
                      alt="Pose Ref"
                      className="w-24 h-24 object-cover rounded-lg border border-border"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Pose Ref</p>
                  </div>
                )}
                <div className="text-center">
                  <img
                    src={poseTransferResult}
                    alt="Result"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-accent"
                  />
                  <p className="text-xs text-accent mt-1">Result</p>
                </div>
              </div>

              {/* Full Result Image */}
              <div className="rounded-lg overflow-hidden border border-border">
                <img
                  src={poseTransferResult}
                  alt="Pose Transfer Result"
                  className="w-full max-h-[600px] object-contain bg-muted"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Button
                    onClick={handleDownloadPoseTransfer}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    onClick={handlePoseTransfer}
                    variant="outline"
                    className="flex-1"
                    disabled={isTransferringPose}
                  >
                    Regenerate
                  </Button>
                </div>
                <Button
                  onClick={handleResetPoseTransfer}
                  variant="outline"
                  className="w-full"
                >
                  Try New Pose
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Make Me Up – AI Makeup Studio Section */}
        <div className="mt-16 rounded-2xl border border-border bg-card p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Make Me Up – <span className="text-accent">AI Makeup Studio</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Apply professional makeup styles while preserving your natural features and identity
          </p>

          {/* Image Upload */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-2">
              Upload a Clear Face Photo
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              For best results, use a well-lit photo with face clearly visible
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleMakeupImageUpload}
              className="hidden"
              id="makeup-image-upload"
            />
            <label
              htmlFor="makeup-image-upload"
              className="block cursor-pointer max-w-md"
            >
              {makeupImage ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img
                    src={makeupImage}
                    alt="Face"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium">Click to change</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.preventDefault();
                      setMakeupImage(null);
                      setMakeupResult(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-border p-8 transition-all hover:border-accent hover:bg-secondary/50">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload face photo</span>
                </div>
              )}
            </label>
          </div>

          {/* Makeup Style Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-4">
              Select Makeup Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {makeupStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedMakeupStyle(style.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                    selectedMakeupStyle === style.id
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{style.emoji}</span>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{style.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center mb-8">
            <Button
              onClick={handleApplyMakeup}
              disabled={isApplyingMakeup || !makeupImage || !selectedMakeupStyle}
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-12"
            >
              {isApplyingMakeup ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Applying Makeup...
                </>
              ) : (
                "Apply Selected Makeup"
              )}
            </Button>
          </div>

          {/* Results */}
          {makeupResult && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground text-center">Your Look</h3>
              
              {/* Before/After Thumbnails */}
              <div className="flex justify-center gap-6 flex-wrap">
                {makeupImage && (
                  <div className="text-center">
                    <img
                      src={makeupImage}
                      alt="Original"
                      className="w-28 h-28 object-cover rounded-lg border border-border"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Original</p>
                  </div>
                )}
                <div className="text-center">
                  <img
                    src={makeupResult}
                    alt="With Makeup"
                    className="w-28 h-28 object-cover rounded-lg border-2 border-accent"
                  />
                  <p className="text-xs text-accent mt-2">
                    {makeupStyles.find(s => s.id === selectedMakeupStyle)?.name}
                  </p>
                </div>
              </div>

              {/* Full Result Image */}
              <div className="rounded-lg overflow-hidden border border-border max-w-2xl mx-auto">
                <img
                  src={makeupResult}
                  alt="Makeup Result"
                  className="w-full object-contain bg-muted"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 max-w-md mx-auto">
                <Button
                  onClick={handleDownloadMakeup}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <div className="flex gap-3">
                  <Button
                    onClick={handleApplyMakeup}
                    variant="outline"
                    className="flex-1"
                    disabled={isApplyingMakeup}
                  >
                    Regenerate
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedMakeupStyle("");
                      setMakeupResult(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Try Another Style
                  </Button>
                </div>
                <Button
                  onClick={handleResetMakeup}
                  variant="outline"
                  className="w-full"
                >
                  Start Over
                </Button>
              </div>
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
