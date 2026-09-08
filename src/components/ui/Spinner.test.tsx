import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Spinner from "./Spinner";

describe("Spinner", () => {
  it("renderiza correctamente", () => {
    render(<Spinner />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("usa el tamaño md por defecto", () => {
    render(<Spinner />);

    const spinner = screen.getByRole("status");

    expect(spinner).toHaveClass("size-6", "border-2");
  });

  it("aplica el tamaño sm", () => {
    render(<Spinner size="sm" />);

    const spinner = screen.getByRole("status");

    expect(spinner).toHaveClass("size-4", "border-2");
  });

  it("aplica el tamaño lg", () => {
    render(<Spinner size="lg" />);

    const spinner = screen.getByRole("status");

    expect(spinner).toHaveClass("size-8", "border-[3px]");
  });

  it("aplica las clases base", () => {
    render(<Spinner />);

    const spinner = screen.getByRole("status");

    expect(spinner).toHaveClass(
      "animate-spin",
      "rounded-full",
      "border-current",
      "border-t-transparent",
    );
  });

  it("aplica className personalizada", () => {
    render(<Spinner className="custom-spinner" />);

    expect(screen.getByRole("status")).toHaveClass("custom-spinner");
  });

  it("combina className personalizada con las clases base", () => {
    render(<Spinner className="text-primary custom-spinner" />);

    const spinner = screen.getByRole("status");

    expect(spinner).toHaveClass(
      "animate-spin",
      "rounded-full",
      "border-current",
      "border-t-transparent",
      "text-primary",
      "custom-spinner",
    );
  });

  it("pasa atributos HTML al elemento", () => {
    render(
      <Spinner
        id="loading-spinner"
        data-testid="spinner"
        aria-label="Cargando información"
      />,
    );

    const spinner = screen.getByRole("status", {
      name: "Cargando información",
    });

    expect(spinner).toHaveAttribute("id", "loading-spinner");

    expect(spinner).toHaveAttribute("data-testid", "spinner");

    expect(spinner).toHaveAttribute("aria-label", "Cargando información");
  });

  it("mantiene role=status", () => {
    render(<Spinner aria-label="Cargando" />);

    expect(
      screen.getByRole("status", {
        name: "Cargando",
      }),
    ).toBeInTheDocument();
  });

  it("permite utilizar contenido adicional", () => {
    render(
      <Spinner>
        <span>Cargando</span>
      </Spinner>,
    );

    expect(screen.getByText("Cargando")).toBeInTheDocument();
  });
});
