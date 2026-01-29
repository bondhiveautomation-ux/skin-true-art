import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { 
  Sparkles, Copy, Save, ChevronDown, ChevronUp, Diamond, 
  Droplets, Palette, Eye, Smile, SprayCan, Wand2, Upload, RotateCcw, Download
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getGemCost } from "@/lib/gemCosts";
import { useGems } from "@/hooks/useGems";
import { useAuth } from "@/hooks/useAuth";

// Makeup DNA structure - all the layers
interface MakeupDNA {
  // Prep Layer
  skinClarity: number; // 0-100
  moisturizerType: "matte" | "dewy" | "gel-based";
  primerType: "pore-filling" | "glow" | "matte";
  
  // Base Layer
  panstickCoverage: number; // 0-100
  foundationType: "liquid" | "cream" | "matte" | "dewy";
  loosePowder: number; // 0-100
  pressPowder: number; // 0-100
  
  // Structure Layer
  blushColor: string;
  blushPlacement: "apples" | "cheekbones" | "draping";
  blushIntensity: number; // 0-100
  contourDepth: number; // 0-100
  highlighterTone: "gold" | "champagne" | "silver" | "rose-gold";
  highlighterIntensity: number; // 0-100
  
  // Eyes Layer
  eyeshadowFamily: "warm-neutrals" | "cool-tones" | "bold-colors" | "smokey" | "rose-gold" | "champagne";
  eyeshadowBlending: "soft" | "defined" | "cut-crease";
  eyelinerType: "soft" | "winged" | "bold" | "kohl";
  eyelashType: "natural" | "volume" | "dramatic";
  
  // Lips Layer
  lipstickShade: string;
  lipstickFinish: "matte" | "glossy" | "satin";
  
  // Finish Layer
  settingSpray: "natural" | "long-wear" | "glow";
}

// Default DNA values
const defaultDNA: MakeupDNA = {
  skinClarity: 50,
  moisturizerType: "dewy",
  primerType: "glow",
  panstickCoverage: 40,
  foundationType: "dewy",
  loosePowder: 30,
  pressPowder: 20,
  blushColor: "peachy-pink",
  blushPlacement: "cheekbones",
  blushIntensity: 50,
  contourDepth: 40,
  highlighterTone: "champagne",
  highlighterIntensity: 60,
  eyeshadowFamily: "warm-neutrals",
  eyeshadowBlending: "soft",
  eyelinerType: "winged",
  eyelashType: "volume",
  lipstickShade: "nude-rose",
  lipstickFinish: "satin",
  settingSpray: "natural"
};

