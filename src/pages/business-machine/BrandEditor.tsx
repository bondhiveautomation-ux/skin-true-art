import { useEffect, useState } from "react";
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
import { Loader2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const TONES = ["premium", "authoritative", "soft", "emotional", "minimal", "editorial", "friendly", "luxury", "playful", "family"];
const EMOJI = ["none", "minimal", "balanced", "expressive"];
const LANGS = ["bangla", "english", "mixed"];
const NAMING = ["luxury", "minimal", "feminine", "modern", "editorial", "youthful", "traditional-modern", "bold", "lifestyle", "jewellery", "beauty", "children", "electronics"];

const BLANK = {
  name: "",
  description: "",
  target_country: "Bangladesh",
  target_customer: "",
  personality: "",
  preferred_language: "mixed",
  language_ratio: 50,
  tone: "premium",
  emoji_density: "minimal",
  currency: "BDT",
  shipping_policy: "",
  cod_available: true,
  preorder_policy: "",
  standard_delivery_time: "",
  standard_cta: "",
  preferred_aesthetic: "",
  preferred_dimensions: "1080x1080",
  ad_style: "",
  naming_style: "",
  custom_ai_instructions: "",
};

export default function BMBrandEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isNew = !id || id === "new";
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(BLANK);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      setLoading(true);
      const b = await bm.getBrand(id!);
      if (b) setForm(b);
      setLoading(false);
    })();
  }, [id, isNew]);

  const patch = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!user) return;
    if (!form.name?.trim()) return toast({ title: "Name required", variant: "destructive" });
    setSaving(true);
    try {
      const payload = { ...form, user_id: user.id };
      if (isNew) delete payload.id;
      const saved = await bm.upsertBrand(payload);
      toast({ title: "Saved" });
      navigate(`/business-machine/brands/${saved.id}`, { replace: true });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <BMLayout><div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div></BMLayout>;

  return (
    <BMLayout title={isNew ? "New Brand" : form.name || "Edit Brand"} showBack>
      <div className="glass-card p-4 sm:p-6 rounded-2xl border border-primary/15 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Brand Name</Label>
            <Input value={form.name || ""} onChange={(e) => patch("name", e.target.value)} placeholder="Let's Roll" />
          </div>
          <div>
            <Label>Target Country</Label>
            <Input value={form.target_country || ""} onChange={(e) => patch("target_country", e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Brand Description</Label>
          <Textarea rows={3} value={form.description || ""} onChange={(e) => patch("description", e.target.value)} placeholder="What this brand stands for..." />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Target Customer</Label>
            <Input value={form.target_customer || ""} onChange={(e) => patch("target_customer", e.target.value)} placeholder="Young women 22-35 in Dhaka" />
          </div>
          <div>
            <Label>Brand Personality</Label>
            <Input value={form.personality || ""} onChange={(e) => patch("personality", e.target.value)} placeholder="Confident, warm, aspirational" />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label>Preferred Language</Label>
            <Select value={form.preferred_language} onValueChange={(v) => patch("preferred_language", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LANGS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tone</Label>
            <Select value={form.tone} onValueChange={(v) => patch("tone", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TONES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Emoji Density</Label>
            <Select value={form.emoji_density} onValueChange={(v) => patch("emoji_density", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{EMOJI.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Bangla ↔ English Ratio ({form.language_ratio}% Bangla)</Label>
          <Slider value={[form.language_ratio]} min={0} max={100} step={5} onValueChange={([v]) => patch("language_ratio", v)} />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label>Currency</Label>
            <Input value={form.currency || ""} onChange={(e) => patch("currency", e.target.value)} />
          </div>
          <div>
            <Label>Delivery Time</Label>
            <Input value={form.standard_delivery_time || ""} onChange={(e) => patch("standard_delivery_time", e.target.value)} placeholder="3-5 days" />
          </div>
          <div className="flex items-end gap-3">
            <Switch checked={form.cod_available} onCheckedChange={(v) => patch("cod_available", v)} />
            <Label>Cash on Delivery</Label>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Standard CTA</Label>
            <Input value={form.standard_cta || ""} onChange={(e) => patch("standard_cta", e.target.value)} placeholder="অর্ডার করুন এখনই" />
          </div>
          <div>
            <Label>Preferred Dimensions</Label>
            <Input value={form.preferred_dimensions || ""} onChange={(e) => patch("preferred_dimensions", e.target.value)} placeholder="1080x1080" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Naming Style</Label>
            <Select value={form.naming_style || ""} onValueChange={(v) => patch("naming_style", v)}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>{NAMING.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Ad Style</Label>
            <Input value={form.ad_style || ""} onChange={(e) => patch("ad_style", e.target.value)} placeholder="authoritative, no fake urgency" />
          </div>
        </div>

        <div>
          <Label>Custom AI Instructions</Label>
          <Textarea rows={4} value={form.custom_ai_instructions || ""} onChange={(e) => patch("custom_ai_instructions", e.target.value)} placeholder="Always mention no advance payment. Never claim health benefits..." />
        </div>

        <div>
          <Label>Preferred Aesthetic</Label>
          <Textarea rows={2} value={form.preferred_aesthetic || ""} onChange={(e) => patch("preferred_aesthetic", e.target.value)} placeholder="Dark luxury, minimal props, natural window light" />
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={save} disabled={saving} variant="gold" className="btn-glow">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Brand
          </Button>
        </div>
      </div>
    </BMLayout>
  );
}
