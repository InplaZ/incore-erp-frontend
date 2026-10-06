//=================================
//Tipos Generales
//================================
export interface PaginatedResponse<T>{
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
// ============================================================
// EJECUTIVO COMERCIAL
// ============================================================
export interface EjecutivoComercial{
  id: number;
  username: string;
  first_name: string;
  last_name: string;
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
    ejecutivo_asignado: number | null; 
    ejecutivo_nombre: string | null; 

    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;

    tipo_persona: TipoPersona;
    razon_social: string

    codigo_cliente: number;
    documento_identidad: DocumentoIdentidad | null;
    numero_documento: string;

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
    ejecutivo_asignado?: number | null;

    nombres?: string;
    apellido_paterno?: string;
    apellido_materno?: string;

    tipo_persona: TipoPersona;
    razon_social?: string;

    documento_identidad?: DocumentoIdentidad | null;
    numero_documento?: string | null;

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
  | "seguimiento"
  | "confirmacion";

export type EstadoActividad =
  | "pendiente"
  | "en_proceso"
  | "completada"
  | "cancelada";

export interface ActividadComercial {
  id: number;

  cuenta_comercial: number;
  solicitud_comercial: number | null;

  usuario: number;
  ejecutivo_asignado: string;

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
  solicitud_comercial?: number | null;
  tipo: TipoActividad;
  descripcion: string;
  fecha_programada: string;
}

export type ActividadComercialUpdate = {
  cuenta_comercial?: number;
  tipo?: TipoActividad;
  descripcion?: string;
  fecha_programada?: string;
  fecha_completada?: string | null;
  estado?: EstadoActividad;
  resultado?: string | null;
}

export interface RequerimientoDetalle {
  solicitud: SolicitudComercial;
  cuentaComercial: CuentaComercial;
  especificacionProducto: EspecificacionProductoSolicitado | null;
  especificacionBolsa: EspecificacionBolsaSolicitada | null;
  especificacionBobina: EspecificacionBobinaSolicitada | null;
  productosCotizados: ProductoCotizadoEnSolicitud[];
}

export interface ProductoCotizadoEnSolicitud {
  cotizacion: Cotizacion;
  cotizacionVersion: CotizacionVersion;
  cotizacionDetalle: Pick<
    CotizacionDetalle,
    | "id"
    | "cantidad"
    | "costo_estimado"
    | "precio_lista"
    | "descuento_porcentaje"
    | "precio_unitario"
    | "precio_total"
  >;
  producto: {
    id: number;
    categoria: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    unidad_medida: string;
    pais_origen: string;
    estado: string;
    created_at: string;
    updated_at: string;
  };
  categoria: ProductoCategoria;
  productoVersion: {
    id: number;
    producto: number;
    material: string;
    capas: string | null;
    cara_impresion: string | null;
    tratamiento_impresion: string | null;
    diseno: number | null;
    apto_alimento: boolean;
    micraje: string | null;
    color_bolsa: string;
    impresion: boolean;
    color_impresion: string[];
    tipo_impresion: string;
    numero_version: number;
    estado: string;
    observaciones: string;
    created_at: string;
    updated_at: string;
  };
  especificacionBolsa: EspecificacionBolsaCatalogo | null;
  especificacionBobina: EspecificacionBobinaCatalogo | null;
}

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

  cantidad_unidades: string;
  cantidad_kg: string;
  fecha_entrega: string | null;
  lugar_entrega: string;
  observaciones: string;

  prioridad: PrioridadSolicitud;
  estado: EstadoSolicitud;

  created_at: string;
  updated_at: string;
}

export interface SolicitudComercialCreate {
  cuenta_comercial: number;

  fecha: string;
  descripcion: string;

  cantidad_unidades: string;
  cantidad_kg: string;
  fecha_entrega?: string | null;
  lugar_entrega?: string;
  observaciones?: string;

  prioridad?: PrioridadSolicitud;

