import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";

interface LandingExample {
  id: string;
  category_key: string;
  category_name: string;
  category_name_bn: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

export const LandingExamplesManager = () => {
  const [examples, setExamples] = useState<LandingExample[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchExamples = async () => {
    try {
      const { data, error } = await supabase
        .from("landing_examples")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setExamples(data || []);
    } catch (error) {
      console.error("Error fetching examples:", error);
      toast({
        title: "Error",
        description: "Failed to load examples",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamples();
  }, []);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    example: LandingExample
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(example.id);

    try {
      // Delete old image if exists
      if (example.image_url) {
        const oldPath = example.image_url.split("/").pop();
        if (oldPath) {
          await supabase.storage
            .from("landing-examples")
            .remove([oldPath]);
        }
      }

      // Upload new image
      const fileExt = file.name.split(".").pop();
      const fileName = `${example.category_key}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("landing-examples")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("landing-examples")
        .getPublicUrl(fileName);

      // Update database
      const { error: updateError } = await supabase
        .from("landing_examples")
        .update({ image_url: urlData.publicUrl })
        .eq("id", example.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });

      fetchExamples();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const handleRemoveImage = async (example: LandingExample) => {
    if (!example.image_url) return;

    try {
      const fileName = example.image_url.split("/").pop();
      if (fileName) {
        await supabase.storage.from("landing-examples").remove([fileName]);
      }

      const { error } = await supabase
        .from("landing_examples")
        .update({ image_url: null })
        .eq("id", example.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Image removed",
      });

      fetchExamples();
    } catch (error) {
      console.error("Error removing image:", error);
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (example: LandingExample) => {
    try {
      const { error } = await supabase
        .from("landing_examples")
        .update({ is_active: !example.is_active })
        .eq("id", example.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Category ${example.is_active ? "hidden" : "shown"}`,
      });

      fetchExamples();
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update visibility",
        variant: "destructive",
      });
    }
  };

  const handleUpdateNames = async (
    example: LandingExample,
    field: "category_name" | "category_name_bn",
    value: string
  ) => {
    try {
      const { error } = await supabase
        .from("landing_examples")
        .update({ [field]: value })
        .eq("id", example.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <Card className="bg-card border-gold/20">
      <CardHeader>
        <CardTitle className="text-cream flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-gold" />
          Landing Page Examples
        </CardTitle>
        <p className="text-sm text-cream/60">
          Upload images for the "Examples" section on the landing page
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {examples.map((example) => (
            <div
              key={example.id}
              className={`p-4 rounded-xl border ${
                example.is_active
                  ? "border-gold/30 bg-charcoal/50"
                  : "border-cream/10 bg-charcoal/30 opacity-60"
              }`}
            >
              {/* Image Preview/Upload */}
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-charcoal mb-3 relative">
                {example.image_url ? (
                  <>
                    <img
                      src={example.image_url}
                      alt={example.category_name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 w-7 h-7"
                      onClick={() => handleRemoveImage(example)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-charcoal-light transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, example)}
                      disabled={uploading === example.id}
                    />
                    {uploading === example.id ? (
                      <Loader2 className="w-8 h-8 animate-spin text-gold" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-cream/40 mb-2" />
                        <span className="text-xs text-cream/40">
                          Click to upload
                        </span>
                      </>
                    )}
                  </label>
                )}
              </div>

              {/* Category Names */}
              <div className="space-y-2 mb-3">
                <div>
                  <Label className="text-xs text-cream/60">English Name</Label>
                  <Input
                    value={example.category_name}
                    onChange={(e) =>
                      handleUpdateNames(example, "category_name", e.target.value)
                    }
                    onBlur={fetchExamples}
                    className="h-8 text-sm bg-charcoal border-cream/20"
                  />
                </div>
                <div>
                  <Label className="text-xs text-cream/60">Bangla Name</Label>
                  <Input
                    value={example.category_name_bn}
                    onChange={(e) =>
                      handleUpdateNames(
                        example,
                        "category_name_bn",
                        e.target.value
                      )
                    }
                    onBlur={fetchExamples}
                    className="h-8 text-sm bg-charcoal border-cream/20 font-bangla"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-cream/60">Show on landing</span>
                <Switch
                  checked={example.is_active}
                  onCheckedChange={() => handleToggleActive(example)}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
