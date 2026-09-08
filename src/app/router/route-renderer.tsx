import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import { RouteGuard, type RouteAccessResult } from "./route-guard";
import type { AppRoute } from "./route.types";

/**
 * ===========================================================================
 * ROUTE RENDERER
 * ===========================================================================
 *
 * Convierte nuestra definición genérica `AppRoute[]` en rutas
 * compatibles con React Router.
 *
 * Este componente no conoce ningún dominio de negocio.
 *
 * No sabe qué es:
 *
 * - usuarios
 * - productos
 * - inventario
 * - ventas
 * - ERP
 * - autenticación
 *
 * Únicamente interpreta la estructura de las rutas.
 */

interface RouteRendererProps {
  routes: AppRoute[];

  /**
   * Determina si una ruta protegida puede ser accedida.
   *
   * Es opcional porque no todas las aplicaciones necesitan
   * autenticación o autorización.
   */
  canAccess?: (route: AppRoute) => RouteAccessResult;
}

/**
 * Envuelve el elemento de una ruta con el mecanismo de autorización
 * cuando la aplicación proporciona una estrategia `canAccess`.
 *
 * El renderer no decide quién puede acceder.
 * Esa decisión pertenece a la estrategia proporcionada por la aplicación.
 */
const renderElement = (
  route: AppRoute,
  canAccess?: (route: AppRoute) => RouteAccessResult,
) => {
  if (!canAccess) {
    return route.element;
  }

  return (
    <RouteGuard route={route} canAccess={canAccess}>
      {route.element}
    </RouteGuard>
  );
};

/**
 * Convierte recursivamente una definición `AppRoute` en un elemento
 * compatible con React Router.
 */
const renderRoute = (
  route: AppRoute,
  index: number,
  canAccess?: (route: AppRoute) => RouteAccessResult,
) => {
  const key = route.path ?? `route-${index}`;

  /**
   * -------------------------------------------------------------------------
   * INDEX ROUTE
   * -------------------------------------------------------------------------
   *
   * Las rutas índice tienen reglas especiales en React Router:
   *
   * - utilizan `index`
   * - no utilizan `path`
   * - no tienen rutas hijas
   */
  if (route.index) {
    return <Route key={key} index element={renderElement(route, canAccess)} />;
  }

  /**
   * -------------------------------------------------------------------------
   * NESTED ROUTE
   * -------------------------------------------------------------------------
   *
   * Una ruta puede actuar como padre de otras rutas.
   */
  if (route.children && route.children.length > 0) {
    return (
      <Route
        key={key}
        path={route.path}
        element={renderElement(route, canAccess)}
      >
        {route.children.map((childRoute, childIndex) =>
          renderRoute(childRoute, childIndex, canAccess),
        )}
      </Route>
    );
  }

  /**
   * -------------------------------------------------------------------------
   * NORMAL ROUTE
   * -------------------------------------------------------------------------
   */
  return (
    <Route
      key={key}
      path={route.path}
      element={renderElement(route, canAccess)}
    />
  );
};

export const RouteRenderer = ({ routes, canAccess }: RouteRendererProps) => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Routes>
        {routes.map((route, index) => renderRoute(route, index, canAccess))}
      </Routes>
    </Suspense>
  );
};
