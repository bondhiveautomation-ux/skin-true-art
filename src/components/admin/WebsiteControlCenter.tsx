import { useState, useEffect } from "react";
import { useSiteContent, SiteContent } from "@/hooks/useSiteContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Loader2,
  Layout,
  Type,
  Sparkles,
  Grid3X3,
  ListOrdered,
  MessageSquare,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContentEditorProps {
  sectionKey: string;
  contentKey: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
}

const ContentEditor = ({
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
}: ContentEditorProps) => (
  <div className="space-y-2">
    <Label className="text-cream/70 text-sm font-medium">{label}</Label>
    {multiline ? (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-charcoal border-gold/20 text-cream placeholder:text-cream/30 min-h-[100px] resize-none"
      />
    ) : (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-charcoal border-gold/20 text-cream placeholder:text-cream/30"
      />
    )}
  </div>
);

interface SectionEditorProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  sectionKey: string;
  fields: Array<{
    key: string;
    label: string;
    multiline?: boolean;
    placeholder?: string;
  }>;
  showVisibilityToggle?: boolean;
}

const SectionEditor = ({
  title,
  description,
  icon,
  sectionKey,
  fields,
  showVisibilityToggle = true,
}: SectionEditorProps) => {
  const { allContent, updateContent, isUpdating } = useSiteContent();
  const { toast } = useToast();
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Get current values from database
  const getCurrentValue = (contentKey: string) => {
    const item = allContent?.find(
      (c) => c.section_key === sectionKey && c.content_key === contentKey
    );
    return item?.value || "";
  };

  const isVisible = getCurrentValue("section_visible") !== "false";

  // Initialize local values
  useEffect(() => {
    if (allContent) {
      const values: Record<string, string> = {};
      fields.forEach((field) => {
        values[field.key] = getCurrentValue(field.key);
      });
      setLocalValues(values);
      setHasChanges(false);
    }
  }, [allContent, sectionKey]);

  const handleChange = (key: string, value: string) => {
    setLocalValues((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const updates = Object.entries(localValues).map(([key, value]) => ({
      section_key: sectionKey,
      content_key: key,
      value,
    }));
    
    await updateContent.mutateAsync(updates);
    setHasChanges(false);
  };

  const handleReset = () => {
    const values: Record<string, string> = {};
    fields.forEach((field) => {
      values[field.key] = getCurrentValue(field.key);
    });
    setLocalValues(values);
    setHasChanges(false);
  };

  const handleToggleVisibility = async () => {
    await updateContent.mutateAsync({
      section_key: sectionKey,
      content_key: "section_visible",
      value: isVisible ? "false" : "true",
    });
  };

  return (
    <Card className="bg-charcoal border-gold/15">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gold-icon flex items-center justify-center">
              {icon}
            </div>
            <div>
              <CardTitle className="text-cream text-lg font-serif">{title}</CardTitle>
              <CardDescription className="text-cream/40 text-sm">{description}</CardDescription>
            </div>
          </div>
          {showVisibilityToggle && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-cream/50">
                {isVisible ? "Visible" : "Hidden"}
              </span>
              <Switch
                checked={isVisible}
                onCheckedChange={handleToggleVisibility}
                className="data-[state=checked]:bg-gold"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field) => (
          <ContentEditor
            key={field.key}
            sectionKey={sectionKey}
            contentKey={field.key}
            label={field.label}
            value={localValues[field.key] || ""}
            onChange={(value) => handleChange(field.key, value)}
            multiline={field.multiline}
            placeholder={field.placeholder}
          />
        ))}
        
        {hasChanges && (
          <div className="flex items-center gap-2 pt-4 border-t border-gold/10">
            <Button
              onClick={handleSave}
              variant="gold"
              size="sm"
              disabled={isUpdating}
              className="btn-glow"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className="text-cream/50 hover:text-cream"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Feature Card Editor Component
const FeatureEditor = ({ featureNumber }: { featureNumber: number }) => {
  const sectionKey = `feature_${featureNumber}`;
  const { allContent, updateContent, isUpdating } = useSiteContent();
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const getCurrentValue = (contentKey: string) => {
    const item = allContent?.find(
      (c) => c.section_key === sectionKey && c.content_key === contentKey
    );
    return item?.value || "";
  };

  const isVisible = getCurrentValue("visible") !== "false";
  const isFeatured = getCurrentValue("featured") === "true";

  useEffect(() => {
    if (allContent) {
      setLocalValues({
        name: getCurrentValue("name"),
        description: getCurrentValue("description"),
      });
      setHasChanges(false);
    }
  }, [allContent, sectionKey]);

  const handleChange = (key: string, value: string) => {
    setLocalValues((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const updates = Object.entries(localValues).map(([key, value]) => ({
      section_key: sectionKey,
      content_key: key,
      value,
    }));
    await updateContent.mutateAsync(updates);
    setHasChanges(false);
  };

  const handleToggleVisibility = async () => {
    await updateContent.mutateAsync({
      section_key: sectionKey,
      content_key: "visible",
      value: isVisible ? "false" : "true",
    });
  };

  const handleToggleFeatured = async () => {
    await updateContent.mutateAsync({
      section_key: sectionKey,
      content_key: "featured",
      value: isFeatured ? "false" : "true",
    });
  };

  return (
    <div className="p-4 rounded-xl border border-gold/15 bg-charcoal-light space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gold">Feature #{featureNumber}</span>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-cream/40">Featured</span>
            <Switch
              checked={isFeatured}
              onCheckedChange={handleToggleFeatured}
              className="data-[state=checked]:bg-gold scale-75"
            />
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-cream/40">Visible</span>
            <Switch
              checked={isVisible}
              onCheckedChange={handleToggleVisibility}
              className="data-[state=checked]:bg-gold scale-75"
            />
          </label>
        </div>
      </div>
      
      <Input
        value={localValues.name || ""}
        onChange={(e) => handleChange("name", e.target.value)}
        placeholder="Feature name"
        className="bg-charcoal border-gold/20 text-cream text-sm"
      />
      
      <Textarea
        value={localValues.description || ""}
        onChange={(e) => handleChange("description", e.target.value)}
        placeholder="Feature description"
        className="bg-charcoal border-gold/20 text-cream text-sm min-h-[60px] resize-none"
      />
      
      {hasChanges && (
        <Button
          onClick={handleSave}
          variant="gold"
          size="sm"
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
        </Button>
      )}
    </div>
  );
};

export const WebsiteControlCenter = () => {
  const { isLoading } = useSiteContent();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center pb-4 border-b border-gold/10">
        <h2 className="font-serif text-2xl text-cream mb-2">Website Control Center</h2>
        <p className="text-cream/40 text-sm">
          Edit all website text, visibility, and content without touching code.
        </p>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="bg-charcoal border border-gold/15 p-1 flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="hero" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal-deep text-cream/60 text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="header" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal-deep text-cream/60 text-xs">
            <Layout className="w-3 h-3 mr-1" />
            Header
          </TabsTrigger>
          <TabsTrigger value="features" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal-deep text-cream/60 text-xs">
            <Grid3X3 className="w-3 h-3 mr-1" />
            Features
          </TabsTrigger>
          <TabsTrigger value="how-it-works" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal-deep text-cream/60 text-xs">
            <ListOrdered className="w-3 h-3 mr-1" />
            Process
          </TabsTrigger>
          <TabsTrigger value="value" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal-deep text-cream/60 text-xs">
            <Type className="w-3 h-3 mr-1" />
            Promise
          </TabsTrigger>
          <TabsTrigger value="cta" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal-deep text-cream/60 text-xs">
            <MessageSquare className="w-3 h-3 mr-1" />
            CTA
          </TabsTrigger>
          <TabsTrigger value="footer" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal-deep text-cream/60 text-xs">
            <FileText className="w-3 h-3 mr-1" />
            Footer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <SectionEditor
            title="Hero Section"
            description="Main landing area with headlines and CTAs"
            icon={<Sparkles className="w-5 h-5 text-gold" />}
            sectionKey="hero"
            showVisibilityToggle={false}
            fields={[
              { key: "badge_text", label: "Badge Text", placeholder: "e.g., AI Fashion & Beauty Studio" },
              { key: "headline_1", label: "Headline Line 1", placeholder: "e.g., Where Fashion" },
              { key: "headline_2", label: "Headline Line 2 (Gradient)", placeholder: "e.g., Meets AI" },
              { key: "subheadline", label: "Subheadline", multiline: true, placeholder: "Brief description..." },
              { key: "cta_primary", label: "Primary Button Text", placeholder: "e.g., Enter Studio" },
              { key: "cta_secondary", label: "Secondary Button Text", placeholder: "e.g., Explore Features" },
              { key: "trust_text", label: "Trust Text", placeholder: "e.g., Trusted by creators worldwide" },
            ]}
          />
        </TabsContent>

        <TabsContent value="header">
          <SectionEditor
            title="Header & Navigation"
            description="Site branding and navigation labels"
            icon={<Layout className="w-5 h-5 text-gold" />}
            sectionKey="header"
            showVisibilityToggle={false}
            fields={[
              { key: "brand_name", label: "Brand Name", placeholder: "e.g., Influencer Tool" },
              { key: "nav_features", label: "Features Nav Label", placeholder: "e.g., Features" },
              { key: "nav_process", label: "Process Nav Label", placeholder: "e.g., Process" },
              { key: "nav_studio", label: "Studio Nav Label", placeholder: "e.g., Studio" },
              { key: "cta_get_started", label: "Get Started Button", placeholder: "e.g., Get Started" },
            ]}
          />
        </TabsContent>

        <TabsContent value="features">
          <div className="space-y-6">
            <SectionEditor
              title="Features Section Header"
              description="Section title and introduction"
              icon={<Grid3X3 className="w-5 h-5 text-gold" />}
              sectionKey="features"
              fields={[
                { key: "badge_text", label: "Badge Text", placeholder: "e.g., The Collection" },
                { key: "headline_1", label: "Headline Line 1", placeholder: "e.g., AI-Powered" },
                { key: "headline_2", label: "Headline Line 2 (Gradient)", placeholder: "e.g., Creative Tools" },
                { key: "subheadline", label: "Subheadline", multiline: true },
              ]}
            />
            
            <Card className="bg-charcoal border-gold/15">
              <CardHeader>
                <CardTitle className="text-cream text-lg font-serif">Feature Cards</CardTitle>
                <CardDescription className="text-cream/40">
                  Edit individual feature names, descriptions, and visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <FeatureEditor key={num} featureNumber={num} />
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="how-it-works">
          <SectionEditor
            title="How It Works Section"
            description="Process steps and descriptions"
            icon={<ListOrdered className="w-5 h-5 text-gold" />}
            sectionKey="how_it_works"
            fields={[
              { key: "badge_text", label: "Badge Text", placeholder: "e.g., The Process" },
              { key: "headline_1", label: "Headline Line 1", placeholder: "e.g., Effortless" },
              { key: "headline_2", label: "Headline Line 2 (Gradient)", placeholder: "e.g., Elegance" },
              { key: "subheadline", label: "Subheadline", multiline: true },
              { key: "step_1_title", label: "Step 1 Title" },
              { key: "step_1_description", label: "Step 1 Description", multiline: true },
              { key: "step_2_title", label: "Step 2 Title" },
              { key: "step_2_description", label: "Step 2 Description", multiline: true },
              { key: "step_3_title", label: "Step 3 Title" },
              { key: "step_3_description", label: "Step 3 Description", multiline: true },
            ]}
          />
        </TabsContent>

        <TabsContent value="value">
          <SectionEditor
            title="Our Promise Section"
            description="Value proposition and trust elements"
            icon={<Type className="w-5 h-5 text-gold" />}
            sectionKey="value"
            fields={[
              { key: "badge_text", label: "Badge Text", placeholder: "e.g., Our Promise" },
              { key: "headline_1", label: "Headline Line 1", placeholder: "e.g., Built for" },
              { key: "headline_2", label: "Headline Line 2 (Gradient)", placeholder: "e.g., Excellence" },
              { key: "subheadline", label: "Subheadline", multiline: true },
              { key: "item_1_title", label: "Value 1 Title" },
              { key: "item_1_description", label: "Value 1 Description", multiline: true },
              { key: "item_2_title", label: "Value 2 Title" },
              { key: "item_2_description", label: "Value 2 Description", multiline: true },
              { key: "item_3_title", label: "Value 3 Title" },
              { key: "item_3_description", label: "Value 3 Description", multiline: true },
              { key: "item_4_title", label: "Value 4 Title" },
              { key: "item_4_description", label: "Value 4 Description", multiline: true },
            ]}
          />
        </TabsContent>

        <TabsContent value="cta">
          <SectionEditor
            title="Call to Action Section"
            description="Final conversion area"
            icon={<MessageSquare className="w-5 h-5 text-gold" />}
            sectionKey="cta"
            fields={[
              { key: "headline_1", label: "Headline Line 1", placeholder: "e.g., Ready to" },
              { key: "headline_2", label: "Headline Line 2 (Gradient)", placeholder: "e.g., Transform" },
              { key: "subheadline", label: "Subheadline", multiline: true },
              { key: "button_text", label: "Button Text", placeholder: "e.g., Begin Your Journey" },
              { key: "trust_text", label: "Trust Text", placeholder: "e.g., No commitment required" },
            ]}
          />
        </TabsContent>

        <TabsContent value="footer">
          <SectionEditor
            title="Footer Section"
            description="Footer branding and links"
            icon={<FileText className="w-5 h-5 text-gold" />}
            sectionKey="footer"
            showVisibilityToggle={false}
            fields={[
              { key: "brand_name", label: "Brand Name", placeholder: "e.g., Influencer Tool" },
              { key: "tagline", label: "Tagline", placeholder: "e.g., AI-powered tools for creators" },
              { key: "copyright", label: "Copyright Text", placeholder: "Use {year} for current year" },
              { key: "link_privacy", label: "Privacy Link Text", placeholder: "e.g., Privacy" },
              { key: "link_terms", label: "Terms Link Text", placeholder: "e.g., Terms" },
              { key: "link_contact", label: "Contact Link Text", placeholder: "e.g., Contact" },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
