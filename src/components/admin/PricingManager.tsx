import { useState } from "react";
import { usePricingConfig, PricingPackage } from "@/hooks/usePricingConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Diamond, Plus, Edit2, Trash2, Loader2, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const PricingManager = () => {
  const { packages, loading, updatePackage, createPackage, deletePackage, fetchPackages } = usePricingConfig();
  const [editingPackage, setEditingPackage] = useState<PricingPackage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    package_key: "",
    package_name: "",
    gems: 100,
    price_bdt: 99,
    is_active: true,
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      package_key: "",
      package_name: "",
      gems: 100,
      price_bdt: 99,
      is_active: true,
      display_order: 0,
    });
    setEditingPackage(null);
    setIsCreating(false);
  };

  const openEditDialog = (pkg: PricingPackage) => {
    setEditingPackage(pkg);
    setFormData({
      package_key: pkg.package_key,
      package_name: pkg.package_name,
      gems: pkg.gems,
      price_bdt: pkg.price_bdt,
      is_active: pkg.is_active,
      display_order: pkg.display_order,
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!formData.package_name || !formData.package_key) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      if (editingPackage) {
        const success = await updatePackage(editingPackage.id, {
          package_name: formData.package_name,
          gems: formData.gems,
          price_bdt: formData.price_bdt,
          is_active: formData.is_active,
          display_order: formData.display_order,
        });
        if (success) {
          toast.success("Package updated successfully");
          resetForm();
        } else {
          toast.error("Failed to update package");
        }
      } else {
        const success = await createPackage(formData);
        if (success) {
          toast.success("Package created successfully");
          resetForm();
        } else {
          toast.error("Failed to create package");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deletePackage(id);
    if (success) {
      toast.success("Package deleted");
    } else {
      toast.error("Failed to delete package");
    }
  };

  const handleQuickUpdate = async (pkg: PricingPackage, field: 'gems' | 'price_bdt', value: number) => {
    const success = await updatePackage(pkg.id, { [field]: value });
    if (success) {
      toast.success(`${field === 'gems' ? 'Gems' : 'Price'} updated`);
    } else {
      toast.error("Failed to update");
    }
  };

  const handleToggleActive = async (pkg: PricingPackage) => {
    const success = await updatePackage(pkg.id, { is_active: !pkg.is_active });
    if (success) {
      toast.success(pkg.is_active ? "Package disabled" : "Package enabled");
    } else {
      toast.error("Failed to update");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-serif text-charcoal flex items-center gap-2">
          <Diamond className="w-5 h-5 text-purple-400" />
          Gem Pricing Manager
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchPackages}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Dialog open={isCreating} onOpenChange={(open) => !open && resetForm()}>
            <DialogTrigger asChild>
              <Button variant="gold" size="sm" onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-1" />
                Add Package
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Package</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Package Key *</Label>
                    <Input
                      placeholder="e.g., 7_day, monthly, topup_small"
                      value={formData.package_key}
                      onChange={(e) => setFormData({ ...formData, package_key: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Display Name *</Label>
                    <Input
                      placeholder="e.g., 7-Day Pack"
                      value={formData.package_name}
                      onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gems</Label>
                    <Input
                      type="number"
                      value={formData.gems}
                      onChange={(e) => setFormData({ ...formData, gems: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (BDT)</Label>
                    <Input
                      type="number"
                      value={formData.price_bdt}
                      onChange={(e) => setFormData({ ...formData, price_bdt: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Package
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Packages Table */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">All Packages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Status</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Gems</TableHead>
                  <TableHead>Price (৳)</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id} className={!pkg.is_active ? "opacity-50" : ""}>
                    <TableCell>
                      <Switch
                        checked={pkg.is_active}
                        onCheckedChange={() => handleToggleActive(pkg)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{pkg.package_name}</p>
                        <p className="text-xs text-muted-foreground">{pkg.package_key}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          className="w-20 h-8 text-sm"
                          defaultValue={pkg.gems}
                          onBlur={(e) => {
                            const newValue = parseInt(e.target.value);
                            if (newValue !== pkg.gems) {
                              handleQuickUpdate(pkg, 'gems', newValue);
                            }
                          }}
                        />
                        <Diamond className="w-4 h-4 text-purple-400" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="w-20 h-8 text-sm"
                        defaultValue={pkg.price_bdt}
                        onBlur={(e) => {
                          const newValue = parseInt(e.target.value);
                          if (newValue !== pkg.price_bdt) {
                            handleQuickUpdate(pkg, 'price_bdt', newValue);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{pkg.display_order}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Dialog open={editingPackage?.id === pkg.id} onOpenChange={(open) => !open && resetForm()}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(pkg)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Package</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Display Name</Label>
                                <Input
                                  value={formData.package_name}
                                  onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Gems</Label>
                                  <Input
                                    type="number"
                                    value={formData.gems}
                                    onChange={(e) => setFormData({ ...formData, gems: parseInt(e.target.value) || 0 })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Price (BDT)</Label>
                                  <Input
                                    type="number"
                                    value={formData.price_bdt}
                                    onChange={(e) => setFormData({ ...formData, price_bdt: parseInt(e.target.value) || 0 })}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Display Order</Label>
                                  <Input
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                  />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                  <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                  />
                                  <Label>Active</Label>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={resetForm}>Cancel</Button>
                              <Button onClick={handleSave} disabled={saving}>
                                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                <Save className="w-4 h-4 mr-1" />
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Package</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{pkg.package_name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(pkg.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-purple-500/5 border-purple-500/20">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-charcoal">Tips:</strong> Use package keys like <code className="bg-muted px-1 rounded">7_day</code>, <code className="bg-muted px-1 rounded">monthly</code>, or <code className="bg-muted px-1 rounded">topup_small</code> to categorize packages. 
            Packages with "day", "weekly", or "monthly" in the key will appear as subscriptions. Packages with "topup" will appear as top-ups.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
