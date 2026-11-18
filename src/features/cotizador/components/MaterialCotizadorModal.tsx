
import { useEffect, useState } from "react";
import { Package, X } from "lucide-react";

import {
  useCreateMaterialCotizador,
  useUpdateMaterialCotizador,
} from "../cotizador.hooks";

import type {
  MaterialCotizador,
  TipoMaterialCotizador,
  CategoriaMaterialCotizador,
} from "../cotizador.types";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

const labelClass =
  "mb-1.5 block text-xs font-semibold text-muted-foreground";

interface MaterialCotizadorModalProps {
  open: boolean;
  onClose: () => void;
  material: MaterialCotizador | null;
  onSuccess: (material: MaterialCotizador) => void;
}

interface MaterialForm {
  nombre: string;
  costo_por_kg: string;
  tipo_material: TipoMaterialCotizador | "";
  categoria: CategoriaMaterialCotizador | "";
  orden: string;
  activo: boolean;
}

const initialForm: MaterialForm = {
  nombre: "",
  costo_por_kg: "",
  tipo_material: "",
  categoria: "",
  orden: "1",
  activo: true,
};

export default function MaterialCotizadorModal({
  open,
  onClose,
  material,
  onSuccess,
}: MaterialCotizadorModalProps) {
  const create = useCreateMaterialCotizador();
  const update = useUpdateMaterialCotizador();

  const isEditing = material !== null;
  const isPending = create.isPending || update.isPending;

  const [form, setForm] = useState<MaterialForm>(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (material) {
      setForm({
        nombre: material.nombre,
        costo_por_kg: material.costo_por_kg,
        tipo_material: material.tipo_material,
        categoria: material.categoria,
        orden: String(material.orden),
        activo: material.activo,
      });
    } else {
      setForm(initialForm);
    }

    setError("");
    create.reset();
    update.reset();
  }, [open, material?.id]);

  if (!open) return null;

  const updateField = <K extends keyof MaterialForm>(
    key: K,
    value: MaterialForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const submit = async () => {
    setError("");

    const nombre = form.nombre.trim();
    const costo = Number(form.costo_por_kg);
    const orden = Number(form.orden);

    if (!nombre) {
      setError("Ingresa el nombre del material.");
      return;
    }
    if (!form.tipo_material) {
      setError("Selecciona el tipo de material.");
      return;
    }
    if (!form.categoria) {
      setError("Selecciona la categoría del material.");
      return;
    }
    if (
      !form.costo_por_kg.trim() ||
      !Number.isFinite(costo) ||
      costo < 0
    ) {
      setError("Ingresa un costo por kilogramo válido.");
      return;
    }
    if (
      !form.orden.trim() ||
      !Number.isInteger(orden) ||
      orden < 0
    ) {
      setError("El orden debe ser un número entero mayor o igual a cero.");
      return;
    }

    const payload = {
      nombre,
      costo_por_kg: form.costo_por_kg.trim(),
      tipo_material: form.tipo_material,
      categoria: form.categoria,
      orden,
      activo: form.activo,
    };

    try {
      const guardado = material
        ? await update.mutateAsync({ id: material.id, data: payload })
        : await create.mutateAsync(payload);

      onSuccess(guardado);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo guardar el material. Verifica los datos e inténtalo nuevamente.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="material-modal-title"
        className="flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </span>

            <div>
              <h2
                id="material-modal-title"
                className="text-lg font-bold text-foreground"
              >
                {isEditing ? "Editar material" : "Nuevo material"}
              </h2>

              <p className="text-xs text-muted-foreground">
                Configura el material y su costo por kilogramo.
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
          <Field label="Nombre del material *">
            <input
              autoFocus
              required
              maxLength={150}
              className={inputClass}
              placeholder="Ej. Polietileno de baja densidad"
              value={form.nombre}
              onChange={(e) => updateField("nombre", e.target.value)}
            />
          </Field>
          <Field label="Tipo de material *">
            <select
              required
              className={inputClass}
              value={form.tipo_material}
              onChange={(e) =>
                updateField(
                  "tipo_material",
                  e.target.value as TipoMaterialCotizador | "",
                )
              }
            >
              <option value="">Selecciona un tipo</option>
              <option value="PEBD">PEBD - Baja densidad</option>
              <option value="PEAD">PEAD - Alta densidad</option>
              <option value="PP">PP - Polipropileno</option>
              <option value="OTRO">Otro</option>
            </select>
          </Field>

          <Field label="Categoría *">
            <select
              required
              className={inputClass}
              value={form.categoria}
              onChange={(e) =>
                updateField(
                  "categoria",
                  e.target.value as CategoriaMaterialCotizador | "",
                )
              }
            >
              <option value="">Selecciona una categoría</option>
              <option value="COLOR">Color</option>
              <option value="ESPECIAL">Especial</option>
            </select>
          </Field>

          <Field label="Costo por kilogramo (Bs) *">
            <input
              required
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              placeholder="0.00"
              value={form.costo_por_kg}
              onChange={(e) =>
                updateField("costo_por_kg", e.target.value)
              }
            />
          </Field>

          <Field label="Orden de visualización *">
            <input
              required
              type="number"
              min="0"
              step="1"
              className={inputClass}
              value={form.orden}
              onChange={(e) => updateField("orden", e.target.value)}
            />
          </Field>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Material activo
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
                : "Crear material"}
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
