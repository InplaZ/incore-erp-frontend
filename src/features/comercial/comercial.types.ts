//=================================
//Tipos Generales
//================================
export interface PaginatedResponse<T>{
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
//================================
//Cuentas comerciales
//================================
export type TipoPersona = "natural" | "juridica";

export type EstadoCuenta =
    | "prospecto"
    | "cliente"
    | "inactivo";

export type TipoRelacion = 
    | "cliente"
    | "proveedor"
    | "ambos";

export type DocumentoIdentidad =
    | "ci"
    | "nit";

export interface CuentaComercial {
    id: number;
    usuario: number | null;

    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;

    tipo_persona: TipoPersona;
    razon_social: string

    identificacion: number;
    documento_identidad: DocumentoIdentidad | null;

    telefono: string;
    correo: string;
    direccion: string;

    estado: EstadoCuenta;
    tipo_relacion: TipoRelacion | null;

    fecha_alta: string;
    
    created_at: string;
    updated_at: string;
}

export interface CuentaComercialCreate {
    usuario?: number | null;

    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;

    tipo_persona: TipoPersona;
    razon_social?: string;

    identificacion: number;
    documento_identidad?: DocumentoIdentidad | null;

    telefono?: string;
    correo?: string;
    direccion?: string;

    estado?: EstadoCuenta;
    tipo_relacion?: TipoRelacion | null;

    fecha_alta: string;
}

export type CuentaComercialUpdate = Partial<CuentaComercialCreate>

// ============================================================
// ACTIVIDADES COMERCIALES
// ============================================================

export type TipoActividad =
  | "llamada"
  | "reunion"
  | "cotizacion"
  | "seguimiento";

export type EstadoActividad =
  | "pendiente"
  | "en_proceso"
  | "completada"
  | "cancelada";

export interface ActividadComercial {
  id: number;

  cuenta_comercial: number;
  usuario: number;

  tipo: TipoActividad;
  descripcion: string;

  fecha_programada: string;
  fecha_completada: string | null;

  estado: EstadoActividad;
  resultado: string | null;

  created_at: string;
  updated_at: string;
}

export interface ActividadComercialCreate {
  cuenta_comercial: number;
  usuario: number;

  tipo: TipoActividad;
  descripcion: string;

  fecha_programada: string;
  fecha_completada?: string | null;

  estado?: EstadoActividad;
  resultado?: string | null;
}

export type ActividadComercialUpdate =
  Partial<ActividadComercialCreate>;


// ============================================================
// SOLICITUDES COMERCIALES
// ============================================================

export type PrioridadSolicitud =
  | "baja"
  | "normal"
  | "alta"
  | "urgente";

export type EstadoSolicitud =
  | "recibida"
  | "en_negociacion"
  | "en_viabilidad"
  | "aprobada"
  | "rechazada"
  | "convertida"
  | "cancelada";

export interface SolicitudComercial {
  id: number;

  cuenta_comercial: number;
  usuario: number;

  fecha: string;
  descripcion: string;

  prioridad: PrioridadSolicitud;
  estado: EstadoSolicitud;

  created_at: string;
  updated_at: string;
}

export interface SolicitudComercialCreate {
  cuenta_comercial: number;
  usuario: number;

  fecha: string;
  descripcion: string;

  prioridad?: PrioridadSolicitud;
  estado?: EstadoSolicitud;
}

export type SolicitudComercialUpdate =
  Partial<SolicitudComercialCreate>;


// ============================================================
// ESPECIFICACIÓN DE PRODUCTO SOLICITADO
// ============================================================

export type MaterialProducto =
  | "PEAD"
  | "PEBD"
  | "PP";

export type TipoImpresion =
  | "corrida"
  | "dimensionada";

export interface EspecificacionProductoSolicitado {
  id: number;

  solicitud_comercial: number;
  categoria_producto: number;

  material: MaterialProducto;

  apto_alimento: boolean;

  micraje: string | null;

  color_bolsa: string;

  impresion: boolean;

  color_impresion: string[];

  tipo_impresion: TipoImpresion;

  otras_caracteristicas: string;

  created_at: string;
  updated_at: string;
}

export interface EspecificacionProductoSolicitadoCreate {
  solicitud_comercial: number;
  categoria_producto: number;

  material: MaterialProducto;

  apto_alimento: boolean;

  micraje?: string | null;

  color_bolsa: string;

  impresion: boolean;

  color_impresion: string[];

  tipo_impresion: TipoImpresion;

  otras_caracteristicas?: string;
}

export type EspecificacionProductoSolicitadoUpdate =
  Partial<EspecificacionProductoSolicitadoCreate>;


// ============================================================
// ESPECIFICACIÓN DE BOLSA SOLICITADA
// ============================================================

export type TipoTroquel =
  | "camiseta"
  | "boutique"
  | "aza"
  | "boutique_reforzado";

export type TipoSello =
  | "fondo"
  | "lateral";

export interface EspecificacionBolsaSolicitada {
  id: number;

  especificacion_producto_solicitado: number;

  ancho_doblado: string;
  ancho_desdoblado: string | null;

  largo_doblado: string;
  largo_desdoblado: string | null;

  fuelle: boolean;

  fuelle_izquierdo: string | null;
  fuelle_derecho: string | null;
  fuelle_inferior: string | null;
  fuelle_superior: string | null;

  tipo_troquel: TipoTroquel;
  tipo_sello: TipoSello;

  pestana: string;

  otras_caracteristicas: string;

