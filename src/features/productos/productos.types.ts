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

export interface Producto {
  id: number;
  categoria: number;
  subcategoria: number | null;
  codigo: string;
  nombre: string;
  descripcion: string;
  imagen: string | null;
  unidad_medida: "unidad" | "fajo" | "metro";
  pais_origen: string;
  estado: string;
  created_at: string;
  updated_at: string;
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
