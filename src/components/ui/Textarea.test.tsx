import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import Textarea from "./Textarea";

describe("Textarea", () => {
  it("renderiza correctamente", () => {
    render(<Textarea aria-label="Descripción" />);

    expect(
      screen.getByRole("textbox", {
        name: "Descripción",
      }),
    ).toBeInTheDocument();
  });

  it("aplica las clases base", () => {
    render(<Textarea aria-label="Descripción" />);

    const textarea = screen.getByRole("textbox", {
      name: "Descripción",
    });

    expect(textarea).toHaveClass(
      "min-h-24",
      "w-full",
      "resize-y",
      "rounded-md",
      "border",
      "border-border",
      "bg-background",
      "px-3",
      "py-2",
      "text-sm",
      "text-foreground",
    );
  });

  it("aplica className personalizada", () => {
    render(<Textarea aria-label="Descripción" className="custom-textarea" />);

    expect(
      screen.getByRole("textbox", {
        name: "Descripción",
      }),
    ).toHaveClass("custom-textarea");
  });

  it("combina className personalizada con las clases base", () => {
    render(
      <Textarea
        aria-label="Descripción"
        className="custom-textarea text-primary"
      />,
    );

    const textarea = screen.getByRole("textbox", {
      name: "Descripción",
    });

    expect(textarea).toHaveClass(
      "min-h-24",
      "w-full",
      "custom-textarea",
      "text-primary",
    );
  });

  it("no agrega aria-invalid cuando error es false", () => {
    render(<Textarea aria-label="Descripción" />);

    expect(
      screen.getByRole("textbox", {
        name: "Descripción",
      }),
    ).not.toHaveAttribute("aria-invalid");
  });

  it("aplica estado de error", () => {
    render(<Textarea aria-label="Descripción" error />);

    const textarea = screen.getByRole("textbox", {
      name: "Descripción",
    });

    expect(textarea).toHaveAttribute("aria-invalid", "true");

    expect(textarea).toHaveClass("border-destructive");

    expect(textarea).toHaveClass(
      "focus:border-destructive",
      "focus:ring-destructive/20",
    );
  });

  it("permite escribir contenido", () => {
    render(<Textarea aria-label="Descripción" />);

    const textarea = screen.getByRole("textbox", {
      name: "Descripción",
    });

    fireEvent.change(textarea, {
      target: {
        value: "Contenido de prueba",
      },
    });

    expect(textarea).toHaveValue("Contenido de prueba");
  });

  it("respeta value", () => {
    render(
      <Textarea
        aria-label="Descripción"
        value="Contenido inicial"
        onChange={() => undefined}
      />,
    );

    expect(
      screen.getByRole("textbox", {
        name: "Descripción",
      }),
    ).toHaveValue("Contenido inicial");
  });

  it("respeta defaultValue", () => {
    render(
      <Textarea aria-label="Descripción" defaultValue="Contenido inicial" />,
    );

    expect(
      screen.getByRole("textbox", {
        name: "Descripción",
      }),
    ).toHaveValue("Contenido inicial");
  });

  it("ejecuta onChange", () => {
    const onChange = vi.fn();

    render(<Textarea aria-label="Descripción" onChange={onChange} />);

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Descripción",
      }),
      {
        target: {
          value: "Nuevo contenido",
        },
      },
    );

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("respeta disabled", () => {
    render(<Textarea aria-label="Descripción" disabled />);

    const textarea = screen.getByRole("textbox", {
      name: "Descripción",
    });

    expect(textarea).toBeDisabled();
  });

  it("respeta readOnly", () => {
    render(<Textarea aria-label="Descripción" readOnly />);

    expect(
      screen.getByRole("textbox", {
        name: "Descripción",
      }),
    ).toHaveAttribute("readonly");
  });

  it("respeta required", () => {
    render(<Textarea aria-label="Descripción" required />);

    expect(
      screen.getByRole("textbox", {
        name: "Descripción",
      }),
    ).toBeRequired();
  });

  it("respeta placeholder", () => {
    render(
      <Textarea
        aria-label="Descripción"
        placeholder="Escribe una descripción"
      />,
    );

    expect(
      screen.getByPlaceholderText("Escribe una descripción"),
    ).toBeInTheDocument();
  });

  it("respeta rows y cols", () => {
    render(<Textarea aria-label="Descripción" rows={5} cols={40} />);

    const textarea = screen.getByRole("textbox", {
      name: "Descripción",
    });

    expect(textarea).toHaveAttribute("rows", "5");
    expect(textarea).toHaveAttribute("cols", "40");
  });

  it("pasa atributos nativos al textarea", () => {
    render(
      <Textarea
        aria-label="Descripción"
        id="description"
        name="description"
        data-testid="description-textarea"
        autoComplete="off"
      />,
    );

    const textarea = screen.getByRole("textbox", {
      name: "Descripción",
    });

    expect(textarea).toHaveAttribute("id", "description");

    expect(textarea).toHaveAttribute("name", "description");

    expect(textarea).toHaveAttribute("data-testid", "description-textarea");

    expect(textarea).toHaveAttribute("autocomplete", "off");
  });

  it("permite usar ref", () => {
    const ref = createRef<HTMLTextAreaElement>();

    render(<Textarea ref={ref} aria-label="Descripción" />);

    expect(ref.current).toBe(
      screen.getByRole("textbox", {
        name: "Descripción",
      }),
    );
  });

  it("permite usar aria-describedby", () => {
    render(
      <>
        <Textarea
          aria-label="Descripción"
          aria-describedby="description-help"
          error
        />

        <p id="description-help">La descripción es obligatoria.</p>
      </>,
    );

    const textarea = screen.getByRole("textbox", {
      name: "Descripción",
    });

    expect(textarea).toHaveAttribute("aria-describedby", "description-help");

    expect(
      screen.getByText("La descripción es obligatoria."),
    ).toBeInTheDocument();
  });
});
