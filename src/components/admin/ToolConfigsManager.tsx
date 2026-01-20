import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, ChevronDown, Save, Eye, EyeOff } from "lucide-react";
import { useToolConfigs, ToolConfigDB } from "@/hooks/useToolConfigs";

const ToolConfigsManager = () => {
  const { toolConfigs, isLoading, updateToolConfig, toggleToolActive } = useToolConfigs();
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [editedConfigs, setEditedConfigs] = useState<Record<string, Partial<ToolConfigDB>>>({});

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
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
          <p className="text-sm text-cream/60">Edit tool names, descriptions, and visibility</p>
        </div>
      </div>

      <div className="space-y-3">
        {toolConfigs?.map((tool) => (
          <Card key={tool.id} className={`border-gold/10 ${!tool.is_active ? 'opacity-60' : ''}`}>
            <Collapsible
              open={expandedTool === tool.id}
              onOpenChange={(open) => setExpandedTool(open ? tool.id : null)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="py-4 cursor-pointer hover:bg-gold/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <CardTitle className="text-base text-cream font-medium">
                          {getFieldValue(tool, 'name') as string}
                        </CardTitle>
                        <span className="text-xs text-cream/50">{tool.tool_id}</span>
                      </div>
                      {tool.badge && (
                        <Badge variant="outline" className="border-gold/30 text-gold text-xs">
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
                          className="data-[state=checked]:bg-green-500"
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
                        className="bg-secondary/30 border-gold/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-cream/70">Short Name</Label>
                      <Input
                        value={getFieldValue(tool, 'short_name') as string}
                        onChange={(e) => handleFieldChange(tool.id, 'short_name', e.target.value)}
                        className="bg-secondary/30 border-gold/20"
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
                        className="bg-secondary/30 border-gold/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-cream/70">Display Order</Label>
                      <Input
                        type="number"
                        value={getFieldValue(tool, 'display_order') as number}
                        onChange={(e) => handleFieldChange(tool.id, 'display_order', e.target.value)}
                        className="bg-secondary/30 border-gold/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-cream/70">Short Description (Dashboard Cards)</Label>
                    <Textarea
                      value={getFieldValue(tool, 'description') as string}
                      onChange={(e) => handleFieldChange(tool.id, 'description', e.target.value)}
                      rows={2}
                      className="bg-secondary/30 border-gold/20 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-cream/70">Long Description (Tool Page Hero)</Label>
                    <Textarea
                      value={getFieldValue(tool, 'long_description') as string}
                      onChange={(e) => handleFieldChange(tool.id, 'long_description', e.target.value)}
                      rows={3}
                      className="bg-secondary/30 border-gold/20 resize-none"
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
