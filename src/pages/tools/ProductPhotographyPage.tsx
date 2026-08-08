import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Download, X, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getToolById } from "@/config/tools";
import { logGeneration } from "@/lib/logGeneration";
import { fileToNormalizedDataUrl } from "@/lib/image";

const MAX_IMAGES = 10;

const ProductPhotographyPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const tool = getToolById("product-photography")!;

  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/auth");
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      toast({ title: "Limit reached", description: `Maximum ${MAX_IMAGES} product images`, variant: "destructive" });
      return;
    }

    const accepted = files.filter((f) => f.type.startsWith("image/")).slice(0, room);
    try {
      const dataUrls = await Promise.all(accepted.map(fileToNormalizedDataUrl));
      setImages((prev) => [...prev, ...dataUrls]);
    } catch {
      toast({ title: "Upload failed", description: "Could not read one of the images", variant: "destructive" });
    }
  };

  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  const handleGenerate = async () => {
    if (images.length === 0) {
      toast({ title: "No product images", description: "Upload 1–10 photos of your product", variant: "destructive" });
      return;
    }
    if (!prompt.trim()) {
      toast({ title: "Missing prompt", description: "Describe the photoshoot you want", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setResults([]);
    try {
      const { data, error } = await supabase.functions.invoke("product-photography", {
        body: { images, description, prompt, userId: user?.id },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Generation failed", description: data.error, variant: "destructive" });
        return;
      }
      const generated: string[] = data?.results || [];
      if (!generated.length) {
        toast({ title: "Generation failed", description: "No images were generated", variant: "destructive" });
        return;
      }
      setResults(generated);
      toast({ title: "Photoshoot ready!", description: `${generated.length} product images generated` });
      await logGeneration("product-photography", images, generated, user?.id);
    } catch (err: any) {
      toast({ title: "Generation failed", description: err?.message || "Please try again", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `product-photo-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast({ title: "Download failed", description: "Please try again", variant: "destructive" });
    }
  };

  return (
    <ToolPageLayout
      toolId={tool.id}
      toolName={tool.name}
      toolDescription={tool.description}
      gemCostKey={tool.gemCostKey}
      icon={tool.icon}
      badge={tool.badge}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Uploads */}
        <div className="space-y-3">
          <Label className="text-cream">Product Images ({images.length}/{MAX_IMAGES})</Label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gold/20 bg-charcoal-light">
                <img src={img} alt={`Product reference ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  aria-label="Remove image"
                  className="absolute top-1 right-1 w-8 h-8 rounded-full bg-background/80 border border-gold/30 flex items-center justify-center text-cream"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <label className="aspect-square rounded-lg border border-dashed border-gold/30 bg-charcoal-light/50 flex flex-col items-center justify-center gap-2 cursor-pointer text-cream/60 hover:border-gold/60 transition-colors">
                <Upload className="w-6 h-6" />
                <span className="text-xs">Add</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
              </label>
            )}
          </div>
          <p className="text-xs text-cream/50">পণ্যের ১ থেকে ১০টি ছবি আপলোড করুন — যত বেশি অ্যাঙ্গেল, তত নিখুঁত রেজাল্ট।</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-cream">Product Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Material, colour, size, key features, brand details..."
            className="min-h-[100px] bg-charcoal-light border-gold/20 text-cream"
          />
        </div>

        {/* Prompt */}
        <div className="space-y-2">
          <Label className="text-cream">Photography Prompt</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Luxury marble surface, soft window light, minimal beige studio, premium e-commerce look..."
            className="min-h-[120px] bg-charcoal-light border-gold/20 text-cream"
          />
        </div>

        <LoadingButton
          onClick={handleGenerate}
          isLoading={isProcessing}
          loadingText="Generating 5 images..."
          className="w-full h-12"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate 5 Product Photos
        </LoadingButton>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-serif text-cream">Your Product Photoshoot</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((url, i) => (
                <div key={i} className="space-y-2">
                  <div className="rounded-lg overflow-hidden border border-gold/20 bg-charcoal-light">
                    <img src={url} alt={`Generated product photo ${i + 1}`} className="w-full h-auto" loading="lazy" />
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => handleDownload(url, i)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
};

export default ProductPhotographyPage;
