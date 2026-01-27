import { Crown, Shield, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeType = "admin" | "pro" | "elite";

interface UserBadgeProps {
  type: BadgeType;
  className?: string;
}

const badgeConfig: Record<BadgeType, { 
  label: string; 
  labelBn: string;
  icon: typeof Crown; 
  bgClass: string; 
  textClass: string;
  borderClass: string;
}> = {
  admin: {
    label: "Admin",
    labelBn: "অ্যাডমিন",
    icon: Shield,
    bgClass: "bg-red-500/20",
    textClass: "text-red-400",
    borderClass: "border-red-500/40",
  },
  pro: {
    label: "Pro Member",
    labelBn: "প্রো সদস্য",
    icon: Star,
    bgClass: "bg-primary/20",
    textClass: "text-primary",
    borderClass: "border-primary/40",
  },
  elite: {
    label: "Elite Creator",
    labelBn: "এলিট ক্রিয়েটর",
    icon: Crown,
    bgClass: "bg-amber-500/20",
    textClass: "text-amber-400",
    borderClass: "border-amber-500/40",
  },
};

export const UserBadge = ({ type, className }: UserBadgeProps) => {
  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
        "border backdrop-blur-sm",
        config.bgClass,
        config.borderClass,
        className
      )}
    >
      <Icon className={cn("w-3.5 h-3.5", config.textClass)} />
      <span className={cn("text-xs font-semibold", config.textClass)}>
        {config.label}
      </span>
    </div>
  );
};

// Helper to determine badge type from user data
export const getUserBadgeType = (isAdmin: boolean, subscriptionType?: string | null): BadgeType => {
  if (isAdmin) return "admin";
  if (subscriptionType === "elite") return "elite";
  return "pro";
};
