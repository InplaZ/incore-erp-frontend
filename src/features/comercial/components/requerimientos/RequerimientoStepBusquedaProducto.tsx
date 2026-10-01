import { Search, ArrowRight, Package, X } from "lucide-react";
import { useState } from "react";

import { useBuscarProductosCatalogo } from "@/features/productos/productos.hooks";
import type { ProductType } from "./RequerimientoStepProducto";
import type { ProductoBusquedaResultado } from "@/features/comercial/comercial.types";
import type { MaterialProducto, TipoCapa } from "@/features/comercial/comercial.types";

interface RequerimientoStepBusquedaProductoProps {
  product: ProductType;
  onProductSelect: (producto: ProductoBusquedaResultado) => void;
  onCreateNew: () => void;
}

export default function RequerimientoStepBusquedaProducto({
  product,
  onProductSelect,
  onCreateNew,
}: RequerimientoStepBusquedaProductoProps) {
  const [busqueda, setBusqueda] = useState("");
  const [material, setMaterial] = useState<MaterialProducto | "">("");
  const [micraje, setMicraje] = useState("");
  const [capas, setCapas] = useState<TipoCapa | "">("");
  const [impresion, setImpresion] = useState<boolean | "">("");

  // Determinar la categoría basada en el tipo de producto
  const categoria = product === "bag" ? "bolsas" : product === "roll" ? "bobinas" : "";

  const {
    data: catalogoData,
    isLoading: catalogoLoading,
    error: catalogoError,
  } = useBuscarProductosCatalogo(
    {
      categoria,
      q: busqueda || undefined,
      material: material || undefined,
      micraje: micraje || undefined,
      capas: capas || undefined,
      impresion: impresion === "" ? undefined : impresion,
    },
    !!categoria
  );

  const productos = catalogoData?.productos || [];
  const cantidad = catalogoData?.cantidad || 0;

  const handleLimpiarFiltros = () => {
    setBusqueda("");
    setMaterial("");
    setMicraje("");
    setCapas("");
    setImpresion("");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Encabezado */}
      <div>
        <h3 className="text-lg font-semibold">
          {product === "bag" ? "¿Qué bolsa necesita tu cliente?" : "¿Qué bobina necesita tu cliente?"}
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Busca en el catálogo de productos existentes o crea uno nuevo.
        </p>
      </div>

      {/* Buscador y filtros */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        {/* Buscador principal */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Buscar por nombre o código
          </label>

          <div className="relative">
            <Search
              className="
                pointer-events-none
                absolute left-3 top-1/2
                h-4 w-4
                -translate-y-1/2
                text-muted-foreground
              "
            />

            <input
              type="text"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por nombre o código..."
              className="
                w-full rounded-lg
                border border-border
                bg-background
                py-2.5 pl-9 pr-3
                text-sm text-foreground
                outline-none
                transition-colors
                placeholder:text-muted-foreground
                focus:border-primary
                focus:ring-1 focus:ring-primary/20
              "
            />
          </div>
        </div>

        {/* Filtros básicos */}
        <div className="mb-4 grid gap-4 md:grid-cols-4">
          {/* Material */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Material
            </label>

            <select
              value={material}
              onChange={(event) => setMaterial(event.target.value as MaterialProducto | "")}
              className="
                w-full rounded-lg
                border border-border
                bg-background
                px-3 py-2.5
                text-sm text-foreground
                outline-none
                transition-colors
                focus:border-primary
                focus:ring-1 focus:ring-primary/20
              "
            >
              <option value="">Todos</option>
              <option value="PEAD">PEAD</option>
              <option value="PEBD">PEBD</option>
              <option value="PP">PP</option>
              <option value="BOPP">BOPP</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          {/* Micraje */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Micraje
            </label>

            <input
              type="text"
              value={micraje}
              onChange={(event) => setMicraje(event.target.value)}
              placeholder="Ej: 150"
              className="
                w-full rounded-lg
                border border-border
                bg-background
                px-3 py-2.5
                text-sm text-foreground
                outline-none
                transition-colors
                placeholder:text-muted-foreground
                focus:border-primary
                focus:ring-1 focus:ring-primary/20
              "
            />
          </div>

          {/* Capas */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Capas
            </label>

            <select
              value={capas}
              onChange={(event) => setCapas(event.target.value as TipoCapa | "")}
              className="
                w-full rounded-lg
                border border-border
                bg-background
                px-3 py-2.5
                text-sm text-foreground
                outline-none
                transition-colors
                focus:border-primary
                focus:ring-1 focus:ring-primary/20
              "
            >
              <option value="">Todas</option>
              <option value="monocapa">Monocapa</option>
              <option value="bicapa">Bicapa</option>
              <option value="tricapa">Tricapa</option>
            </select>
          </div>

          {/* Impresión */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Impresión
            </label>

            <select
              value={impresion === "" ? "" : impresion ? "true" : "false"}
              onChange={(event) => setImpresion(event.target.value === "" ? "" : event.target.value === "true")}
              className="
                w-full rounded-lg
                border border-border
                bg-background
                px-3 py-2.5
                text-sm text-foreground
                outline-none
                transition-colors
                focus:border-primary
                focus:ring-1 focus:ring-primary/20
              "
            >
              <option value="">Todas</option>
              <option value="true">Con impresión</option>
              <option value="false">Sin impresión</option>
            </select>
          </div>
        </div>

        {/* Botón limpiar filtros */}
        {(busqueda || material || micraje || capas || impresion !== "") && (
          <button
            type="button"
            onClick={handleLimpiarFiltros}
            className="
              inline-flex items-center gap-2
              rounded-lg border border-border
              bg-secondary px-3 py-2
              text-sm font-medium
              text-foreground
              transition-colors
              hover:bg-secondary/80
            "
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Resultados */}
      {catalogoLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            Cargando productos...
          </p>
        </div>
      ) : catalogoError ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-destructive">
            Error al cargar el catálogo. Por favor, intenta nuevamente.
          </p>
        </div>
      ) : productos.length === 0 ? (
        <div className="rounded-xl border border-border bg-secondary/30 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>

          <p className="text-sm font-medium text-foreground">
            No se encontraron productos
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Intenta con otros filtros o crea un producto nuevo.
          </p>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={onCreateNew}
              className="
                inline-flex items-center gap-2
                rounded-lg bg-primary px-4 py-2
                text-sm font-medium
                text-primary-foreground
                transition-colors
                hover:bg-primary/90
              "
            >
              Crear producto nuevo
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Contador de resultados */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {cantidad} producto{cantidad !== 1 ? "s" : ""} encontrado{cantidad !== 1 ? "s" : ""}
            </p>

            <button
              type="button"
              onClick={onCreateNew}
              className="
                inline-flex items-center gap-2
                rounded-lg border border-border
                bg-background px-3 py-2
                text-sm font-medium
                text-foreground
                transition-colors
                hover:bg-secondary
              "
            >
              Crear producto nuevo
            </button>
          </div>

          {/* Lista de productos */}
          <div className="grid gap-4 md:grid-cols-2">
            {productos.map((producto) => (
              <div
                key={producto.version_id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/50"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary/60">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {producto.producto_nombre}
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {producto.producto_codigo}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        V{producto.version_numero}
                      </span>
                    </div>

                    {/* Atributos del producto */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <span className="text-muted-foreground">
                          Material: <span className="font-medium text-foreground">{producto.material}</span>
                        </span>

                        {producto.micraje && (
                          <span className="text-muted-foreground">
                            Micraje: <span className="font-medium text-foreground">{producto.micraje} µm</span>
                          </span>
                        )}

                        {producto.capas && (
                          <span className="text-muted-foreground">
                            Capas: <span className="font-medium text-foreground">{producto.capas}</span>
                          </span>
                        )}
                      </div>

                      {/* Especificaciones de bolsa */}
                      {product === "bag" && producto.especificacion_bolsa && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                          {producto.especificacion_bolsa.ancho_doblado && (
                            <span className="text-muted-foreground">
                              Ancho: <span className="font-medium text-foreground">{producto.especificacion_bolsa.ancho_doblado} cm</span>
                            </span>
                          )}

                          {producto.especificacion_bolsa.largo_doblado && (
                            <span className="text-muted-foreground">
                              Largo: <span className="font-medium text-foreground">{producto.especificacion_bolsa.largo_doblado} cm</span>
                            </span>
                          )}

                          {producto.impresion && (
                            <span className="text-muted-foreground">
                              Impresión: <span className="font-medium text-foreground">Sí</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Especificaciones de bobina */}
                      {product === "roll" && producto.especificacion_bobina && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                          {producto.especificacion_bobina.ancho && (
                            <span className="text-muted-foreground">
                              Ancho: <span className="font-medium text-foreground">{producto.especificacion_bobina.ancho} cm</span>
                            </span>
                          )}

                          {producto.especificacion_bobina.diametro && (
                            <span className="text-muted-foreground">
                              Diámetro: <span className="font-medium text-foreground">{producto.especificacion_bobina.diametro} cm</span>
                            </span>
                          )}

                          {producto.especificacion_bobina.longitud && (
                            <span className="text-muted-foreground">
                              Longitud: <span className="font-medium text-foreground">{producto.especificacion_bobina.longitud} m</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Botón seleccionar */}
                    <button
                      type="button"
                      onClick={() => onProductSelect(producto)}
                      className="
                        mt-4 inline-flex w-full items-center justify-center gap-2
                        rounded-lg border border-border
                        bg-secondary px-3 py-2
                        text-sm font-medium
                        text-foreground
                        transition-colors
                        hover:bg-secondary/80
                      "
                    >
                      Seleccionar producto
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
