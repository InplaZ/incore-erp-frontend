import { describe, expect, it } from "vitest";

import { composeRoutes } from "./route-composer";
import type { AppRoute } from "./route.types";

describe("composeRoutes", () => {
  it("combina múltiples grupos de rutas", () => {
    const firstRoutes: AppRoute[] = [
      {
        path: "/login",
      },
    ];

    const secondRoutes: AppRoute[] = [
      {
        path: "/dashboard",
      },
    ];

    const thirdRoutes: AppRoute[] = [
      {
        path: "/users",
      },
      {
        path: "/users/:id",
      },
    ];

    const result = composeRoutes(
      firstRoutes,
      secondRoutes,
      thirdRoutes,
    );

    expect(result).toEqual([
      {
        path: "/login",
      },
      {
        path: "/dashboard",
      },
      {
        path: "/users",
      },
      {
        path: "/users/:id",
      },
    ]);
  });

  it("mantiene el orden de los grupos recibidos", () => {
    const firstRoutes: AppRoute[] = [
      {
        path: "/first",
      },
    ];

    const secondRoutes: AppRoute[] = [
      {
        path: "/second",
      },
    ];

    expect(composeRoutes(firstRoutes, secondRoutes)).toEqual([
      {
        path: "/first",
      },
      {
        path: "/second",
      },
    ]);
  });

  it("permite componer cero grupos", () => {
    expect(composeRoutes()).toEqual([]);
  });

  it("permite grupos vacíos", () => {
    const routes: AppRoute[] = [
      {
        path: "/dashboard",
      },
    ];

    expect(composeRoutes([], routes, [])).toEqual(routes);
  });
});