import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const PAGE_NAME_MAP: Record<string, string> = {
  "/": "Home",
  "/auth": "Login / Sign Up",
  "/pricing": "Pricing",
  "/classes": "Classes",
  "/studio/photography": "Photography Studio",
  "/studio/caption": "Caption Studio",
  "/studio/branding": "Branding Studio",
  "/admin": "Admin Panel",
};

const getPageName = (path: string): string => {
  return PAGE_NAME_MAP[path] || path;
};

const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
};

const HEARTBEAT_INTERVAL = 20000; // 20 seconds
const OFFLINE_TIMEOUT = 60000; // 60 seconds

export const usePresence = () => {
  const { user } = useAuth();
  const location = useLocation();
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const lastPathRef = useRef<string>("");

  const updatePresence = useCallback(async (isOnline: boolean, path?: string) => {
    if (!user?.id) return;

    const now = new Date().toISOString();
    const pageName = path ? getPageName(path) : undefined;
    
    try {
      // Try to upsert presence
      const { error } = await supabase
        .from("user_presence")
        .upsert({
          user_id: user.id,
          is_online: isOnline,
          current_page_name: pageName,
          current_path: path,
          entered_at: path !== lastPathRef.current ? now : undefined,
          last_seen: now,
          last_active_at: now,
          device_type: getDeviceType(),
        }, {
          onConflict: "user_id",
        });

      if (error) {
        console.error("Error updating presence:", error);
      } else {
        if (path) lastPathRef.current = path;
      }
    } catch (err) {
      console.error("Failed to update presence:", err);
    }
  }, [user?.id]);

  const markOffline = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await supabase
        .from("user_presence")
        .update({
          is_online: false,
          last_seen: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    } catch (err) {
      console.error("Failed to mark offline:", err);
    }
  }, [user?.id]);

  // Update presence on route change
  useEffect(() => {
    if (user?.id) {
      updatePresence(true, location.pathname);
    }
  }, [location.pathname, user?.id, updatePresence]);

  // Start heartbeat when user is logged in
  useEffect(() => {
    if (!user?.id) return;

    // Initial presence update
    updatePresence(true, location.pathname);

    // Set up heartbeat
    heartbeatRef.current = setInterval(() => {
      updatePresence(true, location.pathname);
    }, HEARTBEAT_INTERVAL);

    // Handle visibility change (tab hidden/shown)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updatePresence(true, location.pathname);
      }
    };

    // Handle before unload (user closing tab)
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline marking
      const data = JSON.stringify({
        user_id: user.id,
        is_online: false,
        last_seen: new Date().toISOString(),
      });
      
      navigator.sendBeacon(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_presence?user_id=eq.${user.id}`,
        new Blob([data], { type: "application/json" })
      );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      markOffline();
    };
  }, [user?.id, location.pathname, updatePresence, markOffline]);

  return { updatePresence, markOffline };
};
