import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./Card";

describe("Card", () => {
  it("renderiza correctamente", () => {
    render(<Card>Contenido</Card>);

    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });

  it("renderiza como div", () => {
    render(<Card>Contenido</Card>);

    expect(screen.getByText("Contenido").tagName).toBe("DIV");
  });

  it("aplica las clases base", () => {
    render(<Card>Contenido</Card>);

    expect(screen.getByText("Contenido")).toHaveClass(
      "rounded-xl",
      "border",
      "border-border",
      "bg-card",
      "text-card-foreground",
      "shadow-sm",
    );
  });

  it("permite className personalizada", () => {
    render(<Card className="custom-card">Contenido</Card>);

    expect(screen.getByText("Contenido")).toHaveClass("custom-card");
  });

  it("pasa atributos HTML al elemento", () => {
    render(
      <Card id="main-card" data-testid="card" aria-label="Tarjeta principal">
        Contenido
      </Card>,
    );

    const card = screen.getByTestId("card");

    expect(card).toHaveAttribute("id", "main-card");
    expect(card).toHaveAttribute("aria-label", "Tarjeta principal");
  });

  it("renderiza children complejos", () => {
    render(
      <Card>
        <span>Primero</span>
        <span>Segundo</span>
      </Card>,
    );

    expect(screen.getByText("Primero")).toBeInTheDocument();
    expect(screen.getByText("Segundo")).toBeInTheDocument();
  });
});

describe("CardHeader", () => {
  it("renderiza correctamente", () => {
    render(<CardHeader>Encabezado</CardHeader>);

    expect(screen.getByText("Encabezado")).toBeInTheDocument();
  });

  it("aplica las clases base", () => {
    render(<CardHeader>Encabezado</CardHeader>);

    expect(screen.getByText("Encabezado")).toHaveClass(
      "flex",
      "flex-col",
      "gap-1.5",
      "p-6",
    );
  });

  it("permite className personalizada", () => {
    render(<CardHeader className="custom-header">Encabezado</CardHeader>);

    expect(screen.getByText("Encabezado")).toHaveClass("custom-header");
  });
});

describe("CardTitle", () => {
  it("renderiza como h3", () => {
    render(<CardTitle>Título</CardTitle>);

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Título",
      }),
    ).toBeInTheDocument();
  });

  it("aplica las clases base", () => {
    render(<CardTitle>Título</CardTitle>);

    expect(screen.getByRole("heading")).toHaveClass(
      "text-lg",
      "font-semibold",
      "leading-none",
      "tracking-tight",
    );
  });

  it("permite className personalizada", () => {
    render(<CardTitle className="custom-title">Título</CardTitle>);

    expect(screen.getByRole("heading")).toHaveClass("custom-title");
  });
});

describe("CardDescription", () => {
  it("renderiza como párrafo", () => {
    render(<CardDescription>Descripción</CardDescription>);

    expect(screen.getByText("Descripción").tagName).toBe("P");
  });

  it("aplica las clases base", () => {
    render(<CardDescription>Descripción</CardDescription>);

    expect(screen.getByText("Descripción")).toHaveClass(
      "text-sm",
      "text-muted-foreground",
    );
  });

  it("permite className personalizada", () => {
    render(
      <CardDescription className="custom-description">
        Descripción
      </CardDescription>,
    );

    expect(screen.getByText("Descripción")).toHaveClass("custom-description");
  });
});

describe("CardContent", () => {
  it("renderiza correctamente", () => {
    render(<CardContent>Contenido</CardContent>);

    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });

  it("aplica las clases base", () => {
    render(<CardContent>Contenido</CardContent>);

    expect(screen.getByText("Contenido")).toHaveClass("px-6", "pb-6");
  });

  it("permite className personalizada", () => {
    render(<CardContent className="custom-content">Contenido</CardContent>);

    expect(screen.getByText("Contenido")).toHaveClass("custom-content");
  });
});

describe("CardFooter", () => {
  it("renderiza correctamente", () => {
    render(<CardFooter>Acciones</CardFooter>);

    expect(screen.getByText("Acciones")).toBeInTheDocument();
  });

  it("aplica las clases base", () => {
    render(<CardFooter>Acciones</CardFooter>);

    expect(screen.getByText("Acciones")).toHaveClass(
      "flex",
      "items-center",
      "px-6",
      "pb-6",
    );
  });

  it("permite className personalizada", () => {
    render(<CardFooter className="custom-footer">Acciones</CardFooter>);

    expect(screen.getByText("Acciones")).toHaveClass("custom-footer");
  });
});

describe("Card composition", () => {
  it("permite componer todas las partes", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Mi tarjeta</CardTitle>
          <CardDescription>Información adicional</CardDescription>
        </CardHeader>

        <CardContent>Contenido principal</CardContent>

        <CardFooter>Acciones</CardFooter>
      </Card>,
    );

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Mi tarjeta",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Información adicional")).toBeInTheDocument();

    expect(screen.getByText("Contenido principal")).toBeInTheDocument();

    expect(screen.getByText("Acciones")).toBeInTheDocument();
  });
});
