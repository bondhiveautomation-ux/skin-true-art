import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Dress {
  id: string;
  category: "male" | "female";
  name: string;
  image_url: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
}

export const useDressLibrary = () => {
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [activeDresses, setActiveDresses] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAllDresses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("dress_library")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDresses((data as Dress[]) || []);
    } catch (error: any) {
      console.error("Error fetching dresses:", error);
    }
  }, []);

  const fetchActiveDresses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("dress_library")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setActiveDresses((data as Dress[]) || []);
    } catch (error: any) {
      console.error("Error fetching active dresses:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllDresses();
    fetchActiveDresses();
  }, [fetchAllDresses, fetchActiveDresses]);

  const uploadDressImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("dress-library")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("dress-library")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const addDress = async (
    category: "male" | "female",
    name: string,
    imageUrl: string,
    tags: string[]
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.from("dress_library").insert({
        category,
        name,
        image_url: imageUrl,
        tags,
        is_active: true,
      });

      if (error) throw error;
      
      await fetchAllDresses();
      await fetchActiveDresses();
      toast({ title: "Dress added successfully" });
      return true;
    } catch (error: any) {
      toast({
        title: "Failed to add dress",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateDress = async (
    id: string,
    updates: Partial<Omit<Dress, "id" | "created_at">>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("dress_library")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      
      await fetchAllDresses();
      await fetchActiveDresses();
      toast({ title: "Dress updated successfully" });
      return true;
    } catch (error: any) {
      toast({
        title: "Failed to update dress",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleDressActive = async (id: string, isActive: boolean): Promise<boolean> => {
    return updateDress(id, { is_active: isActive });
  };

  const deleteDress = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("dress_library")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      await fetchAllDresses();
      await fetchActiveDresses();
      toast({ title: "Dress deleted successfully" });
      return true;
    } catch (error: any) {
      toast({
        title: "Failed to delete dress",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    dresses,
    activeDresses,
    loading,
    addDress,
    updateDress,
    toggleDressActive,
    deleteDress,
    uploadDressImage,
    refetch: () => {
      fetchAllDresses();
      fetchActiveDresses();
    },
  };
};
