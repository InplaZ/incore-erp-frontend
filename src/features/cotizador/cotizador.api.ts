
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

export type MaterialCotizadorInput = Pick<
  MaterialCotizador,
  | "nombre"
  | "costo_por_kg"
  | "tipo_material"
  | "categoria"
  | "activo"
  | "orden"
>;

export const materialesCotizadorApi = {
  list: async (): Promise<MaterialCotizador[]> =>
    api.get<MaterialCotizador[]>("/cotizador/materiales/"),

  get: async (id: number): Promise<MaterialCotizador> =>
    api.get<MaterialCotizador>(`/cotizador/materiales/${id}/`),

  create: async (
    data: MaterialCotizadorInput,
  ): Promise<MaterialCotizador> =>
    api.post<MaterialCotizador, MaterialCotizadorInput>(
      "/cotizador/materiales/",
      data,
    ),

  update: async (
    id: number,
    data: Partial<MaterialCotizadorInput>,
  ): Promise<MaterialCotizador> =>
    api.patch<MaterialCotizador, Partial<MaterialCotizadorInput>>(
      `/cotizador/materiales/${id}/`,
      data,
    ),

  delete: async (id: number): Promise<void> =>
    api.delete<void>(`/cotizador/materiales/${id}/`),
};

// ============================================================
// TARIFAS DE IMPRESIÓN
// ============================================================

export type TarifaImpresionInput = Pick<
  TarifaImpresion,
  "nombre" | "costo_por_kg" | "activo" | "orden"
>;

export const tarifasImpresionApi = {
  list: async (): Promise<TarifaImpresion[]> =>
    api.get<TarifaImpresion[]>("/cotizador/tarifas-impresion/"),

  get: async (id: number): Promise<TarifaImpresion> =>
    api.get<TarifaImpresion>(
      `/cotizador/tarifas-impresion/${id}/`,
    ),

  create: async (
    data: TarifaImpresionInput,
  ): Promise<TarifaImpresion> =>
    api.post<TarifaImpresion, TarifaImpresionInput>(
      "/cotizador/tarifas-impresion/",
      data,
    ),

  update: async (
    id: number,
    data: Partial<TarifaImpresionInput>,
  ): Promise<TarifaImpresion> =>
    api.patch<TarifaImpresion, Partial<TarifaImpresionInput>>(
      `/cotizador/tarifas-impresion/${id}/`,
      data,
    ),

  delete: async (id: number): Promise<void> =>
    api.delete<void>(`/cotizador/tarifas-impresion/${id}/`),
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
export type MargenComercialInput = Pick<
  MargenComercial,
  "nombre" | "porcentaje" | "activo" | "orden"
>;
export const margenesComercialesApi = {
  list: async (): Promise<MargenComercial[]> =>
    api.get<MargenComercial[]>("/cotizador/margenes/"),

  get: async (id: number): Promise<MargenComercial> =>
    api.get<MargenComercial>(`/cotizador/margenes/${id}/`),

  create: async (
    data: MargenComercialInput,
  ): Promise<MargenComercial> =>
    api.post<MargenComercial, MargenComercialInput>(
      "/cotizador/margenes/",
      data,
    ),

  update: async (
    id: number,
    data: Partial<MargenComercialInput>,
  ): Promise<MargenComercial> =>
    api.patch<MargenComercial, Partial<MargenComercialInput>>(
      `/cotizador/margenes/${id}/`,
      data,
    ),

  delete: async (id: number): Promise<void> =>
    api.delete<void>(`/cotizador/tarifas-impresion/${id}/`),
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
