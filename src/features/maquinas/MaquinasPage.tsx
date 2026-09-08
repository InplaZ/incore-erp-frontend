import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Cpu, ArrowRight, Wrench } from 'lucide-react';
import { maquinasApi } from '@/api';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { MAQUINA_ESTADO_LABELS, MAQUINA_ESTADO_COLORS, MAQUINA_ESTADO_DOTS } from '@/constants';
import { cn } from '@/utils';
import type { MaquinaEstado } from '@/types';

export function MaquinasPage() {
  const navigate = useNavigate();
  const { data: maquinas = [], isLoading } = useQuery({
    queryKey: ['maquinas'],
    queryFn: maquinasApi.list,
  });

  if (isLoading) return <LoadingState message="Cargando máquinas..." />;

  return (
    <div>
      <PageHeader title="Máquinas" subtitle={`${maquinas.length} máquinas registradas`} breadcrumb={[{ label: 'Máquinas' }]} />

      {maquinas.length === 0 ? (
        <Card><EmptyState title="Sin máquinas" icon={<Cpu className="h-6 w-6" />} /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {maquinas.map(m => (
            <Card key={m.id} hover onClick={() => navigate(`/maquinas/${m.id}`)}>
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('h-11 w-11 rounded-lg flex items-center justify-center', m.estado === 'disponible' ? 'bg-brand-100' : m.estado === 'en_produccion' ? 'bg-inplaz-100' : m.estado === 'mantenimiento' ? 'bg-amber-100' : 'bg-danger-100')}>
                      <Cpu className={cn('h-5 w-5', m.estado === 'disponible' ? 'text-brand-600' : m.estado === 'en_produccion' ? 'text-inplaz-600' : m.estado === 'mantenimiento' ? 'text-amber-600' : 'text-danger-600')} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{m.codigo}</p>
                      <p className="text-xs text-slate-500">{m.tipo}</p>
                    </div>
                  </div>
                  <Badge className={MAQUINA_ESTADO_COLORS[m.estado as MaquinaEstado]}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', MAQUINA_ESTADO_DOTS[m.estado as MaquinaEstado])} />
                    {MAQUINA_ESTADO_LABELS[m.estado as MaquinaEstado]}
                  </Badge>
                </div>

                <p className="text-sm text-slate-600 mb-2">{m.nombre}</p>

                {m.pedidoActual && (
                  <div className="mb-3 p-2 rounded-lg bg-inplaz-50 border border-inplaz-100">
                    <p className="text-xs text-inplaz-700">Pedido actual: <span className="font-semibold">{m.pedidoActual}</span></p>
                  </div>
                )}

                {m.mantenimiento && (
                  <div className="mb-3 p-2 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-2">
                    <Wrench className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">{m.mantenimiento}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Capacidad actual</span>
                    <span className="font-medium text-slate-700">{m.capacidadActual}%</span>
                  </div>
                  <ProgressBar value={m.capacidadActual} colorClass={m.capacidadActual > 80 ? 'bg-danger-500' : m.capacidadActual > 50 ? 'bg-amber-500' : 'bg-brand-500'} />
                  <p className="text-xs text-slate-500">Pedidos compatibles: <span className="font-medium text-slate-700">{m.productosCompatibles.filter(p => p.compatible).length}</span></p>
                </div>

                <button onClick={(e) => { e.stopPropagation(); navigate(`/maquinas/${m.id}`); }} className="w-full mt-4 flex items-center justify-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium transition">
                  Ver máquina <ArrowRight className="h-4 w-4" />
                </button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
