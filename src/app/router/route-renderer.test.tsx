import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Navigate, Outlet } from "react-router-dom";

import { RouteRenderer } from "./route-renderer";
import type { AppRoute } from "./route.types";

describe("RouteRenderer", () => {
  it("renderiza una ruta normal", () => {
    const routes: AppRoute[] = [
      {
        path: "/",
        element: <div>Home</div>,
      },
    ];

    render(
      <MemoryRouter initialEntries={["/"]}>
        <RouteRenderer routes={routes} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Home")).toBeDefined();
  });

  it("renderiza una ruta wildcard cuando no existe coincidencia", () => {
    const routes: AppRoute[] = [
      {
        path: "/",
        element: <div>Home</div>,
      },
      {
        path: "*",
        element: <div>Not Found</div>,
      },
    ];

    render(
      <MemoryRouter initialEntries={["/ruta-inexistente"]}>
        <RouteRenderer routes={routes} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Not Found")).toBeDefined();
  });

  it("renderiza rutas hijas dentro de un layout", () => {
    const Layout = () => (
      <div>
        <header>Application Layout</header>
        <Outlet />
      </div>
    );

    const routes: AppRoute[] = [
      {
        element: <Layout />,
        children: [
          {
            path: "/dashboard",
            element: <div>Dashboard Page</div>,
          },
        ],
      },
    ];

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <RouteRenderer routes={routes} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Application Layout")).toBeDefined();

    expect(screen.getByText("Dashboard Page")).toBeDefined();
  });

  it("renderiza una ruta index dentro de un layout", () => {
    const Layout = () => (
      <div>
        <header>Application Layout</header>
        <Outlet />
      </div>
    );

    const routes: AppRoute[] = [
      {
        path: "/",
        element: <Layout />,
        children: [
          {
            index: true,
            element: <div>Home Page</div>,
          },
        ],
      },
    ];

    render(
      <MemoryRouter initialEntries={["/"]}>
        <RouteRenderer routes={routes} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Application Layout")).toBeDefined();
    expect(screen.getByText("Home Page")).toBeDefined();
  });

  it("renderiza una redirección hacia otra ruta", () => {
    const routes: AppRoute[] = [
      {
        path: "/dashboard",
        element: <div>Dashboard Page</div>,
      },
      {
        path: "/old-dashboard",
        element: <Navigate to="/dashboard" replace />,
      },
    ];

    render(
      <MemoryRouter initialEntries={["/old-dashboard"]}>
        <RouteRenderer routes={routes} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Dashboard Page")).toBeDefined();
  });

  it("protege una ruta cuando requiresAuth es true", () => {
    const routes: AppRoute[] = [
      {
        path: "/dashboard",
        element: <div>Dashboard</div>,
        meta: {
          requiresAuth: true,
        },
      },
    ];

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <RouteRenderer routes={routes} canAccess={() => "denied"} />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Dashboard")).toBeNull();
  });

  it("permite acceder a una ruta protegida cuando canAccess devuelve true", () => {
    const routes: AppRoute[] = [
      {
        path: "/dashboard",
        element: <div>Dashboard</div>,
        meta: {
          requiresAuth: true,
        },
      },
    ];

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <RouteRenderer routes={routes} canAccess={() => "allowed"} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Dashboard")).toBeDefined();
  });

  it("no protege rutas que no requieren autenticación", () => {
    const routes: AppRoute[] = [
      {
        path: "/public",
        element: <div>Public Page</div>,
      },
    ];

    render(
      <MemoryRouter initialEntries={["/public"]}>
        <RouteRenderer routes={routes} canAccess={() => "denied"} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Public Page")).toBeDefined();
  });
});
