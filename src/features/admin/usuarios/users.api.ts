import { createCrudOperations } from "@/api/api-crud";
import { api } from "@/api/api.config";

import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserListParams,
  UserListResponse,
} from "./users.types";

export const usersApi = createCrudOperations<
  User,
  CreateUserInput,
  UpdateUserInput,
  UserListResponse,
  UserListParams
>(api, "usuarios", {
  trailingSlash: true,
});

export const userAdminApi = {
  roles: (userId: number) => api.get<import("@/features/admin/roles/roles.types").Role[]>(`/usuarios/${userId}/roles/`),
  setRoles: (userId: number, roleIds: number[]) => api.put(`/usuarios/${userId}/roles/`, { role_ids: roleIds }),
  setActive: (userId: number, is_active: boolean) => api.patch(`/usuarios/${userId}/cambiar-estado/`, { is_active }),
};
