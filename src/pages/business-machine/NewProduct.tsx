import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BMLayout } from "@/components/business-machine/BMLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { bm } from "@/lib/bm/api";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function BMNewProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [brands, setBrands] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [brandId, setBrandId] = useState<string>("");
  const [category, setCategory] = useState("Fashion");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    bm.listBrands(user.id).then((b) => {
      setBrands(b);
      const def = b.find((x: any) => x.is_default) || b[0];
      if (def) setBrandId(def.id);
    });
  }, [user]);

  const create = async () => {
    if (!user) return;
    if (!title.trim()) return toast({ title: "Product name required", variant: "destructive" });
    setSaving(true);
    try {
      const p = await bm.createProject({
        user_id: user.id,
        title,
        brand_id: brandId || null,
        category,
        status: "draft",
        current_step: 1,
      });
      navigate(`/business-machine/products/${p.id}`);
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <BMLayout title="New Product" subtitle="Kick off a new product project. You can edit everything on the next screen.">
      <div className="glass-card p-4 sm:p-6 rounded-2xl border border-primary/15 space-y-5 max-w-2xl">
        <div>
          <Label>Working Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Autumn Sequin Kurti" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Brand</Label>
            <Select value={brandId} onValueChange={setBrandId}>
              <SelectTrigger><SelectValue placeholder={brands.length ? "Select brand" : "No brands yet"} /></SelectTrigger>
              <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
            </Select>
            {!brands.length && (
              <button onClick={() => navigate("/business-machine/brands")} className="text-xs text-primary mt-1 hover:underline">
                Create a brand first →
              </button>
            )}
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Fashion", "Jewellery", "Beauty", "Electronics", "Children", "Home", "Wellness", "Other"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={create} disabled={saving} variant="gold" className="btn-glow">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Create Product
          </Button>
        </div>
      </div>
    </BMLayout>
  );
}
