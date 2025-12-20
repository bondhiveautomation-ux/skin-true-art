import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDressLibrary, Dress } from "@/hooks/useDressLibrary";
import { Loader2, Plus, Trash2, Upload, Eye, EyeOff, ExternalLink } from "lucide-react";

export const DressLibraryManager = () => {
  const {
    dresses,
    loading,
    addDress,
    toggleDressActive,
    deleteDress,
    uploadDressImage,
  } = useDressLibrary();

  const [isAddingDress, setIsAddingDress] = useState(false);
  const [newDressName, setNewDressName] = useState("");
  const [newDressCategory, setNewDressCategory] = useState<"male" | "female" | "kids">("female");
  const [newDressTags, setNewDressTags] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddDress = async () => {
    if (!selectedFile || !newDressName.trim()) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadDressImage(selectedFile);
      if (!imageUrl) return;

      const tags = newDressTags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const success = await addDress(newDressCategory, newDressName.trim(), imageUrl, tags);
      if (success) {
        setNewDressName("");
        setNewDressCategory("female");
        setNewDressTags("");
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsAddingDress(false);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setProcessingId(id);
    await toggleDressActive(id, !currentActive);
    setProcessingId(null);
  };

  const handleDelete = async (id: string) => {
    setProcessingId(id);
    await deleteDress(id);
    setProcessingId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const ImageThumbnail = ({ src, alt }: { src: string; alt: string }) => (
    <Dialog>
      <DialogTrigger asChild>
        <button className="relative group overflow-hidden rounded-lg border border-border hover:border-gold/50 transition-all">
          <img
            src={src}
            alt={alt}
            className="w-16 h-20 object-cover transition-transform group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-charcoal/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <ExternalLink className="w-4 h-4 text-cream" />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{alt}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center">
          <img src={src} alt={alt} className="max-h-[60vh] object-contain rounded-lg" />
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Dress Form */}
      <div className="p-4 rounded-lg border border-gold/10 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium flex items-center gap-2 text-charcoal">
            <Plus className="w-4 h-4 text-gold" />
            Add New Dress
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingDress(!isAddingDress)}
          >
            {isAddingDress ? "Cancel" : "Add Dress"}
          </Button>
        </div>

        {isAddingDress && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={newDressCategory}
                onValueChange={(v) => setNewDressCategory(v as "male" | "female" | "kids")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="kids">Kids</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dress Name *</Label>
              <Input
                placeholder="e.g., Red Bridal Saree"
                value={newDressName}
                onChange={(e) => setNewDressName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input
                placeholder="e.g., wedding, premium, saree"
                value={newDressTags}
                onChange={(e) => setNewDressTags(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Dress Image *</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="text-xs"
                />
                {previewUrl && (
                  <img src={previewUrl} alt="Preview" className="w-10 h-12 object-cover rounded" />
                )}
              </div>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleAddDress}
                disabled={isUploading || !selectedFile || !newDressName.trim()}
                variant="gold"
                className="w-full"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload Dress
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dress Table */}
      <div className="rounded-lg border border-gold/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-card/50">
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dresses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No dresses added yet
                </TableCell>
              </TableRow>
            ) : (
              dresses.map((dress) => (
                <TableRow key={dress.id}>
                  <TableCell>
                    <ImageThumbnail src={dress.image_url} alt={dress.name} />
                  </TableCell>
                  <TableCell className="font-medium">{dress.name}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        dress.category === "female"
                          ? "bg-pink-100 text-pink-700"
                          : dress.category === "male"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {dress.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {dress.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-accent/50 text-muted-foreground text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {dress.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{dress.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={dress.is_active}
                        onCheckedChange={() => handleToggleActive(dress.id, dress.is_active)}
                        disabled={processingId === dress.id}
                      />
                      {dress.is_active ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(dress.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={processingId === dress.id}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Dress</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{dress.name}"? This action cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(dress.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
