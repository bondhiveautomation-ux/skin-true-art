import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { fileToNormalizedDataUrl } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Download, 
  RefreshCw, 
  X, 
  ChevronDown,
  Loader2,
  Shield,
  Coins,
  FileArchive
} from "lucide-react";
import { toast } from "sonner";

type LogoPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type LogoStyle = "clean" | "watermark" | "badge";
type CTAPreset = "none" | "order-now" | "inbox-now" | "limited-stock" | "new-arrival" | "free-delivery" | "custom";

interface BrandingSettings {
  position: LogoPosition;
  transparency: number;
  logoSize: number;
  safeMargin: boolean;
  logoStyle: LogoStyle;
  brandBorder: boolean;
  ctaPreset: CTAPreset;
  ctaCustomText: string;
  repeatWatermark: boolean;
  socialHandle: string;
}

interface BatchImage {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "processing" | "done" | "error";
  result?: string;
}

const DEFAULT_SETTINGS: BrandingSettings = {
  position: "bottom-right",
  transparency: 70,
  logoSize: 12,
  safeMargin: true,
  logoStyle: "clean",
  brandBorder: false,
  ctaPreset: "none",
  ctaCustomText: "",
  repeatWatermark: false,
  socialHandle: ""
};

const POSITION_OPTIONS: { value: LogoPosition; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" }
];

const STYLE_OPTIONS: { value: LogoStyle; label: string; description: string }[] = [
  { value: "clean", label: "Clean Overlay", description: "Direct logo placement" },
  { value: "watermark", label: "Soft Watermark", description: "Subtle, semi-transparent" },
  { value: "badge", label: "Badge Style", description: "With background for contrast" }
];

const CTA_PRESETS: { value: CTAPreset; label: string }[] = [
  { value: "none", label: "No CTA" },
  { value: "order-now", label: "Order Now" },
  { value: "inbox-now", label: "Inbox Now" },
  { value: "limited-stock", label: "Limited Stock" },
  { value: "new-arrival", label: "New Arrival" },
  { value: "free-delivery", label: "Free Delivery" },
  { value: "custom", label: "Custom Text" }
];

