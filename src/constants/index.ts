import type {
  PedidoEstado,
  Prioridad,
  ProduccionEstado,
  DespachoEstado,
  OportunidadEstado,
  CotizacionEstado,
  MaquinaEstado,
  ViabilidadResultado,
  Role,
  Etiqueta,
} from '@/types';

export const PEDIDO_ESTADOS: PedidoEstado[] = [
  'nuevo',
  'en_revision',
  'viabilidad',
  'aprobado',
  'programado',
  'en_produccion',
  'control_calidad',
  'listo_despacho',
  'despachado',
  'completado',
];

export const PEDIDO_ESTADO_LABELS: Record<PedidoEstado, string> = {
  nuevo: 'Nuevo',
  en_revision: 'En Revisión',
  viabilidad: 'Viabilidad',
  aprobado: 'Aprobado',
  programado: 'Programado',
  en_produccion: 'En Producción',
  control_calidad: 'Control de Calidad',
  listo_despacho: 'Listo para Despacho',
  despachado: 'Despachado',
  completado: 'Completado',
};

export const PEDIDO_ESTADO_COLORS: Record<PedidoEstado, string> = {
  nuevo: 'bg-slate-100 text-slate-700 border-slate-300',
  en_revision: 'bg-info-100 text-info-700 border-info-500/30',
  viabilidad: 'bg-amber-100 text-amber-700 border-amber-500/30',
  aprobado: 'bg-brand-100 text-brand-700 border-brand-500/30',
  programado: 'bg-inplaz-100 text-inplaz-700 border-inplaz-500/30',
  en_produccion: 'bg-inplaz-100 text-inplaz-700 border-inplaz-500/30',
  control_calidad: 'bg-purple-100 text-purple-700 border-purple-500/30',
  listo_despacho: 'bg-brand-100 text-brand-700 border-brand-500/30',
  despachado: 'bg-brand-100 text-brand-700 border-brand-500/30',
  completado: 'bg-slate-100 text-slate-500 border-slate-300',
};

export const PRIORIDAD_LABELS: Record<Prioridad, string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

export const PRIORIDAD_COLORS: Record<Prioridad, string> = {
  critica: 'bg-danger-100 text-danger-700 border-danger-500/30',
  alta: 'bg-orange-100 text-orange-700 border-orange-500/30',
  media: 'bg-amber-100 text-amber-700 border-amber-500/30',
  baja: 'bg-brand-100 text-brand-700 border-brand-500/30',
};

export const PRIORIDAD_DOTS: Record<Prioridad, string> = {
  critica: 'bg-danger-500',
  alta: 'bg-orange-500',
  media: 'bg-amber-500',
  baja: 'bg-brand-500',
};

export const PRODUCCION_ESTADOS: ProduccionEstado[] = [
  'programado',
  'en_preparacion',
  'en_produccion',
  'pausado',
  'control_calidad',
  'finalizado',
];

export const PRODUCCION_ESTADO_LABELS: Record<ProduccionEstado, string> = {
  programado: 'Programado',
  en_preparacion: 'En Preparación',
  en_produccion: 'En Producción',
  pausado: 'Pausado',
  control_calidad: 'Control de Calidad',
  finalizado: 'Finalizado',
};

export const PRODUCCION_ESTADO_COLORS: Record<ProduccionEstado, string> = {
  programado: 'bg-slate-100 text-slate-700 border-slate-300',
  en_preparacion: 'bg-info-100 text-info-700 border-info-500/30',
  en_produccion: 'bg-inplaz-100 text-inplaz-700 border-inplaz-500/30',
  pausado: 'bg-amber-100 text-amber-700 border-amber-500/30',
  control_calidad: 'bg-purple-100 text-purple-700 border-purple-500/30',
  finalizado: 'bg-brand-100 text-brand-700 border-brand-500/30',
};

export const DESPACHO_ESTADOS: DespachoEstado[] = [
  'pendiente',
  'programado',
  'en_preparacion',
  'listo',
  'despachado',
  'entregado',
];

export const DESPACHO_ESTADO_LABELS: Record<DespachoEstado, string> = {
  pendiente: 'Pendiente',
  programado: 'Programado',
  en_preparacion: 'En Preparación',
  listo: 'Listo',
  despachado: 'Despachado',
  entregado: 'Entregado',
};

export const DESPACHO_ESTADO_COLORS: Record<DespachoEstado, string> = {
  pendiente: 'bg-slate-100 text-slate-700 border-slate-300',
  programado: 'bg-info-100 text-info-700 border-info-500/30',
  en_preparacion: 'bg-amber-100 text-amber-700 border-amber-500/30',
  listo: 'bg-brand-100 text-brand-700 border-brand-500/30',
  despachado: 'bg-inplaz-100 text-inplaz-700 border-inplaz-500/30',
  entregado: 'bg-brand-100 text-brand-700 border-brand-500/30',
};

export const OPORTUNIDAD_ESTADOS: OportunidadEstado[] = [
  'nuevo_lead',
  'contactado',
  'oportunidad',
  'cotizacion',
  'negociacion',
  'ganado',
  'perdido',
];

