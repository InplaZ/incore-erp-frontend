import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, ShieldCheck, CheckCircle2, Factory, AlertTriangle,
  Truck, Clock, ArrowRight, Activity as ActivityIcon,
} from 'lucide-react';
import { pedidosApi, actividadApi, tareasApi } from '@/api';
import { KpiCard } from '@/components/ui/ProgressBar';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/States';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, PriorityBadge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  PEDIDO_ESTADO_LABELS, PEDIDO_ESTADO_COLORS, PRIORIDAD_LABELS,
  PRIORIDAD_COLORS, PRIORIDAD_DOTS,
} from '@/constants';
import { timeAgo, formatNumber } from '@/utils';
import type { Pedido, Prioridad } from '@/types';

export function DashboardPage() {
  const navigate = useNavigate();

  const { data: pedidos = [], isLoading: loadingPedidos } = useQuery({
    queryKey: ['pedidos'],
    queryFn: pedidosApi.list,
  });
  const { data: actividades = [] } = useQuery({
    queryKey: ['actividades'],
    queryFn: actividadApi.list,
  });
  const { data: tareas = [] } = useQuery({
    queryKey: ['tareas'],
    queryFn: tareasApi.list,
  });

  const countByEstado = (estado: string) => pedidos.filter(p => p.estado === estado).length;

  const kpis = [
    { label: 'Pendientes', value: countByEstado('nuevo') + countByEstado('en_revision'), icon: <ClipboardList className="h-5 w-5" />, color: 'bg-slate-100 text-slate-600' },
    { label: 'En Viabilidad', value: countByEstado('viabilidad'), icon: <ShieldCheck className="h-5 w-5" />, color: 'bg-amber-100 text-amber-600' },
    { label: 'Aprobados', value: countByEstado('aprobado'), icon: <CheckCircle2 className="h-5 w-5" />, color: 'bg-brand-100 text-brand-600' },
    { label: 'En Producción', value: countByEstado('en_produccion'), icon: <Factory className="h-5 w-5" />, color: 'bg-inplaz-100 text-inplaz-600' },
    { label: 'Retrasados', value: pedidos.filter(p => p.etiquetas.includes('retrasado')).length, icon: <AlertTriangle className="h-5 w-5" />, color: 'bg-danger-100 text-danger-600' },
    { label: 'Listos Despacho', value: countByEstado('listo_despacho'), icon: <Truck className="h-5 w-5" />, color: 'bg-brand-100 text-brand-600' },
  ];

  const vencimientoLabel = { urgente: 'URGENTE', hoy: 'HOY', en_espera: 'EN ESPERA' } as const;
  const vencimientoColor = {
    urgente: 'bg-danger-100 text-danger-700',
    hoy: 'bg-amber-100 text-amber-700',
    en_espera: 'bg-slate-100 text-slate-600',
  } as const;

  if (loadingPedidos) return <LoadingState message="Cargando dashboard..." />;

  return (
    <div>
      <PageHeader title="Dashboard Operativo" subtitle="Resumen general del estado de operaciones" />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {kpis.map(kpi => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} colorClass={kpi.color} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pedidos recientes</CardTitle>
                <button onClick={() => navigate('/pedidos')} className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                  Ver todos <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </CardHeader>
            <div className="divide-y divide-slate-100">
              {pedidos.slice(0, 6).map((p: Pedido) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/pedidos/${p.id}`)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 cursor-pointer transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">{p.numero}</span>
                      <PriorityBadge
                        label={PRIORIDAD_LABELS[p.prioridad]}
                        dotClass={PRIORIDAD_DOTS[p.prioridad]}
                        colorClass={PRIORIDAD_COLORS[p.prioridad]}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{p.clienteNombre} · {p.productoNombre} · {formatNumber(p.cantidad)}</p>
                  </div>
                  <Badge className={PEDIDO_ESTADO_COLORS[p.estado]}>{PEDIDO_ESTADO_LABELS[p.estado]}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Activity feed */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ActivityIcon className="h-4 w-4 text-slate-400" />
                <CardTitle>Actividad reciente</CardTitle>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {actividades.slice(0, 7).map(a => (
                <div key={a.id} className="flex items-start gap-3">
                  <Avatar name={a.usuario} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">{a.usuario}</span>{' '}
                      <span className="text-slate-500">{a.accion}</span>{' '}
                      <span className="font-medium text-inplaz-700">{a.entidad}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{timeAgo(a.fecha)}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* My work */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <CardTitle>Mis tareas</CardTitle>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {tareas.map(t => (
                <div
                  key={t.id}
                  onClick={() => navigate('/pedidos')}
                  className="p-3 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50/30 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge className={vencimientoColor[t.vencimiento]}>{vencimientoLabel[t.vencimiento]}</Badge>
                    <PriorityBadge
                      label={PRIORIDAD_LABELS[t.prioridad as Prioridad]}
                      dotClass={PRIORIDAD_DOTS[t.prioridad as Prioridad]}
                      colorClass={PRIORIDAD_COLORS[t.prioridad as Prioridad]}
                    />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{t.pedidoNumero}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.titulo}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
