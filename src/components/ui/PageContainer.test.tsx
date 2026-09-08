import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PageContainer from "./PageContainer";

describe("PageContainer", () => {
  it("renderiza correctamente", () => {
    render(<PageContainer>Contenido</PageContainer>);

    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });

  it("renderiza como un div", () => {
    render(<PageContainer>Contenido</PageContainer>);

    expect(screen.getByText("Contenido").tagName).toBe("DIV");
  });

  it("aplica la clase container", () => {
    render(<PageContainer>Contenido</PageContainer>);

    expect(screen.getByText("Contenido")).toHaveClass("container");
  });

  it("aplica className personalizada", () => {
    render(
      <PageContainer className="custom-container">Contenido</PageContainer>,
    );

    expect(screen.getByText("Contenido")).toHaveClass(
      "container",
      "custom-container",
    );
  });

  it("pasa atributos HTML al div", () => {
    render(
      <PageContainer
        id="main-container"
        data-testid="page-container"
        aria-label="Contenido principal"
      >
        Contenido
      </PageContainer>,
    );

    const container = screen.getByTestId("page-container");

    expect(container).toHaveAttribute("id", "main-container");

    expect(container).toHaveAttribute("data-testid", "page-container");

    expect(container).toHaveAttribute("aria-label", "Contenido principal");
  });

  it("renderiza children correctamente", () => {
    render(
      <PageContainer>
        <h1>Título</h1>
        <p>Descripción</p>
      </PageContainer>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Título",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Descripción")).toBeInTheDocument();
  });

  it("permite múltiples elementos hijos", () => {
    render(
      <PageContainer>
        <span>Primero</span>
        <span>Segundo</span>
        <span>Tercero</span>
      </PageContainer>,
    );

    expect(screen.getByText("Primero")).toBeInTheDocument();

    expect(screen.getByText("Segundo")).toBeInTheDocument();

    expect(screen.getByText("Tercero")).toBeInTheDocument();
  });

  it("permite usar ref", () => {
    const containerRef = { current: null };

    render(<PageContainer ref={containerRef}>Contenido</PageContainer>);

    expect(containerRef.current).toBe(screen.getByText("Contenido"));
  });
});
