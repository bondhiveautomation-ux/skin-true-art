import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BMLayout } from "@/components/business-machine/BMLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { bm } from "@/lib/bm/api";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "@/components/business-machine/ImageUploader";
import { Loader2, Save, Sparkles, Lock, Unlock, Copy, Wand2, Check, RotateCcw, ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "input", label: "Input" },
  { key: "analysis", label: "AI Analysis" },
  { key: "identity", label: "Identity" },
  { key: "copy", label: "Shopify Copy" },
  { key: "creative", label: "Creative" },
  { key: "prompts", label: "Prompts" },
  { key: "generate", label: "Generate" },
  { key: "package", label: "Package" },
];

const COPY_SECTIONS = [
  { key: "short_desc", label: "Short Description" },
  { key: "full_desc", label: "Full Description" },
  { key: "benefits", label: "Key Benefits" },
  { key: "specs", label: "Specifications" },
  { key: "size_fit", label: "Size & Fit" },
  { key: "delivery", label: "Delivery & Payment" },
  { key: "tags", label: "Shopify Tags" },
  { key: "seo_title", label: "SEO Title" },
  { key: "seo_meta", label: "SEO Meta Description" },
  { key: "faq", label: "FAQ" },
  { key: "ending", label: "Ending Statement" },
  { key: "ad_primary", label: "Ad — Primary Text" },
  { key: "ad_headline", label: "Ad — Headline" },
  { key: "reel_hook", label: "Reel Hook" },
];

