import { useApiMutation } from "@/hooks/use.api.mutation";

import { authApi } from "./auth.api";
import type { LoginRequest, LoginResponse } from "./auth.types";

export function useLogin() {
  return useApiMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: (data) => authApi.login(data),
  });
}

export function useLogout() {
  return useApiMutation<unknown, Error, string>({
    mutationFn: (refresh) => authApi.logout(refresh),
  });
}