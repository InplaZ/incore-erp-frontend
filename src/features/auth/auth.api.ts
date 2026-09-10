import { api } from "@/api/api.config";
import type {
    LoginRequest,
    LoginResponse, 
} from "@/features/auth/auth.types";
import type { User } from "@/features/admin/usuarios/users.types";
import type { Role } from "@/features/admin/roles/roles.types";
import type { Permission } from "@/features/admin/permisos/permissions.types";

export const authApi = {
  // Inicar sesión
    login: (data: LoginRequest) =>
        api.post<LoginResponse>("/auth/login/",data),

  // Cerrar sesión
    logout: (refresh: string) => 
        api.post("/auth/logout/", {refresh}),

  // Obtener usuario
    getUser: async (username: string): Promise<User> => {
      const response = await api.get<{
        count: number;
        results: User[];
      }>("/usuarios/", {
        params: { search: username },
      });
      return response.results[0];
    },

    // Obtener roles del usuario
    getRoles: (userId: number) =>
      api.get<Role[]>(`/usuarios/${userId}/roles/`),

    // Obtener permisos del usuario
    getPermissions: (userId: number) =>
      api.get<Permission[]>(
        `/usuarios/${userId}/permisos-efectivos/`),
};