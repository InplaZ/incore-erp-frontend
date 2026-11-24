
import { api } from "@/api/api.config";

import type {
  ProductoVersion,
  BuscarCatalogoResponse,
  BuscarSimilaresResponse,
} from "@/features/comercial/comercial.types";

import type { ApiQueryParams } from "@/api/api.types";

import type {
  Producto,
  ProductoCategoria,
  ProductoSubcategoria,
  ProductoComercialCreate,
  ProductoComercialDetalle,
} from "./productos.types";

// ============================================================
// PARÁMETROS DE BÚSQUEDA DEL CATÁLOGO
// ============================================================

export interface BuscarCatalogoParams extends ApiQueryParams {
  // Filtros generales
  categoria?: string;
  subcategoria?: number;
  q?: string;
  material?: string;
  micraje?: string | number;
  capas?: string;
  impresion?: boolean;

  // Filtros específicos para bolsas
  ancho_bolsa_min?: string | number;
  ancho_bolsa_max?: string | number;
  largo_bolsa_min?: string | number;
  largo_bolsa_max?: string | number;
  tipo_troquel?: string;
  tipo_sello?: string;
  fuelle?: boolean;
  pestana?: string;

  // Filtros específicos para bobinas
  ancho_bobina_min?: string | number;
  ancho_bobina_max?: string | number;
  largo_bobina_min?: string | number;
  largo_bobina_max?: string | number;
  diametro_min?: string | number;
  diametro_max?: string | number;
  diametro_nucleo_min?: string | number;
  diametro_nucleo_max?: string | number;
  tipo_nucleo?: string;
  configuracion_pelicula?: string;
  peso_min?: string | number;
  peso_max?: string | number;
  longitud_min?: string | number;
  longitud_max?: string | number;

  // Paginación
  pagina?: number;
  por_pagina?: number;
}

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
  list: async (): Promise<Producto[]> =>
    api.get("/productos/productos/"),

  get: async (id: number): Promise<ProductoComercialDetalle> =>
    api.get(`/productos/productos/${id}/`),

  create: async (data: Partial<Producto> | FormData): Promise<Producto> =>
    api.post("/productos/productos/", data),

  createComercial: async (data: ProductoComercialCreate): Promise<ProductoComercialDetalle> =>
    api.post("/productos/productos/crear-comercial/", data),

  updateComercial: async (id: number, data: ProductoComercialCreate): Promise<ProductoComercialDetalle> =>
    api.patch(`/productos/productos/${id}/editar-comercial/`, data),

  update: async (id: number, data: Partial<Producto> | FormData): Promise<Producto> =>
    api.patch(`/productos/productos/${id}/`, data),

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

  buscarCatalogo: async (
    params: BuscarCatalogoParams
  ): Promise<BuscarCatalogoResponse> =>
    api.get("/productos/busqueda-productos/catalogo/", { params }),

  buscarSimilares: async (data: {
    especificacion_producto_id?: number;
    especificacion_producto_solicitado_version_id?: number;
  }): Promise<BuscarSimilaresResponse> =>
    api.post("/productos/busqueda-productos/buscar_similares/", data),
};

// ============================================================
// SUBCATEGORÍAS DE PRODUCTOS
// ============================================================

export const productosSubcategoriasApi = {
  list: async (categoria?: number): Promise<ProductoSubcategoria[]> =>
    api.get<ProductoSubcategoria[]>("/productos/subcategorias/", {
      params: categoria ? { categoria, activo: true } : {},
    }),
};
