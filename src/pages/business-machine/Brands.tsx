import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BMLayout } from "@/components/business-machine/BMLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { bm } from "@/lib/bm/api";
import { Building2, Plus, Loader2, Trash2, Edit3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function BMBrands() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [b, t] = await Promise.all([bm.listBrands(user.id), bm.listBrandTemplates()]);
      setBrands(b);
      setTemplates(t);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const cloneTemplate = async (t: any) => {
    if (!user) return;
    const created = await bm.upsertBrand({
      user_id: user.id,
      name: t.name,
      description: t.description,
      ...t.data,
    });
    toast({ title: "Brand created", description: `${t.name} added to your brands.` });
    navigate(`/business-machine/brands/${created.id}`);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this brand? Products keep their info but lose the brand link.")) return;
    await bm.deleteBrand(id);
    toast({ title: "Deleted" });
    load();
  };

  return (
    <BMLayout title="Brand Profiles" subtitle="Reusable brand identities that drive every AI generation.">
      <div className="mb-6 flex justify-end">
        <Button onClick={() => navigate("/business-machine/brands/new")} variant="gold">
          <Plus className="w-4 h-4 mr-2" /> New Brand
        </Button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-primary/15 mb-6">
            <h2 className="font-serif text-lg text-cream mb-4">Your Brands</h2>
            {brands.length === 0 ? (
              <p className="text-cream/60 text-sm">No brands yet — start from a template below or create your own.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {brands.map((b) => (
                  <div key={b.id} className="p-4 rounded-xl border border-primary/10 bg-charcoal/40 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-serif text-cream truncate">{b.name}</div>
                      <div className="text-xs text-cream/50 mt-0.5 line-clamp-2">{b.description || b.personality || "No description"}</div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {b.tone && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80 uppercase tracking-wider">{b.tone}</span>}
                        {b.currency && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/80">{b.currency}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => navigate(`/business-machine/brands/${b.id}`)} className="p-2 rounded-lg hover:bg-primary/10 text-cream/70 hover:text-primary">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => remove(b.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-cream/70 hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-primary/15">
            <h2 className="font-serif text-lg text-cream mb-4">Starter Templates</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {templates.map((t) => (
                <div key={t.id} className="p-4 rounded-xl border border-primary/10 bg-charcoal/40">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="font-serif text-cream">{t.name}</div>
                  <div className="text-xs text-cream/50 mt-1 mb-3 line-clamp-3">{t.description}</div>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => cloneTemplate(t)}>
                    Use This Template
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </BMLayout>
  );
}
