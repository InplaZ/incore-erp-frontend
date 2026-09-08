import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DragDropContext, Droppable, Draggable, type DropResult,
} from '@hello-pangea/dnd';
import { TrendingUp, DollarSign, Users, Target, Plus, FileText, Send, CheckCircle2, XCircle, Copy, ArrowRight } from 'lucide-react';
import { comercialApi } from '@/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { KpiCard, ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  OPORTUNIDAD_ESTADOS, OPORTUNIDAD_ESTADO_LABELS,
  COTIZACION_ESTADO_LABELS, COTIZACION_ESTADO_COLORS,
} from '@/constants';
import { formatCurrency, formatDate, cn } from '@/utils';
import type { Cotizacion, OportunidadEstado } from '@/types';

export function ComercialPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('pipeline');
  const [cotModalOpen, setCotModalOpen] = useState(false);
  const [cotForm, setCotForm] = useState<Partial<Cotizacion>>({});

  const { data: oportunidades = [], isLoading: loadingOport } = useQuery({
    queryKey: ['oportunidades'],
    queryFn: comercialApi.oportunidades,
  });
  const { data: cotizaciones = [], isLoading: loadingCot } = useQuery({
    queryKey: ['cotizaciones'],
    queryFn: comercialApi.cotizaciones,
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    queryClient.invalidateQueries({ queryKey: ['oportunidades'] });
  };

  const crearCotizacion = async () => {
    await comercialApi.crearCotizacion(cotForm);
    setCotModalOpen(false);
    setCotForm({});
    queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
  };

  const totalVentas = cotizaciones.filter(c => c.estado === 'convertida' || c.estado === 'aprobada').reduce((s, c) => s + c.monto, 0);
  const ganadas = oportunidades.filter(o => o.estado === 'ganado').length;
  const perdidas = oportunidades.filter(o => o.estado === 'perdido').length;

  if (loadingOport || loadingCot) return <LoadingState message="Cargando comercial..." />;

  return (
    <div>
      <PageHeader
        title="Comercial"
        subtitle="CRM · Pipeline · Cotizaciones"
        actions={<Button onClick={() => setCotModalOpen(true)}><Plus className="h-4 w-4" /> Nueva cotización</Button>}
        breadcrumb={[{ label: 'Comercial' }]}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Oportunidades" value={oportunidades.length} icon={<Target className="h-5 w-5" />} colorClass="bg-inplaz-100 text-inplaz-600" />
        <KpiCard label="Cotizaciones" value={cotizaciones.length} icon={<FileText className="h-5 w-5" />} colorClass="bg-amber-100 text-amber-600" />
        <KpiCard label="Ganadas" value={ganadas} icon={<TrendingUp className="h-5 w-5" />} colorClass="bg-brand-100 text-brand-600" />
        <KpiCard label="Ventas" value={formatCurrency(totalVentas)} icon={<DollarSign className="h-5 w-5" />} colorClass="bg-brand-100 text-brand-600" />
      </div>

      <Tabs active={tab} onChange={setTab} tabs={[{ key: 'pipeline', label: 'Pipeline' }, { key: 'cotizaciones', label: 'Cotizaciones', count: cotizaciones.length }]} />

      {tab === 'pipeline' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-3 overflow-x-auto pb-4 mt-4">
            {OPORTUNIDAD_ESTADOS.map(estado => {
              const items = oportunidades.filter(o => o.estado === estado);
              return (
                <Droppable key={estado} droppableId={estado}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="w-64 shrink-0">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-xs font-semibold text-slate-600">{OPORTUNIDAD_ESTADO_LABELS[estado as OportunidadEstado]}</span>
                        <span className="text-xs text-slate-400 font-medium">{items.length}</span>
                      </div>
                      <div className="space-y-2 min-h-[100px] bg-slate-100/50 rounded-lg p-1.5">
                        {items.map((o, index) => (
                          <Draggable key={o.id} draggableId={o.id} index={index}>
                            {(prov) => (
                              <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-card-hover cursor-grab active:cursor-grabbing transition">
                                <p className="text-sm font-bold text-slate-800">{o.clienteNombre}</p>
                                {o.cotizacionNumero && <p className="text-xs text-slate-500 mt-0.5">{o.cotizacionNumero}</p>}
                                <p className="text-lg font-bold text-slate-800 mt-2">{formatCurrency(o.monto)}</p>
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                    <span>Probabilidad</span><span>{o.probabilidad}%</span>
                                  </div>
                                  <ProgressBar value={o.probabilidad} colorClass={o.probabilidad > 70 ? 'bg-brand-500' : o.probabilidad > 40 ? 'bg-amber-500' : 'bg-danger-500'} />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">{o.proximaActividad}</p>
                                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                                  <Avatar name={o.vendedor} size="sm" />
                                  <span className="text-xs text-slate-500">{o.vendedor}</span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {items.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Sin oportunidades</p>}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      ) : (
        <div className="mt-4">
          {cotizaciones.length === 0 ? (
            <Card><EmptyState title="Sin cotizaciones" icon={<FileText className="h-6 w-6" />} /></Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-4 py-3 text-left font-medium">Nº</th>
                    <th className="px-4 py-3 text-left font-medium">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium">Producto</th>
                    <th className="px-4 py-3 text-right font-medium">Cantidad</th>
                    <th className="px-4 py-3 text-right font-medium">Monto</th>
                    <th className="px-4 py-3 text-left font-medium">Estado</th>
                    <th className="px-4 py-3 text-left font-medium">Fecha</th>
                    <th className="px-4 py-3 text-left font-medium">Vendedor</th>
                    <th className="px-4 py-3 text-right font-medium">Acciones</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {cotizaciones.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-semibold text-slate-800">{c.numero}</td>
                        <td className="px-4 py-3 text-slate-600">{c.clienteNombre}</td>
                        <td className="px-4 py-3 text-slate-600">{c.productoNombre}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{c.cantidad.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">{formatCurrency(c.monto)}</td>
                        <td className="px-4 py-3"><Badge className={COTIZACION_ESTADO_COLORS[c.estado]}>{COTIZACION_ESTADO_LABELS[c.estado]}</Badge></td>
                        <td className="px-4 py-3 text-slate-500">{formatDate(c.fecha)}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={c.vendedor} size="sm" /><span className="text-slate-600">{c.vendedor}</span></div></td>
                        <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Enviar"><Send className="h-4 w-4" /></button>
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Duplicar"><Copy className="h-4 w-4" /></button>
                          {c.estado === 'aprobada' && <button className="p-1.5 rounded-lg hover:bg-brand-50 text-brand-600" title="Convertir en pedido"><ArrowRight className="h-4 w-4" /></button>}
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Nueva cotización modal */}
      <Modal
        open={cotModalOpen}
        onClose={() => setCotModalOpen(false)}
        title="Nueva cotización"
        size="lg"
        footer={<><Button variant="outline" onClick={() => setCotModalOpen(false)}>Cancelar</Button><Button onClick={crearCotizacion}>Crear cotización</Button></>}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Cliente</Label><Input value={cotForm.clienteNombre ?? ''} onChange={e => setCotForm(f => ({ ...f, clienteNombre: e.target.value }))} placeholder="Razón social" /></div>
            <div><Label>Producto</Label><Input value={cotForm.productoNombre ?? ''} onChange={e => setCotForm(f => ({ ...f, productoNombre: e.target.value }))} placeholder="Nombre del producto" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Cantidad</Label><Input type="number" value={cotForm.cantidad ?? ''} onChange={e => setCotForm(f => ({ ...f, cantidad: Number(e.target.value) }))} /></div>
            <div><Label>Monto (Bs)</Label><Input type="number" value={cotForm.monto ?? ''} onChange={e => setCotForm(f => ({ ...f, monto: Number(e.target.value) }))} /></div>
            <div><Label>Vendedor</Label><Input value={cotForm.vendedor ?? 'María Quispe'} onChange={e => setCotForm(f => ({ ...f, vendedor: e.target.value }))} /></div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
