import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ToolConfigDB {
  id: string;
  tool_id: string;
  name: string;
  short_name: string;
  description: string;
  long_description: string;
  badge: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  preview_image_url: string | null;
  department_id: string | null;
}

export const useToolConfigs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: toolConfigs, isLoading, error, refetch } = useQuery({
    queryKey: ["tool-configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tool_configs")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as ToolConfigDB[];
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateToolConfig = useMutation({
    mutationFn: async (updates: Partial<ToolConfigDB> & { id: string }) => {
      const { id, ...rest } = updates;
      const { error } = await supabase
        .from("tool_configs")
        .update({ ...rest, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tool-configs"] });
      toast({ title: "Tool updated", description: "Changes saved successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const toggleToolActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("tool_configs")
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tool-configs"] });
      toast({ title: "Tool visibility updated" });
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const getToolConfig = (toolId: string) => {
    return toolConfigs?.find(t => t.tool_id === toolId);
  };

  return {
    toolConfigs,
    isLoading,
    error,
    refetch,
    updateToolConfig,
    toggleToolActive,
    getToolConfig,
  };
};
