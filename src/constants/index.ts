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
  nuevo: 'bg-muted text-muted-foreground border-border',
  en_revision: 'bg-info/10 text-info border-info/20',
  viabilidad: 'bg-warning/10 text-warning border-warning/20',
  aprobado: 'bg-accent text-accent-foreground border-accent/20',
  programado: 'bg-sidebar/10 text-sidebar-foreground border-sidebar/20',
  en_produccion: 'bg-sidebar/10 text-sidebar-foreground border-sidebar/20',
  control_calidad: 'bg-secondary text-secondary-foreground border-secondary/20',
  listo_despacho: 'bg-accent text-accent-foreground border-accent/20',
  despachado: 'bg-accent text-accent-foreground border-accent/20',
  completado: 'bg-muted text-muted-foreground border-border',
};

export const PRIORIDAD_LABELS: Record<Prioridad, string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

export const PRIORIDAD_COLORS: Record<Prioridad, string> = {
  critica: 'bg-destructive/10 text-destructive border-destructive/20',
  alta: 'bg-warning/10 text-warning border-warning/20',
  media: 'bg-warning/10 text-warning border-warning/20',
  baja: 'bg-accent text-accent-foreground border-accent/20',
};

export const PRIORIDAD_DOTS: Record<Prioridad, string> = {
  critica: 'bg-destructive',
  alta: 'bg-warning',
  media: 'bg-warning',
  baja: 'bg-success',
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
  programado: 'bg-muted text-muted-foreground border-border',
  en_preparacion: 'bg-info/10 text-info border-info/20',
  en_produccion: 'bg-sidebar/10 text-sidebar-foreground border-sidebar/20',
  pausado: 'bg-warning/10 text-warning border-warning/20',
  control_calidad: 'bg-secondary text-secondary-foreground border-secondary/20',
  finalizado: 'bg-accent text-accent-foreground border-accent/20',
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
  pendiente: 'bg-muted text-muted-foreground border-border',
  programado: 'bg-info/10 text-info border-info/20',
  en_preparacion: 'bg-warning/10 text-warning border-warning/20',
  listo: 'bg-accent text-accent-foreground border-accent/20',
  despachado: 'bg-sidebar/10 text-sidebar-foreground border-sidebar/20',
  entregado: 'bg-accent text-accent-foreground border-accent/20',
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
  borrador: 'bg-muted text-muted-foreground border-border',
  enviada: 'bg-info/10 text-info border-info/20',
  aprobada: 'bg-accent text-accent-foreground border-accent/20',
  rechazada: 'bg-destructive/10 text-destructive border-destructive/20',
  convertida: 'bg-sidebar/10 text-sidebar-foreground border-sidebar/20',
};

export const MAQUINA_ESTADO_LABELS: Record<MaquinaEstado, string> = {
  disponible: 'Disponible',
  en_produccion: 'En Producción',
  mantenimiento: 'Mantenimiento',
  fuera_servicio: 'Fuera de Servicio',
};

export const MAQUINA_ESTADO_COLORS: Record<MaquinaEstado, string> = {
  disponible: 'bg-accent text-accent-foreground border-accent/20',
  en_produccion: 'bg-sidebar/10 text-sidebar-foreground border-sidebar/20',
  mantenimiento: 'bg-warning/10 text-warning border-warning/20',
  fuera_servicio: 'bg-destructive/10 text-destructive border-destructive/20',
};

export const MAQUINA_ESTADO_DOTS: Record<MaquinaEstado, string> = {
  disponible: 'bg-success',
  en_produccion: 'bg-sidebar-active',
  mantenimiento: 'bg-warning',
  fuera_servicio: 'bg-destructive',
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
  urgente: 'bg-destructive/10 text-destructive',
  cliente_nuevo: 'bg-sidebar/10 text-sidebar-foreground',
  retrasado: 'bg-warning/10 text-warning',
  viabilidad: 'bg-warning/10 text-warning',
  produccion: 'bg-sidebar/10 text-sidebar-foreground',
  despacho: 'bg-accent text-accent-foreground',
  comercial: 'bg-secondary text-secondary-foreground',
  incidencia: 'bg-destructive/10 text-destructive',
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
