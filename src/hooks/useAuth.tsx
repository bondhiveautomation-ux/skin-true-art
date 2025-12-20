import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const { toast } = useToast();

  // Check if user is blocked
  const checkBlockedStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_blocked')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error("Error checking blocked status:", error);
        return false;
      }

      return data?.is_blocked ?? false;
    } catch (error) {
      console.error("Error checking blocked status:", error);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Check blocked status after auth state change
        if (session?.user) {
          setTimeout(async () => {
            const blocked = await checkBlockedStatus(session.user.id);
            if (blocked) {
              setIsBlocked(true);
              toast({
                title: "Account Blocked",
                description: "Your account has been blocked. Please contact support.",
                variant: "destructive",
              });
              await supabase.auth.signOut();
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const blocked = await checkBlockedStatus(session.user.id);
        if (blocked) {
          setIsBlocked(true);
          toast({
            title: "Account Blocked",
            description: "Your account has been blocked. Please contact support.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsBlocked(false);
  };

  return {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!session,
    isBlocked,
  };
};
