/* eslint-disable react-refresh/only-export-components */

import { lazy } from "react";
import { Navigate } from "react-router-dom";

import type { AppRoute } from "./route.types";

const UiPlaygroundPage = lazy(
  () => import("@/pages/ui-playground/ui-playground-page")
);

const HomePage = lazy(
  () => import("@/pages/home/home-page")
);

const NotFoundPage = lazy(
  () => import("@/pages/not-found/not-found-page")
);

const AppLayout = lazy(
  () => import("@/pages/layouts/app-layout")
);

const DashboardPage = lazy(
  () => import("@/pages/dashboard/dashboard-page")
);

const AdminPage = lazy(
  () => import("@/features/admin/AdminPage")
);

const LoginPage = lazy(
  () => import("@/features/auth/LoginPage")
);

export const appRoutes: AppRoute[] = [
  /**
   * LOGIN
   * No utiliza AppLayout.
   */
  {
    path: "/auth",
    element: <LoginPage />,
  },

  /**
   * APLICACIÓN
   */
  {
  element: <AppLayout />,
  meta: {
    requiresAuth: true,
  },
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
    {
      path: "/admin",
      element: <AdminPage />,
    },
  ],
},

  /**
   * REDIRECT
   */
  {
    path: "/old-dashboard",
    element: <Navigate to="/dashboard" replace />,
  },

  /**
   * FALLBACK
   */
  {
    path: "*",
    element: <NotFoundPage />,
  },
];