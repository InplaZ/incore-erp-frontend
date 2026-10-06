import { api } from "@/api/api.config";

import type {
  EvaluarViabilidadPayload,
  EvaluarViabilidadResponse,
  EvaluacionViabilidad,
  EvaluacionComercialCreate,
  EvaluacionComercialResponse,
  AlternativasMaquinaResponse,
  SeleccionarMaquinaPayload,
  AccionViabilidadResponse,
} from "./viabilidad.types";

export const viabilidadApi = {
  crearEvaluacionComercial: async (
    data: EvaluacionComercialCreate,
  ): Promise<EvaluacionComercialResponse> =>
    api.post<EvaluacionComercialResponse>(
      "/viabilidad/evaluacion-comercial/",
      data,
    ),

  evaluarProducto: async (
    data: EvaluarViabilidadPayload,
  ): Promise<EvaluarViabilidadResponse> => {
    return api.post<EvaluarViabilidadResponse>(
      "/viabilidad/evaluacion-viabilidad/evaluar-producto/",
      data,
    );
  },

  obtenerEvaluacion: async (
    id: number,
  ): Promise<EvaluacionViabilidad> => {
    return api.get<EvaluacionViabilidad>(
      `/viabilidad/evaluacion-viabilidad/${id}/`,
    );
  },

  obtenerResumen: async (id: number) => {
    return api.get(
      `/viabilidad/evaluacion-viabilidad/${id}/resumen/`,
    );
  },

  aprobar: async (
    id: number,
    observaciones = "",
  ): Promise<AccionViabilidadResponse> => {
    return api.post<AccionViabilidadResponse>(
      `/viabilidad/evaluacion-viabilidad/${id}/aprobar/`,
      {
        observaciones,
      },
    );
  },

  rechazar: async (
    id: number,
    observaciones = "",
  ): Promise<AccionViabilidadResponse> => {
    return api.post<AccionViabilidadResponse>(
      `/viabilidad/evaluacion-viabilidad/${id}/rechazar/`,
      {
        observaciones,
      },
    );
  },

  obtenerAlternativas: async (
    evaluacionProcesoId: number,
  ): Promise<AlternativasMaquinaResponse> => {
    return api.get<AlternativasMaquinaResponse>(
      `/viabilidad/evaluacion-proceso/${evaluacionProcesoId}/alternativas/`,
    );
  },

  seleccionarMaquina: async (
    evaluacionProcesoId: number,
    data: SeleccionarMaquinaPayload,
  ) => {
    return api.post(
      `/viabilidad/evaluacion-proceso/${evaluacionProcesoId}/seleccionar-maquina/`,
      data,
    );
  },
};