  estado: EstadoSolicitud;
}

export type SolicitudComercialUpdate =
  Partial<SolicitudComercialCreate>;
// ============================================================
// VARIANTE DE COLOR SOLICITADA
// ============================================================

export interface VarianteColorSolicitada {
  id: number;
  especificacion_producto_solicitado: number;
  color: string;
  cantidad: string;
  created_at: string;
  updated_at: string;
}
export interface VarianteColorSolicitadaCreate {
  id?: number;
  especificacion_producto_solicitado?: number;
  color: string;
  cantidad: string;
  created_at?: string;
  updated_at?: string;
}
export type VarianteColorSolicitadaUpdate =
  Partial<VarianteColorSolicitadaCreate>;
// ============================================================
// Categoria Producto 
// ============================================================
export type ProductType = 
  | "bag"
  | "roll"
  | "other"
  | null;
  
// ============================================================
// ESPECIFICACIÓN DE PRODUCTO SOLICITADO
// ============================================================
export type TipoCapa =
  | "monocapa"
  | "bicapa"
  | "tricapa";

export type MaterialProducto =
  | "PEAD"
  | "PEBD"
  | "PP"
  | "BOPP"
  | "OTRO";

export type Opacidad = 
  | "alta"
  | "media"
  | "baja";

export type TipoImpresion =
  | "corrida"
  | "dimensionada";

export type CaraImpresion =
  | "anverso"
  | "reverso"
  | "ambas";

export type TratamientoImpresion = 
  | "solido"
  | "degradado"
  | "trameado";
  
export type PosicionImpresion =
  | "centrada"
  | "personalizada";

export type TratamientoAcabadoEspecial = 
  | "film_aromatizado"
  | "oxobiodegradable"
  | "perforada"
  | "precorte";

export interface EspecificacionProductoSolicitado {
  id: number;
  solicitud_comercial: number;
  categoria_producto: number;
  cara_impresion: CaraImpresion | "";
  material: MaterialProducto;
  apto_alimento: boolean;
  micraje: string | null;
  color_bolsa: string;
  impresion: boolean;
  color_impresion: string[];
  tipo_impresion: TipoImpresion;
  tratamiento_impresion: TratamientoImpresion;
  posicion_impresion: PosicionImpresion;
  distancia_impresion_superior: string | null;
  distancia_impresion_inferior: string | null;
  distancia_impresion_izquierda: string | null;
  distancia_impresion_derecha: string | null;
  otras_caracteristicas: string;
  variantes_color: VarianteColorSolicitada[];
  opacidad: Opacidad;
  tratamientos_acabados_especiales: TratamientoAcabadoEspecial[];
  capas: TipoCapa;
  created_at: string;
  updated_at: string;
}

export interface EspecificacionProductoSolicitadoCreate {
  solicitud_comercial: number;
  categoria_producto: number;
  material: MaterialProducto;
  capas: TipoCapa;
  apto_alimento: boolean;
  micraje?: string | null;
  color_bolsa: string;
  impresion: boolean;
  color_impresion: string[];
  tipo_impresion: TipoImpresion;
  tratamiento_impresion: TratamientoImpresion;
  posicion_impresion?: PosicionImpresion;
  distancia_impresion_superior?: string | null;
  distancia_impresion_inferior?: string | null;
  distancia_impresion_izquierda?: string | null;
  distancia_impresion_derecha?: string | null;
  otras_caracteristicas?: string;
  cara_impresion?: CaraImpresion | "";
  opacidad?: Opacidad;
  tratamientos_acabados_especiales?: TratamientoAcabadoEspecial[];
  variantes_color?: VarianteColorSolicitadaCreate[];
}

export type EspecificacionProductoSolicitadoUpdate =
  Partial<EspecificacionProductoSolicitadoCreate>;

// ============================================================
// VERSIONES DE ESPECIFICACIÓN DE PRODUCTO SOLICITADO
// ============================================================

export interface EspecificacionProductoSolicitadoVersion {
  id: number;
  especificacion_producto_solicitado: number;
  version: number;
  categoria_producto: number;
  cara_impresion: CaraImpresion | "";
  material: MaterialProducto;
  apto_alimento: boolean;
  micraje: string | null;
  color_bolsa: string;
  impresion: boolean;
  color_impresion: string[];
  tipo_impresion: TipoImpresion;
  tratamiento_impresion: TratamientoImpresion;
  posicion_impresion: PosicionImpresion;
  distancia_impresion_superior: string | null;
  distancia_impresion_inferior: string | null;
  distancia_impresion_izquierda: string | null;
  distancia_impresion_derecha: string | null;
  otras_caracteristicas: string;
  opacidad: Opacidad;
  tratamientos_acabados_especiales:
    TratamientoAcabadoEspecial[];
  capas: TipoCapa;
  motivo_cambio: string | null;
  fecha_version: string;
  usuario: number | null;
  created_at: string;
  updated_at: string;
}

export interface EspecificacionProductoSolicitadoVersionCreate {
  especificacion_producto_solicitado: number;
  version: number;
  categoria_producto: number;
  material: MaterialProducto;
  capas: TipoCapa;
  apto_alimento: boolean;
  micraje?: string | null;
  color_bolsa: string;
  impresion: boolean;
  color_impresion: string[];
  tipo_impresion: TipoImpresion;
  tratamiento_impresion: TratamientoImpresion;
  posicion_impresion?: PosicionImpresion;
  distancia_impresion_superior?: string | null;
  distancia_impresion_inferior?: string | null;
  distancia_impresion_izquierda?: string | null;
  distancia_impresion_derecha?: string | null;
  otras_caracteristicas?: string;
  cara_impresion?: CaraImpresion | "";
  opacidad?: Opacidad;
  tratamientos_acabados_especiales?:
    TratamientoAcabadoEspecial[];
  motivo_cambio?: string | null;
}

export type EspecificacionProductoSolicitadoVersionUpdate =
  Partial<EspecificacionProductoSolicitadoVersionCreate>;

// ============================================================
// ESPECIFICACIÓN DE BOLSA SOLICITADA
// ============================================================

export type TipoTroquel =
  | "camiseta"
  | "normal"
  | "rinonera"
  | "con_asa"
  | "refuerzo"
  | "solapa"
  | "adhesiva"
  | "cierre_facil";

export type TipoSello =
  | "fondo"
  | "lateral"
  | "ninguno";

export type TipoPestana =
  | "sin_pestana"
  | "superior"
  | "inferior"
  | "ambas"
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

