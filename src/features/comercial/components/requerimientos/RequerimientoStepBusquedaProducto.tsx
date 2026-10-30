import { Eye, Layers3, Package, Ruler, Search, ShoppingCart, SlidersHorizontal, Tag, X } from "lucide-react";
import { useState } from "react";

import { useBuscarProductosCatalogo } from "@/features/productos/productos.hooks";
import type { ProductType } from "./RequerimientoStepProducto"; //Archivo donde se define si es boboina o bolsa
import type {
  MaterialProducto,
  ProductoBusquedaResultado,
  TipoCapa,
} from "@/features/comercial/comercial.types";

interface RequerimientoStepBusquedaProductoProps {
  product: ProductType;
  onProductSelect?: (producto: ProductoBusquedaResultado) => void;
  versionesEnCarrito?: number[];
  onAddToCart?: (producto: ProductoBusquedaResultado) => void;
  onCreateNew: () => void;
}

const inputClassName =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

function formatLabel(value: string | null | undefined) {
  if (!value) return "";
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ActiveFilter({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-md border border-primary/20 bg-primary/5 py-1 pl-2 pr-1 text-xs font-medium text-primary">
      <span className="truncate">{label}</span>
      <button
        type="button"
        aria-label={`Quitar filtro ${label}`}
        onClick={onRemove}
        className="rounded p-0.5 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

export default function RequerimientoStepBusquedaProducto({
  product,
  onProductSelect,
  versionesEnCarrito = [],
  onAddToCart,
  onCreateNew,
}: RequerimientoStepBusquedaProductoProps) {
  const [busqueda, setBusqueda] = useState("");
  const [material, setMaterial] = useState<MaterialProducto | "">("");
  const [micraje, setMicraje] = useState("");
  const [capas, setCapas] = useState<TipoCapa | "">("");
  const [impresion, setImpresion] = useState<boolean | "">("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState<ProductoBusquedaResultado | null>(null);

  // La categoría se determina en el paso anterior y se conserva la API existente.
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
  const filtrosActivos = Boolean(busqueda || material || micraje || capas || impresion !== "");
  const tipoProductoLabel = product === "bag" ? "bolsas" : "bobinas";

  const handleLimpiarFiltros = () => {
    setBusqueda("");
    setMaterial("");
    setMicraje("");
    setCapas("");
    setImpresion("");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Catálogo de productos</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Busca y agrega {tipoProductoLabel} a la oferta.</p>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
          <span className="text-sm text-muted-foreground" aria-live="polite">
            {catalogoLoading ? "Buscando…" : `${cantidad} ${cantidad === 1 ? "producto encontrado" : "productos encontrados"}`}
          </span>
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Package className="h-4 w-4" />
            Crear producto nuevo
          </button>
        </div>
      </header>

      <section className="space-y-2 rounded-xl border border-border bg-card p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="catalogo-producto-busqueda"
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Escribe el nombre o código del producto..."
                aria-label="Buscar producto por nombre o código"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-10 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              {busqueda && (
                <button
                  type="button"
                  aria-label="Borrar búsqueda"
                  onClick={() => setBusqueda("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setMostrarFiltros((visible) => !visible)}
              aria-expanded={mostrarFiltros}
              className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                mostrarFiltros || filtrosActivos
                  ? "border-primary/30 bg-primary/5 text-primary"
                  : "border-border bg-background text-foreground hover:bg-secondary"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {filtrosActivos && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                  {[material, micraje, capas, impresion !== "" ? "impresion" : ""].filter(Boolean).length + (busqueda ? 1 : 0)}
                </span>
              )}
            </button>
        </div>

          {/* Filtros existentes: no se añaden parámetros que el backend no soporte */}
          {mostrarFiltros && (
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-medium text-foreground">Filtrar resultados</h3>
                </div>
                {filtrosActivos && (
                  <button
                    type="button"
                    onClick={handleLimpiarFiltros}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-primary transition hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <X className="h-3.5 w-3.5" />
                    Limpiar filtros
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <label htmlFor="catalogo-material" className="text-xs font-semibold text-muted-foreground">
                    Material
                  </label>
                  <select
                    id="catalogo-material"
                    value={material}
                    onChange={(event) => setMaterial(event.target.value as MaterialProducto | "")}
                    className={inputClassName}
                  >
                    <option value="">Todos los materiales</option>
                    <option value="PEAD">PEAD</option>
                    <option value="PEBD">PEBD</option>
                    <option value="PP">PP</option>
                    <option value="BOPP">BOPP</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="catalogo-micraje" className="text-xs font-semibold text-muted-foreground">
                    Micraje
                  </label>
                  <input
                    id="catalogo-micraje"
                    type="number"
                    min="0"
                    value={micraje}
                    onChange={(event) => setMicraje(event.target.value)}
                    placeholder="Ej. 150 µm"
                    className={inputClassName}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="catalogo-capas" className="text-xs font-semibold text-muted-foreground">
                    Estructura de capas
                  </label>
                  <select
                    id="catalogo-capas"
                    value={capas}
                    onChange={(event) => setCapas(event.target.value as TipoCapa | "")}
                    className={inputClassName}
                  >
                    <option value="">Todas las estructuras</option>
                    <option value="monocapa">Monocapa</option>
                    <option value="bicapa">Bicapa</option>
                    <option value="tricapa">Tricapa</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="catalogo-impresion" className="text-xs font-semibold text-muted-foreground">
                    Impresión
                  </label>
                  <select
                    id="catalogo-impresion"
                    value={impresion === "" ? "" : impresion ? "true" : "false"}
                    onChange={(event) =>
                      setImpresion(event.target.value === "" ? "" : event.target.value === "true")
                    }
                    className={inputClassName}
                  >
                    <option value="">Con y sin impresión</option>
                    <option value="true">Con impresión</option>
                    <option value="false">Sin impresión</option>
                  </select>
                </div>
              </div>

            </div>
          )}
      </section>

      {filtrosActivos && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Filtros activos">
          {busqueda && <ActiveFilter label={`Búsqueda: ${busqueda}`} onRemove={() => setBusqueda("")} />}
          {material && <ActiveFilter label={material} onRemove={() => setMaterial("")} />}
          {micraje && <ActiveFilter label={`${micraje} µm`} onRemove={() => setMicraje("")} />}
          {capas && <ActiveFilter label={formatLabel(capas)} onRemove={() => setCapas("")} />}
          {impresion !== "" && <ActiveFilter label={impresion ? "Con impresión" : "Sin impresión"} onRemove={() => setImpresion("")} />}
          <button type="button" onClick={handleLimpiarFiltros} className="px-2 py-1 text-xs font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary">Limpiar todo</button>
        </div>
      )}

      {/* Resultados */}
      <section aria-label="Resultados del catálogo">
        {catalogoLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
                <div className="h-32 bg-secondary/70" />
                <div className="space-y-3 p-3">
                  <div className="h-4 w-2/3 rounded bg-secondary" />
                  <div className="h-3 w-1/2 rounded bg-secondary" />
                  <div className="h-8 rounded-lg bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        ) : catalogoError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-7 text-center">
            <Package className="mx-auto h-8 w-8 text-destructive" />
            <h4 className="mt-2 font-semibold text-foreground">No se pudo cargar el catálogo</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Verifica tu conexión e inténtalo nuevamente.
            </p>
          </div>
        ) : productos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-5 py-8 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="mt-3 font-semibold text-foreground">No encontramos productos</h4>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Prueba con otro nombre, código o combinación de filtros. Si no existe una opción adecuada, puedes crear una nueva especificación.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              {filtrosActivos && (
                <button type="button" onClick={handleLimpiarFiltros} className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary">
                  Limpiar búsqueda
                </button>
              )}
              <button type="button" onClick={onCreateNew} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                Crear producto nuevo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {productos.map((producto) => (
              <article
                key={producto.version_id}
                className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
              >
                <div className="relative flex h-32 items-center justify-center overflow-hidden bg-secondary/35">
                  {producto.imagen ? (
                    <img
                      src={producto.imagen}
                      alt={producto.producto_nombre}
                      loading="lazy"
                      className="h-full w-full object-contain p-3 transition duration-200 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-background text-primary/70">
                      <Package className="h-7 w-7" strokeWidth={1.4} />
                    </div>
                  )}
                  <span className="absolute right-3 top-3 rounded-md border border-border/70 bg-background/95 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
                    {producto.producto_codigo}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-3">
                  <div className="min-w-0">
                    <h4 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-foreground">
                      {producto.producto_nombre}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground">{producto.subcategoria || producto.categoria || (product === "bag" ? "Bolsa" : "Bobina")}</p>
                    {producto.producto_descripcion && (
                      <p className="mt-1 line-clamp-1 text-xs leading-4 text-muted-foreground">
                        {producto.producto_descripcion}
                      </p>
                    )}
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" />Material: <b className="font-medium text-foreground">{producto.material}</b></span>
                    {producto.capas && <span className="inline-flex items-center gap-1.5"><Layers3 className="h-3.5 w-3.5" />Capas: <b className="font-medium text-foreground">{formatLabel(producto.capas)}</b></span>}
                    <span className="inline-flex items-center gap-1.5"><Ruler className="h-3.5 w-3.5" />Dimensiones: <b className="font-medium text-foreground">{producto.especificacion_bolsa ? `${producto.especificacion_bolsa.ancho_doblado}×${producto.especificacion_bolsa.largo_doblado} cm` : producto.especificacion_bobina?.ancho ? `${producto.especificacion_bobina.ancho} cm` : "—"}</b></span>
                    {producto.micraje != null && producto.micraje !== "" && <span className="inline-flex items-center gap-1.5"><Ruler className="h-3.5 w-3.5" />Micraje: <b className="font-medium text-foreground">{producto.micraje} µ</b></span>}
                  </div>
                  <span className="mt-2 w-fit rounded bg-secondary px-2 py-1 text-[11px] text-muted-foreground">{producto.impresion ? "Con impresión" : "Sin impresión"}</span>

                  <div className="mt-auto flex gap-2 border-t border-border pt-3">
                    <button
                      type="button"
                      onClick={() => { setProductoDetalle(producto); onProductSelect?.(producto); }}
                      className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-secondary/50 px-3 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      Ver detalles
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={versionesEnCarrito.includes(producto.version_id)}
                      onClick={() => onAddToCart?.(producto)}
                      className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-default disabled:opacity-60"
                    >
                      {versionesEnCarrito.includes(producto.version_id) ? "En el carrito" : "Añadir"}
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      {productoDetalle && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setProductoDetalle(null); }}>
          <aside role="dialog" aria-modal="true" aria-label={`Detalles de ${productoDetalle.producto_nombre}`} className="flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-border bg-card shadow-xl">
            <div className="flex shrink-0 items-start justify-between border-b border-border px-4 py-3">
              <div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-wide text-primary">Detalle del producto</p><h2 className="mt-0.5 truncate text-lg font-semibold">{productoDetalle.producto_nombre}</h2><p className="mt-0.5 text-xs text-muted-foreground">Código {productoDetalle.producto_codigo} · Versión {productoDetalle.version_numero}</p></div>
              <button type="button" onClick={() => setProductoDetalle(null)} aria-label="Cerrar detalles" className="ml-3 rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"><X className="h-4 w-4" /></button>
            </div>
            {productoDetalle.imagen && <img src={productoDetalle.imagen} alt={productoDetalle.producto_nombre} className="h-36 w-full shrink-0 border-b border-border bg-secondary/20 object-contain p-3" />}
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              {productoDetalle.producto_descripcion && <p className="text-sm text-muted-foreground">{productoDetalle.producto_descripcion}</p>}
              <section aria-label="Características generales">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Características generales</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Detail label="Categoría" value={productoDetalle.categoria} /><Detail label="Subcategoría" value={productoDetalle.subcategoria} />
                  <Detail label="Material" value={productoDetalle.material} /><Detail label="Micraje" value={productoDetalle.micraje == null ? null : `${productoDetalle.micraje} µm`} />
                  <Detail label="Capas" value={formatLabel(productoDetalle.capas)} /><Detail label="Impresión" value={productoDetalle.impresion ? formatLabel(productoDetalle.tipo_impresion) || "Sí" : "Sin impresión"} />
                </div>
              </section>
              {productoDetalle.especificacion_bolsa && <section aria-label="Especificaciones de bolsa">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Especificaciones de bolsa</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Detail label="Ancho doblado" value={productoDetalle.especificacion_bolsa.ancho_doblado} unit="cm" /><Detail label="Ancho desdoblado" value={productoDetalle.especificacion_bolsa.ancho_desdoblado} unit="cm" />
                  <Detail label="Largo doblado" value={productoDetalle.especificacion_bolsa.largo_doblado} unit="cm" /><Detail label="Largo desdoblado" value={productoDetalle.especificacion_bolsa.largo_desdoblado} unit="cm" />
                  <Detail label="Tipo de sello" value={formatLabel(productoDetalle.especificacion_bolsa.tipo_sello)} /><Detail label="Tipo de troquel" value={formatLabel(productoDetalle.especificacion_bolsa.tipo_troquel)} />
                  <Detail label="Fuelle" value={productoDetalle.especificacion_bolsa.fuelle ? [productoDetalle.especificacion_bolsa.fuelle_izquierdo, productoDetalle.especificacion_bolsa.fuelle_derecho, productoDetalle.especificacion_bolsa.fuelle_inferior, productoDetalle.especificacion_bolsa.fuelle_superior].filter(Boolean).join(" / ") || "Sí" : "No"} unit="cm" />
                  <Detail label="Pestaña" value={formatLabel(productoDetalle.especificacion_bolsa.pestana)} />
                  <Detail label="Acabado especial" value={productoDetalle.especificacion_bolsa.acabado_especial} />
                  <Detail label="Otras características" value={productoDetalle.especificacion_bolsa.otras_caracteristicas} />
                </div>
              </section>}
              {productoDetalle.especificacion_bobina && <section aria-label="Especificaciones de bobina">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Especificaciones de bobina</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Detail label="Ancho" value={productoDetalle.especificacion_bobina.ancho} unit="cm" /><Detail label="Diámetro" value={productoDetalle.especificacion_bobina.diametro} unit="cm" />
                  <Detail label="Diámetro núcleo" value={productoDetalle.especificacion_bobina.diametro_nucleo} unit="cm" /><Detail label="Tipo de núcleo" value={productoDetalle.especificacion_bobina.tipo_nucleo} />
                  <Detail label="Peso" value={productoDetalle.especificacion_bobina.peso} unit="kg" /><Detail label="Longitud" value={productoDetalle.especificacion_bobina.longitud} unit="m" />
                  <Detail label="Otras características" value={productoDetalle.especificacion_bobina.otras_caracteristicas} />
                </div>
              </section>}
            </div>
            <div className="flex shrink-0 gap-2 border-t border-border bg-card p-3">
              <button type="button" onClick={() => setProductoDetalle(null)} className="flex-1 rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary">Seguir explorando</button>
              <button type="button" disabled={versionesEnCarrito.includes(productoDetalle.version_id)} onClick={() => { onAddToCart?.(productoDetalle); setProductoDetalle(null); }} className="flex-1 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-default disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">{versionesEnCarrito.includes(productoDetalle.version_id) ? "Ya está en el carrito" : "Añadir al carrito"}</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, unit }: { label: string; value: string | number | boolean | null | undefined; unit?: string }) {
  if (value === null || value === undefined || value === "") return null;
  return <div className="rounded-lg border border-border/70 bg-secondary/20 p-2.5"><p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-0.5 break-words text-sm font-medium text-foreground">{String(value)}{unit ? ` ${unit}` : ""}</p></div>;
}
