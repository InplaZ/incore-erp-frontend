import type {
  PrioridadSolicitud,
  ProductoBusquedaResultado,
  TipoLugarEntrega,
  DepartamentoBolivia,
  SucursalEntrega,
} from "../../comercial.types";

import { useCuentasComerciales } from "@/features/comercial/comercial.hooks";
import NuevoClienteModal from "@/features/comercial/components/NuevoClienteModal";
import { useState, useEffect } from "react";

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

  tipoLugarEntrega: TipoLugarEntrega;
  setTipoLugarEntrega: (value: TipoLugarEntrega) => void;

  departamentoEntrega: DepartamentoBolivia | "";
  setDepartamentoEntrega: (
    value: DepartamentoBolivia | ""
  ) => void;

  empresaTransporte: string;
  setEmpresaTransporte: (value: string) => void;

  sucursalEntrega: SucursalEntrega | "";
  setSucursalEntrega: (value: SucursalEntrega | "") => void;
  showCantidad?: boolean;
  showCliente?: boolean;
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
  tipoLugarEntrega,
  setTipoLugarEntrega,
  departamentoEntrega,
  setDepartamentoEntrega,
  empresaTransporte,
  setEmpresaTransporte,
  sucursalEntrega,
  setSucursalEntrega,
  showCantidad = true,
  showCliente = true,
}: RequerimientoStepEntregaProps) {
  const { data: cuentas = [] } = useCuentasComerciales();
  const [showNuevoClienteModal, setShowNuevoClienteModal] = useState(false);

  // Cuando se selecciona "Ubicación del cliente", autocompletar con la dirección del cliente
  useEffect(() => {
  if (tipoLugarEntrega === "cliente" && cuentaComercialId) {
    const clienteSeleccionado = cuentas.find(
      (cuenta) => cuenta.id === cuentaComercialId
    );

    setLugarEntrega(clienteSeleccionado?.direccion ?? "");
    return;
  }

  if (tipoLugarEntrega === "sucursal") {
    const direccionesSucursal: Record<SucursalEntrega, string> = {
      montes: "Sucursal Av. Montes",
      sucursal_santa_cruz: "Sucursal Santa Cruz",
    };

    setLugarEntrega(
      sucursalEntrega
        ? direccionesSucursal[sucursalEntrega]
        : ""
    );
    return;
  }

  if (tipoLugarEntrega === "casa_matriz") {
    setLugarEntrega("");
    return;
  }

  if (tipoLugarEntrega === "envio_interior") {
    setLugarEntrega("");
  }
}, [
  tipoLugarEntrega,
  cuentaComercialId,
  cuentas,
  sucursalEntrega,
  setLugarEntrega,
]);

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
      {showCliente && productoSeleccionado && (
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
        {showCantidad && <div>
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
        </div>}


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
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            Tipo de entrega
          </label>

          <select
            value={tipoLugarEntrega}
            onChange={(event) =>
              setTipoLugarEntrega(
                event.target.value as TipoLugarEntrega
              )
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="casa_matriz">
              INPLAZ - Casa Matriz
            </option>
            <option value="cliente">
              Ubicación del cliente
            </option>
            <option value="envio_interior">
              Envío al interior
            </option>
            <option value="sucursal">
              Recojo en sucursal
            </option>
          </select>
        </div>

        {tipoLugarEntrega === "envio_interior" && (
          <>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Departamento de destino
              </label>

              <select
                value={departamentoEntrega}
                onChange={(event) =>
                  setDepartamentoEntrega(
                    event.target.value as DepartamentoBolivia | ""
                  )
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">Seleccionar departamento</option>
                <option value="LP">La Paz</option>
                <option value="CB">Cochabamba</option>
                <option value="SC">Santa Cruz</option>
                <option value="OR">Oruro</option>
                <option value="PT">Potosí</option>
                <option value="CH">Chuquisaca</option>
                <option value="TJ">Tarija</option>
                <option value="BN">Beni</option>
                <option value="PD">Pando</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Empresa de transporte
              </label>

              <input
                type="text"
                value={empresaTransporte}
                onChange={(event) =>
                  setEmpresaTransporte(event.target.value)
                }
                placeholder="Ej. Transporte elegido por el cliente"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </>
        )}

        {tipoLugarEntrega === "sucursal" && (
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Sucursal de recojo
            </label>

            <select
              value={sucursalEntrega}
              onChange={(event) =>
                setSucursalEntrega(
                  event.target.value as SucursalEntrega | ""
                )
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="">Seleccionar sucursal</option>
              <option value="montes">Sucursal Av. Montes</option>
              <option value="sucursal_santa_cruz">
                Sucursal Santa Cruz
              </option>
            </select>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            {tipoLugarEntrega === "cliente"
              ? "Dirección del cliente"
              : tipoLugarEntrega === "envio_interior"
                ? "Dirección o destino de envío"
                : tipoLugarEntrega === "sucursal"
                  ? "Detalles adicionales del recojo"
                  : "Dirección o detalle de entrega"}
          </label>

          <textarea
            value={lugarEntrega}
            onChange={(event) =>
              setLugarEntrega(event.target.value)
            }
            rows={3}
            placeholder="Ingresa la dirección o los detalles necesarios..."
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
          placeholder="Observaciones adicionales de la cotización..."
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
