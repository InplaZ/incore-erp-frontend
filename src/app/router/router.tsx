import { BrowserRouter } from "react-router-dom";

import { RouteRenderer } from "./route-renderer";
import { appRoutes } from "./app-routes";
import type { AppRoute } from "./route.types";
import type { RouteAccessResult } from "./route-guard";

interface AppRouterProps {
  canAccess?: (route: AppRoute) => RouteAccessResult;
}

/**
 * ===========================================================================
 * APPLICATION ROUTER
 * ===========================================================================
 *
 * Punto de entrada del sistema de routing de la aplicación.
 *
 * La infraestructura de routing vive en este directorio.
 * Las rutas concretas de la aplicación viven en `app-routes.tsx`.
 *
 * El router no conoce ningún dominio de negocio.
 */
export const AppRouter = ({ canAccess }: AppRouterProps) => {
  return (
    <BrowserRouter>
      <RouteRenderer routes={appRoutes} canAccess={canAccess} />
    </BrowserRouter>
  );
};
