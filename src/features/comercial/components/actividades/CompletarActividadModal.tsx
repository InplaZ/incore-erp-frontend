import { useEffect, useState } from "react";
import {
  CheckCircle2,
  X,
  FileText,
} from "lucide-react";

import { useUpdateActividadComercial } from "@/features/comercial/comercial.hooks";

import type { ActividadComercial } from "@/features/comercial/comercial.types";

interface CompletarActividadModalProps {
  open: boolean;
  actividad: ActividadComercial | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CompletarActividadModal({
  open,
  actividad,
  onClose,
  onSuccess,
}: CompletarActividadModalProps) {
  const updateActividad = useUpdateActividadComercial();

  const [resultado, setResultado] = useState("");

  useEffect(() => {
    if (!open) return;

    setResultado("");
    updateActividad.reset();
  }, [open]);

  if (!open || !actividad) {
    return null;
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const resultadoLimpio = resultado.trim();

    if (!resultadoLimpio) {
      return;
    }

    try {
      await updateActividad.mutateAsync({
        id: actividad.id,
        data: {
          estado: "completada",
          fecha_completada: new Date().toISOString(),
          resultado: resultadoLimpio,
        },
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(
        "Error al completar actividad:",
        error,
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Completar actividad
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Registra el resultado de la actividad.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={updateActividad.isPending}
            className="
              rounded-md p-1.5
              text-muted-foreground
              transition-colors
              hover:bg-secondary
              hover:text-foreground
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENT */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
            {/* ACTIVIDAD */}
            <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Actividad
              </p>

              <p className="mt-1 text-sm font-medium text-foreground">
                {actividad.descripcion}
              </p>
            </div>

            {/* RESULTADO */}
            <div>
              <label
                htmlFor="resultado-actividad"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Resultado
              </label>

              <div className="relative">
                <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <textarea
                  id="resultado-actividad"
                  value={resultado}
                  onChange={(event) =>
                    setResultado(event.target.value)
                  }
                  placeholder="Describe qué ocurrió durante la actividad..."
                  rows={5}
                  disabled={updateActividad.isPending}
                  className="
                    w-full
                    resize-none
                    rounded-lg
                    border border-border
                    bg-background
                    py-2.5 pl-10 pr-4
                    text-sm
                    text-foreground
                    outline-none
                    transition
                    placeholder:text-muted-foreground
                    focus:border-primary
                    focus:ring-2
                    focus:ring-primary/20
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                  required
                />
              </div>
            </div>

            {/* ERROR */}
            {updateActividad.isError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                No se pudo completar la actividad.
                Verifica los datos e inténtalo nuevamente.
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-3 border-t border-border bg-secondary/30 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={updateActividad.isPending}
              className="
                rounded-lg
                border border-border
                bg-background
                px-4 py-2.5
                text-sm
                font-medium
                text-foreground
                transition-colors
                hover:bg-secondary
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                updateActividad.isPending ||
                !resultado.trim()
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                bg-primary
                px-4 py-2.5
                text-sm
                font-medium
                text-primary-foreground
                transition-colors
                hover:bg-primary/90
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <CheckCircle2 className="h-4 w-4" />

              {updateActividad.isPending
                ? "Completando..."
                : "Completar actividad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

