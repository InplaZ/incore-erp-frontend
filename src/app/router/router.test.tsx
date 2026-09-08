import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { AppRouter } from "./router";

vi.mock("./route-renderer", () => ({
  RouteRenderer: ({
    routes,
    canAccess,
  }: {
    routes: unknown[];
    canAccess?: (route: unknown) => "allowed" | "denied" | "pending";
  }) => (
    <div>
      <div>Route count: {routes.length}</div>

      <div>
        Access result:{" "}
        {canAccess
          ? canAccess({
              path: "/dashboard",
              meta: {
                requiresAuth: true,
              },
            })
          : "not provided"}
      </div>
    </div>
  ),
}));

describe("AppRouter", () => {
  it("renderiza correctamente el router", () => {
    render(<AppRouter />);

    expect(screen.getByText(/Route count:/)).toBeDefined();
  });

  it("funciona sin una estrategia de acceso", () => {
    render(<AppRouter />);

    expect(screen.getByText("Access result: not provided")).toBeDefined();
  });

  it("transmite canAccess al RouteRenderer", () => {
    const canAccess = vi.fn(() => "allowed" as const);

    render(<AppRouter canAccess={canAccess} />);

    expect(screen.getByText("Access result: allowed")).toBeDefined();

    expect(canAccess).toHaveBeenCalledTimes(1);
  });

  it("permite transmitir una estrategia que deniega el acceso", () => {
    const canAccess = vi.fn(() => "denied" as const);

    render(<AppRouter canAccess={canAccess} />);

    expect(screen.getByText("Access result: denied")).toBeDefined();
  });

  it("permite transmitir una estrategia cuyo acceso está pendiente", () => {
    const canAccess = vi.fn(() => "pending" as const);

    render(<AppRouter canAccess={canAccess} />);

    expect(screen.getByText("Access result: pending")).toBeDefined();
  });
});
