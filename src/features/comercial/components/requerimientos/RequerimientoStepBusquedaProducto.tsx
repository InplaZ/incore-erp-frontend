import { ArrowRight, Check, Layers3, Package, Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import { useBuscarProductosCatalogo } from "@/features/productos/productos.hooks";
import type { ProductType } from "./RequerimientoStepProducto";
import type {
  MaterialProducto,
  ProductoBusquedaResultado,
  TipoCapa,
} from "@/features/comercial/comercial.types";

interface RequerimientoStepBusquedaProductoProps {
  product: ProductType;
  onProductSelect: (producto: ProductoBusquedaResultado) => void;
  onCreateNew: () => void;
}

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

function formatLabel(value: string | null | undefined) {
  if (!value) return "";
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

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
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Encabezado del catálogo */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Catálogo INCORE
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Encuentra el producto ideal
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Explora {tipoProductoLabel} existentes, revisa sus especificaciones y selecciona la versión que necesita tu cliente.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCreateNew}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-background px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
            >
              <Package className="h-4 w-4" />
              Crear producto nuevo
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {/* Búsqueda principal */}
          <label htmlFor="catalogo-producto-busqueda" className="mb-2 block text-sm font-semibold text-foreground">
            Buscar en el catálogo
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="catalogo-producto-busqueda"
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Escribe el nombre o código del producto..."
                className="w-full rounded-xl border border-border bg-background py-3.5 pl-12 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
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
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
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
            <div className="mt-5 rounded-xl border border-border bg-secondary/25 p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Refinar resultados</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Combina los criterios para encontrar una versión compatible.
                  </p>
                </div>
                {filtrosActivos && (
                  <button
                    type="button"
                    onClick={handleLimpiarFiltros}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
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

              {filtrosActivos && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {busqueda && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                      Búsqueda: {busqueda}
                      <button type="button" aria-label="Quitar búsqueda" onClick={() => setBusqueda("")}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {material && (
                    <button type="button" onClick={() => setMaterial("")} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground hover:border-primary/40">
                      {material}<X className="h-3 w-3" />
                    </button>
                  )}
                  {micraje && (
                    <button type="button" onClick={() => setMicraje("")} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground hover:border-primary/40">
                      {micraje} µm<X className="h-3 w-3" />
                    </button>
                  )}
                  {capas && (
                    <button type="button" onClick={() => setCapas("")} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground hover:border-primary/40">
                      {formatLabel(capas)}<X className="h-3 w-3" />
                    </button>
                  )}
                  {impresion !== "" && (
                    <button type="button" onClick={() => setImpresion("")} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground hover:border-primary/40">
                      {impresion ? "Con impresión" : "Sin impresión"}<X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Resultados */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Productos disponibles</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {catalogoLoading
                ? "Consultando el catálogo..."
                : `${cantidad} ${cantidad === 1 ? "producto encontrado" : "productos encontrados"}`}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="h-4 w-4 text-primary" />
            Se conserva la versión seleccionada
          </div>
        </div>

        {catalogoLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
                <div className="h-40 bg-secondary/70" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-2/3 rounded bg-secondary" />
                  <div className="h-3 w-1/2 rounded bg-secondary" />
                  <div className="h-8 rounded-lg bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        ) : catalogoError ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center">
            <Package className="mx-auto h-9 w-9 text-destructive" />
            <h4 className="mt-3 font-semibold text-foreground">No se pudo cargar el catálogo</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Verifica tu conexión e inténtalo nuevamente.
            </p>
          </div>
        ) : productos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="mt-4 font-semibold text-foreground">No encontramos productos</h4>
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {productos.map((producto) => (
              <article
                key={producto.version_id}
                className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="relative flex h-44 items-center justify-center overflow-hidden bg-secondary/35">
                  {producto.imagen ? (
                    <img
                      src={producto.imagen}
                      alt={producto.producto_nombre}
                      loading="lazy"
                      className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-background text-primary/70">
                      <Package className="h-10 w-10" strokeWidth={1.4} />
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full border border-border/70 bg-background/95 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground backdrop-blur">
                    {producto.subcategoria || producto.categoria || (product === "bag" ? "Bolsa" : "Bobina")}
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                    V{producto.version_numero}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="min-w-0">
                    <h4 className="line-clamp-2 min-h-10 text-base font-bold leading-5 text-foreground">
                      {producto.producto_nombre}
                    </h4>
                    <p className="mt-1 text-xs font-medium tracking-wide text-muted-foreground">
                      Código: {producto.producto_codigo}
                    </p>
                    {producto.producto_descripcion && (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {producto.producto_descripcion}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-secondary/50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Material</p>
                      <p className="mt-1 text-sm font-bold text-foreground">{producto.material || "—"}</p>
                    </div>
                    <div className="rounded-xl bg-secondary/50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Micraje</p>
                      <p className="mt-1 text-sm font-bold text-foreground">
                        {producto.micraje ? `${producto.micraje} µm` : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {producto.capas && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        <Layers3 className="h-3 w-3" />
                        {formatLabel(producto.capas)}
                      </span>
                    )}
                    <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      {producto.impresion ? "Con impresión" : "Sin impresión"}
                    </span>
                    {product === "bag" && producto.especificacion_bolsa?.tipo_troquel && (
                      <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        {formatLabel(producto.especificacion_bolsa.tipo_troquel)}
                      </span>
                    )}
                    {product === "roll" && producto.especificacion_bobina?.ancho && (
                      <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        Ancho {producto.especificacion_bobina.ancho} cm
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-5">
                    <button
                      type="button"
                      onClick={() => onProductSelect(producto)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      Ver y seleccionar
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
