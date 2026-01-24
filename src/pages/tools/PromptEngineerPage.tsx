import { useState, useCallback } from "react";
import { Wand2, RotateCcw, Sparkles, Copy, Check, Gem } from "lucide-react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useGems } from "@/hooks/useGems";
import { supabase } from "@/integrations/supabase/client";
import { getToolByPath } from "@/config/tools";
import { getGemCost } from "@/lib/gemCosts";
import { PromptTypeSelector, PromptType } from "@/components/prompt-engineer/PromptTypeSelector";
import { AgentPipeline, AgentState } from "@/components/prompt-engineer/AgentPipeline";
import { LivePreview } from "@/components/prompt-engineer/LivePreview";
import { LowBalanceAlert } from "@/components/gems/LowBalanceAlert";
import { ProcessingModal } from "@/components/gems/ProcessingModal";

const INITIAL_AGENTS: AgentState[] = [
  { id: 'detailer', name: 'Detailer', description: 'Adds technical details', status: 'waiting', output: '' },
  { id: 'contextualizer', name: 'Contextualizer', description: 'Adds persona & examples', status: 'waiting', output: '' },
  { id: 'alignment', name: 'Alignment', description: 'Checks original intent', status: 'waiting', output: '' },
  { id: 'polisher', name: 'Polisher', description: 'Grammar & formatting', status: 'waiting', output: '' },
  { id: 'final', name: 'Final Output', description: 'Ready to use', status: 'waiting', output: '' },
];

