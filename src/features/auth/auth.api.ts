import { api } from "@/api/api.config";
import type {
    LoginRequest,
    LoginResponse, 
} from "@/features/auth/auth.types";
import type { Role } from "@/features/admin/roles/roles.types";
import type { Permission } from "@/features/admin/permisos/permissions.types";

export interface AuthenticatedProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  last_login: string | null;
  date_joined: string;
  groups: Role[];
  permissions: Permission[];
}

export const authApi = {
  // Inicar sesión
    login: (data: LoginRequest) =>
        api.post<LoginResponse>("/auth/login/",data),

  // Cerrar sesión
    logout: (refresh: string) => 
        api.post("/auth/logout/", {refresh}),

  // Obtener perfil, grupos y permisos del usuario autenticado
    me: () => api.get<AuthenticatedProfile>("/usuarios/me/"),
};
