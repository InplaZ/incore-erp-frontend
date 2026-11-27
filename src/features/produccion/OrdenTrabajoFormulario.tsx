import { useMemo, useState } from "react";
import { Eye, FileText, X } from "lucide-react";
import Button from "@/components/ui/Button";
import type { PedidoDetalleVista, SnapshotValor } from "@/features/comercial/comercial.types";
import PdfPreviewModal from "@/features/productos/PDFPreViewModal";
import type { PedidoHabilitadoConDetalles } from "./ordenes-trabajo-api";
import { ordenesTrabajoApi } from "./ordenes-trabajo-api";

type DatosRevisionOT = Record<string, string | boolean>;

const valorSnapshot = (value: SnapshotValor | undefined): string | boolean => {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

type Props = {
  pedido: PedidoHabilitadoConDetalles;
  line: PedidoDetalleVista;
  onClose: () => void;
};

type FieldDefinition = {
  key: string;
  label: string;
  type?: "text" | "number" | "boolean";
  suffix?: string;
};

type SectionDefinition = {
  title: string;
  description?: string;
  fields: FieldDefinition[];
};

const extrusionFields: FieldDefinition[] = [
  { key: "material", label: "Material" },
  { key: "color_bolsa", label: "Color de bolsa" },
  { key: "impresion", label: "¿Requiere impresión?", type: "boolean" },
  { key: "capas", label: "Capas" },
  { key: "micraje", label: "Micraje", type: "number", suffix: "µm" },
  { key: "ancho_requerido_extrusion", label: "Ancho requerido", type: "number", suffix: "cm" },
  { key: "medio", label: "Medio" },
  { key: "refilado", label: "Refilado" },
  { key: "laminado", label: "Laminado" },
  { key: "metros", label: "Metros", type: "number", suffix: "m" },
];

const flexografiaFields: FieldDefinition[] = [
  { key: "cara_impresion", label: "Caras de impresión" },
  { key: "tipo_impresion", label: "Tipo de impresión" },
  { key: "tratamiento_impresion", label: "Tratamiento" },
  { key: "colores_cara_a", label: "Colores cara A", type: "number" },
  { key: "colores_cara_b", label: "Colores cara B", type: "number" },
  { key: "tipo_impresion_cara_a", label: "Tipo impresión cara A" },
  { key: "tipo_impresion_cara_b", label: "Tipo impresión cara B" },
  { key: "numero_rodillo_cara_a", label: "Rodillo cara A" },
  { key: "numero_rodillo_cara_b", label: "Rodillo cara B" },
  { key: "denominacion_arte_cara_a", label: "Arte cara A" },
  { key: "denominacion_arte_cara_b", label: "Arte cara B" },
  { key: "color_impresion", label: "Colores de impresión" },
];

const bolsaFields: FieldDefinition[] = [
  { key: "ancho_desdoblado", label: "Ancho desdoblado", type: "number", suffix: "cm" },
  { key: "ancho_doblado", label: "Ancho doblado", type: "number", suffix: "cm" },
  { key: "largo_desdoblado", label: "Largo desdoblado", type: "number", suffix: "cm" },
  { key: "largo_doblado", label: "Largo doblado", type: "number", suffix: "cm" },
  { key: "fuelle", label: "¿Tiene fuelle?", type: "boolean" },
  { key: "fuelle_izquierdo", label: "Fuelle izquierdo", type: "number", suffix: "cm" },
  { key: "fuelle_derecho", label: "Fuelle derecho", type: "number", suffix: "cm" },
  { key: "fuelle_superior", label: "Fuelle superior", type: "number", suffix: "cm" },
  { key: "fuelle_inferior", label: "Fuelle inferior", type: "number", suffix: "cm" },
  { key: "tipo_sello", label: "Tipo de sello" },
  { key: "tipo_troquel", label: "Tipo de troquel" },
  { key: "pestana", label: "Pestaña" },
  { key: "acabado_especial", label: "Acabado especial" },
  { key: "otras_caracteristicas", label: "Otras características" },
];

const bobinaFields: FieldDefinition[] = [
  { key: "ancho_bobina", label: "Ancho", type: "number", suffix: "cm" },
  { key: "ancho_doblado_bobina", label: "Ancho doblado", type: "number", suffix: "cm" },
  { key: "largo_desdoblado_bobina", label: "Largo desdoblado", type: "number", suffix: "cm" },
  { key: "largo_doblado_bobina", label: "Largo doblado", type: "number", suffix: "cm" },
  { key: "fuelle_izquierdo_bobina", label: "Fuelle izquierdo", type: "number", suffix: "cm" },
  { key: "fuelle_derecho_bobina", label: "Fuelle derecho", type: "number", suffix: "cm" },
  { key: "fuelle_superior_bobina", label: "Fuelle superior", type: "number", suffix: "cm" },
  { key: "fuelle_inferior_bobina", label: "Fuelle inferior", type: "number", suffix: "cm" },
  { key: "configuracion_pelicula", label: "Configuración de película" },
  { key: "diametro", label: "Diámetro", type: "number", suffix: "cm" },
  { key: "diametro_nucleo", label: "Diámetro del núcleo", type: "number", suffix: "cm" },
  { key: "tipo_nucleo", label: "Tipo de núcleo" },
  { key: "peso_bobina", label: "Peso", type: "number", suffix: "kg" },
  { key: "longitud", label: "Longitud", type: "number", suffix: "m" },
  { key: "otras_caracteristicas_bobina", label: "Otras características" },
];

function snapshotValue(source: Record<string, SnapshotValor> | null | undefined, key: string) {
  return source?.[key];
}

function buildInitialValues(line: PedidoDetalleVista): DatosRevisionOT {
  const snapshot = line.especificacion_snapshot;
  const version = snapshot?.version ?? {};
  const product = line.producto_version;
  const bag = snapshot?.especificacion_bolsa ?? {};
  const roll = snapshot?.especificacion_bobina ?? {};
  const requested = line.especificacion_producto_solicitado_version;
  const getVersion = (key: string, fallback?: SnapshotValor) =>
    valorSnapshot(snapshotValue(version, key) ?? fallback);

  const values: DatosRevisionOT = {
    material: getVersion("material", product?.material ?? requested?.material),
    color_bolsa: getVersion("color_bolsa", product?.color_bolsa),
    metros: getVersion("metros", product?.metros),
    capas: getVersion("capas", product?.capas ?? requested?.capas),
    micraje: getVersion("micraje", product?.micraje ?? requested?.micraje),
    medio: getVersion("medio", product?.medio),
    refilado: getVersion("refilado", product?.refilado),
    laminado: getVersion("laminado", product?.laminado),
    impresion: valorSnapshot(
      snapshotValue(version, "impresion") ??
      product?.impresion ??
      requested?.impresion
    ),
    cara_impresion: getVersion("cara_impresion"),
    tipo_impresion: getVersion("tipo_impresion"),
    tratamiento_impresion: getVersion("tratamiento_impresion", requested?.tratamiento_impresion),
    colores_cara_a: getVersion("colores_cara_a"),
    colores_cara_b: getVersion("colores_cara_b"),
    tipo_impresion_cara_a: getVersion("tipo_impresion_cara_a"),
    tipo_impresion_cara_b: getVersion("tipo_impresion_cara_b"),
    numero_rodillo_cara_a: getVersion("numero_rodillo_cara_a"),
    numero_rodillo_cara_b: getVersion("numero_rodillo_cara_b"),
    denominacion_arte_cara_a: getVersion("denominacion_arte_cara_a"),
    denominacion_arte_cara_b: getVersion("denominacion_arte_cara_b"),
    color_impresion: getVersion("color_impresion", product?.color_impresion ?? requested?.color_impresion),
    ancho_desdoblado: valorSnapshot(snapshotValue(bag, "ancho_desdoblado")),
    ancho_doblado: valorSnapshot(snapshotValue(bag, "ancho_doblado")),
    largo_desdoblado: valorSnapshot(snapshotValue(bag, "largo_desdoblado")),
    largo_doblado: valorSnapshot(snapshotValue(bag, "largo_doblado")),
    fuelle: valorSnapshot(snapshotValue(bag, "fuelle")),
    fuelle_izquierdo: valorSnapshot(snapshotValue(bag, "fuelle_izquierdo")),
    fuelle_derecho: valorSnapshot(snapshotValue(bag, "fuelle_derecho")),
    fuelle_superior: valorSnapshot(snapshotValue(bag, "fuelle_superior")),
    fuelle_inferior: valorSnapshot(snapshotValue(bag, "fuelle_inferior")),
    tipo_sello: valorSnapshot(snapshotValue(bag, "tipo_sello")),
    tipo_troquel: valorSnapshot(snapshotValue(bag, "tipo_troquel")),
    pestana: valorSnapshot(snapshotValue(bag, "pestana")),
    acabado_especial: valorSnapshot(snapshotValue(bag, "acabado_especial")),
    otras_caracteristicas: valorSnapshot(snapshotValue(bag, "otras_caracteristicas")),
    ancho_bobina: valorSnapshot(snapshotValue(roll, "ancho")),
    ancho_doblado_bobina: valorSnapshot(snapshotValue(roll, "ancho_doblado")),
    largo_desdoblado_bobina: valorSnapshot(snapshotValue(roll, "largo_desdoblado")),
    largo_doblado_bobina: valorSnapshot(snapshotValue(roll, "largo_doblado")),
    fuelle_izquierdo_bobina: valorSnapshot(snapshotValue(roll, "fuelle_izquierdo")),
    fuelle_derecho_bobina: valorSnapshot(snapshotValue(roll, "fuelle_derecho")),
    fuelle_superior_bobina: valorSnapshot(snapshotValue(roll, "fuelle_superior")),
    fuelle_inferior_bobina: valorSnapshot(snapshotValue(roll, "fuelle_inferior")),
    configuracion_pelicula: valorSnapshot(snapshotValue(roll, "configuracion_pelicula")),
    diametro: valorSnapshot(snapshotValue(roll, "diametro")),
    diametro_nucleo: valorSnapshot(snapshotValue(roll, "diametro_nucleo")),
    tipo_nucleo: valorSnapshot(snapshotValue(roll, "tipo_nucleo")),
    peso_bobina: valorSnapshot(snapshotValue(roll, "peso")),
    longitud: valorSnapshot(snapshotValue(roll, "longitud")),
    otras_caracteristicas_bobina: valorSnapshot(snapshotValue(roll, "otras_caracteristicas")),
  };

  const hasBag = Boolean(snapshot?.especificacion_bolsa);
  const extrusionWidth = hasBag
    ? (values.fuelle
      ? (values.ancho_doblado || values.ancho_desdoblado)
      : (values.ancho_desdoblado || values.ancho_doblado))
    : values.ancho_bobina;
  values.ancho_requerido_extrusion = extrusionWidth || "";
  return values;
}

function Section({ title, description, fields, values, onChange }: SectionDefinition & {
  values: DatosRevisionOT;
  onChange: (key: string, value: string | boolean) => void;
}) {
  const visibleFields = fields.filter((field) => {
    if (
      field.key.startsWith("fuelle_") &&
      !field.key.endsWith("_bobina") &&
      values.fuelle === false
    ) {
      return false;
    }
    return field.type === "boolean" || values[field.key] !== undefined;
  });
  return (
    <section className="space-y-3 rounded-xl border border-border p-4">
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleFields.map((field) => (
          <label key={field.key} className="block min-w-0 space-y-1.5 text-sm">
            <span className="font-medium text-foreground">{field.label}</span>
            {field.type === "boolean" ? (
              <select
                value={
                  values[field.key] === true
                    ? "true"
                    : values[field.key] === false
                      ? "false"
                      : ""
                }
                onChange={(event) => {
                  const value = event.target.value;
                  onChange(
                    field.key,
                    value === "true" ? true : value === "false" ? false : ""
                  );
                }}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="">Sin información</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            ) : (
              <span className="flex h-10 items-center rounded-md border border-border bg-background focus-within:border-primary">
                <input
                  type={field.type === "number" ? "number" : "text"}
                  step={field.type === "number" ? "any" : undefined}
                  value={String(values[field.key] ?? "")}
                  onChange={(event) => onChange(field.key, event.target.value)}
                  className="h-full min-w-0 flex-1 rounded-md bg-transparent px-3 text-sm outline-none"
                />
                {field.suffix && <span className="px-3 text-xs text-muted-foreground">{field.suffix}</span>}
              </span>
            )}
          </label>
        ))}
      </div>
    </section>
  );
}

