import type { ReactNode } from "react";

/**
 * ===========================================================================
 * ROUTE META
 * ===========================================================================
 *
 * Información opcional asociada a una ruta.
 *
 * El router no interpreta estas propiedades por sí mismo.
 * Las aplicaciones pueden utilizarlas para implementar títulos,
 * autenticación, permisos, navegación, breadcrumbs, analytics, etc.
 */
export interface RouteMeta {
  title?: string;

  requiresAuth?: boolean;

  permissions?: string[];

  roles?: string[];

  [key: string]: unknown;
}

/**
 * ===========================================================================
 * APPLICATION ROUTE
 * ===========================================================================
 *
 * Representa una ruta independiente de la implementación concreta
 * del dominio de la aplicación.
 *
 * Las rutas pueden ser:
 *
 * - rutas normales con `path`
 * - rutas sin path que funcionan como layouts/contenedores
 * - rutas índice
 */

/**
 * Ruta normal.
 *
 * Puede tener `path` y opcionalmente `children`.
 */
export interface StandardRoute {
  /**
   * Ruta.
   *
   * Ejemplos:
   *
   * "/"
   * "/users"
   * "users"
   * ":id"
   * "*"
   */
  path: string;

  /**
   * Componente que representa la ruta.
   */
  element?: ReactNode;

  /**
   * Rutas hijas.
   *
   * Permite construir estructuras anidadas.
   */
  children?: AppRoute[];

  /**
   * Una ruta normal nunca es una ruta índice.
   */
  index?: false;

  meta?: RouteMeta;
}

/**
 * Ruta contenedora sin path.
 *
 * Es útil para layouts que agrupan rutas hijas.
 *
 * Ejemplo:
 *
 * {
 *   element: <AppLayout />,
 *   children: [...]
 * }
 */
export interface PathlessRoute {
  /**
   * No puede definir un path.
   */
  path?: never;

  /**
   * Componente que representa el layout/contenedor.
   */
  element?: ReactNode;

  /**
   * Una ruta sin path debe contener rutas hijas.
   */
  children: AppRoute[];

  /**
   * Una ruta contenedora nunca es una ruta índice.
   */
  index?: false;

  meta?: RouteMeta;
}

/**
 * Ruta índice.
 *
 * Una ruta índice pertenece a una ruta padre y representa
 * su contenido por defecto.
 */
export interface IndexRoute {
  /**
   * Identifica explícitamente una ruta índice.
   */
  index: true;

  /**
   * Una ruta índice no puede definir un path.
   */
  path?: never;

  /**
   * Una ruta índice no puede tener rutas hijas.
   */
  children?: never;

  /**
   * Componente que representa la ruta.
   */
  element?: ReactNode;

  meta?: RouteMeta;
}

/**
 * Unión de todas las formas válidas de rutas.
 */
export type AppRoute = StandardRoute | PathlessRoute | IndexRoute;
