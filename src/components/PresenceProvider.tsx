import { createContext, useContext, ReactNode } from "react";
import { usePresence } from "@/hooks/usePresence";

const PresenceContext = createContext<ReturnType<typeof usePresence> | null>(null);

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
  const presence = usePresence();
  
  return (
    <PresenceContext.Provider value={presence}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresenceContext = () => {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error("usePresenceContext must be used within PresenceProvider");
  }
  return context;
};
