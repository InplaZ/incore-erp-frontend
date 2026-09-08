import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Label from "./Label";

describe("Label", () => {
  it("renderiza correctamente", () => {
    render(<Label>Nombre</Label>);

    expect(screen.getByText("Nombre")).toBeInTheDocument();
  });

  it("renderiza como label", () => {
    render(<Label>Nombre</Label>);

    expect(screen.getByText("Nombre").tagName).toBe("LABEL");
  });

  it("aplica las clases base", () => {
    render(<Label>Nombre</Label>);

    expect(screen.getByText("Nombre")).toHaveClass(
      "text-sm",
      "font-medium",
      "text-foreground",
      "peer-disabled:cursor-not-allowed",
      "peer-disabled:opacity-50",
    );
  });

  it("permite className personalizada", () => {
    render(<Label className="custom-label">Nombre</Label>);

    expect(screen.getByText("Nombre")).toHaveClass("custom-label");
  });

  it("pasa htmlFor al label", () => {
    render(<Label htmlFor="username">Usuario</Label>);

    expect(screen.getByText("Usuario")).toHaveAttribute("for", "username");
  });

  it("pasa atributos HTML al label", () => {
    render(
      <Label
        id="username-label"
        data-testid="label"
        aria-label="Campo usuario"
        title="Nombre de usuario"
      >
        Usuario
      </Label>,
    );

    const label = screen.getByTestId("label");

    expect(label).toHaveAttribute("id", "username-label");

    expect(label).toHaveAttribute("aria-label", "Campo usuario");

    expect(label).toHaveAttribute("title", "Nombre de usuario");
  });

  it("renderiza children complejos", () => {
    render(
      <Label>
        <strong>Usuario</strong>
        <span> requerido</span>
      </Label>,
    );

    expect(screen.getByText("Usuario")).toBeInTheDocument();

    expect(
      screen.getByText((content) => content.trim() === "requerido"),
    ).toBeInTheDocument();
  });

  it("permite asociarse correctamente con un input", () => {
    render(
      <>
        <Label htmlFor="email">Correo electrónico</Label>

        <input id="email" />
      </>,
    );

    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
  });
});
