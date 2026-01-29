import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Download, RefreshCw, Diamond, Upload, X, FileArchive, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { getGemCost } from "@/lib/gemCosts";
import { getToolById } from "@/config/tools";
import { fileToNormalizedDataUrl } from "@/lib/image";

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

const STYLE_OPTIONS: { value: LogoStyle; label: string }[] = [
  { value: "clean", label: "Clean Overlay" },
  { value: "watermark", label: "Soft Watermark" },
  { value: "badge", label: "Badge Style" }
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

const BrandingStudioPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { gems, deductGems, refundGems, hasEnoughGems } = useGems();
  const tool = getToolById("branding-studio")!;

  const [mode, setMode] = useState<"single" | "batch">("single");
  const [settings, setSettings] = useState<BrandingSettings>(DEFAULT_SETTINGS);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Single mode state
  const [postImage, setPostImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Batch mode state
  const [batchImages, setBatchImages] = useState<BatchImage[]>([]);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

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

  const handlePostUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const normalized = await fileToNormalizedDataUrl(file);
      setPostImage(normalized);
      setResult(null);
    } catch (err) {
      toast.error("Failed to load image");
    }
    e.target.value = "";
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const normalized = await fileToNormalizedDataUrl(file);
      setLogoImage(normalized);
    } catch (err) {
      toast.error("Failed to load logo");
    }
    e.target.value = "";
  };

  const handleBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + batchImages.length > 20) {
      toast.error("Maximum 20 images allowed");
      return;
    }
    const newImages: BatchImage[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: "pending"
    }));
    setBatchImages(prev => [...prev, ...newImages]);
  };

  const removeBatchImage = (id: string) => {
    setBatchImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSingleProcess = async () => {
    if (!postImage || !logoImage) {
      toast.error("Please upload both images");
      return;
    }
    if (!hasEnoughGems("apply-branding")) {
      toast.error(`Need ${getGemCost("apply-branding")} gems`);
      return;
    }

    setProcessing(true);
    
    // Deduct gems immediately
    const gemResult = await deductGems("apply-branding");
    if (!gemResult.success) {
      setProcessing(false);
      toast.error("Insufficient gems");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("apply-branding", {
        body: { postImage, logoImage, settings, userId: user?.id }
      });

      if (error) throw error;
      if (data?.error) {
        await refundGems("apply-branding");
        throw new Error(data.error);
      }

      if (data?.resultImage) {
        setResult(data.resultImage);
        toast.success("Branding applied!");
      } else {
        await refundGems("apply-branding");
        toast.error("No result received");
      }
    } catch (error) {
      await refundGems("apply-branding");
      toast.error("Failed to apply branding");
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchProcess = async () => {
    if (!logoImage || batchImages.length < 1) {
      toast.error("Please upload logo and images");
      return;
    }
    const requiredGems = batchImages.length * getGemCost("apply-branding");
    if (gems !== null && gems < requiredGems) {
      toast.error(`Need ${requiredGems} gems, have ${gems}`);
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

      // Deduct gems first for each image
      const gemResult = await deductGems("apply-branding");
      if (!gemResult.success) {
        results[i] = { ...results[i], status: "error" };
        setBatchImages([...results]);
        continue;
      }

      try {
        const postBase64 = await fileToNormalizedDataUrl(img.file);
        const { data, error } = await supabase.functions.invoke("apply-branding", {
          body: { postImage: postBase64, logoImage, settings, userId: user?.id }
        });

        if (error || data?.error) {
          await refundGems("apply-branding");
          results[i] = { ...results[i], status: "error" };
        } else if (data?.resultImage) {
          results[i] = { ...results[i], status: "done", result: data.resultImage };
        } else {
          await refundGems("apply-branding");
          results[i] = { ...results[i], status: "error" };
        }
      } catch {
        await refundGems("apply-branding");
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

  const updateSetting = <K extends keyof BrandingSettings>(key: K, value: BrandingSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setPostImage(null);
    setResult(null);
  };

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
        {/* Mode Selector */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "batch")} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="single" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Single Image
            </TabsTrigger>
            <TabsTrigger value="batch" className="gap-2">
              <FileArchive className="w-4 h-4" />
              Batch (10-20)
            </TabsTrigger>
          </TabsList>

          {/* Single Mode */}
          <TabsContent value="single" className="mt-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Post Image Upload */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-cream font-serif text-lg">Post Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!postImage ? (
                      <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gold/30 rounded-xl cursor-pointer hover:border-gold/50 transition-all">
                        <Upload className="w-10 h-10 text-gold/50 mb-3" />
                        <span className="text-cream/60 text-sm">Click to upload</span>
                        <input type="file" accept="image/*" onChange={handlePostUpload} className="hidden" />
                      </label>
                    ) : (
                      <div className="relative">
                        <img src={postImage} alt="Post" className="w-full rounded-xl" />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={handleReset}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Logo Upload */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-cream font-serif text-lg">Logo</CardTitle>
                    <CardDescription>Your logo will be applied as-is</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!logoImage ? (
                      <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gold/30 rounded-xl cursor-pointer hover:border-gold/50 transition-all">
                        <Upload className="w-8 h-8 text-gold/50 mb-2" />
                        <span className="text-cream/60 text-sm">PNG/JPG</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    ) : (
                      <div className="flex items-center gap-4">
                        <img src={logoImage} alt="Logo" className="h-20 object-contain rounded-lg bg-muted p-2" />
                        <Button variant="outline" size="sm" onClick={() => setLogoImage(null)}>
                          Change
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Placement Controls */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-cream font-serif text-lg">Placement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Position */}
                    <div className="space-y-3">
                      <Label className="text-cream/70">Position</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {POSITION_OPTIONS.map(opt => (
                          <Button
                            key={opt.value}
                            variant={settings.position === opt.value ? "default" : "outline"}
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

                    {/* Style */}
                    <div className="space-y-3">
                      <Label className="text-cream/70">Style</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {STYLE_OPTIONS.map(opt => (
                          <Button
                            key={opt.value}
                            variant={settings.logoStyle === opt.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateSetting("logoStyle", opt.value)}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Advanced */}
                    <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-cream/60 hover:text-gold">
                        <ChevronDown className={`w-4 h-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
                        Advanced Options
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-cream/70">Safe Margin</Label>
                          <Switch
                            checked={settings.safeMargin}
                            onCheckedChange={(v) => updateSetting("safeMargin", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-cream/70">Brand Border</Label>
                          <Switch
                            checked={settings.brandBorder}
                            onCheckedChange={(v) => updateSetting("brandBorder", v)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-cream/70">CTA Preset</Label>
                          <Select value={settings.ctaPreset} onValueChange={(v) => updateSetting("ctaPreset", v as CTAPreset)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CTA_PRESETS.map(p => (
                                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {settings.ctaPreset === "custom" && (
                          <Input
                            placeholder="Custom CTA text..."
                            value={settings.ctaCustomText}
                            onChange={(e) => updateSetting("ctaCustomText", e.target.value)}
                          />
                        )}
                        <Input
                          placeholder="@yourbrand (optional)"
                          value={settings.socialHandle}
                          onChange={(e) => updateSetting("socialHandle", e.target.value)}
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>

                {/* Process Button */}
                <div className="flex flex-col items-center gap-2">
                  <Button
                    onClick={handleSingleProcess}
                    disabled={!postImage || !logoImage || processing}
                    size="lg"
                    className="w-full btn-glow"
                  >
                    {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Apply Branding
                  </Button>
                  <div className="flex items-center gap-1.5 text-cream/50 text-xs">
                    <Diamond className="w-3.5 h-3.5 text-purple-400" />
                    <span>Costs {getGemCost("apply-branding")} gems</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Result */}
              <div>
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-cream font-serif text-lg">Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result ? (
                      <div className="space-y-4">
                        <img src={result} alt="Result" className="w-full rounded-xl" />
                        <div className="flex gap-2">
                          <Button onClick={() => downloadImage(result, "branded.png")} className="flex-1 gap-2">
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                          <Button onClick={handleSingleProcess} variant="outline" className="gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Redo
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-cream/40">
                        Result will appear here
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Batch Mode */}
          <TabsContent value="batch" className="mt-8">
            <div className="space-y-6">
              {/* Logo Upload for Batch */}
              {!logoImage && (
                <Card className="max-w-md mx-auto">
                  <CardContent className="pt-6">
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gold/30 rounded-xl cursor-pointer hover:border-gold/50 transition-all">
                      <Upload className="w-8 h-8 text-gold/50 mb-2" />
                      <span className="text-cream/60 text-sm">Upload Logo First</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </CardContent>
                </Card>
              )}

              {logoImage && (
                <>
                  {/* Batch Upload */}
                  <div className="flex items-center justify-center gap-4">
                    <img src={logoImage} alt="Logo" className="h-12 object-contain rounded bg-muted p-1" />
                    <label className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Add Images ({batchImages.length}/20)
                        </span>
                      </Button>
                      <input type="file" accept="image/*" multiple onChange={handleBatchUpload} className="hidden" />
                    </label>
                  </div>

                  {/* Batch Grid */}
                  {batchImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {batchImages.map((img) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.result || img.preview}
                            alt=""
                            className={`w-full aspect-square object-cover rounded-lg ${img.status === "processing" ? "opacity-50" : ""}`}
                          />
                          {img.status === "processing" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Loader2 className="w-6 h-6 animate-spin text-gold" />
                            </div>
                          )}
                          {img.status === "done" && (
                            <Button
                              size="icon"
                              className="absolute bottom-2 right-2 h-8 w-8"
                              onClick={() => img.result && downloadImage(img.result, `branded-${img.id}.png`)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          {img.status === "pending" && (
                            <Button
                              size="icon"
                              variant="destructive"
                              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeBatchImage(img.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                          {img.status === "error" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-destructive/50 rounded-lg">
                              <span className="text-xs text-white">Error</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Batch Process */}
                  {batchImages.length > 0 && (
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        onClick={handleBatchProcess}
                        disabled={batchProcessing}
                        size="lg"
                        className="btn-glow"
                      >
                        {batchProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing {batchProgress.current}/{batchProgress.total}
                          </>
                        ) : (
                          `Process ${batchImages.length} Images`
                        )}
                      </Button>
                      <div className="flex items-center gap-1.5 text-cream/50 text-xs">
                        <Diamond className="w-3.5 h-3.5 text-purple-400" />
                        <span>Costs {batchImages.length * getGemCost("apply-branding")} gems total</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ToolPageLayout>
  );
};

export default BrandingStudioPage;
