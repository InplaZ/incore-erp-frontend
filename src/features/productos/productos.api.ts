import { api } from "@/api/api.config";

import type {
  PaginatedResponse,
  ProductoCategoria,
  Producto,
  ProductoVersion,
  BuscarCatalogoResponse,
  BuscarSimilaresResponse,
} from "@/features/comercial/comercial.types";

// ============================================================
// CATEGORÍAS DE PRODUCTOS
// ============================================================

export const productosCategoriasApi = {
  list: async (): Promise<ProductoCategoria[]> =>
    api.get("/productos/categorias/"),

  get: async (id: number): Promise<ProductoCategoria> =>
    api.get(`/productos/categorias/${id}/`),
};

// ============================================================
// PRODUCTOS DEL CATÁLOGO
// ============================================================

export const productosApi = {

  // ----------------------------------------------------------
  // Listar productos
  // GET /productos/productos/
  // ----------------------------------------------------------

  list: async (): Promise<PaginatedResponse<Producto>> =>
    api.get("/productos/productos/"),

  // ----------------------------------------------------------
  // Obtener producto
  // GET /productos/productos/{id}/
  // ----------------------------------------------------------

  get: async (id: number): Promise<Producto> =>
    api.get(`/productos/productos/${id}/`),

  // ----------------------------------------------------------
  // Obtener versión de producto
  // GET /productos/versiones/{id}/
  // ----------------------------------------------------------

  getVersion: async (id: number): Promise<ProductoVersion> =>
    api.get(`/productos/versiones/${id}/`),

  // ----------------------------------------------------------
  // Buscar productos del catálogo
  //
  // GET /productos/busqueda-productos/catalogo/
  //
  // Parámetros:
  // categoria
  // q
  // material
  // micraje
  // capas
  // impresion
  // ----------------------------------------------------------

  buscarCatalogo: async (params: {
    categoria?: string;
    q?: string;
    material?: string;
    micraje?: string | number;
    capas?: string;
    impresion?: boolean;
  }): Promise<BuscarCatalogoResponse> =>
    api.get(
      "/productos/busqueda-productos/catalogo/",
      {
        params,
      }
    ),

  // ----------------------------------------------------------
  // Buscar productos similares
  //
  // POST /productos/busqueda-productos/buscar_similares/
  //
  // Body:
  // {
  //   especificacion_producto_id?: number;
  //   especificacion_producto_solicitado_version_id?: number;
  // }
  // ----------------------------------------------------------

  buscarSimilares: async (data: {
    especificacion_producto_id?: number;
    especificacion_producto_solicitado_version_id?: number;
  }): Promise<BuscarSimilaresResponse> =>
    api.post(
      "/productos/busqueda-productos/buscar_similares/",
      data
    ),
};