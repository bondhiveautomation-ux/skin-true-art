import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { BarChart3, RefreshCw, RotateCcw, Loader2, TrendingUp, Wallet, Save, Check } from "lucide-react";

interface FeatureCount {
  feature_name: string;
  count: number;
}

interface CounterReset {
  id: string;
  reset_at: string;
  note: string | null;
}

export const GenerationCounter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [featureCounts, setFeatureCounts] = useState<FeatureCount[]>([]);
  const [lastReset, setLastReset] = useState<CounterReset | null>(null);
  
  // Balance tracking
  const [balanceLeft, setBalanceLeft] = useState<string>("");
  const [balanceInput, setBalanceInput] = useState<string>("");
  const [savingBalance, setSavingBalance] = useState(false);
  const [balanceSaved, setBalanceSaved] = useState(false);

  const fetchCounts = async () => {
    setLoading(true);
    try {
      // Get last reset timestamp
      const { data: resetData } = await supabase
        .from("generation_counter_resets")
        .select("*")
        .order("reset_at", { ascending: false })
        .limit(1);

      const lastResetTime = resetData?.[0]?.reset_at || null;
      setLastReset(resetData?.[0] || null);

      // Get all generations, filtered by reset time if exists
      let query = supabase
        .from("generation_history")
        .select("feature_name, created_at");

      if (lastResetTime) {
        query = query.gt("created_at", lastResetTime);
      }

      const { data: historyData, error } = await query;

      if (error) throw error;

      // Calculate counts by feature
      const countMap: Record<string, number> = {};
      historyData?.forEach((item) => {
        const feature = item.feature_name || "Unknown";
        countMap[feature] = (countMap[feature] || 0) + 1;
      });

      // Convert to array and sort by count
      const countsArray = Object.entries(countMap)
        .map(([feature_name, count]) => ({ feature_name, count }))
        .sort((a, b) => b.count - a.count);

      setFeatureCounts(countsArray);
      setTotalCount(historyData?.length || 0);

      // Fetch saved balance
      const { data: balanceData } = await supabase
        .from("admin_settings")
        .select("setting_value")
        .eq("setting_key", "api_balance_left")
        .maybeSingle();

      if (balanceData?.setting_value) {
        setBalanceLeft(balanceData.setting_value);
        setBalanceInput(balanceData.setting_value);
      }
    } catch (error) {
      console.error("Error fetching generation counts:", error);
      toast({
        title: "Failed to load counts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const handleReset = async () => {
    if (!user?.id) return;

    setResetting(true);
    try {
      const { error } = await supabase.from("generation_counter_resets").insert({
        reset_by: user.id,
        note: `Counter reset at ${new Date().toLocaleString()}`,
      });

      if (error) throw error;

      toast({
        title: "Counter reset",
        description: "Generation counter has been reset to zero",
      });

      await fetchCounts();
    } catch (error) {
      console.error("Error resetting counter:", error);
      toast({
        title: "Failed to reset counter",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  const handleSaveBalance = async () => {
    if (!user?.id) return;

    setSavingBalance(true);
    try {
      // Upsert the balance setting
      const { error } = await supabase
        .from("admin_settings")
        .upsert({
          setting_key: "api_balance_left",
          setting_value: balanceInput,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "setting_key"
        });

      if (error) throw error;

      setBalanceLeft(balanceInput);
      setBalanceSaved(true);
      toast({
        title: "Balance saved",
        description: `Balance set to $${balanceInput}`,
      });

      // Reset the saved indicator after 2 seconds
      setTimeout(() => setBalanceSaved(false), 2000);
    } catch (error) {
      console.error("Error saving balance:", error);
      toast({
        title: "Failed to save balance",
        variant: "destructive",
      });
    } finally {
      setSavingBalance(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get color based on count percentage
  const getBarColor = (count: number, maxCount: number) => {
    const percentage = count / maxCount;
    if (percentage > 0.7) return "bg-gold";
    if (percentage > 0.4) return "bg-gold/70";
    return "bg-gold/40";
  };

  const maxCount = featureCounts[0]?.count || 1;

  return (
    <div className="space-y-6">
      <Card className="border-gold/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gold" />
              Generation Counter
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCounts}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={resetting || totalCount === 0}>
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Generation Counter?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset the counter to zero. The generation history will be preserved, but the counter will start fresh from this point. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset}>
                      {resetting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Reset Counter
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gold" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Total Count Hero */}
              <div className="bg-gradient-to-br from-gold/20 to-gold/5 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-gold" />
                  <span className="text-sm text-muted-foreground font-medium">Total Generations</span>
                </div>
                <div className="text-5xl font-bold text-gold mb-1">{totalCount.toLocaleString()}</div>
                {lastReset && (
                  <p className="text-xs text-muted-foreground">
                    Since {formatDate(lastReset.reset_at)}
                  </p>
                )}
              </div>

              {/* Feature Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Breakdown by Feature</h4>
                {featureCounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No generations recorded yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {featureCounts.map((item) => (
                      <div key={item.feature_name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{item.feature_name}</span>
                          <span className="font-semibold text-gold">{item.count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getBarColor(item.count, maxCount)} rounded-full transition-all duration-500`}
                            style={{ width: `${(item.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Last Reset Info */}
              {lastReset && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Last reset: {formatDate(lastReset.reset_at)}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balance Tracker Card */}
      <Card className="border-gold/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-500" />
            API Balance Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manually track your API balance for end-of-month calculations
            </p>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="text"
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
              <Button
                onClick={handleSaveBalance}
                disabled={savingBalance || !balanceInput}
                variant={balanceSaved ? "outline" : "default"}
                className={balanceSaved ? "border-green-500 text-green-500" : ""}
              >
                {savingBalance ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : balanceSaved ? (
                  <Check className="w-4 h-4 mr-1" />
                ) : (
                  <Save className="w-4 h-4 mr-1" />
                )}
                {balanceSaved ? "Saved" : "Save"}
              </Button>
            </div>
            {balanceLeft && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Balance</span>
                  <span className="text-2xl font-bold text-green-500">${balanceLeft}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerationCounter;
