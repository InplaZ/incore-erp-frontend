import {
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";

import type  RequirementStep  from "@/features/comercial/components/requerimientos/RequerimientoSteps";

interface RequerimientoNavigationProps {
  step: RequirementStep;
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitting?: boolean;
}

export default function RequerimientoNavigation({
  step,
  onNext,
  onPrevious,
  onCancel,
  onSubmit,
  submitting = false,
}: RequerimientoNavigationProps) {
  return (
    <div className="flex items-center justify-between border-t border-border px-6 py-4">
      <button
        type="button"
        onClick={
          step === 1
            ? onCancel
            : onPrevious
        }
        className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />

        {step === 1 ? "Cancelar" : "Anterior"}
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="hidden rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary sm:block"
        >
          Guardar borrador
        </button>

        {step < 5 ? (
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Continuar

            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="h-4 w-4" />

            {submitting
              ? "Registrando..."
              : "Registrar requerimiento"}
          </button>
        )}
      </div>
    </div>
  );
}