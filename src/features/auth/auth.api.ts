import { api } from "@/api/api.config";
import type {
    LoginRequest,
    LoginResponse, 
} from "@/features/auth/auth.types";

export const authApi = {
    login: (data: LoginRequest) =>
        api.post<LoginResponse>("/auth/login/",data),
    logout: (refresh: string) => 
        api.post("/auth/logout/", {refresh}),
}