import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  Loader2, 
  Trash2, 
  Plus, 
  Minus, 
  Users, 
  History,
  Diamond,
  RefreshCw,
  UserPlus,
  Image,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Settings2,
  MessageCircle,
  Download,
  Radio,
  Ban,
  CheckCircle,
  Inbox,
  Calendar,
  Clock,
  AlertTriangle,
  X,
  FileText,
  BarChart3,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WebsiteControlCenter } from "@/components/admin/WebsiteControlCenter";
import { PaymentInbox } from "@/components/admin/PaymentInbox";
import { PricingManager } from "@/components/admin/PricingManager";
import { FeatureGemCostsManager } from "@/components/admin/FeatureGemCostsManager";
import LiveUsersMonitor from "@/components/admin/LiveUsersMonitor";
import AdminInbox from "@/components/admin/AdminInbox";
import { ArticlesManager } from "@/components/admin/ArticlesManager";
import { GenerationCounter } from "@/components/admin/GenerationCounter";
import ToolConfigsManager from "@/components/admin/ToolConfigsManager";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading, users, history, updateCredits, deleteUser, deleteHistoryEntry, createUser, toggleBlockUser, setSubscription, clearSubscription, refetchUsers, refetchHistory } = useAdmin();
  const { toast } = useToast();
  const [creditInputs, setCreditInputs] = useState<Record<string, string>>({});
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(null);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("counter");
  const [bulkDeleting, setBulkDeleting] = useState(false);
  
  // New user form state
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        <Button onClick={() => navigate("/")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  const handleAddGems = async (userId: string, amount: number) => {
    const currentUser = users.find(u => u.user_id === userId);
    if (!currentUser) return;
    
    setProcessingUser(userId);
    const newGems = Math.max(0, currentUser.gems + amount);
    const success = await updateCredits(userId, newGems);
    
    if (success) {
      toast({ title: "Gems updated", description: amount > 0 ? `Added ${amount} gems` : `Removed ${Math.abs(amount)} gems` });
    } else {
      toast({ title: "Failed to update gems", variant: "destructive" });
    }
    setProcessingUser(null);
  };

  const handleSetGems = async (userId: string) => {
    const value = creditInputs[userId];
    if (!value) return;
    
    const newGems = parseInt(value, 10);
    if (isNaN(newGems) || newGems < 0) {
      toast({ title: "Invalid gem amount", variant: "destructive" });
      return;
    }

    setProcessingUser(userId);
    const success = await updateCredits(userId, newGems);
    
    if (success) {
      toast({ title: "Gems updated", description: `Set gems to ${newGems}` });
      setCreditInputs(prev => ({ ...prev, [userId]: "" }));
    } else {
      toast({ title: "Failed to update gems", variant: "destructive" });
    }
    setProcessingUser(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user.id) {
      toast({ title: "Cannot delete yourself", variant: "destructive" });
      return;
    }

    setProcessingUser(userId);
    const success = await deleteUser(userId);
    
    if (success) {
      toast({ title: "User deleted successfully" });
    } else {
      toast({ title: "Failed to delete user", variant: "destructive" });
    }
    setProcessingUser(null);
  };

  const handleSetSubscription = async (userId: string, type: string, days: number) => {
    setProcessingUser(userId);
    const success = await setSubscription(userId, type, days);
    if (success) {
      toast({ title: "Subscription set", description: `${type} subscription for ${days} days` });
    } else {
      toast({ title: "Failed to set subscription", variant: "destructive" });
    }
    setProcessingUser(null);
  };

  const handleClearSubscription = async (userId: string) => {
    setProcessingUser(userId);
    const success = await clearSubscription(userId);
    if (success) {
      toast({ title: "Subscription cleared" });
    } else {
      toast({ title: "Failed to clear subscription", variant: "destructive" });
    }
    setProcessingUser(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDaysUntilExpiry = (expiresAt: string | null): number | null => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (expiresAt: string | null): { label: string; color: string; urgent: boolean } => {
    const days = getDaysUntilExpiry(expiresAt);
    if (days === null) return { label: 'No subscription', color: 'text-muted-foreground', urgent: false };
    if (days < 0) return { label: 'Expired', color: 'text-destructive', urgent: true };
    if (days === 0) return { label: 'Expires today', color: 'text-orange-500', urgent: true };
    if (days <= 2) return { label: `${days}d left`, color: 'text-orange-500', urgent: true };
    return { label: `${days}d left`, color: 'text-green-500', urgent: false };
  };

  // Feature descriptions for admin understanding
  const FEATURE_DESCRIPTIONS: Record<string, { 
    description: string; 
    inputLabels: string[];
    outputLabel: string;
  }> = {
    "Character Generator": {
      description: "Creates a photorealistic image of a character in a new scene. Uses multiple reference photos to lock the character's identity, then places them into a custom background or with a product.",
      inputLabels: ["Main Character", "Left Profile", "Right Profile", "Background/Product"],
      outputLabel: "Generated Scene"
    },
    "Face Swap": {
      description: "Swaps the face from one image onto another person's photo while maintaining natural lighting and proportions.",
      inputLabels: ["Source Face", "Target Photo"],
      outputLabel: "Swapped Result"
    },
    "Pose Transfer": {
      description: "Transfers the pose from a reference image onto your character while preserving their identity.",
      inputLabels: ["Character", "Pose Reference"],
      outputLabel: "New Pose"
    },
    "Apply Makeup": {
      description: "Applies makeup styling from a reference to a portrait while maintaining natural appearance.",
      inputLabels: ["Portrait", "Makeup Reference"],
      outputLabel: "With Makeup"
    },
    "Apply Branding": {
      description: "Adds branding elements like logos or text overlays to product/marketing images.",
      inputLabels: ["Product Image", "Brand Assets"],
      outputLabel: "Branded Image"
    },
    "Enhance Photo": {
      description: "Improves photo quality by enhancing resolution, colors, and details.",
      inputLabels: ["Original Photo"],
      outputLabel: "Enhanced"
    },
    "Cinematic Transform": {
      description: "Applies cinematic color grading and film-like visual effects to photos.",
      inputLabels: ["Original Photo"],
      outputLabel: "Cinematic"
    },
    "Remove Background": {
      description: "Removes the background from a photo, isolating the main subject.",
      inputLabels: ["Original Photo"],
      outputLabel: "No Background"
    },
    "Extract to Dummy": {
      description: "Extracts a dress/outfit from a photo and places it on a mannequin/dummy for catalog display.",
      inputLabels: ["Outfit Photo"],
      outputLabel: "On Dummy"
    },
  };

  const getInputImageLabel = (featureName: string, index: number, totalInputs: number): string => {
    const feature = FEATURE_DESCRIPTIONS[featureName];
    if (feature && feature.inputLabels[index]) {
      return feature.inputLabels[index];
    }
    return `Input ${index + 1}`;
  };

  const FeatureExplanation = ({ featureName, inputCount }: { featureName: string; inputCount: number }) => {
    const feature = FEATURE_DESCRIPTIONS[featureName];
    if (!feature) {
      return (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{featureName}</span>: {inputCount} input(s) → 1 output
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <span className="font-semibold text-foreground">{featureName}</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-blue-400">Inputs:</span>
          <span className="text-muted-foreground">{feature.inputLabels.slice(0, inputCount).join(" → ")}</span>
          <span className="text-green-400 ml-2">Output:</span>
          <span className="text-muted-foreground">{feature.outputLabel}</span>
        </div>
      </div>
    );
  };


  // Get users with expiring/expired subscriptions
  const expiringUsers = users.filter(u => {
    const days = getDaysUntilExpiry(u.subscription_expires_at);
    return days !== null && days <= 2;
  }).sort((a, b) => {
    const daysA = getDaysUntilExpiry(a.subscription_expires_at) ?? 999;
    const daysB = getDaysUntilExpiry(b.subscription_expires_at) ?? 999;
    return daysA - daysB;
  });

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast({ title: "Email and password are required", variant: "destructive" });
      return;
    }

    if (newUserPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setCreatingUser(true);
    const result = await createUser(newUserEmail, newUserPassword, newUserName || undefined);
    
    if (result.success) {
      toast({ title: "User created successfully", description: `${newUserEmail} can now log in` });
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
    } else {
      toast({ title: "Failed to create user", description: result.error, variant: "destructive" });
    }
    setCreatingUser(false);
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDownloadImage = async (url: string, filename: string) => {
    try {
      // Handle base64 data URLs directly
      if (url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Image downloaded" });
        return;
      }

      // For external URLs, try fetch first, then fallback to opening in new tab
      try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) throw new Error('Fetch failed');
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        toast({ title: "Image downloaded" });
      } catch {
        // CORS blocked - open in new tab so user can save manually
        window.open(url, '_blank');
        toast({ title: "Image opened in new tab", description: "Right-click to save the image" });
      }
    } catch (error) {
      console.error("Download failed:", error);
      toast({ title: "Failed to download image", variant: "destructive" });
    }
  };

  const handleDeleteHistory = async (historyId: string) => {
    setDeletingHistoryId(historyId);
    const success = await deleteHistoryEntry(historyId);
    if (success) {
      toast({ title: "History entry deleted" });
      setSelectedHistoryIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(historyId);
        return newSet;
      });
    } else {
      toast({ title: "Failed to delete history entry", variant: "destructive" });
    }
    setDeletingHistoryId(null);
  };

  const handleBulkDeleteHistory = async () => {
    if (selectedHistoryIds.size === 0) return;
    
    setBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;
    
    for (const id of selectedHistoryIds) {
      const success = await deleteHistoryEntry(id);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }
    
    if (successCount > 0) {
      toast({ title: `Deleted ${successCount} entries${failCount > 0 ? `, ${failCount} failed` : ''}` });
      setSelectedHistoryIds(new Set());
    } else {
      toast({ title: "Failed to delete entries", variant: "destructive" });
    }
    setBulkDeleting(false);
  };

  const toggleHistorySelection = (id: string) => {
    setSelectedHistoryIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAllHistory = () => {
    if (selectedHistoryIds.size === history.length) {
      setSelectedHistoryIds(new Set());
    } else {
      setSelectedHistoryIds(new Set(history.map(h => h.id)));
    }
  };

  const ImageThumbnail = ({ src, alt }: { src: string; alt: string }) => {
    // Check if it's a valid displayable image source
    const isValidSrc = src && (src.startsWith('http') || src.startsWith('data:image'));
    
    if (!isValidSrc) {
      return (
        <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center">
          <Image className="w-6 h-6 text-muted-foreground" />
        </div>
      );
    }
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className="relative group overflow-hidden rounded-lg border border-border hover:border-gold/50 transition-all">
            <img 
              src={src} 
              alt={alt}
              className="w-16 h-16 object-cover transition-transform group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-charcoal/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ExternalLink className="w-4 h-4 text-cream" />
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{alt}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4">
            <img 
              src={src} 
              alt={alt}
              className="max-h-[60vh] object-contain rounded-lg"
            />
            <Button 
              onClick={() => handleDownloadImage(src, `${alt.replace(/\s+/g, '_')}.png`)}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download Image
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gold/10 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/")} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="font-serif text-xl font-semibold text-charcoal">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => { refetchUsers(); refetchHistory(); }} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6">
            <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-card/50">
              {/* Primary tabs - always visible */}
              <TabsTrigger value="counter" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                Counter
              </TabsTrigger>
              <TabsTrigger value="live-users" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5">
                <Radio className="w-3 h-3 sm:w-4 sm:h-4" />
                Live
              </TabsTrigger>
              <TabsTrigger value="inbox" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5">
                <Inbox className="w-3 h-3 sm:w-4 sm:h-4" />
                Inbox
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5">
                <History className="w-3 h-3 sm:w-4 sm:h-4" />
                History
              </TabsTrigger>

              {/* More dropdown for additional tabs */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-md bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                    <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                    More
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border z-50">
                  <DropdownMenuItem onClick={() => setActiveTab("pricing")} className="gap-2 cursor-pointer">
                    <Diamond className="w-4 h-4" />
                    Pricing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("feature-costs")} className="gap-2 cursor-pointer">
                    <Diamond className="w-4 h-4" />
                    Tool Costs
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("website-cms")} className="gap-2 cursor-pointer">
                    <Settings2 className="w-4 h-4" />
                    CMS
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("articles")} className="gap-2 cursor-pointer">
                    <FileText className="w-4 h-4" />
                    Articles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("tool-configs")} className="gap-2 cursor-pointer">
                    <Settings2 className="w-4 h-4" />
                    Tool Editor
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TabsList>
          </div>

          <TabsContent value="counter">
            <GenerationCounter />
          </TabsContent>

          <TabsContent value="live-users">
            <LiveUsersMonitor />
          </TabsContent>

          <TabsContent value="inbox">
            <AdminInbox />
          </TabsContent>

          <TabsContent value="users">
            {/* Create New User Form */}
            <div className="mb-6 p-4 rounded-lg border border-gold/10 bg-card">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2 text-charcoal">
                <UserPlus className="w-4 h-4 text-gold" />
                Create New User
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-email">Email *</Label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Password *</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-name">Full Name (optional)</Label>
                  <Input
                    id="new-name"
                    type="text"
                    placeholder="John Doe"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleCreateUser} 
                    disabled={creatingUser || !newUserEmail || !newUserPassword}
                    variant="gold"
                    className="w-full"
                  >
                    {creatingUser ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    Create User
                  </Button>
                </div>
              </div>
            </div>

            {/* Expiring Subscriptions Alert */}
            {expiringUsers.length > 0 && (
              <div className="mb-6 p-4 rounded-lg border border-orange-500/30 bg-orange-500/10">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-orange-500">
                  <AlertTriangle className="w-4 h-4" />
                  Expiring Subscriptions ({expiringUsers.length})
                </h3>
                <div className="space-y-2">
                  {expiringUsers.map(u => {
                    const status = getExpiryStatus(u.subscription_expires_at);
                    return (
                      <div key={u.user_id} className="flex items-center justify-between p-2 rounded bg-background/50">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-sm">{u.email}</span>
                          <span className={`text-xs font-medium ${status.color}`}>
                            {u.subscription_type} • {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetSubscription(u.user_id, u.subscription_type || '7-day', 7)}
                            disabled={processingUser === u.user_id}
                            className="text-xs"
                          >
                            +7 Days
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetSubscription(u.user_id, 'monthly', 30)}
                            disabled={processingUser === u.user_id}
                            className="text-xs"
                          >
                            +30 Days
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-gold/10 overflow-x-auto">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow className="bg-card/50">
                    <TableHead>Status</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Gems</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => {
                    const expiryStatus = getExpiryStatus(u.subscription_expires_at);
                    return (
                    <TableRow key={u.user_id} className={u.is_blocked ? "opacity-60" : ""}>
                      <TableCell>
                        {u.is_blocked ? (
                          <span className="inline-flex items-center gap-1 text-xs text-destructive font-medium">
                            <Ban className="w-3 h-3" />
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-green-500 font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{u.email}</span>
                          {u.full_name && <span className="text-xs text-muted-foreground">{u.full_name}</span>}
                        </div>
                        {u.user_id === user.id && (
                          <span className="ml-2 text-xs text-gold">(You)</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Diamond className="w-4 h-4 text-purple-400" />
                          <span className="font-medium">{u.gems}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {u.subscription_type ? (
                            <>
                              <span className="text-xs font-medium capitalize">{u.subscription_type}</span>
                              <span className={`text-xs ${expiryStatus.color} flex items-center gap-1`}>
                                <Clock className="w-3 h-3" />
                                {expiryStatus.label}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">No subscription</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(u.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          {/* Subscription buttons */}
                          <div className="flex items-center gap-1 mr-2">
                            <Button
                              variant={u.subscription_type === '7-day' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleSetSubscription(u.user_id, '7-day', 7)}
                              disabled={processingUser === u.user_id}
                              className="text-xs px-2"
                              title="Set 7-day subscription"
                            >
                              7D
                            </Button>
                            <Button
                              variant={u.subscription_type === 'monthly' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleSetSubscription(u.user_id, 'monthly', 30)}
                              disabled={processingUser === u.user_id}
                              className="text-xs px-2"
                              title="Set Monthly subscription"
                            >
                              30D
                            </Button>
                            {u.subscription_type && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleClearSubscription(u.user_id)}
                                disabled={processingUser === u.user_id}
                                className="text-xs px-1 text-muted-foreground hover:text-destructive"
                                title="Clear subscription"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          
                          {/* Quick add/remove gems */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddGems(u.user_id, -10)}
                            disabled={processingUser === u.user_id || u.gems <= 0}
                            title="Remove 10 gems"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddGems(u.user_id, 10)}
                            disabled={processingUser === u.user_id}
                            title="Add 10 gems"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          
                          {/* Set specific gems */}
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              placeholder="Set"
                              className="w-20 h-8 text-sm"
                              value={creditInputs[u.user_id] || ""}
                              onChange={(e) => setCreditInputs(prev => ({ 
                                ...prev, 
                                [u.user_id]: e.target.value 
                              }))}
                              min={0}
                            />
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleSetGems(u.user_id)}
                              disabled={processingUser === u.user_id || !creditInputs[u.user_id]}
                            >
                              Set
                            </Button>
                          </div>

                          {/* Block/Unblock user */}
                          {u.user_id !== user.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant={u.is_blocked ? "outline" : "secondary"}
                                  size="sm"
                                  disabled={processingUser === u.user_id}
                                  className={u.is_blocked ? "text-green-500 border-green-500/30" : "text-orange-500"}
                                >
                                  {u.is_blocked ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{u.is_blocked ? "Unblock" : "Block"} User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {u.is_blocked 
                                      ? `Are you sure you want to unblock ${u.email}? They will be able to access the app again.`
                                      : `Are you sure you want to block ${u.email}? They will no longer be able to access the app.`
                                    }
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={async () => {
                                      setProcessingUser(u.user_id);
                                      const success = await toggleBlockUser(u.user_id, !u.is_blocked);
                                      if (success) {
                                        toast({ title: u.is_blocked ? "User unblocked" : "User blocked" });
                                      } else {
                                        toast({ title: "Failed to update user status", variant: "destructive" });
                                      }
                                      setProcessingUser(null);
                                    }}
                                    className={u.is_blocked ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}
                                  >
                                    {u.is_blocked ? "Unblock" : "Block"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          {/* Delete user */}
                          {u.user_id !== user.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={processingUser === u.user_id}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {u.email}? This action cannot be undone. All their data will be permanently removed.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteUser(u.user_id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {/* Bulk Delete Bar */}
            {selectedHistoryIds.size > 0 && (
              <div className="mb-4 p-3 rounded-lg border border-gold/10 bg-card flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedHistoryIds.size} item{selectedHistoryIds.size > 1 ? 's' : ''} selected
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={bulkDeleting}>
                      {bulkDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Delete Selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {selectedHistoryIds.size} Entries</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedHistoryIds.size} generation history {selectedHistoryIds.size === 1 ? 'entry' : 'entries'}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleBulkDeleteHistory}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
            
            <div className="rounded-lg border border-gold/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-card/50">
                    <TableHead className="w-10">
                      <Checkbox 
                        checked={history.length > 0 && selectedHistoryIds.size === history.length}
                        onCheckedChange={toggleSelectAllHistory}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Feature</TableHead>
                    <TableHead>Images</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No generation history yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((h) => {
                      const hasImages = h.input_images.length > 0 || h.output_images.length > 0;
                      const isExpanded = expandedRows.has(h.id);
                      
                      return (
                        <React.Fragment key={h.id}>
                          <TableRow className={hasImages ? "cursor-pointer hover:bg-accent/30" : ""}>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox 
                                checked={selectedHistoryIds.has(h.id)}
                                onCheckedChange={() => toggleHistorySelection(h.id)}
                                aria-label={`Select ${h.feature_name}`}
                              />
                            </TableCell>
                            <TableCell onClick={() => hasImages && toggleRow(h.id)}>
                              {hasImages && (
                                <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </Button>
                              )}
                            </TableCell>
                            <TableCell onClick={() => hasImages && toggleRow(h.id)} className="font-medium">{h.user_email}</TableCell>
                            <TableCell onClick={() => hasImages && toggleRow(h.id)}>
                              <span className="px-2 py-1 rounded-full bg-gold/10 text-gold text-sm font-medium">
                                {h.feature_name}
                              </span>
                            </TableCell>
                            <TableCell onClick={() => hasImages && toggleRow(h.id)}>
                              {hasImages ? (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Image className="w-4 h-4" />
                                  <span>{h.input_images.length} in / {h.output_images.length} out</span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground/50">No images</span>
                              )}
                            </TableCell>
                            <TableCell onClick={() => hasImages && toggleRow(h.id)} className="text-muted-foreground text-sm">
                              {formatDate(h.created_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={deletingHistoryId === h.id}
                                  >
                                    {deletingHistoryId === h.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete History Entry</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this generation history entry for {h.user_email}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteHistory(h.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                          
                          {/* Expanded row for images */}
                          {isExpanded && hasImages && (
                            <TableRow key={`${h.id}-images`}>
                              <TableCell colSpan={7} className="bg-accent/20 p-4">
                                {/* Feature explanation */}
                                <div className="mb-4 p-3 rounded-lg bg-card/50 border border-gold/10">
                                  <FeatureExplanation featureName={h.feature_name} inputCount={h.input_images.length} />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Input Images */}
                                  <div>
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                      Input Images ({h.input_images.length})
                                    </h4>
                                    {h.input_images.length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {h.input_images.map((img, idx) => {
                                          const label = getInputImageLabel(h.feature_name, idx, h.input_images.length);
                                          return (
                                            <div key={idx} className="flex flex-col items-center gap-1">
                                              <ImageThumbnail src={img} alt={label} />
                                              <span className="text-[10px] text-muted-foreground text-center max-w-[60px] truncate" title={label}>
                                                {label}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No input images recorded</p>
                                    )}
                                  </div>
                                  
                                  {/* Output Images */}
                                  <div>
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                      Output Images ({h.output_images.length})
                                    </h4>
                                    {h.output_images.length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {h.output_images.map((img, idx) => (
                                          <ImageThumbnail key={idx} src={img} alt={`Output ${idx + 1}`} />
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No output images recorded</p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <PaymentInbox />
          </TabsContent>


          <TabsContent value="pricing">
            <PricingManager />
          </TabsContent>

          <TabsContent value="feature-costs">
            <FeatureGemCostsManager />
          </TabsContent>

          <TabsContent value="website-cms">
            <WebsiteControlCenter />
          </TabsContent>

          <TabsContent value="articles">
            <ArticlesManager />
          </TabsContent>

          <TabsContent value="tool-configs">
            <ToolConfigsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;