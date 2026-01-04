import { useState } from "react";
import { useClasses, ClassItem, ClassFeature } from "@/hooks/useClasses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { 
  Plus, Trash2, Edit2, RefreshCw, Save, GripVertical, X, 
  Zap, Sparkles, Star, Crown, GraduationCap, Loader2
} from "lucide-react";

const ICON_OPTIONS = [
  { value: 'zap', label: 'Zap', icon: Zap },
  { value: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { value: 'star', label: 'Star', icon: Star },
  { value: 'crown', label: 'Crown', icon: Crown },
  { value: 'graduation', label: 'Graduation', icon: GraduationCap },
];

const FEATURE_ICONS = ['target', 'check', 'palette', 'megaphone', 'trending', 'zap', 'star'];

const defaultClass: Omit<ClassItem, 'id'> = {
  badge_text: 'Program',
  duration_text: '3 Days Program',
  title: 'New Program Title',
  features: [],
  days_online: '3 Days Online',
  hours: '6 Hours',
  support_text: 'Long Term Support',
  price: 3000,
  price_label: 'Training Fee',
  bkash_number: '01328845972',
  cta_text: 'Get a Call / Enroll Interest',
  cta_link: null,
  cta_type: 'modal',
  is_popular: false,
  icon_type: 'zap',
  color_theme: 'gold',
  display_order: 0,
  is_active: true,
};

export const ClassesManager = () => {
  const { classes, pageSettings, loading, fetchAll, createClass, updateClass, deleteClass, updatePageSetting } = useClasses();
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Omit<ClassItem, 'id'>>(defaultClass);
  const [saving, setSaving] = useState(false);
  const [editingSettings, setEditingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState(pageSettings);

  const handleSaveClass = async () => {
    setSaving(true);
    let success = false;
    
    if (editingClass) {
      success = await updateClass(editingClass.id, formData);
    } else {
      success = await createClass(formData);
    }
    
    if (success) {
      toast.success(editingClass ? "Class updated!" : "Class created!");
      setEditingClass(null);
      setIsCreating(false);
      setFormData(defaultClass);
    } else {
      toast.error("Failed to save class");
    }
    setSaving(false);
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    const success = await deleteClass(id);
    if (success) {
      toast.success("Class deleted!");
    } else {
      toast.error("Failed to delete class");
    }
  };

  const openEditDialog = (classItem: ClassItem) => {
    setEditingClass(classItem);
    setFormData({
      badge_text: classItem.badge_text,
      duration_text: classItem.duration_text,
      title: classItem.title,
      features: classItem.features,
      days_online: classItem.days_online,
      hours: classItem.hours,
      support_text: classItem.support_text,
      price: classItem.price,
      price_label: classItem.price_label,
      bkash_number: classItem.bkash_number,
      cta_text: classItem.cta_text,
      cta_link: classItem.cta_link,
      cta_type: classItem.cta_type,
      is_popular: classItem.is_popular,
      icon_type: classItem.icon_type,
      color_theme: classItem.color_theme,
      display_order: classItem.display_order,
      is_active: classItem.is_active,
    });
    setIsCreating(true);
  };

  const openCreateDialog = () => {
    setEditingClass(null);
    setFormData({
      ...defaultClass,
      display_order: classes.length,
    });
    setIsCreating(true);
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { title: '', description: '', icon: 'target' }],
    }));
  };

  const updateFeature = (index: number, field: keyof ClassFeature, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? { ...f, [field]: value } : f),
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(settingsForm)) {
      await updatePageSetting(key, value);
    }
    toast.success("Page settings saved!");
    setEditingSettings(false);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif text-cream">Classes Manager</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll}>
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
          <Button size="sm" onClick={openCreateDialog} className="bg-purple-500 hover:bg-purple-600">
            <Plus className="w-4 h-4 mr-2" />Add Class
          </Button>
        </div>
      </div>

      {/* Page Settings */}
      <Accordion type="single" collapsible>
        <AccordionItem value="settings" className="border border-purple-500/20 rounded-xl bg-card/50">
          <AccordionTrigger className="px-4 text-cream hover:text-purple-400">
            Hero Section Settings
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-cream/70">Badge Text</Label>
                <Input 
                  value={settingsForm.hero_badge || pageSettings.hero_badge || ''} 
                  onChange={e => setSettingsForm(prev => ({ ...prev, hero_badge: e.target.value }))}
                  placeholder="BondHive Education"
                />
              </div>
              <div>
                <Label className="text-cream/70">Title Highlight</Label>
                <Input 
                  value={settingsForm.hero_title_highlight || pageSettings.hero_title_highlight || ''} 
                  onChange={e => setSettingsForm(prev => ({ ...prev, hero_title_highlight: e.target.value }))}
                  placeholder="BondHive"
                />
              </div>
              <div>
                <Label className="text-cream/70">Title Suffix</Label>
                <Input 
                  value={settingsForm.hero_title_suffix || pageSettings.hero_title_suffix || ''} 
                  onChange={e => setSettingsForm(prev => ({ ...prev, hero_title_suffix: e.target.value }))}
                  placeholder=" — The CEO Launchpad"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-cream/70">Subtitle (HTML supported)</Label>
                <Textarea 
                  value={settingsForm.hero_subtitle || pageSettings.hero_subtitle || ''} 
                  onChange={e => setSettingsForm(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <Button onClick={handleSaveSettings} disabled={saving} className="bg-purple-500 hover:bg-purple-600">
              <Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Classes List */}
      {classes.length === 0 ? (
        <Card className="border-dashed border-purple-500/30">
          <CardContent className="py-12 text-center">
            <p className="text-cream/50 mb-4">No classes yet. Add your first class!</p>
            <Button onClick={openCreateDialog} className="bg-purple-500 hover:bg-purple-600">
              <Plus className="w-4 h-4 mr-2" />Add Class
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {classes.map((classItem) => (
            <Card key={classItem.id} className={`border ${classItem.is_active ? 'border-purple-500/20' : 'border-red-500/20 opacity-60'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-5 h-5 text-cream/30 mt-1" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                          {classItem.badge_text}
                        </span>
                        {classItem.is_popular && (
                          <span className="text-xs px-2 py-0.5 rounded bg-rose-gold/20 text-rose-gold">
                            Popular
                          </span>
                        )}
                        {!classItem.is_active && (
                          <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                            Inactive
                          </span>
                        )}
                      </div>
                      <h3 className="text-cream font-medium">{classItem.title}</h3>
                      <p className="text-cream/50 text-sm">{classItem.duration_text} • ৳{classItem.price.toLocaleString()}</p>
                      <p className="text-cream/40 text-xs mt-1">{classItem.features.length} features</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(classItem)}>
                      <Edit2 className="w-4 h-4 text-cream/60" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClass(classItem.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-cream">
              {editingClass ? 'Edit Class' : 'Create New Class'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-cream/70">Badge Text</Label>
                <Input 
                  value={formData.badge_text} 
                  onChange={e => setFormData(prev => ({ ...prev, badge_text: e.target.value }))}
                  placeholder="Fast Track"
                />
              </div>
              <div>
                <Label className="text-cream/70">Duration Text</Label>
                <Input 
                  value={formData.duration_text} 
                  onChange={e => setFormData(prev => ({ ...prev, duration_text: e.target.value }))}
                  placeholder="3 Days Program"
                />
              </div>
            </div>

            <div>
              <Label className="text-cream/70">Title</Label>
              <Input 
                value={formData.title} 
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="The 3 Days F-Commerce CEO Fast Track Program"
              />
            </div>

            {/* Features */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-cream/70">Features/Curriculum</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="w-3 h-3 mr-1" />Add
                </Button>
              </div>
              <div className="space-y-3">
                {formData.features.map((feature, idx) => (
                  <div key={idx} className="flex gap-2 items-start p-3 bg-secondary/30 rounded-lg">
                    <Select value={feature.icon} onValueChange={v => updateFeature(idx, 'icon', v)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FEATURE_ICONS.map(icon => (
                          <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex-1 space-y-2">
                      <Input 
                        value={feature.title} 
                        onChange={e => updateFeature(idx, 'title', e.target.value)}
                        placeholder="Feature title"
                      />
                      <Input 
                        value={feature.description} 
                        onChange={e => updateFeature(idx, 'description', e.target.value)}
                        placeholder="Feature description"
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(idx)}>
                      <X className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-cream/70">Days Online</Label>
                <Input 
                  value={formData.days_online} 
                  onChange={e => setFormData(prev => ({ ...prev, days_online: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-cream/70">Hours</Label>
                <Input 
                  value={formData.hours} 
                  onChange={e => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-cream/70">Support Text</Label>
                <Input 
                  value={formData.support_text} 
                  onChange={e => setFormData(prev => ({ ...prev, support_text: e.target.value }))}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-cream/70">Price (BDT)</Label>
                <Input 
                  type="number"
                  value={formData.price} 
                  onChange={e => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label className="text-cream/70">Price Label</Label>
                <Input 
                  value={formData.price_label} 
                  onChange={e => setFormData(prev => ({ ...prev, price_label: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-cream/70">bKash Number</Label>
                <Input 
                  value={formData.bkash_number || ''} 
                  onChange={e => setFormData(prev => ({ ...prev, bkash_number: e.target.value }))}
                />
              </div>
            </div>

            {/* CTA */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-cream/70">CTA Button Text</Label>
                <Input 
                  value={formData.cta_text} 
                  onChange={e => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-cream/70">CTA Type</Label>
                <Select value={formData.cta_type} onValueChange={v => setFormData(prev => ({ ...prev, cta_type: v as ClassItem['cta_type'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modal">Open Modal</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp Link</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="link">External Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(formData.cta_type === 'whatsapp' || formData.cta_type === 'phone' || formData.cta_type === 'link') && (
              <div>
                <Label className="text-cream/70">
                  {formData.cta_type === 'whatsapp' ? 'WhatsApp Number (with country code)' : 
                   formData.cta_type === 'phone' ? 'Phone Number' : 'Link URL'}
                </Label>
                <Input 
                  value={formData.cta_link || ''} 
                  onChange={e => setFormData(prev => ({ ...prev, cta_link: e.target.value }))}
                  placeholder={formData.cta_type === 'whatsapp' ? '+8801234567890' : 
                              formData.cta_type === 'phone' ? '01234567890' : 'https://...'}
                />
              </div>
            )}

            {/* Display Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-cream/70">Icon</Label>
                <Select value={formData.icon_type} onValueChange={v => setFormData(prev => ({ ...prev, icon_type: v as ClassItem['icon_type'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map(opt => (
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
              <div>
                <Label className="text-cream/70">Color Theme</Label>
                <Select value={formData.color_theme} onValueChange={v => setFormData(prev => ({ ...prev, color_theme: v as ClassItem['color_theme'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="rose-gold">Rose Gold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Switch 
                  checked={formData.is_popular} 
                  onCheckedChange={v => setFormData(prev => ({ ...prev, is_popular: v }))}
                />
                <Label className="text-cream/70">Most Popular</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch 
                  checked={formData.is_active} 
                  onCheckedChange={v => setFormData(prev => ({ ...prev, is_active: v }))}
                />
                <Label className="text-cream/70">Active</Label>
              </div>
              <div>
                <Label className="text-cream/70">Display Order</Label>
                <Input 
                  type="number"
                  value={formData.display_order} 
                  onChange={e => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-purple-500/20">
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button onClick={handleSaveClass} disabled={saving} className="bg-purple-500 hover:bg-purple-600">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? 'Saving...' : 'Save Class'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
