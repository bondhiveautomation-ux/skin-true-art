// Business Machine data helpers.
// Uses `any` casts because bm_* tables may not appear in the generated types.
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

export const bm = {
  // Brands
  async listBrands(userId: string) {
    const { data, error } = await sb
      .from("bm_brand_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async listBrandTemplates() {
    const { data, error } = await sb.from("bm_brand_templates").select("*").order("name");
    if (error) throw error;
    return data ?? [];
  },
  async getBrand(id: string) {
    const { data, error } = await sb.from("bm_brand_profiles").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },
  async upsertBrand(payload: any) {
    const { data, error } = await sb.from("bm_brand_profiles").upsert(payload).select().maybeSingle();
    if (error) throw error;
    return data;
  },
  async deleteBrand(id: string) {
    const { error } = await sb.from("bm_brand_profiles").delete().eq("id", id);
    if (error) throw error;
  },

  // Products
  async listProjects(userId: string) {
    const { data, error } = await sb
      .from("bm_product_projects")
      .select("*, bm_brand_profiles(name)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async getProject(id: string) {
    const { data, error } = await sb.from("bm_product_projects").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },
  async createProject(payload: any) {
    const { data, error } = await sb.from("bm_product_projects").insert(payload).select().maybeSingle();
    if (error) throw error;
    return data;
  },
  async updateProject(id: string, patch: any) {
    const { data, error } = await sb.from("bm_product_projects").update(patch).eq("id", id).select().maybeSingle();
    if (error) throw error;
    return data;
  },
  async deleteProject(id: string) {
    const { error } = await sb.from("bm_product_projects").delete().eq("id", id);
    if (error) throw error;
  },

  // Assets
  async listAssets(projectId: string) {
    const { data, error } = await sb
      .from("bm_product_assets")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },
  async addAsset(payload: any) {
    const { data, error } = await sb.from("bm_product_assets").insert(payload).select().maybeSingle();
    if (error) throw error;
    return data;
  },
  async updateAsset(id: string, patch: any) {
    const { error } = await sb.from("bm_product_assets").update(patch).eq("id", id);
    if (error) throw error;
  },
  async deleteAsset(id: string, path?: string) {
    if (path) await sb.storage.from("business-machine").remove([path]);
    const { error } = await sb.from("bm_product_assets").delete().eq("id", id);
    if (error) throw error;
  },

  // Analysis
  async getAnalysis(projectId: string) {
    const { data, error } = await sb.from("bm_product_analysis").select("*").eq("project_id", projectId).maybeSingle();
    if (error) throw error;
    return data;
  },
  async upsertAnalysis(payload: any) {
    const existing = await bm.getAnalysis(payload.project_id);
    if (existing) {
      const { data, error } = await sb
        .from("bm_product_analysis")
        .update({ analysis: payload.analysis, confirmed_by_user: payload.confirmed_by_user ?? existing.confirmed_by_user })
        .eq("id", existing.id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    const { data, error } = await sb.from("bm_product_analysis").insert(payload).select().maybeSingle();
    if (error) throw error;
    return data;
  },

  // Names
  async listNames(projectId: string) {
    const { data, error } = await sb
      .from("bm_name_options")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async addNames(rows: any[]) {
    if (!rows.length) return [];
    const { data, error } = await sb.from("bm_name_options").insert(rows).select();
    if (error) throw error;
    return data ?? [];
  },
  async selectName(projectId: string, nameId: string) {
    await sb.from("bm_name_options").update({ is_selected: false, is_locked: false }).eq("project_id", projectId);
    const { error } = await sb.from("bm_name_options").update({ is_selected: true, is_locked: true }).eq("id", nameId);
    if (error) throw error;
  },
  async updateName(id: string, patch: any) {
    const { error } = await sb.from("bm_name_options").update(patch).eq("id", id);
    if (error) throw error;
  },
  async deleteName(id: string) {
    const { error } = await sb.from("bm_name_options").delete().eq("id", id);
    if (error) throw error;
  },

  // Copy sections
  async listCopy(projectId: string) {
    const { data, error } = await sb.from("bm_copy_sections").select("*").eq("project_id", projectId);
    if (error) throw error;
    return data ?? [];
  },
  async upsertCopy(userId: string, projectId: string, sectionKey: string, content: string, meta: any = {}) {
    const existing = await sb
      .from("bm_copy_sections")
      .select("*")
      .eq("project_id", projectId)
      .eq("section_key", sectionKey)
      .maybeSingle();
    if (existing.data) {
      if (existing.data.is_locked) return existing.data;
      // save version snapshot before overwrite
      await sb.from("bm_copy_versions").insert({
        user_id: userId,
        section_id: existing.data.id,
        content: existing.data.content,
        meta: existing.data.meta,
      });
      const { data, error } = await sb
        .from("bm_copy_sections")
        .update({ content, meta })
        .eq("id", existing.data.id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    }
    const { data, error } = await sb
      .from("bm_copy_sections")
      .insert({ user_id: userId, project_id: projectId, section_key: sectionKey, content, meta })
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  async setCopyLock(id: string, is_locked: boolean) {
    const { error } = await sb.from("bm_copy_sections").update({ is_locked }).eq("id", id);
    if (error) throw error;
  },
  async listCopyVersions(sectionId: string) {
    const { data, error } = await sb
      .from("bm_copy_versions")
      .select("*")
      .eq("section_id", sectionId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

export async function uploadProjectAsset(userId: string, projectId: string, file: File) {
  const ext = file.name.split(".").pop() || "png";
  const path = `${userId}/${projectId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await (supabase.storage as any).from("business-machine").upload(path, file, {
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = (supabase.storage as any).from("business-machine").getPublicUrl(path);
  return { path, url: data?.publicUrl as string };
}

export async function signedAssetUrl(path: string, seconds = 3600) {
  const { data, error } = await (supabase.storage as any).from("business-machine").createSignedUrl(path, seconds);
  if (error) throw error;
  return data.signedUrl as string;
}
