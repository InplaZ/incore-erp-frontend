import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  Edit2,
  Lock,
} from 'lucide-react';

import { usersApi } from '@/features/admin/usuarios/users.api';
import { rolesApi } from '@/features/admin/roles/roles.api';

import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { LoadingState } from '@/components/ui/States';
import { PageHeader } from '@/components/ui/PageHeader';

import { formatDate } from '@/utils';
import type { UserListResponse } from "@/features/admin/usuarios/users.types";
import type { RoleListResponse } from "@/features/admin/roles/roles.types";

const PERMISSIONS_MATRIX = [
  {
    resource: 'pedido',
    actions: ['ver', 'crear', 'editar', 'aprobar', 'eliminar'],
  },
  {
    resource: 'viabilidad',
    actions: ['ver', 'ejecutar'],
  },
  {
    resource: 'produccion',
    actions: ['ver', 'editar'],
  },
  {
    resource: 'despacho',
    actions: ['ver', 'crear'],
  },
  {
    resource: 'comercial',
    actions: ['ver', 'cotizacion.crear', 'cotizacion.aprobar'],
  },
];

export default function AdminPage() {
  const [tab, setTab] = useState('usuarios');

  // =========================
  // USUARIOS
  // =========================

  const {
    data: usuariosData,
    isLoading: usuariosLoading,
  } = useQuery<UserListResponse>({
    queryKey: ['admin-usuarios'],
    queryFn: () => usersApi.list(),
  });

  // =========================
  // ROLES
  // =========================

  const {
    data: rolesData,
    isLoading: rolesLoading,
  } = useQuery<RoleListResponse>({
    queryKey: ['admin-roles'],
    queryFn: () => rolesApi.list(),
  });

  const usuarios = usuariosData?.results ?? [];
  const roles = rolesData?.results ?? [];

  const isLoading = usuariosLoading || rolesLoading;

  if (isLoading) {
    return <LoadingState message="Cargando administración..." />;
  }

  return (
    <div>
      <PageHeader
        title="Administración"
        subtitle="Usuarios, roles y permisos"
        breadcrumb={[{ label: 'Administración' }]}
      />

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          {
            key: 'usuarios',
            label: 'Usuarios',
            count: usuarios.length,
          },
          {
            key: 'roles',
            label: 'Roles',
            count: roles.length,
          },
          {
            key: 'permisos',
            label: 'Permisos',
          },
        ]}
      />

      {/* =====================================================
          USUARIOS
      ====================================================== */}

      {tab === 'usuarios' && (
        <Card className="mt-4 overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Usuarios del sistema</CardTitle>

              <Button size="sm">
                <UserPlus className="h-4 w-4" />
                Nuevo usuario
              </Button>
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="px-4 py-3 text-left font-medium">
                    Usuario
                  </th>

                  <th className="px-4 py-3 text-left font-medium">
                    Rol
                  </th>

                  <th className="px-4 py-3 text-left font-medium">
                    Estado
                  </th>

                  <th className="px-4 py-3 text-left font-medium">
                    Último acceso
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => {
                  const nombre =
                    `${u.first_name} ${u.last_name}`.trim() ||
                    u.username;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50 transition"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={nombre}
                            size="sm"
                          />

                          <div>
                            <p className="font-medium text-slate-800">
                              {nombre}
                            </p>

                            <p className="text-xs text-slate-500">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 
                        Todavía no mostramos el rol aquí.
                        Falta conectar /usuarios/{id}/roles/
                      */}
                      <td className="px-4 py-3">
                        <Badge className="bg-slate-100 text-slate-600 border-slate-200">
                          Sin asignar
                        </Badge>
                      </td>

                      <td className="px-4 py-3">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-brand-600 text-xs font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium">
                            <XCircle className="h-4 w-4" />
                            Inactivo
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {u.last_login
                          ? formatDate(u.last_login)
                          : '—'}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
                          >
                            <Lock className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =====================================================
          ROLES
      ====================================================== */}

      {tab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardBody>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-inplaz-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-inplaz-600" />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">
                      {role.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      Rol del sistema
                    </p>
                  </div>
                </div>

                <Badge className="bg-slate-100 text-slate-600 border-slate-200">
                  ID: {role.id}
                </Badge>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* =====================================================
          PERMISOS
      ====================================================== */}

      {tab === 'permisos' && (
        <Card className="mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="px-4 py-3 text-left font-medium">
                    Recurso
                  </th>

                  <th className="px-4 py-3 text-left font-medium">
                    Acción
                  </th>

                  <th className="px-4 py-3 text-center font-medium">
                    Roles
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {PERMISSIONS_MATRIX.map((pm) =>
                  pm.actions.map((action) => {
                    const perm = `${pm.resource}.${action}`;

                    return (
                      <tr
                        key={perm}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-4 py-2.5 text-slate-700 font-medium">
                          {pm.resource}
                        </td>

                        <td className="px-4 py-2.5 text-slate-600">
                          {action}
                        </td>

                        <td className="px-4 py-2.5 text-center">
                          <span className="text-xs text-slate-400">
                            Pendiente de conectar
                          </span>
                        </td>
                      </tr>
                    );
                  }),
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
