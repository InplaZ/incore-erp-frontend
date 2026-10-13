import { useState } from "react";
import {
  Search,
  Package,
  LayoutGrid,
  List,
  ImageOff,
} from "lucide-react";

import { useBuscarProductosCatalogo } from "@/features/productos/productos.hooks";
import { Card, CardBody } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { LoadingState, EmptyState } from "@/components/ui/States";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/utils";

export default function ProductosPage() {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [material, setMaterial] = useState("");
  const [view, setView] = useState<"cards" | "tabla">("cards");
  const [pagina, setPagina] = useState(1);
  const porPagina = 12; //Cantidad de productos por pagina

  const {
    data,
    isLoading,
    isError,
    isFetching,
  } = useBuscarProductosCatalogo({
    q: search.trim() || undefined,
    categoria: categoria || undefined,
    material: material || undefined,
    pagina,
    por_pagina: porPagina,
  });

  const productos = data?.productos ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Catálogo de productos"
        subtitle={`${data?.cantidad ?? 0} productos encontrados`}
        breadcrumb={[{ label: "Productos" }]}
      />

      {/* Búsqueda y filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
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

        <select
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value);
            setPagina(1);
          }}
          className="input w-auto"
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
          className="input w-auto"
        >
          <option value="">Todos los materiales</option>
          <option value="PEBD">PEBD</option>
          <option value="PEAD">PEAD</option>
          <option value="PP">PP</option>
          <option value="BOPP">BOPP</option>
          <option value="OTRO">Otro</option>
        </select>

        <div className="ml-auto flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
          <button
            type="button"
            title="Vista de tarjetas"
            onClick={() => setView("cards")}
            className={cn(
              "rounded-md p-2 transition",
              view === "cards"
                ? "bg-inplaz-100 text-inplaz-700"
                : "text-slate-400 hover:text-slate-700"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>

          <button
            type="button"
            title="Vista de tabla"
            onClick={() => setView("tabla")}
            className={cn(
              "rounded-md p-2 transition",
              view === "tabla"
                ? "bg-inplaz-100 text-inplaz-700"
                : "text-slate-400 hover:text-slate-700"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Cargando catálogo de productos..." />
      ) : isError ? (
        <Card>
          <CardBody>
            <p className="text-sm text-red-600">
              No se pudo cargar el catálogo. Comprueba la conexión con el
              servidor e inténtalo nuevamente.
            </p>
          </CardBody>
        </Card>
      ) : productos.length === 0 ? (
        <Card>
          <EmptyState
            title="No se encontraron productos"
            icon={<Package className="h-6 w-6" />}
          />
        </Card>
      ) : view === "cards" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {productos.map((p) => (
            <Card key={`${p.producto_id}-${p.version_id}`} hover>
              <CardBody>
                <div className="mb-3 flex h-44 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                  {p.imagen ? (
                    <img
                      src={p.imagen}
                      alt={p.producto_nombre}
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
                      {p.producto_codigo}
                    </p>
                    <h3 className="mt-1 font-medium text-slate-700">
                      {p.producto_nombre}
                    </h3>
                  </div>

                  <Badge>
                    v{p.version_numero}
                  </Badge>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge>{p.categoria ?? "Sin categoría"}</Badge>
                  {p.subcategoria && <Badge>{p.subcategoria}</Badge>}
                </div>

                <div className="space-y-1 border-t border-slate-100 pt-3 text-sm">
                  <p className="text-slate-500">
                    Material:{" "}
                    <span className="font-medium text-slate-700">
                      {p.material || "No especificado"}
                    </span>
                  </p>

                  <p className="text-slate-500">
                    Micraje:{" "}
                    <span className="font-medium text-slate-700">
                      {p.micraje != null ? `${p.micraje} µm` : "No especificado"}
                    </span>
                  </p>

                  <p className="text-slate-500">
                    Capas:{" "}
                    <span className="font-medium text-slate-700">
                      {p.capas || "No especificadas"}
                    </span>
                  </p>

                  <p className="text-slate-500">
                    Impresión:{" "}
                    <span className="font-medium text-slate-700">
                      {p.impresion ? "Sí" : "No"}
                    </span>
                  </p>
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
                  <th className="px-4 py-3">Material</th>
                  <th className="px-4 py-3">Micraje</th>
                  <th className="px-4 py-3">Capas</th>
                  <th className="px-4 py-3">Impresión</th>
                  <th className="px-4 py-3">Versión</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {productos.map((p) => (
                  <tr
                    key={`${p.producto_id}-${p.version_id}`}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">
                        {p.producto_codigo}
                      </p>
                      <p className="text-slate-500">
                        {p.producto_nombre}
                      </p>
                    </td>
                    <td className="px-4 py-3">{p.categoria ?? "—"}</td>
                    <td className="px-4 py-3">{p.subcategoria ?? "—"}</td>
                    <td className="px-4 py-3">{p.material || "—"}</td>
                    <td className="px-4 py-3">
                      {p.micraje != null ? `${p.micraje} µm` : "—"}
                    </td>
                    <td className="px-4 py-3">{p.capas || "—"}</td>
                    <td className="px-4 py-3">
                      {p.impresion ? "Sí" : "No"}
                    </td>
                    <td className="px-4 py-3">v{p.version_numero}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {data && data.total_paginas > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Mostrando{" "}
            {Math.min((pagina - 1) * porPagina + 1, data.cantidad)}
            {"–"}
            {Math.min(pagina * porPagina, data.cantidad)}
            {" de "}
            {data.cantidad} productos
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
              Página {pagina} de {data.total_paginas}
            </span>

            <button
              type="button"
              onClick={() =>
                setPagina((p) => Math.min(data.total_paginas, p + 1))
              }
              disabled={pagina >= data.total_paginas || isFetching}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
