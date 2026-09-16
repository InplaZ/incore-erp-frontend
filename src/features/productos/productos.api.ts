import { api } from "@/api/api.config";

import type { ProductoCategoria } from "@/features/productos/productos.types";

export const productosCategoriasApi = {
  list: async (): Promise<ProductoCategoria[]> => {
    return api.get<ProductoCategoria[]>(
      "/productos/categorias/",
    );
  },

  get: async (id: number): Promise<ProductoCategoria> => {
    return api.get<ProductoCategoria>(
      `/productos/categorias/${id}/`,
    );
  },
};