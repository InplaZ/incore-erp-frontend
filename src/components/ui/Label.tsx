import type { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

function Label({ className = "", ...props }: LabelProps) {
  const classes = [
    "text-sm font-medium text-foreground",
    "peer-disabled:cursor-not-allowed",
    "peer-disabled:opacity-50",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <label className={classes} {...props} />;
}

export default Label;
