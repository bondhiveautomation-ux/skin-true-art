import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileStickyFooterProps {
  children: ReactNode;
  className?: string;
  show?: boolean;
}

export const MobileStickyFooter = ({
  children,
  className,
  show = true,
}: MobileStickyFooterProps) => {
  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 lg:hidden",
        "bg-background/95 backdrop-blur-xl border-t border-border/50",
        "p-3 safe-area-bottom shadow-2xl shadow-black/20",
        className
      )}
    >
      {children}
    </div>
  );
};
