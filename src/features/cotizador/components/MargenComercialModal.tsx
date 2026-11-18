
import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

import {
  useCreateMargenComercial,
  useUpdateMargenComercial,
} from "../cotizador.hooks";

import type { MargenComercial } from "../cotizador.types";

interface MargenComercialModalProps {
  open: boolean;
  onClose: () => void;
  margen: MargenComercial | null;
  onSuccess: () => void;
}

export default function MargenComercialModal({
  open,
  onClose,
  margen,
  onSuccess,
}: MargenComercialModalProps) {
  const crearMargen = useCreateMargenComercial();
  const actualizarMargen = useUpdateMargenComercial();

  const [nombre, setNombre] = useState("");
  const [porcentaje, setPorcentaje] = useState("15");
  const [orden, setOrden] = useState("1");
  const [activo, setActivo] = useState(true);
  const [error, setError] = useState("");

  const editando = Boolean(margen);
  const guardando = crearMargen.isPending || actualizarMargen.isPending;

  useEffect(() => {
    if (!open) return;

    if (margen) {
      setNombre(margen.nombre);
      setPorcentaje(margen.porcentaje);
      setOrden(String(margen.orden));
      setActivo(margen.activo);
    } else {
      setNombre("");
      setPorcentaje("15");
      setOrden("1");
      setActivo(true);
    }

    setError("");
  }, [open, margen]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const porcentajeNumero = Number(porcentaje);
    const ordenNumero = Number(orden);

    if (!nombre.trim()) {
      setError("Ingresa el nombre del margen comercial.");
      return;
    }

    if (
      porcentaje.trim() === "" ||
      !Number.isFinite(porcentajeNumero) ||
      porcentajeNumero < 0 ||
      porcentajeNumero > 100
    ) {
      setError("El porcentaje debe estar entre 0 y 100.");
      return;
    }

    if (
      orden.trim() === "" ||
      !Number.isInteger(ordenNumero) ||
      ordenNumero < 0
    ) {
      setError("El orden debe ser un número entero mayor o igual a cero.");
      return;
    }

    const data = {
      nombre: nombre.trim(),
      porcentaje: porcentajeNumero.toFixed(2),
      orden: ordenNumero,
      activo,
    };

    try {
      if (margen) {
        await actualizarMargen.mutateAsync({
          id: margen.id,
          data,
        });
      } else {
        await crearMargen.mutateAsync(data);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error al guardar margen comercial:", err);
      setError("No se pudo guardar el margen comercial. Intenta nuevamente.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
        {/* ENCABEZADO */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editando ? "Editar margen comercial" : "Nuevo margen comercial"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Configura el porcentaje de margen de venta.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-5">
            {/* NOMBRE */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Nombre del margen
              </label>

              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Mayorista"
                maxLength={100}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={guardando}
              />
            </div>

            {/* PORCENTAJE */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Porcentaje de margen
              </label>

              <div className="relative">
                <input
                  type="number"
                  value={porcentaje}
                  onChange={(e) => setPorcentaje(e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="15.00"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={guardando}
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  %
                </span>
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Porcentaje aplicado sobre el costo base del producto.
              </p>
            </div>

            {/* ORDEN */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Orden de visualización
              </label>

              <input
                type="number"
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                min="0"
                step="1"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={guardando}
              />
            </div>

            {/* ESTADO */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Estado del margen
                </p>
                <p className="text-xs text-gray-500">
                  Determina si estará disponible en el cotizador.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={activo}
                onClick={() => setActivo((prev) => !prev)}
                disabled={guardando}
                className={`relative h-6 w-11 rounded-full transition ${
                  activo ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                    activo ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* ACCIONES */}
          <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {guardando && <Loader2 size={16} className="animate-spin" />}
              {guardando
                ? "Guardando..."
                : editando
                  ? "Guardar cambios"
                  : "Registrar margen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
