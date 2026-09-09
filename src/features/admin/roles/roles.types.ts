import type { CrudListParams } from "@/api/api.types";

export interface Role {
    id: number;
    name: string;
}

export interface CreateRoleInput {
    name: string;
}

export interface UpdateRoleInput {
    name?: string;
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