export default function BMProduct() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);

  const [project, setProject] = useState<any>(null);
  const [brand, setBrand] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [names, setNames] = useState<any[]>([]);
  const [copy, setCopy] = useState<any[]>([]);

  const [busy, setBusy] = useState<string | null>(null);
  const [langRatio, setLangRatio] = useState(50);
  const [tone, setTone] = useState("premium");
  const [length, setLength] = useState("medium");
  const [emojiDensity, setEmojiDensity] = useState("minimal");

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const p = await bm.getProject(id);
      if (!p) {
        toast({ title: "Not found", variant: "destructive" });
        navigate("/business-machine");
        return;
      }
      setProject(p);
      setStep(Math.max(0, (p.current_step || 1) - 1));
      const [a, an, nm, cp, br] = await Promise.all([
        bm.listAssets(id),
        bm.getAnalysis(id),
        bm.listNames(id),
        bm.listCopy(id),
        p.brand_id ? bm.getBrand(p.brand_id) : Promise.resolve(null),
      ]);
      setAssets(a);
      setAnalysis(an);
      setNames(nm);
      setCopy(cp);
      setBrand(br);
      if (br) {
        setLangRatio(br.language_ratio ?? 50);
        setTone(br.tone ?? "premium");
        setEmojiDensity(br.emoji_density ?? "minimal");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const patch = (k: string, v: any) => setProject((p: any) => ({ ...p, [k]: v }));

  const saveProject = async (extra: any = {}) => {
    if (!project) return;
    setSaving(true);
    try {
      const p = await bm.updateProject(project.id, { ...extra, ...projectDiff() });
      setProject(p);
    } finally {
      setSaving(false);
    }
  };

  // capture editable fields
  const projectDiff = () => {
    if (!project) return {};
    const {
      id: _id, user_id, brand_id, created_at, updated_at,
      ...rest
    } = project;
    return rest;
  };

  const goStep = async (i: number) => {
    setStep(i);
    if (project && i + 1 > (project.current_step || 1)) {
      await bm.updateProject(project.id, { current_step: i + 1, completion_pct: Math.round(((i + 1) / STEPS.length) * 100) });
    }
  };

  const selectedName = useMemo(() => names.find((n) => n.is_selected), [names]);

  // -------- AI calls --------
  const call = async (name: string, body: any) => {
    const { data, error } = await supabase.functions.invoke(name, { body });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const runAnalysis = async () => {
    if (!project) return;
    setBusy("analysis");
    try {
      const imgs = assets.slice(0, 6).map((a) => a.public_url);
      const data = await call("bm-analyze-product", {
        project: projectDiff(),
        brand,
        images: imgs,
      });
      await bm.upsertAnalysis({ user_id: user!.id, project_id: project.id, analysis: data.analysis });
      setAnalysis({ analysis: data.analysis });
      toast({ title: "Analysis complete" });
    } catch (e: any) {
      toast({ title: "Analysis failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const runNames = async (style?: string) => {
    if (!project) return;
    setBusy("names");
    try {
      const data = await call("bm-generate-names", {
        project: projectDiff(),
        brand,
        analysis: analysis?.analysis,
        naming_style: style || brand?.naming_style,
      });
      const rows = (data.names || []).map((n: any) => ({
        user_id: user!.id,
        project_id: project.id,
        name: n.name,
        subtitle: n.subtitle,
        naming_style: n.style,
        rationale: n.rationale,
        positioning: n.positioning,
        confidence: n.confidence,
      }));
      const created = await bm.addNames(rows);
      setNames([...created, ...names]);
      toast({ title: `${created.length} names generated` });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const lockName = async (n: any) => {
    await bm.selectName(project.id, n.id);
    const nm = await bm.listNames(project.id);
    setNames(nm);
    await bm.updateProject(project.id, { title: n.name });
    setProject((p: any) => ({ ...p, title: n.name }));
    toast({ title: "Product name locked" });
  };

  const genCopy = async (sectionKey: string, instructions?: string) => {
    if (!project || !selectedName) {
      return toast({ title: "Lock a product name first", variant: "destructive" });
    }
    setBusy(`copy:${sectionKey}`);
    try {
      const existing = copy.find((c) => c.section_key === sectionKey);
      if (existing?.is_locked) {
        toast({ title: "This section is locked" });
        return;
      }
      const data = await call("bm-generate-copy", {
        section: sectionKey,
        project: projectDiff(),
        brand,
        analysis: analysis?.analysis,
        product_name: selectedName.name,
        language_ratio: langRatio,
        tone,
        length,
        emoji_density: emojiDensity,
        current_content: existing?.content,
        instructions,
      });
      const saved = await bm.upsertCopy(user!.id, project.id, sectionKey, data.content, data.meta || {});
      setCopy((c) => {
        const others = c.filter((x) => x.section_key !== sectionKey);
        return [...others, saved];
      });
      toast({ title: "Generated" });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const updateCopyContent = async (sectionKey: string, content: string) => {
    const saved = await bm.upsertCopy(user!.id, project.id, sectionKey, content, {});
    setCopy((c) => {
      const others = c.filter((x) => x.section_key !== sectionKey);
      return [...others, saved];
    });
  };

  if (loading || !project) {
    return <BMLayout><div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div></BMLayout>;
  }

  return (
    <BMLayout title={project.title || "Untitled Product"} subtitle={brand?.name ? `Brand: ${brand.name}` : "No brand linked"} showBack>
      {/* Step progress */}
      <div className="glass-card p-3 rounded-2xl border border-primary/15 mb-4 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => goStep(i)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors whitespace-nowrap",
                step === i ? "bg-primary/15 text-primary" : i < step ? "text-cream/80 hover:bg-primary/5" : "text-cream/40 hover:bg-primary/5"
              )}
            >
              <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold", step === i ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/40 text-primary-foreground" : "bg-cream/10")}>
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* STEP CONTENT */}
      {step === 0 && (
        <div className="space-y-4">
          <Card title="Product Images (up to 12)">
            <ImageUploader projectId={project.id} assets={assets} onChange={() => bm.listAssets(project.id).then(setAssets)} />
          </Card>
          <Card title="Product Information">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Raw Title / Supplier Title">
                <Input value={project.raw_title || ""} onChange={(e) => patch("raw_title", e.target.value)} />
              </Field>
              <Field label="Category">
                <Input value={project.category || ""} onChange={(e) => patch("category", e.target.value)} />
              </Field>
              <Field label="Product Type">
                <Input value={project.product_type || ""} onChange={(e) => patch("product_type", e.target.value)} />
              </Field>
              <Field label="Material">
                <Input value={project.material || ""} onChange={(e) => patch("material", e.target.value)} />
              </Field>
              <Field label="Fabric Composition">
                <Input value={project.fabric_composition || ""} onChange={(e) => patch("fabric_composition", e.target.value)} />
              </Field>
              <Field label="Dimensions">
                <Input value={project.dimensions || ""} onChange={(e) => patch("dimensions", e.target.value)} />
              </Field>
              <Field label="Sizes (comma separated)">
                <Input value={(project.sizes || []).join(", ")} onChange={(e) => patch("sizes", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
              </Field>
              <Field label="Colors (comma separated)">
                <Input value={(project.colors || []).join(", ")} onChange={(e) => patch("colors", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
              </Field>
              <Field label="Landed Cost">
                <Input type="number" value={project.landed_cost || ""} onChange={(e) => patch("landed_cost", parseFloat(e.target.value) || null)} />
              </Field>
              <Field label="Selling Price">
                <Input type="number" value={project.selling_price || ""} onChange={(e) => patch("selling_price", parseFloat(e.target.value) || null)} />
              </Field>
              <Field label="Delivery Time">
                <Input value={project.delivery_time || ""} onChange={(e) => patch("delivery_time", e.target.value)} />
              </Field>
              <Field label="Target Customer">
                <Input value={project.target_customer || ""} onChange={(e) => patch("target_customer", e.target.value)} />
              </Field>
              <div className="flex items-end gap-3">
                <Switch checked={!!project.preorder} onCheckedChange={(v) => patch("preorder", v)} />
                <Label>Pre-order</Label>
              </div>
              <div className="flex items-end gap-3">
                <Switch checked={!!project.cod_available} onCheckedChange={(v) => patch("cod_available", v)} />
                <Label>Cash on Delivery</Label>
              </div>
            </div>
            <Field label="Supplier Description / Raw Notes">
              <Textarea rows={4} value={project.supplier_description || ""} onChange={(e) => patch("supplier_description", e.target.value)} />
            </Field>
            <Field label="Special Instructions for AI">
              <Textarea rows={3} value={project.special_instructions || ""} onChange={(e) => patch("special_instructions", e.target.value)} placeholder="Mention built-in chest padding, do not mention delivery, etc." />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => saveProject()} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save
              </Button>
              <Button variant="gold" className="btn-glow" onClick={async () => { await saveProject(); goStep(1); }}>
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {step === 1 && (
        <Card title="AI Product Analysis" action={
          <Button size="sm" variant="gold" onClick={runAnalysis} disabled={busy === "analysis" || !assets.length}>
            {busy === "analysis" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {analysis ? "Regenerate" : "Analyze"}
          </Button>
        }>
          {!assets.length ? (
            <p className="text-cream/60 text-sm">Upload product images first in Step 1.</p>
          ) : !analysis ? (
            <p className="text-cream/60 text-sm">Click Analyze to run AI product analysis. This blends your inputs with what the AI sees in the images.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(analysis.analysis || {}).map(([k, v]: any) => (
                <div key={k} className="p-3 rounded-xl bg-charcoal/40 border border-primary/10">
                  <div className="text-[10px] uppercase tracking-widest text-primary/80 mb-1">{k.replaceAll("_", " ")}</div>
                  <div className="text-sm text-cream/90 whitespace-pre-wrap">{typeof v === "string" ? v : JSON.stringify(v, null, 2)}</div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => goStep(0)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
            <Button variant="gold" onClick={() => goStep(2)}>Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card title="Product Identity — Name Generator" action={
          <Button size="sm" variant="gold" onClick={() => runNames()} disabled={busy === "names"}>
            {busy === "names" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
            Generate Names
          </Button>
        }>
          {!names.length ? (
            <p className="text-cream/60 text-sm">Generate 5-10 premium name options. Pick one and lock it as your final product name.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {names.map((n) => (
                <div key={n.id} className={cn("p-4 rounded-xl border transition-all", n.is_selected ? "border-primary bg-primary/5" : "border-primary/15 bg-charcoal/40")}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <div className="font-serif text-cream text-lg">{n.name}</div>
                      {n.subtitle && <div className="text-xs text-cream/60 italic">{n.subtitle}</div>}
                    </div>
                    {n.naming_style && <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary/80 whitespace-nowrap">{n.naming_style}</span>}
                  </div>
                  {n.rationale && <p className="text-xs text-cream/60 mt-2 line-clamp-3">{n.rationale}</p>}
                  <div className="flex items-center gap-2 mt-3">
                    <Button size="sm" variant={n.is_selected ? "gold" : "outline"} onClick={() => lockName(n)}>
                      {n.is_selected ? <><Lock className="w-3 h-3 mr-1" /> Locked</> : "Select & Lock"}
                    </Button>
                    <button onClick={() => bm.deleteName(n.id).then(() => setNames((x) => x.filter((y) => y.id !== n.id)))} className="text-xs text-cream/50 hover:text-destructive">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => goStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
            <Button variant="gold" onClick={() => goStep(3)} disabled={!selectedName}>Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Card title="Language & Tone Controls">
            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["premium", "authoritative", "soft", "emotional", "minimal", "editorial", "friendly", "luxury", "playful", "family"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["very_short", "short", "medium", "detailed"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Emoji Density</Label>
                <Select value={emojiDensity} onValueChange={setEmojiDensity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["none", "minimal", "balanced", "expressive"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Bangla {langRatio}%</Label>
                <Slider value={[langRatio]} min={0} max={100} step={5} onValueChange={([v]) => setLangRatio(v)} />
              </div>
            </div>
          </Card>

          {COPY_SECTIONS.map((s) => {
            const c = copy.find((x) => x.section_key === s.key);
            return (
              <CopyCard
                key={s.key}
                section={s}
                data={c}
                busy={busy === `copy:${s.key}`}
                canGenerate={!!selectedName}
                onGenerate={(instructions) => genCopy(s.key, instructions)}
                onEdit={(v) => updateCopyContent(s.key, v)}
                onToggleLock={async () => { if (c) { await bm.setCopyLock(c.id, !c.is_locked); setCopy(await bm.listCopy(project.id)); } }}
              />
            );
          })}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => goStep(2)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
            <Button variant="gold" onClick={() => goStep(4)}>Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>
        </div>
      )}

      {step >= 4 && (
        <Card title={STEPS[step].label}>
          <div className="py-8 text-center">
            <Sparkles className="w-10 h-10 text-primary/40 mx-auto mb-3" />
            <p className="text-cream/70 font-serif text-lg mb-1">{STEPS[step].label} — Coming in Phase 2</p>
            <p className="text-sm text-cream/50 max-w-md mx-auto">
              Creative Strategy, JSON Prompt Studio, Image Generation, and Final Package are queued in the next Business Machine release.
              Everything you've saved so far persists.
            </p>
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => goStep(step - 1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
            {step < STEPS.length - 1 && <Button variant="gold" onClick={() => goStep(step + 1)}>Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>}
          </div>
        </Card>
      )}
    </BMLayout>
  );
}

function Card({ title, children, action }: any) {
  return (
    <div className="glass-card p-4 sm:p-6 rounded-2xl border border-primary/15">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="font-serif text-lg text-cream">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function CopyCard({ section, data, busy, canGenerate, onGenerate, onEdit, onToggleLock }: any) {
  const [open, setOpen] = useState(false);
  const [instructions, setInstructions] = useState("");
  const has = !!data?.content;
  return (
    <div className="glass-card p-4 rounded-2xl border border-primary/15">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={() => setOpen((o) => !o)} className="text-cream/70 hover:text-primary">
            <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
          </button>
          <h3 className="font-serif text-cream">{section.label}</h3>
          {data?.is_locked && <Lock className="w-3.5 h-3.5 text-primary" />}
          {has && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80">Generated</span>}
        </div>
        <div className="flex items-center gap-2">
          {has && (
            <button onClick={() => { navigator.clipboard.writeText(data.content); toast({ title: "Copied" }); }} className="p-1.5 rounded-lg hover:bg-primary/10 text-cream/70 hover:text-primary">
              <Copy className="w-4 h-4" />
            </button>
          )}
          {data && (
            <button onClick={onToggleLock} className="p-1.5 rounded-lg hover:bg-primary/10 text-cream/70 hover:text-primary">
              {data.is_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>
          )}
          <Button size="sm" variant={has ? "outline" : "gold"} disabled={busy || !canGenerate || data?.is_locked} onClick={() => onGenerate(instructions || undefined)}>
            {busy ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : has ? <RotateCcw className="w-3.5 h-3.5 mr-1" /> : <Wand2 className="w-3.5 h-3.5 mr-1" />}
            {has ? "Regenerate" : "Generate"}
          </Button>
        </div>
      </div>
      {open && (
        <div className="mt-3 space-y-2">
          {has && (
            <Textarea
              rows={6}
              value={data.content}
              onChange={(e) => onEdit(e.target.value)}
              disabled={data.is_locked}
              className="font-mono text-sm"
            />
          )}
          <Input
            placeholder="Custom instructions (e.g. 'Make it more premium', 'Use less English')"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