  created_at: string;
  updated_at: string;
}

export interface EspecificacionBolsaSolicitadaCreate {
  especificacion_producto_solicitado: number;

  ancho_doblado: string;
  ancho_desdoblado?: string | null;

  largo_doblado: string;
  largo_desdoblado?: string | null;

  fuelle: boolean;

  fuelle_izquierdo?: string | null;
  fuelle_derecho?: string | null;
  fuelle_inferior?: string | null;
  fuelle_superior?: string | null;

  tipo_troquel: TipoTroquel;
  tipo_sello: TipoSello;

  pestana: string;

  otras_caracteristicas?: string;
}

export type EspecificacionBolsaSolicitadaUpdate =
  Partial<EspecificacionBolsaSolicitadaCreate>;


// ============================================================
// ESPECIFICACIÓN DE BOBINA SOLICITADA
// ============================================================

export interface EspecificacionBobinaSolicitada {
  id: number;

  especificacion_producto_solicitado: number;

  ancho: string;

  diametro: string | null;
  diametro_nucleo: string | null;

  tipo_nucleo: string;

  peso: string | null;

  otras_caracteristicas: string;

  created_at: string;
  updated_at: string;
}

export interface EspecificacionBobinaSolicitadaCreate {
  especificacion_producto_solicitado: number;

  ancho: string;

  diametro?: string | null;
  diametro_nucleo?: string | null;

  tipo_nucleo: string;

  peso?: string | null;

  otras_caracteristicas?: string;
}

export type EspecificacionBobinaSolicitadaUpdate =
  Partial<EspecificacionBobinaSolicitadaCreate>;


// ============================================================
// COMUNICACIONES
// ============================================================

export interface Comunicacion {
  id: number;

  solicitud_comercial: number;
  usuario: number;

  tipo: string;
  medio: string;

  asunto: string | null;
  contenido: string;

  created_at: string;
  updated_at: string;
}

export interface ComunicacionCreate {
  solicitud_comercial: number;
  usuario: number;

  tipo: string;
  medio: string;

  asunto?: string | null;
  contenido: string;
}

export type ComunicacionUpdate =
  Partial<ComunicacionCreate>;


// ============================================================
// COTIZACIONES
// ============================================================

export type EstadoCotizacion =
  | "borrador"
  | "activa"
  | "cerrada"
  | "anulada";

export interface Cotizacion {
  id: number;

  solicitud_comercial: number;

  numero: string;

  fecha_emision: string;
  fecha_vencimiento: string | null;

  estado: EstadoCotizacion;

  created_at: string;
  updated_at: string;
}

export interface CotizacionCreate {
  solicitud_comercial: number;

  numero: string;

  fecha_emision: string;
  fecha_vencimiento?: string | null;

  estado?: EstadoCotizacion;
}

export type CotizacionUpdate =
  Partial<CotizacionCreate>;


// ============================================================
// VERSIONES DE COTIZACIÓN
// ============================================================

export type Moneda =
  | "BOB"
  | "USD";

export type EstadoCotizacionVersion =
  | "borrador"
  | "enviada"
  | "aceptada"
  | "rechazada"
  | "anulada";

export interface CotizacionVersion {
  id: number;

  cotizacion: number;

  version: number;

  moneda: Moneda;

  precio_total: string;

  estado: EstadoCotizacionVersion;

  created_at: string;
  updated_at: string;
}

export interface CotizacionVersionCreate {
  cotizacion: number;

  version: number;

  moneda: Moneda;

  precio_total: string;

  estado?: EstadoCotizacionVersion;
}

export type CotizacionVersionUpdate =
  Partial<CotizacionVersionCreate>;


// ============================================================
// DETALLE DE COTIZACIÓN
// ============================================================

export interface CotizacionDetalle {
  id: number;

  cotizacion_version: number;
  producto_version: number;

  cantidad: string;
  precio_unitario: string;
  precio_total: string;

  created_at: string;
  updated_at: string;
}

export interface CotizacionDetalleCreate {
  cotizacion_version: number;
  producto_version: number;

  cantidad: string;
  precio_unitario: string;
  precio_total: string;
}

export type CotizacionDetalleUpdate =
  Partial<CotizacionDetalleCreate>;


// ============================================================
// PEDIDOS
// ============================================================

export type EstadoPedido =
  | "finalizado"
  | "en_proceso";

export interface Pedido {
  id: number;

  cotizacion_version: number;
  cuenta_comercial: number;

  numero: string;

  fecha_pedido: string;

  estado: EstadoPedido;

  fecha_entrega_comprometida: string;

  observaciones: string;

  created_at: string;
  updated_at: string;
}

export interface PedidoCreate {
  cotizacion_version: number;
  cuenta_comercial: number;

  numero: string;

  fecha_pedido: string;

  estado?: EstadoPedido;

  fecha_entrega_comprometida: string;

  observaciones?: string;
}

export type PedidoUpdate =
  Partial<PedidoCreate>;


// ============================================================
// DETALLE DE PEDIDO
// ============================================================

export interface PedidoDetalle {
  id: number;

  pedido: number;
  producto_version: number;

  cantidad: string;
  precio_unitario: string;
  precio_total: string;

  fecha_entrega_comprometida: string;

  observaciones: string;

  created_at: string;
  updated_at: string;
}

export interface PedidoDetalleCreate {
  pedido: number;
  producto_version: number;

  cantidad: string;
  precio_unitario: string;
  precio_total: string;

  fecha_entrega_comprometida: string;

  observaciones?: string;
}

export type PedidoDetalleUpdate =
  Partial<PedidoDetalleCreate>;
