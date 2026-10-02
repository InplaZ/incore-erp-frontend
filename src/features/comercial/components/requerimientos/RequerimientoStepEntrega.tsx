import type {
  PrioridadSolicitud,
  ProductoBusquedaResultado,
} from "../../comercial.types";

import { useCuentasComerciales } from "@/features/comercial/comercial.hooks";
import  NuevoClienteModal from "@/features/comercial/components/NuevoClienteModal"; 
import { useState } from "react";

interface RequerimientoStepEntregaProps {
  cuentaComercialId: number | null;
  setCuentaComercialId: (value: number | null) => void;
  productoSeleccionado: ProductoBusquedaResultado | null;
  cantidadUnidades: string;
  setCantidadUnidades: (value: string) => void;

  prioridad: PrioridadSolicitud;
  setPrioridad: (value: PrioridadSolicitud) => void;

  fechaEntrega: string;
  setFechaEntrega: (value: string) => void;

  lugarEntrega: string;
  setLugarEntrega: (value: string) => void;

  observaciones: string;
  setObservaciones: (value: string) => void;
}

export default function RequerimientoStepEntrega({
  cuentaComercialId,
  setCuentaComercialId,
  productoSeleccionado,
  cantidadUnidades,
  setCantidadUnidades,
  prioridad,
  setPrioridad,
  fechaEntrega,
  setFechaEntrega,
  lugarEntrega,
  setLugarEntrega,
  observaciones,
  setObservaciones,
}: RequerimientoStepEntregaProps) {
  const { data: cuentas = [] } = useCuentasComerciales();
  const [ showNuevoClienteModal, setShowNuevoClienteModal ] = useState(false);
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
      {productoSeleccionado && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4">
            <h4 className="font-semibold text-foreground">
              Cliente
            </h4>

            <p className="mt-1 text-sm text-muted-foreground">
              Selecciona el cliente que realizará este pedido.
            </p>
          </div>

          <label className="mb-2 block text-sm font-medium">
            Cliente
          </label>

          <select
            value={cuentaComercialId ?? ""}
            onChange={(event) => {
              const value = event.target.value;

              setCuentaComercialId(
                value ? Number(value) : null
              );
            }}
            className="
        w-full rounded-lg
        border border-border
        bg-background
        px-3 py-2.5
        text-sm
        outline-none
        focus:border-primary
      "
          >
            <option value="">
              Seleccionar cliente
            </option>

            {cuentas.map((cuenta) => (
              <option
                key={cuenta.id}
                value={cuenta.id}
              >
                {cuenta.razon_social
                  ? `${cuenta.razon_social} — ${cuenta.nombres ?? ""} ${cuenta.apellido_paterno ?? ""}`.trim()
                  : `${cuenta.nombres ?? ""} ${cuenta.apellido_paterno ?? ""}`.trim()}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="
        mt-3 inline-flex items-center
        rounded-lg border border-border
        px-3 py-2
        text-sm font-medium
        hover:bg-muted/40
      "
            onClick={() => setShowNuevoClienteModal(true)}
          >
            + Nuevo cliente
          </button>
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Cantidad
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={cantidadUnidades}
            onChange={(event) =>
              setCantidadUnidades(event.target.value)
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
        <div>
          <label className="mb-2 block text-sm font-medium">
            Lugar de entrega
          </label>

          <textarea
            value={lugarEntrega}
            onChange={(event) =>
              setLugarEntrega(event.target.value)
            }
            rows={3}
            placeholder="Ej. Planta INPLAZ, almacén del cliente..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
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
        <NuevoClienteModal
          open={showNuevoClienteModal}
          onClose={() => setShowNuevoClienteModal(false)}
        />

      </div>
    </div>
  );
}