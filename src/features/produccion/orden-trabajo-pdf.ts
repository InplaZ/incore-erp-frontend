import { jsPDF } from "jspdf";
import type { PedidoDetalleVista, SnapshotValor } from "@/features/comercial/comercial.types";
import type { PedidoHabilitadoConDetalles } from "./ordenes-trabajo-api";

export type DatosRevisionOT = Record<string, string | boolean>;

export interface DatosDocumentoOT {
  pedido: PedidoHabilitadoConDetalles;
  line: PedidoDetalleVista;
  values: DatosRevisionOT;
  observaciones: string;
  secciones: {
    flexografia: boolean;
    bolsa: boolean;
    bobina: boolean;
  };
}

const valorTexto = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "No registrado";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (Array.isArray(value)) return value.map(valorTexto).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const safeName = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "_");

export function generarPdfRevisionOT({
  pedido,
  line,
  values,
  observaciones,
  secciones,
}: DatosDocumentoOT): Blob {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  const ensureSpace = (height = 10) => {
    if (y + height > pageHeight - 18) {
      doc.addPage();
      y = 16;
    }
  };

  const addSection = (title: string) => {
    ensureSpace(14);
    doc.setFillColor(232, 237, 244);
    doc.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 48, 73);
    doc.text(title.toUpperCase(), margin + 3, y + 5.4);
    y += 12;
  };

  const addField = (label: string, value: unknown) => {
    const text = valorTexto(value);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(text, contentWidth - 66) as string[];
    const lineHeight = 4.2;
    const height = Math.max(6, lines.length * lineHeight + 1);
    ensureSpace(height);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(82, 96, 113);
    doc.text(label, margin + 2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(35, 45, 58);
    doc.text(lines, margin + 64, y);
    y += height;
  };

  const snapshot = line.especificacion_snapshot;
  const nombre = line.producto_version?.nombre || snapshot?.nombre || "Producto";
  const codigo = line.producto_version?.codigo || snapshot?.codigo || `DET-${line.id}`;
  const cliente = pedido.pedido.cliente_nombre || pedido.pedido.cliente_alias || "No registrado";

  doc.setDrawColor(20, 42, 83);
  doc.setLineWidth(1.3);
  doc.line(0, 3, pageWidth, 3);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 42, 83);
  doc.text("INPLAZ SRL", margin, y);
  doc.setFontSize(8);
  doc.setTextColor(190, 65, 45);
  doc.text("BORRADOR · REVISIÓN TÉCNICA", pageWidth - margin, y, { align: "right" });
  y += 8;
  doc.setDrawColor(210, 218, 228);
  doc.line(margin, y, pageWidth - margin, y);
  y += 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(25, 39, 59);
  doc.text("HOJA DE REVISIÓN DE FABRICACIÓN", margin, y);
  y += 9;

  addSection("Datos del pedido y producto");
  addField("Pedido", pedido.pedido.numero);
  addField("Cliente", cliente);
  addField("Código", codigo);
  addField("Producto", nombre);
  addField("Detalle", `#${line.id}`);
  addField("Cantidad", `${line.cantidad} ${line.unidad_comercial || ""}`.trim());
  if (line.peso_kg !== null && line.peso_kg !== undefined) addField("Peso estimado", `${line.peso_kg} kg`);
  addField("Fecha de entrega", line.fecha_entrega_comprometida || pedido.pedido.fecha_entrega_comprometida);

  addSection("Extrusión");
  [
    ["Material", "material"], ["Color de bolsa", "color_bolsa"], ["Requiere impresión", "impresion"], ["Capas", "capas"], ["Micraje", "micraje"],
    ["Ancho requerido para extrusión (cm)", "ancho_requerido_extrusion"],
    ["Medio", "medio"], ["Refilado", "refilado"], ["Laminado", "laminado"], ["Metros", "metros"],
  ].forEach(([label, key]) => addField(label, values[key]));

  if (secciones.flexografia) {
    addSection("Flexografía");
    [
      ["Cara de impresión", "cara_impresion"], ["Tipo de impresión", "tipo_impresion"], ["Tratamiento de impresión", "tratamiento_impresion"],
      ["Colores cara A", "colores_cara_a"], ["Colores cara B", "colores_cara_b"],
      ["Tipo de impresión cara A", "tipo_impresion_cara_a"], ["Tipo de impresión cara B", "tipo_impresion_cara_b"],
      ["Rodillo cara A", "numero_rodillo_cara_a"], ["Rodillo cara B", "numero_rodillo_cara_b"],
      ["Arte cara A", "denominacion_arte_cara_a"], ["Arte cara B", "denominacion_arte_cara_b"],
      ["Colores de impresión", "color_impresion"],
    ].forEach(([label, key]) => addField(label, values[key]));
  }

  if (secciones.bolsa) {
    addSection("Confección · Bolsa");
    [
      ["Ancho desdoblado (cm)", "ancho_desdoblado"], ["Ancho doblado (cm)", "ancho_doblado"],
      ["Largo desdoblado (cm)", "largo_desdoblado"], ["Largo doblado (cm)", "largo_doblado"],
      ["Fuelle", "fuelle"], ["Fuelle izquierdo (cm)", "fuelle_izquierdo"],
      ["Fuelle derecho (cm)", "fuelle_derecho"], ["Fuelle superior (cm)", "fuelle_superior"],
      ["Fuelle inferior (cm)", "fuelle_inferior"], ["Tipo de sello", "tipo_sello"],
      ["Tipo de troquel", "tipo_troquel"], ["Pestaña", "pestana"],
      ["Acabado especial", "acabado_especial"], ["Otras características", "otras_caracteristicas"],
    ].forEach(([label, key]) => addField(label, values[key]));
  }

  if (secciones.bobina) {
    addSection("Bobina");
    [
      ["Ancho (cm)", "ancho_bobina"], ["Ancho doblado (cm)", "ancho_doblado_bobina"],
      ["Largo desdoblado (cm)", "largo_desdoblado_bobina"], ["Largo doblado (cm)", "largo_doblado_bobina"],
      ["Configuración de película", "configuracion_pelicula"], ["Diámetro (cm)", "diametro"],
      ["Diámetro de núcleo (cm)", "diametro_nucleo"], ["Tipo de núcleo", "tipo_nucleo"],
      ["Peso (kg)", "peso_bobina"], ["Longitud (m)", "longitud"],
      ["Otras características", "otras_caracteristicas_bobina"],
    ].forEach(([label, key]) => addField(label, values[key]));
  }

  addSection("Observaciones del Jefe de Producción");
  addField("Observaciones", observaciones.trim() || "Sin observaciones");

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(215, 221, 230);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(110, 120, 132);
    doc.text("Documento preliminar para revisión interna · No constituye una OT", margin, pageHeight - 7);
    doc.text(`${page}/${pageCount}`, pageWidth - margin, pageHeight - 7, { align: "right" });
  }

  return doc.output("blob");
}

export function valorSnapshot(value: SnapshotValor | undefined): string | boolean {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map(valorTexto).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function nombreArchivoRevisionOT(numeroPedido: string, codigo: string): string {
  return `Revision_OT_${safeName(numeroPedido)}_${safeName(codigo)}.pdf`;
}
