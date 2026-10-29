
import { useCallback, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  Search,
  Pencil,
  Package,
  LayoutGrid,
  List,
  ImageOff,
  Plus,
  X,
} from "lucide-react";
import FichaTecnicaPDF from "./FichaTecnicaPDF";

import {
  useBuscarProductosCatalogo,
  useProductos,
  useProductosCategorias,
} from "@/features/productos/productos.hooks";

import { Card, CardBody } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { LoadingState, EmptyState } from "@/components/ui/States";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/utils";
import type { ProductoBusquedaResultado } from "@/features/comercial/comercial.types";
import NuevoProductoModal from "./NuevoProductoModal";
import ProductoComercialWizardModal from "./ProductoComercialWizardModal";
import type { Producto } from "./productos.types";

export default function ProductosPage() {
  const [catalogo, setCatalogo] = useState<"todos" | "comerciales" | "homologados">("todos");
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [material, setMaterial] = useState("");
  const [view, setView] = useState<"cards" | "tabla">("tabla");
  const [pagina, setPagina] = useState(1);
  const porPagina = 12;

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [productoConsultado, setProductoConsultado] = useState<Producto | null>(null);

  //Estado del pdf
  const [productoPDF, setProductoPDF] = useState<Producto | null>(null);

  // Listado general: base de todos los productos registrados.
  const {
    data: dataProductos,
    isLoading: cargandoProductos,
    isError: errorProductos,
    isFetching: actualizandoProductos,
    refetch: recargarProductos,
  } = useProductos();

  // Catálogo: aporta las características de las versiones disponibles.
  const {
    data: dataCatalogo,
    isError: errorCatalogo,
    isFetching: actualizandoCatalogo,
  } = useBuscarProductosCatalogo({
    q: search.trim() || undefined,
    categoria: categoria || undefined,
    material: material || undefined,
    pagina: 1,
    por_pagina: 100,
  });

  // Categorías: permite mostrar el nombre y no solamente su ID.
  const { data: categorias } = useProductosCategorias();

  const productosRegistrados = useMemo(() => dataProductos ?? [], [dataProductos]);
  const productosCatalogo = useMemo(() => dataCatalogo?.productos ?? [], [dataCatalogo?.productos]);

  // Índice de las características del catálogo por ID de producto.
  const catalogoPorProducto = useMemo(() => {
    return new Map(
      productosCatalogo.map((producto) => [
        producto.producto_id,
        producto,
      ])
    );
  }, [productosCatalogo]);

  const nombreCategoria = useCallback((categoriaId: number | null | undefined) => {
    if (categoriaId == null) return "Sin categoría";

    const encontrada = categorias?.find(
      (item) => item.id === categoriaId
    );

    return encontrada?.nombre ?? "Sin categoría";
  }, [categorias]);

  // Combina los productos registrados con las características del catálogo.
  // La lista general es la base, por lo que un producto sin versión
  // disponible en el catálogo también puede mostrarse.
  const productosCombinados = useMemo(() => {
    const termino = search.trim().toLocaleLowerCase();

    return productosRegistrados
      .map((producto) => ({
        producto,
        version: catalogoPorProducto.get(producto.id),
      }))
      .filter(({ producto, version }) => {
        const coincideCatalogo = catalogo === "todos"
          || (catalogo === "homologados" && producto.estado_homologacion === "homologado")
          || (catalogo === "comerciales" && producto.estado_homologacion !== "homologado");
        const coincideBusqueda =
          !termino ||
          producto.codigo.toLocaleLowerCase().includes(termino) ||
          producto.nombre.toLocaleLowerCase().includes(termino);

        const coincideCategoria =
          !categoria ||
          nombreCategoria(producto.categoria).toLocaleLowerCase() ===
          categoria.toLocaleLowerCase();

        // Si se selecciona un material, el producto debe tener
        // una versión del catálogo que coincida con ese material.
        const coincideMaterial =
          !material ||
          version?.material?.toLocaleUpperCase() ===
          material.toLocaleUpperCase();

        return (
          coincideCatalogo &&
          coincideBusqueda &&
          coincideCategoria &&
          coincideMaterial
        );
      });
  }, [
    productosRegistrados,
    catalogo,
    catalogoPorProducto,
    nombreCategoria,
    search,
    categoria,
    material,
  ]);

  // Paginación local sobre los productos registrados recibidos.
  const cantidad = productosCombinados.length;
  const totalPaginas = Math.ceil(cantidad / porPagina);

  const productosPagina = productosCombinados.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

  const productosHomologados = productosRegistrados.filter(p => p.estado_homologacion === "homologado");
  const productosComerciales = productosRegistrados.filter(p => p.estado_homologacion !== "homologado");
  const totalActivosHomologados = productosHomologados.filter(p => p.estado).length;
  const totalActivosComerciales = productosComerciales.filter(p => p.estado).length;

  const isLoading = cargandoProductos || !categorias;
  const isError = errorProductos;
  const isFetching = actualizandoProductos || actualizandoCatalogo;

  const limpiarFiltros = () => {
    setCatalogo("todos");
    setSearch("");
    setCategoria("");
    setMaterial("");
    setPagina(1);
  };

  const abrirEdicion = (producto: Producto) => {
    setProductoEditando(producto);
    setModalAbierto(true);
  };

  const abrirNuevo = () => {
    setProductoEditando(null);
    setModalAbierto(true);
  };

  const cerrarModalProducto = () => {
    setModalAbierto(false);
    setProductoEditando(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Productos"
        subtitle={`${cantidad} productos encontrados`}
        breadcrumb={[{ label: "Productos" }]}
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryCard label="Productos comerciales" value={productosComerciales.length} detail="Pendientes o rechazados" tone="warning" />
        <SummaryCard label="Productos homologados" value={productosHomologados.length} detail="Catálogo oficial" tone="success" />
        <SummaryCard label="Comerciales activos" value={totalActivosComerciales} detail="Disponibles en catálogo" tone="primary" />
        <SummaryCard label="Homologados activos" value={totalActivosHomologados} detail="Disponibles en catálogo" tone="primary" />
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-border pb-2" role="tablist" aria-label="Tipo de producto">
        {([["todos", "Todos"], ["comerciales", "Productos comerciales"], ["homologados", "Homologados"]] as const).map(([value, label]) => (
          <button key={value} type="button" role="tab" aria-selected={catalogo === value}
            onClick={() => { setCatalogo(value); setPagina(1); }}
            className={cn("shrink-0 rounded-lg px-3.5 py-2 text-sm font-semibold transition", catalogo === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
            {label}{value === "comerciales" ? ` · ${productosComerciales.length}` : value === "homologados" ? ` · ${productosHomologados.length}` : ` · ${productosRegistrados.length}`}
          </button>
        ))}
      </div>

      {/* Búsqueda y acciones */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por código o nombre..."
              className="pl-9"
            />
          </div>

          <button
            type="button"
            onClick={abrirNuevo}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Nuevo producto
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <select
              value={categoria}
              onChange={(e) => {
                setCategoria(e.target.value);
                setPagina(1);
              }}
              className="input w-full sm:max-w-[220px]"
            >
              <option value="">Todas las categorías</option>
              {categorias?.filter(item => item.activo).map(item => <option key={item.id} value={item.nombre}>{item.nombre}</option>)}
            </select>

            <select
              value={material}
              onChange={(e) => {
                setMaterial(e.target.value);
                setPagina(1);
              }}
              className="input w-full sm:max-w-[200px]"
            >
              <option value="">Todos los materiales</option>
              <option value="PEBD">PEBD</option>
              <option value="PEAD">PEAD</option>
              <option value="PP">PP</option>
              <option value="BOPP">BOPP</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          {(search || categoria || material || catalogo !== "todos") && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="text-sm text-slate-500 underline hover:text-slate-800"
            >
              Limpiar filtros
            </button>
          )}

          {/* Selector de presentación */}
          <div className="flex shrink-0 items-center self-end rounded-lg border border-slate-200 bg-white p-1 sm:self-auto">
            <button
              type="button"
              title="Vista de tarjetas"
              aria-label="Vista de tarjetas"
              aria-pressed={view === "cards"}
              onClick={() => setView("cards")}
              className={cn(
                "rounded-md p-2 transition",
                view === "cards"
                  ? "bg-inplaz-100 text-inplaz-700"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>

            <button
              type="button"
              title="Vista de tabla"
              aria-label="Vista de tabla"
              aria-pressed={view === "tabla"}
              onClick={() => setView("tabla")}
              className={cn(
                "rounded-md p-2 transition",
                view === "tabla"
                  ? "bg-inplaz-100 text-inplaz-700"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Carga y errores */}
      {isLoading ? (
        <LoadingState message="Cargando productos..." />
      ) : isError ? (
        <Card>
          <CardBody>
            <p className="text-sm text-red-600">
              No se pudieron cargar los productos. Comprueba la conexión
              con el servidor e inténtalo nuevamente.
            </p>
            <button
              type="button"
              onClick={() => void recargarProductos()}
              className="mt-3 text-sm font-medium text-blue-600 underline"
            >
              Reintentar
            </button>
          </CardBody>
        </Card>
      ) : productosPagina.length === 0 ? (
        <Card>
          <EmptyState
            title="No se encontraron productos"
            icon={<Package className="h-6 w-6" />}
          />
        </Card>
      ) : view === "cards" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {productosPagina.map(({ producto: p, version }) => (
            <Card key={p.id} className="transition-shadow hover:shadow-md">
              <CardBody>
                <div className="mb-3 flex h-44 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                  {p.imagen ? (
                    <img
                      src={p.imagen}
                      alt={p.nombre}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <ImageOff className="h-8 w-8" />
                      <span className="text-xs">Sin imagen</span>
                    </div>
                  )}
                </div>

                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {p.codigo}
                    </p>
                    <h3 className="mt-1 font-medium text-slate-700">
                      {p.nombre}
                    </h3>
                  </div>

                  <Badge variant={homologacionVariant(p.estado_homologacion)}>{homologacionLabel(p.estado_homologacion)}</Badge>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge variant="outline">{nombreCategoria(p.categoria)}</Badge>
                  <Badge variant="secondary">{p.unidad_medida}</Badge>
                  <Badge variant={p.estado ? "success" : "destructive"}>{p.estado ? "Activo" : "Inactivo"}</Badge>
                  {version && <Badge variant="info">v{version.version_numero}</Badge>}
                </div>

                <div className="space-y-1 border-t border-slate-100 pt-3 text-sm">
                  <p className="text-slate-500">
                    Subcategoría:{" "}
                    <span className="font-medium text-slate-700">
                      {version?.subcategoria ??
                        (p.subcategoria != null
                          ? `ID ${p.subcategoria}`
                          : "No especificada")}
                    </span>
                  </p>

                  <p className="text-slate-500">
                    Material:{" "}
                    <span className="font-medium text-slate-700">
                      {version?.material || "No especificado"}
                    </span>
                  </p>

                  <p className="text-slate-500">
                    Micraje:{" "}
                    <span className="font-medium text-slate-700">
                      {version?.micraje != null
                        ? `${version.micraje} µm`
                        : "No especificado"}
                    </span>
                  </p>

                  <p className="text-slate-500">
                    Capas:{" "}
                    <span className="font-medium text-slate-700">
                      {version?.capas || "No especificadas"}
                    </span>
                  </p>

                  <p className="text-slate-500">
                    Impresión:{" "}
                    <span className="font-medium text-slate-700">
                      {version
                        ? version.impresion
                          ? "Sí"
                          : "No"
                        : "No especificado"}
                    </span>
                  </p>

                  {p.descripcion && (
                    <p className="pt-1 text-slate-500">
                      {p.descripcion}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex justify-end gap-2 border-t border-border pt-3">
                  <button type="button" onClick={() => setProductoConsultado(p)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary"><Eye className="h-3.5 w-3.5" />Consultar</button>
                  {p.estado_homologacion !== "homologado" && <button type="button" onClick={() => abrirEdicion(p)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"><Pencil className="h-3.5 w-3.5" />Editar</button>}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-[10px] uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3">Código</th>
                  <th className="px-3 py-3">Descripción</th>
                  <th className="px-3 py-3">Tipo / medidas</th>
                  <th className="px-3 py-3">Unidad única</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-3 py-3">Mercado</th>
                  <th className="px-3 py-3 text-right">Acción</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {productosPagina.map(({ producto: p, version }) => {
                  const bolsa = version?.especificacion_bolsa;
                  const bobina = version?.especificacion_bobina;

                  const medidas = bolsa
                    ? `Bolsa · ${bolsa.ancho_doblado} cm × ${bolsa.largo_doblado} cm × ${version?.micraje ?? "—"} µm`
                    : bobina
                      ? `Rollo · ${bobina.ancho} cm${bobina.longitud ? ` × ${bobina.longitud} metros` : ""} × ${version?.micraje ?? "—"} µm`
                      : `${nombreCategoria(p.categoria)} · ${version?.micraje != null ? `${version.micraje} µm` : "Medidas no registradas"}`;

                  return (
                    <tr
                      key={p.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-3 py-4 font-mono text-xs text-slate-700">
                        {p.codigo}
                      </td>

                      <td className="min-w-[190px] px-3 py-4">
                        <p className="font-semibold text-slate-800">
                          {p.nombre}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {version?.material || p.descripcion || "Sin material especificado"}
                        </p>
                      </td>

                      <td className="min-w-[210px] px-3 py-4 text-xs text-slate-600">
                        {medidas}
                      </td>

                      <td className="px-3 py-4">
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                          {p.unidad_medida}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <Badge variant={p.estado ? "success" : "destructive"}>
                          {p.estado ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>

                      <td className="px-3 py-4 text-xs text-slate-600">
                        <span className="text-slate-400">No definido</span>
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductoPDF(p);
                              // Aquí se conectará la acción que abre la ficha PDF.
                            }}
                            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Ficha PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

      )}

      {errorCatalogo && !isLoading && <p role="status" className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground">No se pudieron cargar las especificaciones de versión. Los datos generales de productos siguen disponibles.</p>}

      {/* Paginación local de los productos recibidos */}
      {cantidad > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Mostrando {Math.min((pagina - 1) * porPagina + 1, cantidad)}
            {"–"}
            {Math.min(pagina * porPagina, cantidad)}
            {" de "}
            {cantidad} productos
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1 || isFetching}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>

            <span className="px-2 text-sm text-slate-600">
              Página {pagina} de {Math.max(1, totalPaginas)}
            </span>

            <button
              type="button"
              onClick={() =>
                setPagina((p) => Math.min(totalPaginas, p + 1))
              }
              disabled={pagina >= totalPaginas || isFetching}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {modalAbierto && (productoEditando ? <NuevoProductoModal
        open={modalAbierto}
        onClose={cerrarModalProducto}
        producto={productoEditando}
        onSuccess={() => {
          cerrarModalProducto();
          void recargarProductos();
        }}
      /> : <ProductoComercialWizardModal
        open={modalAbierto}
        onClose={cerrarModalProducto}
        onSuccess={() => {
          cerrarModalProducto();
          void recargarProductos();
        }}
      />)}
      {productoPDF && (
        <FichaTecnicaPDF
          producto={productoPDF}
          categoria={nombreCategoria(productoPDF.categoria)}
          version={catalogoPorProducto.get(productoPDF.id)}
          onClose={() => setProductoPDF(null)}
        />
      )}

      {productoConsultado && <ProductoDetalleDialog producto={productoConsultado} categoria={nombreCategoria(productoConsultado.categoria)} version={catalogoPorProducto.get(productoConsultado.id)} onClose={() => setProductoConsultado(null)} />}
    </div>
  );
}

function homologacionLabel(estado: Producto["estado_homologacion"]): string {
  if (estado === "homologado") return "Homologado";
  if (estado === "rechazado") return "Rechazado";
  return "No homologado";
}

function homologacionVariant(estado: Producto["estado_homologacion"]): "success" | "warning" | "destructive" {
  if (estado === "homologado") return "success";
  if (estado === "rechazado") return "destructive";
  return "warning";
}

function SummaryCard({ label, value, detail, tone }: { label: string; value: number; detail: string; tone: "warning" | "success" | "primary" }) {
  const iconClass = tone === "success" ? "bg-success/10 text-success" : tone === "warning" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary";
  return <Card><CardBody className="flex items-center gap-3 p-4 sm:p-5"><span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", iconClass)}>{tone === "success" ? <CheckCircle2 className="h-5 w-5" /> : <Package className="h-5 w-5" />}</span><div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-0.5 text-2xl font-bold leading-none text-foreground">{value}</p><p className="mt-1 truncate text-[11px] text-muted-foreground">{detail}</p></div></CardBody></Card>;
}

function ProductoDetalleDialog({ producto, categoria, version, onClose }: { producto: Producto; categoria: string; version?: ProductoBusquedaResultado; onClose: () => void }) {
  const bag = version?.especificacion_bolsa;
  const roll = version?.especificacion_bobina;
  const itemClass = "rounded-lg border border-border bg-background px-3 py-3";
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="producto-detalle-title" className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
      <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6"><div><p className="font-mono text-xs font-semibold text-primary">{producto.codigo}</p><h2 id="producto-detalle-title" className="mt-1 text-lg font-bold text-foreground">{producto.nombre}</h2><div className="mt-2 flex flex-wrap gap-2"><Badge variant={homologacionVariant(producto.estado_homologacion)}>{homologacionLabel(producto.estado_homologacion)}</Badge><Badge variant={producto.estado ? "success" : "destructive"}>{producto.estado ? "Activo" : "Inactivo"}</Badge></div></div><button type="button" aria-label="Cerrar ficha" onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><X className="h-5 w-5" /></button></header>
      <div className="overflow-y-auto p-5 sm:p-6"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <DetailItem label="Categoría" value={categoria} className={itemClass} /><DetailItem label="Subcategoría" value={version?.subcategoria ?? "Sin subcategoría"} className={itemClass} /><DetailItem label="Unidad de medida" value={producto.unidad_medida} className={itemClass} />
        <DetailItem label="Material" value={version?.material ?? "No especificado"} className={itemClass} /><DetailItem label="Micraje" value={version?.micraje != null ? `${version.micraje} µm` : "No especificado"} className={itemClass} /><DetailItem label="Capas" value={version?.capas ?? "No especificadas"} className={itemClass} />
        <DetailItem label="Impresión" value={version ? version.impresion ? "Sí" : "No" : "No especificado"} className={itemClass} /><DetailItem label="Versión" value={version ? `v${version.version_numero}` : "Sin versión técnica"} className={itemClass} /><DetailItem label="N.º homologación" value={producto.numero_homologacion || "Sin asignar"} className={itemClass} />
      </div>
        {producto.descripcion && <p className="mt-4 rounded-lg bg-secondary/50 p-3 text-sm text-foreground">{producto.descripcion}</p>}
        {bag && <section className="mt-5"><h3 className="mb-2 text-sm font-semibold text-foreground">Especificación de bolsa</h3><div className="grid gap-3 sm:grid-cols-2"><DetailItem label="Ancho doblado" value={`${bag.ancho_doblado} cm`} className={itemClass} /><DetailItem label="Ancho desdoblado" value={bag.ancho_desdoblado ? `${bag.ancho_desdoblado} cm` : "—"} className={itemClass} /><DetailItem label="Largo doblado" value={`${bag.largo_doblado} cm`} className={itemClass} /><DetailItem label="Sello / troquel" value={[bag.tipo_sello, bag.tipo_troquel].filter(Boolean).join(" · ") || "—"} className={itemClass} /></div></section>}
        {roll && <section className="mt-5"><h3 className="mb-2 text-sm font-semibold text-foreground">Especificación de bobina</h3><div className="grid gap-3 sm:grid-cols-2"><DetailItem label="Ancho" value={`${roll.ancho} cm`} className={itemClass} /><DetailItem label="Longitud" value={roll.longitud ? `${roll.longitud} m` : "—"} className={itemClass} /><DetailItem label="Diámetro" value={roll.diametro ? `${roll.diametro} cm` : "—"} className={itemClass} /><DetailItem label="Núcleo" value={roll.tipo_nucleo || "—"} className={itemClass} /></div></section>}
      </div><footer className="flex justify-end border-t border-border px-5 py-4 sm:px-6"><button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary">Cerrar</button></footer>
    </section>
  </div>;
}

function DetailItem({ label, value, className }: { label: string; value: string; className: string }) {
  return <div className={className}><p className="text-[11px] font-medium text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold text-foreground">{value}</p></div>;
}
