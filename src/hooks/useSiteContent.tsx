import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SiteContent {
  id: string;
  section_key: string;
  content_key: string;
  value: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ContentUpdate {
  section_key: string;
  content_key: string;
  value: string;
  is_active?: boolean;
  display_order?: number;
}

export const useSiteContent = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all content
  const { data: allContent, isLoading, error } = useQuery({
    queryKey: ["site-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .order("section_key")
        .order("display_order");
      
      if (error) throw error;
      return data as SiteContent[];
    },
  });

  // Get content by section
  const getSection = (sectionKey: string): Record<string, string> => {
    if (!allContent) return {};
    
    const sectionContent = allContent.filter(
      (item) => item.section_key === sectionKey && item.is_active
    );
    
    return sectionContent.reduce((acc, item) => {
      acc[item.content_key] = item.value;
      return acc;
    }, {} as Record<string, string>);
  };

  // Get single content value
  const getValue = (sectionKey: string, contentKey: string, defaultValue = ""): string => {
    if (!allContent) return defaultValue;
    
    const item = allContent.find(
      (c) => c.section_key === sectionKey && c.content_key === contentKey
    );
    
    return item?.is_active ? item.value : defaultValue;
  };

  // Check if section is visible
  const isSectionVisible = (sectionKey: string): boolean => {
    const visible = getValue(sectionKey, "section_visible", "true");
    return visible === "true";
  };

  // Update content mutation
  const updateContent = useMutation({
    mutationFn: async (updates: ContentUpdate | ContentUpdate[]) => {
      const updateArray = Array.isArray(updates) ? updates : [updates];
      
      for (const update of updateArray) {
        const { error } = await supabase
          .from("site_content")
          .update({
            value: update.value,
            is_active: update.is_active ?? true,
            display_order: update.display_order,
          })
          .eq("section_key", update.section_key)
          .eq("content_key", update.content_key);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast({
        title: "Content updated",
        description: "Your changes have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update content. Please try again.",
        variant: "destructive",
      });
      console.error("Content update error:", error);
    },
  });

  // Bulk update for a section
  const updateSection = async (sectionKey: string, updates: Record<string, string>) => {
    const contentUpdates: ContentUpdate[] = Object.entries(updates).map(([key, value]) => ({
      section_key: sectionKey,
      content_key: key,
      value,
    }));
    
    await updateContent.mutateAsync(contentUpdates);
  };

  // Toggle section visibility
  const toggleSectionVisibility = async (sectionKey: string, visible: boolean) => {
    await updateContent.mutateAsync({
      section_key: sectionKey,
      content_key: "section_visible",
      value: visible ? "true" : "false",
    });
  };

  return {
    allContent,
    isLoading,
    error,
    getSection,
    getValue,
    isSectionVisible,
    updateContent,
    updateSection,
    toggleSectionVisibility,
    isUpdating: updateContent.isPending,
  };
};

// Simplified hook for components to just read content
export const useContent = (sectionKey: string) => {
  const { data: content, isLoading } = useQuery({
    queryKey: ["site-content", sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("section_key", sectionKey)
        .eq("is_active", true)
        .order("display_order");
      
      if (error) throw error;
      
      return (data as SiteContent[]).reduce((acc, item) => {
        acc[item.content_key] = item.value;
        return acc;
      }, {} as Record<string, string>);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { content: content || {}, isLoading };
};

// Hook to get feature content
export const useFeatureContent = () => {
  const { data: features, isLoading } = useQuery({
    queryKey: ["site-content", "features-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .like("section_key", "feature_%")
        .eq("is_active", true)
        .order("section_key")
        .order("display_order");
      
      if (error) throw error;
      
      // Group by feature
      const grouped: Record<string, Record<string, string>> = {};
      (data as SiteContent[]).forEach((item) => {
        if (!grouped[item.section_key]) {
          grouped[item.section_key] = {};
        }
        grouped[item.section_key][item.content_key] = item.value;
      });
      
      return grouped;
    },
    staleTime: 1000 * 60 * 5,
  });

  return { features: features || {}, isLoading };
};
