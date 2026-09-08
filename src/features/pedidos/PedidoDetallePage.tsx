import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, FileText, AlertTriangle, Clock, CheckCircle2, XCircle,
  User, Package, Calendar, Settings as SettingsIcon, MessageSquare,
} from 'lucide-react';
import { pedidosApi } from '@/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, PriorityBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  PEDIDO_ESTADOS, PEDIDO_ESTADO_LABELS, PEDIDO_ESTADO_COLORS,
  PRIORIDAD_LABELS, PRIORIDAD_COLORS, PRIORIDAD_DOTS,
} from '@/constants';
import { formatNumber, formatDate, formatDateTime, cn } from '@/utils';
import type { PedidoEstado } from '@/types';

export function PedidoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState('timeline');

  const { data: pedido, isLoading } = useQuery({
    queryKey: ['pedido', id],
    queryFn: () => pedidosApi.get(id!),
    enabled: !!id,
  });
  const { data: timeline = [] } = useQuery({
    queryKey: ['pedido-timeline', id],
    queryFn: () => pedidosApi.timeline(id!),
    enabled: !!id,
  });
  const { data: incidencias = [] } = useQuery({
    queryKey: ['pedido-incidencias', id],
    queryFn: () => pedidosApi.incidencias(id!),
    enabled: !!id,
  });
  const { data: documentos = [] } = useQuery({
    queryKey: ['pedido-documentos', id],
    queryFn: () => pedidosApi.documentos(id!),
    enabled: !!id,
  });

  if (isLoading) return <LoadingState message="Cargando pedido..." />;
  if (!pedido) return <EmptyState title="Pedido no encontrado" description="El pedido solicitado no existe." />;

  const estadoIndex = PEDIDO_ESTADOS.indexOf(pedido.estado as PedidoEstado);

  return (
    <div>
      <PageHeader
        title={pedido.numero}
        subtitle={`${pedido.clienteNombre} · ${pedido.productoNombre}`}
        breadcrumb={[
          { label: 'Pedidos', onClick: () => navigate('/pedidos') },
          { label: pedido.numero },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/pedidos')}><ArrowLeft className="h-4 w-4" /> Volver</Button>
            {pedido.estado === 'aprobado' && <Button><SettingsIcon className="h-4 w-4" /> Programar producción</Button>}
            {pedido.estado === 'viabilidad' && <Button variant="secondary" onClick={() => navigate('/viabilidad')}><CheckCircle2 className="h-4 w-4" /> Ver viabilidad</Button>}
          </>
        }
      />

      {/* Header card */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-wrap items-center gap-4">
            <Badge className={PEDIDO_ESTADO_COLORS[pedido.estado]}>{PEDIDO_ESTADO_LABELS[pedido.estado]}</Badge>
            <PriorityBadge label={PRIORIDAD_LABELS[pedido.prioridad]} dotClass={PRIORIDAD_DOTS[pedido.prioridad]} colorClass={PRIORIDAD_COLORS[pedido.prioridad]} />
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Avatar name={pedido.responsableNombre} size="sm" />
              {pedido.responsableNombre}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Calendar className="h-4 w-4" /> Creado: {formatDate(pedido.fechaCreacion)}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Calendar className="h-4 w-4" /> Entrega: {formatDate(pedido.fechaComprometida)}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Timeline visual */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Flujo del pedido</CardTitle></CardHeader>
        <CardBody>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {PEDIDO_ESTADOS.map((estado, i) => (
              <div key={estado} className="flex items-center gap-1 shrink-0">
                <div className={cn(
                  'flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg border min-w-[100px]',
                  i <= estadoIndex ? 'bg-brand-50 border-brand-300' : 'bg-slate-50 border-slate-200',
                )}>
                  <div className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold',
                    i < estadoIndex ? 'bg-brand-600 text-white' : i === estadoIndex ? 'bg-inplaz-600 text-white' : 'bg-slate-200 text-slate-400',
                  )}>
                    {i < estadoIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={cn('text-xs text-center', i <= estadoIndex ? 'text-slate-700 font-medium' : 'text-slate-400')}>
                    {PEDIDO_ESTADO_LABELS[estado]}
                  </span>
                </div>
                {i < PEDIDO_ESTADOS.length - 1 && <div className={cn('h-0.5 w-4', i < estadoIndex ? 'bg-brand-400' : 'bg-slate-200')} />}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info */}
        <div>
          <Card>
            <CardHeader><CardTitle>Información general</CardTitle></CardHeader>
            <CardBody className="space-y-3 text-sm">
              <InfoRow icon={<User className="h-4 w-4" />} label="Cliente" value={pedido.clienteNombre} />
              <InfoRow icon={<Package className="h-4 w-4" />} label="Producto" value={pedido.productoNombre} />
              <InfoRow label="Cantidad" value={`${formatNumber(pedido.cantidad)} unidades`} />
              <InfoRow label="Dimensiones" value={pedido.dimensiones} />
              <InfoRow label="Material" value={pedido.material} />
              <InfoRow label="Micraje" value={`${pedido.micraje} µm`} />
              <InfoRow label="Impresión" value={pedido.impresion} />
              <InfoRow label="Acabado" value={pedido.acabado} />
              <InfoRow label="Máquina" value={pedido.maquinaNombre ?? 'Sin asignar'} />
              {pedido.observaciones && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Observaciones</p>
                  <p className="text-sm text-slate-700">{pedido.observaciones}</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right: Tabs */}
        <div className="lg:col-span-2">
          <Tabs
            active={tab}
            onChange={setTab}
            tabs={[
              { key: 'timeline', label: 'Línea de tiempo', icon: <Clock className="h-4 w-4" />, count: timeline.length },
              { key: 'documentos', label: 'Documentos', icon: <FileText className="h-4 w-4" />, count: documentos.length },
              { key: 'incidencias', label: 'Incidencias', icon: <AlertTriangle className="h-4 w-4" />, count: incidencias.length },
            ]}
          />

          <Card className="mt-4">
            <CardBody>
              {tab === 'timeline' && (
                <div className="space-y-4">
                  {timeline.map((e, i) => (
                    <div key={e.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-inplaz-100 flex items-center justify-center shrink-0">
                          <MessageSquare className="h-4 w-4 text-inplaz-600" />
                        </div>
                        {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 my-1" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm text-slate-700"><span className="font-medium">{e.usuario}</span> {e.accion.toLowerCase()}</p>
                        {e.comentario && <p className="text-sm text-slate-500 mt-0.5">{e.comentario}</p>}
                        <p className="text-xs text-slate-400 mt-1">{formatDateTime(e.fecha)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'documentos' && (
                documentos.length === 0 ? <EmptyState title="Sin documentos" /> : (
                  <div className="space-y-2">
                    {documentos.map(d => (
                      <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
                        <FileText className="h-5 w-5 text-slate-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700">{d.nombre}</p>
                          <p className="text-xs text-slate-400">{formatDate(d.fecha)}</p>
                        </div>
                        <Badge className="bg-slate-100 text-slate-600 border-slate-200">{d.tipo.replace('_', ' ')}</Badge>
                      </div>
                    ))}
                  </div>
                )
              )}

              {tab === 'incidencias' && (
                incidencias.length === 0 ? <EmptyState title="Sin incidencias" icon={<CheckCircle2 className="h-6 w-6" />} /> : (
                  <div className="space-y-3">
                    {incidencias.map(inc => (
                      <div key={inc.id} className={cn(
                        'p-3 rounded-lg border',
                        inc.resuelta ? 'bg-brand-50 border-brand-200' : 'bg-danger-50 border-danger-200',
                      )}>
                        <div className="flex items-start gap-3">
                          {inc.resuelta ? <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0" /> : <XCircle className="h-5 w-5 text-danger-600 shrink-0" />}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={inc.severidad === 'alta' ? 'bg-danger-100 text-danger-700 border-danger-300' : 'bg-amber-100 text-amber-700 border-amber-300'}>
                                {inc.severidad}
                              </Badge>
                              <span className="text-xs text-slate-400">{formatDateTime(inc.fecha)}</span>
                            </div>
                            <p className="text-sm text-slate-700">{inc.descripcion}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-500 flex items-center gap-1.5">{icon}{label}</span>
      <span className="text-slate-700 font-medium text-right">{value}</span>
    </div>
  );
}
