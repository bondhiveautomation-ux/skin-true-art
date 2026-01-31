import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isBlocked: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
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
        .from("profiles")
        .select("is_blocked")
        .eq("user_id", userId)
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

    // 1) Listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);

      if (nextSession?.user && event !== "INITIAL_SESSION") {
        runBlockedCheck(nextSession.user.id);
      }
    });

    // 2) Then get the initial session (with a hard timeout)
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
    try {
      // Clear local state first for immediate UI feedback
      setSession(null);
      setUser(null);
      setIsBlocked(false);

      // Then sign out (with timeout to prevent hanging)
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Sign out timeout")), 5000));
      await Promise.race([signOutPromise, timeoutPromise]).catch((err) => {
        console.warn("Sign out warning:", err);
      });
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      window.location.href = "/";
    }
  };

  const value: AuthContextValue = {
    user,
    session,
    loading,
    isBlocked,
    isAuthenticated: !!session,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};
