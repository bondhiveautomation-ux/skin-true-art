import { useState } from "react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BilingualHeading } from "@/components/ui/BilingualHeading";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { ProcessingModal } from "@/components/gems/ProcessingModal";
import { LowBalanceAlert } from "@/components/gems/LowBalanceAlert";
import { MobileStickyFooter } from "@/components/ui/MobileStickyFooter";
import { useAuth } from "@/hooks/useAuth";
import { useGems } from "@/hooks/useGems";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getGemCost } from "@/lib/gemCosts";
import { Sparkles, Download, Check, Loader2, Crown, Palette, Type, Target, Globe } from "lucide-react";
import { logGeneration } from "@/lib/logGeneration";

const BRAND_PERSONALITIES = [
  { value: "authority", label: "Authority", bangla: "কর্তৃত্ব" },
  { value: "elegance", label: "Elegance", bangla: "কমনীয়তা" },
  { value: "mystery", label: "Mystery", bangla: "রহস্য" },
  { value: "innovation", label: "Innovation", bangla: "উদ্ভাবন" },
  { value: "power", label: "Power", bangla: "শক্তি" },
  { value: "minimal-luxury", label: "Minimal Luxury", bangla: "সূক্ষ্ম বিলাসিতা" },
];

const TYPOGRAPHY_DIRECTIONS = [
  { value: "luxury-serif", label: "Luxury Serif", bangla: "বিলাসবহুল সেরিফ" },
  { value: "refined-sans", label: "Refined Modern Sans-Serif", bangla: "পরিশীলিত স্যান্স-সেরিফ" },
  { value: "custom-letterform", label: "Custom Letterform Feel", bangla: "কাস্টম লেটারফর্ম" },
  { value: "high-contrast", label: "High-Contrast Editorial", bangla: "উচ্চ-কনট্রাস্ট সম্পাদকীয়" },
  { value: "minimal-corporate", label: "Minimal Corporate Premium", bangla: "মিনিমাল কর্পোরেট প্রিমিয়াম" },
];

const SYMBOL_MEANINGS = [
  { value: "status", label: "Status", bangla: "মর্যাদা" },
  { value: "precision", label: "Precision", bangla: "নির্ভুলতা" },
  { value: "intelligence", label: "Intelligence", bangla: "বুদ্ধিমত্তা" },
  { value: "calm-authority", label: "Calm Authority", bangla: "শান্ত কর্তৃত্ব" },
  { value: "exclusivity", label: "Exclusivity", bangla: "একচেটিয়াত্ব" },
  { value: "legacy", label: "Legacy", bangla: "উত্তরাধিকার" },
];

interface GeneratedLogo {
  url: string;
  label: string;
}

