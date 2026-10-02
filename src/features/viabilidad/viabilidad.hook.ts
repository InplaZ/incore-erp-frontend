import { useMutation, useQuery } from "@tanstack/react-query";

import { viabilidadApi } from "./viabilidad.api";

import type {
  EvaluarViabilidadPayload,
  SeleccionarMaquinaPayload,
} from "./viabilidad.types";

export function useEvaluarViabilidad() {
  return useMutation({
    mutationFn: (data: EvaluarViabilidadPayload) =>
      viabilidadApi.evaluarProducto(data),
  });
}

export function useEvaluacionViabilidad(id?: number) {
  return useQuery({
    queryKey: ["evaluacion-viabilidad", id],
    queryFn: () => viabilidadApi.obtenerEvaluacion(id!),
    enabled: !!id,
  });
}

export function useResumenViabilidad(id?: number) {
  return useQuery({
    queryKey: ["resumen-viabilidad", id],
    queryFn: () => viabilidadApi.obtenerResumen(id!),
    enabled: !!id,
  });
}

export function useAprobarViabilidad() {
  return useMutation({
    mutationFn: ({
      id,
      observaciones,
    }: {
      id: number;
      observaciones?: string;
    }) => viabilidadApi.aprobar(id, observaciones),
  });
}

export function useRechazarViabilidad() {
  return useMutation({
    mutationFn: ({
      id,
      observaciones,
    }: {
      id: number;
      observaciones?: string;
    }) => viabilidadApi.rechazar(id, observaciones),
  });
}

export function useAlternativasMaquina(evaluacionProcesoId?: number) {
  return useQuery({
    queryKey: ["alternativas-maquina", evaluacionProcesoId],
    queryFn: () => viabilidadApi.obtenerAlternativas(evaluacionProcesoId!),
    enabled: !!evaluacionProcesoId,
  });
}

export function useSeleccionarMaquina() {
  return useMutation({
    mutationFn: ({
      evaluacionProcesoId,
      data,
    }: {
      evaluacionProcesoId: number;
      data: SeleccionarMaquinaPayload;
    }) =>
      viabilidadApi.seleccionarMaquina(
        evaluacionProcesoId,
        data,
      ),
  });
}