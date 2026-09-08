import { api } from "./api.config";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>("/auth/login/", data),

  logout: (refresh: string) =>
    api.post("/auth/logout/", { refresh }),
};