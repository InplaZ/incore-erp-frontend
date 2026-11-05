import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, Check, CheckCircle2, ClipboardCheck, Factory, MessageSquare, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/States";
import type { EspecificacionTecnicaSnapshot, RevisionTecnicaOferta, SnapshotValor } from "@/features/comercial/comercial.types";
import { useEvaluarProductoRevision, useRevisionTecnica, useRevisionesTecnicas } from "./revision-tecnica.hooks";
import { useAuthStore } from "@/app/store/auth.store";

type EstadoFiltro = "todas" | "pendiente" | "observada" | "aprobada";

const stateLabels = { pendiente: "Pendiente", observada: "Observada", aprobada: "Aprobada" } as const;
const stateClasses = {
  pendiente: "border-amber-200 bg-amber-50 text-amber-800",
  observada: "border-orange-200 bg-orange-50 text-orange-800",
  aprobada: "border-emerald-200 bg-emerald-50 text-emerald-800",
} as const;

function dateTime(value?: string | null) {
  if (!value) return "Sin fecha registrada";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Sin fecha registrada" : date.toLocaleString("es-BO", { dateStyle: "medium", timeStyle: "short" });
}

function money(value: string, moneda: "BOB" | "USD") {
  const amount = Number(value).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${moneda === "BOB" ? "Bs" : "USD"} ${amount}`;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "No se pudo registrar la evaluación.";
}

export default function RevisionTecnicaPage() {
  const { data: revisiones = [], isLoading, isError, error, refetch, isFetching } = useRevisionesTecnicas();
  const [searchParams] = useSearchParams();
  const requestedRevisionId = Number(searchParams.get("revision"));
  const { data: linkedRevision } = useRevisionTecnica(requestedRevisionId > 0 ? requestedRevisionId : null);
  const [filter, setFilter] = useState<EstadoFiltro>("pendiente");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const evaluate = useEvaluarProductoRevision();
  const canEvaluate = useAuthStore(state =>
    state.roles.some(role => role.name === "Jefe de Producción") &&
    state.hasPermission("evaluate_revisiontecnicaoferta")
  );

  useEffect(() => {
    if (!requestedRevisionId || !revisiones.some((revision) => revision.id === requestedRevisionId)) return;
    setFilter("todas");
    setSelectedId(requestedRevisionId);
  }, [requestedRevisionId, revisiones]);

  const visible = useMemo(
    () => filter === "todas" ? revisiones : revisiones.filter(revision => revision.estado === filter),
    [filter, revisiones],
  );
  const selected = linkedRevision?.id === requestedRevisionId
    ? linkedRevision
    : visible.find(revision => revision.id === selectedId) ?? visible[0] ?? null;

  const submitEvaluation = async (productoId: number, resultado: "aprobar" | "observar") => {
    const observacion = (observaciones[productoId] ?? "").trim();
    if (resultado === "observar" && !observacion) {
      setFeedback({ kind: "error", text: "Escribe la razón técnica antes de observar el producto." });
      return;
    }
    setFeedback(null);
    evaluate.reset();
    try {
      await evaluate.mutateAsync({ productoId, resultado, observacion });
      setFeedback({ kind: "success", text: resultado === "aprobar" ? "Producto aprobado técnicamente." : "Observación registrada y enviada a Comercial." });
      setObservaciones(current => ({ ...current, [productoId]: "" }));
    } catch (mutationError) {
      setFeedback({ kind: "error", text: errorMessage(mutationError) });
    }
  };

  if (isLoading) return <LoadingState message="Cargando revisiones técnicas…" />;

  return <main className="mx-auto w-full max-w-[1500px] space-y-5 text-foreground">
    <PageHeader
      title="Revisión técnica de ofertas"
      subtitle="Evalúa las especificaciones aceptadas, producto por producto."
      breadcrumb={[{ label: "Producción" }, { label: "Revisión técnica" }]}
      actions={<Button variant="outline" onClick={() => void refetch()} disabled={isFetching}><RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />Actualizar</Button>}
    />

    {isError && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">No se pudieron cargar las revisiones. {errorMessage(error)}</div>}

    <div className="grid gap-3 sm:grid-cols-3">
      <SummaryCard label="Pendientes" value={revisiones.filter(item => item.estado === "pendiente").length} />
      <SummaryCard label="Observadas" value={revisiones.filter(item => item.estado === "observada").length} />
      <SummaryCard label="Aprobadas" value={revisiones.filter(item => item.estado === "aprobada").length} />
    </div>

    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar revisiones">
      {(["pendiente", "observada", "aprobada", "todas"] as EstadoFiltro[]).map(value => <button
        key={value}
        type="button"
        onClick={() => { setFilter(value); setSelectedId(null); setFeedback(null); }}
        aria-pressed={filter === value}
        className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${filter === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}
      >{value === "todas" ? "Todas" : stateLabels[value]}</button>)}
    </div>

    {!isError && visible.length === 0 ? <Card className="p-10 text-center">
      <ClipboardCheck className="mx-auto h-8 w-8 text-muted-foreground" />
      <h2 className="mt-3 font-semibold">No hay revisiones {filter === "todas" ? "vigentes" : stateLabels[filter].toLowerCase()}</h2>
      <p className="mt-1 text-sm text-muted-foreground">Las revisiones aparecen después de la aceptación del cliente.</p>
    </Card> : <div className="grid gap-5 xl:grid-cols-[minmax(290px,0.75fr)_minmax(0,1.7fr)]">
      <section aria-label="Lista de revisiones" className="space-y-3">
        {visible.map(review => <button
          key={review.id}
          type="button"
          onClick={() => { setSelectedId(review.id); setFeedback(null); }}
          className={`w-full rounded-xl border p-4 text-left transition hover:border-primary/40 hover:shadow-sm ${selected?.id === review.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div><p className="font-semibold">{review.pedido.numero}</p><p className="mt-0.5 text-sm text-muted-foreground">{review.pedido.cliente}</p></div>
            <StatusBadge status={review.estado} />
          </div>
          <p className="mt-3 text-sm">{review.version_aceptada.cotizacion} · V{String(review.version_aceptada.numero).padStart(2, "0")}</p>
          <div className="mt-1 flex justify-between gap-2 text-xs text-muted-foreground"><span>Aceptación: {dateTime(review.version_aceptada.fecha_aceptacion)}</span><span>{money(review.version_aceptada.precio_total, review.version_aceptada.moneda)}</span></div>
          <p className="mt-2 text-xs text-muted-foreground">{review.productos.filter(item => item.estado !== "pendiente").length} de {review.productos.length} productos evaluados</p>
        </button>)}
      </section>

      {selected && <ReviewDetail
        revision={selected}
        observaciones={observaciones}
        setObservaciones={setObservaciones}
        feedback={feedback}
        isSaving={evaluate.isPending}
        readOnly={!selected.version_aceptada.vigente}
        canEvaluate={canEvaluate}
        onEvaluate={submitEvaluation}
      />}
    </div>}
  </main>;
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return <Card className="p-4"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></Card>;
}

