import { X } from "lucide-react";
import RequerimientoStepBusquedaProducto from "../requerimientos/RequerimientoStepBusquedaProducto";
import type { ProductoBusquedaResultado } from "../../comercial.types";
import type { ProductType } from "../requerimientos/RequerimientoStepProducto";

export default function CatalogoOfertaModal({
  open, product, onProductType, onClose, onAdd, onCreate, versionsInCart,
}: {
  open: boolean;
  product: ProductType;
  onProductType: (type: ProductType) => void;
  onClose: () => void;
  onAdd: (product: ProductoBusquedaResultado) => void;
  onCreate: () => void;
  versionsInCart: number[];
}) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-2 sm:p-5">
    <section role="dialog" aria-modal="true" aria-labelledby="catalogo-oferta-titulo" className="flex max-h-[96dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 id="catalogo-oferta-titulo" className="font-semibold text-slate-900">Agregar producto</h2><p className="mt-1 text-xs text-slate-500">Busca productos homologados o crea un producto comercial.</p></div><button type="button" onClick={onClose} aria-label="Cerrar" className="text-xl text-slate-400"><X className="h-5 w-5" /></button></header>
      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5"><RequerimientoStepBusquedaProducto product={product} onProductSelect={() => undefined} onAddToCart={(item) => { onAdd(item); onClose(); }} versionesEnCarrito={versionsInCart} onCreateNew={onCreate} /></div>
      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-5 py-3"><div className="flex gap-2"><button type="button" onClick={() => onProductType("bag")} className={`rounded-lg px-3 py-2 text-xs font-semibold ${product === "bag" ? "bg-blue-700 text-white" : "border border-slate-200 text-slate-600"}`}>Bolsas</button><button type="button" onClick={() => onProductType("roll")} className={`rounded-lg px-3 py-2 text-xs font-semibold ${product === "roll" ? "bg-blue-700 text-white" : "border border-slate-200 text-slate-600"}`}>Bobinas</button></div><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700">Cerrar catálogo</button></footer>
    </section>
  </div>;
}
