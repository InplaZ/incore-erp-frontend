import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  Users,
  FileText,
  CheckCircle2,
  X,
} from "lucide-react";

import {
  useCreateActividadComercial,
} from "../comercial.hooks";

import {
  useCuentasComerciales,
} from "../comercial.hooks";

import type {
  ActividadComercialCreate,
  TipoActividad,
} from "../comercial.types";

interface NuevaActividadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const tiposActividad: {
  value: TipoActividad;
  label: string;
}[] = [
  {
    value: "llamada",
    label: "Llamada",
  },
  {
    value: "reunion",
    label: "Reunión",
  },
  {
    value: "cotizacion",
    label: "Cotización",
  },
  {
    value: "seguimiento",
    label: "Seguimiento",
  },
  {
    value: "confirmacion",
    label: "Confirmación",
  },
];

function getClientName(
  client: {
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    razon_social: string;
    tipo_persona: string;
  },
) {
  if (client.tipo_persona === "juridica") {
    return client.razon_social || "Sin razón social";
  }

  return [
    client.nombres,
    client.apellido_paterno,
    client.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ");
}

function getCurrentDateTime() {
  const now = new Date();

  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

export default function NuevaActividadModal({
  open,
  onClose,
  onSuccess,
}: NuevaActividadModalProps) {
  const createActividad = useCreateActividadComercial();

  const {
    data: clientes = [],
    isLoading: loadingClientes,
  } = useCuentasComerciales();

  const [cuentaComercial, setCuentaComercial] =
    useState<number | "">("");

  const [tipo, setTipo] =
    useState<TipoActividad>("llamada");

  const [descripcion, setDescripcion] =
    useState("");

  const [fechaProgramada, setFechaProgramada] =
    useState(getCurrentDateTime());

  useEffect(() => {
    if (!open) return;

    setCuentaComercial("");
    setTipo("llamada");
    setDescripcion("");
    setFechaProgramada(getCurrentDateTime());

    createActividad.reset();
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!cuentaComercial) {
      return;
    }

    if (!descripcion.trim()) {
      return;
    }

    if (!fechaProgramada) {
      return;
    }

    const data: ActividadComercialCreate = {
      cuenta_comercial: Number(cuentaComercial),
      tipo,
      descripcion: descripcion.trim(),
      fecha_programada: new Date(
        fechaProgramada,
      ).toISOString(),
    };

    try {
      await createActividad.mutateAsync(data);

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(
        "Error al crear actividad comercial:",
        error,
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="
          w-full max-w-lg
          overflow-hidden
          rounded-xl
          border border-border
          bg-card
          shadow-2xl
        "
      >
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Nueva actividad comercial
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Programa una nueva actividad con un cliente.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={createActividad.isPending}
            className="
              rounded-md p-1.5
              text-muted-foreground
              transition-colors
              hover:bg-secondary
              hover:text-foreground
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">

            {/* CLIENTE */}
            <div>
              <label
                htmlFor="cuenta-comercial"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Cliente
              </label>

              <div className="relative">
                <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <select
                  id="cuenta-comercial"
                  value={cuentaComercial}
                  onChange={(event) =>
                    setCuentaComercial(
                      event.target.value
                        ? Number(event.target.value)
                        : "",
                    )
                  }
                  disabled={
                    loadingClientes ||
                    createActividad.isPending
                  }
                  className="
                    h-11 w-full
                    appearance-none
                    rounded-lg
                    border border-border
                    bg-background
                    pl-10 pr-4
                    text-sm
                    text-foreground
                    outline-none
                    transition
                    focus:border-primary
                    focus:ring-2
                    focus:ring-primary/20
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                  required
                >
                  <option value="">
                    {loadingClientes
                      ? "Cargando clientes..."
                      : "Selecciona un cliente"}
                  </option>

                  {clientes.map((cliente) => (
                    <option
                      key={cliente.id}
                      value={cliente.id}
                    >
                      {getClientName(cliente)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TIPO */}
            <div>
              <label
                htmlFor="tipo-actividad"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Tipo de actividad
              </label>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {tiposActividad.map((item) => {
                  const selected = tipo === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setTipo(item.value)}
                      disabled={createActividad.isPending}
                      className={`
                        rounded-lg
                        border
                        px-3 py-2.5
                        text-sm
                        font-medium
                        transition-colors
                        ${
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }
                      `}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div>
              <label
                htmlFor="descripcion"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Descripción
              </label>

              <div className="relative">
                <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(event) =>
                    setDescripcion(event.target.value)
                  }
                  placeholder="Describe el motivo de la actividad..."
                  rows={4}
                  disabled={createActividad.isPending}
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

            {/* FECHA Y HORA */}
            <div>
              <label
                htmlFor="fecha-programada"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Fecha y hora
              </label>

              <div className="relative">
                <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="fecha-programada"
                  type="datetime-local"
                  value={fechaProgramada}
                  onChange={(event) =>
                    setFechaProgramada(
                      event.target.value,
                    )
                  }
                  disabled={createActividad.isPending}
                  className="
                    h-11 w-full
                    rounded-lg
                    border border-border
                    bg-background
                    pl-10 pr-4
                    text-sm
                    text-foreground
                    outline-none
                    transition
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
            {createActividad.isError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                No se pudo crear la actividad.
                Verifica los datos e inténtalo nuevamente.
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-3 border-t border-border bg-secondary/30 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={createActividad.isPending}
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
                createActividad.isPending ||
                !cuentaComercial ||
                !descripcion.trim()
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

              {createActividad.isPending
                ? "Creando..."
                : "Crear actividad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}