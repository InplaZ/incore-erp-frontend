
import { useMemo, useState } from "react";
import {
  Search,
  Package,
  LayoutGrid,
  List,
  ImageOff,
  Plus,
} from "lucide-react";

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
import NuevoProductoModal from "./NuevoProductoModal";

export default function ProductosPage() {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [material, setMaterial] = useState("");
  const [view, setView] = useState<"cards" | "tabla">("cards");
  const [pagina, setPagina] = useState(1);
  const porPagina = 12;

  const [modalAbierto, setModalAbierto] = useState(false);

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
    isLoading: cargandoCatalogo,
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

  const productosRegistrados = dataProductos ?? [];
  const productosCatalogo = dataCatalogo?.productos ?? [];

  // Índice de las características del catálogo por ID de producto.
  const catalogoPorProducto = useMemo(() => {
    return new Map(
      productosCatalogo.map((producto) => [
        producto.producto_id,
        producto,
      ])
    );
  }, [productosCatalogo]);

  const nombreCategoria = (categoriaId: number | null | undefined) => {
    if (categoriaId == null) return "Sin categoría";

    const encontrada = categorias?.find(
      (item) => item.id === categoriaId
    );

    return encontrada?.nombre ?? "Sin categoría";
  };

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
          coincideBusqueda &&
          coincideCategoria &&
          coincideMaterial
        );
      });
  }, [
    productosRegistrados,
    catalogoPorProducto,
    search,
    categoria,
    material,
    categorias,
  ]);

  // Paginación local sobre los productos registrados recibidos.
  const cantidad = productosCombinados.length;
  const totalPaginas = Math.ceil(cantidad / porPagina);

  const productosPagina = productosCombinados.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

  const isLoading = cargandoProductos || !categorias;
  const isError = errorProductos;
  const isFetching = actualizandoProductos || actualizandoCatalogo;

  const limpiarFiltros = () => {
    setSearch("");
    setCategoria("");
    setMaterial("");
    setPagina(1);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Productos"
        subtitle={`${cantidad} productos encontrados`}
        breadcrumb={[{ label: "Productos" }]}
      />

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
            onClick={() => setModalAbierto(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
              <option value="Bolsas">Bolsas</option>
              <option value="Bobinas">Bobinas</option>
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

          {(search || categoria || material) && (
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
            <Card key={p.id} hover>
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

                  {version && <Badge>v{version.version_numero}</Badge>}
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge>{nombreCategoria(p.categoria)}</Badge>
                  <Badge>{p.unidad_medida}</Badge>
                  <Badge>{p.estado}</Badge>
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
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Subcategoría</th>
                  <th className="px-4 py-3">Unidad</th>
                  <th className="px-4 py-3">Material</th>
                  <th className="px-4 py-3">Micraje</th>
                  <th className="px-4 py-3">Capas</th>
                  <th className="px-4 py-3">Impresión</th>
                  <th className="px-4 py-3">Versión</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {productosPagina.map(({ producto: p, version }) => (
                  <tr
                    key={p.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">
                        {p.codigo}
                      </p>
                      <p className="text-slate-500">{p.nombre}</p>
                    </td>

                    <td className="px-4 py-3">
                      {nombreCategoria(p.categoria)}
                    </td>

                    <td className="px-4 py-3">
                      {version?.subcategoria ??
                        (p.subcategoria != null
                          ? `ID ${p.subcategoria}`
                          : "—")}
                    </td>

                    <td className="px-4 py-3">{p.unidad_medida}</td>
                    <td className="px-4 py-3">{version?.material || "—"}</td>

                    <td className="px-4 py-3">
                      {version?.micraje != null
                        ? `${version.micraje} µm`
                        : "—"}
                    </td>

                    <td className="px-4 py-3">{version?.capas || "—"}</td>

                    <td className="px-4 py-3">
                      {version
                        ? version.impresion
                          ? "Sí"
                          : "No"
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      {version ? `v${version.version_numero}` : "—"}
                    </td>

                    <td className="px-4 py-3">{p.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

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

      <NuevoProductoModal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSuccess={() => {
          setModalAbierto(false);
          void recargarProductos();
        }}
      />
    </div>
  );
}