export default function OrdenTrabajoFormulario({ pedido, line, onClose }: Props) {
  const initialValues = useMemo(() => buildInitialValues(line), [line]);
  const [values, setValues] = useState<DatosRevisionOT>(initialValues);
  const [observaciones, setObservaciones] = useState("");
  const [previewPdf, setPreviewPdf] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const snapshot = line.especificacion_snapshot;
  const isBag = Boolean(snapshot?.especificacion_bolsa);
  const isRoll = Boolean(snapshot?.especificacion_bobina);
  const isPrinted = values.impresion === true;
  const showFlexografia = values.impresion !== false;
  const productName = line.producto_version?.nombre || snapshot?.nombre || `Producto #${line.id}`;
  const productCode = line.producto_version?.codigo || snapshot?.codigo || `DET-${line.id}`;
  const filename = `Requerimiento_${pedido.pedido.numero}_${productCode}.pdf`;

  const handleChange = (key: string, value: string | boolean) => {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === "ancho_bobina") {
        next.ancho_requerido_extrusion = value;
      } else if (key === "fuelle" || key === "ancho_doblado" || key === "ancho_desdoblado") {
        const hasFuelle = key === "fuelle" ? Boolean(value) : Boolean(next.fuelle);
        next.ancho_requerido_extrusion = hasFuelle ? next.ancho_doblado : next.ancho_desdoblado;
      }
      return next;
    });
  };

  const handlePreview = async () => {
    try {
      setError("");
      setPreviewLoading(true);
      const blob = await ordenesTrabajoApi.previsualizarRequerimiento(
        line.id,
        values,
        observaciones,
      );
      setPreviewPdf(blob);
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : "No se pudo generar el PDF.");
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-3 sm:p-6">
        <section role="dialog" aria-modal="true" aria-label="Revisión técnica para orden de trabajo" className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Revisión técnica de fabricación</h2>
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">{pedido.pedido.numero} · {productName} · {productCode}</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-md p-2 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button>
          </header>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
            <div className="grid gap-3 rounded-xl bg-muted/40 p-4 sm:grid-cols-4">
              <Info label="Cliente" value={pedido.pedido.cliente_nombre || pedido.pedido.cliente_alias || "No disponible"} />
              <Info label="Cantidad" value={`${line.cantidad} ${line.unidad_comercial || ""}`} />
              <Info label="Peso" value={line.peso_kg ? `${line.peso_kg} kg` : "No registrado"} />
              <Info label="Entrega comprometida" value={line.fecha_entrega_comprometida ? new Date(line.fecha_entrega_comprometida).toLocaleDateString("es-BO") : "No registrada"} />
            </div>

            <Section title="Extrusión" description="Revisa los parámetros de material y dimensiones requeridas para extrusión." fields={extrusionFields} values={values} onChange={handleChange} />
            {showFlexografia && (
              <Section
                title="Flexografía"
                description="Parámetros de impresión. Revisa o completa los datos cuando corresponda."
                fields={flexografiaFields}
                values={values}
                onChange={handleChange}
              />
            )}
            {isBag && !values.fuelle && (
              Number(values.ancho_doblado) !== Number(values.ancho_desdoblado) ||
              Number(values.largo_doblado) !== Number(values.largo_desdoblado)
            ) && (
                <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                  Las dimensiones dobladas no coinciden con las desdobladas aunque el producto indica que no tiene fuelle. Revisa estos valores antes de generar el PDF.
                </div>
              )}
            {isBag && <Section title="Confección · Bolsa" description="Dimensiones y acabados de confección." fields={bolsaFields} values={values} onChange={handleChange} />}
            {isRoll && <Section title="Bobina" description="Dimensiones y configuración de la bobina." fields={bobinaFields} values={values} onChange={handleChange} />}

            <section className="space-y-2 rounded-xl border border-border p-4">
              <label htmlFor="observaciones-jp" className="block text-sm font-semibold">Observaciones del Jefe de Producción</label>
              <textarea id="observaciones-jp" value={observaciones} onChange={(event) => setObservaciones(event.target.value)} rows={3} maxLength={2000} placeholder="Indicaciones adicionales para fabricación…" className="w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary" />
            </section>

            {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">Los cambios realizados aquí se utilizan para generar el PDF de revisión. No modifican la especificación original del cliente.</p>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={() => void handlePreview()} disabled={previewLoading}><Eye className="h-4 w-4" />{previewLoading ? "Generando PDF…" : "Previsualizar PDF"}</Button>
          </footer>
        </section>
      </div>

      {previewPdf && (
        <PdfPreviewModal
          pdf={previewPdf}
          nombreArchivo={filename}
          descripcion={`Revisión de fabricación · ${pedido.pedido.numero} · ${productName}`}
          onClose={() => setPreviewPdf(null)}
        />
      )}
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 truncate text-sm font-semibold" title={value}>{value}</p></div>;
}
