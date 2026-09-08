import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Alert from "./Alert";

describe("Alert", () => {
  it("renderiza correctamente", () => {
    render(<Alert>Mensaje</Alert>);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Mensaje")).toBeInTheDocument();
  });

  it("usa la variante default por defecto", () => {
    render(<Alert>Mensaje</Alert>);

    expect(screen.getByRole("alert")).toHaveClass(
      "bg-muted",
      "text-foreground",
    );
  });

  it("aplica la variante success", () => {
    render(<Alert variant="success">Éxito</Alert>);

    expect(screen.getByRole("alert")).toHaveClass(
      "bg-success",
      "text-success-foreground",
    );
  });

  it("aplica la variante warning", () => {
    render(<Alert variant="warning">Advertencia</Alert>);

    expect(screen.getByRole("alert")).toHaveClass(
      "bg-warning",
      "text-warning-foreground",
    );
  });

  it("aplica la variante info", () => {
    render(<Alert variant="info">Información</Alert>);

    expect(screen.getByRole("alert")).toHaveClass(
      "bg-info",
      "text-info-foreground",
    );
  });

  it("aplica la variante destructive", () => {
    render(<Alert variant="destructive">Error</Alert>);

    expect(screen.getByRole("alert")).toHaveClass(
      "bg-destructive",
      "text-destructive-foreground",
    );
  });

  it("mantiene las clases base", () => {
    render(<Alert>Mensaje</Alert>);

    expect(screen.getByRole("alert")).toHaveClass(
      "w-full",
      "rounded-lg",
      "border",
      "border-border",
      "p-4",
      "text-sm",
    );
  });

  it("permite agregar className personalizada", () => {
    render(<Alert className="custom-alert">Mensaje</Alert>);

    expect(screen.getByRole("alert")).toHaveClass("custom-alert");
  });

  it("pasa atributos HTML al elemento", () => {
    render(
      <Alert
        id="system-alert"
        data-testid="alert"
        aria-label="Aviso del sistema"
      >
        Mensaje
      </Alert>,
    );

    const alert = screen.getByTestId("alert");

    expect(alert).toHaveAttribute("id", "system-alert");

    expect(alert).toHaveAttribute("aria-label", "Aviso del sistema");
  });

  it("renderiza children complejos", () => {
    render(
      <Alert>
        <strong>Título</strong>
        <span>Descripción</span>
      </Alert>,
    );

    expect(screen.getByText("Título")).toBeInTheDocument();

    expect(screen.getByText("Descripción")).toBeInTheDocument();
  });

  it("conserva role alert aunque reciba otros atributos", () => {
    render(<Alert aria-live="polite">Mensaje</Alert>);

    const alert = screen.getByRole("alert");

    expect(alert).toHaveAttribute("aria-live", "polite");
  });
});
