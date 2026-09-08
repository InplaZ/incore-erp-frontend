// ===== Core domain types for IN-SYSTEM =====

export type ID = string;

export type Role =
  | 'administrador'
  | 'comercial'
  | 'produccion'
  | 'operador'
  | 'supervisor'
  | 'viabilidad'
  | 'despacho';

export interface Permission {
  resource: string;
  action: string;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  permissions: string[];
  active: boolean;
  lastLogin?: string;
}

export type PedidoEstado =
  | 'nuevo'
  | 'en_revision'
  | 'viabilidad'
  | 'aprobado'
  | 'programado'
  | 'en_produccion'
  | 'control_calidad'
  | 'listo_despacho'
  | 'despachado'
  | 'completado';

export type Prioridad = 'critica' | 'alta' | 'media' | 'baja';

export type Etiqueta =
  | 'urgente'
  | 'cliente_nuevo'
  | 'retrasado'
  | 'viabilidad'
  | 'produccion'
  | 'despacho'
  | 'comercial'
  | 'incidencia';

export interface Cliente {
  id: ID;
  razonSocial: string;
  nit: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  estado: 'activo' | 'inactivo';
  createdAt: string;
}

export interface Producto {
  id: ID;
  codigo: string;
  nombre: string;
  tipo: string;
  material: string;
  micraje: number;
  dimensiones: string;
  acabado: string;
  estado: 'activo' | 'inactivo';
}

export interface Pedido {
  id: ID;
  numero: string;
  clienteId: ID;
  clienteNombre: string;
  productoId: ID;
  productoNombre: string;
  cantidad: number;
  fechaCreacion: string;
  fechaComprometida: string;
  estado: PedidoEstado;
  prioridad: Prioridad;
  responsableId: ID;
  responsableNombre: string;
  maquinaId?: ID;
  maquinaNombre?: string;
  dimensiones: string;
  material: string;
  micraje: number;
  impresion: string;
  acabado: string;
  observaciones?: string;
  etiquetas: Etiqueta[];
  viabilidadId?: ID;
}

export interface EventoTimeline {
  id: ID;
  fecha: string;
  usuario: string;
  accion: string;
  comentario?: string;
  estadoAnterior?: PedidoEstado;
  estadoNuevo?: PedidoEstado;
}

export interface Incidencia {
  id: ID;
  pedidoId: ID;
  tipo: 'bloqueo' | 'maquina' | 'materia_prima' | 'medidas' | 'observacion';
  descripcion: string;
  severidad: 'alta' | 'media' | 'baja';
  fecha: string;
  resuelta: boolean;
}

export interface Documento {
  id: ID;
  pedidoId: ID;
  tipo: 'cotizacion' | 'ficha_tecnica' | 'adjunto' | 'orden' | 'archivo';
  nombre: string;
  url: string;
  fecha: string;
}

export type ViabilidadResultado = 'viable' | 'no_viable' | 'requiere_revision';

export interface ReglaViabilidad {
  id: ID;
  nombre: string;
  resultado: 'ok' | 'warn' | 'fail';
  valorEvaluado: string;
  valorRequerido: string;
  observacion?: string;
}

export interface Viabilidad {
  id: ID;
  pedidoId: ID;
  resultado: ViabilidadResultado;
  reglas: ReglaViabilidad[];
  maquinasCompatibles: string[];
  tiempoEstimado: string;
  fecha: string;
  usuario: string;
}

export type MaquinaEstado = 'disponible' | 'en_produccion' | 'mantenimiento' | 'fuera_servicio';

export interface Maquina {
  id: ID;
  codigo: string;
  nombre: string;
  tipo: string;
  estado: MaquinaEstado;
  capacidad: number;
  capacidadActual: number;
  pedidoActual?: string;
  productosCompatibles: { producto: string; compatible: boolean }[];
  rodillos: string[];
  rangos: { min: number; max: number };
  mantenimiento?: string;
}

export type ProduccionEstado =
  | 'programado'
  | 'en_preparacion'
  | 'en_produccion'
  | 'pausado'
  | 'control_calidad'
  | 'finalizado';

export interface Produccion {
  id: ID;
  pedidoId: ID;
  pedidoNumero: string;
  maquinaId: ID;
  maquinaNombre: string;
  operador: string;
  cantidad: number;
  producido: number;
  estado: ProduccionEstado;
  prioridad: Prioridad;
  tiempoEstimado: string;
  tiempoTranscurrido: string;
}

export type DespachoEstado =
  | 'pendiente'
  | 'programado'
  | 'en_preparacion'
  | 'listo'
  | 'despachado'
  | 'entregado';

export interface Despacho {
  id: ID;
  numero: string;
  pedidoId: ID;
  pedidoNumero: string;
  clienteNombre: string;
  direccion: string;
  fecha: string;
  transportista: string;
  estado: DespachoEstado;
}

export type OportunidadEstado =
  | 'nuevo_lead'
  | 'contactado'
  | 'oportunidad'
  | 'cotizacion'
  | 'negociacion'
  | 'ganado'
  | 'perdido';

export interface Oportunidad {
  id: ID;
  clienteNombre: string;
  monto: number;
  vendedor: string;
  probabilidad: number;
  fechaEstimada: string;
  proximaActividad: string;
  estado: OportunidadEstado;
  cotizacionNumero?: string;
}

export type CotizacionEstado = 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'convertida';

export interface Cotizacion {
  id: ID;
  numero: string;
  clienteNombre: string;
  productoNombre: string;
  cantidad: number;
  monto: number;
  estado: CotizacionEstado;
  fecha: string;
  vendedor: string;
}

export type NotificacionTipo = 'informativa' | 'advertencia' | 'urgente';

export interface Notificacion {
  id: ID;
  tipo: NotificacionTipo;
  titulo: string;
  descripcion: string;
  fecha: string;
  leida: boolean;
  entidadTipo?: string;
  entidadId?: ID;
}

export interface Actividad {
  id: ID;
  usuario: string;
  accion: string;
  entidad: string;
  entidadId: string;
  fecha: string;
}

export interface Tarea {
  id: ID;
  pedidoNumero: string;
  titulo: string;
  prioridad: Prioridad;
  vencimiento: 'urgente' | 'hoy' | 'en_espera';
  responsableId: ID;
}
