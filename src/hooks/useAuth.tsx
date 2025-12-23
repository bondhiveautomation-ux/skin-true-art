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
  const initializedRef = useRef(false);

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
    // Prevent double initialization
    if (initializedRef.current) return;
    initializedRef.current = true;

    let isMounted = true;

    // Get initial session first
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          if (isMounted) setLoading(false);
          return;
        }

        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const blocked = await checkBlockedStatus(session.user.id);
            if (blocked && isMounted) {
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
            toast({
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
  }, [checkBlockedStatus, toast]);

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
