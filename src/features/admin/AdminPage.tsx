import { useState } from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Shield, CheckCircle2, XCircle, Edit2, Lock, Unlock } from 'lucide-react';

import { usersApi, userAdminApi } from '@/features/admin/usuarios/users.api';
import type { CreateUserInput, UpdateUserInput, User } from '@/features/admin/usuarios/users.types';
import { roleAdminApi, rolesApi } from '@/features/admin/roles/roles.api';
import type { Role, RoleListResponse } from '@/features/admin/roles/roles.types';
import type { Permission } from '@/features/admin/permisos/permissions.types';
import { useAuthStore } from '@/app/store/auth.store';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { LoadingState } from '@/components/ui/States';
import { PageHeader } from '@/components/ui/PageHeader';
import Modal, { ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui/Modal';
import { formatDate } from '@/utils';
import type { UserListResponse } from '@/features/admin/usuarios/users.types';

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return 'No se pudo completar la operación.';
};

export default function AdminPage() {
  const [tab, setTab] = useState('usuarios');
  const [editing, setEditing] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [roleIds, setRoleIds] = useState<number[]>([]);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [permissionIds, setPermissionIds] = useState<number[]>([]);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  const usersQuery = useQuery<UserListResponse>({ queryKey: ['admin-usuarios'], queryFn: () => usersApi.list() });
  const rolesQuery = useQuery<RoleListResponse>({ queryKey: ['admin-roles'], queryFn: () => rolesApi.list() });
  const permissionCatalogQuery = useQuery<Permission[]>({ queryKey: ['admin-permission-catalog'], queryFn: roleAdminApi.permissionCatalog, enabled: tab === 'permisos' });
  const usuarios = usersQuery.data?.results ?? [];
  const roles = rolesQuery.data?.results ?? [];
  const userRolesQueries = useQueries({ queries: usuarios.map((user) => ({
    queryKey: ['admin-usuario-roles', user.id],
    queryFn: () => userAdminApi.roles(user.id),
  })) });
  const rolePermissionQueries = useQueries({ queries: roles.map((role) => ({
    queryKey: ['admin-role-permissions', role.id],
    queryFn: () => roleAdminApi.permissions(role.id),
  })) });
  const permissionsByRole = roles.map((role, index) => ({ role, permissions: rolePermissionQueries[index]?.data ?? [] }));

  if (usersQuery.isLoading || rolesQuery.isLoading) return <LoadingState message="Cargando administración..." />;

  const openCreate = () => { setEditing(null); setRoleIds([]); setError(''); setFeedback(''); setModalOpen(true); };
  const openEdit = async (user: User) => {
    setEditing(user); setError(''); setFeedback('');
    try {
      const assigned = await userAdminApi.roles(user.id);
      setRoleIds(assigned.map((role) => role.id));
      setModalOpen(true);
    } catch (requestError) { setError(getErrorMessage(requestError)); }
  };
  const saveUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError('');
    const form = new FormData(event.currentTarget);
    const values = {
      username: String(form.get('username') ?? '').trim(),
      first_name: String(form.get('first_name') ?? '').trim(),
      last_name: String(form.get('last_name') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
      password: String(form.get('password') ?? ''),
    };
    try {
      let user: User;
      if (editing) {
        const update: UpdateUserInput = { ...values };
        if (!update.password) delete update.password;
        user = await usersApi.update(editing.id, update);
      } else {
        if (values.password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
        user = await usersApi.create(values as CreateUserInput);
      }
      await userAdminApi.setRoles(user.id, roleIds);
      await queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-usuario-roles'] });
      setModalOpen(false); setFeedback(editing ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.');
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setSaving(false); }
  };
  const toggleActive = async (user: User) => {
    const next = !user.is_active;
    if (user.id === currentUserId && !next) { setError('No puedes desactivar tu propia cuenta.'); return; }
    if (!window.confirm(`¿Confirmas ${next ? 'activar' : 'desactivar'} a ${user.username}?`)) return;
    setError(''); setFeedback('');
    try {
      await userAdminApi.setActive(user.id, next);
      await queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
      setFeedback(`Usuario ${next ? 'activado' : 'desactivado'} correctamente.`);
    } catch (requestError) { setError(getErrorMessage(requestError)); }
  };
  const openRolePermissions = async (role: Role) => {
    setError('');
    try {
      const permissions = await roleAdminApi.permissions(role.id);
      setEditingRole(role);
      setPermissionIds(permissions.map((permission) => permission.id));
    } catch (requestError) { setError(getErrorMessage(requestError)); }
  };
  const saveRolePermissions = async () => {
    if (!editingRole) return;
    setSaving(true); setError('');
    try {
      await roleAdminApi.setPermissions(editingRole.id, permissionIds);
      await queryClient.invalidateQueries({ queryKey: ['admin-role-permissions', editingRole.id] });
      setFeedback(`Permisos de ${editingRole.name} actualizados correctamente.`);
      setEditingRole(null);
    } catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setSaving(false); }
  };

  return <div>
    <PageHeader title="Administración" subtitle="Usuarios, roles y permisos" breadcrumb={[{ label: 'Administración' }]} />
    <Tabs active={tab} onChange={setTab} tabs={[
      { key: 'usuarios', label: 'Usuarios', count: usuarios.length },
      { key: 'roles', label: 'Roles', count: roles.length },
      { key: 'permisos', label: 'Permisos' },
    ]} />

    {(feedback || error || usersQuery.isError || rolesQuery.isError) && <div role="status" className={`mt-3 rounded-md px-4 py-3 text-sm ${error || usersQuery.isError || rolesQuery.isError ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
      {error || feedback || getErrorMessage(usersQuery.error ?? rolesQuery.error)}
    </div>}

    {tab === 'usuarios' && <Card className="mt-4 overflow-hidden">
      <CardHeader><div className="flex items-center justify-between"><CardTitle>Usuarios del sistema</CardTitle><Button size="sm" onClick={openCreate}><UserPlus className="h-4 w-4" />Nuevo usuario</Button></div></CardHeader>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-muted border-b border-border text-xs uppercase text-muted-foreground">
        <th className="px-4 py-3 text-left font-medium">Usuario</th><th className="px-4 py-3 text-left font-medium">Roles</th><th className="px-4 py-3 text-left font-medium">Estado</th><th className="px-4 py-3 text-left font-medium">Último acceso</th><th className="px-4 py-3 text-right font-medium">Acciones</th>
      </tr></thead><tbody className="divide-y divide-border">
        {usuarios.map((user, index) => {
          const name = `${user.first_name} ${user.last_name}`.trim() || user.username;
          const userRoles = userRolesQueries[index]?.data ?? [];
          return <tr key={user.id} className="hover:bg-muted transition"><td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar name={name} size="sm" /><div><p className="font-medium text-foreground">{name}</p><p className="text-xs text-muted-foreground">{user.email} · @{user.username}</p></div></div></td>
            <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{userRoles.length ? userRoles.map((role) => <Badge key={role.id} className="bg-muted text-muted-foreground border-border">{role.name}</Badge>) : <span className="text-xs text-muted-foreground">Sin asignar</span>}</div></td>
            <td className="px-4 py-3">{user.is_active ? <span className="inline-flex items-center gap-1 text-success text-xs font-medium"><CheckCircle2 className="h-4 w-4" />Activo</span> : <span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-medium"><XCircle className="h-4 w-4" />Inactivo</span>}</td>
            <td className="px-4 py-3 text-muted-foreground text-xs">{user.last_login ? formatDate(user.last_login) : '—'}</td>
            <td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><button aria-label={`Editar ${user.username}`} onClick={() => void openEdit(user)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"><Edit2 className="h-4 w-4" /></button><button aria-label={`${user.is_active ? 'Desactivar' : 'Activar'} ${user.username}`} onClick={() => void toggleActive(user)} disabled={user.id === currentUserId && user.is_active} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition disabled:opacity-40">{user.is_active ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}</button></div></td>
          </tr>;
        })}
        {!usuarios.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No hay usuarios para mostrar.</td></tr>}
      </tbody></table></div>
    </Card>}

    {tab === 'roles' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">{roles.map((role) => <Card key={role.id}><CardBody><div className="flex items-center gap-3 mb-3"><div className="h-10 w-10 rounded-lg bg-sidebar/10 flex items-center justify-center"><Shield className="h-5 w-5 text-sidebar-foreground" /></div><div><p className="font-semibold text-foreground">{role.name}</p><p className="text-xs text-muted-foreground">Rol del sistema</p></div></div><Badge className="bg-muted text-muted-foreground border-border">ID: {role.id}</Badge></CardBody></Card>)}</div>}

    {tab === 'permisos' && <div className="mt-4 space-y-4">{permissionsByRole.map(({ role, permissions }, index) => <Card key={role.id}><CardHeader><div className="flex items-center justify-between"><CardTitle>{role.name}</CardTitle><Button size="sm" variant="outline" onClick={() => void openRolePermissions(role)}>Administrar permisos</Button></div></CardHeader><CardBody>{rolePermissionQueries[index]?.isLoading ? <p className="text-sm text-muted-foreground">Cargando permisos...</p> : rolePermissionQueries[index]?.isError ? <p className="text-sm text-destructive">No se pudieron cargar los permisos de este rol.</p> : permissions.length ? <div className="flex flex-wrap gap-2">{permissions.map((permission) => <Badge key={permission.id} className="bg-muted text-muted-foreground border-border">{permission.name} <span className="ml-1 opacity-70">({permission.codename})</span></Badge>)}</div> : <p className="text-sm text-muted-foreground">Este rol no tiene permisos asignados.</p>}</CardBody></Card>)}{!roles.length && <Card><CardBody><p className="text-sm text-muted-foreground">No hay roles existentes.</p></CardBody></Card>}</div>}

    <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="lg">
      <form onSubmit={saveUser}>
        <ModalHeader><ModalTitle>{editing ? 'Editar usuario' : 'Nuevo usuario'}</ModalTitle><ModalDescription>Completa los datos de la cuenta y selecciona los roles asignados.</ModalDescription></ModalHeader>
        <ModalContent><div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">Username<Input name="username" required minLength={3} defaultValue={editing?.username ?? ''} autoComplete="username" /></label>
          <label className="space-y-1 text-sm">Correo electrónico<Input name="email" type="email" required defaultValue={editing?.email ?? ''} autoComplete="email" /></label>
          <label className="space-y-1 text-sm">Nombres<Input name="first_name" required defaultValue={editing?.first_name ?? ''} autoComplete="given-name" /></label>
          <label className="space-y-1 text-sm">Apellidos<Input name="last_name" required defaultValue={editing?.last_name ?? ''} autoComplete="family-name" /></label>
          <label className="space-y-1 text-sm sm:col-span-2">{editing ? 'Nueva contraseña (opcional)' : 'Contraseña'}<Input name="password" type="password" required={!editing} minLength={8} autoComplete={editing ? 'new-password' : 'new-password'} /></label>
          <fieldset className="sm:col-span-2"><legend className="mb-2 text-sm font-medium">Roles</legend><div className="grid gap-2 sm:grid-cols-2">{roles.map((role: Role) => <label key={role.id} className="flex items-center gap-2 rounded-md border border-border p-2 text-sm"><input type="checkbox" checked={roleIds.includes(role.id)} onChange={(event) => setRoleIds((current) => event.target.checked ? [...current, role.id] : current.filter((id) => id !== role.id))} />{role.name}</label>)}{!roles.length && <p className="text-sm text-muted-foreground">No hay roles disponibles.</p>}</div></fieldset>
        </div>{error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}</ModalContent>
        <ModalFooter><Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button><Button type="submit" loading={saving}>{editing ? 'Guardar cambios' : 'Crear usuario'}</Button></ModalFooter>
      </form>
    </Modal>
    <Modal open={Boolean(editingRole)} onClose={() => setEditingRole(null)} size="lg">
      <ModalHeader><ModalTitle>Permisos de {editingRole?.name}</ModalTitle><ModalDescription>Estos permisos son los permisos reales de Django que se asignarán al rol.</ModalDescription></ModalHeader>
      <ModalContent><div className="max-h-[55vh] space-y-2 overflow-y-auto">{permissionCatalogQuery.isLoading ? <p className="text-sm text-muted-foreground">Cargando permisos disponibles...</p> : permissionCatalogQuery.isError ? <p className="text-sm text-destructive">No se pudo cargar el catálogo de permisos.</p> : (permissionCatalogQuery.data ?? []).map((permission) => <label key={permission.id} className="flex items-start gap-2 rounded-md border border-border p-2 text-sm"><input type="checkbox" checked={permissionIds.includes(permission.id)} onChange={(event) => setPermissionIds((current) => event.target.checked ? [...current, permission.id] : current.filter((id) => id !== permission.id))} /><span>{permission.name}<span className="block text-xs text-muted-foreground">{permission.codename}</span></span></label>)}</div>{error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}</ModalContent>
      <ModalFooter><Button variant="outline" onClick={() => setEditingRole(null)}>Cancelar</Button><Button onClick={() => void saveRolePermissions()} loading={saving}>Guardar permisos</Button></ModalFooter>
    </Modal>
  </div>;
}
