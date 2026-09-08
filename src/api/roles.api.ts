import { createCrudOperations } from "./api-crud";
import { api } from "./api.config";
import type { CrudListParams } from "./api.types";

export interface Role {
  id: number;
  name: string;
}

export interface RoleListParams extends CrudListParams {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface RoleListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Role[];
}

export const rolesApi = createCrudOperations<
  Role,
  { name: string },
  { name?: string },
  RoleListResponse,
  RoleListParams
>(api, "roles", {
  trailingSlash: true,
});