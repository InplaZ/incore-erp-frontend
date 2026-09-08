import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>

function Card({ className = "", ...props }: CardProps) {
  const classes = [
    "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}

function CardHeader({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const classes = ["flex flex-col gap-1.5 p-6", className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}

function CardTitle({
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  const classes = [
    "text-lg font-semibold leading-none tracking-tight",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <h3 className={classes} {...props} />;
}

function CardDescription({
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  const classes = ["text-sm text-muted-foreground", className]
    .filter(Boolean)
    .join(" ");

  return <p className={classes} {...props} />;
}

function CardContent({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const classes = ["px-6 pb-6", className].filter(Boolean).join(" ");

  return <div className={classes} {...props} />;
}

function CardFooter({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const classes = ["flex items-center px-6 pb-6", className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}

function CardBody({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const classes = ["p-6", className].filter(Boolean).join(" ");

  return <div className={classes} {...props} />;
}

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardBody,
};