function ReviewDetail({
  revision, observaciones, setObservaciones, feedback, isSaving, readOnly, canEvaluate, onEvaluate,
}: {
  revision: RevisionTecnicaOferta;
  observaciones: Record<number, string>;
  setObservaciones: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  feedback: { kind: "success" | "error"; text: string } | null;
  isSaving: boolean;
  readOnly: boolean;
  canEvaluate: boolean;
  onEvaluate: (productoId: number, resultado: "aprobar" | "observar") => void;
}) {
  return <section aria-label="Detalle de revisión" className="min-w-0 space-y-4">
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><div className="flex items-center gap-2"><Factory className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Pedido {revision.pedido.numero}</h2></div><p className="mt-1 text-sm text-muted-foreground">{revision.pedido.cliente} · {revision.version_aceptada.cotizacion} / V{String(revision.version_aceptada.numero).padStart(2, "0")}</p></div>
        <StatusBadge status={revision.estado} />
      </div>
      <div className="mt-4 grid gap-3 rounded-lg bg-muted/40 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryValue label="Aceptación del cliente" value={dateTime(revision.version_aceptada.fecha_aceptacion)} />
        <SummaryValue label="Importe aceptado" value={money(revision.version_aceptada.precio_total, revision.version_aceptada.moneda)} />
        <SummaryValue label="Inicio de revisión" value={dateTime(revision.fecha_inicio)} />
      </div>
      {readOnly && <p className="mt-3 rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">Versión histórica: consulta de solo lectura.</p>}
      {revision.observacion_general && <p className="mt-3 rounded-md border border-border p-3 text-sm">{revision.observacion_general}</p>}
    </Card>

    {feedback && <div role={feedback.kind === "error" ? "alert" : "status"} className={`rounded-lg border p-3 text-sm ${feedback.kind === "error" ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{feedback.text}</div>}

    <div className="space-y-3">
      <div className="flex items-center justify-between"><h3 className="font-semibold">Productos de esta versión</h3><span className="text-xs text-muted-foreground">{revision.productos.length} producto(s)</span></div>
      {revision.productos.map(product => <Card key={product.id} className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4">
          <div><p className="font-semibold">{product.producto.nombre ?? "Producto"}</p><p className="mt-1 text-xs text-muted-foreground">{product.producto.codigo ? `${product.producto.codigo} · ` : ""}Detalle #{product.pedido_detalle}{product.producto.tipo === "solicitado" ? " · solicitado por cliente" : ""}</p></div>
          <StatusBadge status={product.estado} />
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-2">
          <TechnicalSnapshot snapshot={product.producto} />
          <div className="space-y-3">
            {product.estado === "observado" && product.observacion_tecnica && <div className="rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900"><p className="mb-1 flex items-center gap-1.5 font-semibold"><MessageSquare className="h-4 w-4" />Observación técnica</p><p className="whitespace-pre-wrap">{product.observacion_tecnica}</p></div>}
            {product.estado === "pendiente" && !readOnly && canEvaluate && <>
              <label className="block text-xs font-medium text-muted-foreground">Observación técnica requerida para observar
                <textarea value={observaciones[product.id] ?? ""} onChange={event => setObservaciones(current => ({ ...current, [product.id]: event.target.value }))} rows={3} placeholder="Describe el inconveniente técnico…" className="mt-1.5 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => onEvaluate(product.id, "aprobar")} disabled={isSaving}><Check className="h-4 w-4" />Aprobar producto</Button>
                <Button variant="outline" onClick={() => onEvaluate(product.id, "observar")} disabled={isSaving}><AlertCircle className="h-4 w-4" />Observar</Button>
              </div>
            </>}
            {product.estado === "pendiente" && !readOnly && !canEvaluate && <p className="text-xs text-muted-foreground">Solo el Jefe de Producción puede evaluar este producto.</p>}
            {product.estado !== "pendiente" && <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><CheckCircle2 className="h-4 w-4" />Evaluado {dateTime(product.fecha_evaluacion)}</p>}
          </div>
        </div>
      </Card>)}
    </div>
  </section>;
}

function TechnicalSnapshot({ snapshot }: { snapshot: EspecificacionTecnicaSnapshot }) {
  const groups: Array<[string, Record<string, SnapshotValor> | null | undefined]> = [
    [snapshot.tipo === "solicitado" ? "Especificación solicitada" : "Versión técnica", snapshot.version],
    ["Especificación de bolsa", snapshot.especificacion_bolsa],
    ["Especificación de bobina", snapshot.especificacion_bobina],
  ];
  const summary: Array<[string, string | undefined]> = [
    ["Descripción", snapshot.descripcion],
    ["Unidad", snapshot.unidad_medida],
    ["Homologación", snapshot.estado_homologacion],
    ["N.º homologación", snapshot.numero_homologacion ?? undefined],
  ];
  return <div className="space-y-3">
    <div><h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Especificaciones guardadas</h4>
      {summary.some(([, value]) => value) && <SnapshotGroup title="Producto" values={Object.fromEntries(summary.filter(([, value]) => value).map(([key, value]) => [key, value!]))} />}
      {groups.filter(([, values]) => values && Object.keys(values).length > 0).map(([title, values]) => <SnapshotGroup key={title} title={title} values={values!} />)}
      {groups.every(([, values]) => !values || Object.keys(values).length === 0) && !summary.some(([, value]) => value) && <p className="text-sm text-muted-foreground">No hay especificaciones adicionales en el snapshot.</p>}
    </div>
  </div>;
}

const fieldLabels: Record<string, string> = {
  material: "Material", capas: "Capas", cara_impresion: "Cara de impresión", tratamiento_impresion: "Tratamiento de impresión",
  tipo_impresion: "Tipo de impresión", apto_alimento: "Apto para alimentos", micraje: "Micraje", color_bolsa: "Color",
  impresion: "Impresión", color_impresion: "Colores de impresión", metros: "Metros", refilado: "Refilado", laminado: "Laminado",
  medio: "Medio", numero_version: "Versión", estado: "Estado", observaciones: "Observaciones", ancho_doblado: "Ancho doblado",
  ancho_desdoblado: "Ancho desarrollado", largo_doblado: "Largo doblado", largo_desdoblado: "Largo desarrollado", fuelle: "Fuelle",
  fuelle_izquierdo: "Fuelle izquierdo", fuelle_derecho: "Fuelle derecho", fuelle_inferior: "Fuelle inferior", fuelle_superior: "Fuelle superior",
  tipo_troquel: "Tipo de troquel", tipo_sello: "Tipo de sello", pestana: "Pestaña", acabado_especial: "Acabado especial",
  otras_caracteristicas: "Otras características", ancho: "Ancho", configuracion_pelicula: "Configuración de película", diametro: "Diámetro",
  diametro_nucleo: "Diámetro del núcleo", tipo_nucleo: "Tipo de núcleo", peso: "Peso", longitud: "Longitud", diseno_id: "Diseño (ID)",
};

function SnapshotGroup({ title, values }: { title: string; values: Record<string, SnapshotValor> }) {
  const entries = Object.entries(values).filter(([key, value]) => !["id", "created_at", "updated_at"].includes(key) && !key.endsWith("_id") && value !== null && value !== "" && value !== false);
  if (!entries.length) return null;
  return <div className="mb-2 rounded-md border border-border p-3">
    <h5 className="mb-2 text-xs font-semibold text-foreground">{title}</h5>
    <dl className="grid grid-cols-2 gap-x-3 gap-y-2">{entries.map(([key, value]) => <div key={key} className="min-w-0"><dt className="text-[11px] text-muted-foreground">{fieldLabels[key] ?? key.replaceAll("_", " ")}</dt><dd className="break-words text-xs font-medium">{formatSnapshotValue(value)}</dd></div>)}</dl>
  </div>;
}

function formatSnapshotValue(value: SnapshotValor): string {
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (Array.isArray(value)) return value.map(item => formatSnapshotValue(item)).join(", ");
  if (value && typeof value === "object") return Object.entries(value).map(([key, child]) => `${key}: ${formatSnapshotValue(child)}`).join(" · ");
  return value === null ? "—" : String(value);
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[11px] font-medium text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>;
}

function StatusBadge({ status }: { status: "pendiente" | "observada" | "aprobada" | "observado" | "aprobado" }) {
  const normalized = status === "observado" ? "observada" : status === "aprobado" ? "aprobada" : status;
  return <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium ${stateClasses[normalized]}`}>{normalized === "observada" ? "Observado" : stateLabels[normalized]}</span>;
}
