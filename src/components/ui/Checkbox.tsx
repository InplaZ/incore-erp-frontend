import { forwardRef, type InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  error?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { error = false, className = "", ...props },
  ref,
) {
  const classes = [
    "size-4 shrink-0 appearance-none",
    "rounded border border-border",
    "bg-background",
    "transition-colors",
    "checked:border-primary",
    "checked:bg-primary",
    "checked:before:block",
    "checked:before:text-center",
    "checked:before:text-xs",
    "checked:before:font-bold",
    "checked:before:text-primary-foreground",
    "checked:before:content-['✓']",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-primary/20",
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
    error ? "border-destructive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <input
      ref={ref}
      {...props}
      type="checkbox"
      className={classes}
      aria-invalid={error || undefined}
    />
  );
});

export default Checkbox;
