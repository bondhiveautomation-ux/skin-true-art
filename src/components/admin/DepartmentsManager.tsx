import { useState } from "react";
import { useDepartments, Department } from "@/hooks/useDepartments";
import { useToolConfigs } from "@/hooks/useToolConfigs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, GripVertical, FolderOpen } from "lucide-react";
import { TOOLS } from "@/config/tools";

export const DepartmentsManager = () => {
  const { departments, isLoading, createDepartment, updateDepartment, deleteDepartment, assignToolToDepartment } = useDepartments();
  const { toolConfigs } = useToolConfigs();
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bangla_name: "",
    description: "",
    display_order: 0,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({ name: "", bangla_name: "", description: "", display_order: 0, is_active: true });
    setEditingDept(null);
  };

  const handleCreate = async () => {
    await createDepartment.mutateAsync(formData);
    resetForm();
    setIsCreateOpen(false);
  };

  const handleUpdate = async () => {
    if (!editingDept) return;
    await updateDepartment.mutateAsync({ id: editingDept.id, ...formData });
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this department? Tools will become unassigned.")) {
      await deleteDepartment.mutateAsync(id);
    }
  };

  const startEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      bangla_name: dept.bangla_name,
      description: dept.description || "",
      display_order: dept.display_order,
      is_active: dept.is_active,
    });
  };

  const getToolsInDepartment = (deptId: string) => {
    return toolConfigs?.filter(t => (t as any).department_id === deptId) || [];
  };

  const getUnassignedTools = () => {
    return toolConfigs?.filter(t => !(t as any).department_id) || [];
  };

  if (isLoading) return <div className="text-cream/60">Loading departments...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-semibold text-cream">Departments Manager</h2>
          <p className="text-cream/60 text-sm">Organize tools into departments for the dashboard</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-charcoal border-gold/20">
            <DialogHeader>
              <DialogTitle className="text-cream">Create Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-cream/70 text-sm">Name (English)</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Creative Studio"
                  className="bg-charcoal-light border-gold/20"
                />
              </div>
              <div>
                <label className="text-cream/70 text-sm">Name (Bangla)</label>
                <Input
                  value={formData.bangla_name}
                  onChange={(e) => setFormData(p => ({ ...p, bangla_name: e.target.value }))}
                  placeholder="ক্রিয়েটিভ স্টুডিও"
                  className="bg-charcoal-light border-gold/20"
                />
              </div>
              <div>
                <label className="text-cream/70 text-sm">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of this department"
                  className="bg-charcoal-light border-gold/20"
                />
              </div>
              <div>
                <label className="text-cream/70 text-sm">Display Order</label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))}
                  className="bg-charcoal-light border-gold/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(p => ({ ...p, is_active: checked }))}
                />
                <span className="text-cream/70 text-sm">Active</span>
              </div>
              <Button onClick={handleCreate} disabled={!formData.name || !formData.bangla_name} className="w-full">
                Create Department
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Departments List */}
      <div className="space-y-4">
        {departments?.map((dept) => (
          <Card key={dept.id} className="bg-charcoal-light border-gold/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-cream/30" />
                  <div>
                    <CardTitle className="text-cream flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-gold" />
                      {dept.name}
                      <span className="font-bangla text-cream/60 text-sm font-normal">({dept.bangla_name})</span>
                      {!dept.is_active && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                    </CardTitle>
                    <p className="text-cream/50 text-sm mt-1">{dept.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(dept)}
                    className="border-gold/30 text-cream"
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(dept.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-cream/60 text-xs uppercase tracking-wider">Tools in this department:</p>
                <div className="flex flex-wrap gap-2">
                  {getToolsInDepartment(dept.id).map(tool => {
                    const staticTool = TOOLS.find(t => t.id === tool.tool_id);
                    return (
                      <Badge
                        key={tool.id}
                        variant="outline"
                        className="border-gold/30 text-cream bg-charcoal px-3 py-1 flex items-center gap-2"
                      >
                        {staticTool && <staticTool.icon className="w-3 h-3" />}
                        {tool.name}
                        <button
                          onClick={() => assignToolToDepartment.mutate({ toolId: tool.id, departmentId: null })}
                          className="ml-1 text-cream/40 hover:text-red-400"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                  {getToolsInDepartment(dept.id).length === 0 && (
                    <span className="text-cream/40 text-sm italic">No tools assigned</span>
                  )}
                </div>
                
                {/* Add Tool Dropdown */}
                <div className="flex items-center gap-2 mt-3">
                  <Select
                    onValueChange={(toolId) => assignToolToDepartment.mutate({ toolId, departmentId: dept.id })}
                  >
                    <SelectTrigger className="w-[200px] bg-charcoal border-gold/20">
                      <SelectValue placeholder="Add tool..." />
                    </SelectTrigger>
                    <SelectContent className="bg-charcoal border-gold/20 z-50">
                      {getUnassignedTools().map(tool => (
                        <SelectItem key={tool.id} value={tool.id} className="text-cream">
                          {tool.name}
                        </SelectItem>
                      ))}
                      {getUnassignedTools().length === 0 && (
                        <div className="px-2 py-1 text-cream/40 text-sm">All tools assigned</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingDept} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="bg-charcoal border-gold/20">
          <DialogHeader>
            <DialogTitle className="text-cream">Edit Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-cream/70 text-sm">Name (English)</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                className="bg-charcoal-light border-gold/20"
              />
            </div>
            <div>
              <label className="text-cream/70 text-sm">Name (Bangla)</label>
              <Input
                value={formData.bangla_name}
                onChange={(e) => setFormData(p => ({ ...p, bangla_name: e.target.value }))}
                className="bg-charcoal-light border-gold/20"
              />
            </div>
            <div>
              <label className="text-cream/70 text-sm">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                className="bg-charcoal-light border-gold/20"
              />
            </div>
            <div>
              <label className="text-cream/70 text-sm">Display Order</label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))}
                className="bg-charcoal-light border-gold/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(p => ({ ...p, is_active: checked }))}
              />
              <span className="text-cream/70 text-sm">Active</span>
            </div>
            <Button onClick={handleUpdate} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unassigned Tools Section */}
      {getUnassignedTools().length > 0 && (
        <Card className="bg-charcoal-light border-gold/20 border-dashed">
          <CardHeader>
            <CardTitle className="text-cream/70 text-base">Unassigned Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getUnassignedTools().map(tool => {
                const staticTool = TOOLS.find(t => t.id === tool.tool_id);
                return (
                  <Badge
                    key={tool.id}
                    variant="outline"
                    className="border-cream/20 text-cream/60 px-3 py-1"
                  >
                    {staticTool && <staticTool.icon className="w-3 h-3 mr-1" />}
                    {tool.name}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
