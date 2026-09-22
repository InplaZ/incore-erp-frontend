import { Plus, Search, UserRound } from "lucide-react";
import { useState } from "react";

import { useCuentasComerciales } from "../../comercial.hooks";
import type { CuentaComercial } from "../../comercial.types";

import NuevoClienteModal from "@/features/comercial/components/NuevoClienteModal";

interface RequerimientoStepClienteProps {
  cuentaComercialId: number | null;
  setCuentaComercialId: (id: number | null) => void;
}

export default function RequerimientoStepCliente({
  cuentaComercialId,
  setCuentaComercialId,
}: RequerimientoStepClienteProps) {
  const {
    data: cuentas,
    isLoading: cuentasLoading,
  } = useCuentasComerciales();

  const cuentaSeleccionada = cuentas?.find(
    (cuenta: CuentaComercial) =>
      cuenta.id === cuentaComercialId,
  );

  const [busqueda, setBusqueda] = useState("");
  const [showNuevoCliente, setMostrarModal] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Encabezado */}
      <div>
        <h3 className="text-lg font-semibold">
          Seleccionar cliente
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Selecciona el cliente asociado al requerimiento.
        </p>
      </div>

      {/* Selección de cliente */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        {/* Título y acción */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/90">
              <UserRound className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">
                Cliente
              </p>

              <p className="text-xs text-muted-foreground">
                Cuenta asociada al requerimiento
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMostrarModal(true)}
            className="
            inline-flex shrink-0 items-center gap-2
            rounded-lg border border-border
            bg-background px-3 py-2
            text-sm font-medium
            text-foreground
            transition-colors
            hover:bg-secondary
          "
          >
            <Plus className="h-4 w-4" />
            Registrar cliente
          </button>
        </div>

        {/* Buscar cliente */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Buscar cliente
          </label>

          <div className="relative">
            <Search
              className="
                pointer-events-none
                absolute left-3 top-1/2
                h-4 w-4
                -translate-y-1/2
                text-muted-foreground
              "
            />

            <input
              type="text"
              value={busqueda}
              onChange={(event) =>
                setBusqueda(event.target.value)
              }
              placeholder="Buscar por nombre o código..."
              className="
                w-full rounded-lg
                border border-border
                bg-background
                py-2.5 pl-9 pr-3
                text-sm text-foreground
                outline-none
                transition-colors
                placeholder:text-muted-foreground
                focus:border-primary
                focus:ring-1 focus:ring-primary/20
              "
            />
          </div>

          <p className="mt-1.5 text-xs text-muted-foreground">
            Puedes buscar por nombre, razón social o código de cliente.
          </p>
        </div>

        {/* Seleccionar cuenta */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Cuenta comercial
          </label>

          <select
            value={cuentaComercialId ?? ""}
            onChange={(event) =>
              setCuentaComercialId(
                event.target.value
                  ? Number(event.target.value)
                  : null,
              )
            }
            disabled={cuentasLoading}
            className="
              w-full rounded-lg
              border border-border
              bg-background
              px-3 py-2.5
              text-sm text-foreground
              outline-none
              transition-colors
              focus:border-primary
              focus:ring-1 focus:ring-primary/20
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <option value="">
              {cuentasLoading
                ? "Cargando clientes..."
                : "Selecciona un cliente"}
            </option>

            {cuentas?.map((cuenta: CuentaComercial) => (
              <option
                key={cuenta.id}
                value={cuenta.id}
              >
                {cuenta.razon_social ||
                  `${cuenta.nombres} ${cuenta.apellido_paterno} ${cuenta.apellido_materno}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cliente seleccionado */}
      {cuentaSeleccionada && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <UserRound className="h-4 w-4 text-primary" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                Cliente seleccionado
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-foreground">
                {cuentaSeleccionada.razon_social ||
                  `${cuentaSeleccionada.nombres} ${cuentaSeleccionada.apellido_paterno}`}
              </p>

              {cuentaSeleccionada.numero_documento && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {cuentaSeleccionada.documento_identidad?.toUpperCase() || "Documento"}{" "}
                  {cuentaSeleccionada.numero_documento}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {showNuevoCliente && (
        <NuevoClienteModal
          open={showNuevoCliente}
          onClose={() => setMostrarModal(false)}
          onSuccess={() => setMostrarModal(false)}
        />
      )}
    </div>
  );
}