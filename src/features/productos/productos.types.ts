import type { 
    EspecificacionBolsaCatalogo, 
    EspecificacionBobinaCatalogo } from "../comercial/comercial.types";

export interface ProductoCategoria {
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
    created_at: string;
    updated_at:string;
}

export interface ProductoSubcategoria {
  id: number;
  categoria: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface ProductoComercialCreate {
  producto: {
    categoria: number;
    subcategoria?: number | null;
    nombre: string;
    descripcion?: string;
    unidad_medida: Producto["unidad_medida"];
    pais_origen?: string;
  };
  version: {
    material: string;
    capas: string;
    cara_impresion?: string | null;
    tratamiento_impresion?: string;
    diseno?: number | null;
    apto_alimento: boolean;
    micraje?: string | number | null;
    color_bolsa?: string;
    impresion: boolean;
    color_impresion?: string[];
    tipo_impresion?: string;
    metros?: string | number | null;
    observaciones?: string;
  };
  especificacion_bolsa?: {
    ancho_doblado: string | number;
    ancho_desdoblado?: string | number | null;
    largo_doblado: string | number;
    largo_desdoblado?: string | number | null;
    fuelle: boolean;
    fuelle_izquierdo?: string | number | null;
    fuelle_derecho?: string | number | null;
    fuelle_inferior?: string | number | null;
    fuelle_superior?: string | number | null;
    tipo_troquel: string;
    tipo_sello: string;
    pestana?: string;
    acabado_especial?: string;
    otras_caracteristicas?: string;
  };
  especificacion_bobina?: {
    ancho: string | number;
    configuracion_pelicula?: "tubular" | "corte_lateral" | "corte_separacion";
    diametro?: string | number | null;
    diametro_nucleo?: string | number | null;
    tipo_nucleo?: string;
    peso?: string | number | null;
    longitud?: string | number | null;
    otras_caracteristicas?: string;
  };
  presentacion?: {
    unidades_por_fajo: number;
    fajos_por_bulto?: number;
    paquetes_por_jaba: number;
    jabas_por_bulto: number;
  };
}

export interface Producto {
  id: number;
  categoria: number;
  subcategoria: number | null;
  codigo: string;
  nombre: string;
  descripcion: string;
  imagen: string | null;
  unidad_medida: "unidad" | "kg" | "rollos";
  pais_origen: string;
  estado: boolean;
  estado_homologacion: "pendiente" | "homologado" | "rechazado";
  numero_homologacion: string | null;
  observaciones_homologacion?: string;
  imagen_anverso?: string | null;
  imagen_reverso?: string | null;
  created_at: string;
  updated_at: string;
}

/** Respuesta real de crear-comercial: ficha de producto con sus versiones técnicas. */
export interface ProductoComercialCreado extends Producto {
  versiones: Array<{ id: number; numero_version: number }>;
}

export interface ProductoCatalogo {
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  producto_descripcion: string;
  categoria: string | null;
  subcategoria_id: number | null;
  subcategoria: string | null;
  version_id: number;
  version_numero: number;
  material: string;
  capas: string | null;
  micraje: number | string | null;
  impresion: boolean;
  color_bolsa: string;
  tipo_impresion: string;
  imagen: string | null;
  especificacion_bolsa?: EspecificacionBolsaCatalogo;
  especificacion_bobina?: EspecificacionBobinaCatalogo;
}

export interface BuscarCatalogoResponse {
  exito: boolean;
  productos: ProductoCatalogo[];
  cantidad: number;
}