// Preset configurations
const presets: Record<string, { name: string; emoji: string; dna: Partial<MakeupDNA> }> = {
  "soft-glam": {
    name: "Soft Glam",
    emoji: "✨",
    dna: {
      moisturizerType: "dewy",
      foundationType: "dewy",
      blushColor: "peachy-pink",
      blushIntensity: 40,
      contourDepth: 30,
      highlighterTone: "champagne",
      highlighterIntensity: 50,
      eyeshadowFamily: "warm-neutrals",
      eyeshadowBlending: "soft",
      eyelinerType: "soft",
      eyelashType: "natural",
      lipstickShade: "nude-pink",
      lipstickFinish: "satin",
      settingSpray: "natural"
    }
  },
  "bridal-glow": {
    name: "Bridal Glow",
    emoji: "💍",
    dna: {
      moisturizerType: "dewy",
      primerType: "glow",
      foundationType: "dewy",
      loosePowder: 40,
      blushColor: "soft-coral",
      blushPlacement: "cheekbones",
      blushIntensity: 50,
      contourDepth: 35,
      highlighterTone: "champagne",
      highlighterIntensity: 70,
      eyeshadowFamily: "champagne",
      eyeshadowBlending: "soft",
      eyelinerType: "winged",
      eyelashType: "volume",
      lipstickShade: "nude-rose",
      lipstickFinish: "satin",
      settingSpray: "glow"
    }
  },
  "bridal-luxe-glam": {
    name: "Bridal Luxe Glam",
    emoji: "👑",
    dna: {
      moisturizerType: "matte",
      primerType: "pore-filling",
      panstickCoverage: 70,
      foundationType: "matte",
      loosePowder: 50,
      pressPowder: 40,
      blushColor: "warm-peach",
      blushPlacement: "cheekbones",
      blushIntensity: 60,
      contourDepth: 50,
      highlighterTone: "gold",
      highlighterIntensity: 80,
      eyeshadowFamily: "rose-gold",
      eyeshadowBlending: "defined",
      eyelinerType: "bold",
      eyelashType: "dramatic",
      lipstickShade: "berry-red",
      lipstickFinish: "matte",
      settingSpray: "long-wear"
    }
  },
  "clean-girl": {
    name: "Clean Girl",
    emoji: "🌿",
    dna: {
      skinClarity: 30,
      moisturizerType: "dewy",
      primerType: "glow",
      panstickCoverage: 10,
      foundationType: "dewy",
      loosePowder: 0,
      pressPowder: 0,
      blushColor: "cream-pink",
      blushPlacement: "apples",
      blushIntensity: 25,
      contourDepth: 10,
      highlighterTone: "champagne",
      highlighterIntensity: 30,
      eyeshadowFamily: "warm-neutrals",
      eyeshadowBlending: "soft",
      eyelinerType: "soft",
      eyelashType: "natural",
      lipstickShade: "nude-gloss",
      lipstickFinish: "glossy",
      settingSpray: "natural"
    }
  },
  "instagram-trendy": {
    name: "Instagram Trendy",
    emoji: "📸",
    dna: {
      moisturizerType: "matte",
      primerType: "pore-filling",
      panstickCoverage: 60,
      foundationType: "matte",
      loosePowder: 40,
      blushColor: "mauve-pink",
      blushPlacement: "draping",
      blushIntensity: 55,
      contourDepth: 60,
      highlighterTone: "rose-gold",
      highlighterIntensity: 70,
      eyeshadowFamily: "bold-colors",
      eyeshadowBlending: "cut-crease",
      eyelinerType: "winged",
      eyelashType: "dramatic",
      lipstickShade: "nude-mauve",
      lipstickFinish: "matte",
      settingSpray: "long-wear"
    }
  },
  "matte-professional": {
    name: "Matte Professional",
    emoji: "💼",
    dna: {
      moisturizerType: "matte",
      primerType: "matte",
      panstickCoverage: 50,
      foundationType: "matte",
      loosePowder: 50,
      pressPowder: 30,
      blushColor: "dusty-rose",
      blushPlacement: "cheekbones",
      blushIntensity: 35,
      contourDepth: 40,
      highlighterTone: "champagne",
      highlighterIntensity: 25,
      eyeshadowFamily: "cool-tones",
      eyeshadowBlending: "soft",
      eyelinerType: "soft",
      eyelashType: "natural",
      lipstickShade: "mlbb-nude",
      lipstickFinish: "matte",
      settingSpray: "long-wear"
    }
  },
  "classic-red-glam": {
    name: "Classic Red Glam",
    emoji: "💄",
    dna: {
      moisturizerType: "matte",
      primerType: "pore-filling",
      panstickCoverage: 60,
      foundationType: "matte",
      loosePowder: 45,
      blushColor: "rosy-pink",
      blushPlacement: "cheekbones",
      blushIntensity: 40,
      contourDepth: 45,
      highlighterTone: "champagne",
      highlighterIntensity: 50,
      eyeshadowFamily: "warm-neutrals",
      eyeshadowBlending: "soft",
      eyelinerType: "winged",
      eyelashType: "volume",
      lipstickShade: "classic-red",
      lipstickFinish: "matte",
      settingSpray: "long-wear"
    }
  },
  "bold-night-out": {
    name: "Bold Night Out",
    emoji: "🌙",
    dna: {
      moisturizerType: "matte",
      primerType: "pore-filling",
      panstickCoverage: 70,
      foundationType: "matte",
      loosePowder: 50,
      pressPowder: 40,
      blushColor: "deep-berry",
      blushPlacement: "draping",
      blushIntensity: 50,
      contourDepth: 65,
      highlighterTone: "silver",
      highlighterIntensity: 60,
      eyeshadowFamily: "smokey",
      eyeshadowBlending: "defined",
      eyelinerType: "bold",
      eyelashType: "dramatic",
      lipstickShade: "deep-burgundy",
      lipstickFinish: "matte",
      settingSpray: "long-wear"
    }
  }
};

