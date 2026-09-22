import { CheckCircle, X } from "lucide-react";

interface ToastProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
}

export default function Toast({
  open,
  title,
  description,
  onClose,
}: ToastProps) {
  if (!open) return null;

  return (
    <div className="fixed right-6 top-6 z-[100] w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">
            {title}
          </h3>

          {description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}