  pestana: TipoPestana;

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
  acabado_especial?: string;

  otras_caracteristicas?: string;
}

export type EspecificacionBolsaSolicitadaUpdate =
  Partial<EspecificacionBolsaSolicitadaCreate>;

// ============================================================
// VERSIONES DE ESPECIFICACIÓN DE BOLSA SOLICITADA
// ============================================================

export interface EspecificacionBolsaSolicitadaVersion {
  id: number;
  especificacion_producto_solicitado_version: number;
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
  pestana: TipoPestana;
  otras_caracteristicas: string;
  created_at: string;
  updated_at: string;
}

export interface EspecificacionBolsaSolicitadaVersionCreate {
  especificacion_producto_solicitado_version: number;
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
  pestana: TipoPestana;
  otras_caracteristicas?: string;
}

export type EspecificacionBolsaSolicitadaVersionUpdate =
  Partial<EspecificacionBolsaSolicitadaVersionCreate>;

// ============================================================
// VERSIONES DE ESPECIFICACIÓN DE BOBINA SOLICITADA
// ============================================================

export interface EspecificacionBobinaSolicitadaVersion {
  id: number;
  especificacion_producto_solicitado_version: number;
  ancho: string;
  diametro: string | null;
  diametro_nucleo: string | null;
  longitud: string | null;
  tipo_nucleo: string;
  peso: string | null;
  otras_caracteristicas: string;
  created_at: string;
  updated_at: string;
}

export interface EspecificacionBobinaSolicitadaVersionCreate {
  especificacion_producto_solicitado_version: number;
  ancho: string;
  diametro?: string | null;
  diametro_nucleo?: string | null;
  longitud?: string | null;
  tipo_nucleo: string;
  peso?: string | null;
  otras_caracteristicas?: string;
}

export type EspecificacionBobinaSolicitadaVersionUpdate =
  Partial<EspecificacionBobinaSolicitadaVersionCreate>;
// ============================================================
// ESPECIFICACIÓN DE BOBINA SOLICITADA
// ============================================================

