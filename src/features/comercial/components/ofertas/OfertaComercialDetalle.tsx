import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

export default function OfertaComercialDetalle({
  cliente,
  numero,
  version,
  estado,
  cantidad,
  total,
  children,
  evidenciaRegistrada,
  aviso,
  onBack,
  onAddProduct,
  onSend,
  onSaveDraft,
  onPdf,
}: {
  cliente: string;
  numero: string | null;
  version: string | null;
  estado: string;
  cantidad: number;
  total: string;
  children: ReactNode;
  evidenciaRegistrada?: { medio: string; detalle: string; archivo?: string | null } | null;
  aviso?: string;
  onBack: () => void;
  onAddProduct: () => void;
  onSend: () => void;
  onSaveDraft?: () => void;
  onPdf?: () => void;
}) {
  return <main className="min-h-[calc(100dvh-5rem)] -m-4 space-y-5 bg-slate-100 p-4 sm:-m-6 sm:p-6">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-2xl font-bold text-slate-900">{numero && version ? `${numero} · V${version}` : "OF-0XX-V1"}</h1><p className="mt-1 text-sm text-slate-500">{cliente}</p></div>
      <div className="flex items-center gap-2"><button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"><ArrowLeft className="h-4 w-4" /> Ofertas comerciales</button><span className="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">{estado}</span></div>
    </header>
    <nav aria-label="Secciones de la oferta" className="flex flex-wrap gap-2">
      <button type="button" className="rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white">▦ Productos</button>
      <button type="button" disabled className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-500 disabled:cursor-default">⚙ Condiciones</button>
      <button type="button" disabled className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-500 disabled:cursor-default">◷ Seguimiento</button>
      <button type="button" disabled className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-500 disabled:cursor-default">▤ Versiones ({version ? Number(version) : 1})</button>
    </nav>
    <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,330px)]">
      <section className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">Carrito de productos</h2><p className="mt-2 text-xs text-slate-500">Homologados y comerciales con bases independientes</p></div><button type="button" onClick={onAddProduct} className="rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white">＋ Agregar producto</button></div>
        {children}
        {evidenciaRegistrada && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900"><p className="font-semibold">Envío registrado · {evidenciaRegistrada.medio}</p><p className="mt-1">{evidenciaRegistrada.detalle}</p>{evidenciaRegistrada.archivo && <p className="mt-1 text-emerald-700">Comprobante: {evidenciaRegistrada.archivo}</p>}</div>}
      </section>
      <aside className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div><h2 className="font-bold text-slate-900">Acciones y estado</h2><p className="mt-3 border-b border-slate-200 pb-4 text-xs text-slate-500">{cliente} · {cantidad} {cantidad === 1 ? "producto" : "productos"}{version ? ` · V${version}` : ""}</p></div>
        <div className="min-w-0 border-b border-slate-200 pb-4"><p className="text-xs text-slate-500">Valor actual</p><p className="mt-1 break-words text-2xl font-bold text-slate-900 sm:text-3xl">Bs {total}</p><span className="mt-3 inline-flex max-w-full rounded-full bg-amber-100 px-3 py-1.5 text-[10px] font-semibold text-amber-800">{estado}</span></div>
        <button type="button" onClick={onSend} disabled={!cantidad} className="w-full rounded-lg bg-blue-700 px-4 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">✓ Guardar y registrar envío</button>
        {onSaveDraft && <button type="button" onClick={onSaveDraft} disabled={!cantidad} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Guardar borrador</button>}
        {onPdf && <button type="button" onClick={onPdf} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700">↓ PDF para enviar</button>}
        {aviso && <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">{aviso}</p>}
      </aside>
    </div>
  </main>;
}
