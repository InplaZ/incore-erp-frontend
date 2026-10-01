import { Package, X, ArrowRight, Search } from "lucide-react";

import type { ProductoBusquedaResultado } from "@/features/comercial/comercial.types";
import type { ProductType } from "./RequerimientoStepProducto";

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
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
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

        {/* Detalles del producto */}
        <div className="mb-6 rounded-lg border border-border bg-secondary/30 p-4">
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">
              {producto.producto_nombre}
            </p>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {producto.producto_codigo}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versión:</span>
              <span className="font-medium text-foreground">V{producto.version_numero}</span>
            </div>

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
