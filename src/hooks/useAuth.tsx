import { useState, useEffect, useRef, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const { toast } = useToast();
  const toastRef = useRef(toast);

  // Keep toast ref updated
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  // Check if user is blocked
  const checkBlockedStatus = useCallback(async (userId: string) => {
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
  }, []);

  useEffect(() => {
    let isMounted = true;

    const withTimeout = async <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
      let timeoutId: number | undefined;
      const timeout = new Promise<T>((resolve) => {
        timeoutId = window.setTimeout(() => resolve(fallback), ms);
      });

      const result = await Promise.race([promise, timeout]);
      if (timeoutId) window.clearTimeout(timeoutId);
      return result;
    };

    // Get initial session first
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          if (isMounted) setLoading(false);
          return;
        }

        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Run blocked check in the background so auth loading never hangs
        if (session?.user) {
          const blocked = await withTimeout(
            checkBlockedStatus(session.user.id),
            4000,
            false
          );

          if (blocked && isMounted) {
            setIsBlocked(true);
            toastRef.current({
              title: "Account Blocked",
              description: "Your account has been blocked. Please contact support.",
              variant: "destructive",
            });
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener for subsequent changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);

        // Check blocked status after auth state change
        if (session?.user && event !== 'INITIAL_SESSION') {
          const blocked = await checkBlockedStatus(session.user.id);
          if (blocked && isMounted) {
            setIsBlocked(true);
            toastRef.current({
              title: "Account Blocked",
              description: "Your account has been blocked. Please contact support.",
              variant: "destructive",
            });
            await supabase.auth.signOut();
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkBlockedStatus]);

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
