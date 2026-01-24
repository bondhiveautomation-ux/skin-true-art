import { LucideIcon, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AgentStatus = 'waiting' | 'processing' | 'completed';

interface AgentCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  status: AgentStatus;
  output?: string;
  isLast?: boolean;
}

export const AgentCard = ({ 
  name, 
  description, 
  icon: Icon, 
  status, 
  output,
  isLast = false 
}: AgentCardProps) => {
  return (
    <div className="flex flex-col items-center">
      {/* Agent Card */}
      <div
        className={cn(
          "relative w-full max-w-[180px] p-4 rounded-xl border-2 transition-all duration-500",
          "bg-[#141414] backdrop-blur-sm",
          status === 'waiting' && "border-white/10 opacity-50",
          status === 'processing' && "agent-processing border-amber-400/60",
          status === 'completed' && "agent-completed border-emerald-500/60"
        )}
      >
        {/* Status indicator */}
        <div className={cn(
          "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
          status === 'waiting' && "bg-white/10 text-white/40",
          status === 'processing' && "bg-amber-500 text-black animate-pulse",
          status === 'completed' && "bg-emerald-500 text-white"
        )}>
          {status === 'completed' ? (
            <Check className="w-3 h-3" />
          ) : status === 'processing' ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : null}
        </div>

        {/* Icon */}
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all duration-300",
          status === 'waiting' && "bg-white/5 text-white/40",
          status === 'processing' && "bg-amber-500/20 text-amber-400",
          status === 'completed' && "bg-emerald-500/20 text-emerald-400"
        )}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Name */}
        <h3 className={cn(
          "font-semibold text-sm mb-1 transition-colors duration-300",
          status === 'waiting' && "text-white/40",
          status === 'processing' && "text-amber-400",
          status === 'completed' && "text-emerald-400"
        )}>
          {name}
        </h3>

        {/* Description */}
        <p className="text-xs text-white/50 leading-relaxed">
          {description}
        </p>

        {/* Output preview (when completed) */}
        {status === 'completed' && output && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-white/70 line-clamp-2">
              {output.substring(0, 80)}...
            </p>
          </div>
        )}
      </div>

      {/* Connector line to next agent */}
      {!isLast && (
        <div className={cn(
          "w-0.5 h-8 my-2 transition-all duration-500",
          status === 'completed' ? "bg-gradient-to-b from-emerald-500 to-amber-500/30" : "bg-white/10"
        )} />
      )}
    </div>
  );
};
