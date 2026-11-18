
// ============================================================
// TIPOS GENERALES
// ============================================================

export type TipoMaterialCotizador = "PEBD" | "PEAD" | "PP" | "OTRO";
export type CategoriaMaterialCotizador = "COLOR" | "ESPECIAL";

export interface MaterialCotizador {
  id: number;
  nombre: string;
  costo_por_kg: string;
  tipo_material: TipoMaterialCotizador | "";
  categoria: CategoriaMaterialCotizador | "";
  activo: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface TarifaImpresion {
  id: number;
  nombre: string;
  costo_por_kg: string;
  activo: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface ParametroCotizador {
  id: number;
  codigo: string;
  nombre: string;
  valor: string;
  unidad: string;
  editable_en_calculo: boolean;
  activo: boolean;
  updated_at: string;
}

export interface MargenComercial {
  id: number;
  nombre: string;
  porcentaje: string;
  activo: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// SOLICITUD DE CÁLCULO
// ============================================================


export interface CalcularCotizacionRequest {
  material_id: number;
  tarifa_impresion_id: number;
  margen_comercial_id: number;
  cantidad_kg: number;
  cliente_nombre?: string;
  mano_obra_kg?: number;
  costos_indirectos_kg?: number;
  factura?: boolean;
}

// ============================================================
// RESPUESTA DE CÁLCULO
// ============================================================


export interface CalculoCotizador {
  id: number;
  material: number;
  tarifa_impresion: number;
  margen_comercial: number;
  usuario: number;
  cliente_nombre: string;
  cantidad_kg: string;
  material_nombre: string;
  material_costo_kg: string;
  impresion_nombre: string;
  impresion_costo_kg: string;
  margen_nombre: string;
  margen_porcentaje: string;
  mano_obra_kg: string;
  costos_indirectos_kg: string;
  factura: boolean;
  factor_factura: string;
  costo_base_kg: string;
  precio_venta_kg: string;
  precio_total: string;
  created_at: string;
}

