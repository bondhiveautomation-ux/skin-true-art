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
  FileText,
  Home,
  Users,
  Target,
  BookOpen
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

      <Tabs defaultValue="home-hero" className="space-y-6">
        <TabsList className="bg-charcoal border border-gold/15 p-1 flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="home-hero" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal-deep text-cream/60 text-xs">
            <Home className="w-3 h-3 mr-1" />
            Home Hero
          </TabsTrigger>
          <TabsTrigger value="home-features" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal-deep text-cream/60 text-xs">
            <Grid3X3 className="w-3 h-3 mr-1" />
            Features
          </TabsTrigger>
          <TabsTrigger value="home-audiences" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal-deep text-cream/60 text-xs">
            <Users className="w-3 h-3 mr-1" />
            Audiences
          </TabsTrigger>
          <TabsTrigger value="home-value" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal-deep text-cream/60 text-xs">
            <Target className="w-3 h-3 mr-1" />
            Value Props
          </TabsTrigger>
          <TabsTrigger value="info-page" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal-deep text-cream/60 text-xs">
            <BookOpen className="w-3 h-3 mr-1" />
            Info Page
          </TabsTrigger>
          <TabsTrigger value="header" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal-deep text-cream/60 text-xs">
            <Layout className="w-3 h-3 mr-1" />
            Header
          </TabsTrigger>
          <TabsTrigger value="footer" className="data-[state=active]:bg-gold data-[state=active]:text-charcoal-deep text-cream/60 text-xs">
            <FileText className="w-3 h-3 mr-1" />
            Footer
          </TabsTrigger>
        </TabsList>

        {/* Home Hero Section */}
        <TabsContent value="home-hero">
          <SectionEditor
            title="Home Page Hero"
            description="Main hero section on the public home page"
            icon={<Home className="w-5 h-5 text-gold" />}
            sectionKey="home"
            showVisibilityToggle={false}
            fields={[
              { key: "hero_badge", label: "Badge Text", placeholder: "e.g., Private Access Platform" },
              { key: "hero_headline_1", label: "Headline Line 1", placeholder: "e.g., Your Personal AI Studio for" },
              { key: "hero_headline_2", label: "Headline Line 2 (Gradient)", placeholder: "e.g., Beauty, Fashion & Content Creation" },
              { key: "hero_subheadline", label: "Subheadline", multiline: true, placeholder: "Brief description..." },
              { key: "hero_cta_signin", label: "Sign In Button Text", placeholder: "e.g., Sign In" },
              { key: "hero_cta_access", label: "Request Access Button Text", placeholder: "e.g., Request Access" },
              { key: "hero_cta_learn", label: "Learn More Link Text", placeholder: "e.g., Learn How BondHive Studio Works" },
              { key: "whatsapp_message", label: "WhatsApp Pre-fill Message", placeholder: "e.g., Hi, I'd like to request access..." },
            ]}
          />
        </TabsContent>

        {/* Home Features Section */}
        <TabsContent value="home-features">
          <div className="space-y-6">
            <SectionEditor
              title="Features Section Header"
              description="Section title and introduction for feature groups"
              icon={<Grid3X3 className="w-5 h-5 text-gold" />}
              sectionKey="home"
              showVisibilityToggle={false}
              fields={[
                { key: "features_badge", label: "Badge Text", placeholder: "e.g., The Studio Collection" },
                { key: "features_headline_1", label: "Headline Line 1", placeholder: "e.g., Professional AI Tools," },
                { key: "features_headline_2", label: "Headline Line 2 (Gradient)", placeholder: "e.g., One Platform" },
                { key: "features_subheadline", label: "Subheadline", multiline: true },
              ]}
            />
            
            <Card className="bg-charcoal border-gold/15">
              <CardHeader>
                <CardTitle className="text-cream text-lg font-serif">Feature Groups</CardTitle>
                <CardDescription className="text-cream/40">
                  Edit the 4 feature group cards shown on the home page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[1, 2, 3, 4].map((num) => (
                  <SectionEditor
                    key={num}
                    title={`Feature Group ${num}`}
                    description={`Group ${num} title, description, and tools`}
                    icon={<Grid3X3 className="w-5 h-5 text-gold" />}
                    sectionKey="home"
                    showVisibilityToggle={false}
                    fields={[
                      { key: `feature_group_${num}_title`, label: "Group Title", placeholder: "e.g., Identity & Character Control" },
                      { key: `feature_group_${num}_desc`, label: "Group Description", multiline: true },
                      { key: `feature_group_${num}_tools`, label: "Tools (comma-separated)", placeholder: "e.g., Character Generator, Pose Transfer" },
                    ]}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audiences Section */}
        <TabsContent value="home-audiences">
          <div className="space-y-6">
            <SectionEditor
              title="Audiences Section Header"
              description="Who uses section header"
              icon={<Users className="w-5 h-5 text-gold" />}
              sectionKey="home"
              showVisibilityToggle={false}
              fields={[
                { key: "audiences_badge", label: "Badge Text", placeholder: "e.g., Built For Creators" },
                { key: "audiences_headline", label: "Headline", placeholder: "e.g., Who Uses" },
              ]}
            />
            
            <Card className="bg-charcoal border-gold/15">
              <CardHeader>
                <CardTitle className="text-cream text-lg font-serif">Audience Cards</CardTitle>
                <CardDescription className="text-cream/40">
                  Edit the 4 audience cards (Makeup Artists, Fashion Creators, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[1, 2, 3, 4].map((num) => (
                  <SectionEditor
                    key={num}
                    title={`Audience ${num}`}
                    description={`Audience card ${num}`}
                    icon={<Users className="w-5 h-5 text-gold" />}
                    sectionKey="home"
                    showVisibilityToggle={false}
                    fields={[
                      { key: `audience_${num}_title`, label: "Title", placeholder: "e.g., Makeup Artists" },
                      { key: `audience_${num}_benefit`, label: "Benefit Statement", multiline: true },
                    ]}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Value Props Section */}
        <TabsContent value="home-value">
          <div className="space-y-6">
            <SectionEditor
              title="Value Section Header"
              description="Why BondHive section header"
              icon={<Target className="w-5 h-5 text-gold" />}
              sectionKey="home"
              showVisibilityToggle={false}
              fields={[
                { key: "value_badge", label: "Badge Text", placeholder: "e.g., Our Promise" },
                { key: "value_headline", label: "Headline", placeholder: "e.g., Why" },
              ]}
            />
            
            <Card className="bg-charcoal border-gold/15">
              <CardHeader>
                <CardTitle className="text-cream text-lg font-serif">Value Pillars</CardTitle>
                <CardDescription className="text-cream/40">
                  Edit the 4 value proposition pillars (Precision, Consistency, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[1, 2, 3, 4].map((num) => (
                  <SectionEditor
                    key={num}
                    title={`Value Pillar ${num}`}
                    description={`Value prop ${num}`}
                    icon={<Target className="w-5 h-5 text-gold" />}
                    sectionKey="home"
                    showVisibilityToggle={false}
                    fields={[
                      { key: `value_${num}_title`, label: "Title", placeholder: "e.g., Precision" },
                      { key: `value_${num}_desc`, label: "Description", multiline: true },
                    ]}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Info Page Section */}
        <TabsContent value="info-page">
          <SectionEditor
            title="Info/Knowledge Hub Page"
            description="Content for the /info page"
            icon={<BookOpen className="w-5 h-5 text-gold" />}
            sectionKey="info"
            showVisibilityToggle={false}
            fields={[
              { key: "page_badge", label: "Page Badge", placeholder: "e.g., Knowledge Hub" },
              { key: "page_title_1", label: "Title Part 1", placeholder: "e.g., BondHive Studio" },
              { key: "page_title_2", label: "Title Part 2 (Gradient)", placeholder: "e.g., Knowledge Hub" },
              { key: "page_subtitle", label: "Subtitle", multiline: true },
              { key: "coming_soon_text", label: "Coming Soon Text", placeholder: "e.g., More articles coming soon..." },
              { key: "whatsapp_message", label: "WhatsApp Pre-fill Message", placeholder: "e.g., Hi, I'd like to request access..." },
              { key: "footer_tagline", label: "Footer Tagline", placeholder: "e.g., Private access platform" },
              { key: "footer_copyright", label: "Footer Copyright", placeholder: "Use {year} for current year" },
            ]}
          />
        </TabsContent>

        {/* Header Section */}
        <TabsContent value="header">
          <SectionEditor
            title="Header & Navigation"
            description="Site branding and navigation labels"
            icon={<Layout className="w-5 h-5 text-gold" />}
            sectionKey="header"
            showVisibilityToggle={false}
            fields={[
              { key: "brand_name", label: "Brand Name (Logo)", placeholder: "e.g., BondHive" },
              { key: "nav_features", label: "Features Nav Label", placeholder: "e.g., Features" },
              { key: "nav_process", label: "Process Nav Label", placeholder: "e.g., Process" },
              { key: "nav_studio", label: "Studio Nav Label", placeholder: "e.g., Studio" },
              { key: "cta_get_started", label: "Get Started Button", placeholder: "e.g., Get Started" },
            ]}
          />
        </TabsContent>

        {/* Footer Section */}
        <TabsContent value="footer">
          <SectionEditor
            title="Footer Section"
            description="Footer branding and links"
            icon={<FileText className="w-5 h-5 text-gold" />}
            sectionKey="footer"
            showVisibilityToggle={false}
            fields={[
              { key: "brand_name", label: "Brand Name", placeholder: "e.g., BondHive" },
              { key: "tagline", label: "Tagline", placeholder: "e.g., Your personal AI studio for beauty & content" },
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
