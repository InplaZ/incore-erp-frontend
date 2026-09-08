import { BrowserRouter } from "react-router-dom";

import { RouteRenderer } from "./route-renderer";
import { appRoutes } from "./app-routes";
import type { AppRoute } from "./route.types";
import type { RouteAccessResult } from "./route-guard";

import { useAuthStore } from "@/app/store/auth.store";

interface AppRouterProps {
  canAccess?: (route: AppRoute) => RouteAccessResult;
}

export const AppRouter = ({ canAccess }: AppRouterProps) => {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );

  const defaultCanAccess = (route: AppRoute): RouteAccessResult => {
    if (!route.meta?.requiresAuth) {
      return "allowed";
    }

    return isAuthenticated ? "allowed" : "denied";
  };

  const accessStrategy = canAccess ?? defaultCanAccess;

  return (
    <BrowserRouter>
      <RouteRenderer
        routes={appRoutes}
        canAccess={accessStrategy}
      />
    </BrowserRouter>
  );
};