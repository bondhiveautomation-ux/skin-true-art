import { Search, Users, Scale, Sparkles, CheckCircle2 } from "lucide-react";
import { AgentCard, AgentStatus } from "./AgentCard";

export interface AgentState {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  output: string;
}

interface AgentPipelineProps {
  agents: AgentState[];
}

const AGENT_ICONS = {
  detailer: Search,
  contextualizer: Users,
  alignment: Scale,
  polisher: Sparkles,
  final: CheckCircle2,
};

export const AgentPipeline = ({ agents }: AgentPipelineProps) => {
  return (
    <div className="w-full">
      {/* Desktop: Horizontal layout */}
      <div className="hidden md:flex items-start justify-center gap-4">
        {agents.map((agent, index) => (
          <div key={agent.id} className="flex items-center">
            <AgentCard
              name={agent.name}
              description={agent.description}
              icon={AGENT_ICONS[agent.id as keyof typeof AGENT_ICONS] || Search}
              status={agent.status}
              output={agent.output}
              isLast={true}
            />
            {index < agents.length - 1 && (
              <div className={`w-8 h-0.5 mx-2 transition-all duration-500 ${
                agent.status === 'completed' 
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-500/50' 
                  : 'bg-white/10'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Mobile: Vertical layout */}
      <div className="flex md:hidden flex-col items-center gap-0">
        {agents.map((agent, index) => (
          <AgentCard
            key={agent.id}
            name={agent.name}
            description={agent.description}
            icon={AGENT_ICONS[agent.id as keyof typeof AGENT_ICONS] || Search}
            status={agent.status}
            output={agent.output}
            isLast={index === agents.length - 1}
          />
        ))}
      </div>
    </div>
  );
};
