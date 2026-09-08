import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import type { AppRoute } from "./route.types";

/**
 * ============================================================================
 * ROUTE ACCESS RESULT
 * ============================================================================
 *
 * Resultado de la evaluación de acceso a una ruta.
 *
 * - "allowed" → la ruta puede renderizarse.
 * - "denied"  → la ruta no puede renderizarse.
 * - "pending" → todavía no podemos determinar el acceso.
 */
export type RouteAccessResult = "allowed" | "denied" | "pending";

/**
 * ============================================================================
 * ROUTE GUARD
 * ============================================================================
 *
 * Protege una ruta utilizando una estrategia de autorización proporcionada
 * por la aplicación.
 *
 * Esta infraestructura NO conoce:
 *
 * - JWT
 * - Bearer tokens
 * - cookies
 * - localStorage
 * - sesiones
 * - AuthContext
 * - ningún backend concreto
 *
 * La aplicación proporciona `canAccess`, que recibe la ruta completa.
 *
 * Esto permite que la aplicación utilice:
 *
 * - autenticación
 * - roles
 * - permisos
 * - reglas personalizadas
 * - cualquier combinación de las anteriores
 *
 * La infraestructura únicamente ejecuta la decisión.
 */

export interface RouteGuardProps {
  /**
   * Ruta que se está intentando proteger.
   */
  route: AppRoute;

  /**
   * Contenido que se renderiza cuando la ruta es accesible.
   */
  children: ReactNode;

  /**
   * Estrategia de autorización proporcionada por la aplicación.
   *
   * La función recibe la ruta completa para que pueda utilizar
   * `route.meta`, incluyendo roles, permisos o cualquier metadata
   * personalizada.
   */
  canAccess: (route: AppRoute) => RouteAccessResult;

  /**
   * Contenido opcional que se renderiza cuando el acceso es rechazado.
   */
  fallback?: ReactNode;

  /**
   * Contenido opcional que se renderiza mientras se determina
   * el acceso a la ruta.
   */
  pendingFallback?: ReactNode;
}

export const RouteGuard = ({
  route,
  children,
  canAccess,
  fallback,
  pendingFallback,
}: RouteGuardProps) => {
  /**
   * --------------------------------------------------------------------------
   * PUBLIC ROUTE
   * --------------------------------------------------------------------------
   *
   * Si la ruta no requiere autenticación, no necesitamos ejecutar
   * ninguna estrategia de autorización.
   */
  if (!route.meta?.requiresAuth) {
    return <>{children}</>;
  }

  /**
   * --------------------------------------------------------------------------
   * AUTHORIZATION
   * --------------------------------------------------------------------------
   *
   * La aplicación decide si el usuario puede acceder.
   *
   * El guard no interpreta:
   *
   * - roles
   * - permisos
   * - tokens
   * - sesiones
   * - identidad del usuario
   */
  const accessResult = canAccess(route);

  /**
   * --------------------------------------------------------------------------
   * PENDING
   * --------------------------------------------------------------------------
   */
  if (accessResult === "pending") {
    return pendingFallback ? <>{pendingFallback}</> : <div>Cargando...</div>;
  }

  /**
   * --------------------------------------------------------------------------
   * ALLOWED
   * --------------------------------------------------------------------------
   */
  if (accessResult === "allowed") {
    return <>{children}</>;
  }

  /**
   * --------------------------------------------------------------------------
   * DENIED
   * --------------------------------------------------------------------------
   *
   * Si la aplicación proporciona un fallback personalizado,
   * utilizamos ese contenido.
   */
  if (fallback) {
    return <>{fallback}</>;
  }

  /**
   * --------------------------------------------------------------------------
   * DEFAULT FALLBACK
   * --------------------------------------------------------------------------
   *
   * No asumimos que exista una ruta `/login`.
   *
   * Por eso el comportamiento predeterminado utiliza `/`.
   */
  return <Navigate to="/" replace />;
};
