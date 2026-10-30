import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronDown,
  Eye,
  History,
  MessageSquarePlus,
  Package,
  Plus,
  Search,
} from "lucide-react";

import {
  useCuentasComerciales,
  useSolicitudesComerciales,
  useUpdateSolicitudComercial,
} from "../comercial.hooks";

import type {
  EstadoSolicitud,
  SolicitudComercial,
} from "../comercial.types";

export default function RequerimientosListPage() {
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useSolicitudesComerciales();

  const { data: cuentas = [] } =
    useCuentasComerciales();

  // Más recientes primero
  const requerimientos = useMemo(() => {
    return [...(data ?? [])].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime(),
    );
  }, [data]);

  const summary = useMemo(
    () => ({
      total: requerimientos.length,
      negociacion: requerimientos.filter(
        (item) => item.estado === "en_negociacion",
      ).length,
      viabilidad: requerimientos.filter(
        (item) => item.estado === "en_viabilidad",
      ).length,
      aprobados: requerimientos.filter(
        (item) => item.estado === "aprobada",
      ).length,
    }),
    [requerimientos],
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">
            Ofertas comerciales
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona las solicitudes comerciales de los clientes.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/comercial/requerimientos/")
          }
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nueva oferta
        </button>
      </div>

      {/* Resumen */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryItem
          label="En negociación"
          value={summary.negociacion}
          detail="Bs "
        />

        <SummaryItem
          label="Esperando respuesta"
          value={summary.negociacion}
          detail="Bs "
        />

        <SummaryItem
          label="Confirmada"
          value={summary.viabilidad}
          detail="Bs "
        />

        <SummaryItem
          label="Rechazada"
          value={summary.aprobados}
          detail="Bs "
        />

        <SummaryItem
          label="Cerrada sin respuesta"
          value={summary.aprobados}
          detail="Bs "
        />

        <SummaryItem
          label="Vencida"
          value={summary.total}
          detail="Bs "
        />
      </div>
      {/* Tabla */}

      <section className="overflow-hidden rounded-lg border border-border bg-card">
        {/* Barra de búsqueda */}

        <div className="flex items-center border-b border-border p-4">
          <div className="flex h-10 w-full max-w-md items-center gap-2 rounded-md border border-border px-3">
            <Search className="h-4 w-4 text-muted-foreground" />

            <input
              type="search"
              placeholder="Buscar requerimiento..."
              disabled
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Loading */}

        {isLoading && (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            Cargando requerimientos...
          </div>
        )}

        {/* Error */}

        {isError && (
          <div className="px-5 py-10 text-center text-sm text-destructive">
            No se pudieron cargar los requerimientos.

            {error instanceof Error && (
              <span className="mt-1 block">
                {error.message}
              </span>
            )}
          </div>
        )}

        {/* Contenido */}

        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <div className="min-w-[1350px]">
              <TableHeader />

              {requerimientos.map((requerimiento) => (
                <RequerimientoRow
                  key={requerimiento.id}
                  requerimiento={requerimiento}
                  cuentas={cuentas}
                  onView={() =>
                    navigate(
                      `/comercial/requerimientos/${requerimiento.id}`,
                    )
                  }
                />
              ))}

              {requerimientos.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No hay requerimientos registrados.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}

        {!isLoading && !isError && (
          <div className="border-t border-border px-5 py-3">
            <span className="text-xs text-muted-foreground">
              Mostrando {requerimientos.length} requerimientos
            </span>
          </div>
        )}
      </section>
    </div>
  );
}

/* ============================================================
   CABECERA DE TABLA
============================================================ */

