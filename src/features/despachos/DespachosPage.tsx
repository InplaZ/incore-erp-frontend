import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Truck, Calendar, MapPin, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { despachosApi } from '@/api';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { DESPACHO_ESTADOS, DESPACHO_ESTADO_LABELS, DESPACHO_ESTADO_COLORS } from '@/constants';
import { formatDate, cn } from '@/utils';
import type { DespachoEstado } from '@/types';

export function DespachosPage() {
  const [tab, setTab] = useState('lista');
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [calMonth, setCalMonth] = useState(new Date(2026, 7, 1));

  const { data: despachos = [], isLoading } = useQuery({
    queryKey: ['despachos'],
    queryFn: despachosApi.list,
  });

  const filtered = useMemo(() => despachos.filter(d => {
    const matchSearch = !search || d.numero.toLowerCase().includes(search.toLowerCase()) || d.clienteNombre.toLowerCase().includes(search.toLowerCase());
    const matchEstado = estadoFilter === 'all' || d.estado === estadoFilter;
    return matchSearch && matchEstado;
  }), [despachos, search, estadoFilter]);

  if (isLoading) return <LoadingState message="Cargando despachos..." />;

  // Calendar
  const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay();
  const monthName = calMonth.toLocaleDateString('es-BO', { month: 'long', year: 'numeric' });
  const despachosByDay = (day: number) => {
    const dateStr = `${calMonth.getFullYear()}-${String(calMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return despachos.filter(d => d.fecha === dateStr);
  };

  return (
    <div>
      <PageHeader title="Despachos" subtitle={`${filtered.length} despacho${filtered.length !== 1 ? 's' : ''}`} breadcrumb={[{ label: 'Despachos' }]} />

      <Tabs active={tab} onChange={setTab} tabs={[{ key: 'lista', label: 'Lista' }, { key: 'calendario', label: 'Calendario' }]} />

      {tab === 'lista' ? (
        <>
          <div className="flex flex-wrap items-center gap-3 mt-4 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar despacho..." className="pl-9" />
            </div>
            <select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)} className="input w-auto">
              <option value="all">Todos los estados</option>
              {DESPACHO_ESTADOS.map(e => <option key={e} value={e}>{DESPACHO_ESTADO_LABELS[e]}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <Card><EmptyState title="Sin despachos" icon={<Truck className="h-6 w-6" />} /></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(d => (
                <Card key={d.id} hover>
                  <CardBody>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-slate-800">{d.numero}</span>
                      <Badge className={DESPACHO_ESTADO_COLORS[d.estado as DespachoEstado]}>{DESPACHO_ESTADO_LABELS[d.estado as DespachoEstado]}</Badge>
                    </div>
                    <p className="text-sm text-slate-700 font-medium">{d.clienteNombre}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {d.direccion}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(d.fecha)}</span>
                      <span>{d.transportista}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Pedido: <span className="font-medium text-slate-700">{d.pedidoNumero}</span></p>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="capitalize">{monthName}</CardTitle>
              <div className="flex items-center gap-2">
                <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))} className="p-1.5 rounded-lg hover:bg-slate-100 transition"><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))} className="p-1.5 rounded-lg hover:bg-slate-100 transition"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-7 gap-1">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">{d}</div>)}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayDespachos = despachosByDay(day);
                return (
                  <div key={day} className={cn('min-h-[80px] rounded-lg border p-1.5 text-xs', dayDespachos.length > 0 ? 'border-inplaz-200 bg-inplaz-50/30' : 'border-slate-100')}>
                    <p className="text-slate-500 font-medium mb-1">{day}</p>
                    {dayDespachos.map(d => (
                      <div key={d.id} className={cn('rounded px-1.5 py-1 mb-0.5 text-xs font-medium truncate', DESPACHO_ESTADO_COLORS[d.estado as DespachoEstado])}>
                        {d.numero}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