const BrandingStudio = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { credits, deductCredit, hasCredits } = useCredits();
  
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [settings, setSettings] = useState<BrandingSettings>(DEFAULT_SETTINGS);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  
  // Single mode state
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postFile, setPostFile] = useState<File | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Batch mode state
  const [batchImages, setBatchImages] = useState<BatchImage[]>([]);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  const handlePostUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setPostFile(file);
      const normalized = await fileToNormalizedDataUrl(file);
      setPostImage(normalized);
      setResult(null);
    } catch (err) {
      console.error("Failed to read image:", err);
      toast.error("Failed to load image. Please try a different file.");
    } finally {
      // allow re-selecting same file
      e.target.value = "";
    }
  }, []);

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLogoFile(file);
      const normalized = await fileToNormalizedDataUrl(file);
      setLogoImage(normalized);
    } catch (err) {
      console.error("Failed to read logo:", err);
      toast.error("Failed to load logo. Please try a different file.");
    } finally {
      e.target.value = "";
    }
  }, []);

  const handleBatchUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + batchImages.length > 20) {
      toast.error("Maximum 20 images allowed");
      return;
    }
    if (files.length + batchImages.length < 10 && files.length > 0) {
      toast.info("Batch mode works best with 10-20 images");
    }
    
    const newImages: BatchImage[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: "pending"
    }));
    
    setBatchImages(prev => [...prev, ...newImages]);
  }, [batchImages.length]);

  const removeBatchImage = (id: string) => {
    setBatchImages(prev => prev.filter(img => img.id !== id));
  };

  const fileToBase64 = async (file: File): Promise<string> => {
    // Normalize orientation (apply EXIF to pixels, then strip metadata)
    return await fileToNormalizedDataUrl(file);
  };

  const handleSingleProcess = async () => {
    if (!user) {
      toast.error("Please sign in to use this tool");
      navigate("/auth");
      return;
    }
    if (!postImage || !logoImage) {
      toast.error("Please upload both a post image and logo");
      return;
    }
    if (!hasCredits) {
      toast.error("Insufficient credits");
      return;
    }

    setProcessing(true);
    try {
      const success = await deductCredit();
      if (!success) {
        toast.error("Failed to deduct credit");
        return;
      }

      const { data, error } = await supabase.functions.invoke("apply-branding", {
        body: {
          postImage,
          logoImage,
          settings,
          userId: user.id
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data.resultImage);
      toast.success("Branding applied successfully!");
      
      // Log generation (store only URLs; never store base64)
      const onlyUrl = (v?: string | null) => (typeof v === "string" && v.startsWith("http") ? v : null);
      const inUrl = onlyUrl(postImage);
      const outUrl = onlyUrl(data?.resultImage);

      await supabase.rpc("log_generation", {
        p_user_id: user.id,
        p_feature_name: "Branding Studio",
        p_input_images: inUrl ? [inUrl] : [],
        p_output_images: outUrl ? [outUrl] : [],
      });
    } catch (error) {
      console.error("Branding error:", error);
      toast.error("Failed to apply branding. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchProcess = async () => {
    if (!user) {
      toast.error("Please sign in to use this tool");
      navigate("/auth");
      return;
    }
    if (!logoImage) {
      toast.error("Please upload a logo");
      return;
    }
    if (batchImages.length < 1) {
      toast.error("Please upload at least one image");
      return;
    }
    if (credits !== null && credits < batchImages.length) {
      toast.error(`Insufficient credits. Need ${batchImages.length}, have ${credits}`);
      return;
    }

    setBatchProcessing(true);
    setBatchProgress({ current: 0, total: batchImages.length });

    const results: BatchImage[] = [...batchImages];

    for (let i = 0; i < batchImages.length; i++) {
      const img = batchImages[i];
      setBatchProgress({ current: i + 1, total: batchImages.length });
      
      results[i] = { ...results[i], status: "processing" };
      setBatchImages([...results]);

      try {
        const success = await deductCredit();
        if (!success) {
          results[i] = { ...results[i], status: "error" };
          continue;
        }

        const postBase64 = await fileToBase64(img.file);
        
        const { data, error } = await supabase.functions.invoke("apply-branding", {
          body: {
            postImage: postBase64,
            logoImage,
            settings,
            userId: user.id
          }
        });

        if (error || data?.error) {
          results[i] = { ...results[i], status: "error" };
        } else {
          results[i] = { ...results[i], status: "done", result: data.resultImage };
        }
      } catch {
        results[i] = { ...results[i], status: "error" };
      }
      
      setBatchImages([...results]);
    }

    setBatchProcessing(false);
    toast.success(`Processed ${results.filter(r => r.status === "done").length} images`);
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
  };

  const downloadAllAsZip = async () => {
    const completedImages = batchImages.filter(img => img.status === "done" && img.result);
    if (completedImages.length === 0) return;

    // For simplicity, download individually (ZIP would require JSZip library)
    toast.info("Downloading images individually...");
    completedImages.forEach((img, idx) => {
      setTimeout(() => {
        if (img.result) {
          downloadImage(img.result, `branded-${idx + 1}.png`);
        }
      }, idx * 500);
    });
  };

  const updateSetting = <K extends keyof BrandingSettings>(key: K, value: BrandingSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gold/10 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-cream/60 hover:text-gold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gold" />
            <span className="font-serif text-xl text-cream">Branding Studio</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/30">
            <Coins className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-gold">{credits ?? 0}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Mode Selector */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "batch")} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="single" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Single Image
            </TabsTrigger>
            <TabsTrigger value="batch" className="gap-2">
              <FileArchive className="w-4 h-4" />
              Batch Images (10-20)
            </TabsTrigger>
          </TabsList>

          {/* Single Mode */}
          <TabsContent value="single" className="mt-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Uploads & Controls */}
              <div className="space-y-6">
                {/* Post Image Upload */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-cream font-serif text-lg">Upload Post Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!postImage ? (
                      <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gold/30 rounded-xl cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-all">
                        <Upload className="w-10 h-10 text-gold/50 mb-3" />
                        <span className="text-cream/60 text-sm">Drag & drop or click to upload</span>
                        <input type="file" accept="image/*" onChange={handlePostUpload} className="hidden" />
                      </label>
                    ) : (
                      <div className="relative">
                        <img src={postImage} alt="Post" className="w-full rounded-xl" />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => { setPostImage(null); setPostFile(null); setResult(null); }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <span className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 rounded text-xs text-cream/70">Original</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Logo Upload */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-cream font-serif text-lg">Upload Logo</CardTitle>
                    <CardDescription>Your logo will be applied without any design changes.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!logoImage ? (
                      <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gold/30 rounded-xl cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-all">
                        <Upload className="w-8 h-8 text-gold/50 mb-2" />
                        <span className="text-cream/60 text-sm">PNG/JPG recommended</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    ) : (
                      <div className="relative flex items-center gap-4">
                        <img src={logoImage} alt="Logo" className="h-20 object-contain rounded-lg bg-muted p-2" />
                        <Button variant="outline" size="sm" onClick={() => { setLogoImage(null); setLogoFile(null); }}>
                          Change Logo
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Placement Controls */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-cream font-serif text-lg">Logo Placement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Position */}
                    <div className="space-y-3">
                      <Label className="text-cream/70">Position</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {POSITION_OPTIONS.map(opt => (
                          <Button
                            key={opt.value}
                            variant={settings.position === opt.value ? "gold" : "outline"}
                            size="sm"
                            onClick={() => updateSetting("position", opt.value)}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Transparency */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label className="text-cream/70">Transparency</Label>
                        <span className="text-sm text-gold">{settings.transparency}%</span>
                      </div>
                      <Slider
                        value={[settings.transparency]}
                        onValueChange={([v]) => updateSetting("transparency", v)}
                        min={10}
                        max={100}
                        step={5}
                      />
                    </div>

                    {/* Logo Size */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label className="text-cream/70">Logo Size</Label>
                        <span className="text-sm text-gold">{settings.logoSize}%</span>
                      </div>
                      <Slider
                        value={[settings.logoSize]}
                        onValueChange={([v]) => updateSetting("logoSize", v)}
                        min={5}
                        max={30}
                        step={1}
                      />
                    </div>

                    {/* Safe Margin */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-cream/70">Safe Margin</Label>
                        <p className="text-xs text-cream/40">Logo won't touch edges</p>
                      </div>
                      <Switch
                        checked={settings.safeMargin}
                        onCheckedChange={(v) => updateSetting("safeMargin", v)}
                      />
                    </div>

                    {/* Logo Style */}
                    <div className="space-y-3">
                      <Label className="text-cream/70">Logo Style</Label>
                      <div className="grid gap-2">
                        {STYLE_OPTIONS.map(opt => (
                          <Button
                            key={opt.value}
                            variant={settings.logoStyle === opt.value ? "gold" : "outline"}
                            className="justify-start h-auto py-3"
                            onClick={() => updateSetting("logoStyle", opt.value)}
                          >
                            <div className="text-left">
                              <div className="font-medium">{opt.label}</div>
                              <div className="text-xs opacity-60">{opt.description}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced Branding */}
                <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gold/5 transition-colors pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-cream font-serif text-lg">Advanced Branding</CardTitle>
                          <ChevronDown className={`w-5 h-5 text-cream/50 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-6 pt-0">
                        {/* Brand Border */}
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-cream/70">Brand Border</Label>
                            <p className="text-xs text-cream/40">Premium border around image</p>
                          </div>
                          <Switch
                            checked={settings.brandBorder}
                            onCheckedChange={(v) => updateSetting("brandBorder", v)}
                          />
                        </div>

                        {/* CTA Sticker */}
                        <div className="space-y-3">
                          <Label className="text-cream/70">CTA Sticker</Label>
                          <Select value={settings.ctaPreset} onValueChange={(v: CTAPreset) => updateSetting("ctaPreset", v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CTA_PRESETS.map(p => (
                                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {settings.ctaPreset === "custom" && (
                            <Input
                              placeholder="Enter custom CTA text..."
                              value={settings.ctaCustomText}
                              onChange={(e) => updateSetting("ctaCustomText", e.target.value)}
                            />
                          )}
                        </div>

                        {/* Repeat Watermark */}
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-cream/70">Repeat Watermark Pattern</Label>
                            <p className="text-xs text-cream/40">Diagonal logo pattern to prevent theft</p>
                          </div>
                          <Switch
                            checked={settings.repeatWatermark}
                            onCheckedChange={(v) => updateSetting("repeatWatermark", v)}
                          />
                        </div>

                        {/* Social Handle Strip */}
                        <div className="space-y-3">
                          <Label className="text-cream/70">Social Handle Strip</Label>
                          <Input
                            placeholder="@yourpage or Facebook page name"
                            value={settings.socialHandle}
                            onChange={(e) => updateSetting("socialHandle", e.target.value)}
                          />
                          <p className="text-xs text-cream/40">Displays at the bottom of the image</p>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Generate Button */}
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full btn-glow"
                  onClick={handleSingleProcess}
                  disabled={processing || !postImage || !logoImage}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Applying Branding...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Apply Branding
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-cream/40">Uses 1 credit</p>
              </div>

              {/* Right Column - Output */}
              <div className="space-y-6">
                <Card className="min-h-[400px]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-cream font-serif text-lg">Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <img src={result} alt="Branded" className="w-full rounded-xl" />
                          <span className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 rounded text-xs text-cream/70">Branded</span>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="gold" className="flex-1" onClick={() => downloadImage(result, "branded-image.png")}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" onClick={handleSingleProcess} disabled={processing}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-cream/40">
                        <ImageIcon className="w-16 h-16 mb-4 opacity-30" />
                        <p>Your branded image will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Batch Mode */}
          <TabsContent value="batch" className="mt-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Batch Upload */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-cream font-serif text-lg">Upload Images</CardTitle>
                      <span className="text-sm text-gold">{batchImages.length}/20</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gold/30 rounded-xl cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-all">
                      <Upload className="w-8 h-8 text-gold/50 mb-2" />
                      <span className="text-cream/60 text-sm">Add 10-20 images</span>
                      <input type="file" accept="image/*" multiple onChange={handleBatchUpload} className="hidden" />
                    </label>
                    
                    {batchImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                        {batchImages.map(img => (
                          <div key={img.id} className="relative group">
                            <img src={img.preview} alt="" className="w-full aspect-square object-cover rounded-lg" />
                            {img.status === "processing" && (
                              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                                <Loader2 className="w-5 h-5 animate-spin text-gold" />
                              </div>
                            )}
                            {img.status === "done" && (
                              <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center rounded-lg">
                                <span className="text-emerald-400 text-xs">✓</span>
                              </div>
                            )}
                            {img.status === "error" && (
                              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center rounded-lg">
                                <span className="text-red-400 text-xs">✗</span>
                              </div>
                            )}
                            <button
                              onClick={() => removeBatchImage(img.id)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Logo Upload (Batch) */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-cream font-serif text-lg">Upload Logo (Applied to All)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!logoImage ? (
                      <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gold/30 rounded-xl cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-all">
                        <Upload className="w-6 h-6 text-gold/50 mb-1" />
                        <span className="text-cream/60 text-xs">Upload logo</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    ) : (
                      <div className="flex items-center gap-4">
                        <img src={logoImage} alt="Logo" className="h-16 object-contain rounded-lg bg-muted p-2" />
                        <Button variant="outline" size="sm" onClick={() => { setLogoImage(null); setLogoFile(null); }}>
                          Change
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Batch Controls (same as single) */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-cream font-serif text-lg">Batch Settings</CardTitle>
                    <CardDescription>Applied to all images</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {POSITION_OPTIONS.map(opt => (
                        <Button
                          key={opt.value}
                          variant={settings.position === opt.value ? "gold" : "outline"}
                          size="sm"
                          onClick={() => updateSetting("position", opt.value)}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-cream/70">Transparency</span>
                        <span className="text-gold">{settings.transparency}%</span>
                      </div>
                      <Slider value={[settings.transparency]} onValueChange={([v]) => updateSetting("transparency", v)} min={10} max={100} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-cream/70">Logo Size</span>
                        <span className="text-gold">{settings.logoSize}%</span>
                      </div>
                      <Slider value={[settings.logoSize]} onValueChange={([v]) => updateSetting("logoSize", v)} min={5} max={30} />
                    </div>
                  </CardContent>
                </Card>

                {/* Batch Process Button */}
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full btn-glow"
                  onClick={handleBatchProcess}
                  disabled={batchProcessing || !logoImage || batchImages.length < 1}
                >
                  {batchProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing {batchProgress.current} of {batchProgress.total}...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Apply Branding to All
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-cream/40">Uses {batchImages.length} credit{batchImages.length !== 1 ? "s" : ""}</p>
              </div>

              {/* Right Column - Batch Results */}
              <div className="space-y-6">
                <Card className="min-h-[400px]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-cream font-serif text-lg">Results</CardTitle>
                      {batchImages.some(img => img.status === "done") && (
                        <Button variant="gold" size="sm" onClick={downloadAllAsZip}>
                          <Download className="w-4 h-4 mr-2" />
                          Download All
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {batchImages.some(img => img.result) ? (
                      <div className="grid grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
                        {batchImages.filter(img => img.result).map((img, idx) => (
                          <div key={img.id} className="relative group">
                            <img src={img.result!} alt="" className="w-full aspect-square object-cover rounded-lg" />
                            <button
                              onClick={() => downloadImage(img.result!, `branded-${idx + 1}.png`)}
                              className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                            >
                              <Download className="w-6 h-6 text-gold" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-cream/40">
                        <FileArchive className="w-16 h-16 mb-4 opacity-30" />
                        <p>Batch results will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BrandingStudio;
