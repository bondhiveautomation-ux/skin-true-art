
-- ============ ENUMS ============
CREATE TYPE bm_project_status AS ENUM ('draft','in_progress','completed','archived');
CREATE TYPE bm_prompt_status  AS ENUM ('draft','needs_review','approved','generating','generated','revision_requested','final');
CREATE TYPE bm_asset_role     AS ENUM ('primary','additional','identity','garment','packaging','size_chart','other');

-- ============ update_updated_at helper (already exists as public.update_updated_at_column) ============

-- ============ BRAND PROFILES ============
CREATE TABLE public.bm_brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  target_country TEXT,
  target_customer TEXT,
  brand_colors JSONB DEFAULT '[]'::jsonb,
  personality TEXT,
  preferred_language TEXT DEFAULT 'mixed',
  language_ratio INTEGER DEFAULT 50, -- % Bangla vs English
  tone TEXT DEFAULT 'premium',
  emoji_density TEXT DEFAULT 'minimal',
  currency TEXT DEFAULT 'BDT',
  shipping_policy TEXT,
  cod_available BOOLEAN DEFAULT true,
  preorder_policy TEXT,
  standard_delivery_time TEXT,
  standard_cta TEXT,
  preferred_aesthetic TEXT,
  preferred_dimensions TEXT,
  avoid_phrases JSONB DEFAULT '[]'::jsonb,
  common_tags JSONB DEFAULT '[]'::jsonb,
  ad_style TEXT,
  naming_style TEXT,
  custom_ai_instructions TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bm_brand_profiles TO authenticated;
GRANT ALL ON public.bm_brand_profiles TO service_role;
ALTER TABLE public.bm_brand_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own brands" ON public.bm_brand_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_bm_brand_profiles_updated BEFORE UPDATE ON public.bm_brand_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ BRAND TEMPLATES (starter, read-only) ============
CREATE TABLE public.bm_brand_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bm_brand_templates TO authenticated;
GRANT ALL ON public.bm_brand_templates TO service_role;
ALTER TABLE public.bm_brand_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read templates" ON public.bm_brand_templates FOR SELECT TO authenticated USING (true);

INSERT INTO public.bm_brand_templates(slug,name,description,data) VALUES
('lets-roll','Let''s Roll','Premium accessible Bangladesh lifestyle brand', '{"target_country":"Bangladesh","tone":"premium","language_ratio":60,"emoji_density":"minimal","currency":"BDT","cod_available":true,"brand_colors":["#000000","#FF6A00"],"naming_style":"lifestyle","ad_style":"authoritative"}'::jsonb),
('tarrique-mitoire','Tarrique & Mitoire','Editorial luxury fashion house', '{"tone":"editorial","language_ratio":40,"emoji_density":"none","currency":"BDT","naming_style":"luxury","brand_colors":["#111111","#D4AF37"]}'::jsonb),
('custom','Custom Brand','Blank canvas — configure everything yourself', '{}'::jsonb);

-- ============ PRODUCT PROJECTS ============
CREATE TABLE public.bm_product_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.bm_brand_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Product',
  raw_title TEXT,
  supplier_description TEXT,
  category TEXT,
  product_type TEXT,
  material TEXT,
  fabric_composition TEXT,
  colors JSONB DEFAULT '[]'::jsonb,
  sizes JSONB DEFAULT '[]'::jsonb,
  dimensions TEXT,
  weight_range TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  landed_cost NUMERIC,
  selling_price NUMERIC,
  currency TEXT DEFAULT 'BDT',
  delivery_time TEXT,
  preorder BOOLEAN DEFAULT false,
  cod_available BOOLEAN DEFAULT true,
  advance_payment TEXT,
  target_customer TEXT,
  target_age TEXT,
  target_market TEXT,
  positioning TEXT,
  competitor_info TEXT,
  user_notes TEXT,
  special_instructions TEXT,
  status bm_project_status NOT NULL DEFAULT 'draft',
  current_step INTEGER NOT NULL DEFAULT 1,
  completion_pct INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bm_product_projects TO authenticated;
GRANT ALL ON public.bm_product_projects TO service_role;
ALTER TABLE public.bm_product_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own projects" ON public.bm_product_projects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_bm_projects_updated BEFORE UPDATE ON public.bm_product_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_bm_projects_user ON public.bm_product_projects(user_id, updated_at DESC);

