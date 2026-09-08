import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Cpu, CheckCircle2, XCircle, AlertTriangle, Wrench, Settings } from 'lucide-react';
import { maquinasApi } from '@/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { MAQUINA_ESTADO_LABELS, MAQUINA_ESTADO_COLORS, MAQUINA_ESTADO_DOTS } from '@/constants';
import { cn } from '@/utils';
import type { MaquinaEstado } from '@/types';

export function MaquinaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: maquina, isLoading } = useQuery({
    queryKey: ['maquina', id],
    queryFn: () => maquinasApi.get(id!),
    enabled: !!id,
  });

  if (isLoading) return <LoadingState message="Cargando máquina..." />;
  if (!maquina) return <EmptyState title="Máquina no encontrada" />;

  return (
    <div>
      <PageHeader
        title={`${maquina.codigo} · ${maquina.nombre}`}
        subtitle={maquina.tipo}
        breadcrumb={[{ label: 'Máquinas', onClick: () => navigate('/maquinas') }, { label: maquina.codigo }]}
        actions={<Button variant="outline" onClick={() => navigate('/maquinas')}><ArrowLeft className="h-4 w-4" /> Volver</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div>
          <Card>
            <CardHeader><CardTitle>Información general</CardTitle></CardHeader>
            <CardBody className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estado</span>
                <Badge className={MAQUINA_ESTADO_COLORS[maquina.estado as MaquinaEstado]}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', MAQUINA_ESTADO_DOTS[maquina.estado as MaquinaEstado])} />
                  {MAQUINA_ESTADO_LABELS[maquina.estado as MaquinaEstado]}
                </Badge>
              </div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Código</span><span className="font-medium text-slate-700">{maquina.codigo}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Tipo</span><span className="font-medium text-slate-700">{maquina.tipo}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Capacidad</span><span className="font-medium text-slate-700">{maquina.capacidad}%</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Pedido actual</span><span className="font-medium text-slate-700">{maquina.pedidoActual ?? '—'}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Rodillos</span><span className="font-medium text-slate-700">{maquina.rodillos.join(', ')}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Rango micraje</span><span className="font-medium text-slate-700">{maquina.rangos.min} - {maquina.rangos.max} µm</span></div>
            </CardBody>
          </Card>

          <Card className="mt-4">
            <CardHeader><CardTitle>Capacidad</CardTitle></CardHeader>
            <CardBody>
              <ProgressBar value={maquina.capacidadActual} colorClass={maquina.capacidadActual > 80 ? 'bg-danger-500' : maquina.capacidadActual > 50 ? 'bg-amber-500' : 'bg-brand-500'} showLabel />
              {maquina.mantenimiento && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                  <Wrench className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">{maquina.mantenimiento}</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Compatibilidad */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Compatibilidad de productos</CardTitle></CardHeader>
            <CardBody>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="text-left py-2 font-medium">Producto</th>
                  <th className="text-center py-2 font-medium">Compatible</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {maquina.productosCompatibles.map(p => (
                    <tr key={p.producto} className="hover:bg-slate-50">
                      <td className="py-3 text-slate-700">{p.producto}</td>
                      <td className="py-3 text-center">
                        {p.compatible ? (
                          <span className="inline-flex items-center gap-1 text-brand-600 font-medium text-xs"><CheckCircle2 className="h-4 w-4" /> Sí</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-danger-600 font-medium text-xs"><XCircle className="h-4 w-4" /> No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>

          <Card className="mt-4">
            <CardHeader><CardTitle>Especificaciones técnicas</CardTitle></CardHeader>
            <CardBody className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-500 text-xs">Rodillos instalados</p><p className="font-medium text-slate-700 mt-1">{maquina.rodillos.join(', ')}</p></div>
              <div><p className="text-slate-500 text-xs">Rango de micraje</p><p className="font-medium text-slate-700 mt-1">{maquina.rangos.min} - {maquina.rangos.max} µm</p></div>
              <div><p className="text-slate-500 text-xs">Capacidad máxima</p><p className="font-medium text-slate-700 mt-1">{maquina.capacidad}%</p></div>
              <div><p className="text-slate-500 text-xs">Uso actual</p><p className="font-medium text-slate-700 mt-1">{maquina.capacidadActual}%</p></div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
