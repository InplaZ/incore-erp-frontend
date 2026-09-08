import { createCrudOperations } from "./api-crud";
import { api } from "./api.config";
import type { CrudListParams } from "./api.types";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  last_login: string | null;
  date_joined: string;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
}

export interface UserListParams extends CrudListParams {
  is_active?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface UserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export const usersApi = createCrudOperations<
  User,
  CreateUserInput,
  UpdateUserInput,
  UserListResponse,
  UserListParams
>(api, "usuarios",{
  trailingSlash: true
});