function TableHeader() {
  const columns =
    "grid-cols-[90px_minmax(150px,1.3fr)_minmax(180px,1.7fr)_75px_110px_120px_140px_145px_115px_115px]";

  return (
    <div className={`grid ${columns} items-center gap-4 border-b border-border bg-secondary/30 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground`}>
      <span>N.º oferta</span>
      <span>Fecha entrega</span>
      <span>Cliente / alias</span>
      <span>Versión</span>
      <span>Importe Bs</span>
      <span>Validez</span>
      <span>Estado</span>
      <span>Nuevo seguimiento</span>
      <span>Previsualizar</span>
      <span>Ver versiones</span>
    </div>
  );
}

/* ============================================================
   FILA DE OFERTA
============================================================ */

function RequerimientoRow({
  requerimiento,
  cuentas,
  onView,
}: {
  requerimiento: SolicitudComercial;
  cuentas: ReturnType<typeof useCuentasComerciales>["data"] extends infer T
    ? NonNullable<T>
    : never;
  onView: () => void;
}) {
  const cuenta = cuentas.find(
    (item) => item.id === requerimiento.cuenta_comercial,
  );

  const nombreCliente = cuenta
    ? cuenta.razon_social ||
      `${cuenta.nombres ?? ""} ${cuenta.apellido_paterno ?? ""}`.trim() ||
      "Sin nombre"
    : "Cliente no encontrado";

  const columns =
    "grid-cols-[90px_minmax(150px,1.3fr)_minmax(180px,1.7fr)_75px_110px_120px_140px_145px_115px_115px]";

  return (
    <div className={`grid ${columns} items-center gap-4 border-b border-border px-5 py-4 transition-colors hover:bg-secondary/40`}>
      {/* Número de oferta/solicitud */}
      <button
        type="button"
        onClick={onView}
        className="text-left text-sm font-semibold text-primary hover:underline"
        title="Abrir detalle de la solicitud"
      >
        REQ-{String(requerimiento.id).padStart(3, "0")}
      </button>

      {/* Fecha de entrega */}
      <span className="text-sm text-foreground">
        {formatearFecha(requerimiento.fecha_entrega)}
      </span>

      {/* Cliente / alias */}
      <button type="button" onClick={onView} className="min-w-0 text-left">
        <span className="block truncate text-sm font-semibold text-foreground">
          {nombreCliente}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">
          ID cliente: {requerimiento.cuenta_comercial}
        </span>
      </button>

      {/* Versión comercial: todavía no está incluida en SolicitudComercial */}
      <span className="text-sm text-muted-foreground" title="Pendiente de conectar con el modelo de versiones">
        —
      </span>

      {/* Importe: requiere datos de cotización/oferta */}
      <span className="text-sm text-muted-foreground" title="El importe no está disponible en los datos de la solicitud">
        —
      </span>

      {/* Validez: requiere datos de la oferta */}
      <span className="text-sm text-muted-foreground" title="La validez no está disponible en los datos de la solicitud">
        —
      </span>

      {/* Estado editable */}
      <EstadoSelector requerimiento={requerimiento} />

      {/* Seguimiento: abre el detalle para registrar la acción */}
      <button
        type="button"
        onClick={onView}
        className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
        title="Abrir el detalle para gestionar un seguimiento"
      >
        <MessageSquarePlus className="h-3.5 w-3.5" />
        Registrar
      </button>

      {/* La previsualización PDF requiere conectar el generador de ofertas */}
      <button
        type="button"
        disabled
        className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-xs font-medium text-muted-foreground opacity-60"
        title="La previsualización PDF de ofertas aún no está conectada"
      >
        <Eye className="h-3.5 w-3.5" />
        PDF
      </button>

      {/* Historial: abre el detalle de la solicitud */}
      <button
        type="button"
        onClick={onView}
        className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
        title="Abrir el detalle para consultar las versiones"
      >
        <History className="h-3.5 w-3.5" />
        Versiones
      </button>
    </div>
  );
}

/* ============================================================
   ESTADO
============================================================ */

