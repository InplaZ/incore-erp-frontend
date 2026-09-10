import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { User } from '@/features/admin/usuarios/users.types';
import type { Role } from '@/features/admin/roles/roles.types';
import type { Permission } from '@/features/admin/permisos/permissions.types';

import { authApi } from '@/features/auth/auth.api';

interface AuthState {
  user: User | null;
  roles: Role[];
  permissions: Permission[];
  isAuthenticated: boolean;
  sidebarCollapsed: boolean;

  login: (
    username: string,
    password: string,
  ) => Promise<boolean>;

  logout: () => void;

  toggleSidebar: () => void;

  hasPermission: (perm: string) => boolean;

  hasRole: (...roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      roles: [],
      permissions: [],
      isAuthenticated: false,
      sidebarCollapsed: false,

      // ============================================================
      // LOGIN REAL CON DJANGO JWT
      // ============================================================
      login: async (username, password) => {
        const response = await authApi.login({
          username,
          password,
        });

        localStorage.setItem(
          'access_token',
          response.access,
        );

        localStorage.setItem(
          'refresh_token',
          response.refresh,
        );

        // Obtener usuario
        const user = await authApi.getUser(username);
        // Obtener roles
        const roles = await authApi.getRoles(user.id);
        // Obtener permisos efectivos
        const permissions = await authApi.getPermissions(user.id);
        // Guardar información de sesión
        set({
          user,
          roles,
          permissions,
          isAuthenticated: true,
        });

        return true;
      },

      // ============================================================
      // LOGOUT
      // ============================================================
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        set({
          user: null,
          roles: [],
          permissions: [],
          isAuthenticated: false,
        });
      },

      // ============================================================
      // SIDEBAR
      // ============================================================
      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),

      // ============================================================
      // PERMISOS
      // ============================================================
      hasPermission: (perm) => {
        const permissions = get().permissions;

        if (permissions.some((permission) => permission.codename === '*')) {
          return true;
        }

        return permissions.some(
          (permission) => permission.codename === perm,
        );
      },

      // ============================================================
      // ROLES
      // ============================================================
      hasRole: (...roles) => {
        const userRoles = get().roles;

        return userRoles.some((userRole) =>
          roles.some((role) => role.id === userRole.id),
        );
      },
    }),
    {
      name: 'insystem-auth',
    },
  ),
);