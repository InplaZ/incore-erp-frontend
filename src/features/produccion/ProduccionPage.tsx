import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DragDropContext, Droppable, Draggable, type DropResult,
} from '@hello-pangea/dnd';
import { Factory, Clock, User } from 'lucide-react';
import { produccionApi } from '@/api';
import { Card } from '@/components/ui/Card';
import { Badge, PriorityBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingState } from '@/components/ui/States';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  PRODUCCION_ESTADOS, PRODUCCION_ESTADO_LABELS, PRODUCCION_ESTADO_COLORS,
  PRIORIDAD_LABELS, PRIORIDAD_COLORS, PRIORIDAD_DOTS,
} from '@/constants';
import { formatNumber, cn } from '@/utils';
import type { Produccion, ProduccionEstado } from '@/types';

export function ProduccionPage() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['produccion'],
    queryFn: produccionApi.list,
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    // In real app, call API to update state
    queryClient.invalidateQueries({ queryKey: ['produccion'] });
  };

  if (isLoading) return <LoadingState message="Cargando producción..." />;

  return (
    <div>
      <PageHeader title="Producción" subtitle="Tablero de producción en proceso" breadcrumb={[{ label: 'Producción' }]} />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {PRODUCCION_ESTADOS.map(estado => {
            const estadoItems = items.filter(i => i.estado === estado);
            return (
              <Droppable key={estado} droppableId={estado}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="w-72 shrink-0">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className={cn('text-xs font-semibold px-2 py-1 rounded-full border', PRODUCCION_ESTADO_COLORS[estado as ProduccionEstado])}>
                        {PRODUCCION_ESTADO_LABELS[estado as ProduccionEstado]}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{estadoItems.length}</span>
                    </div>
                    <div className="space-y-2 min-h-[100px] bg-slate-100/50 rounded-lg p-1.5">
                      {estadoItems.map((p, index) => (
                        <Draggable key={p.id} draggableId={p.id} index={index}>
                          {(prov) => (
                            <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-card-hover cursor-grab active:cursor-grabbing transition">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-slate-800">{p.pedidoNumero}</span>
                                <span className={cn('h-2.5 w-2.5 rounded-full', PRIORIDAD_DOTS[p.prioridad])} />
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                                <Factory className="h-3.5 w-3.5" /> {p.maquinaNombre}
                              </div>
                              <ProgressBar value={p.producido} max={p.cantidad} colorClass={p.producido === p.cantidad ? 'bg-brand-500' : 'bg-inplaz-500'} showLabel />
                              <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                                <span>{formatNumber(p.producido)} / {formatNumber(p.cantidad)}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {p.tiempoTranscurrido} / {p.tiempoEstimado}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                                <Avatar name={p.operador} size="sm" />
                                <span className="text-xs text-slate-500">{p.operador}</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {estadoItems.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Sin producción</p>}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
