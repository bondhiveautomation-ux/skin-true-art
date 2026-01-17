import { useState } from "react";
import { useFeatureGemCosts, FeatureGemCost, clearGemCostCache } from "@/hooks/useFeatureGemCosts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Diamond, Loader2, RefreshCw, Sparkles, Zap, PenTool } from "lucide-react";
import { toast } from "sonner";

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  "high-impact": {
    label: "High-Impact",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    icon: <Sparkles className="w-3 h-3" />,
  },
  "studio-utility": {
    label: "Studio Utility",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: <Zap className="w-3 h-3" />,
  },
  "quick-tools": {
    label: "Quick Tools",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: <PenTool className="w-3 h-3" />,
  },
};

export const FeatureGemCostsManager = () => {
  const { features, loading, updateFeatureCost, refetch } = useFeatureGemCosts();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const handleStartEdit = (feature: FeatureGemCost) => {
    setEditingId(feature.id);
    setEditValue(feature.gem_cost);
  };

  const handleSave = async (feature: FeatureGemCost) => {
    if (editValue === feature.gem_cost) {
      setEditingId(null);
      return;
    }

    if (editValue < 1) {
      toast.error("Gem cost must be at least 1");
      return;
    }

    setSaving(true);
    try {
      const success = await updateFeatureCost(feature.id, { gem_cost: editValue });
      if (success) {
        clearGemCostCache(); // Clear cache so new cost is used
        toast.success(`Updated ${feature.feature_name} to ${editValue} gems`);
        setEditingId(null);
      } else {
        toast.error("Failed to update gem cost");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue(0);
  };

  const handleRefresh = async () => {
    clearGemCostCache();
    await refetch();
    toast.success("Costs refreshed");
  };

  // Group features by category
  const groupedFeatures = features.reduce((acc, feature) => {
    const category = feature.category || "quick-tools";
    if (!acc[category]) acc[category] = [];
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, FeatureGemCost[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-serif text-charcoal flex items-center gap-2">
          <Diamond className="w-5 h-5 text-purple-400" />
          Feature Gem Costs
        </h2>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-purple-500/5 border-purple-500/20">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-charcoal">How it works:</strong> Set the gem cost for each feature. 
            Users will be charged this amount when they use the tool. Changes take effect immediately for all users.
          </p>
        </CardContent>
      </Card>

      {/* Features by Category */}
      {Object.entries(CATEGORY_CONFIG).map(([categoryKey, categoryInfo]) => {
        const categoryFeatures = groupedFeatures[categoryKey] || [];
        if (categoryFeatures.length === 0) return null;

        return (
          <Card key={categoryKey}>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Badge variant="outline" className={categoryInfo.color}>
                  {categoryInfo.icon}
                  {categoryInfo.label}
                </Badge>
                <span className="text-muted-foreground font-normal">
                  ({categoryFeatures.length} features)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Feature</TableHead>
                      <TableHead>Feature Key</TableHead>
                      <TableHead className="text-center">Gem Cost</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryFeatures.map((feature) => (
                      <TableRow key={feature.id}>
                        <TableCell className="font-medium">
                          {feature.feature_name}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {feature.feature_key}
                          </code>
                        </TableCell>
                        <TableCell className="text-center">
                          {editingId === feature.id ? (
                            <div className="flex items-center justify-center gap-1">
                              <Input
                                type="number"
                                min={1}
                                className="w-20 h-8 text-sm text-center"
                                value={editValue}
                                onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSave(feature);
                                  if (e.key === "Escape") handleCancel();
                                }}
                              />
                              <Diamond className="w-4 h-4 text-purple-400" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <span className="font-semibold text-lg">{feature.gem_cost}</span>
                              <Diamond className="w-4 h-4 text-purple-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === feature.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancel}
                                disabled={saving}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="gold"
                                size="sm"
                                onClick={() => handleSave(feature)}
                                disabled={saving}
                              >
                                {saving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                Save
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartEdit(feature)}
                            >
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Summary */}
      <Card className="border-gold/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Features Configured:</span>
            <span className="font-medium">{features.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