interface MakeupDNAStudioProps {
  onLogGeneration: (featureName: string, inputs: string[], outputs: string[]) => Promise<void>;
}

export const MakeupDNAStudio: React.FC<MakeupDNAStudioProps> = ({ onLogGeneration }) => {
  const { user } = useAuth();
  const { hasEnoughGems, deductGems, refundGems } = useGems();
  
  // Image states
  const [targetImage, setTargetImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  // DNA states
  const [extractedDNA, setExtractedDNA] = useState<MakeupDNA | null>(null);
  const [currentDNA, setCurrentDNA] = useState<MakeupDNA>(defaultDNA);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  
  // Mode and UI states
  const [mode, setMode] = useState<"preset" | "extract" | "pro">("preset");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["prep", "base", "structure", "eyes", "lips", "finish"]));
  
  // Saved presets (user's custom)
  const [savedPresets, setSavedPresets] = useState<Array<{ name: string; dna: MakeupDNA }>>([]);

  const toggleSection = (section: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(section)) {
      newSet.delete(section);
    } else {
      newSet.add(section);
    }
    setExpandedSections(newSet);
  };

  const handleTargetUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTargetImage(reader.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReferenceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
        setExtractedDNA(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractDNA = async () => {
    if (!referenceImage) {
      toast({ title: "No Reference Image", description: "Please upload a reference image to extract DNA from", variant: "destructive" });
      return;
    }
    
    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('apply-makeup', {
        body: { 
          mode: 'extract',
          referenceImage,
          userId: user?.id
        }
      });
      
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Extraction Failed", description: data.error, variant: "destructive" });
        return;
      }
      
      if (data?.makeupDNA) {
        setExtractedDNA(data.makeupDNA);
        setCurrentDNA(data.makeupDNA);
        toast({ title: "Makeup DNA Extracted!", description: "You can now apply this look or customize it" });
      }
    } catch (error: any) {
      toast({ title: "Extraction Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = presets[presetId];
    if (preset) {
      setSelectedPreset(presetId);
      setCurrentDNA({ ...defaultDNA, ...preset.dna });
    }
  };

  const handleApplyMakeup = async () => {
    if (!targetImage) {
      toast({ title: "No Target Image", description: "Please upload a face photo to apply makeup", variant: "destructive" });
      return;
    }
    
    if (!hasEnoughGems("apply-makeup")) {
      toast({ title: "Insufficient gems", description: `You need ${getGemCost("apply-makeup")} gems for this feature`, variant: "destructive" });
      return;
    }
    
    setIsApplying(true);
    setResultImage(null);
    
    // Deduct gems immediately
    const gemResult = await deductGems("apply-makeup");
    if (!gemResult.success) {
      setIsApplying(false);
      toast({ title: "Insufficient gems", description: "Please top up your gems to continue", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('apply-makeup', {
        body: { 
          mode: 'apply',
          image: targetImage,
          makeupDNA: currentDNA,
          userId: user?.id
        }
      });
      
      if (error) throw error;
      if (data?.error) {
        await refundGems("apply-makeup");
        toast({ title: "Application Failed", description: data.error, variant: "destructive" });
        return;
      }
      
      if (data?.generatedImageUrl) {
        setResultImage(data.generatedImageUrl);
        await onLogGeneration("Makeup DNA Studio", [], [data.generatedImageUrl]);
        toast({ title: "Makeup Applied!", description: "Your professional look has been created" });
      } else {
        await refundGems("apply-makeup");
        toast({ title: "Application Failed", description: "No result received", variant: "destructive" });
      }
    } catch (error: any) {
      await refundGems("apply-makeup");
      toast({ title: "Application Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsApplying(false);
    }
  };

  const handleSavePreset = () => {
    const name = prompt("Enter a name for this preset:");
    if (name) {
      setSavedPresets([...savedPresets, { name, dna: currentDNA }]);
      toast({ title: "Preset Saved!", description: `"${name}" has been saved to your collection` });
    }
  };

  const handleCopyDNA = () => {
    const dnaString = JSON.stringify(currentDNA, null, 2);
    navigator.clipboard.writeText(dnaString);
    toast({ title: "Copied!", description: "Makeup DNA copied to clipboard" });
  };

  const handleDownload = async () => {
    if (!resultImage) return;
    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'makeup-dna-result.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      // Fallback for base64
      const a = document.createElement('a');
      a.href = resultImage;
      a.download = 'makeup-dna-result.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    setTargetImage(null);
    setReferenceImage(null);
    setResultImage(null);
    setExtractedDNA(null);
    setCurrentDNA(defaultDNA);
    setSelectedPreset(null);
  };

  const updateDNA = <K extends keyof MakeupDNA>(key: K, value: MakeupDNA[K]) => {
    setCurrentDNA(prev => ({ ...prev, [key]: value }));
    setSelectedPreset(null); // Clear preset when manually editing
  };

  // Render a layer section
  const renderLayerSection = (
    id: string, 
    title: string, 
    icon: React.ReactNode, 
    content: React.ReactNode
  ) => (
    <Collapsible 
      open={expandedSections.has(id)} 
      onOpenChange={() => toggleSection(id)}
      className="border border-border/50 rounded-lg overflow-hidden"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/30 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{title}</span>
        </div>
        {expandedSections.has(id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 space-y-4 bg-background/50">
        {content}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preset" className="text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 mr-1.5" />
            Fast Presets
          </TabsTrigger>
          <TabsTrigger value="extract" className="text-xs sm:text-sm">
            <Wand2 className="w-4 h-4 mr-1.5" />
            Extract DNA
          </TabsTrigger>
          <TabsTrigger value="pro" className="text-xs sm:text-sm">
            <Palette className="w-4 h-4 mr-1.5" />
            Pro Editor
          </TabsTrigger>
        </TabsList>

        {/* Preset Mode */}
        <TabsContent value="preset" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(presets).map(([id, preset]) => (
              <button
                key={id}
                onClick={() => handleApplyPreset(id)}
                disabled={isApplying}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedPreset === id 
                    ? "border-primary bg-primary/10" 
                    : "border-border/50 hover:border-primary/50 bg-muted/20"
                }`}
              >
                <div className="text-xl mb-1">{preset.emoji}</div>
                <div className="text-sm font-medium">{preset.name}</div>
              </button>
            ))}
          </div>
          
          {savedPresets.length > 0 && (
            <div className="mt-4">
              <Label className="text-xs text-muted-foreground mb-2 block">Your Saved Presets</Label>
              <div className="flex flex-wrap gap-2">
                {savedPresets.map((preset, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => setCurrentDNA(preset.dna)}
                  >
                    {preset.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Extract DNA Mode */}
        <TabsContent value="extract" className="mt-4">
          <div className="space-y-4">
            <div className="max-w-sm mx-auto">
              <Label className="text-sm mb-2 block text-center">Upload Reference Image</Label>
              <div className="relative">
                {referenceImage ? (
                  <div className="relative rounded-lg overflow-hidden aspect-square">
                    <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="absolute top-2 right-2"
                      onClick={() => { setReferenceImage(null); setExtractedDNA(null); }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Upload reference makeup</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleReferenceUpload} />
                  </label>
                )}
              </div>
            </div>
            
            {referenceImage && (
              <div className="flex justify-center">
                <LoadingButton
                  onClick={handleExtractDNA}
                  isLoading={isExtracting}
                  loadingText="Analyzing Makeup..."
                  disabled={!referenceImage}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Extract Makeup DNA
                </LoadingButton>
              </div>
            )}
            
            {extractedDNA && (
              <Card className="bg-muted/30 border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Extracted Makeup DNA</Label>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleCopyDNA}>
                        <Copy className="w-3 h-3 mr-1" /> Copy
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleSavePreset}>
                        <Save className="w-3 h-3 mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Base: {extractedDNA.foundationType} foundation, {extractedDNA.moisturizerType} finish</p>
                    <p>• Eyes: {extractedDNA.eyeshadowFamily} shadows, {extractedDNA.eyelinerType} liner, {extractedDNA.eyelashType} lashes</p>
                    <p>• Lips: {extractedDNA.lipstickShade}, {extractedDNA.lipstickFinish} finish</p>
                    <p>• Contour: {extractedDNA.contourDepth}% depth, {extractedDNA.highlighterTone} highlight</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Pro Editor Mode */}
        <TabsContent value="pro" className="mt-4">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {/* Prep Layer */}
              {renderLayerSection("prep", "Prep Layer", <Droplets className="w-4 h-4 text-blue-400" />, (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-xs">Skin Clarity</Label>
                      <span className="text-xs text-muted-foreground">{currentDNA.skinClarity}%</span>
                    </div>
                    <Slider 
                      value={[currentDNA.skinClarity]} 
                      onValueChange={([v]) => updateDNA("skinClarity", v)} 
                      max={100} 
                      step={5}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs mb-1.5 block">Moisturizer</Label>
                      {(["matte", "dewy", "gel-based"] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => updateDNA("moisturizerType", type)}
                          className={`w-full py-1.5 px-2 text-xs rounded mb-1 transition-colors ${
                            currentDNA.moisturizerType === type ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5 block">Primer</Label>
                      {(["pore-filling", "glow", "matte"] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => updateDNA("primerType", type)}
                          className={`w-full py-1.5 px-2 text-xs rounded mb-1 transition-colors ${
                            currentDNA.primerType === type ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ))}

              {/* Base Layer */}
              {renderLayerSection("base", "Base Layer", <Palette className="w-4 h-4 text-orange-400" />, (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-xs">Concealer Coverage</Label>
                      <span className="text-xs text-muted-foreground">{currentDNA.panstickCoverage}%</span>
                    </div>
                    <Slider 
                      value={[currentDNA.panstickCoverage]} 
                      onValueChange={([v]) => updateDNA("panstickCoverage", v)} 
                      max={100} 
                      step={5}
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Foundation Type</Label>
                    <div className="grid grid-cols-4 gap-1">
                      {(["liquid", "cream", "matte", "dewy"] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => updateDNA("foundationType", type)}
                          className={`py-1.5 px-2 text-xs rounded transition-colors ${
                            currentDNA.foundationType === type ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs">Loose Powder</Label>
                        <span className="text-xs text-muted-foreground">{currentDNA.loosePowder}%</span>
                      </div>
                      <Slider 
                        value={[currentDNA.loosePowder]} 
                        onValueChange={([v]) => updateDNA("loosePowder", v)} 
                        max={100} 
                        step={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs">Press Powder</Label>
                        <span className="text-xs text-muted-foreground">{currentDNA.pressPowder}%</span>
                      </div>
                      <Slider 
                        value={[currentDNA.pressPowder]} 
                        onValueChange={([v]) => updateDNA("pressPowder", v)} 
                        max={100} 
                        step={5}
                      />
                    </div>
                  </div>
                </>
              ))}

              {/* Structure Layer */}
              {renderLayerSection("structure", "Structure Layer", <Sparkles className="w-4 h-4 text-pink-400" />, (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs">Blush Intensity</Label>
                        <span className="text-xs text-muted-foreground">{currentDNA.blushIntensity}%</span>
                      </div>
                      <Slider 
                        value={[currentDNA.blushIntensity]} 
                        onValueChange={([v]) => updateDNA("blushIntensity", v)} 
                        max={100} 
                        step={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs">Contour Depth</Label>
                        <span className="text-xs text-muted-foreground">{currentDNA.contourDepth}%</span>
                      </div>
                      <Slider 
                        value={[currentDNA.contourDepth]} 
                        onValueChange={([v]) => updateDNA("contourDepth", v)} 
                        max={100} 
                        step={5}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Blush Placement</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {(["apples", "cheekbones", "draping"] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => updateDNA("blushPlacement", type)}
                          className={`py-1.5 px-2 text-xs rounded transition-colors ${
                            currentDNA.blushPlacement === type ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-xs">Highlighter Intensity</Label>
                      <span className="text-xs text-muted-foreground">{currentDNA.highlighterIntensity}%</span>
                    </div>
                    <Slider 
                      value={[currentDNA.highlighterIntensity]} 
                      onValueChange={([v]) => updateDNA("highlighterIntensity", v)} 
                      max={100} 
                      step={5}
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Highlighter Tone</Label>
                    <div className="grid grid-cols-4 gap-1">
                      {(["gold", "champagne", "silver", "rose-gold"] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => updateDNA("highlighterTone", type)}
                          className={`py-1.5 px-2 text-xs rounded transition-colors ${
                            currentDNA.highlighterTone === type ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ))}

              {/* Eyes Layer */}
              {renderLayerSection("eyes", "Eyes Layer", <Eye className="w-4 h-4 text-purple-400" />, (
                <>
                  <div>
                    <Label className="text-xs mb-1.5 block">Eyeshadow Family</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {(["warm-neutrals", "cool-tones", "bold-colors", "smokey", "rose-gold", "champagne"] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => updateDNA("eyeshadowFamily", type)}
                          className={`py-1.5 px-2 text-xs rounded transition-colors ${
                            currentDNA.eyeshadowFamily === type ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                          }`}
                        >
                          {type.replace("-", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Blending Style</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {(["soft", "defined", "cut-crease"] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => updateDNA("eyeshadowBlending", type)}
                          className={`py-1.5 px-2 text-xs rounded transition-colors ${
                            currentDNA.eyeshadowBlending === type ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Eyeliner Style</Label>
                    <div className="grid grid-cols-4 gap-1">
                      {(["soft", "winged", "bold", "kohl"] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => updateDNA("eyelinerType", type)}
                          className={`py-1.5 px-2 text-xs rounded transition-colors ${
                            currentDNA.eyelinerType === type ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Lash Type</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {(["natural", "volume", "dramatic"] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => updateDNA("eyelashType", type)}
                          className={`py-1.5 px-2 text-xs rounded transition-colors ${
                            currentDNA.eyelashType === type ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ))}

              {/* Lips Layer */}
              {renderLayerSection("lips", "Lips Layer", <Smile className="w-4 h-4 text-red-400" />, (
                <>
                  <div>
                    <Label className="text-xs mb-1.5 block">Lipstick Finish</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {(["matte", "glossy", "satin"] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => updateDNA("lipstickFinish", type)}
                          className={`py-1.5 px-2 text-xs rounded transition-colors ${
                            currentDNA.lipstickFinish === type ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ))}

              {/* Finish Layer */}
              {renderLayerSection("finish", "Finish Layer", <SprayCan className="w-4 h-4 text-cyan-400" />, (
                <div>
                  <Label className="text-xs mb-1.5 block">Setting Spray</Label>
                  <div className="grid grid-cols-3 gap-1">
                    {(["natural", "long-wear", "glow"] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => updateDNA("settingSpray", type)}
                        className={`py-1.5 px-2 text-xs rounded transition-colors ${
                          currentDNA.settingSpray === type ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Target Image Upload */}
      <div className="max-w-sm mx-auto">
        <ImageUploader
          id="makeup-target-upload"
          image={targetImage}
          onUpload={handleTargetUpload}
          onRemove={() => { setTargetImage(null); setResultImage(null); }}
          label="Upload Face Photo"
          description="Clear, front-facing photo works best"
        />
      </div>

      {/* Apply Button */}
      <div className="flex flex-col items-center gap-2">
        <LoadingButton
          onClick={handleApplyMakeup}
          isLoading={isApplying}
          loadingText="Applying Makeup DNA..."
          disabled={!targetImage || isApplying}
          size="lg"
          className="btn-glow bg-foreground text-background hover:bg-foreground/90 px-10"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Apply Makeup
        </LoadingButton>
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <Diamond className="w-3.5 h-3.5 text-purple-400" />
          <span>Costs {getGemCost("apply-makeup")} gems</span>
        </div>
      </div>

      {/* Result Display */}
      {resultImage && (
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <Label className="text-sm font-medium">Result</Label>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  Download
                </Button>
                <Button size="sm" variant="outline" onClick={handleApplyMakeup} disabled={isApplying}>
                  <RotateCcw className="w-3 h-3 mr-1" /> Regenerate
                </Button>
                <Button size="sm" variant="ghost" onClick={handleReset}>
                  Start Over
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {targetImage && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Original</Label>
                  <img src={targetImage} alt="Original" className="rounded-lg w-full" />
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">With Makeup DNA</Label>
                <img src={resultImage} alt="Result" className="rounded-lg w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MakeupDNAStudio;
