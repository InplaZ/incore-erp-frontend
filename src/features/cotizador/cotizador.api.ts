
import { api } from "@/api/api.config";

import type {
  MaterialCotizador,
  TarifaImpresion,
  ParametroCotizador,
  MargenComercial,
  CalculoCotizador,
  CalcularCotizacionRequest,
} from "./cotizador.types";

// ============================================================
// MATERIALES
// ============================================================

export const materialesCotizadorApi = {
  list: async (): Promise<MaterialCotizador[]> =>
    api.get<MaterialCotizador[]>("/cotizador/materiales/"),

  get: async (id: number): Promise<MaterialCotizador> =>
    api.get<MaterialCotizador>(`/cotizador/materiales/${id}/`),
};

// ============================================================
// TARIFAS DE IMPRESIÓN
// ============================================================

export const tarifasImpresionApi = {
  list: async (): Promise<TarifaImpresion[]> =>
    api.get<TarifaImpresion[]>("/cotizador/tarifas-impresion/"),

  get: async (id: number): Promise<TarifaImpresion> =>
    api.get<TarifaImpresion>(`/cotizador/tarifas-impresion/${id}/`),
};

// ============================================================
// PARÁMETROS
// ============================================================

export const parametrosCotizadorApi = {
  list: async (): Promise<ParametroCotizador[]> =>
    api.get<ParametroCotizador[]>("/cotizador/parametros/"),

  get: async (id: number): Promise<ParametroCotizador> =>
    api.get<ParametroCotizador>(`/cotizador/parametros/${id}/`),

  update: async (
    id: number,
    data: Partial<ParametroCotizador>,
  ): Promise<ParametroCotizador> =>
    api.patch<ParametroCotizador>(
      `/cotizador/parametros/${id}/`,
      data,
    ),
};

// ============================================================
// MÁRGENES COMERCIALES
// ============================================================

export const margenesComercialesApi = {
  list: async (): Promise<MargenComercial[]> =>
    api.get<MargenComercial[]>("/cotizador/margenes/"),

  get: async (id: number): Promise<MargenComercial> =>
    api.get<MargenComercial>(`/cotizador/margenes/${id}/`),
};

// ============================================================
// CÁLCULOS E HISTORIAL
// ============================================================

export const calculosCotizadorApi = {
  list: async (): Promise<CalculoCotizador[]> =>
    api.get<CalculoCotizador[]>("/cotizador/calculos/"),

  get: async (id: number): Promise<CalculoCotizador> =>
    api.get<CalculoCotizador>(`/cotizador/calculos/${id}/`),

  calcular: async (
    data: CalcularCotizacionRequest,
  ): Promise<CalculoCotizador> =>
    api.post<CalculoCotizador, CalcularCotizacionRequest>(
      "/cotizador/calculos/calcular/",
      data,
    ),
};