const LogoGeneratorPage = () => {
  const { user } = useAuth();
  const { gems, deductGems, refundGems, refetchGems } = useGems();
  const isMobile = useIsMobile();

  // Form state
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [brandPersonality, setBrandPersonality] = useState<string[]>([]);
  const [coreBrandFeeling, setCoreBrandFeeling] = useState("");
  const [backgroundUse, setBackgroundUse] = useState<"dark" | "light" | "both">("dark");
  const [colorPalette, setColorPalette] = useState("");
  const [symbolPreference, setSymbolPreference] = useState("abstract");
  const [typographyDirection, setTypographyDirection] = useState<string[]>([]);
  const [symbolMeaningFocus, setSymbolMeaningFocus] = useState<string[]>([]);
  const [culturalScope, setCulturalScope] = useState("global");
  const [lockupType, setLockupType] = useState("symbol-wordmark");
  const [complexityLevel, setComplexityLevel] = useState("balanced");
  const [numVariations, setNumVariations] = useState("2");
  const [backgroundMode, setBackgroundMode] = useState("dark");
  const [textStrictness, setTextStrictness] = useState("exact");
  const [tagline, setTagline] = useState("");

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogos, setGeneratedLogos] = useState<GeneratedLogo[]>([]);
  const [selectedLogo, setSelectedLogo] = useState<number | null>(null);
  const [showLowBalance, setShowLowBalance] = useState(false);

  const gemCost = getGemCost("generate-logo");
  const totalCost = gemCost; // Fixed 15 gems regardless of variations
  const currentBalance = gems ?? 0;

  const togglePersonality = (value: string) => {
    if (brandPersonality.includes(value)) {
      setBrandPersonality(brandPersonality.filter((p) => p !== value));
    } else if (brandPersonality.length < 2) {
      setBrandPersonality([...brandPersonality, value]);
    }
  };

  const toggleTypography = (value: string) => {
    if (typographyDirection.includes(value)) {
      setTypographyDirection(typographyDirection.filter((t) => t !== value));
    } else if (typographyDirection.length < 2) {
      setTypographyDirection([...typographyDirection, value]);
    }
  };

  const toggleSymbolMeaning = (value: string) => {
    if (symbolMeaningFocus.includes(value)) {
      setSymbolMeaningFocus(symbolMeaningFocus.filter((s) => s !== value));
    } else {
      setSymbolMeaningFocus([...symbolMeaningFocus, value]);
    }
  };

  const isFormValid = () => {
    return (
      brandName.trim() !== "" &&
      industry.trim() !== "" &&
      targetCustomer.trim() !== "" &&
      brandPersonality.length > 0 &&
      coreBrandFeeling.trim() !== "" &&
      colorPalette.trim() !== "" &&
      typographyDirection.length > 0
    );
  };

  const handleGenerate = async () => {
    if (!user) {
      toast({ title: "লগইন প্রয়োজন", description: "Please log in to generate logos", variant: "destructive" });
      return;
    }

    if (currentBalance < totalCost) {
      setShowLowBalance(true);
      return;
    }

    if (!isFormValid()) {
      toast({ title: "ফর্ম অসম্পূর্ণ", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGeneratedLogos([]);
    setSelectedLogo(null);

    // Deduct gems immediately
    const gemResult = await deductGems("generate-logo");
    if (!gemResult.success) {
      setIsGenerating(false);
      toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("generate-logo", {
        body: {
          brandName,
          industry,
          targetCustomer,
          brandPersonality,
          coreBrandFeeling,
          backgroundUse,
          colorPalette,
          symbolPreference,
          typographyDirection,
          symbolMeaningFocus,
          culturalScope,
          lockupType,
          complexityLevel,
          numVariations: parseInt(numVariations),
          backgroundMode,
          textStrictness,
          tagline: textStrictness === "with-tagline" ? tagline : undefined,
          userId: user.id,
        },
      });

      if (error) throw error;

      if (!data.success) {
        await refundGems("generate-logo");
        throw new Error(data.error || "Generation failed");
      }

      setGeneratedLogos(data.images);
      // Log generation
      await logGeneration(
        "generate-logo", 
        [], 
        data.images.map((img: GeneratedLogo) => img.url), 
        user?.id
      );

      toast({
        title: "লোগো তৈরি সম্পন্ন! ✨",
        description: `${data.images.length} luxury logo concepts generated`,
      });
    } catch (error: any) {
      await refundGems("generate-logo");
      console.error("Logo generation error:", error);
      toast({
        title: "জেনারেশন ব্যর্থ",
        description: error.message || "Failed to generate logos",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (logo: GeneratedLogo, index: number) => {
    try {
      const link = document.createElement("a");
      link.href = logo.url;
      link.download = `${brandName.replace(/\s+/g, "-")}-logo-${logo.label}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "ডাউনলোড শুরু হয়েছে", description: `${logo.label} downloading...` });
    } catch (error) {
      toast({ title: "ডাউনলোড ব্যর্থ", description: "Failed to download", variant: "destructive" });
    }
  };

  return (
    <ToolPageLayout
      toolId="logo-generator"
      toolName="Logo Studio"
      toolDescription="Create unique, luxurious, timeless logos for your brand with AI precision."
      gemCostKey="generate-logo"
      icon={Crown}
      badge="Brand AI"
    >
      <div className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Input Form */}
          <div className="space-y-6">
            {/* Brand Basics */}
            <Card className="border-gold/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Crown className="w-5 h-5 text-gold" />
                  <BilingualHeading english="Brand Basics" bangla="ব্র্যান্ডের মূল তথ্য" as="h3" className="text-lg" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-cream/80">
                    Brand Name (Exact) <span className="text-gold">*</span>
                    <span className="font-bangla text-cream/50 ml-2">ব্র্যান্ডের নাম</span>
                  </Label>
                  <Input
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Enter your brand name exactly as it should appear"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-cream/80">
                    Industry / What the brand does <span className="text-gold">*</span>
                    <span className="font-bangla text-cream/50 ml-2">শিল্প / ব্র্যান্ড কী করে</span>
                  </Label>
                  <Input
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Luxury Fashion, Premium Tech, High-end Services"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Target & Positioning */}
            <CollapsibleSection
              title="Target & Positioning"
              subtitle="টার্গেট এবং পজিশনিং"
              icon={<Target className="w-5 h-5 text-gold" />}
              defaultOpen={true}
            >
              <div className="space-y-4">
                <div>
                  <Label className="text-cream/80">
                    Target Customer Profile <span className="text-gold">*</span>
                    <span className="font-bangla text-cream/50 ml-2">টার্গেট গ্রাহক প্রোফাইল</span>
                  </Label>
                  <Textarea
                    value={targetCustomer}
                    onChange={(e) => setTargetCustomer(e.target.value)}
                    placeholder="Describe your ideal customer (age, lifestyle, values, aspirations)"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-cream/80 block mb-2">
                    Brand Personality (max 2) <span className="text-gold">*</span>
                    <span className="font-bangla text-cream/50 ml-2">ব্র্যান্ডের ব্যক্তিত্ব</span>
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {BRAND_PERSONALITIES.map((p) => (
                      <Button
                        key={p.value}
                        variant={brandPersonality.includes(p.value) ? "gold" : "dark-outline"}
                        size="sm"
                        onClick={() => togglePersonality(p.value)}
                        disabled={!brandPersonality.includes(p.value) && brandPersonality.length >= 2}
                        className="justify-start"
                      >
                        {brandPersonality.includes(p.value) && <Check className="w-3 h-3 mr-1" />}
                        <span>{p.label}</span>
                        <span className="font-bangla text-xs ml-1 opacity-60">{p.bangla}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-cream/80">
                    Core Brand Feeling <span className="text-gold">*</span>
                    <span className="font-bangla text-cream/50 ml-2">মূল ব্র্যান্ড অনুভূতি</span>
                  </Label>
                  <p className="text-xs text-cream/50 mb-1">How should someone feel within 1 second of seeing your logo?</p>
                  <Textarea
                    value={coreBrandFeeling}
                    onChange={(e) => setCoreBrandFeeling(e.target.value)}
                    placeholder="e.g., Instant trust and desire for premium quality"
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Visual Controls */}
            <CollapsibleSection
              title="Visual Controls"
              subtitle="ভিজ্যুয়াল কন্ট্রোল"
              icon={<Palette className="w-5 h-5 text-gold" />}
              defaultOpen={true}
            >
              <div className="space-y-4">
                <div>
                  <Label className="text-cream/80 block mb-2">
                    Primary Background Use <span className="text-gold">*</span>
                    <span className="font-bangla text-cream/50 ml-2">প্রাথমিক ব্যাকগ্রাউন্ড</span>
                  </Label>
                  <RadioGroup value={backgroundUse} onValueChange={(v: any) => setBackgroundUse(v)} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="bg-dark" />
                      <Label htmlFor="bg-dark">Dark</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="bg-light" />
                      <Label htmlFor="bg-light">Light</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="bg-both" />
                      <Label htmlFor="bg-both">Both</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-cream/80">
                    Color Palette <span className="text-gold">*</span>
                    <span className="font-bangla text-cream/50 ml-2">রঙের প্যালেট</span>
                  </Label>
                  <Input
                    value={colorPalette}
                    onChange={(e) => setColorPalette(e.target.value)}
                    placeholder="Max 3 colors OR 'monochrome + accent' e.g., Black, Gold, White"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-cream/80 block mb-2">
                    Symbol Preference <span className="text-gold">*</span>
                    <span className="font-bangla text-cream/50 ml-2">সিম্বল পছন্দ</span>
                  </Label>
                  <Select value={symbolPreference} onValueChange={setSymbolPreference}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abstract">Abstract</SelectItem>
                      <SelectItem value="monogram">Monogram</SelectItem>
                      <SelectItem value="iconic">Iconic Symbol</SelectItem>
                      <SelectItem value="typography-only">Typography-Only</SelectItem>
                      <SelectItem value="mixed">Mixed / Let system decide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleSection>

            {/* Typography */}
            <CollapsibleSection
              title="Typography Direction"
              subtitle="টাইপোগ্রাফি"
              icon={<Type className="w-5 h-5 text-gold" />}
            >
              <div className="space-y-4">
                <div>
                  <Label className="text-cream/80 block mb-2">
                    Typography Style (min 1, max 2) <span className="text-gold">*</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {TYPOGRAPHY_DIRECTIONS.map((t) => (
                      <Button
                        key={t.value}
                        variant={typographyDirection.includes(t.value) ? "gold" : "dark-outline"}
                        size="sm"
                        onClick={() => toggleTypography(t.value)}
                        disabled={!typographyDirection.includes(t.value) && typographyDirection.length >= 2}
                        className="justify-start text-left"
                      >
                        {typographyDirection.includes(t.value) && <Check className="w-3 h-3 mr-1 shrink-0" />}
                        <span className="truncate">{t.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-cream/80 block mb-2">
                    Symbol Meaning Focus (optional)
                    <span className="font-bangla text-cream/50 ml-2">সিম্বলের অর্থ</span>
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SYMBOL_MEANINGS.map((s) => (
                      <Button
                        key={s.value}
                        variant={symbolMeaningFocus.includes(s.value) ? "gold" : "dark-outline"}
                        size="sm"
                        onClick={() => toggleSymbolMeaning(s.value)}
                        className="justify-start"
                      >
                        {symbolMeaningFocus.includes(s.value) && <Check className="w-3 h-3 mr-1" />}
                        <span>{s.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Output Options */}
            <CollapsibleSection 
              title="Output Options" 
              subtitle="আউটপুট অপশন" 
              icon={<Globe className="w-5 h-5 text-gold" />}
            >
              <div className="space-y-4">
                <div>
                  <Label className="text-cream/80 block mb-2">Cultural Scope</Label>
                  <Select value={culturalScope} onValueChange={setCulturalScope}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="regional">Region-Specific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-cream/80 block mb-2">Logo Lockup Type</Label>
                  <RadioGroup value={lockupType} onValueChange={setLockupType} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="wordmark" id="lockup-wordmark" />
                      <Label htmlFor="lockup-wordmark">Wordmark only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="symbol-wordmark" id="lockup-symbol" />
                      <Label htmlFor="lockup-symbol">Symbol + Wordmark</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monogram" id="lockup-monogram" />
                      <Label htmlFor="lockup-monogram">Monogram</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-cream/80 block mb-2">Complexity Level</Label>
                  <RadioGroup value={complexityLevel} onValueChange={setComplexityLevel} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="minimal" id="comp-minimal" />
                      <Label htmlFor="comp-minimal">Minimal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="balanced" id="comp-balanced" />
                      <Label htmlFor="comp-balanced">Balanced</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="detailed" id="comp-detailed" />
                      <Label htmlFor="comp-detailed">Detailed</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-cream/80 block mb-2">Number of Variations</Label>
                  <Select value={numVariations} onValueChange={setNumVariations}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Variation ({gemCost} gems)</SelectItem>
                      <SelectItem value="2">2 Variations ({gemCost * 2} gems)</SelectItem>
                      <SelectItem value="4">4 Variations ({gemCost * 4} gems)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-cream/80 block mb-2">Background Mode</Label>
                  <RadioGroup value={backgroundMode} onValueChange={setBackgroundMode} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="transparent" id="mode-trans" />
                      <Label htmlFor="mode-trans">Transparent PNG</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="mode-dark" />
                      <Label htmlFor="mode-dark">On dark background</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="mode-light" />
                      <Label htmlFor="mode-light">On light background</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-cream/80 block mb-2">Text Strictness</Label>
                  <RadioGroup value={textStrictness} onValueChange={setTextStrictness} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="exact" id="text-exact" />
                      <Label htmlFor="text-exact">Exact brand name only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="with-tagline" id="text-tagline" />
                      <Label htmlFor="text-tagline">Brand name + optional tagline</Label>
                    </div>
                  </RadioGroup>
                </div>

                {textStrictness === "with-tagline" && (
                  <div>
                    <Label className="text-cream/80">
                      Tagline (optional)
                      <span className="font-bangla text-cream/50 ml-2">ট্যাগলাইন</span>
                    </Label>
                    <Input
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="Enter your tagline"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Generate Button - Desktop */}
            {!isMobile && (
              <Card className="border-gold/30 bg-charcoal-light/50">
                <CardContent className="p-4">
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={isGenerating || !isFormValid()}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Designing concepts...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Luxury Logos
                        <span className="ml-2 text-sm opacity-80">({totalCost} gems)</span>
                      </>
                    )}
                  </Button>
                  <p className="text-center text-cream/50 text-sm mt-2 font-bangla">
                    প্রিমিয়াম লোগো তৈরি করুন
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Output Gallery */}
          <div className="space-y-6">
            <Card className="border-gold/20 min-h-[400px]">
              <CardHeader>
                <CardTitle>
                  <BilingualHeading english="Generated Logos" bangla="তৈরি করা লোগো" as="h3" className="text-lg" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedLogos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Sparkles className="w-16 h-16 text-gold/30 mb-4" />
                    <p className="text-cream/60 text-lg">Your luxury logos will appear here</p>
                    <p className="text-cream/40 text-sm font-bangla mt-2">আপনার বিলাসবহুল লোগো এখানে দেখা যাবে</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {generatedLogos.map((logo, idx) => (
                      <div
                        key={idx}
                        className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedLogo === idx ? "border-gold shadow-gold" : "border-gold/20 hover:border-gold/50"
                        }`}
                        onClick={() => setSelectedLogo(idx)}
                      >
                        <div className="aspect-square bg-charcoal-deep p-4">
                          <img src={logo.url} alt={logo.label} className="w-full h-full object-contain" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal-deep/90 to-transparent p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-cream font-medium">{logo.label}</span>
                            <div className="flex gap-2">
                              {selectedLogo === idx && (
                                <span className="bg-gold text-charcoal-deep text-xs px-2 py-1 rounded-full font-medium">
                                  Selected
                                </span>
                              )}
                              <Button
                                size="sm"
                                variant="gold-outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(logo, idx);
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {generatedLogos.length > 0 && (
                  <div className="mt-6 flex justify-center">
                    <Button variant="dark-outline" onClick={handleGenerate} disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Regenerate ({totalCost} gems)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      {isMobile && (
        <MobileStickyFooter>
          <Button
            variant="gold"
            size="lg"
            className="w-full"
            onClick={handleGenerate}
            disabled={isGenerating || !isFormValid()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Designing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate ({totalCost} gems)
              </>
            )}
          </Button>
        </MobileStickyFooter>
      )}

      <ProcessingModal
        isOpen={isGenerating}
        featureName="generate-logo"
        customMessage="Designing luxury logos..."
      />

      <LowBalanceAlert
        isOpen={showLowBalance}
        onClose={() => setShowLowBalance(false)}
        requiredGems={totalCost}
        currentBalance={currentBalance}
      />
    </ToolPageLayout>
  );
};

export default LogoGeneratorPage;
