import {
  forwardRef,
  type SelectHTMLAttributes,
} from "react";

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      error = false,
      className = "",
      children,
      ...props
    },
    ref,
  ) {
    const classes = [
      "h-10 w-full rounded-md border border-border bg-background px-3",
      "text-sm text-foreground",
      "outline-none",
      "transition-colors",
      "focus:border-primary",
      "focus:ring-2",
      "focus:ring-primary/20",
      "disabled:cursor-not-allowed",
      "disabled:opacity-50",
      error
        ? [
            "border-destructive",
            "focus:border-destructive",
            "focus:ring-destructive/20",
          ].join(" ")
        : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <select
        ref={ref}
        className={classes}
        aria-invalid={error || undefined}
        {...props}
      >
        {children}
      </select>
    );
  },
);

export default Select;