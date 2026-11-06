import { createCrudOperations } from "@/api/api-crud";
import { api } from "@/api/api.config";
import type { Permission } from "@/features/admin/permisos/permissions.types";

import type {
    CreateRoleInput,
    UpdateRoleInput,
    Role,
    RoleListParams,
    RoleListResponse,
} from "@/features/admin/roles/roles.types";

export const rolesApi = createCrudOperations<
    Role,
    CreateRoleInput,
    UpdateRoleInput,
    RoleListResponse,
    RoleListParams
    >(api,"roles",{
        trailingSlash: true,
    });

export const roleAdminApi = {
    permissions: (roleId: number) => api.get<Permission[]>(`/roles/${roleId}/permisos/`),
    permissionCatalog: () => api.get<Permission[]>("/roles/permisos-disponibles/"),
    setPermissions: (roleId: number, permissionIds: number[]) => api.put(`/roles/${roleId}/permisos/`, { permission_ids: permissionIds }),
};

//Comunicacion con djanto 
