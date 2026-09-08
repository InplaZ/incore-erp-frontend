import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Input from "./Input";

describe("Input", () => {
  it("renderiza correctamente", () => {
    render(<Input aria-label="Nombre" />);

    expect(screen.getByRole("textbox", { name: "Nombre" })).toBeInTheDocument();
  });

  it("aplica las clases base", () => {
    render(<Input aria-label="Nombre" />);

    expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveClass(
      "h-10",
      "w-full",
      "rounded-md",
      "border-border",
      "bg-background",
      "text-foreground",
    );
  });

  it("aplica className personalizada", () => {
    render(<Input aria-label="Nombre" className="mi-input" />);

    expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveClass(
      "mi-input",
    );
  });

  it("no marca aria-invalid por defecto", () => {
    render(<Input aria-label="Nombre" />);

    expect(screen.getByRole("textbox", { name: "Nombre" })).not.toHaveAttribute(
      "aria-invalid",
    );
  });

  it("marca aria-invalid cuando error es true", () => {
    render(<Input aria-label="Nombre" error />);

    const input = screen.getByRole("textbox", {
      name: "Nombre",
    });

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveClass("border-destructive");
    expect(input).toHaveClass("focus:border-destructive");
    expect(input).toHaveClass("focus:ring-destructive/20");
  });

  it("no aplica clases de error cuando error es false", () => {
    render(<Input aria-label="Nombre" />);

    expect(screen.getByRole("textbox", { name: "Nombre" })).not.toHaveClass(
      "border-destructive",
    );
  });

  it("respeta disabled", () => {
    render(<Input aria-label="Nombre" disabled />);

    const input = screen.getByRole("textbox", {
      name: "Nombre",
    });

    expect(input).toBeDisabled();
    expect(input).toHaveClass(
      "disabled:cursor-not-allowed",
      "disabled:opacity-50",
    );
  });

  it("respeta readOnly", () => {
    render(<Input aria-label="Nombre" readOnly />);

    const input = screen.getByRole("textbox", {
      name: "Nombre",
    });

    expect(input).toHaveAttribute("readonly");
    expect(input).toHaveClass("read-only:bg-muted");
  });

  it("permite definir placeholder", () => {
    render(<Input aria-label="Buscar" placeholder="Buscar usuarios..." />);

    expect(
      screen.getByPlaceholderText("Buscar usuarios..."),
    ).toBeInTheDocument();
  });

  it("permite definir un valor", () => {
    render(<Input aria-label="Nombre" value="Wil" readOnly />);

    expect(screen.getByRole("textbox", { name: "Nombre" })).toHaveValue("Wil");
  });

  it("permite definir diferentes tipos de input", () => {
    render(<Input aria-label="Correo" type="email" />);

    expect(screen.getByRole("textbox", { name: "Correo" })).toHaveAttribute(
      "type",
      "email",
    );
  });

  it("pasa atributos nativos al input", () => {
    render(
      <Input
        aria-label="Nombre"
        id="name"
        name="name"
        autoComplete="name"
        maxLength={100}
        data-testid="custom-input"
      />,
    );

    const input = screen.getByRole("textbox", {
      name: "Nombre",
    });

    expect(input).toHaveAttribute("id", "name");
    expect(input).toHaveAttribute("name", "name");
    expect(input).toHaveAttribute("autocomplete", "name");
    expect(input).toHaveAttribute("maxlength", "100");
    expect(input).toHaveAttribute("data-testid", "custom-input");
  });

  it("permite combinar error con className personalizada", () => {
    render(<Input aria-label="Nombre" error className="custom-class" />);

    const input = screen.getByRole("textbox", {
      name: "Nombre",
    });

    expect(input).toHaveClass("border-destructive", "custom-class");
  });

  it("acepta aria-describedby para asociar mensajes de ayuda o error", () => {
    render(
      <>
        <Input aria-label="Correo" aria-describedby="email-error" error />

        <p id="email-error">Correo inválido</p>
      </>,
    );

    const input = screen.getByRole("textbox", {
      name: "Correo",
    });

    expect(input).toHaveAttribute("aria-describedby", "email-error");

    expect(screen.getByText("Correo inválido")).toBeInTheDocument();
  });
});
