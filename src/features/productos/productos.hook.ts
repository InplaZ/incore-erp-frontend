import { useQuery } from "@tanstack/react-query";

import { productosCategoriasApi } from "./productos.api";

export const productosQueryKeys = {
  all: ["productos"] as const,
  categorias: () => [...productosQueryKeys.all, "categorias"] as const,
};

export function useProductosCategorias() {
  return useQuery({
    queryKey: productosQueryKeys.categorias(),
    queryFn: productosCategoriasApi.list,
  });
}