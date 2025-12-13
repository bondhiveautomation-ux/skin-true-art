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
  ...props
}: LoadingButtonProps) => {
  return (
    <Button
      disabled={isLoading || disabled}
      className={`relative ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {loadingText || "Processing..."}
        </>
      ) : (
        children
      )}
    </Button>
  );
};
