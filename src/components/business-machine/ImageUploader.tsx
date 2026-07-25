import { useRef, useState } from "react";
import { uploadProjectAsset, bm } from "@/lib/bm/api";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Upload, Trash2, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROLES = ["primary", "additional", "identity", "garment", "packaging", "size_chart", "other"];

export function ImageUploader({ projectId, assets, onChange }: { projectId: string; assets: any[]; onChange: () => void }) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList) => {
    if (!user) return;
    if (assets.length + files.length > 12) {
      toast({ title: "Max 12 images", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      for (const f of Array.from(files)) {
        const { path, url } = await uploadProjectAsset(user.id, projectId, f);
        const isFirst = assets.length === 0;
        await bm.addAsset({
          user_id: user.id,
          project_id: projectId,
          storage_path: path,
          public_url: url,
          role: isFirst ? "primary" : "additional",
          sort_order: assets.length,
        });
      }
      onChange();
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const setRole = async (a: any, role: string) => {
    await bm.updateAsset(a.id, { role });
    onChange();
  };

  const remove = async (a: any) => {
    await bm.deleteAsset(a.id, a.storage_path);
    onChange();
  };

  const setPrimary = async (a: any) => {
    for (const other of assets.filter((x) => x.role === "primary" && x.id !== a.id)) {
      await bm.updateAsset(other.id, { role: "additional" });
    }
    await bm.updateAsset(a.id, { role: "primary" });
    onChange();
  };

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-primary/25 rounded-2xl p-6 text-center bg-charcoal/30 hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
        ) : (
          <>
            <Upload className="w-8 h-8 text-primary/60 mx-auto mb-2" />
            <p className="text-sm text-cream/70">Drop images or click to upload (up to 12)</p>
            <p className="text-xs text-cream/40 mt-1">{assets.length}/12 uploaded</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {assets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {assets.map((a) => (
            <div key={a.id} className="relative rounded-xl overflow-hidden border border-primary/15 bg-charcoal/40 group">
              <img src={a.public_url} alt="" className="w-full aspect-square object-cover" />
              {a.role === "primary" && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold tracking-wider">Primary</div>
              )}
              <div className="p-2 space-y-1.5">
                <Select value={a.role} onValueChange={(v) => setRole(a, v)}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
                <div className="flex gap-1">
                  <button onClick={() => setPrimary(a)} className="flex-1 flex items-center justify-center gap-1 text-[10px] py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20">
                    <Star className="w-3 h-3" /> Primary
                  </button>
                  <button onClick={() => remove(a)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
