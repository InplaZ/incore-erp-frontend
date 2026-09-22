import {
  ArrowDownLeft,
  ArrowUpRight,
  MessageCircle,
  X,
} from "lucide-react";

import { useComunicaciones } from "../comercial.hooks";
import type { Comunicacion } from "../comercial.types";

interface ComunicacionesModalProps {
  open: boolean;
  onClose: () => void;

  solicitudId?: number;
  cuentaComercialId?: number;

  titulo?: string;
  subtitulo?: string;
}

export default function ComunicacionesModal({
  open,
  solicitudId,
  cuentaComercialId,
  onClose,
  titulo,
  subtitulo,
}: ComunicacionesModalProps) {
  const {
    data: comunicaciones = [],
    isLoading,
    isError,
  } = useComunicaciones(
    solicitudId
      ? {
          solicitud_comercial: solicitudId,
        }
      : cuentaComercialId
        ? {
            cuenta_comercial: cuentaComercialId,
          }
        : undefined,
  );

  if (!open) {
    return null;
  }

  const tituloModal =
    titulo ||
    (solicitudId
      ? "Comunicaciones de la solicitud"
      : "Historial de comunicaciones");

  const subtituloModal =
    subtitulo ||
    (solicitudId
      ? `Historial de la solicitud #${solicitudId}`
      : "Historial de comunicaciones con el cliente");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl">

        {/* ============================================================
            HEADER
        ============================================================ */}

        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {tituloModal}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {subtituloModal}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ============================================================
            CONTENIDO
        ============================================================ */}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

          {isLoading && (
            <div className="flex min-h-40 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Cargando comunicaciones...
              </p>
            </div>
          )}

          {isError && !isLoading && (
            <div className="flex min-h-40 items-center justify-center">
              <p className="text-sm text-destructive">
                No se pudieron cargar las comunicaciones.
              </p>
            </div>
          )}

          {!isLoading &&
            !isError &&
            comunicaciones.length === 0 && (
              <div className="flex min-h-40 flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                </div>

                <p className="text-sm font-medium text-foreground">
                  Sin comunicaciones
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Todavía no existen comunicaciones.
                </p>
              </div>
            )}

          {!isLoading &&
            !isError &&
            comunicaciones.length > 0 && (
              <div className="space-y-6">
                {comunicaciones.map((comunicacion) => (
                  <ComunicacionBubble
                    key={comunicacion.id}
                    comunicacion={comunicacion}
                  />
                ))}
              </div>
            )}
        </div>

        {/* ============================================================
            FOOTER
        ============================================================ */}

        <div className="flex justify-end border-t border-border px-6 py-4">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <MessageCircle className="h-4 w-4" />
            Nueva comunicación
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   BURBUJA DE COMUNICACIÓN
============================================================ */

function ComunicacionBubble({
  comunicacion,
}: {
  comunicacion: Comunicacion;
}) {
  const esSaliente = comunicacion.direccion === "saliente";
  const esEntrante = comunicacion.direccion === "entrante";
  const esHistorica = comunicacion.direccion === null;

  return (
    <div
      className={`flex ${
        esSaliente
          ? "justify-end"
          : esEntrante
            ? "justify-start"
            : "justify-center"
      }`}
    >
      <div
        className={`max-w-[80%] ${
          esHistorica ? "w-full max-w-md" : ""
        }`}
      >
        {/* Fecha */}

        <div
          className={`mb-1.5 flex items-center gap-2 text-[11px] text-muted-foreground ${
            esSaliente
              ? "justify-end"
              : esEntrante
                ? "justify-start"
                : "justify-center"
          }`}
        >
          <span>
            {formatFecha(comunicacion.created_at)}
          </span>
        </div>

        {/* Bubble */}

        <div
          className={`rounded-2xl border px-4 py-3 ${
            esSaliente
              ? "rounded-br-md border-primary/20 bg-primary/10"
              : esEntrante
                ? "rounded-bl-md border-border bg-card"
                : "border-dashed border-border bg-muted/50"
          }`}
        >
          {/* Dirección */}

          <div className="mb-2 flex items-center gap-2">
            {esSaliente && (
              <ArrowUpRight className="h-4 w-4 text-primary" />
            )}

            {esEntrante && (
              <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
            )}

            {esHistorica && (
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            )}

            <span className="text-xs font-semibold text-foreground">
              {getDireccionLabel(comunicacion.direccion)}
            </span>
          </div>

          {/* Tipo / medio */}

          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>
              {getTipoLabel(comunicacion.tipo)}
            </span>

            <span>•</span>

            <span>
              {getMedioLabel(comunicacion.medio)}
            </span>
          </div>

          {/* Asunto */}

          {comunicacion.asunto && (
            <p className="mb-1 text-sm font-semibold text-foreground">
              {comunicacion.asunto}
            </p>
          )}

          {/* Contenido */}

          <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
            {comunicacion.contenido}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function getDireccionLabel(
  direccion: Comunicacion["direccion"],
) {
  switch (direccion) {
    case "saliente":
      return "Ejecutivo → Cliente";

    case "entrante":
      return "Cliente → Ejecutivo";

    default:
      return "Comunicación histórica";
  }
}

function getTipoLabel(
  tipo: Comunicacion["tipo"],
) {
  switch (tipo) {
    case "llamada":
      return "Llamada";

    case "correo":
      return "Correo";

    case "mensaje":
      return "Mensaje";

    case "reunion":
      return "Reunión";

    case "visita":
      return "Visita";

    default:
      return "Otro";
  }
}

function getMedioLabel(
  medio: Comunicacion["medio"],
) {
  switch (medio) {
    case "telefono":
      return "Teléfono";

    case "email":
      return "Correo electrónico";

    case "whatsapp":
      return "WhatsApp";

    case "presencial":
      return "Presencial";

    case "videollamada":
      return "Videollamada";

    default:
      return "Otro";
  }
}

function formatFecha(value: string) {
  const fecha = new Date(value);

  return fecha.toLocaleString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}