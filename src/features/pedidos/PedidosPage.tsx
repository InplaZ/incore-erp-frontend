import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DragDropContext, Droppable, Draggable, type DropResult,
} from '@hello-pangea/dnd';
import { LayoutGrid, List, Filter, Plus, Search, ChevronDown } from 'lucide-react';
import { pedidosApi } from '@/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge, PriorityBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  PEDIDO_ESTADOS, PEDIDO_ESTADO_LABELS, PEDIDO_ESTADO_COLORS,
  PRIORIDAD_LABELS, PRIORIDAD_COLORS, PRIORIDAD_DOTS, ETIQUETA_LABELS, ETIQUETA_COLORS,
} from '@/constants';
import { formatNumber, formatDate, cn } from '@/utils';
import type { Pedido, PedidoEstado } from '@/types';

export function PedidosPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [view, setView] = useState<'tabla' | 'kanban'>('tabla');
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [prioridadFilter, setPrioridadFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['pedidos'],
    queryFn: pedidosApi.list,
  });

  const filtered = useMemo(() => {
    return pedidos.filter(p => {
      const matchSearch = !search ||
        p.numero.toLowerCase().includes(search.toLowerCase()) ||
        p.clienteNombre.toLowerCase().includes(search.toLowerCase()) ||
        p.productoNombre.toLowerCase().includes(search.toLowerCase());
      const matchEstado = estadoFilter === 'all' || p.estado === estadoFilter;
      const matchPrioridad = prioridadFilter === 'all' || p.prioridad === prioridadFilter;
      return matchSearch && matchEstado && matchPrioridad;
    });
  }, [pedidos, search, estadoFilter, prioridadFilter]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const pedidoId = result.draggableId;
    const newEstado = result.destination.droppableId as PedidoEstado;
    pedidosApi.updateEstado(pedidoId, newEstado).then(() => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    });
  };

  if (isLoading) return <LoadingState message="Cargando pedidos..." />;

  return (
    <div>
      <PageHeader
        title="Pedidos"
        subtitle={`${filtered.length} pedido${filtered.length !== 1 ? 's' : ''}`}
        actions={<Button onClick={() => navigate('/pedidos')}><Plus className="h-4 w-4" /> Nuevo pedido</Button>}
        breadcrumb={[{ label: 'Pedidos' }]}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Buscar pedido, cliente, producto..." className="pl-9" />
        </div>

        <select value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPage(0); }} className="input w-auto">
          <option value="all">Todos los estados</option>
          {PEDIDO_ESTADOS.map(e => <option key={e} value={e}>{PEDIDO_ESTADO_LABELS[e]}</option>)}
        </select>

        <select value={prioridadFilter} onChange={e => { setPrioridadFilter(e.target.value); setPage(0); }} className="input w-auto">
          <option value="all">Toda prioridad</option>
          {Object.entries(PRIORIDAD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-white ml-auto">
          <button onClick={() => setView('tabla')} className={cn('p-1.5 rounded-md transition', view === 'tabla' ? 'bg-inplaz-100 text-inplaz-700' : 'text-slate-400 hover:text-slate-600')}>
            <List className="h-4 w-4" />
          </button>
          <button onClick={() => setView('kanban')} className={cn('p-1.5 rounded-md transition', view === 'kanban' ? 'bg-inplaz-100 text-inplaz-700' : 'text-slate-400 hover:text-slate-600')}>
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {view === 'tabla' ? (
        <TablaView pedidos={paged} onRowClick={p => navigate(`/pedidos/${p.id}`)} />
      ) : (
        <KanbanView pedidos={filtered} onDragEnd={onDragEnd} onCardClick={p => navigate(`/pedidos/${p.id}`)} />
      )}

      {view === 'tabla' && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">
            Mostrando {page * pageSize + 1} - {Math.min((page + 1) * pageSize, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Anterior</Button>
            <span className="text-sm text-slate-500">Página {page + 1} de {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Tabla View =====
function TablaView({ pedidos, onRowClick }: { pedidos: Pedido[]; onRowClick: (p: Pedido) => void }) {
  if (pedidos.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No hay pedidos"
          description="Cuando existan nuevos pedidos aparecerán aquí."
          icon={<Filter className="h-6 w-6" />}
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <th className="px-4 py-3 text-left font-medium">Nº Pedido</th>
              <th className="px-4 py-3 text-left font-medium">Cliente</th>
              <th className="px-4 py-3 text-left font-medium">Producto</th>
              <th className="px-4 py-3 text-right font-medium">Cantidad</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Prioridad</th>
              <th className="px-4 py-3 text-left font-medium">Responsable</th>
              <th className="px-4 py-3 text-left font-medium">Máquina</th>
              <th className="px-4 py-3 text-left font-medium">Entrega</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pedidos.map(p => (
              <tr key={p.id} onClick={() => onRowClick(p)} className="hover:bg-slate-50 cursor-pointer transition">
                <td className="px-4 py-3 font-semibold text-slate-800">{p.numero}</td>
                <td className="px-4 py-3 text-slate-600">{p.clienteNombre}</td>
                <td className="px-4 py-3 text-slate-600">{p.productoNombre}</td>
                <td className="px-4 py-3 text-right text-slate-600">{formatNumber(p.cantidad)}</td>
                <td className="px-4 py-3"><Badge className={PEDIDO_ESTADO_COLORS[p.estado]}>{PEDIDO_ESTADO_LABELS[p.estado]}</Badge></td>
                <td className="px-4 py-3">
                  <PriorityBadge label={PRIORIDAD_LABELS[p.prioridad]} dotClass={PRIORIDAD_DOTS[p.prioridad]} colorClass={PRIORIDAD_COLORS[p.prioridad]} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={p.responsableNombre} size="sm" />
                    <span className="text-slate-600 hidden lg:inline">{p.responsableNombre}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{p.maquinaNombre ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(p.fechaComprometida)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ===== Kanban View =====
function KanbanView({ pedidos, onDragEnd, onCardClick }: {
  pedidos: Pedido[];
  onDragEnd: (r: DropResult) => void;
  onCardClick: (p: Pedido) => void;
}) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {PEDIDO_ESTADOS.map(estado => {
          const items = pedidos.filter(p => p.estado === estado);
          return (
            <Droppable key={estado} droppableId={estado}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="w-72 shrink-0">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className={cn('text-xs font-semibold px-2 py-1 rounded-full border', PEDIDO_ESTADO_COLORS[estado])}>
                      {PEDIDO_ESTADO_LABELS[estado]}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{items.length}</span>
                  </div>
                  <div className="space-y-2 min-h-[100px] bg-slate-100/50 rounded-lg p-1.5">
                    {items.map((p, index) => (
                      <Draggable key={p.id} draggableId={p.id} index={index}>
                        {(prov, snapshot) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            onClick={() => !snapshot.isDragging && onCardClick(p)}
                            className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-card-hover hover:border-slate-300 cursor-grab active:cursor-grabbing transition"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-bold text-slate-800">{p.numero}</span>
                              <span className={cn('h-2.5 w-2.5 rounded-full', PRIORIDAD_DOTS[p.prioridad])} title={PRIORIDAD_LABELS[p.prioridad]} />
                            </div>
                            <p className="text-xs text-slate-500 mb-1">{p.clienteNombre}</p>
                            <p className="text-xs text-slate-600 mb-2">{p.productoNombre}</p>
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                              <span>{formatNumber(p.cantidad)} un.</span>
                              <span>{formatDate(p.fechaComprometida)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              {p.maquinaNombre && <Badge className="bg-inplaz-50 text-inplaz-600 border-inplaz-200">{p.maquinaNombre}</Badge>}
                              <div className="flex items-center gap-1 ml-auto">
                                <Avatar name={p.responsableNombre} size="sm" />
                              </div>
                            </div>
                            {p.etiquetas.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {p.etiquetas.map(e => (
                                  <span key={e} className={cn('text-xs px-1.5 py-0.5 rounded font-medium', ETIQUETA_COLORS[e])}>
                                    {ETIQUETA_LABELS[e]}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {items.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-4">Sin pedidos</p>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
