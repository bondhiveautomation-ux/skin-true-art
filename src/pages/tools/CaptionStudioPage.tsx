import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Copy, RefreshCw, Diamond, Languages, Smile, AlignLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { getGemCost } from "@/lib/gemCosts";
import { getToolById } from "@/config/tools";

type Language = "bangla" | "english";
type CaptionLength = "short" | "medium" | "long";
type ToneStyle = "bold_salesy" | "elegant_premium" | "friendly_casual" | "minimal_clean";

const CaptionStudioPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { deductGems, hasEnoughGems } = useGems();
  const { toast } = useToast();
  const tool = getToolById("caption-studio")!;

  const [productImage, setProductImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<Language>("english");
  const [withEmojis, setWithEmojis] = useState(true);
  const [captionLength, setCaptionLength] = useState<CaptionLength>("medium");
  const [toneStyle, setToneStyle] = useState<ToneStyle>("bold_salesy");
  const [generateVariations, setGenerateVariations] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);

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
    const reader = new FileReader();
    reader.onload = (e) => {
      setProductImage(e.target?.result as string);
      setGeneratedCaptions([]);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!productImage && !description.trim()) {
      toast({ title: "Missing input", description: "Please upload a product image or add a description", variant: "destructive" });
      return;
    }
    if (!hasEnoughGems("generate-caption")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("generate-caption")} gem for this feature`, variant: "destructive" });
      return;
    }

    const result = await deductGems("generate-caption");
    if (!result.success) {
      toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGeneratedCaptions([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-caption", {
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
        toast({ title: "Generation failed", description: data.error, variant: "destructive" });
        return;
      }

      if (data?.captions) {
        setGeneratedCaptions(data.captions);
        toast({ title: "Caption generated!", description: generateVariations ? "2 variations created" : "Your caption is ready" });
      }
    } catch (error: any) {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCaption = (caption: string) => {
    navigator.clipboard.writeText(caption);
    toast({ title: "Copied!", description: "Caption copied to clipboard" });
  };

  const handleReset = () => {
    setProductImage(null);
    setDescription("");
    setGeneratedCaptions([]);
  };

  const lengthOptions = [
    { value: "short", label: "Short", desc: "1-2 lines" },
    { value: "medium", label: "Medium", desc: "Bullets" },
    { value: "long", label: "Long", desc: "Detailed" },
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
        {/* Upload Section */}
        <div className="max-w-md mx-auto">
          <ImageUploader
            id="product-image"
            image={productImage}
            onUpload={handleImageUpload}
            onRemove={() => { setProductImage(null); setGeneratedCaptions([]); }}
            label="Upload Product Image"
            description="Drag & drop or click to upload"
          />
        </div>

        {/* Description Box */}
        <div className="max-w-xl mx-auto space-y-3">
          <label className="block text-sm font-medium text-cream">Product Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the product, price, offer, delivery area, brand tone, and any key details…"
            className="min-h-[100px] bg-secondary/30 border-border/50 text-cream placeholder:text-cream/40 resize-none"
          />
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Language Selector */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-gold" />
              <label className="text-sm font-medium text-cream">Language</label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage("bangla")}
                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  language === "bangla"
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-gold/15 bg-charcoal-light text-cream/70 hover:border-gold/30"
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLanguage("english")}
                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  language === "english"
                    ? "border-gold/50 bg-gold/10 text-gold"
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
                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  withEmojis
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-gold/15 bg-charcoal-light text-cream/70 hover:border-gold/30"
                }`}
              >
                With Emojis 😊
              </button>
              <button
                onClick={() => setWithEmojis(false)}
                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  !withEmojis
                    ? "border-gold/50 bg-gold/10 text-gold"
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
                  className={`flex-1 py-3 px-2 rounded-xl border text-center transition-all ${
                    captionLength === option.value
                      ? "border-gold/50 bg-gold/10"
                      : "border-gold/15 bg-charcoal-light hover:border-gold/30"
                  }`}
                >
                  <span className={`block text-sm font-medium ${captionLength === option.value ? "text-gold" : "text-cream/70"}`}>
                    {option.label}
                  </span>
                  <span className="block text-[10px] text-cream/40">{option.desc}</span>
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
                <SelectItem value="bold_salesy" className="text-cream hover:bg-gold/10">Bold & Salesy</SelectItem>
                <SelectItem value="elegant_premium" className="text-cream hover:bg-gold/10">Elegant & Premium</SelectItem>
                <SelectItem value="friendly_casual" className="text-cream hover:bg-gold/10">Friendly & Casual</SelectItem>
                <SelectItem value="minimal_clean" className="text-cream hover:bg-gold/10">Minimal & Clean</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Generate Variations Toggle */}
        <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-secondary/20 border border-gold/10 max-w-md mx-auto">
          <Switch
            id="variations"
            checked={generateVariations}
            onCheckedChange={setGenerateVariations}
            className="data-[state=checked]:bg-gold"
          />
          <Label htmlFor="variations" className="text-sm text-cream/70 cursor-pointer">
            Generate 2 Variations (Version A + B)
          </Label>
        </div>

        {/* Generate Button */}
        {generatedCaptions.length === 0 && (
          <div className="flex flex-col items-center gap-2">
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
            <div className="flex items-center gap-1.5 text-cream/50 text-xs">
              <Diamond className="w-3.5 h-3.5 text-purple-400" />
              <span>Costs {getGemCost("generate-caption")} gem</span>
            </div>
          </div>
        )}

        {/* Output Section */}
        {generatedCaptions.length > 0 && (
          <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
            {generatedCaptions.map((caption, index) => (
              <div key={index} className="space-y-3">
                {generatedCaptions.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gold uppercase tracking-wider">
                      Version {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                )}
                <div className="p-6 rounded-xl bg-secondary/30 border border-gold/15">
                  <p className="text-cream whitespace-pre-wrap leading-relaxed">{caption}</p>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleCopyCaption(caption)} className="gap-2">
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button onClick={handleGenerate} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </Button>
              <Button onClick={handleReset} variant="ghost">
                Start Over
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
};

export default CaptionStudioPage;
