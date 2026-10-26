import { useState, type FormEvent } from "react";
import { AlertCircle, Download, FileText, LoaderCircle, Plus, RotateCcw, Trash2, Upload, X } from "lucide-react";
import {
  useCambiarEstadoDocumentoCuentaComercial,
  useCreateDocumentoCuentaComercial,
  useDescargarDocumentoCuentaComercial,
  useDocumentosCuentaComercial,
  useHistorialCuentaComercial,
} from "../comercial.hooks";
import type { DocumentoCuentaComercial, TipoDocumentoCuentaComercial } from "../comercial.types";

const docTypeLabels: Record<TipoDocumentoCuentaComercial, string> = {
  contrato: "Contrato",
  orden_compra: "Orden de compra",
  licitacion: "Licitación",
  otro: "Otro",
};
const inputClass = "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const labelClass = "block text-xs font-semibold text-muted-foreground";

export default function DocumentacionCuentaSection({ cuentaComercialId, nombreComercial }: { cuentaComercialId: number; nombreComercial: string }) {
  const { data: documentos = [], isLoading, isError } = useDocumentosCuentaComercial(cuentaComercialId);
  const { data: historial = [], isLoading: cargandoHistorial, isError: errorHistorial } = useHistorialCuentaComercial(cuentaComercialId);
  const crear = useCreateDocumentoCuentaComercial();
  const cambiarEstado = useCambiarEstadoDocumentoCuentaComercial();
  const descargar = useDescargarDocumentoCuentaComercial();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipo, setTipo] = useState<TipoDocumentoCuentaComercial>("contrato");
  const [activo, setActivo] = useState(true);
  const [referencia, setReferencia] = useState("");
  const [vigencia, setVigencia] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [errorFormulario, setErrorFormulario] = useState("");
  const [errorDescarga, setErrorDescarga] = useState("");
  const [errorEstado, setErrorEstado] = useState("");

  const cerrarModal = () => {
    setModalAbierto(false);
    setArchivo(null);
    setReferencia("");
    setVigencia("");
    setTipo("contrato");
    setActivo(true);
    setErrorFormulario("");
  };

  const guardarDocumento = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorFormulario("");
    if (!archivo) {
      setErrorFormulario("Selecciona el archivo que quieres asociar.");
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      setErrorFormulario("El archivo supera el límite permitido de 5 MB.");
      return;
    }
    try {
      await crear.mutateAsync({
        cuenta_comercial: cuentaComercialId,
        tipo,
        referencia: referencia.trim(),
        vigencia_hasta: vigencia || null,
        activo,
        archivo,
      });
      cerrarModal();
    } catch {
      setErrorFormulario("No se pudo guardar el documento. Verifica el formato, tamaño y datos.");
    }
  };

  const abrirDocumento = async (documento: DocumentoCuentaComercial) => {
    try {
      const blob = await descargar.mutateAsync(documento.id);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = documento.nombre_archivo;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setErrorDescarga(`No se pudo descargar ${documento.nombre_archivo}.`);
    }
  };

  const cambiarEstadoDocumento = async (documento: DocumentoCuentaComercial, activo: boolean) => {
    setErrorEstado("");
    try {
      await cambiarEstado.mutateAsync({ id: documento.id, activo });
    } catch (error) {
      setErrorEstado(`No se pudo ${activo ? "reactivar" : "desactivar"} ${documento.nombre_archivo}: ${getBackendErrorMessage(error)}`);
    }
  };

  return <>
    <section className="rounded-xl border border-border bg-card">
      <div className="px-5 py-5 sm:px-6">
        <h2 className="text-base font-semibold text-foreground">Documentación asociada</h2>
        <div className="mt-3 rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-xs leading-5 text-muted-foreground">
          Los contratos y otros documentos quedan vinculados a esta cuenta para consulta. Puedes desactivarlos sin borrar el archivo; la integración con la aceptación de pedidos queda pendiente.
        </div>
      </div>
      {errorDescarga && <p role="alert" className="px-5 pb-3 text-sm text-destructive sm:px-6">{errorDescarga}</p>}
      {errorEstado && <p role="alert" className="mx-5 mb-3 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive sm:mx-6"><AlertCircle className="h-4 w-4 shrink-0" />{errorEstado}</p>}
      {isLoading ? <p className="px-5 pb-5 text-sm text-muted-foreground sm:px-6">Cargando documentos…</p> : isError ? <p role="alert" className="px-5 pb-5 text-sm text-destructive sm:px-6">No se pudieron cargar los documentos asociados.</p> : documentos.length === 0 ? <p className="px-5 pb-2 text-sm text-muted-foreground sm:px-6">Sin documentos registrados.</p> : <div className="divide-y divide-border border-t border-border">{documentos.map(documento => <article key={documento.id} className={`flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6 ${!documento.activo ? "opacity-60" : ""}`}>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="h-4 w-4" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-foreground">{docTypeLabels[documento.tipo]}</strong>{documento.referencia && <span className="text-sm text-muted-foreground">· {documento.referencia}</span>}<span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${documento.activo ? "bg-emerald-500/10 text-emerald-700" : "bg-secondary text-muted-foreground"}`}>{documento.activo ? "Activo" : "Inactivo"}</span></div>
          <p className="mt-1 truncate text-xs text-muted-foreground">{documento.nombre_archivo} · Vigencia {documento.vigencia_hasta ? formatDate(documento.vigencia_hasta) : "sin fecha"} · Registrado por {documento.creado_por_nombre}</p>
        </div>
        <button type="button" onClick={() => void abrirDocumento(documento)} disabled={!documento.activo || descargar.isPending} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary disabled:opacity-50"><Download className="h-3.5 w-3.5" />Descargar</button>
        {documento.activo ? <button type="button" onClick={() => void cambiarEstadoDocumento(documento, false)} disabled={cambiarEstado.isPending} title="Desactivar documento" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50">{cambiarEstado.isPending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}{cambiarEstado.isPending ? "Actualizando…" : "Desactivar"}</button> : <button type="button" onClick={() => void cambiarEstadoDocumento(documento, true)} disabled={cambiarEstado.isPending} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50">{cambiarEstado.isPending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}{cambiarEstado.isPending ? "Actualizando…" : "Reactivar"}</button>}
      </article>)}</div>}
      <div className="border-t border-border px-5 py-4 sm:px-6"><button type="button" onClick={() => setModalAbierto(true)} className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary"><Plus className="h-4 w-4" />Registrar contrato / documento</button></div>
    </section>

    <section className="rounded-xl border border-border bg-card">
      <header className="border-b border-border px-5 py-4 sm:px-6"><h2 className="text-base font-semibold text-foreground">Historial de modificaciones</h2><p className="mt-1 text-sm text-muted-foreground">Cambios registrados en la ficha, personas, ubicaciones y documentos.</p></header>
      {cargandoHistorial ? <p className="px-5 py-5 text-sm text-muted-foreground sm:px-6">Cargando historial…</p> : errorHistorial ? <p role="alert" className="px-5 py-5 text-sm text-destructive sm:px-6">No se pudo cargar el historial.</p> : historial.length === 0 ? <p className="px-5 py-5 text-sm text-muted-foreground sm:px-6">Todavía no hay modificaciones registradas.</p> : <ol className="divide-y divide-border">{historial.slice(0, 20).map(evento => <li key={evento.id} className="px-5 py-3.5 sm:px-6"><p className="text-sm font-medium text-foreground">{evento.accion}</p><p className="mt-1 text-xs text-muted-foreground">{formatDateTime(evento.fecha)} · {evento.usuario_nombre}{evento.detalle ? ` · ${evento.detalle}` : ""}</p></li>)}</ol>}
    </section>

    {modalAbierto && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"><section role="dialog" aria-modal="true" aria-labelledby="documento-dialog-title" className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
      <header className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6"><h2 id="documento-dialog-title" className="text-lg font-bold text-foreground">Adjuntar documento · {nombreComercial}</h2><button type="button" onClick={cerrarModal} aria-label="Cerrar" className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><X className="h-5 w-5" /></button></header>
      <form onSubmit={guardarDocumento}><div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <label className={labelClass}>Tipo<select className={inputClass} value={tipo} onChange={e => setTipo(e.target.value as TipoDocumentoCuentaComercial)}><option value="contrato">Contrato</option><option value="orden_compra">Orden de compra</option><option value="licitacion">Licitación</option><option value="otro">Otro</option></select></label>
        <label className={labelClass}>N.º documento / referencia<input className={inputClass} maxLength={200} value={referencia} onChange={e => setReferencia(e.target.value)} /></label>
        <label className={labelClass}>Vigencia hasta (si aplica)<input className={inputClass} type="date" value={vigencia} onChange={e => setVigencia(e.target.value)} /></label>
        <label className={labelClass}>Estado<select className={inputClass} value={activo ? "true" : "false"} onChange={e => setActivo(e.target.value === "true")}><option value="true">Activo</option><option value="false">Inactivo</option></select></label>
        <label className={`${labelClass} sm:col-span-2`}>Archivo PDF o imagen · Máximo 5 MB<input className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold`} type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" onChange={e => setArchivo(e.target.files?.[0] ?? null)} required /><span className="mt-1 block font-normal">Formatos admitidos: PDF, PNG o JPEG.</span></label>
        {errorFormulario && <p role="alert" className="sm:col-span-2 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"><AlertCircle className="h-4 w-4 shrink-0" />{errorFormulario}</p>}
      </div><footer className="flex justify-end gap-2 border-t border-border px-5 py-4 sm:px-6"><button type="button" onClick={cerrarModal} disabled={crear.isPending} className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground">Cancelar</button><button type="submit" disabled={crear.isPending} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{crear.isPending ? "Guardando…" : <><Upload className="h-4 w-4" />Guardar documento</>}</button></footer></form>
    </section></div>}
  </>;
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getBackendErrorMessage(error: unknown): string {
  const details = (error as { details?: unknown } | null)?.details;
  if (details && typeof details === "object") {
    const messages = Object.entries(details as Record<string, unknown>).flatMap(([field, value]) => {
      const entries = Array.isArray(value) ? value : [value];
      return entries.filter((entry): entry is string => typeof entry === "string").map(message => `${field}: ${message}`);
    });
    if (messages.length) return messages.join(" ");
  }
  return error instanceof Error ? error.message : "Error inesperado.";
}
