## Business Machine — Implementation Plan

A new all-in-one AI e-commerce product creation module inside BH Studio at `/business-machine`, matching the existing dark luxury theme (black + purple/magenta, serif English + Bangla). Built in phases so nothing existing breaks.

---

### 1. Existing architecture found (reused, not touched)

- **Auth**: `AuthProvider` + `ProtectedRoute` (Supabase, gmail/yahoo/outlook whitelist, admin-only signups now locked).
- **Backend**: Lovable Cloud (Supabase). Existing tables for `profiles`, `user_roles`, `user_credits`, `generation_history`, `tool_configs`, `dress_library`, plus storage buckets (`generation-images`, `temp-uploads`, etc.).
- **AI**: Edge functions call Lovable AI Gateway with `LOVABLE_API_KEY` (already set). Image gen uses `google/gemini-3-pro-image-preview` / `gemini-3.1-flash-image`.
- **UI system**: shadcn + Tailwind, semantic tokens in `src/index.css` (gold/cream/purple accents), `ToolPageLayout`, `Navbar`, `MobileNavDrawer`, `GemBalance`, `ProcessingModal`, `UserBadge`.
- **Helpers**: `useGems`, `logGeneration`, `useToolConfigs`, `useSiteContent`, `image.ts` normalization.

### 2. Routes added

- `/business-machine` — Dashboard
- `/business-machine/brands` + `/business-machine/brands/:id`
- `/business-machine/products/new`
- `/business-machine/products/:id` (step wizard: Input → Analysis → Identity → Copy → Creative → Prompts → Generate → Package)
- `/business-machine/presets`

Added link in `Navbar` (desktop dropdown + mobile drawer) as "Business Machine".

### 3. Database changes (one migration)

New tables (all RLS-scoped to `auth.uid()`, with GRANTs to `authenticated` + `service_role`, `updated_at` triggers):

- `bm_brand_profiles` — brand identity, tone, language ratio, currency, COD, colors, custom AI instructions.
- `bm_product_projects` — belongs to brand, holds raw input, status, current_step.
- `bm_product_assets` — uploaded image refs (storage path, label, role: primary/identity/garment/packaging, order).
- `bm_product_analysis` — AI analysis result (confirmed / inferred / user / uncertain).
- `bm_name_options` + `bm_selected_name` (locked final).
- `bm_copy_sections` — one row per section (short_desc, full_desc, tags, seo_title, faq, ads, reel, …) with `is_locked`.
- `bm_copy_versions` — version history per section.
- `bm_creative_strategies` + `bm_creative_concepts` (per-image concept list).
- `bm_prompt_presets` — reusable presets (fashion / jewellery / beauty / electronics / children).
- `bm_image_prompts` — JSON body, dimensions, locks, status (draft/needs_review/approved/generating/generated/final).
- `bm_prompt_versions` — prompt edits history.
- `bm_generation_jobs` + `bm_generated_images` (linked to originating prompt).
- `bm_product_packages` — assembled final export snapshot.

New storage bucket: `business-machine` (private, RLS by `auth.uid()` prefix).

Seed rows: three starter brand templates (Let's Roll, Tarrique & Mitoire, Custom) available to every user as read-only templates via a `bm_brand_templates` table.

### 4. Edge functions added

All server-side, use `LOVABLE_API_KEY`, storage-first payloads (URLs not base64), standardized JSON error envelope, log to `generation_history` via `logGeneration`.

- `bm-analyze-product` — Gemini 2.5 Flash vision + text → structured analysis JSON (confirmed / inferred / uncertain).
- `bm-generate-names` — 5–10 name options with style, subtitle, reasoning, confidence.
- `bm-generate-copy` — one call per section, respects language ratio / tone / length / emoji controls, supports "edit only X" instructions preserving rest.
- `bm-generate-tags` — comma-separated Shopify tags, deduped.
- `bm-generate-creative-strategy` — full campaign + ordered concept list.
- `bm-generate-image-prompt` — produces structured JSON per the schema in the spec, only relevant fields per category, respects active locks.
- `bm-generate-ads` — ad variants (primary/headline/desc/reel/retargeting).
- `bm-generate-image` — provider-agnostic wrapper around existing Gemini image models; stores result, links to prompt, deducts gems, refunds on failure.

Gem costs registered in `feature_gem_costs` for each new feature.

### 5. Reused components

- `ToolPageLayout`, `ProcessingModal`, `GemBalance`, `LowBalanceAlert`, `UserBadge`.
- shadcn `Tabs`, `Accordion`, `Dialog`, `Sheet`, `Command`, `Textarea`, `Slider`, `Switch`, `DropdownMenu`, `Progress`.
- Existing gems / auth / logGeneration hooks.

New shared components under `src/components/business-machine/`:
- `BMLayout` (sidebar + step progress), `BrandCard`, `BrandForm`, `ProductCard`, `ImageUploader` (drag/drop, reorder, role labels), `StepWizard`, `AnalysisPanel`, `NameOptionCard`, `CopySection` (with lock/regenerate/version diff), `LanguageControls`, `CreativeConceptList`, `PromptFormView`, `PromptJsonView` (with monaco-lite / textarea + validation), `FormatSelector`, `PresetGallery`, `LockPanel`, `PromptApprovalDialog`, `GenerationGallery`, `PackageExport`.

### 6. Phasing (single project, shipped incrementally)

**Phase 1** — Foundation, dashboard, brand profiles, product project + image upload, AI analysis, name generator, Copy Studio with language controls + version history.

**Phase 2** — Creative Strategy, JSON Prompt Studio (form + raw), format selector, presets, reference lock system.

**Phase 3** — Prompt approval flow, image generation gallery, final Product Package + exports (JSON / text / Shopify).

Each phase leaves the app fully working; navigation entry and DB schema land in Phase 1 so later phases just fill panels.

### 7. Guardrails

- All new tables RLS `auth.uid() = user_id`, GRANTs included.
- No secrets in client; all model calls in edge functions.
- Gem deduction immediate, auto-refund on failure (existing pattern).
- Storage bucket private; signed URLs for reads.
- No changes to existing routes, tables, or edge functions.
- Preserves identity-lock philosophy already in Core memory.

---

### Kickoff after approval

Phase 1 ships in the first turn: migration + storage bucket + routes + Dashboard + Brand Profiles + New Product + Image Upload + Analysis + Name Generator + Copy Studio. Phases 2 and 3 follow in subsequent turns so you can review each before the next lands.
