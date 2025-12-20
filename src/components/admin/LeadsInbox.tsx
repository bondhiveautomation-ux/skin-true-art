import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Phone, 
  Store, 
  Calendar, 
  RefreshCw, 
  MessageCircle,
  CheckCircle2,
  Clock,
  Users,
  Loader2,
  Save
} from "lucide-react";
import { format } from "date-fns";

interface Lead {
  id: string;
  whatsapp_number: string;
  business_page_name: string;
  program: string;
  business_category: string | null;
  monthly_ad_spend: string | null;
  status: "new" | "contacted" | "enrolled";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const LeadsInbox = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProgram, setFilterProgram] = useState<string>("all");

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("class_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads((data as Lead[]) || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateStatus = async (leadId: string, newStatus: "new" | "contacted" | "enrolled") => {
    setUpdating(leadId);
    try {
      const { error } = await supabase
        .from("class_leads")
        .update({ status: newStatus })
        .eq("id", leadId);

      if (error) throw error;

      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));

      toast({
        title: "Status Updated",
        description: `Lead marked as ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const saveNotes = async (leadId: string) => {
    setUpdating(leadId);
    try {
      const { error } = await supabase
        .from("class_leads")
        .update({ admin_notes: notesValue })
        .eq("id", leadId);

      if (error) throw error;

      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, admin_notes: notesValue } : lead
      ));

      setEditingNotes(null);
      toast({
        title: "Notes Saved",
        description: "Admin notes updated successfully",
      });
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Clock className="w-3 h-3 mr-1" /> New</Badge>;
      case "contacted":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><MessageCircle className="w-3 h-3 mr-1" /> Contacted</Badge>;
      case "enrolled":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Enrolled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getProgramLabel = (program: string) => {
    return program === "3_days" ? "3 Days (৳3,000)" : "5 Days (৳5,000)";
  };

  const filteredLeads = leads.filter(lead => {
    if (filterStatus !== "all" && lead.status !== filterStatus) return false;
    if (filterProgram !== "all" && lead.program !== filterProgram) return false;
    return true;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    enrolled: leads.filter(l => l.status === "enrolled").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-cream flex items-center gap-3">
            <Users className="w-6 h-6 text-gold" />
            Class Leads Inbox
          </h2>
          <p className="text-cream/60 mt-1">Manage enrollment requests from CEO Launchpad</p>
        </div>
        <Button onClick={fetchLeads} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-card/50 rounded-xl border border-gold/20">
          <p className="text-cream/60 text-sm">Total Leads</p>
          <p className="text-2xl font-bold text-cream">{stats.total}</p>
        </div>
        <div className="p-4 bg-card/50 rounded-xl border border-blue-500/20">
          <p className="text-blue-400 text-sm">New</p>
          <p className="text-2xl font-bold text-blue-400">{stats.new}</p>
        </div>
        <div className="p-4 bg-card/50 rounded-xl border border-yellow-500/20">
          <p className="text-yellow-400 text-sm">Contacted</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.contacted}</p>
        </div>
        <div className="p-4 bg-card/50 rounded-xl border border-green-500/20">
          <p className="text-green-400 text-sm">Enrolled</p>
          <p className="text-2xl font-bold text-green-400">{stats.enrolled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-secondary/50 border-gold/20 text-cream">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-gold/20">
            <SelectItem value="all" className="text-cream">All Status</SelectItem>
            <SelectItem value="new" className="text-cream">New</SelectItem>
            <SelectItem value="contacted" className="text-cream">Contacted</SelectItem>
            <SelectItem value="enrolled" className="text-cream">Enrolled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterProgram} onValueChange={setFilterProgram}>
          <SelectTrigger className="w-40 bg-secondary/50 border-gold/20 text-cream">
            <SelectValue placeholder="Filter by program" />
          </SelectTrigger>
          <SelectContent className="bg-card border-gold/20">
            <SelectItem value="all" className="text-cream">All Programs</SelectItem>
            <SelectItem value="3_days" className="text-cream">3 Days</SelectItem>
            <SelectItem value="5_days" className="text-cream">5 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card/50 rounded-xl border border-gold/20 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gold/10 hover:bg-transparent">
              <TableHead className="text-cream/70">Date</TableHead>
              <TableHead className="text-cream/70">Program</TableHead>
              <TableHead className="text-cream/70">WhatsApp</TableHead>
              <TableHead className="text-cream/70">Business Page</TableHead>
              <TableHead className="text-cream/70">Category</TableHead>
              <TableHead className="text-cream/70">Status</TableHead>
              <TableHead className="text-cream/70">Notes</TableHead>
              <TableHead className="text-cream/70">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gold" />
                </TableCell>
              </TableRow>
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-cream/50">
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="border-gold/10 hover:bg-gold/5">
                  <TableCell className="text-cream/70 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gold/50" />
                      {format(new Date(lead.created_at), "MMM dd, yyyy")}
                      <span className="text-cream/40">{format(new Date(lead.created_at), "HH:mm")}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={lead.program === "5_days" ? "default" : "secondary"} className={lead.program === "5_days" ? "bg-rose-gold/20 text-rose-gold border-rose-gold/30" : "bg-gold/20 text-gold border-gold/30"}>
                      {getProgramLabel(lead.program)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-cream font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-500" />
                      {lead.whatsapp_number}
                    </div>
                  </TableCell>
                  <TableCell className="text-cream">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-blue-400" />
                      {lead.business_page_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-cream/70 text-sm capitalize">
                    {lead.business_category || "—"}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(lead.status)}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    {editingNotes === lead.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          className="h-8 text-sm bg-secondary/50 border-gold/20 text-cream"
                          placeholder="Add notes..."
                        />
                        <Button 
                          size="sm" 
                          onClick={() => saveNotes(lead.id)}
                          disabled={updating === lead.id}
                        >
                          <Save className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingNotes(lead.id);
                          setNotesValue(lead.admin_notes || "");
                        }}
                        className="text-sm text-cream/50 hover:text-cream truncate block w-full text-left"
                      >
                        {lead.admin_notes || "Click to add notes..."}
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {lead.status !== "contacted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(lead.id, "contacted")}
                          disabled={updating === lead.id}
                          className="text-xs"
                        >
                          {updating === lead.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageCircle className="w-3 h-3 mr-1" />}
                          Contacted
                        </Button>
                      )}
                      {lead.status !== "enrolled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(lead.id, "enrolled")}
                          disabled={updating === lead.id}
                          className="text-xs text-green-400 border-green-500/30 hover:bg-green-500/10"
                        >
                          {updating === lead.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                          Enrolled
                        </Button>
                      )}
                    </div>
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
