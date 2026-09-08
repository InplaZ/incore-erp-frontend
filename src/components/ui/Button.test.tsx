import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Button from "./Button";

describe("Button", () => {
  it("renderiza correctamente", () => {
    render(<Button>Guardar</Button>);

    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
  });

  it("usa type=button por defecto", () => {
    render(<Button>Guardar</Button>);

    expect(screen.getByRole("button", { name: "Guardar" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("permite definir type", () => {
    render(<Button type="submit">Guardar</Button>);

    expect(screen.getByRole("button", { name: "Guardar" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("ejecuta onClick", () => {
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Guardar</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("respeta disabled", () => {
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Guardar
      </Button>,
    );

    const button = screen.getByRole("button", {
      name: "Guardar",
    });

    expect(button).toBeDisabled();

    fireEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("deshabilita el botón cuando loading es true", () => {
    render(<Button loading>Guardando</Button>);

    const button = screen.getByRole("button", {
      name: /Guardando/,
    });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("muestra el spinner cuando loading es true", () => {
    render(<Button loading>Guardando</Button>);

    expect(
      screen.getByRole("status", { name: "Cargando" }),
    ).toBeInTheDocument();
  });

  it("no muestra aria-busy cuando loading es false", () => {
    render(<Button>Guardar</Button>);

    expect(screen.getByRole("button", { name: "Guardar" })).not.toHaveAttribute(
      "aria-busy",
    );
  });

  it("aplica fullWidth", () => {
    render(<Button fullWidth>Guardar</Button>);

    expect(screen.getByRole("button", { name: "Guardar" })).toHaveClass(
      "w-full",
    );
  });

  it("aplica className personalizada", () => {
    render(<Button className="mi-clase">Guardar</Button>);

    expect(screen.getByRole("button", { name: "Guardar" })).toHaveClass(
      "mi-clase",
    );
  });

  it.each([
    ["primary", "bg-primary"],
    ["secondary", "bg-secondary"],
    ["destructive", "bg-destructive"],
    ["ghost", "bg-transparent"],
    ["outline", "border-border"],
  ] as const)("aplica la variante %s", (variant, expectedClass) => {
    render(<Button variant={variant}>Acción</Button>);

    expect(screen.getByRole("button", { name: "Acción" })).toHaveClass(
      expectedClass,
    );
  });

  it.each([
    ["sm", "h-9"],
    ["md", "h-10"],
    ["lg", "h-11"],
  ] as const)("aplica el tamaño %s", (size, expectedClass) => {
    render(<Button size={size}>Acción</Button>);

    expect(screen.getByRole("button", { name: "Acción" })).toHaveClass(
      expectedClass,
    );
  });

  it("pasa atributos nativos al button", () => {
    render(
      <Button
        id="save-button"
        title="Guardar cambios"
        data-testid="custom-button"
      >
        Guardar
      </Button>,
    );

    const button = screen.getByRole("button", {
      name: "Guardar",
    });

    expect(button).toHaveAttribute("id", "save-button");
    expect(button).toHaveAttribute("title", "Guardar cambios");
    expect(button).toHaveAttribute("data-testid", "custom-button");
  });

  it("conserva los children mientras muestra loading", () => {
    render(<Button loading>Procesando</Button>);

    expect(screen.getByText("Procesando")).toBeInTheDocument();

    expect(
      screen.getByRole("status", { name: "Cargando" }),
    ).toBeInTheDocument();
  });

  it("loading tiene prioridad sobre disabled false", () => {
    render(
      <Button disabled={false} loading>
        Procesando
      </Button>,
    );

    expect(screen.getByRole("button", { name: /Procesando/ })).toBeDisabled();
  });

  it("permite combinar fullWidth con una variante y tamaño", () => {
    render(
      <Button variant="outline" size="lg" fullWidth>
        Continuar
      </Button>,
    );

    const button = screen.getByRole("button", {
      name: "Continuar",
    });

    expect(button).toHaveClass("border-border", "h-11", "w-full");
  });
});
