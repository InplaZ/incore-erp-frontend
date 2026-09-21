import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  FileText,
  Phone,
  type LucideIcon,
} from "lucide-react";

import type {
  ActividadComercial,
  CuentaComercial,
  Pedido,
  SolicitudComercial,
} from "../comercial.types";

/* ============================================================
   CLIENTE
============================================================ */

export function getClientName(
  client: CuentaComercial,
): string {
  if (client.tipo_persona === "juridica") {
    return client.razon_social || "Sin razón social";
  }

  return (
    [
      client.nombres,
      client.apellido_paterno,
      client.apellido_materno,
    ]
      .filter(Boolean)
      .join(" ") || "Sin nombre"
  );
}

export function getInitials(name: string): string {
  const words = name.split(" ").filter(Boolean);

  if (words.length === 0) {
    return "CL";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

/* ============================================================
   CUENTA COMERCIAL
============================================================ */

export function getEstadoLabel(
  estado: CuentaComercial["estado"],
): string {
  switch (estado) {
    case "cliente":
      return "Activo";

    case "prospecto":
      return "Prospecto";

    case "inactivo":
      return "Inactivo";

    default:
      return estado;
  }
}

export function getTipoRelacionLabel(
  tipoRelacion: CuentaComercial["tipo_relacion"],
): string {
  switch (tipoRelacion) {
    case "cliente":
      return "Cliente";

    case "proveedor":
      return "Proveedor";

    case "ambos":
      return "Cliente y proveedor";

    default:
      return tipoRelacion || "-";
  }
}

/* ============================================================
   ACTIVIDADES
============================================================ */

/**
 * Devuelve el componente de icono correspondiente
 * al tipo de actividad.
 *
 * No devuelve JSX para mantener este archivo como
 * una utilidad independiente de React.
 */
export function getActividadIcon(
  tipo: ActividadComercial["tipo"],
): LucideIcon {
  switch (tipo) {
    case "llamada":
      return Phone;

    case "reunion":
      return CalendarDays;

    case "cotizacion":
      return FileText;

    case "seguimiento":
      return CalendarClock;

    case "confirmacion":
      return CheckCircle2;

    default:
      return CalendarClock;
  }
}

export function getActividadTipoLabel(
  tipo: ActividadComercial["tipo"],
): string {
  switch (tipo) {
    case "llamada":
      return "Llamada";

    case "reunion":
      return "Reunión";

    case "cotizacion":
      return "Cotización";

    case "seguimiento":
      return "Seguimiento";

    case "confirmacion":
      return "Confirmación";

    default:
      return tipo;
  }
}

export function getActividadEstadoLabel(
  estado: ActividadComercial["estado"],
): string {
  switch (estado) {
    case "pendiente":
      return "Pendiente";

    case "en_proceso":
      return "En proceso";

    case "completada":
      return "Completada";

    case "cancelada":
      return "Cancelada";

    default:
      return estado;
  }
}

/* ============================================================
   SOLICITUDES
============================================================ */

export function getSolicitudEstadoLabel(
  estado: SolicitudComercial["estado"],
): string {
  switch (estado) {
    case "recibida":
      return "Recibida";

    case "en_revision":
      return "En revisión";

    case "en_negociacion":
      return "En negociación";

    case "aprobada":
      return "Aprobada";

    case "rechazada":
      return "Rechazada";

    case "cancelada":
      return "Cancelada";

    default:
      return estado;
  }
}

/* ============================================================
   PEDIDOS
============================================================ */

export function getPedidoEstadoLabel(
  estado: Pedido["estado"],
): string {
  switch (estado) {
    case "pendiente":
      return "Pendiente";

    case "confirmado":
      return "Confirmado";

    case "en_proceso":
      return "En proceso";

    case "finalizado":
      return "Finalizado";

    case "cancelado":
      return "Cancelado";

    default:
      return estado;
  }
}

/* ============================================================
   FECHAS
============================================================ */

export function formatDate(
  value?: string | null,
): string {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(
  value?: string | null,
): string {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ============================================================
   NÚMEROS
============================================================ */

export function formatNumber(
  value?: string | number | null,
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("es-BO", {
    maximumFractionDigits: 2,
  }).format(number);
}