export interface EspecificacionBobinaSolicitada {
  id: number;
  especificacion_producto_solicitado: number;
  ancho: string;
  diametro: string | null;
  diametro_nucleo: string | null;
  longitud: string | null;

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
  longitud?: string | null;

  tipo_nucleo: string;

  peso?: string | null;

  otras_caracteristicas?: string;
}

export type EspecificacionBobinaSolicitadaUpdate =
  Partial<EspecificacionBobinaSolicitadaCreate>;


// ============================================================
// COMUNICACIONES
// ============================================================

export type TipoComunicacion = 
  | "llamada"
  | "correo"
  | "mensaje"
  | "reunion"
  | "visita"
  | "otro";

export type MedioComunicacion =
  | "telefono"
  | "email"
  | "whatsapp"
  | "presencial"
  | "videollamada"
  | "otro";

export type DireccionComunicacion =
  | "saliente"
  | "entrante";

export interface Comunicacion {
  id: number;
  solicitud_comercial: number;
  usuario: number;
  tipo: string;
  medio: string;
  direccion: DireccionComunicacion | null;
  asunto: string | null;
  contenido: string;
  created_at: string;
  updated_at: string;
}

export interface ComunicacionCreate {
  solicitud_comercial: number;
  tipo: string;
  medio: string;
  direccion: DireccionComunicacion;
  asunto?: string | null;
  contenido: string;
}

export type ComunicacionUpdate = {
  solicitud_comercial?: number;
  tipo?: TipoComunicacion;
  medio?: MedioComunicacion;
  direccion?: DireccionComunicacion;
  asunto?: string | null;
  contenido?: string;
}
// ============================================================
// CATEGORÍAS DE PRODUCTOS
// ============================================================

export interface ProductoCategoria {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// PRODUCTOS DEL CATÁLOGO
// ============================================================

export interface Producto {
  id: number;
  categoria_producto: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}
// ============================================================
// VERSIONES DE PRODUCTO
// ============================================================

export interface ProductoVersion {
  id: number;
  producto: number;
  numero_version: number;
  material: MaterialProducto;
  capas: TipoCapa;
  micraje: string | null;
  impresion: boolean;
  color_bolsa: string;
  color_impresion: string[];
  tipo_impresion: TipoImpresion;
  opacidad: Opacidad;
  activo: boolean;
  created_at: string;
  updated_at: string;
}
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
  especificacion_producto_solicitado_version: number | null;
  producto_version: number | null;
  cantidad: string;
  costo_estimado: string | null;
  precio_lista: string;
  descuento_porcentaje: string;
  precio_unitario: string;
  precio_total: string;
  created_at: string;
  updated_at: string;
}

export interface CotizacionDetalleCreate {
  cotizacion_version: number;
  especificacion_producto_solicitado_version?: number | null;
  producto_version?: number | null;
  cantidad: string;
  costo_estimado?: string | null;
  precio_lista: string;
  descuento_porcentaje?: string;
}

export type CotizacionDetalleUpdate =
  Partial<CotizacionDetalleCreate>;


// ============================================================
// PEDIDOS
// ============================================================

export type EstadoPedido =
  | "borrador"
  | "confirmado"
  | "en_produccion"
  | "finalizado"
  | "cancelado";

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
  especificacion_producto_solicitado_version: number| null;
  producto_version: number | null;
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
  especificacion_producto_solicitado_version?: number | null;
  cantidad: string;
  precio_unitario: string;
  precio_total: string;
  fecha_entrega_comprometida: string;
  observaciones?: string;
}

export type PedidoDetalleUpdate =
  Partial<PedidoDetalleCreate>;

/// ============================================================
// RESULTADO DE BÚSQUEDA DE PRODUCTOS
// ============================================================

export interface ProductoBusquedaResultado {
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  producto_descripcion: string;
  categoria: string;

  version_id: number;
  version_numero: number;

  material: MaterialProducto;
  capas: TipoCapa | null;
  micraje: string | number | null;

  impresion: boolean;
  color_bolsa: string;
  tipo_impresion: TipoImpresion | "";

  especificacion_bolsa?: EspecificacionBolsaCatalogo;
  especificacion_bobina?: EspecificacionBobinaCatalogo;
}

