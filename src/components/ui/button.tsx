import * as React from "react";
import { cn } from "../../utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium";
    const variantStyles =
      variant === "outline"
        ? "border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
        : "bg-green-600 text-white hover:bg-green-700";

    return (
      <button ref={ref} className={cn(baseStyles, variantStyles, className)} {...props} />
    );
  }
);
Button.displayName = "Button";
