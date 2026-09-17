import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Package, LayoutGrid, List } from 'lucide-react';
import { productosApi } from '@/api';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber, cn } from '@/utils';

export function ProductosPage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'cards' | 'tabla'>('cards');
  const [tipoFilter, setTipoFilter] = useState('all');

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['productos'],
    queryFn: productosApi.list,
  });

  const tipos = useMemo(() => Array.from(new Set(productos.map(p => p.tipo))), [productos]);

  const filtered = useMemo(() => productos.filter(p => {
    const matchSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.codigo.toLowerCase().includes(search.toLowerCase());
    const matchTipo = tipoFilter === 'all' || p.tipo === tipoFilter;
    return matchSearch && matchTipo;
  }), [productos, search, tipoFilter]);

  if (isLoading) return <LoadingState message="Cargando productos..." />;

  return (
    <div>
      <PageHeader title="Productos" subtitle={`${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`} breadcrumb={[{ label: 'Productos' }]} />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." className="pl-9" />
        </div>
        <select value={tipoFilter} onChange={e => setTipoFilter(e.target.value)} className="input w-auto">
          <option value="all">Todos los tipos</option>
          {tipos.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="flex items-center rounded-lg border border-border p-0.5 bg-card ml-auto">
          <button onClick={() => setView('cards')} className={cn('p-1.5 rounded-md transition', view === 'cards' ? 'bg-sidebar/10 text-sidebar-foreground' : 'text-muted-foreground')}><LayoutGrid className="h-4 w-4" /></button>
          <button onClick={() => setView('tabla')} className={cn('p-1.5 rounded-md transition', view === 'tabla' ? 'bg-sidebar/10 text-sidebar-foreground' : 'text-muted-foreground')}><List className="h-4 w-4" /></button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState title="Sin productos" icon={<Package className="h-6 w-6" />} /></Card>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <Card key={p.id} hover>
              <CardBody>
                <div className="flex items-start justify-between mb-2">
                  <div className="h-10 w-10 rounded-lg bg-sidebar/10 flex items-center justify-center"><Package className="h-5 w-5 text-sidebar-foreground" /></div>
                  <Badge className={p.estado === 'activo' ? 'bg-accent text-accent-foreground border-accent/20' : 'bg-muted text-muted-foreground border-border'}>{p.estado}</Badge>
                </div>
                <p className="text-sm font-bold text-foreground">{p.codigo}</p>
                <p className="text-sm text-foreground mt-0.5">{p.nombre}</p>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p>Tipo: <span className="text-foreground font-medium">{p.tipo}</span></p>
                  <p>Material: <span className="text-foreground font-medium">{p.material}</span></p>
                  <p>Micraje: <span className="text-foreground font-medium">{p.micraje} µm</span></p>
                  <p>Dimensiones: <span className="text-foreground font-medium">{p.dimensiones}</span></p>
                  <p>Acabado: <span className="text-foreground font-medium">{p.acabado}</span></p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-muted border-b border-border text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Código</th>
                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                <th className="px-4 py-3 text-left font-medium">Material</th>
                <th className="px-4 py-3 text-left font-medium">Micraje</th>
                <th className="px-4 py-3 text-left font-medium">Dimensiones</th>
                <th className="px-4 py-3 text-left font-medium">Acabado</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-muted transition">
                    <td className="px-4 py-3 font-semibold text-foreground">{p.codigo}</td>
                    <td className="px-4 py-3 text-foreground">{p.nombre}</td>
                    <td className="px-4 py-3 text-foreground">{p.tipo}</td>
                    <td className="px-4 py-3 text-foreground">{p.material}</td>
                    <td className="px-4 py-3 text-foreground">{p.micraje} µm</td>
                    <td className="px-4 py-3 text-foreground">{p.dimensiones}</td>
                    <td className="px-4 py-3 text-foreground">{p.acabado}</td>
                    <td className="px-4 py-3"><Badge className={p.estado === 'activo' ? 'bg-accent text-accent-foreground border-accent/20' : 'bg-muted text-muted-foreground border-border'}>{p.estado}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
