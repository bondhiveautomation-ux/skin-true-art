import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, ChevronDown, Save, Eye, EyeOff, Upload, X, ImageIcon } from "lucide-react";
import { useToolConfigs, ToolConfigDB } from "@/hooks/useToolConfigs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ToolConfigsManager = () => {
  const { toolConfigs, isLoading, updateToolConfig, toggleToolActive } = useToolConfigs();
  const { toast } = useToast();
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [editedConfigs, setEditedConfigs] = useState<Record<string, Partial<ToolConfigDB>>>({});
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const handleFieldChange = (toolId: string, field: keyof ToolConfigDB, value: string) => {
    setEditedConfigs(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        [field]: value,
      },
    }));
  };

  const handleImageUpload = async (tool: ToolConfigDB, file: File) => {
    if (!file) return;
    
    setUploadingImage(tool.id);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tool.tool_id}-${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('tool-previews')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tool-previews')
        .getPublicUrl(fileName);
      
      // Update the tool config with new image URL
      await updateToolConfig.mutateAsync({ 
        id: tool.id, 
        preview_image_url: publicUrl 
      });
      
      toast({ title: "Image uploaded", description: "Tool preview image updated successfully" });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ 
        title: "Upload failed", 
        description: error.message || "Failed to upload image", 
        variant: "destructive" 
      });
    } finally {
      setUploadingImage(null);
      // Reset file input
      if (fileInputRefs.current[tool.id]) {
        fileInputRefs.current[tool.id]!.value = '';
      }
    }
  };

  const handleRemoveImage = async (tool: ToolConfigDB) => {
    try {
      await updateToolConfig.mutateAsync({ 
        id: tool.id, 
        preview_image_url: null 
      });
      toast({ title: "Image removed", description: "Using default preview image" });
    } catch (error: any) {
      toast({ 
        title: "Failed to remove image", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const handleSave = async (tool: ToolConfigDB) => {
    const edits = editedConfigs[tool.id];
    if (!edits) return;

    await updateToolConfig.mutateAsync({ id: tool.id, ...edits });
    setEditedConfigs(prev => {
      const updated = { ...prev };
      delete updated[tool.id];
      return updated;
    });
  };

  const getFieldValue = (tool: ToolConfigDB, field: keyof ToolConfigDB) => {
    return editedConfigs[tool.id]?.[field] ?? tool[field];
  };

  const hasChanges = (toolId: string) => {
    return Object.keys(editedConfigs[toolId] || {}).length > 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-serif text-cream">Tool Configurations</h2>
          <p className="text-sm text-cream/60">Edit tool names, descriptions, images and visibility</p>
        </div>
      </div>

      <div className="space-y-3">
        {toolConfigs?.map((tool) => (
          <Card key={tool.id} className={`border-primary/10 ${!tool.is_active ? 'opacity-60' : ''}`}>
            <Collapsible
              open={expandedTool === tool.id}
              onOpenChange={(open) => setExpandedTool(open ? tool.id : null)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="py-4 cursor-pointer hover:bg-primary/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <CardTitle className="text-base text-cream font-medium">
                          {getFieldValue(tool, 'name') as string}
                        </CardTitle>
                        <span className="text-xs text-cream/50">{tool.tool_id}</span>
                      </div>
                      {tool.badge && (
                        <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                          {tool.badge}
                        </Badge>
                      )}
                      {hasChanges(tool.id) && (
                        <Badge className="bg-amber-500/20 text-amber-400 text-xs">Unsaved</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {tool.is_active ? (
                          <Eye className="w-4 h-4 text-green-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-cream/40" />
                        )}
                        <Switch
                          checked={tool.is_active}
                          onCheckedChange={(checked) => toggleToolActive.mutate({ id: tool.id, is_active: checked })}
                        />
                      </div>
                      <ChevronDown className={`w-4 h-4 text-cream/40 transition-transform ${expandedTool === tool.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-cream/70">Name</Label>
                      <Input
                        value={getFieldValue(tool, 'name') as string}
                        onChange={(e) => handleFieldChange(tool.id, 'name', e.target.value)}
                        className="bg-secondary/30 border-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-cream/70">Short Name</Label>
                      <Input
                        value={getFieldValue(tool, 'short_name') as string}
                        onChange={(e) => handleFieldChange(tool.id, 'short_name', e.target.value)}
                        className="bg-secondary/30 border-primary/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-cream/70">Badge Text</Label>
                      <Input
                        value={(getFieldValue(tool, 'badge') as string) || ''}
                        onChange={(e) => handleFieldChange(tool.id, 'badge', e.target.value)}
                        placeholder="e.g. New, Popular, Quick Tool"
                        className="bg-secondary/30 border-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-cream/70">Display Order</Label>
                      <Input
                        type="number"
                        value={getFieldValue(tool, 'display_order') as number}
                        onChange={(e) => handleFieldChange(tool.id, 'display_order', e.target.value)}
                        className="bg-secondary/30 border-primary/20"
                      />
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-3">
                    <Label className="text-cream/70">Preview Image</Label>
                    <div className="flex items-start gap-4">
                      {/* Current Image Preview */}
                      <div className="relative w-24 h-32 rounded-lg overflow-hidden bg-secondary/30 border border-primary/20 flex-shrink-0">
                        {tool.preview_image_url ? (
                          <>
                            <img 
                              src={tool.preview_image_url} 
                              alt={tool.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => handleRemoveImage(tool)}
                              className="absolute top-1 right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors"
                            >
                              <X className="w-3 h-3 text-destructive-foreground" />
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-cream/40">
                            <ImageIcon className="w-6 h-6 mb-1" />
                            <span className="text-[10px]">Default</span>
                          </div>
                        )}
                      </div>

                      {/* Upload Button */}
                      <div className="flex-1 space-y-2">
                        <input
                          ref={(el) => fileInputRefs.current[tool.id] = el}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(tool, file);
                          }}
                          className="hidden"
                          id={`image-upload-${tool.id}`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRefs.current[tool.id]?.click()}
                          disabled={uploadingImage === tool.id}
                          className="gap-2"
                        >
                          {uploadingImage === tool.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {uploadingImage === tool.id ? 'Uploading...' : 'Upload Image'}
                        </Button>
                        <p className="text-xs text-cream/40">
                          Recommended: 400x500px. JPG, PNG or WebP.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-cream/70">Short Description (Dashboard Cards)</Label>
                    <Textarea
                      value={getFieldValue(tool, 'description') as string}
                      onChange={(e) => handleFieldChange(tool.id, 'description', e.target.value)}
                      rows={2}
                      className="bg-secondary/30 border-primary/20 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-cream/70">Long Description (Tool Page Hero)</Label>
                    <Textarea
                      value={getFieldValue(tool, 'long_description') as string}
                      onChange={(e) => handleFieldChange(tool.id, 'long_description', e.target.value)}
                      rows={3}
                      className="bg-secondary/30 border-primary/20 resize-none"
                    />
                  </div>

                  {hasChanges(tool.id) && (
                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={() => handleSave(tool)}
                        disabled={updateToolConfig.isPending}
                        className="gap-2"
                      >
                        {updateToolConfig.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ToolConfigsManager;
