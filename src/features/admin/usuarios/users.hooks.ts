import { useApiMutation } from "../../hooks/use.api.mutation";
import { useApiQuery } from "../../hooks/use.api.query";

import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserListParams,
  UserListResponse,
} from "./users.types";
import { usersApi } from "./users.api";

/**
 * Obtiene la lista paginada de usuarios.
 */
export function useUsers(params?: UserListParams) {
  return useApiQuery<UserListResponse>({
    queryKey: ["users", "list", params],
    queryFn: () => usersApi.list(params),
  });
}

/**
 * Obtiene un usuario por su identificador.
 */
export function useUser(id: number) {
  return useApiQuery<User>({
    queryKey: ["users", "detail", id],
    queryFn: () => usersApi.getOne(id),
    enabled: Number.isFinite(id),
  });
}

/**
 * Crea un usuario.
 */
export function useCreateUser() {
  return useApiMutation<User, Error, CreateUserInput>({
    mutationFn: (data) => usersApi.create(data),
  });
}

/**
 * Actualiza un usuario.
 */
export function useUpdateUser() {
  return useApiMutation<
    User,
    Error,
    { id: number; data: UpdateUserInput }
  >({
    mutationFn: ({ id, data }) => usersApi.update(id, data),
  });
}

/**
 * Elimina un usuario.
 */
export function useDeleteUser() {
  return useApiMutation<unknown, Error, number>({
    mutationFn: (id) => usersApi.delete(id),
  });
}