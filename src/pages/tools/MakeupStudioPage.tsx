import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { MakeupDNAStudio } from "@/components/makeup/MakeupDNAStudio";
import { useAuth } from "@/hooks/useAuth";
import { getToolById } from "@/config/tools";
import { logGeneration } from "@/lib/logGeneration";

const MakeupStudioPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const tool = getToolById("makeup-studio")!;

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

  const handleLogGeneration = async (
    featureName: string,
    inputImages: string[] = [],
    outputImages: string[] = []
  ) => {
    await logGeneration(featureName, inputImages, outputImages, user?.id);
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
      <MakeupDNAStudio onLogGeneration={handleLogGeneration} />
    </ToolPageLayout>
  );
};

export default MakeupStudioPage;
