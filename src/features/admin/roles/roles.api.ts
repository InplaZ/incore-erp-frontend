import { createCrudOperations } from "@/api/api-crud";
import { api } from "@/api/api.config";

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

//Comunicacion con djanto 