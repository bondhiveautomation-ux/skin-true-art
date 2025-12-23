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

    const withTimeout = async <T,>(
      promise: Promise<T>,
      ms: number,
      fallback: T
    ): Promise<T> => {
      let timeoutId: number | undefined;
      const timeout = new Promise<T>((resolve) => {
        timeoutId = window.setTimeout(() => resolve(fallback), ms);
      });

      const result = await Promise.race([promise, timeout]);
      if (timeoutId) window.clearTimeout(timeoutId);
      return result;
    };

    const handleBlockedUser = async () => {
      setIsBlocked(true);
      toastRef.current({
        title: "Account Blocked",
        description: "Your account has been blocked. Please contact support.",
        variant: "destructive",
      });
      await supabase.auth.signOut();
      if (!isMounted) return;
      setSession(null);
      setUser(null);
    };

    const runBlockedCheck = (userId: string) => {
      // Never block auth state updates
      window.setTimeout(async () => {
        const blocked = await withTimeout(checkBlockedStatus(userId), 4000, false);
        if (!isMounted) return;
        if (blocked) await handleBlockedUser();
      }, 0);
    };

    // 1) Listener FIRST (must be synchronous; no awaits inside callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);

      if (nextSession?.user && event !== "INITIAL_SESSION") {
        runBlockedCheck(nextSession.user.id);
      }
    });

    // 2) Then get the initial session (with a hard timeout to prevent infinite loading)
    (async () => {
      const { data, error } = await withTimeout(
        supabase.auth.getSession(),
        7000,
        { data: { session: null }, error: null }
      );

      if (!isMounted) return;

      if (error) {
        console.error("Error getting session:", error);
        setLoading(false);
        return;
      }

      const initialSession = data.session;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);

      if (initialSession?.user) {
        runBlockedCheck(initialSession.user.id);
      }
    })();

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
