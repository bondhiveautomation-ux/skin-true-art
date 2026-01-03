import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, Download, Copy, Search, Sparkles, Diamond } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { useAdmin } from "@/hooks/useAdmin";
import { useDressLibrary, Dress } from "@/hooks/useDressLibrary";
import { fileToNormalizedDataUrl } from "@/lib/image";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/layout/Hero";
import { ToolSection } from "@/components/layout/ToolSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ValueSection } from "@/components/landing/ValueSection";
import { CTASection } from "@/components/landing/CTASection";
import { ClassesPreview } from "@/components/landing/ClassesPreview";
import { Footer } from "@/components/landing/Footer";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { ResultDisplay } from "@/components/ui/ResultDisplay";
import { SelectionGrid } from "@/components/ui/SelectionGrid";
import { ProcessingModal } from "@/components/gems/ProcessingModal";
import { LowBalanceAlert } from "@/components/gems/LowBalanceAlert";
import { getGemCost } from "@/lib/gemCosts";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { gems, deductGems, hasEnoughGems, refetchGems } = useGems();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();

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
  const [isRefiningPrompt, setIsRefiningPrompt] = useState(false);
  
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

  // Swap Studio (Face Swap) states
  const [swapInfluencerImage, setSwapInfluencerImage] = useState<string | null>(null);
  const [swapReferenceImage, setSwapReferenceImage] = useState<string | null>(null);
  const [swapResult, setSwapResult] = useState<string | null>(null);
  const [isSwappingFace, setIsSwappingFace] = useState(false);

  // Cinematic Studio states
  const [cinematicImage, setCinematicImage] = useState<string | null>(null);
  const [selectedCinematicPreset, setSelectedCinematicPreset] = useState<string | null>(null);
  const [selectedCinematicBackground, setSelectedCinematicBackground] = useState<string | null>(null);
  const [cinematicResult, setCinematicResult] = useState<string | null>(null);
  const [isTransformingCinematic, setIsTransformingCinematic] = useState(false);

  // Dress Change Studio states
  const { activeDresses, loading: dressesLoading } = useDressLibrary();
  const [dressChangeCategory, setDressChangeCategory] = useState<"male" | "female" | "kids">("female");
  const [dressChangeUserImage, setDressChangeUserImage] = useState<string | null>(null);
  const [selectedDress, setSelectedDress] = useState<Dress | null>(null);
  const [dressChangeResult, setDressChangeResult] = useState<string | null>(null);
  const [isChangingDress, setIsChangingDress] = useState(false);
  const [dressSearchQuery, setDressSearchQuery] = useState("");

  // Scroll to section handler
  const scrollToSection = (sectionId: string) => {
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
          userId: user?.id,
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

  const handleRefinePrompt = async () => {
    if (!generationPrompt.trim()) {
      toast({ title: "Empty prompt", description: "Please write a prompt to refine.", variant: "destructive" });
      return;
    }

    setIsRefiningPrompt(true);
    try {
      const { data, error } = await supabase.functions.invoke('refine-prompt', {
        body: { prompt: generationPrompt.trim() }
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

  // ==================== PROMPT EXTRACTOR ====================
  const handleExtractorImageUpload = createImageUploadHandler(setExtractorImage, [() => setExtractedPrompt("")]);

  const handleExtractPrompt = async () => {
    if (!extractorImage) {
      toast({ title: "No image uploaded", description: "Please upload an image first", variant: "destructive" });
      return;
    }
    if (!hasEnoughGems("extract-image-prompt")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("extract-image-prompt")} gem for this feature`, variant: "destructive" });
      return;
    }
    const gemResult = await deductGems("extract-image-prompt");
    if (!gemResult.success) {
      toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
      return;
    }
    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-image-prompt', { body: { image: extractorImage } });
      if (error) throw error;
      if (data?.prompt) {
        setExtractedPrompt(data.prompt);
        await logGeneration("Prompt Extractor");
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
    if (!hasEnoughGems("extract-dress-to-dummy")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("extract-dress-to-dummy")} gems for this feature`, variant: "destructive" });
      return;
    }
    const gemResult = await deductGems("extract-dress-to-dummy");
    if (!gemResult.success) {
      toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
      return;
    }
    setIsExtractingDress(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-dress-to-dummy', { body: { image: dressImage, userId: user?.id } });
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
    if (!hasEnoughGems("remove-people-from-image")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("remove-people-from-image")} gems for this feature`, variant: "destructive" });
      return;
    }
    const gemResult = await deductGems("remove-people-from-image");
    if (!gemResult.success) {
      toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
      return;
    }
    setIsRemovingPeople(true);
    try {
      const { data, error } = await supabase.functions.invoke('remove-people-from-image', { body: { image: peopleImage, userId: user?.id } });
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
    if (!hasEnoughGems("pose-transfer")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("pose-transfer")} gems for this feature`, variant: "destructive" });
      return;
    }
    const gemResult = await deductGems("pose-transfer");
    if (!gemResult.success) {
      toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
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
        await logGeneration("Pose Transfer", [], [data.generatedImageUrl]);
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
    if (!hasEnoughGems("apply-makeup")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("apply-makeup")} gems for this feature`, variant: "destructive" });
      return;
    }
    const gemResult = await deductGems("apply-makeup");
    if (!gemResult.success) {
      toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
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
        await logGeneration("Makeup Studio", [], [data.generatedImageUrl]);
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
    if (!hasEnoughGems("full-look-transfer")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("full-look-transfer")} gems for this feature`, variant: "destructive" });
      return;
    }
    const gemResult = await deductGems("full-look-transfer");
    if (!gemResult.success) {
      toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
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
        await logGeneration("Full Look Transfer", [], [data.generatedImageUrl]);
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

  // ==================== SWAP STUDIO (FACE SWAP) ====================
  const handleSwapInfluencerUpload = createImageUploadHandler(setSwapInfluencerImage, [() => setSwapResult(null)]);
  const handleSwapReferenceUpload = createImageUploadHandler(setSwapReferenceImage, [() => setSwapResult(null)]);

  const handleFaceSwap = async () => {
    if (!swapInfluencerImage) {
      toast({ title: "Missing Influencer Image", description: "Please upload the influencer photo", variant: "destructive" });
      return;
    }
    if (!swapReferenceImage) {
      toast({ title: "Missing Reference Image", description: "Please upload the reference image", variant: "destructive" });
      return;
    }
    if (!hasEnoughGems("face-swap")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("face-swap")} gems for this feature`, variant: "destructive" });
      return;
    }
    const gemResult = await deductGems("face-swap");
    if (!gemResult.success) {
      toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
      return;
    }
    setIsSwappingFace(true);
    setSwapResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('face-swap', {
        body: { influencerImage: swapInfluencerImage, referenceImage: swapReferenceImage }
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Face Swap Failed", description: data.error, variant: "destructive" });
        return;
      }
      if (data?.generatedImageUrl) {
        setSwapResult(data.generatedImageUrl);
        await logGeneration("Face Swap", [swapInfluencerImage, swapReferenceImage], [data.generatedImageUrl]);
        toast({ title: "Face Swap Complete!", description: "Your face swap has been created successfully" });
      }
    } catch (error: any) {
      toast({ title: "Face Swap Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSwappingFace(false);
    }
  };

  const handleDownloadSwap = () => {
    if (!swapResult) return;
    const link = document.createElement('a');
    link.href = swapResult;
    link.download = 'face-swap-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetSwap = () => {
    setSwapInfluencerImage(null);
    setSwapReferenceImage(null);
    setSwapResult(null);
  };

  // ==================== DRESS CHANGE STUDIO ====================
  const handleDressChangeUserImageUpload = createImageUploadHandler(setDressChangeUserImage, [
    () => setDressChangeResult(null),
    () => setSelectedDress(null),
  ]);

  const filteredDresses = activeDresses.filter((dress) => {
    const matchesCategory = dress.category === dressChangeCategory;
    const matchesSearch =
      !dressSearchQuery ||
      dress.name.toLowerCase().includes(dressSearchQuery.toLowerCase()) ||
      dress.tags.some((tag) => tag.toLowerCase().includes(dressSearchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleDressChange = async () => {
    if (!dressChangeUserImage) {
      toast({ title: "Missing Photo", description: "Please upload your photo first", variant: "destructive" });
      return;
    }
    if (!selectedDress) {
      toast({ title: "No Dress Selected", description: "Please select a dress from the library", variant: "destructive" });
      return;
    }
    if (!hasEnoughGems("dress-change")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("dress-change")} gems for this feature`, variant: "destructive" });
      return;
    }
    const gemResult = await deductGems("dress-change");
    if (!gemResult.success) {
      toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
      return;
    }
    setIsChangingDress(true);
    setDressChangeResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("dress-change", {
        body: {
          userImage: dressChangeUserImage,
          dressImageUrl: selectedDress.image_url,
          category: dressChangeCategory,
          userId: user?.id,
        },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Dress Change Failed", description: data.error, variant: "destructive" });
        return;
      }
      if (data?.generatedImageUrl) {
        setDressChangeResult(data.generatedImageUrl);
        await logGeneration("Dress Change Studio", [], [data.generatedImageUrl]);
        toast({ title: "Dress Change Complete!", description: "Your new look has been generated successfully" });
      }
    } catch (error: any) {
      toast({ title: "Dress Change Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsChangingDress(false);
    }
  };

  const handleDownloadDressChange = () => {
    if (!dressChangeResult) return;
    const link = document.createElement("a");
    link.href = dressChangeResult;
    link.download = "dress-change-result.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetDressChange = () => {
    setDressChangeUserImage(null);
    setSelectedDress(null);
    setDressChangeResult(null);
    setDressSearchQuery("");
  };

  // ==================== CINEMATIC STUDIO ====================
  const CINEMATIC_PRESETS = [
    { id: null, name: "None (Keep Original Style)", emoji: "📷" },
    { id: "over-shoulder", name: "Over-the-Shoulder Grace", emoji: "🌟" },
    { id: "birds-eye", name: "Bird's-Eye Bridal Symphony", emoji: "🦅" },
    { id: "high-angle", name: "High-Angle Royal Gaze", emoji: "👑" },
    { id: "joy-closeup", name: "Spontaneous Joy Close-Up", emoji: "😊" },
    { id: "neckline", name: "Neckline Elegance Detail", emoji: "💎" },
    { id: "eyes", name: "Eyes of the Bride", emoji: "👁️" },
    { id: "full-frame", name: "Full-Frame Royal Stance", emoji: "🏛️" },
    { id: "window-light", name: "Window-Light Serenity", emoji: "🪟" },
    { id: "candid-walk", name: "Candid Side Walk", emoji: "🚶‍♀️" },
    { id: "floor-seated", name: "Floor-Seated Royal Pose", emoji: "🧘‍♀️" },
    { id: "jewellery-glow", name: "Jewellery Glow Portrait", emoji: "✨" },
    { id: "mirror", name: "Mirror Reflection Elegance", emoji: "🪞" },
  ];

  const CINEMATIC_BACKGROUNDS = [
    { id: null, name: "None (Keep Original Background)", emoji: "📷" },
    { id: "warm-neutral-luxury", name: "Warm Neutral Luxury Wall", emoji: "1️⃣" },
    { id: "dark-mocha-editorial", name: "Dark Mocha Editorial Studio", emoji: "2️⃣" },
    { id: "classic-off-white-panel", name: "Classic Off-White Panel Room", emoji: "3️⃣" },
    { id: "window-light-corner", name: "Window-Light Studio Corner", emoji: "4️⃣" },
    { id: "luxury-fabric-backdrop", name: "Luxury Fabric Backdrop", emoji: "5️⃣" },
    { id: "royal-burgundy-editorial", name: "Royal Burgundy Editorial Wall", emoji: "6️⃣" },
    { id: "minimal-grey-studio", name: "Minimal Grey Studio Interior", emoji: "7️⃣" },
    { id: "warm-indoor-apartment", name: "Warm Indoor Apartment Lounge", emoji: "8️⃣" },
    { id: "soft-shadow-editorial", name: "Soft Shadow Editorial Backdrop", emoji: "9️⃣" },
    { id: "classic-dark-studio-fade", name: "Classic Dark Studio Fade", emoji: "🔟" },
  ];

  const handleCinematicImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
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

    try {
      // Normalize EXIF orientation into pixels so the model never sees a rotated input.
      const normalized = await fileToNormalizedDataUrl(file);
      setCinematicImage(normalized);
      setCinematicResult(null);
    } catch (err) {
      console.error("Failed to normalize image:", err);
      toast({
        title: "Upload failed",
        description: "Could not process this image. Please try a different file.",
        variant: "destructive",
      });
    }
  };

  const handleCinematicTransform = async () => {
    if (!cinematicImage) {
      toast({ title: "No image", description: "Please upload a photo first", variant: "destructive" });
      return;
    }
    // At least one option must be selected
    if (!selectedCinematicPreset && !selectedCinematicBackground) {
      toast({ title: "No options selected", description: "Please select at least a cinematic style or a background option", variant: "destructive" });
      return;
    }
    if (!hasEnoughGems("cinematic-transform")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("cinematic-transform")} gems for this feature`, variant: "destructive" });
      return;
    }
    const gemResult = await deductGems("cinematic-transform");
    if (!gemResult.success) {
      toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
      return;
    }
    setIsTransformingCinematic(true);
    setCinematicResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("cinematic-transform", {
        body: { image: cinematicImage, presetId: selectedCinematicPreset, backgroundId: selectedCinematicBackground },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Transform Failed", description: data.error, variant: "destructive" });
        return;
      }
      if (data?.result) {
        setCinematicResult(data.result);
        await logGeneration("Cinematic Studio", [], [data.result]);
        const appliedText = [
          data.presetName && data.presetName !== 'None' ? data.presetName : null,
          data.backgroundName && data.backgroundName !== 'Original' ? data.backgroundName : null
        ].filter(Boolean).join(' + ') || 'Enhancements';
        toast({ title: "Cinematic Transform Complete!", description: `Applied: ${appliedText}` });
      }
    } catch (error: any) {
      toast({ title: "Transform Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsTransformingCinematic(false);
    }
  };

  const handleDownloadCinematic = () => {
    if (!cinematicResult) return;
    const link = document.createElement("a");
    link.href = cinematicResult;
    link.download = `cinematic-${selectedCinematicPreset || 'result'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetCinematic = () => {
    // Keep the original image so user doesn't have to re-upload
    setCinematicResult(null);
    setSelectedCinematicPreset(null);
    setSelectedCinematicBackground(null);
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
      <Navbar onNavigate={scrollToSection} onSignOut={signOut} userEmail={user?.email} credits={gems} isAdmin={isAdmin} />
      
      {/* Hero Section */}
      <Hero onExplore={() => scrollToSection("features")} />

      {/* Features Section */}
      <FeaturesSection id="features" />

      {/* How It Works Section */}
      <HowItWorksSection id="how-it-works" />

      {/* Value Section */}
      <ValueSection />

      {/* CTA Section */}
      <CTASection onGetStarted={() => scrollToSection("tools")} />

      {/* Tools Section Divider */}
      <div id="tools" className="pt-16 lg:pt-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center mb-12">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Tools
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
            Start creating
          </h2>
        </div>
      </div>

      {/* Character Generator Section */}
      <ToolSection
        id="character-generator"
        title="Character-Consistent"
        subtitle="Image Generator"
        description="Generate new images while keeping the exact same face and identity"
      >
        <div className="space-y-6">
          {/* Character Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <ImageUploader
              id="character-upload"
              image={characterImage}
              onUpload={handleCharacterImageUpload}
              onRemove={() => { setCharacterImage(null); setGeneratedImage(null); }}
              label="Character Reference"
              description="Main character image"
              aspectRatio="portrait"
            />
            
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <ImageUploader
                  id="product-upload"
                  image={productImage}
                  onUpload={handleProductImageUpload}
                  onRemove={() => { setProductImage(null); setSelectedPreset(""); }}
                  label="Product Image (Optional)"
                  description="Product for character to showcase"
                />
                
                {productImage && (
                  <div className="space-y-3">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <ImageUploader
                  id="background-upload"
                  image={backgroundImage}
                  onUpload={handleBackgroundImageUpload}
                  onRemove={() => { setBackgroundImage(null); setSelectedPose(""); }}
                  label="Background Image (Optional)"
                  description="Custom background"
                />
                
                {backgroundImage && (
                  <div className="space-y-3">
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
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Scenario Prompt</label>
                  <Textarea
                    value={generationPrompt}
                    onChange={(e) => setGenerationPrompt(e.target.value)}
                    placeholder="Describe the scenario you want to generate..."
                    className="min-h-[80px] bg-secondary/30 border-border/50"
                  />
                </div>
              )}

              {/* Generate and Refine buttons */}
              <div className="flex justify-center gap-3 flex-wrap">
                {!productImage && generationPrompt.trim() && (
                  <Button
                    onClick={handleRefinePrompt}
                    disabled={isRefiningPrompt || isGeneratingImage}
                    variant="dark-outline"
                    size="lg"
                    className="group relative"
                    title="Improve your prompt without using credits"
                  >
                    {isRefiningPrompt ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Refining...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 group-hover:text-gold transition-colors" />
                        Refine Prompt
                        <span className="ml-2 text-xs text-muted-foreground">(Free)</span>
                      </>
                    )}
                  </Button>
                )}
                <LoadingButton
                  onClick={handleGenerateImage}
                  isLoading={isGeneratingImage}
                  loadingText={`Generating... ${Math.round(generationProgress)}%`}
                  size="lg"
                  className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-10"
                >
                  Generate Image
                </LoadingButton>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-cream/50 text-xs">
                <Diamond className="w-3.5 h-3.5 text-purple-400" />
                <span>Costs {getGemCost("generate-character-image")} gems</span>
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
        description="Extract detailed AI prompts from any image"
      >
        <div className="space-y-6">
          <div className="max-w-sm mx-auto">
            <ImageUploader
              id="extractor-upload"
              image={extractorImage}
              onUpload={handleExtractorImageUpload}
              onRemove={() => { setExtractorImage(null); setExtractedPrompt(""); }}
              label="Upload Image to Analyze"
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <LoadingButton
              onClick={handleExtractPrompt}
              isLoading={isExtracting}
              loadingText="Analyzing..."
              disabled={!extractorImage}
              size="lg"
              className="btn-glow bg-foreground text-background hover:bg-foreground/90"
            >
              Extract Prompt
            </LoadingButton>
            <div className="flex items-center gap-1.5 text-cream/50 text-xs">
              <Diamond className="w-3.5 h-3.5 text-purple-400" />
              <span>Costs {getGemCost("extract-image-prompt")} gem</span>
            </div>
          </div>

          {extractedPrompt && (
            <div className="space-y-3 max-w-xl mx-auto animate-fade-in">
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
        description="Isolate outfits cleanly from reference images"
      >
        <div className="space-y-6">
          <div className="max-w-sm mx-auto">
            <ImageUploader
              id="dress-upload"
              image={dressImage}
              onUpload={handleDressImageUpload}
              onRemove={() => { setDressImage(null); setExtractedDressImage(null); }}
              label="Upload Photo of Person Wearing Outfit"
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <LoadingButton
              onClick={handleExtractDress}
              isLoading={isExtractingDress}
              loadingText="Extracting..."
              disabled={!dressImage}
              size="lg"
              className="btn-glow bg-foreground text-background hover:bg-foreground/90"
            >
              Generate Dress on Dummy
            </LoadingButton>
            <div className="flex items-center gap-1.5 text-cream/50 text-xs">
              <Diamond className="w-3.5 h-3.5 text-purple-400" />
              <span>Costs {getGemCost("extract-dress-to-dummy")} gems</span>
            </div>
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
        description="Remove unwanted people while preserving the background"
      >
        <div className="space-y-6">
          <div className="max-w-sm mx-auto">
            <ImageUploader
              id="people-upload"
              image={peopleImage}
              onUpload={handlePeopleImageUpload}
              onRemove={handleResetPeopleRemoval}
              label="Upload Image with People"
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <LoadingButton
              onClick={handleRemovePeople}
              isLoading={isRemovingPeople}
              loadingText="Removing People..."
              disabled={!peopleImage}
              size="lg"
              className="btn-glow bg-foreground text-background hover:bg-foreground/90"
            >
              Generate Clean Background
            </LoadingButton>
            <div className="flex items-center gap-1.5 text-cream/50 text-xs">
              <Diamond className="w-3.5 h-3.5 text-purple-400" />
              <span>Costs {getGemCost("remove-people-from-image")} gems</span>
            </div>
          </div>

          {cleanBackground && (
            <ResultDisplay
              result={cleanBackground}
              originalImages={peopleImage ? [{ src: peopleImage, label: "Original" }] : []}
              onDownload={() => handleDownloadBackground('png')}
              onRegenerate={handleRemovePeople}
              onReset={handleResetPeopleRemoval}
              isProcessing={isRemovingPeople}
            />
          )}
        </div>
      </ToolSection>

      {/* Pose Transfer Section */}
      <ToolSection
        id="pose-transfer"
        title="Pose Transfer"
        subtitle="Studio"
        description="Apply the pose from one image to another character"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
              description="Only the pose will be used"
              aspectRatio="portrait"
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <LoadingButton
              onClick={handlePoseTransfer}
              isLoading={isTransferringPose}
              loadingText="Transferring Pose..."
              disabled={!poseInfluencerImage || !poseReferenceImage}
              size="lg"
              className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-10"
            >
              Generate Pose Transfer
            </LoadingButton>
            <div className="flex items-center gap-1.5 text-cream/50 text-xs">
              <Diamond className="w-3.5 h-3.5 text-purple-400" />
              <span>Costs {getGemCost("pose-transfer")} gems</span>
            </div>
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
        description="Apply professional-grade makeup styles digitally"
      >
        <div className="space-y-6">
          <div className="max-w-sm mx-auto">
            <ImageUploader
              id="makeup-upload"
              image={makeupImage}
              onUpload={handleMakeupImageUpload}
              onRemove={handleResetMakeup}
              label="Upload a Clear Face Photo"
            />
          </div>

          {makeupImage && (
            <div className="space-y-3">
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

          <div className="flex flex-col items-center gap-2">
            <LoadingButton
              onClick={handleApplyMakeup}
              isLoading={isApplyingMakeup}
              loadingText="Applying Makeup..."
              disabled={!makeupImage || !selectedMakeupStyle}
              size="lg"
              className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-10"
            >
              Apply Selected Makeup
            </LoadingButton>
            <div className="flex items-center gap-1.5 text-cream/50 text-xs">
              <Diamond className="w-3.5 h-3.5 text-purple-400" />
              <span>Costs {getGemCost("apply-makeup")} gems</span>
            </div>
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
        description="Transfer the complete look while keeping the original face"
      >
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <ImageUploader
              id="face-upload"
              image={fullLookFaceImage}
              onUpload={handleFullLookFaceUpload}
              onRemove={() => { setFullLookFaceImage(null); setFullLookResult(null); }}
              label="Image 1: Influencer Face"
              description="The face/identity to keep"
              aspectRatio="portrait"
            />
            <ImageUploader
              id="reference-upload"
              image={fullLookReferenceImage}
              onUpload={handleFullLookReferenceUpload}
              onRemove={() => { setFullLookReferenceImage(null); setFullLookResult(null); }}
              label="Image 2: Reference Look"
              description="Outfit, pose & style to copy"
              aspectRatio="portrait"
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <LoadingButton
              onClick={handleFullLookTransfer}
              isLoading={isTransferringLook}
              loadingText="Generating Full Look..."
              disabled={!fullLookFaceImage || !fullLookReferenceImage}
              size="lg"
              className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-10"
            >
              Generate Full Look
            </LoadingButton>
            <div className="flex items-center gap-1.5 text-cream/50 text-xs">
              <Diamond className="w-3.5 h-3.5 text-purple-400" />
              <span>Costs {getGemCost("full-look-transfer")} gems</span>
            </div>
          </div>

          {fullLookResult && (
            <ResultDisplay
              result={fullLookResult}
              originalImages={[
                ...(fullLookFaceImage ? [{ src: fullLookFaceImage, label: "Face" }] : []),
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

      {/* Swap Studio (Face Swap) Section */}
      <ToolSection
        id="swap-studio"
        title="Swap Studio"
        subtitle="– Face Swap"
        description="Swap the influencer's face onto a reference image while keeping everything else unchanged"
      >
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <ImageUploader
              id="swap-influencer-upload"
              image={swapInfluencerImage}
              onUpload={handleSwapInfluencerUpload}
              onRemove={() => { setSwapInfluencerImage(null); setSwapResult(null); }}
              label="Influencer Image"
              description="The face to use for swapping"
              aspectRatio="portrait"
            />
            <ImageUploader
              id="swap-reference-upload"
              image={swapReferenceImage}
              onUpload={handleSwapReferenceUpload}
              onRemove={() => { setSwapReferenceImage(null); setSwapResult(null); }}
              label="Reference Image"
              description="Background, dress & pose stay the same"
              aspectRatio="portrait"
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <LoadingButton
              onClick={handleFaceSwap}
              isLoading={isSwappingFace}
              loadingText="Swapping Face..."
              disabled={!swapInfluencerImage || !swapReferenceImage}
              size="lg"
              className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-10"
            >
              Swap Face
            </LoadingButton>
            <div className="flex items-center gap-1.5 text-cream/50 text-xs">
              <Diamond className="w-3.5 h-3.5 text-purple-400" />
              <span>Costs {getGemCost("face-swap")} gems</span>
            </div>
          </div>

          {swapResult && (
            <ResultDisplay
              result={swapResult}
              originalImages={[
                ...(swapInfluencerImage ? [{ src: swapInfluencerImage, label: "Influencer" }] : []),
                ...(swapReferenceImage ? [{ src: swapReferenceImage, label: "Reference" }] : []),
              ]}
              onDownload={handleDownloadSwap}
              onRegenerate={handleFaceSwap}
              onReset={handleResetSwap}
              isProcessing={isSwappingFace}
              resetLabel="Try Another Swap"
            />
          )}
        </div>
      </ToolSection>

      {/* Dress Change Studio Section */}
      <ToolSection
        id="dress-change-studio"
        title="Dress Change"
        subtitle="Studio"
        description="Try on outfits from our curated library while keeping your face and pose unchanged"
      >
        <div className="space-y-6">
          {/* Step 1: Category Selection */}
          <div className="flex items-center justify-center gap-4 pb-4 border-b border-border/50">
            <span className="text-sm font-medium text-muted-foreground">Category:</span>
            <div className="flex gap-2">
              <Button
                variant={dressChangeCategory === "female" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setDressChangeCategory("female");
                  setSelectedDress(null);
                }}
                className={dressChangeCategory === "female" ? "bg-foreground text-background" : ""}
              >
                Female
              </Button>
              <Button
                variant={dressChangeCategory === "male" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setDressChangeCategory("male");
                  setSelectedDress(null);
                }}
                className={dressChangeCategory === "male" ? "bg-foreground text-background" : ""}
              >
                Male
              </Button>
              <Button
                variant={dressChangeCategory === "kids" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setDressChangeCategory("kids");
                  setSelectedDress(null);
                }}
                className={dressChangeCategory === "kids" ? "bg-foreground text-background" : ""}
              >
                Kids
              </Button>
            </div>
          </div>

          {/* Step 2: Dress Picker Grid - Now shown first */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-medium text-foreground">Step 1: Select a Dress</label>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or tag..."
                  value={dressSearchQuery}
                  onChange={(e) => setDressSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {dressesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredDresses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No dresses available for {dressChangeCategory} category.</p>
                <p className="text-sm mt-1">Admin needs to add dresses to the library.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredDresses.map((dress) => (
                  <button
                    key={dress.id}
                    onClick={() => setSelectedDress(dress)}
                    disabled={isChangingDress}
                    className={`group relative rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedDress?.id === dress.id
                        ? "border-gold ring-2 ring-gold/30"
                        : "border-border hover:border-gold/50"
                    } ${isChangingDress ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="aspect-[3/4] relative">
                      <img
                        src={dress.image_url}
                        alt={dress.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      {selectedDress?.id === dress.id && (
                        <div className="absolute inset-0 bg-gold/10 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-background"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-card/80 backdrop-blur-sm">
                      <p className="text-xs font-medium text-foreground truncate">{dress.name}</p>
                      {dress.tags.length > 0 && (
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {dress.tags.slice(0, 2).join(", ")}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 3: Upload User Photo - Now shown after dress selection */}
          {selectedDress && (
            <div className="space-y-4 pt-4 border-t border-border/50">
              <label className="block text-sm font-medium text-foreground text-center">
                Step 2: Upload Your Photo
              </label>
              <div className="max-w-sm mx-auto">
                <ImageUploader
                  id="dress-change-user"
                  image={dressChangeUserImage}
                  onUpload={handleDressChangeUserImageUpload}
                  onRemove={() => {
                    setDressChangeUserImage(null);
                    setDressChangeResult(null);
                  }}
                  label="Your Photo"
                  description="Clear, full-body photo works best"
                  aspectRatio="portrait"
                />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex flex-col items-center gap-2">
            <LoadingButton
              onClick={handleDressChange}
              isLoading={isChangingDress}
              loadingText="Generating..."
              disabled={!dressChangeUserImage || !selectedDress}
              size="lg"
              className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-10"
            >
              Generate Dress Change
            </LoadingButton>
            <div className="flex items-center gap-1.5 text-cream/50 text-xs">
              <Diamond className="w-3.5 h-3.5 text-purple-400" />
              <span>Costs {getGemCost("dress-change")} gems</span>
            </div>
          </div>

          {/* Result */}
          {dressChangeResult && (
            <ResultDisplay
              result={dressChangeResult}
              originalImages={[
                ...(dressChangeUserImage ? [{ src: dressChangeUserImage, label: "Original" }] : []),
                ...(selectedDress ? [{ src: selectedDress.image_url, label: "Dress" }] : []),
              ]}
              onDownload={handleDownloadDressChange}
              onRegenerate={handleDressChange}
              onReset={handleResetDressChange}
              isProcessing={isChangingDress}
              resetLabel="Try Another Dress"
            />
          )}
        </div>
      </ToolSection>

      {/* Cinematic Studio Section */}
      <ToolSection
        id="cinematic-studio"
        title="Cinematic"
        subtitle="Studio"
        description="Transform your photos into stunning cinematic bridal shots with one click"
      >
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="max-w-sm mx-auto">
            <ImageUploader
              id="cinematic-upload"
              image={cinematicImage}
              onUpload={handleCinematicImageUpload}
              onRemove={() => {
                setCinematicImage(null);
                setCinematicResult(null);
              }}
              label="Upload Photo"
              description="Clear bridal/portrait photo"
              aspectRatio="portrait"
            />
          </div>

          {/* Preset Selection Tabs */}
          {cinematicImage && !cinematicResult && (
            <div className="space-y-6">
              {/* Cinematic Style Selection */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-foreground text-center">
                  Select Cinematic Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {CINEMATIC_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedCinematicPreset(preset.id)}
                      disabled={isTransformingCinematic}
                      className={`relative rounded-xl border text-left transition-all duration-300 p-4 ${
                        selectedCinematicPreset === preset.id
                          ? "border-gold/50 bg-gold/10 text-cream shadow-gold"
                          : "border-gold/15 bg-charcoal-light text-cream/70 hover:border-gold/30 hover:bg-charcoal"
                      } ${isTransformingCinematic ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0">{preset.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-tight">{preset.name}</p>
                        </div>
                      </div>
                      {selectedCinematicPreset === preset.id && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Selection */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-foreground text-center">
                  Select Background (Optional)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {CINEMATIC_BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.id || 'original'}
                      onClick={() => setSelectedCinematicBackground(bg.id)}
                      disabled={isTransformingCinematic}
                      className={`relative rounded-xl border text-left transition-all duration-300 p-4 ${
                        selectedCinematicBackground === bg.id
                          ? "border-gold/50 bg-gold/10 text-cream shadow-gold"
                          : "border-gold/15 bg-charcoal-light text-cream/70 hover:border-gold/30 hover:bg-charcoal"
                      } ${isTransformingCinematic ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0">{bg.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-tight">{bg.name}</p>
                        </div>
                      </div>
                      {selectedCinematicBackground === bg.id && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Transform Button */}
          {cinematicImage && !cinematicResult && (
            <div className="flex flex-col items-center gap-2">
              <LoadingButton
                onClick={handleCinematicTransform}
                isLoading={isTransformingCinematic}
                loadingText="Transforming..."
                disabled={!cinematicImage}
                size="lg"
                className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-10"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Apply Cinematic Style
              </LoadingButton>
              <div className="flex items-center gap-1.5 text-cream/50 text-xs">
                <Diamond className="w-3.5 h-3.5 text-purple-400" />
                <span>Costs {getGemCost("cinematic-transform")} gems</span>
              </div>
            </div>
          )}

          {/* Result */}
          {cinematicResult && (
            <ResultDisplay
              result={cinematicResult}
              originalImages={cinematicImage ? [{ src: cinematicImage, label: "Original" }] : []}
              onDownload={handleDownloadCinematic}
              onRegenerate={handleCinematicTransform}
              onReset={handleResetCinematic}
              isProcessing={isTransformingCinematic}
              resetLabel="Try Another Style"
            />
          )}
        </div>
      </ToolSection>

      {/* Classes Preview Section */}
      <ClassesPreview />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
