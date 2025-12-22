import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Copy, RefreshCw, ArrowLeft, Type, Languages, Smile, AlignLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { LoadingButton } from "@/components/ui/LoadingButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ProcessingModal } from "@/components/gems/ProcessingModal";
import { LowBalanceAlert } from "@/components/gems/LowBalanceAlert";
import { getGemCost } from "@/lib/gemCosts";

type Language = "bangla" | "english";
type CaptionLength = "short" | "medium" | "long";
type ToneStyle = "bold_salesy" | "elegant_premium" | "friendly_casual" | "minimal_clean";

const CaptionStudio = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { gems, deductGems, hasEnoughGems, refetchGems } = useGems();
  const { toast } = useToast();
  const [showLowBalance, setShowLowBalance] = useState(false);

  // States
  const [productImage, setProductImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<Language>("english");
  const [withEmojis, setWithEmojis] = useState(true);
  const [captionLength, setCaptionLength] = useState<CaptionLength>("medium");
  const [toneStyle, setToneStyle] = useState<ToneStyle>("bold_salesy");
  const [generateVariations, setGenerateVariations] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);

  // Helper function to log generation
  const logGeneration = async (featureName: string) => {
    if (!user?.id) return;

    try {
      await supabase.rpc("log_generation", {
        p_user_id: user.id,
        p_feature_name: featureName,
        p_input_images: [],
        p_output_images: [],
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

  // Show loading state while checking auth
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
      setProductImage(e.target?.result as string);
      setGeneratedCaptions([]);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!productImage && !description.trim()) {
      toast({
        title: "Missing input",
        description: "Please upload a product image or add a description",
        variant: "destructive",
      });
      return;
    }

    if (!hasEnoughGems("generate-caption")) {
      setShowLowBalance(true);
      return;
    }

    const result = await deductGems("generate-caption");
    if (!result.success) {
      toast({
        title: "Insufficient gems",
        description: "Please top up your gems to continue",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedCaptions([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-caption', {
        body: {
          productImage,
          description: description.trim(),
          language,
          withEmojis,
          captionLength,
          toneStyle,
          generateVariations,
        }
      });

      if (error) throw error;
      
      if (data?.error) {
        toast({
          title: "Generation failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data?.captions) {
        setGeneratedCaptions(data.captions);
        await logGeneration("Caption Studio");
        toast({
          title: "Caption generated!",
          description: generateVariations ? "2 variations created" : "Your caption is ready",
        });
      }
    } catch (error: any) {
      console.error("Caption generation error:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate caption",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCaption = (caption: string) => {
    navigator.clipboard.writeText(caption);
    toast({
      title: "Copied!",
      description: "Caption copied to clipboard",
    });
  };

  const handleReset = () => {
    setProductImage(null);
    setDescription("");
    setGeneratedCaptions([]);
  };

  const lengthOptions = [
    { value: "short", label: "Short", desc: "1-2 lines + CTA" },
    { value: "medium", label: "Medium", desc: "Bullets + CTA" },
    { value: "long", label: "Long", desc: "Detailed + Benefits" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onNavigate={(section) => navigate(`/#${section}`)} 
        credits={gems}
      />

      {/* Hero Section */}
      <section className="pt-28 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-charcoal to-background" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-gold/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 noise-texture" />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-cream/60 hover:text-gold transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </button>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 border border-gold/25 mb-6 backdrop-blur-sm">
              <Type className="w-4 h-4 text-gold" />
              <span className="text-xs font-semibold text-gold uppercase tracking-widest">Caption Studio</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-cream tracking-tight mb-4">
              Generate <span className="gradient-text">High-Converting</span> Captions
            </h1>
            <p className="text-cream/50 max-w-xl mx-auto leading-relaxed font-light">
              Create CTA-ready product captions in Bangla or English with AI-powered precision.
            </p>
          </div>
        </div>
      </section>

      {/* Main Tool Section */}
      <section className="pb-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-background to-background" />
        <div className="absolute inset-0 noise-texture" />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8">
          <div className="glass-card p-6 sm:p-8 lg:p-10 border border-gold/15 hover:border-gold/25 transition-all duration-500">
            <div className="space-y-8">
              {/* Upload Section */}
              <div className="max-w-md mx-auto">
                <ImageUploader
                  id="product-image-upload"
                  image={productImage}
                  onUpload={handleImageUpload}
                  onRemove={() => {
                    setProductImage(null);
                    setGeneratedCaptions([]);
                  }}
                  label="Upload Product Image"
                  description="Drag & drop or click to upload your product photo"
                />
              </div>

              {/* Description Box */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-cream">
                  Product Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the product, price, offer, delivery area, brand tone, and any key details…"
                  className="min-h-[120px] bg-secondary/30 border-border/50 text-cream placeholder:text-cream/40 resize-none"
                />
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language Selector */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-gold" />
                    <label className="text-sm font-medium text-cream">Language</label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLanguage("bangla")}
                      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-300 ${
                        language === "bangla"
                          ? "border-gold/50 bg-gold/10 text-gold shadow-gold"
                          : "border-gold/15 bg-charcoal-light text-cream/70 hover:border-gold/30"
                      }`}
                    >
                      বাংলা (Bangla)
                    </button>
                    <button
                      onClick={() => setLanguage("english")}
                      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-300 ${
                        language === "english"
                          ? "border-gold/50 bg-gold/10 text-gold shadow-gold"
                          : "border-gold/15 bg-charcoal-light text-cream/70 hover:border-gold/30"
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                {/* Emoji Toggle */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Smile className="w-4 h-4 text-gold" />
                    <label className="text-sm font-medium text-cream">Emoji Style</label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWithEmojis(true)}
                      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-300 ${
                        withEmojis
                          ? "border-gold/50 bg-gold/10 text-gold shadow-gold"
                          : "border-gold/15 bg-charcoal-light text-cream/70 hover:border-gold/30"
                      }`}
                    >
                      With Emojis 😊
                    </button>
                    <button
                      onClick={() => setWithEmojis(false)}
                      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-300 ${
                        !withEmojis
                          ? "border-gold/50 bg-gold/10 text-gold shadow-gold"
                          : "border-gold/15 bg-charcoal-light text-cream/70 hover:border-gold/30"
                      }`}
                    >
                      No Emojis
                    </button>
                  </div>
                </div>

                {/* Caption Length */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-gold" />
                    <label className="text-sm font-medium text-cream">Caption Length</label>
                  </div>
                  <div className="flex gap-2">
                    {lengthOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setCaptionLength(option.value as CaptionLength)}
                        className={`flex-1 py-3 px-3 rounded-xl border text-center transition-all duration-300 ${
                          captionLength === option.value
                            ? "border-gold/50 bg-gold/10 shadow-gold"
                            : "border-gold/15 bg-charcoal-light hover:border-gold/30"
                        }`}
                      >
                        <span className={`block text-sm font-medium ${captionLength === option.value ? "text-gold" : "text-cream/70"}`}>
                          {option.label}
                        </span>
                        <span className="block text-[10px] text-cream/40 mt-0.5">{option.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone Style */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold" />
                    <label className="text-sm font-medium text-cream">Tone Style</label>
                  </div>
                  <Select value={toneStyle} onValueChange={(value) => setToneStyle(value as ToneStyle)}>
                    <SelectTrigger className="bg-secondary/30 border-gold/20 text-cream">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-charcoal border-gold/20">
                      <SelectItem value="bold_salesy" className="text-cream hover:bg-gold/10">
                        Bold & Salesy
                      </SelectItem>
                      <SelectItem value="elegant_premium" className="text-cream hover:bg-gold/10">
                        Elegant & Premium
                      </SelectItem>
                      <SelectItem value="friendly_casual" className="text-cream hover:bg-gold/10">
                        Friendly & Casual
                      </SelectItem>
                      <SelectItem value="minimal_clean" className="text-cream hover:bg-gold/10">
                        Minimal & Clean
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Variations Toggle */}
              <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-secondary/20 border border-gold/10">
                <Switch
                  id="variations"
                  checked={generateVariations}
                  onCheckedChange={setGenerateVariations}
                  className="data-[state=checked]:bg-gold"
                />
                <Label htmlFor="variations" className="text-sm text-cream/70 cursor-pointer">
                  Generate 2 Variations (Version A + Version B)
                </Label>
              </div>

              {/* Generate Button */}
              <div className="flex justify-center">
                <LoadingButton
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  loadingText="Generating Caption..."
                  disabled={!productImage && !description.trim()}
                  size="lg"
                  className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-12"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Caption
                </LoadingButton>
              </div>

              {/* Output Section */}
              {generatedCaptions.length > 0 && (
                <div className="space-y-4 animate-fade-in">
                  {generatedCaptions.map((caption, index) => (
                    <div key={index} className="space-y-3">
                      {generatedCaptions.length > 1 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gold uppercase tracking-wider">
                            Version {String.fromCharCode(65 + index)}
                          </span>
                        </div>
                      )}
                      <div className="relative p-5 rounded-xl bg-secondary/50 border border-gold/20">
                        <p className="text-cream whitespace-pre-wrap leading-relaxed pr-12">
                          {caption}
                        </p>
                        <button
                          onClick={() => handleCopyCaption(caption)}
                          className="absolute top-4 right-4 p-2 rounded-lg bg-gold/10 hover:bg-gold/20 transition-colors group"
                          title="Copy caption"
                        >
                          <Copy className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <Button
                      onClick={handleGenerate}
                      variant="outline"
                      disabled={isGenerating}
                      className="border-gold/30 text-cream hover:bg-gold/10"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                      Regenerate
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="ghost"
                      className="text-cream/60 hover:text-cream hover:bg-secondary/50"
                    >
                      Start Over
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CaptionStudio;
