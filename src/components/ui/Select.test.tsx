import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import Select from "./Select";

describe("Select", () => {
  it("renderiza correctamente como combobox", () => {
    render(
      <Select aria-label="País">
        <option value="bo">Bolivia</option>
        <option value="pe">Perú</option>
      </Select>,
    );

    expect(
      screen.getByRole("combobox", {
        name: "País",
      }),
    ).toBeInTheDocument();
  });

  it("aplica las clases base", () => {
    render(
      <Select aria-label="País">
        <option value="bo">Bolivia</option>
      </Select>,
    );

    const select = screen.getByRole("combobox", {
      name: "País",
    });

    expect(select).toHaveClass(
      "h-10",
      "w-full",
      "rounded-md",
      "border",
      "border-border",
      "bg-background",
      "text-sm",
      "text-foreground",
    );
  });

  it("aplica className personalizada", () => {
    render(
      <Select
        aria-label="País"
        className="custom-select"
      >
        <option value="bo">Bolivia</option>
      </Select>,
    );

    expect(
      screen.getByRole("combobox", {
        name: "País",
      }),
    ).toHaveClass("custom-select");
  });

  it("no agrega aria-invalid cuando error es false", () => {
    render(
      <Select aria-label="País">
        <option value="bo">Bolivia</option>
      </Select>,
    );

    expect(
      screen.getByRole("combobox", {
        name: "País",
      }),
    ).not.toHaveAttribute("aria-invalid");
  });

  it("aplica estado de error", () => {
    render(
      <Select
        aria-label="País"
        error
      >
        <option value="bo">Bolivia</option>
      </Select>,
    );

    const select = screen.getByRole("combobox", {
      name: "País",
    });

    expect(select).toHaveAttribute(
      "aria-invalid",
      "true",
    );

    expect(select).toHaveClass(
      "border-destructive",
    );

    expect(select).toHaveClass(
      "focus:border-destructive",
      "focus:ring-destructive/20",
    );
  });

  it("renderiza sus opciones", () => {
    render(
      <Select aria-label="País">
        <option value="bo">Bolivia</option>
        <option value="pe">Perú</option>
        <option value="cl">Chile</option>
      </Select>,
    );

    expect(
      screen.getByRole("option", {
        name: "Bolivia",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Perú",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Chile",
      }),
    ).toBeInTheDocument();
  });

  it("respeta value", () => {
    render(
      <Select
        aria-label="País"
        value="pe"
        onChange={() => undefined}
      >
        <option value="bo">Bolivia</option>
        <option value="pe">Perú</option>
      </Select>,
    );

    expect(
      screen.getByRole("combobox", {
        name: "País",
      }),
    ).toHaveValue("pe");
  });

  it("respeta defaultValue", () => {
    render(
      <Select
        aria-label="País"
        defaultValue="cl"
      >
        <option value="bo">Bolivia</option>
        <option value="pe">Perú</option>
        <option value="cl">Chile</option>
      </Select>,
    );

    expect(
      screen.getByRole("combobox", {
        name: "País",
      }),
    ).toHaveValue("cl");
  });

  it("permite cambiar la opción seleccionada", () => {
    render(
      <Select aria-label="País">
        <option value="bo">Bolivia</option>
        <option value="pe">Perú</option>
      </Select>,
    );

    const select = screen.getByRole("combobox", {
      name: "País",
    });

    expect(select).toHaveValue("bo");

    fireEvent.change(select, {
      target: {
        value: "pe",
      },
    });

    expect(select).toHaveValue("pe");
  });

  it("ejecuta onChange", () => {
    const onChange = vi.fn();

    render(
      <Select
        aria-label="País"
        onChange={onChange}
      >
        <option value="bo">Bolivia</option>
        <option value="pe">Perú</option>
      </Select>,
    );

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "País",
      }),
      {
        target: {
          value: "pe",
        },
      },
    );

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("respeta disabled", () => {
    render(
      <Select
        aria-label="País"
        disabled
      >
        <option value="bo">Bolivia</option>
      </Select>,
    );

    const select = screen.getByRole("combobox", {
      name: "País",
    });

    expect(select).toBeDisabled();
  });

  it("respeta required", () => {
    render(
      <Select
        aria-label="País"
        required
      >
        <option value="bo">Bolivia</option>
      </Select>,
    );

    expect(
      screen.getByRole("combobox", {
        name: "País",
      }),
    ).toBeRequired();
  });

  it("pasa atributos nativos al select", () => {
    render(
      <Select
        aria-label="País"
        id="country"
        name="country"
        data-testid="country-select"
        autoComplete="country"
      >
        <option value="bo">Bolivia</option>
      </Select>,
    );

    const select = screen.getByRole("combobox", {
      name: "País",
    });

    expect(select).toHaveAttribute(
      "id",
      "country",
    );

    expect(select).toHaveAttribute(
      "name",
      "country",
    );

    expect(select).toHaveAttribute(
      "data-testid",
      "country-select",
    );

    expect(select).toHaveAttribute(
      "autocomplete",
      "country",
    );
  });

  it("permite usar ref", () => {
    const ref = createRef<HTMLSelectElement>();

    render(
      <Select
        ref={ref}
        aria-label="País"
      >
        <option value="bo">Bolivia</option>
      </Select>,
    );

    expect(ref.current).toBe(
      screen.getByRole("combobox", {
        name: "País",
      }),
    );
  });

  it("permite usar aria-describedby", () => {
    render(
      <>
        <Select
          aria-label="País"
          aria-describedby="country-error"
          error
        >
          <option value="">Selecciona un país</option>
          <option value="bo">Bolivia</option>
        </Select>

        <p id="country-error">
          Debes seleccionar un país.
        </p>
      </>,
    );

    const select = screen.getByRole("combobox", {
      name: "País",
    });

    expect(select).toHaveAttribute(
      "aria-describedby",
      "country-error",
    );

    expect(
      screen.getByText(
        "Debes seleccionar un país.",
      ),
    ).toBeInTheDocument();
  });

  it("permite children personalizados", () => {
    render(
      <Select aria-label="Estado">
        <option value="">Selecciona una opción</option>
        <optgroup label="Activos">
          <option value="active">Activo</option>
        </optgroup>
      </Select>,
    );

    expect(
      screen.getByRole("option", {
        name: "Selecciona una opción",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("group", {
        name: "Activos",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Activo",
      }),
    ).toBeInTheDocument();
  });
});