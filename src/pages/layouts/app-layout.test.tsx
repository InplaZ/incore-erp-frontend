import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "../../theme";
import { AppLayout } from "./app-layout";

vi.mock("@/features/notificaciones/notificaciones.api", () => ({
  notificacionesApi: {
    list: async () => [],
    countUnread: async () => ({ count: 0 }),
    markRead: async () => ({}),
    markAllRead: async () => ({ actualizadas: 0 }),
  },
}));

function renderAppLayout(initialEntry = "/") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<div>Contenido principal</div>} />

              <Route path="/otra-ruta" element={<div>Otra página</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

describe("AppLayout", () => {
  it("renderiza el layout principal", () => {
    renderAppLayout();

    expect(screen.getAllByText("INPLAZ")).toHaveLength(2);

    expect(screen.getByText("Contenido principal")).toBeInTheDocument();
  });

  it("renderiza el Header", () => {
    renderAppLayout();

    expect(
      screen.getByRole("heading", {
        name: "INPLAZ",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Abrir menú",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Buscar",
      }),
    ).toBeInTheDocument();
  });

  it("renderiza el contenido de la ruta actual mediante Outlet", () => {
    renderAppLayout("/otra-ruta");

    expect(screen.getByText("Otra página")).toBeInTheDocument();

    expect(screen.queryByText("Contenido principal")).not.toBeInTheDocument();
  });

  it("abre el Sidebar móvil desde el Header", async () => {
    const user = userEvent.setup();

    renderAppLayout();

    const menuButton = screen.getByRole("button", {
      name: "Abrir menú",
    });

    await user.click(menuButton);

    expect(
      screen.getAllByRole("button", {
        name: "Cerrar menú",
      }),
    ).toHaveLength(2);
  });
});
