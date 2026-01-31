import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Department {
  id: string;
  name: string;
  bangla_name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useDepartments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: departments, isLoading, error, refetch } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tool_departments")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Department[];
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createDepartment = useMutation({
    mutationFn: async (dept: Omit<Department, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("tool_departments")
        .insert(dept)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast({ title: "Department created" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create department", description: error.message, variant: "destructive" });
    },
  });

  const updateDepartment = useMutation({
    mutationFn: async (updates: Partial<Department> & { id: string }) => {
      const { id, ...rest } = updates;
      const { error } = await supabase
        .from("tool_departments")
        .update({ ...rest, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast({ title: "Department updated" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update department", description: error.message, variant: "destructive" });
    },
  });

  const deleteDepartment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tool_departments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["tool-configs"] });
      toast({ title: "Department deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete department", description: error.message, variant: "destructive" });
    },
  });

  const assignToolToDepartment = useMutation({
    mutationFn: async ({ toolId, departmentId }: { toolId: string; departmentId: string | null }) => {
      const { error } = await supabase
        .from("tool_configs")
        .update({ department_id: departmentId, updated_at: new Date().toISOString() })
        .eq("id", toolId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tool-configs"] });
      toast({ title: "Tool assignment updated" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to assign tool", description: error.message, variant: "destructive" });
    },
  });

  return {
    departments,
    isLoading,
    error,
    refetch,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    assignToolToDepartment,
  };
};
