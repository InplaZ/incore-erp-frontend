
import { ArrowLeft, Layers3, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import RequerimientoStepBusquedaProducto from "../requerimientos/RequerimientoStepBusquedaProducto";
import type { ProductoBusquedaResultado } from "../../comercial.types";
import type { ProductType } from "../requerimientos/RequerimientoStepProducto";

export default function CatalogoOfertaModal({
  open,
  product,
  onProductType,
  onClose,
  onAdd,
  onCreate,
  versionsInCart,
}: {
  open: boolean;
  product: ProductType;
  onProductType: (type: ProductType) => void;
  onClose: () => void;
  onAdd: (product: ProductoBusquedaResultado) => void;
  onCreate: () => void;
  versionsInCart: number[];
}) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<ProductType | null>(null);

  if (!open) return null;

  const categorias = [
    {
      id: "bag" as ProductType,
      titulo: "Bolsas",
      descripcion: "Explora nuestro catálogo de bolsas y sus especificaciones.",
      detalle: "Productos flexibles con diferentes materiales, medidas y acabados.",
      icon: ShoppingBag,
    },
    {
      id: "roll" as ProductType,
      titulo: "Bobinas",
      descripcion: "Explora nuestro catálogo de bobinas y sus especificaciones.",
      detalle: "Bobinas disponibles según material, ancho, micraje y capas.",
      icon: Layers3,
    },
  ];

  const seleccionarCategoria = (tipo: ProductType) => {
    onProductType(tipo);
    setCategoriaSeleccionada(tipo);
  };

  const volverCategorias = () => {
    setCategoriaSeleccionada(null);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-2 sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalogo-oferta-titulo"
        className="flex max-h-[96dvh] min-h-[520px] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id="catalogo-oferta-titulo" className="font-semibold text-slate-900">
              Agregar producto
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Busca productos homologados o crea un producto comercial.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {!categoriaSeleccionada ? (
          /* Pantalla inicial: selección de categoría */
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-slate-50/60 px-5 py-10">
            <div className="mb-9 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Catálogo de productos
              </span>

              <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                ¿Qué producto deseas agregar?
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Selecciona una categoría para comenzar.
              </p>
            </div>

            <div className="grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
              {categorias.map((categoria) => {
                const Icon = categoria.icon;

                return (
                  <button
                    key={categoria.id}
                    type="button"
                    onClick={() => seleccionarCategoria(categoria.id)}
                    className="group flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-100">
                      <Icon className="h-10 w-10" strokeWidth={1.6} />
                    </div>

                    <h4 className="mt-6 text-xl font-bold text-slate-900">
                      {categoria.titulo}
                    </h4>

                    <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                      {categoria.descripcion}
                    </p>

                    <span className="mt-5 inline-flex items-center rounded-lg bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                      Explorar categoría →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Catálogo de la categoría seleccionada */
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3">
              <button
                type="button"
                onClick={volverCategorias}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-blue-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Cambiar categoría
              </button>

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                {categoriaSeleccionada === "bag" ? "Bolsas" : "Bobinas"}
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
              <RequerimientoStepBusquedaProducto
                product={categoriaSeleccionada}
                onProductSelect={() => undefined}
                onAddToCart={(item) => {
                  onAdd(item);
                  setCategoriaSeleccionada(null);
                  onClose();
                }}
                versionesEnCarrito={versionsInCart}
                onCreateNew={onCreate}
              />
            </div>
          </>
        )}

        <footer className="flex shrink-0 justify-end border-t border-slate-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cerrar catálogo
          </button>
        </footer>
      </section>
    </div>
  );
}
