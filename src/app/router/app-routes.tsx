import { lazy } from "react";
import { Navigate } from "react-router-dom";

import type { AppRoute } from "./route.types";

// Layout
const AppLayout = lazy(
  () => import("../../pages/layouts/app-layout"),
);

// Public pages
const LoginPage = lazy(
  () => import("../../features/auth/LoginPage"),
);

// Application pages
const HomePage = lazy(
  () => import("../../pages/home/home-page"),
);

const DashboardPage = lazy(
  () => import("../../pages/dashboard/dashboard-page"),
);

const UiPlaygroundPage = lazy(
  () => import("../../pages/ui-playground/ui-playground-page"),
);

const AdminPage = lazy(
  () => import("../../features/admin/AdminPage"),
);

// Error
const NotFoundPage = lazy(
  () => import("../../pages/not-found/not-found-page"),
);

export const appRoutes: AppRoute[] = [
  // ============================================================
  // PUBLIC ROUTES
  // Estas rutas NO utilizan AppLayout
  // Por lo tanto NO tienen Sidebar ni Header
  // ============================================================

  {
    path: "/login",
    element: <LoginPage />,
  },

  // ============================================================
  // APPLICATION ROUTES
  // Estas rutas SÍ utilizan AppLayout
  // ============================================================

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

  // ============================================================
  // REDIRECTS
  // ============================================================

  {
    path: "/old-dashboard",
    element: <Navigate to="/dashboard" replace />,
  },

  // ============================================================
  // FALLBACK
  // ============================================================
  {
    path: "*",
    element: <NotFoundPage />,
  },
];