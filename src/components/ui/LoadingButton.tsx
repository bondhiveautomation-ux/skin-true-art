import { Loader2 } from "lucide-react";
import { Button, ButtonProps } from "./button";
import { ReactNode } from "react";

interface LoadingButtonProps extends ButtonProps {
  isLoading: boolean;
  loadingText?: string;
  children: ReactNode;
}

export const LoadingButton = ({
  isLoading,
  loadingText,
  children,
  disabled,
  className = "",
  variant = "gold",
  ...props
}: LoadingButtonProps) => {
  return (
    <Button
      disabled={isLoading || disabled}
      className={`${className}`}
      variant={variant}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || "Processing..."}
        </>
      ) : (
        children
      )}
    </Button>
  );
};
