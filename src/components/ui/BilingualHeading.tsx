import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BilingualHeadingProps {
  english: ReactNode;
  bangla: string;
  as?: "h1" | "h2" | "h3" | "h4";
  className?: string;
  banglaClassName?: string;
  layout?: "stacked" | "inline";
}

/**
 * Bilingual heading component that displays English as primary text
 * with Bangla translation as a sub-caption.
 */
export const BilingualHeading = ({
  english,
  bangla,
  as: Tag = "h2",
  className,
  banglaClassName,
  layout = "stacked",
}: BilingualHeadingProps) => {
  if (layout === "inline") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
        <Tag className={cn("font-serif font-semibold text-cream tracking-tight", className)}>
          {english}
        </Tag>
        <span 
          className={cn(
            "font-bangla text-cream/60 font-normal mt-1 sm:mt-0",
            banglaClassName
          )}
        >
          {bangla}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Tag className={cn("font-serif font-semibold text-cream tracking-tight", className)}>
        {english}
      </Tag>
      <span 
        className={cn(
          "font-bangla text-cream/60 font-normal mt-1 text-sm sm:text-base",
          banglaClassName
        )}
      >
        {bangla}
      </span>
    </div>
  );
};
