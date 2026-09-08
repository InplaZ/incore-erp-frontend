import { lazy } from "react";
import { Navigate } from "react-router-dom";

import type { AppRoute } from "./route.types";

const UiPlaygroundPage = lazy(
  () => import("../../pages/ui-playground/ui-playground-page"),
);

const HomePage = lazy(() => import("../../pages/home/home-page"));

const NotFoundPage = lazy(() => import("../../pages/not-found/not-found-page"));

const AppLayout = lazy(() => import("../../pages/layouts/app-layout"));

const DashboardPage = lazy(
  () => import("../../pages/dashboard/dashboard-page"),
);

/**
 * ============================================================================
 * APPLICATION ROUTES
 * ============================================================================
 *
 * Configuración de rutas específica de la aplicación.
 *
 * El router genérico únicamente interpreta esta estructura.
 */
export const appRoutes: AppRoute[] = [
  /**
   * --------------------------------------------------------------------------
   * APPLICATION LAYOUT
   * --------------------------------------------------------------------------
   *
   * Las rutas principales de la aplicación comparten:
   *
   * - Sidebar
   * - Header
   * - Área de contenido
   */
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/ui-playground",
        element: <UiPlaygroundPage />,
      },
    ],
  },

  /**
   * --------------------------------------------------------------------------
   * REDIRECT
   * --------------------------------------------------------------------------
   */
  {
    path: "/old-dashboard",
    element: <Navigate to="/dashboard" replace />,
  },

  /**
   * --------------------------------------------------------------------------
   * FALLBACK
   * --------------------------------------------------------------------------
   */
  {
    path: "*",
    element: <NotFoundPage />,
  },
];
