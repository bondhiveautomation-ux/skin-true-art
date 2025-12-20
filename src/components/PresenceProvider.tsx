import { createContext, useContext, ReactNode } from "react";
import { usePresence } from "@/hooks/usePresence";

interface PresenceContextType {
  updatePresence: (isOnline: boolean, path?: string, tool?: string | null) => Promise<void>;
  markOffline: () => Promise<void>;
  setCurrentTool: (tool: string | null) => Promise<void>;
}

const PresenceContext = createContext<PresenceContextType>({
  updatePresence: async () => {},
  markOffline: async () => {},
  setCurrentTool: async () => {},
});

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
  const presence = usePresence();
  
  return (
    <PresenceContext.Provider value={presence}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresenceContext = () => {
  return useContext(PresenceContext);
};