const PromptEngineerPage = () => {
  const tool = getToolByPath("/tools/prompt-engineer");
  const { toast } = useToast();
  const { gems, deductGems, hasEnoughGems } = useGems();

  const [promptType, setPromptType] = useState<PromptType>('image');
  const [rawPrompt, setRawPrompt] = useState('');
  const [agents, setAgents] = useState<AgentState[]>(INITIAL_AGENTS);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(-1);
  const [livePreview, setLivePreview] = useState('');
  const [finalOutput, setFinalOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLowBalance, setShowLowBalance] = useState(false);

  const gemCost = tool ? getGemCost(tool.gemCostKey) : 1;
  const canGenerate = rawPrompt.trim().length > 0 && hasEnoughGems(tool?.gemCostKey || 'prompt-engineer');

  const resetAll = useCallback(() => {
    setAgents(INITIAL_AGENTS);
    setCurrentAgentIndex(-1);
    setLivePreview('');
    setFinalOutput('');
    setIsProcessing(false);
  }, []);

  const handleRefine = async () => {
    if (!rawPrompt.trim()) {
      toast({ title: "Enter a prompt", description: "Please enter a prompt to refine", variant: "destructive" });
      return;
    }

    if (!hasEnoughGems(tool?.gemCostKey || 'prompt-engineer')) {
      setShowLowBalance(true);
      return;
    }

    resetAll();
    setIsProcessing(true);

    try {
      // Simulate agent progression with visual delays
      const simulateAgentProgress = async (agentIndex: number) => {
        setCurrentAgentIndex(agentIndex);
        setAgents(prev => prev.map((a, i) => ({
          ...a,
          status: i < agentIndex ? 'completed' : i === agentIndex ? 'processing' : 'waiting'
        })));
      };

      // Start agent 1 animation
      await simulateAgentProgress(0);

      const { data, error } = await supabase.functions.invoke('prompt-engineer', {
        body: { prompt: rawPrompt, promptType }
      });

      if (error) throw error;

      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
        resetAll();
        return;
      }

      if (data?.success && data?.agents) {
        // Animate through each agent with their actual output
        for (let i = 0; i < data.agents.length; i++) {
          await simulateAgentProgress(i);
          
          // Update the agent with its output
          setAgents(prev => prev.map((a, idx) => 
            idx === i ? { ...a, status: 'processing', output: data.agents[i].output } : a
          ));
          
          // Update live preview
          setLivePreview(data.agents[i].output);
          
          // Wait to show processing state
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Mark as completed
          setAgents(prev => prev.map((a, idx) => 
            idx === i ? { ...a, status: 'completed' } : a
          ));
        }

        setFinalOutput(data.finalPrompt);
        setLivePreview(data.finalPrompt);
        setCurrentAgentIndex(-1);

        // Deduct gems only on success
        const deductResult = await deductGems(tool?.gemCostKey || 'prompt-engineer');
        if (!deductResult.success) {
          console.warn("Failed to deduct gems");
        }

        toast({ title: "Prompt refined!", description: "Your prompt has been enhanced by all 5 agents" });
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error: any) {
      console.error("Refinement error:", error);
      toast({ title: "Processing failed", description: error.message || "Please try again", variant: "destructive" });
      resetAll();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyFinal = async () => {
    if (!finalOutput) return;
    await navigator.clipboard.writeText(finalOutput);
    setCopied(true);
    toast({ title: "Copied!", description: "Refined prompt copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const currentAgentName = currentAgentIndex >= 0 ? agents[currentAgentIndex]?.name : undefined;

  if (!tool) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-cream">Loading...</div>;
  }

  return (
    <ToolPageLayout
      toolId={tool.id}
      toolName={tool.name}
      toolDescription={tool.longDescription}
      gemCostKey={tool.gemCostKey}
      icon={tool.icon}
      badge={tool.badge}
    >
      <div className="w-full max-w-5xl mx-auto space-y-8 pb-24 md:pb-8">

        {/* Prompt Type Selector */}
        <PromptTypeSelector 
          selected={promptType} 
          onSelect={setPromptType}
          disabled={isProcessing}
        />

        {/* Input Zone */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-cream/70">
            Your Raw Prompt
          </label>
          <Textarea
            value={rawPrompt}
            onChange={(e) => setRawPrompt(e.target.value)}
            placeholder="Enter your prompt here... Be as rough or detailed as you like. Our AI agents will refine it."
            className="min-h-[150px] bg-charcoal border-border text-cream placeholder:text-cream/30 resize-none"
            disabled={isProcessing}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-cream/40">
              {rawPrompt.length} characters
            </span>
            <div className="flex items-center gap-2 text-xs text-cream/60">
              <Gem className="w-3 h-3 text-primary" />
              <span>{gemCost} gem per refinement</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleRefine}
            disabled={!canGenerate || isProcessing}
            className="flex-1 h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold"
          >
            {isProcessing ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Refine Prompt
              </>
            )}
          </Button>
          <Button
            onClick={() => {
              setRawPrompt('');
              resetAll();
            }}
            variant="outline"
            disabled={isProcessing}
            className="h-12 border-border hover:bg-muted"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Agent Pipeline */}
        {(isProcessing || finalOutput) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-cream/80 text-center">
              Agent Pipeline
            </h3>
            <AgentPipeline agents={agents} />
          </div>
        )}

        {/* Live Preview */}
        {(isProcessing || livePreview) && (
          <LivePreview 
            content={livePreview} 
            isProcessing={isProcessing}
            currentAgent={currentAgentName}
          />
        )}

        {/* Final Output Section */}
        {finalOutput && !isProcessing && (
          <div className="bg-gradient-to-br from-emerald-500/10 to-primary/5 border border-emerald-500/30 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Final Refined Prompt
              </h3>
              <Button
                onClick={handleCopyFinal}
                variant="outline"
                size="sm"
                className="border-emerald-500/30 hover:bg-emerald-500/10"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>
            <div className="bg-background/50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm text-cream/90 leading-relaxed">
                {finalOutput}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Low Balance Alert */}
      <LowBalanceAlert 
        isOpen={showLowBalance}
        onClose={() => setShowLowBalance(false)}
        currentBalance={gems ?? 0}
        requiredGems={gemCost}
      />

      {/* Processing Modal */}
      <ProcessingModal 
        isOpen={isProcessing} 
        featureName={tool.gemCostKey}
        customMessage={`Agent ${currentAgentIndex + 1} of 5: ${currentAgentName || 'Starting'}...`}
      />
    </ToolPageLayout>
  );
};

export default PromptEngineerPage;
