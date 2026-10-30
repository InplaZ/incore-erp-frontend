import { X } from "lucide-react";

export type MedioEnvioComercial = "telefono" | "email" | "whatsapp" | "presencial" | "videollamada" | "otro";

export default function RegistrarEnvioComercialModal({
  open, pending, medio, detalle, archivo, recordatorio, error,
  onClose, onMedio, onDetalle, onArchivo, onFileError, onRecordatorio, onConfirm,
}: {
  open: boolean;
  pending: boolean;
  medio: MedioEnvioComercial;
  detalle: string;
  archivo: File | null;
  recordatorio: boolean;
  error: string;
  onClose: () => void;
  onMedio: (medio: MedioEnvioComercial) => void;
  onDetalle: (detalle: string) => void;
  onArchivo: (archivo: File | null) => void;
  onFileError: (error: string) => void;
  onRecordatorio: (recordatorio: boolean) => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  const selectFile = (file: File | null, input: HTMLInputElement) => {
    if (file && file.size > 1_572_864) { input.value = ""; onArchivo(null); return "El comprobante no puede superar 1,5 MB."; }
    if (file && !/\.(png|jpe?g|webp|pdf)$/i.test(file.name)) { input.value = ""; onArchivo(null); return "Adjunte un archivo PNG, JPG, WEBP o PDF."; }
    onArchivo(file);
    return "";
  };
  return <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="registro-envio-titulo" className="flex max-h-[96dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-border bg-white shadow-2xl sm:rounded-2xl">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4"><h2 id="registro-envio-titulo" className="font-semibold text-slate-900">Guardar y registrar envío al cliente</h2><button type="button" onClick={onClose} disabled={pending} aria-label="Cerrar" className="text-xl text-slate-400 disabled:opacity-50"><X className="h-5 w-5" /></button></header>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-slate-600">La oferta solo pasará a Enviada cuando se registre su constancia. Puedes programar un recordatorio inmediato.</p>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">Medio / tipo de evidencia<select value={medio} onChange={(event) => onMedio(event.target.value as MedioEnvioComercial)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"><option value="telefono">Teléfono</option><option value="email">Correo electrónico</option><option value="whatsapp">WhatsApp</option><option value="presencial">Presencial</option><option value="videollamada">Videollamada</option><option value="otro">Otro</option></select></label>
          <label className="text-xs font-semibold text-slate-600">Adjuntar comprobante / captura (máx. 1,5 MB)<input type="file" accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf" onChange={(event) => { const message = selectFile(event.target.files?.[0] ?? null, event.target); onFileError(message); }} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800" />{archivo && <span className="mt-1 block font-normal text-slate-500">{archivo.name}</span>}</label>
        </div>
        <label className="block text-xs font-semibold text-slate-600">Detalle del envío o confirmación<textarea value={detalle} onChange={(event) => onDetalle(event.target.value)} rows={3} placeholder="Ej. Envié V02 por WhatsApp al encargado, 14:30; respondió confirmando recepción..." className="mt-1 block w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-normal text-slate-800" /></label>
        <label className="flex items-center gap-2 border-t border-slate-200 pt-4 text-sm text-slate-700"><input type="checkbox" checked={recordatorio} onChange={(event) => onRecordatorio(event.target.checked)} /> Programar recordatorio para hablar con el cliente</label>
      </div>
      <footer className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4"><button type="button" disabled={pending} onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700">Cancelar</button><button type="button" disabled={pending || !detalle.trim()} onClick={onConfirm} className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Registrando…" : "Confirmar envío comercial"}</button></footer>
    </section>
  </div>;
}
