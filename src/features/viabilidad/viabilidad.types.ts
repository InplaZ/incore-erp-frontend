export interface EvaluarViabilidadPayload {
  producto_version?: number;
  especificacion_producto_solicitado_version?: number;
  evaluacion_comercial?: number;
  previsualizar?: boolean;
  datos_especificacion?: {
    tipo_producto: "bolsa" | "bobina";
    especificacion: Record<string, unknown>;
    especificacion_bolsa?: Record<string, unknown>;
    especificacion_bobina?: Record<string, unknown>;
  };
}

export interface ResultadoProceso {
  viable: boolean;
  resultados_evaluacion?: unknown[];
  [key: string]: unknown;
}

export interface EvaluarViabilidadResponse {
  exito: boolean;
  evaluacion_viabilidad: number | null;
  ruta: string[];
  descripcion_ruta: string;
  viable_global: boolean;
  procesos_viables: string[];
  procesos_no_viables: string[];
  resultados_por_proceso: Record<string, ResultadoProceso>;
}

export interface EvaluacionViabilidad {
  id: number;
  resultado: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado_aprobacion: string;
  fecha_aprobacion: string | null;
  observaciones: string;
  evaluacion_comercial: number | null;
  producto_version: number | null;
  usuario: number;
  aprobado_por: number | null;
}

export interface AlternativaMaquina {
  equipo_id: number;
  equipo: string;
  resultado: string;
  puntaje_viabilidad?: number;
  es_recomendada?: boolean;
  requiere_adaptacion?: boolean;
  adaptacion_propuesta?: string;
  observacion?: string;
  [key: string]: unknown;
}

export interface AlternativasMaquinaResponse {
  exito: boolean;
  evaluacion_proceso: number;
  alternativas: AlternativaMaquina[];
  [key: string]: unknown;
}

export interface SeleccionarMaquinaPayload {
  equipo_id: number;
}

export interface AccionViabilidadResponse {
  exito: boolean;
  mensaje: string;
  evaluacion_viabilidad: number;
  [key: string]: unknown;
}

export interface EvaluacionComercialCreate {
  especificacion_producto_solicitado_version: number;
  resultado: "aprobado" | "aprobada" | "viable";
  observaciones?: string;
}

export interface EvaluacionComercialResponse {
  id: number;
  especificacion_producto_solicitado_version: number;
  especificacion_producto_solicitado_legacy: number | null;
  usuario: number;
  resultado: string;
  fecha: string;
  observaciones: string;
}
