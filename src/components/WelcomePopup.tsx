import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Diamond, Sparkles, Gift, ArrowRight } from "lucide-react";

const WELCOME_SHOWN_KEY = "bh_studio_welcome_shown";

export const WelcomePopup = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Check if user has seen welcome popup
    const hasSeenWelcome = localStorage.getItem(`${WELCOME_SHOWN_KEY}_${user.id}`);
    
    // Check if user is new (created within last 5 minutes)
    const createdAt = new Date(user.created_at || Date.now());
    const now = new Date();
    const timeDiff = now.getTime() - createdAt.getTime();
    const isNewUser = timeDiff < 5 * 60 * 1000; // 5 minutes

    if (!hasSeenWelcome && isNewUser) {
      // Small delay to ensure the page is loaded
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleClose = () => {
    if (user) {
      localStorage.setItem(`${WELCOME_SHOWN_KEY}_${user.id}`, "true");
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md border-purple-500/30 bg-gradient-to-b from-background to-purple-500/5">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 animate-pulse">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="font-serif text-2xl text-center">
            Welcome to <span className="bg-gradient-to-r from-primary to-rose-gold bg-clip-text text-transparent">BH Studio!</span>
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            You're all set to start creating amazing content
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-4">
          {/* Free Gems Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-6 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.1),transparent_50%)]" />
            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Diamond className="w-8 h-8 text-purple-400" />
                <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  50
                </span>
                <span className="text-lg text-cream/70">Gems</span>
              </div>
              <p className="text-cream/80 text-sm">Added to your account</p>
              <p className="text-cream/50 text-xs mt-1">Use them to try all our AI features!</p>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-card/50 border border-border/50 p-3 text-center">
              <Sparkles className="w-5 h-5 text-gold mx-auto mb-1" />
              <p className="text-xs text-cream/70">AI Photo Studio</p>
            </div>
            <div className="rounded-xl bg-card/50 border border-border/50 p-3 text-center">
              <Diamond className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-xs text-cream/70">Makeup Studio</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleClose}
          className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
        >
          Start Creating
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </DialogContent>
    </Dialog>
  );
};
