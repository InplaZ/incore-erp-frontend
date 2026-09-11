import { Check } from "lucide-react";

import type { CuentaComercial } from "../../comercial.types";
import type { ProductType } from "./RequerimientoStepProducto";

interface RequerimientoStepConfirmacionProps {
  cuentaSeleccionada?: CuentaComercial;

  product: ProductType;

  cantidad: string;
  prioridad: string;
  fechaEntrega: string;

  descripcion: string;
  observaciones: string;
}

export default function RequerimientoStepConfirmacion({
  cuentaSeleccionada,
  product,
  cantidad,
  prioridad,
  fechaEntrega,
  descripcion,
  observaciones,
}: RequerimientoStepConfirmacionProps) {
  const nombreCliente = cuentaSeleccionada
    ? cuentaSeleccionada.razon_social ||
      `${cuentaSeleccionada.nombres} ${cuentaSeleccionada.apellido_paterno}`
    : "No seleccionado";

  const nombreProducto =
    product === "bag"
      ? "Bolsas"
      : product === "roll"
        ? "Bobinas"
        : product === "other"
          ? "Otro producto"
          : "No seleccionado";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold">
          Confirmar requerimiento
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Revisa la información antes de registrar la solicitud.
        </p>
      </div>

      <div className="space-y-4">
        <SummaryItem
          label="Cliente"
          value={nombreCliente}
        />

        <SummaryItem
          label="Producto"
          value={nombreProducto}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryItem
            label="Cantidad"
            value={cantidad || "No definida"}
          />

          <SummaryItem
            label="Prioridad"
            value={prioridad}
            capitalize
          />
        </div>

        <SummaryItem
          label="Fecha solicitada"
          value={fechaEntrega || "No definida"}
        />

        {descripcion && (
          <SummaryItem
            label="Descripción"
            value={descripcion}
          />
        )}

        {observaciones && (
          <SummaryItem
            label="Observaciones"
            value={observaciones}
          />
        )}
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-4 w-4 text-primary" />
          </div>

          <div>
            <p className="text-sm font-medium">
              Listo para registrar
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              El requerimiento será enviado a revisión de viabilidad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SummaryItemProps {
  label: string;
  value: string;
  capitalize?: boolean;
}

function SummaryItem({
  label,
  value,
  capitalize = false,
}: SummaryItemProps) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>

      <p
        className={[
          "mt-1 text-sm font-medium",
          capitalize ? "capitalize" : "",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}