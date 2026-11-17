
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  materialesCotizadorApi,
  tarifasImpresionApi,
  parametrosCotizadorApi,
  margenesComercialesApi,
  calculosCotizadorApi,
} from "./cotizador.api";

import type {
  CalcularCotizacionRequest,
  MaterialCotizador,
  TarifaImpresion,
  ParametroCotizador,
  MargenComercial,
  CalculoCotizador,
} from "./cotizador.types";

// ============================================================
// QUERY KEYS
// ============================================================

export const cotizadorQueryKeys = {
  all: ["cotizador"] as const,

  materiales: () =>
    [...cotizadorQueryKeys.all, "materiales"] as const,

  material: (id: number) =>
    [...cotizadorQueryKeys.materiales(), id] as const,

  tarifasImpresion: () =>
    [...cotizadorQueryKeys.all, "tarifas-impresion"] as const,

  tarifaImpresion: (id: number) =>
    [...cotizadorQueryKeys.tarifasImpresion(), id] as const,

  parametros: () =>
    [...cotizadorQueryKeys.all, "parametros"] as const,

  parametro: (id: number) =>
    [...cotizadorQueryKeys.parametros(), id] as const,

  margenes: () =>
    [...cotizadorQueryKeys.all, "margenes"] as const,

  margen: (id: number) =>
    [...cotizadorQueryKeys.margenes(), id] as const,

  calculos: () =>
    [...cotizadorQueryKeys.all, "calculos"] as const,

  calculo: (id: number) =>
    [...cotizadorQueryKeys.calculos(), id] as const,
};

// ============================================================
// MATERIALES
// ============================================================

export function useMaterialesCotizador() {
  return useQuery<MaterialCotizador[]>({
    queryKey: cotizadorQueryKeys.materiales(),
    queryFn: () => materialesCotizadorApi.list(),
  });
}

export function useMaterialCotizador(id: number) {
  return useQuery({
    queryKey: cotizadorQueryKeys.material(id),
    queryFn: () => materialesCotizadorApi.get(id),
    enabled: !!id,
  });
}

// ============================================================
// TARIFAS DE IMPRESIÓN
// ============================================================

export function useTarifasImpresion() {
  return useQuery<TarifaImpresion[]>({
    queryKey: cotizadorQueryKeys.tarifasImpresion(),
    queryFn: () => tarifasImpresionApi.list(),
  });
}

export function useTarifaImpresion(id: number) {
  return useQuery({
    queryKey: cotizadorQueryKeys.tarifaImpresion(id),
    queryFn: () => tarifasImpresionApi.get(id),
    enabled: !!id,
  });
}

// ============================================================
// PARÁMETROS
// ============================================================

export function useParametrosCotizador() {
  return useQuery<ParametroCotizador[]>({
    queryKey: cotizadorQueryKeys.parametros(),
    queryFn: () => parametrosCotizadorApi.list(),
  });
}

export function useParametroCotizador(id: number) {
  return useQuery({
    queryKey: cotizadorQueryKeys.parametro(id),
    queryFn: () => parametrosCotizadorApi.get(id),
    enabled: !!id,
  });
}

export function useUpdateParametroCotizador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ParametroCotizador>;
    }) => parametrosCotizadorApi.update(id, data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: cotizadorQueryKeys.parametros(),
      });

      queryClient.setQueryData(
        cotizadorQueryKeys.parametro(data.id),
        data,
      );
    },
  });
}

// ============================================================
// MÁRGENES COMERCIALES
// ============================================================

export function useMargenesComerciales() {
  return useQuery<MargenComercial[]>({
    queryKey: cotizadorQueryKeys.margenes(),
    queryFn: () => margenesComercialesApi.list(),
  });
}

export function useMargenComercial(id: number) {
  return useQuery({
    queryKey: cotizadorQueryKeys.margen(id),
    queryFn: () => margenesComercialesApi.get(id),
    enabled: !!id,
  });
}

// ============================================================
// CÁLCULOS E HISTORIAL
// ============================================================

export function useCalculosCotizador() {
  return useQuery<CalculoCotizador[]>({
    queryKey: cotizadorQueryKeys.calculos(),
    queryFn: () => calculosCotizadorApi.list(),
  });
}

export function useCalculoCotizador(id: number) {
  return useQuery({
    queryKey: cotizadorQueryKeys.calculo(id),
    queryFn: () => calculosCotizadorApi.get(id),
    enabled: !!id,
  });
}

export function useCalcularCotizacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CalcularCotizacionRequest) =>
      calculosCotizadorApi.calcular(data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: cotizadorQueryKeys.calculos(),
      });

      queryClient.setQueryData(
        cotizadorQueryKeys.calculo(data.id),
        data,
      );
    },
  });
}
