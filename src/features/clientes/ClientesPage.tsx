import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, MapPin, Phone, Mail, Building2, Edit2, Trash2 } from 'lucide-react';
import { clientesApi } from '@/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { formatDate, cn } from '@/utils';
import type { Cliente } from '@/types';

export function ClientesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  const [form, setForm] = useState<Partial<Cliente>>({});

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: clientesApi.list,
  });

  const filtered = useMemo(() =>
    clientes.filter(c =>
      !search ||
      c.razonSocial.toLowerCase().includes(search.toLowerCase()) ||
      c.nit.includes(search) ||
      c.ciudad.toLowerCase().includes(search.toLowerCase()),
    ), [clientes, search]);

  const openCreate = () => { setEditing(null); setForm({}); setModalOpen(true); };
  const openEdit = (c: Cliente) => { setEditing(c); setForm(c); setModalOpen(true); };

  const save = async () => {
    if (editing) await clientesApi.update(editing.id, form);
    else await clientesApi.create(form);
    setModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['clientes'] });
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await clientesApi.delete(deleteTarget.id);
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    }
    setDeleteTarget(null);
  };

  if (isLoading) return <LoadingState message="Cargando clientes..." />;

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${filtered.length} cliente${filtered.length !== 1 ? 's' : ''}`}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Nuevo cliente</Button>}
        breadcrumb={[{ label: 'Clientes' }]}
      />

      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por razón social, NIT, ciudad..." className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState title="Sin clientes" description="Los clientes registrados aparecerán aquí." icon={<Building2 className="h-6 w-6" />} action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Crear cliente</Button>} /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <Card key={c.id} hover>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.razonSocial} size="md" />
                    <div>
                      <p className="font-semibold text-slate-800">{c.razonSocial}</p>
                      <p className="text-xs text-slate-500">NIT: {c.nit}</p>
                    </div>
                  </div>
                  <Badge className={c.estado === 'activo' ? 'bg-brand-100 text-brand-700 border-brand-300' : 'bg-slate-100 text-slate-500 border-slate-300'}>
                    {c.estado}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-sm text-slate-600">
                  <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {c.ciudad}</p>
                  <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" /> {c.telefono}</p>
                  <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" /> {c.email}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">Desde {formatDate(c.createdAt)}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg hover:bg-danger-50 text-danger-500 transition"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar cliente' : 'Nuevo cliente'}
        footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button><Button onClick={save}>{editing ? 'Guardar' : 'Crear'}</Button></>}
      >
        <div className="space-y-4">
          <div><Label>Razón Social</Label><Input value={form.razonSocial ?? ''} onChange={e => setForm(f => ({ ...f, razonSocial: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>NIT</Label><Input value={form.nit ?? ''} onChange={e => setForm(f => ({ ...f, nit: e.target.value }))} /></div>
            <div><Label>Contacto</Label><Input value={form.contacto ?? ''} onChange={e => setForm(f => ({ ...f, contacto: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Teléfono</Label><Input value={form.telefono ?? ''} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} /></div>
            <div><Label>Email</Label><Input value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Dirección</Label><Input value={form.direccion ?? ''} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} /></div>
            <div><Label>Ciudad</Label><Input value={form.ciudad ?? ''} onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))} /></div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Eliminar cliente"
        message={`¿Confirmar eliminación de "${deleteTarget?.razonSocial}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
      />
    </div>
  );
}