export const OPORTUNIDAD_ESTADO_LABELS: Record<OportunidadEstado, string> = {
  nuevo_lead: 'Nuevo Lead',
  contactado: 'Contactado',
  oportunidad: 'Oportunidad',
  cotizacion: 'Cotización',
  negociacion: 'Negociación',
  ganado: 'Ganado',
  perdido: 'Perdido',
};

export const COTIZACION_ESTADO_LABELS: Record<CotizacionEstado, string> = {
  borrador: 'Borrador',
  enviada: 'Enviada',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  convertida: 'Convertida',
};

export const COTIZACION_ESTADO_COLORS: Record<CotizacionEstado, string> = {
  borrador: 'bg-slate-100 text-slate-700 border-slate-300',
  enviada: 'bg-info-100 text-info-700 border-info-500/30',
  aprobada: 'bg-brand-100 text-brand-700 border-brand-500/30',
  rechazada: 'bg-danger-100 text-danger-700 border-danger-500/30',
  convertida: 'bg-inplaz-100 text-inplaz-700 border-inplaz-500/30',
};

export const MAQUINA_ESTADO_LABELS: Record<MaquinaEstado, string> = {
  disponible: 'Disponible',
  en_produccion: 'En Producción',
  mantenimiento: 'Mantenimiento',
  fuera_servicio: 'Fuera de Servicio',
};

export const MAQUINA_ESTADO_COLORS: Record<MaquinaEstado, string> = {
  disponible: 'bg-brand-100 text-brand-700 border-brand-500/30',
  en_produccion: 'bg-inplaz-100 text-inplaz-700 border-inplaz-500/30',
  mantenimiento: 'bg-amber-100 text-amber-700 border-amber-500/30',
  fuera_servicio: 'bg-danger-100 text-danger-700 border-danger-500/30',
};

export const MAQUINA_ESTADO_DOTS: Record<MaquinaEstado, string> = {
  disponible: 'bg-brand-500',
  en_produccion: 'bg-inplaz-500',
  mantenimiento: 'bg-amber-500',
  fuera_servicio: 'bg-danger-500',
};

export const VIABILIDAD_LABELS: Record<ViabilidadResultado, string> = {
  viable: 'VIABLE',
  no_viable: 'NO VIABLE',
  requiere_revision: 'REQUIERE REVISIÓN',
};

export const ROLE_LABELS: Record<Role, string> = {
  administrador: 'Administrador',
  comercial: 'Comercial',
  produccion: 'Producción',
  operador: 'Operador',
  supervisor: 'Supervisor',
  viabilidad: 'Viabilidad',
  despacho: 'Despacho',
};

export const ETIQUETA_LABELS: Record<Etiqueta, string> = {
  urgente: 'Urgente',
  cliente_nuevo: 'Cliente Nuevo',
  retrasado: 'Retrasado',
  viabilidad: 'Viabilidad',
  produccion: 'Producción',
  despacho: 'Despacho',
  comercial: 'Comercial',
  incidencia: 'Incidencia',
};

export const ETIQUETA_COLORS: Record<Etiqueta, string> = {
  urgente: 'bg-danger-100 text-danger-700',
  cliente_nuevo: 'bg-inplaz-100 text-inplaz-700',
  retrasado: 'bg-orange-100 text-orange-700',
  viabilidad: 'bg-amber-100 text-amber-700',
  produccion: 'bg-inplaz-100 text-inplaz-700',
  despacho: 'bg-brand-100 text-brand-700',
  comercial: 'bg-purple-100 text-purple-700',
  incidencia: 'bg-danger-100 text-danger-700',
};

export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard', roles: ['*'] as const },
  { key: 'pedidos', label: 'Pedidos', icon: 'ClipboardList', path: '/pedidos', roles: ['*'] as const },
  { key: 'clientes', label: 'Clientes', icon: 'Users', path: '/clientes', roles: ['*'] as const },
  { key: 'productos', label: 'Productos', icon: 'Package', path: '/productos', roles: ['*'] as const },
  { key: 'viabilidad', label: 'Viabilidad', icon: 'ShieldCheck', path: '/viabilidad', roles: ['*'] as const },
  { key: 'produccion', label: 'Producción', icon: 'Factory', path: '/produccion', roles: ['*'] as const },
  { key: 'maquinas', label: 'Máquinas', icon: 'Cpu', path: '/maquinas', roles: ['*'] as const },
  { key: 'despachos', label: 'Despachos', icon: 'Truck', path: '/despachos', roles: ['*'] as const },
  { key: 'comercial', label: 'Comercial', icon: 'TrendingUp', path: '/comercial', roles: ['*'] as const },
  { key: 'reportes', label: 'Reportes', icon: 'BarChart3', path: '/reportes', roles: ['*'] as const },
  { key: 'admin', label: 'Administración', icon: 'Settings', path: '/admin', roles: ['administrador'] as const },
] as const;
