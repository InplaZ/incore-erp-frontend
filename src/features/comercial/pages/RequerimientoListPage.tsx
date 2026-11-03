import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  History,
  MessageSquarePlus,
  Package,
  Plus,
  Search,
} from "lucide-react";

import {
  useCuentasComerciales,
  useCotizaciones,
  useCotizacionesVersiones,
  useSolicitudesComerciales,
} from "../comercial.hooks";
import { cotizacionesVersionesApi } from "../comercial.api";

import type {
  Cotizacion,
  CotizacionVersion,
  SolicitudComercial,
} from "../comercial.types";
import { getSolicitudEstadoLabel } from "../utils/comercial.formatters";

const COTIZACIONES_VACIAS: Cotizacion[] = [];
const VERSIONES_VACIAS: CotizacionVersion[] = [];

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
  const { data: cotizacionesData } = useCotizaciones();
  const { data: versionesData } = useCotizacionesVersiones();
  const cotizaciones = cotizacionesData?.results ?? COTIZACIONES_VACIAS;
  const versiones = versionesData?.results ?? VERSIONES_VACIAS;

  // Más recientes primero
  const requerimientos = useMemo(() => {
    return [...(data ?? [])].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime(),
    );
  }, [data]);

  const ofertas = useMemo(() => requerimientos.map((requerimiento) => {
    const oferta = cotizaciones.find((item) => item.solicitud_comercial === requerimiento.id);
    const version = versiones
      .filter((item) => item.cotizacion === oferta?.id)
      .sort((a, b) => b.version - a.version)[0];
    return { requerimiento, oferta, version, estado: obtenerEstadoOferta(requerimiento) };
  }), [requerimientos, cotizaciones, versiones]);

  const summary = useMemo(() => {
    const items = ofertas.filter((item) => item.estado.codigo !== null);
    return ESTADOS_OFERTA.map((estado) => {
      const coincidencias = items.filter((item) => item.estado.codigo === estado.codigo);
      const importesPorMoneda = coincidencias.reduce<Record<string, number>>((totales, item) => {
        const moneda = item.version?.moneda ?? "BOB";
        const monto = Number(item.version?.precio_total ?? 0);
        totales[moneda] = (totales[moneda] ?? 0) + monto;
        return totales;
      }, {});
      return {
        ...estado,
        cantidad: coincidencias.length,
        detalle: Object.entries(importesPorMoneda)
          .map(([moneda, total]) => `${moneda} ${total.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
          .join(" · ") || "Sin importe",
      };
    });
  }, [ofertas]);

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
        {summary.map((item) => <SummaryItem key={item.codigo} label={item.label} value={item.cantidad} detail={item.detalle} />)}
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

              {ofertas.map(({ requerimiento, oferta, version, estado }) => {
                return <RequerimientoRow
                  key={requerimiento.id}
                  requerimiento={requerimiento}
                  cuentas={cuentas}
                  oferta={oferta}
                  version={version}
                  estadoOferta={estado}
                  onView={() => navigate(`/comercial/requerimientos/${requerimiento.id}`)}
                  onFollowup={() => navigate(`/comercial/requerimientos/${requerimiento.id}${version ? `?tab=seguimiento&version=${version.id}` : ""}`)}
                  onVersions={() => navigate(`/comercial/requerimientos/${requerimiento.id}${version ? `?tab=versiones&version=${version.id}` : ""}`)}
                />;
              })}

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
  oferta,
  version,
  estadoOferta,
  onView,
  onFollowup,
  onVersions,
}: {
  requerimiento: SolicitudComercial;
  cuentas: ReturnType<typeof useCuentasComerciales>["data"] extends infer T
  ? NonNullable<T>
  : never;
  oferta?: Cotizacion;
  version?: CotizacionVersion;
  estadoOferta: EstadoOfertaCalculado;
  onView: () => void;
  onFollowup: () => void;
  onVersions: () => void;
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
        {oferta?.numero || `REQ-${String(requerimiento.id).padStart(3, "0")}`}
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

      <span className="text-sm text-muted-foreground">{version ? `V${String(version.version).padStart(2, "0")}` : "—"}</span>

      <span className="text-sm font-semibold text-foreground">
        {version
          ? `${version.moneda === "BOB" ? "Bs" : version.moneda} ${Number(version.precio_total).toLocaleString(
            "es-BO",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}`
          : "—"}
      </span>

      <span className="text-sm text-muted-foreground">{version?.validez_dias != null ? `${version.validez_dias} días` : oferta?.fecha_vencimiento ? formatearFecha(oferta.fecha_vencimiento) : "—"}</span>

      <EstadoOferta estado={estadoOferta} />

      {/* Seguimiento: abre el detalle para registrar la acción */}
      <button
        type="button"
        onClick={onFollowup}
        className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
        title="Abrir el detalle para gestionar un seguimiento"
      >
        <MessageSquarePlus className="h-3.5 w-3.5" />
        Registrar
      </button>

      <button
        type="button"
        disabled={!version}
        onClick={() => {
          if (!version) return;
          void cotizacionesVersionesApi.pdf(version.id).then((blob) => {
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank", "noopener,noreferrer");
            window.setTimeout(() => URL.revokeObjectURL(url), 60000);
          }).catch((error) => console.error("No se pudo abrir el PDF de la oferta", error));
        }}
        className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
        title={version ? "Abrir PDF de la versión vigente" : "La solicitud todavía no tiene una oferta"}
      >
        <Eye className="h-3.5 w-3.5" />
        PDF
      </button>

      {/* Historial: abre el detalle de la solicitud */}
      <button
        type="button"
        onClick={onVersions}
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

type CodigoEstadoOferta = "negociacion" | "esperando" | "confirmada" | "rechazada" | "cerrada" | "vencida";
type EstadoOfertaCalculado = { codigo: CodigoEstadoOferta | null; label: string; className: string };

const ESTADOS_OFERTA: { codigo: CodigoEstadoOferta; label: string; className: string }[] = [
  { codigo: "negociacion", label: "En negociación", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
  { codigo: "esperando", label: "Esperando respuesta", className: "bg-blue-100 text-blue-800" },
  { codigo: "confirmada", label: "Confirmada", className: "bg-emerald-100 text-emerald-800" },
  { codigo: "rechazada", label: "Rechazada", className: "bg-rose-100 text-rose-800" },
  { codigo: "cerrada", label: "Cerrada sin respuesta", className: "bg-slate-100 text-slate-700" },
  { codigo: "vencida", label: "Vencida", className: "bg-orange-100 text-orange-800" },
];

function obtenerEstadoOferta(
  solicitud: SolicitudComercial,
): EstadoOfertaCalculado {
  const estadosPorSolicitud: Partial<Record<SolicitudComercial["estado"], CodigoEstadoOferta>> = {
    en_negociacion: "negociacion",
    esperando_respuesta: "esperando",
    confirmada: "confirmada",
    rechazada: "rechazada",
    cerrada_sin_respuesta: "cerrada",
    vencida: "vencida",
  };
  const codigo = estadosPorSolicitud[solicitud.estado] ?? null;
  const estadoOferta = ESTADOS_OFERTA.find((item) => item.codigo === codigo);
  return estadoOferta ?? {
    codigo: null,
    label: getSolicitudEstadoLabel(solicitud.estado),
    className: "bg-secondary text-secondary-foreground",
  };
}

function EstadoOferta({ estado }: { estado: EstadoOfertaCalculado }) {
  return <span className={`inline-flex w-fit rounded-full px-2.5 py-1.5 text-xs font-semibold capitalize ${estado.className}`}>{estado.label}</span>;
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
