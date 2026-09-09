import { useApiMutation } from "@/hooks/use.api.mutation";
import { useApiQuery } from "@/hooks/use.api.query";

import type {
    CreateRoleInput,
    UpdateRoleInput,
    Role,
    RoleListParams,
    RoleListResponse,
} from "@/features/admin/roles/roles.types";

import { rolesApi } from "@/features/admin/roles/roles.api";

/**
 * Obtiene la lista paginada de roles
 */
export function useRoles(params?: RoleListParams) {
    return useApiQuery<RoleListResponse>({
        queryKey: ["roles", "list", params],
        queryFn: () => rolesApi.list(params),
    });
}

/**
 * Obtiene un rol por su identificador.
 */
export function useRole(id: number) {
    return useApiQuery<Role>({
        queryKey: ["roles", "detail", id],
        queryFn: () => rolesApi.getOne(id),
        enabled: Number.isFinite(id),
    });
}

/**
 * Crea un rol
 */
export function useCreateRole(){
    return useApiMutation<Role, Error, CreateRoleInput>({
        mutationFn: (data) => rolesApi.create(data),
    });
}

/**
 * Actualiza un rol
 */
export function useaUpdateRole() {
    return useApiMutation<
    Role,
    Error,
    { id: number; data: UpdateRoleInput }
    >({
        mutationFn: ({id, data }) => rolesApi.update(id, data),
    });
}
    /**
     * Elimina un rol
     */
    export function useDeleteRole(){
        return useApiMutation<unknown, Error, number>({
            mutationFn: (id) => rolesApi.delete(id),
        });
    }