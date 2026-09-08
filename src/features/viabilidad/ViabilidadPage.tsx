import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, ShieldX, CheckCircle2, AlertTriangle, XCircle, Play } from 'lucide-react';
import { pedidosApi, viabilidadApi } from '@/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { PEDIDO_ESTADO_LABELS, PEDIDO_ESTADO_COLORS, VIABILIDAD_LABELS } from '@/constants';
import { cn, formatNumber, formatDateTime } from '@/utils';
import type { ViabilidadResultado } from '@/types';

export function ViabilidadPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['pedidos'],
    queryFn: pedidosApi.list,
  });

  const viabilidadPedidos = pedidos.filter(p => p.estado === 'viabilidad' || p.estado === 'en_revision' || p.estado === 'nuevo');

  const { data: viabilidad } = useQuery({
    queryKey: ['viabilidad', viabilidadPedidos[0]?.id],
    queryFn: () => viabilidadApi.getByPedido(viabilidadPedidos[0]?.id ?? ''),
    enabled: !!viabilidadPedidos[0]?.id,
  });

  const ejecutar = async (pedidoId: string) => {
    await viabilidadApi.ejecutar(pedidoId);
    queryClient.invalidateQueries({ queryKey: ['viabilidad'] });
  };

  if (isLoading) return <LoadingState message="Cargando viabilidad..." />;

  const resultadoConfig: Record<ViabilidadResultado, { icon: React.ReactNode; bg: string; text: string; border: string }> = {
    viable: { icon: <ShieldCheck className="h-10 w-10" />, bg: 'bg-brand-50', text: 'text-brand-700', border: 'border-brand-300' },
    no_viable: { icon: <ShieldX className="h-10 w-10" />, bg: 'bg-danger-50', text: 'text-danger-700', border: 'border-danger-300' },
    requiere_revision: { icon: <ShieldAlert className="h-10 w-10" />, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
  };

  const reglaIcon = (r: string) => r === 'ok' ? <CheckCircle2 className="h-5 w-5 text-brand-600" /> : r === 'warn' ? <AlertTriangle className="h-5 w-5 text-amber-500" /> : <XCircle className="h-5 w-5 text-danger-600" />;

  return (
    <div>
      <PageHeader title="Viabilidad" subtitle="Análisis técnico de pedidos" breadcrumb={[{ label: 'Viabilidad' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de pedidos */}
        <div>
          <Card>
            <CardHeader><CardTitle>Pedidos por evaluar</CardTitle></CardHeader>
            <div className="divide-y divide-slate-100">
              {viabilidadPedidos.length === 0 ? (
                <EmptyState title="Sin pedidos pendientes" />
              ) : viabilidadPedidos.map(p => (
                <div key={p.id} onClick={() => navigate(`/pedidos/${p.id}`)} className="p-4 hover:bg-slate-50 cursor-pointer transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800 text-sm">{p.numero}</span>
                    <Badge className={PEDIDO_ESTADO_COLORS[p.estado]}>{PEDIDO_ESTADO_LABELS[p.estado]}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{p.clienteNombre}</p>
                  <p className="text-xs text-slate-500 mt-1">{p.productoNombre} · {formatNumber(p.cantidad)}</p>
                  <Button size="sm" className="mt-2 w-full" onClick={(e) => { e.stopPropagation(); ejecutar(p.id); }}>
                    <Play className="h-3 w-3" /> Ejecutar viabilidad
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Resultado */}
        <div className="lg:col-span-2">
          {viabilidad ? (
            <>
              {/* Resultado principal */}
              <Card className={cn('border-2', resultadoConfig[viabilidad.resultado].border)}>
                <CardBody className="text-center py-8">
                  <div className={cn('h-20 w-20 rounded-full mx-auto flex items-center justify-center', resultadoConfig[viabilidad.resultado].bg)}>
                    <span className={resultadoConfig[viabilidad.resultado].text}>{resultadoConfig[viabilidad.resultado].icon}</span>
                  </div>
                  <h2 className={cn('text-2xl font-bold mt-4', resultadoConfig[viabilidad.resultado].text)}>
                    PEDIDO {VIABILIDAD_LABELS[viabilidad.resultado]}
                  </h2>
                  <p className="text-sm text-slate-500 mt-2">
                    {viabilidad.resultado === 'viable' && 'El pedido puede ser producido bajo las condiciones actuales.'}
                    {viabilidad.resultado === 'no_viable' && 'El pedido no puede ser producido con las máquinas disponibles.'}
                    {viabilidad.resultado === 'requiere_revision' && 'El pedido requiere revisión manual antes de aprobar.'}
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-500">
                    <span>Evaluado por: <span className="font-medium text-slate-700">{viabilidad.usuario}</span></span>
                    <span>{formatDateTime(viabilidad.fecha)}</span>
                  </div>
                </CardBody>
              </Card>

              {/* Máquinas compatibles */}
              <Card className="mt-4">
                <CardHeader><CardTitle>Máquinas compatibles</CardTitle></CardHeader>
                <CardBody>
                  <div className="flex flex-wrap gap-2">
                    {viabilidad.maquinasCompatibles.map(m => (
                      <Badge key={m} className="bg-inplaz-100 text-inplaz-700 border-inplaz-300">{m}</Badge>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 mt-3">Tiempo estimado: <span className="font-medium text-slate-700">{viabilidad.tiempoEstimado}</span></p>
                </CardBody>
              </Card>

              {/* Reglas evaluadas */}
              <Card className="mt-4">
                <CardHeader><CardTitle>Reglas evaluadas</CardTitle></CardHeader>
                <CardBody className="space-y-3">
                  {viabilidad.reglas.map(regla => (
                    <div key={regla.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200">
                      <span className="mt-0.5">{reglaIcon(regla.resultado)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">{regla.nombre}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                          <span>Evaluado: <span className="text-slate-700 font-medium">{regla.valorEvaluado}</span></span>
                          <span>Requerido: <span className="text-slate-700 font-medium">{regla.valorRequerido}</span></span>
                        </div>
                        {regla.observacion && <p className="text-xs text-amber-600 mt-1">{regla.observacion}</p>}
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </>
          ) : (
            <Card><EmptyState title="Seleccione un pedido" description="Elija un pedido de la lista para ver su resultado de viabilidad." icon={<ShieldCheck className="h-6 w-6" />} /></Card>
          )}
        </div>
      </div>
    </div>
  );
}
