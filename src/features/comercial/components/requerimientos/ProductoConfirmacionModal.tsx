import { Package, X, ArrowRight, Search } from "lucide-react";

import type { ProductoBusquedaResultado } from "@/features/comercial/comercial.types";
import type { ProductType } from "@/features/comercial/comercial.types";

interface ProductoConfirmacionModalProps {
  open: boolean;
  producto: ProductoBusquedaResultado | null;
  productType: ProductType;
  onConfirm: () => void;
  onSearchAnother: () => void;
  onClose: () => void;
}

export default function ProductoConfirmacionModal({
  open,
  producto,
  productType,
  onConfirm,
  onSearchAnother,
  onClose,
}: ProductoConfirmacionModalProps) {
  if (!open || !producto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-lg sm:p-6">
        {/* Encabezado */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Producto seleccionado
              </h3>

              <p className="mt-0.5 text-sm text-muted-foreground">
                Verifica los detalles antes de continuar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              inline-flex h-8 w-8 items-center justify-center
              rounded-lg border border-border
              bg-background
              text-muted-foreground
              transition-colors
              hover:bg-secondary
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Resumen visual y detalles del producto */}
        <div className="mb-6 overflow-hidden rounded-xl border border-border bg-secondary/20">
          {producto.imagen && (
            <div className="flex h-40 items-center justify-center border-b border-border bg-background p-3">
              <img
                src={producto.imagen}
                alt={producto.producto_nombre}
                className="h-full max-w-full object-contain"
              />
            </div>
          )}
          <div className="p-4">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-base font-bold text-foreground">
                  {producto.producto_nombre}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Código: {producto.producto_codigo}
                </p>
                {producto.producto_descripcion && (
                  <p className="mt-2 text-sm leading-5 text-muted-foreground">
                    {producto.producto_descripcion}
                  </p>
                )}
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                Versión V{producto.version_numero}
              </span>
            </div>

            {(producto.categoria || producto.subcategoria) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {producto.categoria && (
                  <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                    {producto.categoria}
                  </span>
                )}
                {producto.subcategoria && (
                  <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
                    {producto.subcategoria}
                  </span>
                )}
              </div>
            )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Material:</span>
              <span className="font-medium text-foreground">{producto.material}</span>
            </div>

            {producto.micraje && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Micraje:</span>
                <span className="font-medium text-foreground">{producto.micraje} µm</span>
              </div>
            )}

            {producto.capas && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capas:</span>
                <span className="font-medium text-foreground">{producto.capas}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Impresión:</span>
              <span className="font-medium text-foreground">
                {producto.impresion ? "Sí" : "No"}
              </span>
            </div>

            {/* Especificaciones de bolsa */}
            {productType === "bag" && producto.especificacion_bolsa && (
              <>
                {producto.especificacion_bolsa.ancho_doblado && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ancho:</span>
                    <span className="font-medium text-foreground">{producto.especificacion_bolsa.ancho_doblado} cm</span>
                  </div>
                )}

                {producto.especificacion_bolsa.largo_doblado && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Largo:</span>
                    <span className="font-medium text-foreground">{producto.especificacion_bolsa.largo_doblado} cm</span>
                  </div>
                )}

                {producto.especificacion_bolsa.tipo_troquel && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo troquel:</span>
                    <span className="font-medium text-foreground">{producto.especificacion_bolsa.tipo_troquel}</span>
                  </div>
                )}

                {producto.especificacion_bolsa.tipo_sello && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo sello:</span>
                    <span className="font-medium text-foreground">{producto.especificacion_bolsa.tipo_sello}</span>
                  </div>
                )}
              </>
            )}

            {/* Especificaciones de bobina */}
            {productType === "roll" && producto.especificacion_bobina && (
              <>
                {producto.especificacion_bobina.ancho && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ancho:</span>
                    <span className="font-medium text-foreground">{producto.especificacion_bobina.ancho} cm</span>
                  </div>
                )}

                {producto.especificacion_bobina.diametro && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diámetro:</span>
                    <span className="font-medium text-foreground">{producto.especificacion_bobina.diametro} cm</span>
                  </div>
                )}

                {producto.especificacion_bobina.diametro_nucleo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diámetro núcleo:</span>
                    <span className="font-medium text-foreground">{producto.especificacion_bobina.diametro_nucleo} cm</span>
                  </div>
                )}

                {producto.especificacion_bobina.tipo_nucleo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo núcleo:</span>
                    <span className="font-medium text-foreground">{producto.especificacion_bobina.tipo_nucleo}</span>
                  </div>
                )}

                {producto.especificacion_bobina.longitud && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Longitud:</span>
                    <span className="font-medium text-foreground">{producto.especificacion_bobina.longitud} m</span>
                  </div>
                )}

                {producto.especificacion_bobina.peso && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Peso:</span>
                    <span className="font-medium text-foreground">{producto.especificacion_bobina.peso} kg</span>
                  </div>
                )}
              </>
            )}
          </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSearchAnother}
            className="
              inline-flex flex-1 items-center justify-center gap-2
              rounded-lg border border-border
              bg-background px-4 py-2.5
              text-sm font-medium
              text-foreground
              transition-colors
              hover:bg-secondary
            "
          >
            <Search className="h-4 w-4" />
            Buscar otro
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="
              inline-flex flex-1 items-center justify-center gap-2
              rounded-lg bg-primary px-4 py-2.5
              text-sm font-medium
              text-primary-foreground
              transition-colors
              hover:bg-primary/90
            "
          >
            Sí, utilizar este producto
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
