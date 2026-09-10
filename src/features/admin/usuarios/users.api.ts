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
