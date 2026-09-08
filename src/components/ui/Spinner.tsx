import type { HTMLAttributes } from "react";

type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-8 border-[3px]",
};

function Spinner({ size = "md", className = "", ...props }: SpinnerProps) {
  const classes = [
    "animate-spin rounded-full border-current border-t-transparent",
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div role="status" className={classes} {...props} />;
}

export default Spinner;
