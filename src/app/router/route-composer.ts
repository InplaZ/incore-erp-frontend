import type { AppRoute } from "./route.types";

/**
 * ===========================================================================
 * ROUTE COMPOSER
 * ===========================================================================
 *
 * Combina diferentes grupos de rutas en una única colección.
 *
 * Este helper es completamente agnóstico del dominio.
 *
 * Puede recibir:
 *
 * - rutas públicas
 * - rutas privadas
 * - rutas de autenticación
 * - rutas de un módulo
 * - rutas de administración
 * - rutas de reportes
 * - etc.
 *
 * El composer NO:
 *
 * - autentica usuarios
 * - valida permisos
 * - modifica rutas
 * - elimina duplicados
 * - conoce módulos de negocio
 *
 * Su única responsabilidad es componer las colecciones
 * de rutas proporcionadas por la aplicación.
 */

export const composeRoutes = (...routeGroups: AppRoute[][]): AppRoute[] => {
  return routeGroups.flat();
};
