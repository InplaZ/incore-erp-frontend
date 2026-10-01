import { useQuery, useMutation } from "@tanstack/react-query";

import { productosCategoriasApi, productosApi } from "./productos.api";

import type {
  BuscarSimilaresResponse,
} from "@/features/comercial/comercial.types";

// ============================================================
// QUERY KEYS
// ============================================================

export const productosQueryKeys = {
  all: ["productos"] as const,

  categorias: () =>
    [...productosQueryKeys.all, "categorias"] as const,

  catalogo: (params: {
    categoria?: string;
    q?: string;
    material?: string;
    micraje?: string | number;
    capas?: string;
    impresion?: boolean;
  }) =>
    [...productosQueryKeys.all, "catalogo", params] as const,

  producto: (id: number) =>
    [...productosQueryKeys.all, "producto", id] as const,

  version: (id: number) =>
    [...productosQueryKeys.all, "version", id] as const,
};

// ============================================================
// CATEGORÍAS
// ============================================================

export function useProductosCategorias() {
  return useQuery({
    queryKey: productosQueryKeys.categorias(),
    queryFn: productosCategoriasApi.list,
  });
}

// ============================================================
// PRODUCTOS DEL CATÁLOGO
// ============================================================

export function useBuscarProductosCatalogo(
  params: {
    categoria?: string;
    q?: string;
    material?: string;
    micraje?: string | number;
    capas?: string;
    impresion?: boolean;
  },
  enabled = true
) {
  return useQuery({
    queryKey: productosQueryKeys.catalogo(params),
    queryFn: () => productosApi.buscarCatalogo(params),
    enabled,
  });
}

// ============================================================
// PRODUCTO
// ============================================================

export function useProducto(id: number, enabled = true) {
  return useQuery({
    queryKey: productosQueryKeys.producto(id),
    queryFn: () => productosApi.get(id),
    enabled: enabled && !!id,
  });
}

// ============================================================
// VERSIÓN DE PRODUCTO
// ============================================================

export function useProductoVersion(id: number, enabled = true) {
  return useQuery({
    queryKey: productosQueryKeys.version(id),
    queryFn: () => productosApi.getVersion(id),
    enabled: enabled && !!id,
  });
}

// ============================================================
// PRODUCTOS SIMILARES
// ============================================================

export function useBuscarProductosSimilares() {
  return useMutation<BuscarSimilaresResponse, Error, {
    especificacion_producto_id?: number;
    especificacion_producto_solicitado_version_id?: number;
  }>({
    mutationFn: (data) =>
      productosApi.buscarSimilares(data),
  });
}