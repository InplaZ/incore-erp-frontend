import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productosCategoriasApi, productosApi, productosSubcategoriasApi } from "./productos.api";
import type { Producto, ProductoComercialCreate } from "./productos.types";
import type {
  BuscarSimilaresResponse,
  ProductoVersion,
} from "@/features/comercial/comercial.types";

// ============================================================
// QUERY KEYS
// ============================================================

export const productosQueryKeys = {
  all: ["productos"] as const,

  categorias: () =>
    [...productosQueryKeys.all, "categorias"] as const,

  catalogo: (params: {
    subcategoria?: number;  
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

  lista: () => [...productosQueryKeys.all, "lista"] as const,
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
    subcategoria?: number;
    q?: string;
    material?: string;
    micraje?: string | number;
    capas?: string;
    impresion?: boolean;
    pagina?: number;
    por_pagina?: number;
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
// LISTADO GENERAL DE PRODUCTOS
// ============================================================

export function useProductos() {
  return useQuery({
    queryKey: productosQueryKeys.lista(),
    queryFn: () => productosApi.list(),
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

export function useUpdateProductoVersion() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ProductoVersion>;
    }) => productosApi.updateVersion(id, data),
  });
}

export function useUpdateEspecificacionBolsa() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Record<string, unknown>;
    }) => productosApi.updateEspecificacionBolsa(id, data),
  });
}

export function useUpdateEspecificacionBobina() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Record<string, unknown>;
    }) => productosApi.updateEspecificacionBobina(id, data),
  });
}
export function useCreateProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Producto> | FormData) =>
      productosApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productosQueryKeys.all,
      });
    },
  });
}

export function useCreateProductoComercial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductoComercialCreate) => productosApi.createComercial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productosQueryKeys.all,
      });
    },
  });
}

export function useUpdateProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Producto> | FormData;
    }) => productosApi.update(id, data),

    onSuccess: (_producto, variables) => {
      queryClient.invalidateQueries({
        queryKey: productosQueryKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: productosQueryKeys.producto(variables.id),
      });
    },
  });
}

export function useProductosSubcategorias(categoria?: number) {
  return useQuery({
    queryKey: ["productos", "subcategorias", categoria],
    queryFn: () => productosSubcategoriasApi.list(categoria),
    enabled: Boolean(categoria),
  });
}
