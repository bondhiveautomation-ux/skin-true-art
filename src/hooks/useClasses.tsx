import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ClassFeature {
  title: string;
  description: string;
  icon: string;
}

export interface ClassItem {
  id: string;
  badge_text: string;
  duration_text: string;
  title: string;
  features: ClassFeature[];
  days_online: string;
  hours: string;
  support_text: string;
  price: number;
  price_label: string;
  bkash_number: string | null;
  cta_text: string;
  cta_link: string | null;
  cta_type: 'modal' | 'whatsapp' | 'phone' | 'link';
  is_popular: boolean;
  icon_type: 'zap' | 'sparkles' | 'star' | 'crown' | 'graduation';
  color_theme: 'gold' | 'rose-gold';
  display_order: number;
  is_active: boolean;
}

export interface ClassPageSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  is_active: boolean;
}

export const useClasses = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [pageSettings, setPageSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchClasses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Parse features from JSONB
      const parsed = (data || []).map(item => ({
        ...item,
        features: (item.features as unknown as ClassFeature[]) || [],
      })) as ClassItem[];
      
      setClasses(parsed);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  }, []);

  const fetchPageSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('classes_page_settings')
        .select('*');

      if (error) throw error;
      
      const settings: Record<string, string> = {};
      (data || []).forEach(item => {
        settings[item.setting_key] = item.setting_value;
      });
      setPageSettings(settings);
    } catch (error) {
      console.error("Error fetching page settings:", error);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchClasses(), fetchPageSettings()]);
    setLoading(false);
  }, [fetchClasses, fetchPageSettings]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Admin functions
  const createClass = async (classData: Omit<ClassItem, 'id'>): Promise<boolean> => {
    try {
      const insertData = {
        badge_text: classData.badge_text,
        duration_text: classData.duration_text,
        title: classData.title,
        features: JSON.stringify(classData.features),
        days_online: classData.days_online,
        hours: classData.hours,
        support_text: classData.support_text,
        price: classData.price,
        price_label: classData.price_label,
        bkash_number: classData.bkash_number,
        cta_text: classData.cta_text,
        cta_link: classData.cta_link,
        cta_type: classData.cta_type,
        is_popular: classData.is_popular,
        icon_type: classData.icon_type,
        color_theme: classData.color_theme,
        display_order: classData.display_order,
        is_active: classData.is_active,
      };

      const { error } = await supabase
        .from('classes')
        .insert(insertData);

      if (error) throw error;
      await fetchClasses();
      return true;
    } catch (error) {
      console.error("Error creating class:", error);
      return false;
    }
  };

  const updateClass = async (id: string, updates: Partial<ClassItem>): Promise<boolean> => {
    try {
      // Build update object without features first
      const { features, ...rest } = updates;
      const updateData: Record<string, unknown> = { ...rest };
      
      // Add features as JSON string if provided
      if (features !== undefined) {
        updateData.features = JSON.stringify(features);
      }
      
      const { error } = await supabase
        .from('classes')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      await fetchClasses();
      return true;
    } catch (error) {
      console.error("Error updating class:", error);
      return false;
    }
  };

  const deleteClass = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchClasses();
      return true;
    } catch (error) {
      console.error("Error deleting class:", error);
      return false;
    }
  };

  const updatePageSetting = async (key: string, value: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('classes_page_settings')
        .update({ setting_value: value })
        .eq('setting_key', key);

      if (error) throw error;
      await fetchPageSettings();
      return true;
    } catch (error) {
      console.error("Error updating page setting:", error);
      return false;
    }
  };

  return {
    classes,
    pageSettings,
    loading,
    fetchAll,
    createClass,
    updateClass,
    deleteClass,
    updatePageSetting,
  };
};
