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
  list: async (): Promise<PaginatedResponse<Producto>> =>
    api.get("/productos/productos/"),

  get: async (id: number): Promise<Producto> =>
    api.get(`/productos/productos/${id}/`),

  getVersion: async (id: number): Promise<ProductoVersion> =>
    api.get(`/productos/versiones/${id}/`),

  updateVersion: async (
    id: number,
    data: Partial<ProductoVersion>
  ): Promise<ProductoVersion> =>
    api.patch(`/productos/versiones/${id}/`, data),

  updateEspecificacionBolsa: async (
    id: number,
    data: Record<string, unknown>
  ) =>
    api.patch(`/productos/especificaciones-bolsa/${id}/`, data),

  updateEspecificacionBobina: async (
    id: number,
    data: Record<string, unknown>
  ) =>
    api.patch(`/productos/especificaciones-bobina/${id}/`, data),

  buscarCatalogo: async (params: {
    categoria?: string;
    q?: string;
    material?: string;
    micraje?: string | number;
    capas?: string;
    impresion?: boolean;
  }): Promise<BuscarCatalogoResponse> =>
    api.get("/productos/busqueda-productos/catalogo/", { params }),

  buscarSimilares: async (data: {
    especificacion_producto_id?: number;
    especificacion_producto_solicitado_version_id?: number;
  }): Promise<BuscarSimilaresResponse> =>
    api.post("/productos/busqueda-productos/buscar_similares/", data),
};