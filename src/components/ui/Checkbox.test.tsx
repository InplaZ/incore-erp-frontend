import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import Checkbox from "./Checkbox";

describe("Checkbox", () => {
  it("renderiza correctamente como checkbox", () => {
    render(<Checkbox aria-label="Aceptar términos" />);

    expect(
      screen.getByRole("checkbox", {
        name: "Aceptar términos",
      }),
    ).toBeInTheDocument();
  });

  it("usa type=checkbox", () => {
    render(<Checkbox aria-label="Aceptar" />);

    expect(screen.getByRole("checkbox", { name: "Aceptar" })).toHaveAttribute(
      "type",
      "checkbox",
    );
  });

  it("no está marcado por defecto", () => {
    render(<Checkbox aria-label="Aceptar" />);

    expect(screen.getByRole("checkbox", { name: "Aceptar" })).not.toBeChecked();
  });

  it("respeta checked", () => {
    render(<Checkbox aria-label="Aceptar" checked readOnly />);

    expect(screen.getByRole("checkbox", { name: "Aceptar" })).toBeChecked();
  });

  it("permite cambiar su estado", () => {
    render(<Checkbox aria-label="Aceptar" />);

    const checkbox = screen.getByRole("checkbox", {
      name: "Aceptar",
    });

    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });

  it("ejecuta onChange", () => {
    const onChange = vi.fn();

    render(<Checkbox aria-label="Aceptar" onChange={onChange} />);

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Aceptar",
      }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("respeta disabled", () => {
    render(<Checkbox aria-label="Aceptar" disabled />);

    const checkbox = screen.getByRole("checkbox", {
      name: "Aceptar",
    });

    expect(checkbox).toBeDisabled();
    expect(checkbox).not.toBeChecked();
  });

  it("aplica aria-invalid cuando error es true", () => {
    render(<Checkbox aria-label="Aceptar" error />);

    const checkbox = screen.getByRole("checkbox", {
      name: "Aceptar",
    });

    expect(checkbox).toHaveAttribute("aria-invalid", "true");

    expect(checkbox).toHaveClass("border-destructive");
  });

  it("no agrega aria-invalid cuando error es false", () => {
    render(<Checkbox aria-label="Aceptar" />);

    expect(
      screen.getByRole("checkbox", {
        name: "Aceptar",
      }),
    ).not.toHaveAttribute("aria-invalid");
  });

  it("aplica className personalizada", () => {
    render(<Checkbox aria-label="Aceptar" className="custom-checkbox" />);

    expect(
      screen.getByRole("checkbox", {
        name: "Aceptar",
      }),
    ).toHaveClass("custom-checkbox");
  });

  it("pasa atributos nativos al input", () => {
    render(
      <Checkbox
        aria-label="Aceptar"
        id="terms"
        name="terms"
        value="accepted"
        data-testid="terms-checkbox"
      />,
    );

    const checkbox = screen.getByRole("checkbox", {
      name: "Aceptar",
    });

    expect(checkbox).toHaveAttribute("id", "terms");

    expect(checkbox).toHaveAttribute("name", "terms");

    expect(checkbox).toHaveAttribute("value", "accepted");

    expect(checkbox).toHaveAttribute("data-testid", "terms-checkbox");
  });

  it("permite usar ref", () => {
    const ref = createRef<HTMLInputElement>();

    render(<Checkbox ref={ref} aria-label="Aceptar" />);

    expect(ref.current).toBe(
      screen.getByRole("checkbox", {
        name: "Aceptar",
      }),
    );
  });

  it("permite usar aria-describedby", () => {
    render(
      <>
        <Checkbox
          aria-label="Aceptar términos"
          aria-describedby="terms-error"
          error
        />

        <p id="terms-error">Debes aceptar los términos.</p>
      </>,
    );

    const checkbox = screen.getByRole("checkbox", {
      name: "Aceptar términos",
    });

    expect(checkbox).toHaveAttribute("aria-describedby", "terms-error");

    expect(screen.getByText("Debes aceptar los términos.")).toBeInTheDocument();
  });

  it("no permite sobrescribir type desde las props", () => {
    render(
      <Checkbox
        aria-label="Aceptar"
        // @ts-expect-error Checkbox fuerza type="checkbox"
        type="text"
      />,
    );

    expect(
      screen.getByRole("checkbox", {
        name: "Aceptar",
      }),
    ).toHaveAttribute("type", "checkbox");
  });
});
