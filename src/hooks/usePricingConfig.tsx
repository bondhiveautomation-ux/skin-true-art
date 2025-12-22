import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PricingPackage {
  id: string;
  package_key: string;
  package_name: string;
  gems: number;
  price_bdt: number;
  is_active: boolean;
  display_order: number;
}

export const usePricingConfig = () => {
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_config')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error("Error fetching pricing config:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePackage = async (id: string, updates: Partial<PricingPackage>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pricing_config')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchPackages();
      return true;
    } catch (error) {
      console.error("Error updating package:", error);
      return false;
    }
  };

  const createPackage = async (pkg: Omit<PricingPackage, 'id'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pricing_config')
        .insert(pkg);

      if (error) throw error;
      await fetchPackages();
      return true;
    } catch (error) {
      console.error("Error creating package:", error);
      return false;
    }
  };

  const deletePackage = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pricing_config')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchPackages();
      return true;
    } catch (error) {
      console.error("Error deleting package:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Convenience getters for subscriptions and topups
  const subscriptions = packages.filter(p => p.package_key.includes('day') || p.package_key.includes('monthly') || p.package_key.includes('weekly'));
  const topups = packages.filter(p => p.package_key.includes('topup'));

  return {
    packages,
    subscriptions,
    topups,
    loading,
    fetchPackages,
    updatePackage,
    createPackage,
    deletePackage,
  };
};
