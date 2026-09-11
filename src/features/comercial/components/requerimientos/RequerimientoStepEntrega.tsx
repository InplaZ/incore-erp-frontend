import { Truck } from "lucide-react";

import type { PrioridadSolicitud } from "../../comercial.types";

interface RequerimientoStepEntregaProps {
  cantidad: string;
  setCantidad: (value: string) => void;

  prioridad: PrioridadSolicitud;
  setPrioridad: (value: PrioridadSolicitud) => void;

  fechaEntrega: string;
  setFechaEntrega: (value: string) => void;

  observaciones: string;
  setObservaciones: (value: string) => void;
}

export default function RequerimientoStepEntrega({
  cantidad,
  setCantidad,
  prioridad,
  setPrioridad,
  fechaEntrega,
  setFechaEntrega,
  observaciones,
  setObservaciones,
}: RequerimientoStepEntregaProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold">
          Cantidad y entrega
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Define la cantidad y las condiciones solicitadas.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Cantidad
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={cantidad}
            onChange={(event) =>
              setCantidad(event.target.value)
            }
            placeholder="Ej. 5000"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Prioridad
          </label>

          <select
            value={prioridad}
            onChange={(event) =>
              setPrioridad(
                event.target.value as PrioridadSolicitud,
              )
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="baja">Baja</option>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Fecha solicitada de entrega
          </label>

          <input
            type="date"
            value={fechaEntrega}
            onChange={(event) =>
              setFechaEntrega(event.target.value)
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4">
          <Truck className="h-5 w-5 shrink-0 text-primary" />

          <div>
            <p className="text-sm font-medium">
              Fecha solicitada
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Será evaluada durante la revisión de viabilidad.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Observaciones
        </label>

        <textarea
          value={observaciones}
          onChange={(event) =>
            setObservaciones(event.target.value)
          }
          rows={5}
          placeholder="Observaciones adicionales del requerimiento..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>
    </div>
  );
}