const ESTADOS: {
  value: EstadoSolicitud;
  label: string;
  className: string;
  dotClass: string;
}[] = [
    {
      value: "recibida",
      label: "Recibida",
      className:
        "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      dotClass: "bg-blue-500",
    },
    {
      value: "en_negociacion",
      label: "En negociación",
      className:
        "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      dotClass: "bg-yellow-500",
    },
    {
      value: "en_viabilidad",
      label: "En viabilidad",
      className:
        "bg-secondary text-secondary-foreground",
      dotClass: "bg-secondary",
    },
    {
      value: "aprobada",
      label: "Aprobada",
      className:
        "bg-success/10 text-success",
      dotClass: "bg-success",
    },
    {
      value: "rechazada",
      label: "Rechazada",
      className:
        "bg-destructive/10 text-destructive",
      dotClass: "bg-destructive",
    },
    {
      value: "convertida",
      label: "Convertida",
      className:
        "bg-sidebar/10 text-sidebar-foreground",
      dotClass: "bg-sidebar-active",
    },
    {
      value: "cancelada",
      label: "Cancelada",
      className:
        "bg-gray-500/10 text-gray-600 dark:text-gray-400",
      dotClass: "bg-gray-500",
    },
  ];

function EstadoSelector({
  requerimiento,
}: {
  requerimiento: SolicitudComercial;
}) {
  const [abierto, setAbierto] = useState(false);

  const updateSolicitud =
    useUpdateSolicitudComercial();

  const estadoActual =
    ESTADOS.find(
      (estado) =>
        estado.value === requerimiento.estado,
    ) ?? ESTADOS[0];

  const cambiarEstado = async (
    estado: EstadoSolicitud,
  ) => {
    setAbierto(false);

    if (estado === requerimiento.estado) {
      return;
    }

    try {
      await updateSolicitud.mutateAsync({
        id: requerimiento.id,
        data: { estado },
      });
    } catch (error) {
      console.error(
        "Error al cambiar estado:",
        error,
      );
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        disabled={updateSolicitud.isPending}
        onClick={() =>
          setAbierto((actual) => !actual)
        }
        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60 ${estadoActual.className}`}
      >

        {estadoActual.label}

        <ChevronDown className="h-3 w-3" />
      </button>

      {abierto && (
        <div className="absolute left-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-lg border border-border bg-card p-1.5 shadow-lg">
          {ESTADOS.map((estado) => {
            const seleccionado =
              estado.value ===
              requerimiento.estado;

            return (
              <button
                key={estado.value}
                type="button"
                onClick={() =>
                  cambiarEstado(estado.value)
                }
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-secondary ${seleccionado
                  ? "bg-secondary"
                  : ""
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${estado.dotClass}`}
                  />

                  <span className="text-foreground">
                    {estado.label}
                  </span>
                </span>

                {seleccionado && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PRIORIDAD
============================================================ */

function PrioridadBadge({
  prioridad,
}: {
  prioridad?: string;
}) {
  const config: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    baja: {
      label: "Baja",
      className:
        "bg-secondary text-muted-foreground",
    },
    normal: {
      label: "Normal",
      className:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    alta: {
      label: "Alta",
      className:
        "bg-warning/10 text-warning",
    },
    urgente: {
      label: "Urgente",
      className:
        "bg-destructive/10 text-destructive",
    },
  };

  const item =
    config[prioridad ?? ""] ?? {
      label: prioridad || "—",
      className:
        "bg-secondary text-muted-foreground",
    };

  return (
    <span
      className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${item.className}`}
    >
      {item.label}
    </span>
  );
}

/* ============================================================
   RESUMEN
============================================================ */

function SummaryItem({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Package className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-[11px] leading-4 text-slate-500">
        {detail}
      </p>
    </div>
  );
}

/* ============================================================
   FECHA
============================================================ */

function formatearFecha(
  fecha: string | null,
) {
  if (!fecha) return "—";

  const [year, month, day] =
    fecha.split("-");

  if (!year || !month || !day) {
    return fecha;
  }

  return `${day}/${month}/${year}`;
}