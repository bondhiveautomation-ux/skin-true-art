interface SelectionOption {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
}

interface SelectionGridProps {
  options: SelectionOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  columns?: 2 | 3 | 4;
  size?: "sm" | "md" | "lg";
}

export const SelectionGrid = ({
  options,
  selectedId,
  onSelect,
  disabled = false,
  columns = 2,
  size = "md",
}: SelectionGridProps) => {
  const columnClasses = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  };

  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-5",
  };

  return (
    <div className={`grid ${columnClasses[columns]} gap-3`}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          disabled={disabled}
          className={`relative rounded-xl border text-left transition-all duration-300 ${sizeClasses[size]} ${
            selectedId === option.id
              ? "border-gold/50 bg-gold/10 text-cream shadow-gold"
              : "border-gold/15 bg-charcoal-light text-cream/70 hover:border-gold/30 hover:bg-charcoal"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-start gap-2">
            {option.emoji && (
              <span className="text-base flex-shrink-0">{option.emoji}</span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{option.name}</p>
              {option.description && (
                <p className="text-xs text-cream/40 mt-0.5 line-clamp-2 font-light">
                  {option.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Selected indicator */}
          {selectedId === option.id && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold" />
          )}
        </button>
      ))}
    </div>
  );
};
