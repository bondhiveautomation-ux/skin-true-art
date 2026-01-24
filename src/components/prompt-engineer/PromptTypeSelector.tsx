import { Image, FileText, Code, Mail, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type PromptType = 'image' | 'pdf' | 'code' | 'email' | 'general';

interface PromptTypeSelectorProps {
  selected: PromptType;
  onSelect: (type: PromptType) => void;
  disabled?: boolean;
}

const PROMPT_TYPES: { id: PromptType; label: string; icon: typeof Image; description: string }[] = [
  { id: 'image', label: 'Image', icon: Image, description: 'AI image generation' },
  { id: 'pdf', label: 'Document', icon: FileText, description: 'Reports & PDFs' },
  { id: 'code', label: 'Code', icon: Code, description: 'Programming tasks' },
  { id: 'email', label: 'Email', icon: Mail, description: 'Communications' },
  { id: 'general', label: 'General', icon: Wand2, description: 'Catch-all' },
];

export const PromptTypeSelector = ({ selected, onSelect, disabled }: PromptTypeSelectorProps) => {
  return (
    <div className="w-full">
      <label className="text-sm font-medium text-white/70 mb-3 block">
        What type of prompt is this?
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {PROMPT_TYPES.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300",
              "hover:scale-105 active:scale-95",
              disabled && "opacity-50 cursor-not-allowed hover:scale-100",
              selected === id 
                ? "border-amber-500 bg-amber-500/10 text-amber-400" 
                : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10"
            )}
          >
            <Icon className={cn(
              "w-6 h-6 mb-2 transition-colors",
              selected === id ? "text-amber-400" : "text-white/40"
            )} />
            <span className="font-semibold text-sm">{label}</span>
            <span className="text-xs text-white/40 mt-1 text-center">{description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
