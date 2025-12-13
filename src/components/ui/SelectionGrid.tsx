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
    <div className={`grid ${columnClasses[columns]} gap-2`}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          disabled={disabled}
          className={`relative rounded-xl border text-left transition-all duration-300 ${sizeClasses[size]} ${
            selectedId === option.id
              ? "border-foreground/30 bg-accent text-foreground"
              : "border-border bg-secondary/30 text-muted-foreground hover:border-border hover:bg-secondary/50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-start gap-2">
            {option.emoji && (
              <span className="text-base flex-shrink-0">{option.emoji}</span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{option.name}</p>
              {option.description && (
                <p className="text-xs opacity-60 mt-0.5 line-clamp-2">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
