import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { ThemeProvider } from "../../theme";
import { AppLayout } from "./app-layout";

function renderAppLayout(initialEntry = "/") {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<div>Contenido principal</div>} />

            <Route path="/otra-ruta" element={<div>Otra página</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe("AppLayout", () => {
  it("renderiza el layout principal", () => {
    renderAppLayout();

    expect(screen.getAllByText("Frontend Template")).toHaveLength(2);

    expect(screen.getByText("Contenido principal")).toBeInTheDocument();
  });

  it("renderiza el Header", () => {
    renderAppLayout();

    expect(
      screen.getByRole("heading", {
        name: "Frontend Template",
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
