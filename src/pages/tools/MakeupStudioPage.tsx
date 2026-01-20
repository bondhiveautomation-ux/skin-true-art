import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { MakeupDNAStudio } from "@/components/makeup/MakeupDNAStudio";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getToolById } from "@/config/tools";

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
    if (!user?.id) return;
    const onlyUrls = (arr: string[]) => arr.filter((v) => typeof v === "string" && v.startsWith("http"));
    try {
      await supabase.rpc("log_generation", {
        p_user_id: user.id,
        p_feature_name: featureName,
        p_input_images: onlyUrls(inputImages),
        p_output_images: onlyUrls(outputImages),
      });
    } catch (error) {
      console.error("Failed to log generation:", error);
    }
  };

  return (
    <ToolPageLayout
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
