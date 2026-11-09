
// ============================================================
// TIPOS E INTERFACES TYPESCRIPT - MÓDULO MAQUINARIA
// ============================================================

// ============================================================
// EQUIPOS
// ============================================================

export type EstadoEquipo =
  | "operativo"
  | "mantenimiento"
  | "fuera_servicio";

export type TipoEquipo =
  | "maquinaria"
  | "vehiculo"
  | "infraestructura";

export interface Equipo {
  id: number;
  codigo: string;
  nombre: string;
  tipo_equipo: TipoEquipo;
  marca: string;
  modelo: string;
  estado: EstadoEquipo;
  ubicacion: string;
}

export interface EquipoCreate {
  codigo: string;
  nombre: string;
  tipo_equipo: "maquinaria";
  marca?: string;
  modelo?: string;
  estado: EstadoEquipo;
  ubicacion?: string;
}

// ============================================================
// ÁREAS DE PRODUCCIÓN
// ============================================================

export interface AreaProduccion {
  id: number;
  nombre: string;
  descripcion: string;
}

// ============================================================
// MAQUINARIA
// ============================================================

export interface Maquinaria {
  id: number;
  equipo: number;
  area_produccion: number;
  descripcion: string;
  observacion: string;
}

export interface MaquinariaCreate {
  equipo: number;
  area_produccion: number;
  descripcion?: string;
  observacion?: string;
}

export interface MaquinariaFormulario {
  equipo: EquipoCreate;
  maquinaria: Omit<MaquinariaCreate, "equipo">;
}

// ============================================================
// CAPACIDAD DE EXTRUSIÓN
// ============================================================

export type MaterialExtrusion = "PEAD" | "PEBD" | "PP";

export interface CapacidadExtrusion {
  id: number;
  maquinaria: number;
  material: MaterialExtrusion;

  ancho_min: number;
  ancho_max: number;

  micronaje_min: number;
  micronaje_max: number;

  diametro_min: number | null;
  diametro_max: number | null;

  peso_min: number | null;
  peso_max: number | null;

  kg_h: number;
  capas: number;

  fuelle_minimo: number | null;
  fuelle_maximo: number | null;

  observaciones: string;
}

export interface CapacidadExtrusionCreate {
  maquinaria: number;
  material: MaterialExtrusion;

  ancho_min: number;
  ancho_max: number;

  micronaje_min: number;
  micronaje_max: number;

  diametro_min?: number | null;
  diametro_max?: number | null;

  peso_min?: number | null;
  peso_max?: number | null;

  kg_h: number;
  capas: number;

  fuelle_minimo?: number | null;
  fuelle_maximo?: number | null;

  observaciones?: string;
}

// ============================================================
// CAPACIDAD DE FLEXOGRAFÍA
// ============================================================

export interface CapacidadFlexografia {
  id: number;
  maquinaria: number;

  ancho_min: number;
  ancho_max: number;

  colores_min: number;
  colores_max: number;

  puede_anverso: boolean;
  puede_reverso: boolean;
  puede_ambas_caras: boolean;
  puede_degradado: boolean;
  puede_trameado: boolean;

  velocidad_m_min: number;
  observaciones: string;
}

export interface CapacidadFlexografiaCreate {
  maquinaria: number;

  ancho_min: number;
  ancho_max: number;

  colores_min: number;
  colores_max: number;

  puede_anverso: boolean;
  puede_reverso: boolean;
  puede_ambas_caras: boolean;
  puede_degradado: boolean;
  puede_trameado: boolean;

  velocidad_m_min: number;
  observaciones?: string;
}

// ============================================================
// CAPACIDAD DE CONFECCIÓN
// ============================================================

export interface CapacidadConfeccion {
  id: number;
  maquinaria: number;

  materiales: string[];
  tipo_sello: string[];
  tipo_troquel: string[];
  acabado_especial: string[];

  bobina_ancho_min: number;
  bobina_ancho_max: number;

  producto_ancho_min: number | null;
  producto_ancho_max: number | null;

  largo_min: number;
  largo_max: number;

  fuelle_min: number | null;
  fuelle_max: number | null;

  velocidad_unidad_min: number;
  observaciones: string;
}

export interface CapacidadConfeccionCreate {
  maquinaria: number;

  materiales: string[];
  tipo_sello: string[];
  tipo_troquel: string[];
  acabado_especial: string[];

  bobina_ancho_min: number;
  bobina_ancho_max: number;

  producto_ancho_min?: number | null;
  producto_ancho_max?: number | null;

  largo_min: number;
  largo_max: number;

  fuelle_min?: number | null;
  fuelle_max?: number | null;

  velocidad_unidad_min: number;
  observaciones?: string;
}

// ============================================================
// CAPACIDAD DE REFILADO
// ============================================================

export interface CapacidadRefilado {
  id: number;
  maquinaria: number;

  ancho_entrada_min: number;
  ancho_entrada_max: number;

  ancho_salida_min: number;
  ancho_salida_max: number;

  velocidad_m_min: number;
  observaciones: string;
}

export interface CapacidadRefiladoCreate {
  maquinaria: number;

  ancho_entrada_min: number;
  ancho_entrada_max: number;

  ancho_salida_min: number;
  ancho_salida_max: number;

  velocidad_m_min: number;
  observaciones?: string;
}

// ============================================================
// INFORMACIÓN COMBINADA PARA EL FRONTEND
// ============================================================

export interface MaquinariaDetalle extends Maquinaria {
  equipo_detalle: Equipo;
  area_detalle?: AreaProduccion;
}
