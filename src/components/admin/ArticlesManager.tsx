import { useState, useEffect } from "react";
import { useArticles, Article, ArticleInsert } from "@/hooks/useArticles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
  Loader2,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Save,
  BookOpen,
  Camera,
  Palette,
  Wand2,
  Users,
  Lightbulb,
  Sparkles,
  Target,
  Zap
} from "lucide-react";

const ICON_OPTIONS = [
  { value: "BookOpen", label: "Book", icon: BookOpen },
  { value: "Camera", label: "Camera", icon: Camera },
  { value: "Palette", label: "Palette", icon: Palette },
  { value: "Wand2", label: "Wand", icon: Wand2 },
  { value: "Users", label: "Users", icon: Users },
  { value: "Lightbulb", label: "Lightbulb", icon: Lightbulb },
  { value: "Sparkles", label: "Sparkles", icon: Sparkles },
  { value: "Target", label: "Target", icon: Target },
  { value: "Zap", label: "Zap", icon: Zap },
];

const CATEGORY_OPTIONS = [
  "Getting Started",
  "Tutorials",
  "Best Practices",
  "Branding",
  "Workflows",
  "Platform Guide",
  "Tips & Tricks",
  "Case Studies",
];

interface ArticleFormProps {
  article?: Article | null;
  onSave: (data: ArticleInsert) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

const ArticleForm = ({ article, onSave, onClose, saving }: ArticleFormProps) => {
  const [formData, setFormData] = useState<ArticleInsert>({
    title: article?.title || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    category: article?.category || "Getting Started",
    read_time: article?.read_time || "5 min read",
    icon: article?.icon || "BookOpen",
    display_order: article?.display_order || 0,
    is_published: article?.is_published || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.excerpt.trim()) return;
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-cream/70">Title *</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Article title"
            className="bg-charcoal border-gold/20 text-cream"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-cream/70">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger className="bg-charcoal border-gold/20 text-cream">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-cream/70">Excerpt *</Label>
        <Textarea
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          placeholder="Short description shown in article cards"
          className="bg-charcoal border-gold/20 text-cream min-h-[80px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-cream/70">Full Content (Markdown supported)</Label>
        <Textarea
          value={formData.content || ""}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Full article content..."
          className="bg-charcoal border-gold/20 text-cream min-h-[200px]"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-cream/70">Icon</Label>
          <Select
            value={formData.icon}
            onValueChange={(value) => setFormData({ ...formData, icon: value })}
          >
            <SelectTrigger className="bg-charcoal border-gold/20 text-cream">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ICON_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    <opt.icon className="w-4 h-4" />
                    {opt.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-cream/70">Read Time</Label>
          <Input
            value={formData.read_time || ""}
            onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
            placeholder="5 min read"
            className="bg-charcoal border-gold/20 text-cream"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-cream/70">Display Order</Label>
          <Input
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
            className="bg-charcoal border-gold/20 text-cream"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gold/10">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_published}
            onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
            className="data-[state=checked]:bg-gold"
          />
          <Label className="text-cream/70">Published</Label>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onClose} className="text-cream/60">
            Cancel
          </Button>
          <Button type="submit" variant="gold" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {article ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export const ArticlesManager = () => {
  const { articles, loading, fetchArticles, createArticle, updateArticle, deleteArticle, togglePublished } = useArticles();
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchArticles(false); // Fetch all articles for admin
  }, [fetchArticles]);

  const handleCreate = async (data: ArticleInsert) => {
    setSaving(true);
    const success = await createArticle(data);
    if (success) setIsCreateOpen(false);
    setSaving(false);
  };

  const handleUpdate = async (data: ArticleInsert) => {
    if (!editingArticle) return;
    setSaving(true);
    const success = await updateArticle(editingArticle.id, data);
    if (success) setEditingArticle(null);
    setSaving(false);
  };

  const getIconComponent = (iconName: string | null) => {
    const option = ICON_OPTIONS.find((opt) => opt.value === iconName);
    return option ? option.icon : BookOpen;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl text-cream">Knowledge Hub Articles</h2>
          <p className="text-cream/40 text-sm">Manage articles for the Info page</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" className="btn-glow">
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Create New Article</DialogTitle>
            </DialogHeader>
            <ArticleForm
              onSave={handleCreate}
              onClose={() => setIsCreateOpen(false)}
              saving={saving}
            />
          </DialogContent>
        </Dialog>
      </div>

      {articles.length === 0 ? (
        <Card className="bg-charcoal border-gold/15">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-gold/30 mx-auto mb-4" />
            <p className="text-cream/50">No articles yet. Create your first article!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {articles.map((article) => {
            const IconComponent = getIconComponent(article.icon);
            return (
              <Card key={article.id} className="bg-charcoal border-gold/15">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg gold-icon flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-cream truncate">{article.title}</h3>
                        <span className="px-2 py-0.5 text-[10px] font-medium text-gold bg-gold/10 rounded-full">
                          {article.category}
                        </span>
                        {article.is_published ? (
                          <span className="px-2 py-0.5 text-[10px] font-medium text-green-400 bg-green-500/10 rounded-full flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-medium text-cream/40 bg-cream/5 rounded-full flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-cream/50 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-cream/30">
                        <span>{article.read_time}</span>
                        <span>Order: {article.display_order}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublished(article.id, article.is_published)}
                        className="text-cream/50 hover:text-gold"
                      >
                        {article.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Dialog open={editingArticle?.id === article.id} onOpenChange={(open) => !open && setEditingArticle(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingArticle(article)}
                            className="text-cream/50 hover:text-gold"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="font-serif text-xl">Edit Article</DialogTitle>
                          </DialogHeader>
                          <ArticleForm
                            article={editingArticle}
                            onSave={handleUpdate}
                            onClose={() => setEditingArticle(null)}
                            saving={saving}
                          />
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{article.title}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteArticle(article.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
