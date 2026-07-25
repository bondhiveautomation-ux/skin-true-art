import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BMLayout } from "@/components/business-machine/BMLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { bm } from "@/lib/bm/api";
import { Plus, Package, Building2, Sparkles, Loader2, ArrowRight } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  completed: "Completed",
  archived: "Archived",
};

export default function BMDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const [p, b] = await Promise.all([bm.listProjects(user.id), bm.listBrands(user.id)]);
        setProjects(p);
        setBrands(b);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const stats = [
    { label: "Products", value: projects.length, icon: Package },
    { label: "Brands", value: brands.length, icon: Building2 },
    { label: "Completed", value: projects.filter((p) => p.status === "completed").length, icon: Sparkles },
  ];

  return (
    <BMLayout title="Business Machine" subtitle="AI-powered end-to-end product creation for Shopify.">
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-4 rounded-2xl border border-primary/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-serif text-cream">{s.value}</div>
                <div className="text-xs text-cream/60 uppercase tracking-wider">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={() => navigate("/business-machine/products/new")} variant="gold" className="btn-glow">
          <Plus className="w-4 h-4 mr-2" /> New Product
        </Button>
        <Button onClick={() => navigate("/business-machine/brands")} variant="outline">
          <Building2 className="w-4 h-4 mr-2" /> Manage Brands
        </Button>
      </div>

      <div className="glass-card p-4 sm:p-6 rounded-2xl border border-primary/15">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-cream">Recent Products</h2>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="w-10 h-10 text-primary/40 mx-auto mb-3" />
            <p className="text-cream/60 mb-4">No products yet. Start your first product project.</p>
            <Button onClick={() => navigate("/business-machine/products/new")} variant="gold">
              <Plus className="w-4 h-4 mr-2" /> Create Product
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/business-machine/products/${p.id}`)}
                className="text-left group p-4 rounded-xl border border-primary/10 hover:border-primary/40 bg-charcoal/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="font-serif text-cream truncate">{p.title || "Untitled Product"}</div>
                    <div className="text-xs text-cream/50 mt-0.5">
                      {p.bm_brand_profiles?.name || "No brand"} · {p.category || "Uncategorized"}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-primary/80 px-2 py-1 rounded-full bg-primary/10 whitespace-nowrap">
                    {STATUS_LABEL[p.status] || p.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden mr-3">
                    <div className="h-full bg-primary" style={{ width: `${p.completion_pct || 0}%` }} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-cream/40 group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </BMLayout>
  );
}
