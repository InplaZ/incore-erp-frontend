import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { RouteGuard } from "./route-guard";
import type { AppRoute } from "./route.types";

describe("RouteGuard", () => {
  it("renderiza una ruta que no requiere autenticación", () => {
    const route: AppRoute = {
      path: "/public",
      element: <div>Public Page</div>,
    };

    render(
      <MemoryRouter>
        <RouteGuard route={route} canAccess={() => "denied"}>
          <div>Public Page</div>
        </RouteGuard>
      </MemoryRouter>,
    );

    expect(screen.getByText("Public Page")).toBeDefined();
  });

  it("renderiza una ruta protegida cuando canAccess devuelve true", () => {
    const route: AppRoute = {
      path: "/dashboard",
      element: <div>Dashboard</div>,
      meta: {
        requiresAuth: true,
      },
    };

    render(
      <MemoryRouter>
        <RouteGuard route={route} canAccess={() => "allowed"}>
          <div>Dashboard</div>
        </RouteGuard>
      </MemoryRouter>,
    );

    expect(screen.getByText("Dashboard")).toBeDefined();
  });

  it("no renderiza una ruta protegida cuando canAccess devuelve false", () => {
    const route: AppRoute = {
      path: "/dashboard",
      element: <div>Dashboard</div>,
      meta: {
        requiresAuth: true,
      },
    };

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <RouteGuard route={route} canAccess={() => "denied"}>
          <div>Dashboard</div>
        </RouteGuard>
      </MemoryRouter>,
    );

    expect(screen.queryByText("Dashboard")).toBeNull();
  });

  it("utiliza el fallback cuando una ruta protegida no puede ser accedida", () => {
    const route: AppRoute = {
      path: "/dashboard",
      element: <div>Dashboard</div>,
      meta: {
        requiresAuth: true,
      },
    };

    render(
      <MemoryRouter>
        <RouteGuard
          route={route}
          canAccess={() => "denied"}
          fallback={<div>Access Denied</div>}
        >
          <div>Dashboard</div>
        </RouteGuard>
      </MemoryRouter>,
    );

    expect(screen.getByText("Access Denied")).toBeDefined();
    expect(screen.queryByText("Dashboard")).toBeNull();
  });

  it("utiliza el fallback por defecto cuando no se proporciona uno", () => {
    const route: AppRoute = {
      path: "/dashboard",
      element: <div>Dashboard</div>,
      meta: {
        requiresAuth: true,
      },
    };

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <RouteGuard route={route} canAccess={() => "denied"}>
          <div>Dashboard</div>
        </RouteGuard>
      </MemoryRouter>,
    );

    expect(screen.queryByText("Dashboard")).toBeNull();
  });

  it("permite que canAccess evalúe los roles de la ruta", () => {
    const route: AppRoute = {
      path: "/admin",
      element: <div>Admin Page</div>,
      meta: {
        requiresAuth: true,
        roles: ["admin"],
      },
    };

    const canAccess = (currentRoute: AppRoute) => {
      return currentRoute.meta?.roles?.includes("admin") ? "allowed" : "denied";
    };

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <RouteGuard route={route} canAccess={canAccess}>
          <div>Admin Page</div>
        </RouteGuard>
      </MemoryRouter>,
    );

    expect(screen.getByText("Admin Page")).toBeDefined();
  });

  it("permite que canAccess evalúe los permisos de la ruta", () => {
    const route: AppRoute = {
      path: "/reports",
      element: <div>Reports Page</div>,
      meta: {
        requiresAuth: true,
        permissions: ["reports.view"],
      },
    };

    const canAccess = (currentRoute: AppRoute) => {
      return currentRoute.meta?.permissions?.includes("reports.view")
        ? "allowed"
        : "denied";
    };

    render(
      <MemoryRouter initialEntries={["/reports"]}>
        <RouteGuard route={route} canAccess={canAccess}>
          <div>Reports Page</div>
        </RouteGuard>
      </MemoryRouter>,
    );

    expect(screen.getByText("Reports Page")).toBeDefined();
  });

  it("renderiza el fallback pendiente cuando el acceso está pendiente", () => {
    const route: AppRoute = {
      path: "/dashboard",
      element: <div>Dashboard</div>,
      meta: { requiresAuth: true },
    };

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <RouteGuard
          route={route}
          canAccess={() => "pending"}
          pendingFallback={<div>Checking access...</div>}
        >
          <div>Dashboard</div>
        </RouteGuard>
      </MemoryRouter>,
    );

    expect(screen.getByText("Checking access...")).toBeDefined();
    expect(screen.queryByText("Dashboard")).toBeNull();
  });

  it("utiliza un fallback pendiente por defecto", () => {
    const route: AppRoute = {
      path: "/dashboard",
      element: <div>Dashboard</div>,
      meta: { requiresAuth: true },
    };

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <RouteGuard route={route} canAccess={() => "pending"}>
          <div>Dashboard</div>
        </RouteGuard>
      </MemoryRouter>,
    );

    expect(screen.getByText("Cargando...")).toBeDefined();
    expect(screen.queryByText("Dashboard")).toBeNull();
  });
});