-- ============ PRODUCT ASSETS ============
CREATE TABLE public.bm_product_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.bm_product_projects(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  label TEXT,
  role bm_asset_role NOT NULL DEFAULT 'additional',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bm_product_assets TO authenticated;
GRANT ALL ON public.bm_product_assets TO service_role;
ALTER TABLE public.bm_product_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own assets" ON public.bm_product_assets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_bm_assets_project ON public.bm_product_assets(project_id, sort_order);

-- ============ ANALYSIS ============
CREATE TABLE public.bm_product_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.bm_product_projects(id) ON DELETE CASCADE,
  analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  confirmed_by_user BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bm_product_analysis TO authenticated;
GRANT ALL ON public.bm_product_analysis TO service_role;
ALTER TABLE public.bm_product_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own analysis" ON public.bm_product_analysis FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_bm_analysis_updated BEFORE UPDATE ON public.bm_product_analysis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ NAME OPTIONS ============
CREATE TABLE public.bm_name_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.bm_product_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subtitle TEXT,
  naming_style TEXT,
  rationale TEXT,
  positioning TEXT,
  confidence NUMERIC,
  is_selected BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bm_name_options TO authenticated;
GRANT ALL ON public.bm_name_options TO service_role;
ALTER TABLE public.bm_name_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own names" ON public.bm_name_options FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_bm_names_project ON public.bm_name_options(project_id);

-- ============ COPY SECTIONS ============
CREATE TABLE public.bm_copy_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.bm_product_projects(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL, -- short_desc, full_desc, tags, seo_title, seo_meta, benefits, specs, size_fit, delivery, faq, reviews, ending, ad_primary, ad_headline, ad_description, reel_hook, reel_text
  content TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, section_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bm_copy_sections TO authenticated;
GRANT ALL ON public.bm_copy_sections TO service_role;
ALTER TABLE public.bm_copy_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own copy" ON public.bm_copy_sections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_bm_copy_updated BEFORE UPDATE ON public.bm_copy_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.bm_copy_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES public.bm_copy_sections(id) ON DELETE CASCADE,
  content TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bm_copy_versions TO authenticated;
GRANT ALL ON public.bm_copy_versions TO service_role;
ALTER TABLE public.bm_copy_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own copy versions" ON public.bm_copy_versions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ CREATIVE STRATEGY ============
CREATE TABLE public.bm_creative_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.bm_product_projects(id) ON DELETE CASCADE,
  strategy JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bm_creative_strategies TO authenticated;
GRANT ALL ON public.bm_creative_strategies TO service_role;
ALTER TABLE public.bm_creative_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own strategy" ON public.bm_creative_strategies FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_bm_strategy_updated BEFORE UPDATE ON public.bm_creative_strategies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.bm_creative_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.bm_product_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  purpose TEXT,
  placement TEXT,
  objection TEXT,
  emotion TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bm_creative_concepts TO authenticated;
GRANT ALL ON public.bm_creative_concepts TO service_role;
ALTER TABLE public.bm_creative_concepts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own concepts" ON public.bm_creative_concepts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ PROMPT PRESETS ============
CREATE TABLE public.bm_prompt_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = global/system preset
  name TEXT NOT NULL,
  category TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bm_prompt_presets TO authenticated;
GRANT ALL ON public.bm_prompt_presets TO service_role;
ALTER TABLE public.bm_prompt_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read presets" ON public.bm_prompt_presets FOR SELECT TO authenticated USING (is_system = true OR auth.uid() = user_id);
CREATE POLICY "own presets write" ON public.bm_prompt_presets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND is_system = false);
CREATE POLICY "own presets update" ON public.bm_prompt_presets FOR UPDATE TO authenticated USING (auth.uid() = user_id AND is_system = false);
CREATE POLICY "own presets delete" ON public.bm_prompt_presets FOR DELETE TO authenticated USING (auth.uid() = user_id AND is_system = false);

-- ============ IMAGE PROMPTS ============
CREATE TABLE public.bm_image_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.bm_product_projects(id) ON DELETE CASCADE,
  concept_id UUID REFERENCES public.bm_creative_concepts(id) ON DELETE SET NULL,
  title TEXT,
  format TEXT,
  width INTEGER,
  height INTEGER,
  locks JSONB DEFAULT '{}'::jsonb,
  prompt_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status bm_prompt_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bm_image_prompts TO authenticated;
GRANT ALL ON public.bm_image_prompts TO service_role;
ALTER TABLE public.bm_image_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prompts" ON public.bm_image_prompts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_bm_prompts_updated BEFORE UPDATE ON public.bm_image_prompts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.bm_prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES public.bm_image_prompts(id) ON DELETE CASCADE,
  prompt_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bm_prompt_versions TO authenticated;
GRANT ALL ON public.bm_prompt_versions TO service_role;
ALTER TABLE public.bm_prompt_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prompt versions" ON public.bm_prompt_versions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ GENERATION ============
CREATE TABLE public.bm_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES public.bm_image_prompts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bm_generation_jobs TO authenticated;
GRANT ALL ON public.bm_generation_jobs TO service_role;
ALTER TABLE public.bm_generation_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own jobs" ON public.bm_generation_jobs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_bm_jobs_updated BEFORE UPDATE ON public.bm_generation_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.bm_generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.bm_product_projects(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES public.bm_image_prompts(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.bm_generation_jobs(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  is_final BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bm_generated_images TO authenticated;
GRANT ALL ON public.bm_generated_images TO service_role;
ALTER TABLE public.bm_generated_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own generated" ON public.bm_generated_images FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ PACKAGES ============
CREATE TABLE public.bm_product_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.bm_product_projects(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bm_product_packages TO authenticated;
GRANT ALL ON public.bm_product_packages TO service_role;
ALTER TABLE public.bm_product_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own packages" ON public.bm_product_packages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_bm_packages_updated BEFORE UPDATE ON public.bm_product_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
