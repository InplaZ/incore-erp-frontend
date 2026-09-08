import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { User, Role } from '@/types';
import { authApi } from '@/api/auth.api';

interface AuthState {
  user: User | null;
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

        set({
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
        const user = get().user;

        if (!user) {
          return false;
        }

        if (user.permissions.includes('*')) {
          return true;
        }

        return user.permissions.includes(perm);
      },

      // ============================================================
      // ROLES
      // ============================================================
      hasRole: (...roles) => {
        const user = get().user;

        if (!user) {
          return false;
        }

        return roles.includes(user.role);
      },
    }),
    {
      name: 'insystem-auth',
    },
  ),
);