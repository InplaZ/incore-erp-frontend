
import { useEffect, useState } from "react";
import { Printer, X } from "lucide-react";

import {
  useCreateTarifaImpresion,
  useTarifasImpresion,
  useUpdateTarifaImpresion,
} from "../cotizador.hooks";

import type { TarifaImpresion } from "../cotizador.types";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

const labelClass =
  "mb-1.5 block text-xs font-semibold text-muted-foreground";

interface TarifaImpresionModalProps {
  open: boolean;
  onClose: () => void;
  tarifa: TarifaImpresion | null;
  onSuccess: () => void;
}

interface TarifaForm {
  nombre: string;
  categoria_colores: "" | "1" | "2" | "3" | "4" | "FULL";
  importe: string;
  activo: boolean;
}

const initialForm: TarifaForm = {
  nombre: "",
  categoria_colores: "",
  importe: "",
  activo: true,
};

export default function TarifaImpresionModal({
  open,
  onClose,
  tarifa,
  onSuccess,
}: TarifaImpresionModalProps) {
  const create = useCreateTarifaImpresion();
  const { data: tarifasData } = useTarifasImpresion();
  const update = useUpdateTarifaImpresion();

  const isEditing = tarifa !== null;
  const isPending = create.isPending || update.isPending;

  const [form, setForm] = useState<TarifaForm>(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (tarifa) {
      setForm({
        nombre: tarifa.nombre,
        categoria_colores: tarifa.categoria_colores ?? "",
        importe: tarifa.importe,
        activo: tarifa.activo,
      });
    } else {
      setForm(initialForm);
    }

    setError("");
    create.reset();
    update.reset();
  }, [open, tarifa?.id]);

  if (!open) return null;

  const updateField = <K extends keyof TarifaForm>(
    key: K,
    value: TarifaForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const submit = async () => {
    setError("");

    const nombre = form.nombre.trim();
    const importe = Number(form.importe);

    if (!nombre) {
      setError("Ingresa el nombre de la tarifa de impresión.");
      return;
    }

    if (!form.categoria_colores) {
      setError("Selecciona la categoría de colores.");
      return;
    }

    if (
      !form.importe.trim() ||
      !Number.isFinite(importe) ||
      importe < 0
    ) {
      setError("Ingresa un importe por cara válido, mayor o igual a cero.");
      return;
    }

    const categoriaEnUso = tarifasData?.some(
      (item) => item.id !== tarifa?.id && item.categoria_colores === form.categoria_colores,
    );
    if (categoriaEnUso) {
      setError("Ya existe una tarifa con esa categoría. Cada categoría solo puede configurarse una vez.");
      return;
    }

    const payload = {
      nombre,
      categoria_colores: form.categoria_colores,
      importe: form.importe.trim(),
      activo: form.activo,
    };

    try {
      if (tarifa) {
        await update.mutateAsync({
          id: tarifa.id,
          data: payload,
        });
      } else {
        await create.mutateAsync(payload);
      }

      onSuccess();
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo guardar la tarifa. Verifica los datos e inténtalo nuevamente.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="tarifa-modal-title"
        className="flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Printer className="h-5 w-5" />
            </span>

            <div>
              <h2
                id="tarifa-modal-title"
                className="text-lg font-bold text-foreground"
              >
                {isEditing ? "Editar tarifa" : "Nueva tarifa"}
              </h2>

              <p className="text-xs text-muted-foreground">
                Configura la tarifa de impresión por kilogramo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Cerrar"
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          <Field label="Nombre de la tarifa *">
            <input
              autoFocus
              required
              maxLength={150}
              className={inputClass}
              placeholder="Ej. 1 a 2 colores"
              value={form.nombre}
              onChange={(e) => updateField("nombre", e.target.value)}
            />
          </Field>

          <Field label="Categoría de colores *">
            <select
              required
              className={inputClass}
              value={form.categoria_colores}
              onChange={(e) => updateField("categoria_colores", e.target.value as TarifaForm["categoria_colores"])}
            >
              <option value="">Seleccionar categoría</option>
              <option value="1">1 color</option>
              <option value="2">2 colores</option>
              <option value="3">3 colores</option>
              <option value="4">4 colores</option>
              <option value="FULL">FULL · más de 4 colores</option>
            </select>
          </Field>

          <Field label="Importe fijo por cara (Bs) *">
            <input
              required
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              placeholder="0.00"
              value={form.importe}
              onChange={(e) =>
                updateField("importe", e.target.value)
              }
            />
          </Field>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Tarifa activa
              </p>
              <p className="text-xs text-muted-foreground">
                Disponible para utilizar en nuevas cotizaciones.
              </p>
            </div>

            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) =>
                updateField("activo", e.target.checked)
              }
              className="h-4 w-4 accent-primary"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}
        </div>

        <footer className="flex justify-end gap-2 border-t border-border px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {isPending
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear tarifa"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}
