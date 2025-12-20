import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Loader2, 
  Trash2, 
  Plus, 
  Minus, 
  Users, 
  History,
  Coins,
  RefreshCw,
  UserPlus,
  Image,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Shirt,
  Settings2,
  MessageCircle
} from "lucide-react";
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
import { DressLibraryManager } from "@/components/admin/DressLibraryManager";
import { WebsiteControlCenter } from "@/components/admin/WebsiteControlCenter";
import { PaymentInbox } from "@/components/admin/PaymentInbox";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading, users, history, updateCredits, deleteUser, createUser, refetchUsers, refetchHistory } = useAdmin();
  const { toast } = useToast();
  const [creditInputs, setCreditInputs] = useState<Record<string, string>>({});
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
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

  const handleAddCredits = async (userId: string, amount: number) => {
    const currentUser = users.find(u => u.user_id === userId);
    if (!currentUser) return;
    
    setProcessingUser(userId);
    const newCredits = Math.max(0, currentUser.credits + amount);
    const success = await updateCredits(userId, newCredits);
    
    if (success) {
      toast({ title: "Credits updated", description: `Added ${amount} credits` });
    } else {
      toast({ title: "Failed to update credits", variant: "destructive" });
    }
    setProcessingUser(null);
  };

  const handleSetCredits = async (userId: string) => {
    const value = creditInputs[userId];
    if (!value) return;
    
    const newCredits = parseInt(value, 10);
    if (isNaN(newCredits) || newCredits < 0) {
      toast({ title: "Invalid credit amount", variant: "destructive" });
      return;
    }

    setProcessingUser(userId);
    const success = await updateCredits(userId, newCredits);
    
    if (success) {
      toast({ title: "Credits updated", description: `Set credits to ${newCredits}` });
      setCreditInputs(prev => ({ ...prev, [userId]: "" }));
    } else {
      toast({ title: "Failed to update credits", variant: "destructive" });
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

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

  const ImageThumbnail = ({ src, alt }: { src: string; alt: string }) => (
    <Dialog>
      <DialogTrigger asChild>
        <button className="relative group overflow-hidden rounded-lg border border-border hover:border-gold/50 transition-all">
          <img 
            src={src} 
            alt={alt}
            className="w-16 h-16 object-cover transition-transform group-hover:scale-110"
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
        <div className="flex items-center justify-center">
          <img 
            src={src} 
            alt={alt}
            className="max-h-[70vh] object-contain rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );

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
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Payment Inbox
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              Generation History
            </TabsTrigger>
            <TabsTrigger value="dress-library" className="gap-2">
              <Shirt className="w-4 h-4" />
              Dress Library
            </TabsTrigger>
            <TabsTrigger value="website-cms" className="gap-2">
              <Settings2 className="w-4 h-4" />
              Website CMS
            </TabsTrigger>
          </TabsList>

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

            <div className="rounded-lg border border-gold/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-card/50">
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell className="font-medium">
                        {u.email}
                        {u.user_id === user.id && (
                          <span className="ml-2 text-xs text-gold">(You)</span>
                        )}
                      </TableCell>
                      <TableCell>{u.full_name || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-gold" />
                          <span className="font-medium">{u.credits}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(u.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick add/remove credits */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddCredits(u.user_id, -1)}
                            disabled={processingUser === u.user_id || u.credits <= 0}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddCredits(u.user_id, 1)}
                            disabled={processingUser === u.user_id}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          
                          {/* Set specific credits */}
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
                              onClick={() => handleSetCredits(u.user_id)}
                              disabled={processingUser === u.user_id || !creditInputs[u.user_id]}
                            >
                              Set
                            </Button>
                          </div>

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
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="rounded-lg border border-gold/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-card/50">
                    <TableHead className="w-10"></TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Feature</TableHead>
                    <TableHead>Images</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No generation history yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((h) => {
                      const hasImages = h.input_images.length > 0 || h.output_images.length > 0;
                      const isExpanded = expandedRows.has(h.id);
                      
                      return (
                        <>
                          <TableRow key={h.id} className={hasImages ? "cursor-pointer hover:bg-accent/30" : ""} onClick={() => hasImages && toggleRow(h.id)}>
                            <TableCell>
                              {hasImages && (
                                <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{h.user_email}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 rounded-full bg-gold/10 text-gold text-sm font-medium">
                                {h.feature_name}
                              </span>
                            </TableCell>
                            <TableCell>
                              {hasImages ? (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Image className="w-4 h-4" />
                                  <span>{h.input_images.length} in / {h.output_images.length} out</span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground/50">No images</span>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatDate(h.created_at)}
                            </TableCell>
                          </TableRow>
                          
                          {/* Expanded row for images */}
                          {isExpanded && hasImages && (
                            <TableRow key={`${h.id}-images`}>
                              <TableCell colSpan={5} className="bg-accent/20 p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Input Images */}
                                  <div>
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                      Input Images ({h.input_images.length})
                                    </h4>
                                    {h.input_images.length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {h.input_images.map((img, idx) => (
                                          <ImageThumbnail key={idx} src={img} alt={`Input ${idx + 1}`} />
                                        ))}
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
                        </>
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

          <TabsContent value="dress-library">
            <DressLibraryManager />
          </TabsContent>

          <TabsContent value="website-cms">
            <WebsiteControlCenter />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;