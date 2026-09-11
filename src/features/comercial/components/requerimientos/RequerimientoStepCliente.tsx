import { UserRound } from "lucide-react";

import { useCuentasComerciales } from "../../comercial.hooks";
import type { CuentaComercial } from "../../comercial.types";

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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold">
          Seleccionar cliente
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Selecciona el cliente asociado al requerimiento.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-secondary/30 p-5">
        <div className="mb-4 flex items-center gap-2">
          <UserRound className="h-5 w-5 text-primary" />

          <span className="font-medium">
            Cliente
          </span>
        </div>

        <label className="mb-2 block text-sm font-medium">
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
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
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

      {cuentaSeleccionada && (
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">
            Cliente seleccionado
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {cuentaSeleccionada.razon_social ||
              `${cuentaSeleccionada.nombres} ${cuentaSeleccionada.apellido_paterno}`}
          </p>

          {cuentaSeleccionada.numero_documento && (
            <p className="mt-1 text-xs text-muted-foreground">
              Documento:{" "}
              {cuentaSeleccionada.numero_documento}
            </p>
          )}
        </div>
      )}
    </div>
  );
}