export interface EspecificacionBobinaCatalogo {
  id: number;
  ancho: string | number;
  diametro: string | number | null;
  diametro_nucleo: string | number | null;
  tipo_nucleo: string;
  peso: string | number | null;
  longitud?: string | number | null;
  otras_caracteristicas?: string;
}

export interface EspecificacionBolsaCatalogo {
  id: number;
  ancho_doblado: string | number;
  ancho_desdoblado: string | number | null;
  largo_doblado: string | number;
  largo_desdoblado: string | number | null;

  fuelle: boolean;

  fuelle_izquierdo: string | number | null;
  fuelle_derecho: string | number | null;
  fuelle_inferior: string | number | null;
  fuelle_superior: string | number | null;

  tipo_troquel: TipoTroquel | "";
  tipo_sello: TipoSello | "";
  pestana: TipoPestana | "";

  acabado_especial?: string;
  otras_caracteristicas?: string;
}

// ============================================================
// RESPUESTA DE BÚSQUEDA DE CATÁLOGO
// ============================================================

export interface BuscarCatalogoResponse {
  exito: boolean;
  productos: ProductoBusquedaResultado[];
  cantidad: number;
}

// ============================================================
// PRODUCTOS SIMILARES
// ============================================================

export interface DiferenciaProductoSimilar {
  campo: string;
  especificacion: string | number | null;
  version: string | number | null;
}

export interface ProductoSimilar {
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;

  version_id: number;
  version_numero: number;

  porcentaje_coincidencia: number;

  diferencias: DiferenciaProductoSimilar[];
}

// ============================================================
// RESPUESTA DE BÚSQUEDA DE PRODUCTOS SIMILARES
// ============================================================

export interface BuscarSimilaresResponse {
  exito: boolean;
  productos_similares: ProductoSimilar[];
  cantidad: number;
}

export interface CrearCotizacionResponse {
  exito: boolean;
  mensaje: string;
  cotizacion: number;
  numero: string;
  solicitud_comercial: number;
  estado_solicitud: string;
}

export interface CrearCotizacionVersionResponse {
  exito: boolean;
  mensaje: string;
  cotizacion_version: number;
  version: number;
  cotizacion: number;
  moneda: Moneda;
  estado: string;
  precio_total: number;
}

export interface AgregarDetalleCotizacionResponse {
  exito: boolean;
  mensaje: string;
  cotizacion_detalle: number;
  cotizacion_version: number;
  producto_version: number | null;
  especificacion_version: number | null;
  cantidad: number;
  costo_estimado: number | null;
  precio_lista: number;
  descuento_porcentaje: number;
  precio_unitario: number;
  precio_total_detalle: number;
  precio_total_version: number;
}

export interface FormalizarCotizacionWizardPayload {
  solicitud: Omit<SolicitudComercialCreate, "estado">;
  tipo_producto: "bolsa" | "bobina";
  producto_version_id?: number;
  especificacion?: Record<string, unknown>;
  especificacion_bolsa?: Record<string, unknown>;
  especificacion_bobina?: Record<string, unknown>;
  cotizacion: {
    fecha_vencimiento?: string | null;
    observaciones?: string;
    moneda: Moneda;
  };
  detalle: {
    cantidad: string;
    precio_lista: string;
    descuento_porcentaje: string;
    costo_estimado?: string | null;
  };
}

export interface FormalizarCotizacionWizardResponse {
  exito: boolean;
  solicitud_comercial: number;
  actividad_creada: boolean;
  cotizacion: number;
  numero: string;
  cotizacion_version: number;
  especificacion_producto_solicitado_version: number | null;
  evaluacion_viabilidad: number;
}

export interface EspecificacionProductoSolicitadoVersionCreateRequest {
  especificacion_producto_solicitado_id: number;
  motivo_cambio: string;
  datos_especificacion?: Record<string, unknown>;
}

export interface CrearVersionEspecificacionResponse {
  exito: boolean;
  mensaje: string;
  version_id: number;
  version_numero: number;
  especificacion_producto_solicitado_id: number;
  requiere_nueva_viabilidad: boolean;
  cambios_tecnicos: boolean;
}
