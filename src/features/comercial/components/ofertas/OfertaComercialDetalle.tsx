import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

export default function OfertaComercialDetalle({
  cliente,
  numero,
  version,
  estado,
  cantidad,
  total,
  moneda = "Bs",
  children,
  condiciones,
  seguimiento,
  accionesSeguimiento,
  versiones,
  accionesVersiones,
  acciones,
  pestañaActiva,
  onPestaña,
  evidenciaRegistrada,
  aviso,
  onBack,
  onAddProduct,
  onSend,
  onSaveDraft,
  onPdf,
  allowAddProduct = true,
  allowVersionsTab = true,
  versionCount,
}: {
  cliente: string;
  numero: string | null;
  version: string | null;
  estado: string;
  cantidad: number;
  total: string;
  moneda?: string;
  children: ReactNode;
  condiciones?: ReactNode;
  seguimiento?: ReactNode;
  accionesSeguimiento?: ReactNode;
  versiones?: ReactNode;
  accionesVersiones?: ReactNode;
  acciones?: ReactNode;
  pestañaActiva?: "productos" | "condiciones" | "seguimiento" | "versiones";
  onPestaña?: (pestaña: "productos" | "condiciones" | "seguimiento" | "versiones") => void;
  evidenciaRegistrada?: { medio: string; detalle: string; archivo?: string | null } | null;
  aviso?: string;
  onBack: () => void;
  onAddProduct: () => void;
  onSend: () => void;
  onSaveDraft?: () => void;
  onPdf?: () => void;
  allowAddProduct?: boolean;
  allowVersionsTab?: boolean;
  versionCount?: number;
}) {
  return <main className="min-h-[calc(100dvh-5rem)] -m-4 space-y-5 bg-slate-100 p-4 sm:-m-6 sm:p-6">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-2xl font-bold text-slate-900">{numero ? `${numero}${version ? ` · V${version}` : ""}` : "Oferta en preparación"}</h1><p className="mt-1 text-sm text-slate-500">{cliente}</p></div>
      <div className="flex items-center gap-2"><button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"><ArrowLeft className="h-4 w-4" /> Ofertas comerciales</button><span className="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">{estado}</span></div>
    </header>
    <nav aria-label="Secciones de la oferta" className="flex flex-wrap gap-2">
      <button type="button" onClick={() => onPestaña?.("productos")} aria-current={pestañaActiva === "productos" ? "page" : undefined} className={`rounded-lg px-4 py-2.5 text-xs font-semibold ${pestañaActiva === "productos" ? "bg-blue-700 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>▦ Productos</button>
      <button type="button" onClick={() => onPestaña?.("condiciones")} aria-current={pestañaActiva === "condiciones" ? "page" : undefined} className={`rounded-lg px-4 py-2.5 text-xs font-semibold ${pestañaActiva === "condiciones" ? "bg-blue-700 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>⚙ Condiciones</button>
      <button type="button" onClick={() => onPestaña?.("seguimiento")} aria-current={pestañaActiva === "seguimiento" ? "page" : undefined} className={`rounded-lg px-4 py-2.5 text-xs font-semibold ${pestañaActiva === "seguimiento" ? "bg-blue-700 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>◷ Seguimiento</button>
      <button type="button" onClick={() => onPestaña?.("versiones")} disabled={!allowVersionsTab} aria-current={pestañaActiva === "versiones" ? "page" : undefined} className={`rounded-lg px-4 py-2.5 text-xs font-semibold ${pestañaActiva === "versiones" ? "bg-blue-700 text-white" : "border border-slate-200 bg-white text-slate-700"} disabled:cursor-not-allowed disabled:opacity-60`}>▤ Versiones ({versionCount ?? (version ? Number(version) : 0)})</button>
    </nav>
    <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,330px)]">
      <section className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        {pestañaActiva === "condiciones" ? condiciones : pestañaActiva === "seguimiento" ? seguimiento : pestañaActiva === "versiones" ? versiones : <>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">Carrito de productos</h2><p className="mt-2 text-xs text-slate-500">Homologados y comerciales con bases independientes</p></div><button type="button" onClick={onAddProduct} disabled={!allowAddProduct} className="rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">＋ Agregar producto</button></div>
          {children}
        </>}
      </section>
      <aside className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div><h2 className="font-bold text-slate-900">Acciones y estado</h2><p className="mt-3 border-b border-slate-200 pb-4 text-xs text-slate-500">{cliente} · {cantidad} {cantidad === 1 ? "producto" : "productos"}{version ? ` · V${version}` : ""}</p></div>
        <div className="min-w-0 border-b border-slate-200 pb-4"><p className="text-xs text-slate-500">Valor actual</p><p className="mt-1 break-words text-2xl font-bold text-slate-900 sm:text-3xl">{moneda} {total}</p><span className="mt-3 inline-flex max-w-full rounded-full bg-amber-100 px-3 py-1.5 text-[10px] font-semibold text-amber-800">{estado}</span></div>
        {evidenciaRegistrada && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[10px] text-emerald-900"><p className="font-semibold">Evidencia: {evidenciaRegistrada.medio}{evidenciaRegistrada.archivo ? ` · ${evidenciaRegistrada.archivo}` : ""}</p><p className="mt-1 break-words">{evidenciaRegistrada.detalle}</p></div>}
        {acciones ?? (pestañaActiva === "seguimiento" ? accionesSeguimiento : pestañaActiva === "versiones" ? accionesVersiones : <>
          <button type="button" onClick={onSend} disabled={!cantidad} className="w-full rounded-lg bg-blue-700 px-4 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">✓ Guardar y registrar envío</button>
          {onSaveDraft && <button type="button" onClick={onSaveDraft} disabled={!cantidad} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Guardar borrador</button>}
          {onPdf && <button type="button" onClick={onPdf} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700">↓ PDF para enviar</button>}
          {aviso && <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">{aviso}</p>}
        </>)}
      </aside>
    </div>
  </main>;
}
