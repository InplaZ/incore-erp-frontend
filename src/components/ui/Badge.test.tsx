import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Badge from "./Badge";

describe("Badge", () => {
  it("renderiza correctamente", () => {
    render(<Badge>Estado</Badge>);

    expect(screen.getByText("Estado")).toBeInTheDocument();
  });

  it("renderiza como span", () => {
    render(<Badge>Estado</Badge>);

    expect(screen.getByText("Estado").tagName).toBe("SPAN");
  });

  it("usa la variante primary por defecto", () => {
    render(<Badge>Estado</Badge>);

    expect(screen.getByText("Estado")).toHaveClass(
      "bg-primary",
      "text-primary-foreground",
    );
  });

  it("aplica la variante secondary", () => {
    render(<Badge variant="secondary">Estado</Badge>);

    expect(screen.getByText("Estado")).toHaveClass(
      "bg-secondary",
      "text-secondary-foreground",
    );
  });

  it("aplica la variante success", () => {
    render(<Badge variant="success">Activo</Badge>);

    expect(screen.getByText("Activo")).toHaveClass(
      "bg-success",
      "text-success-foreground",
    );
  });

  it("aplica la variante warning", () => {
    render(<Badge variant="warning">Pendiente</Badge>);

    expect(screen.getByText("Pendiente")).toHaveClass(
      "bg-warning",
      "text-warning-foreground",
    );
  });

  it("aplica la variante info", () => {
    render(<Badge variant="info">Información</Badge>);

    expect(screen.getByText("Información")).toHaveClass(
      "bg-info",
      "text-info-foreground",
    );
  });

  it("aplica la variante destructive", () => {
    render(<Badge variant="destructive">Error</Badge>);

    expect(screen.getByText("Error")).toHaveClass(
      "bg-destructive",
      "text-destructive-foreground",
    );
  });

  it("aplica la variante outline", () => {
    render(<Badge variant="outline">Borrador</Badge>);

    expect(screen.getByText("Borrador")).toHaveClass(
      "border",
      "border-border",
      "bg-transparent",
      "text-foreground",
    );
  });

  it("mantiene las clases base", () => {
    render(<Badge>Estado</Badge>);

    expect(screen.getByText("Estado")).toHaveClass(
      "inline-flex",
      "items-center",
      "rounded-full",
      "px-2.5",
      "py-0.5",
      "text-xs",
      "font-medium",
    );
  });

  it("permite agregar className personalizada", () => {
    render(<Badge className="custom-badge">Estado</Badge>);

    expect(screen.getByText("Estado")).toHaveClass("custom-badge");
  });

  it("pasa atributos HTML al span", () => {
    render(
      <Badge id="status-badge" data-testid="badge" aria-label="Estado actual">
        Activo
      </Badge>,
    );

    const badge = screen.getByTestId("badge");

    expect(badge).toHaveAttribute("id", "status-badge");

    expect(badge).toHaveAttribute("aria-label", "Estado actual");
  });

  it("renderiza children complejos", () => {
    render(
      <Badge>
        <strong>Activo</strong>
        <span> ahora</span>
      </Badge>,
    );

    expect(screen.getByText("Activo")).toBeInTheDocument();

    expect(
      screen.getByText((content) => content.trim() === "ahora"),
    ).toBeInTheDocument();
  });
});
