import { useNavigate } from "react-router-dom";
import { useDepartments } from "@/hooks/useDepartments";
import { useToolConfigs, ToolConfigDB } from "@/hooks/useToolConfigs";
import { useFeatureGemCosts } from "@/hooks/useFeatureGemCosts";
import { TOOLS } from "@/config/tools";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gem, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DepartmentToolGridProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

export const DepartmentToolGrid = ({ showBackButton, onBack }: DepartmentToolGridProps) => {
  const navigate = useNavigate();
  const { departments, isLoading: depsLoading } = useDepartments();
  const { toolConfigs, isLoading: toolsLoading } = useToolConfigs();
  const { features } = useFeatureGemCosts();

  const getGemCost = (featureKey: string) => {
    const feature = features.find(f => f.feature_key === featureKey);
    return feature?.gem_cost ?? 1;
  };

  if (depsLoading || toolsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  const activeDepartments = departments?.filter(d => d.is_active) || [];
  
  const getToolsForDepartment = (deptId: string) => {
    return toolConfigs?.filter(t => (t as any).department_id === deptId && t.is_active) || [];
  };

  const getUnassignedActiveTools = () => {
    return toolConfigs?.filter(t => !(t as any).department_id && t.is_active) || [];
  };

  const renderToolCard = (tool: ToolConfigDB) => {
    const staticTool = TOOLS.find(t => t.id === tool.tool_id);
    if (!staticTool) return null;

    const gemCost = getGemCost(staticTool.gemCostKey);
    const Icon = staticTool.icon;

    return (
      <Card
        key={tool.id}
        onClick={() => navigate(staticTool.path)}
        className="group cursor-pointer relative overflow-hidden bg-charcoal-light border-gold/15 hover:border-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-gold/10 aspect-square"
      >
        {/* Background Image or Gradient */}
        <div className="absolute inset-0">
          {tool.preview_image_url ? (
            <img
              src={tool.preview_image_url}
              alt={tool.name}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
            />
          ) : (
            <div className={`w-full h-full ${staticTool.gradient} opacity-40`} />
          )}
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        </div>

        {/* Gem Cost Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-black/60 backdrop-blur-sm border-gold/30 text-cream flex items-center gap-1.5 px-2 py-1">
            <Gem className="w-3 h-3 text-gold" />
            <span className="text-sm font-medium">{gemCost}</span>
          </Badge>
        </div>

        {/* Tool Icon */}
        <div className="absolute top-3 left-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Tool Badge */}
        {tool.badge && (
          <div className="absolute top-14 left-3 z-10">
            <Badge variant="secondary" className="bg-gold/20 text-gold border-gold/30 text-xs">
              {tool.badge}
            </Badge>
          </div>
        )}

        {/* Tool Name - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className="font-serif text-xl font-bold text-cream tracking-tight leading-tight group-hover:text-gold transition-colors">
            {tool.name}
          </h3>
          <p className="font-bangla text-cream/60 text-sm mt-1">
            {tool.short_name}
          </p>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-10">
      {/* Back Button */}
      {showBackButton && onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-cream/70 hover:text-cream mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      )}

      {/* Departments with Tools */}
      {activeDepartments.map((dept) => {
        const deptTools = getToolsForDepartment(dept.id);
        if (deptTools.length === 0) return null;

        return (
          <section key={dept.id} className="space-y-5">
            {/* Department Header */}
            <div className="border-b border-gold/20 pb-4">
              <h2 className="font-serif text-2xl font-bold text-cream tracking-tight">
                {dept.name}
              </h2>
              <p className="font-bangla text-cream/60 text-base mt-1">
                {dept.bangla_name}
              </p>
              {dept.description && (
                <p className="text-cream/50 text-sm mt-2 max-w-2xl">
                  {dept.description}
                </p>
              )}
            </div>

            {/* 2-Column Grid */}
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {deptTools.map(renderToolCard)}
            </div>
          </section>
        );
      })}

      {/* Unassigned Tools (if any) */}
      {getUnassignedActiveTools().length > 0 && (
        <section className="space-y-5">
          <div className="border-b border-cream/10 pb-4">
            <h2 className="font-serif text-2xl font-bold text-cream/70 tracking-tight">
              Other Tools
            </h2>
            <p className="font-bangla text-cream/40 text-base mt-1">
              অন্যান্য টুলস
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {getUnassignedActiveTools().map(renderToolCard)}
          </div>
        </section>
      )}
    </div>
  );
};
