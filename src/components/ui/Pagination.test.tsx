import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Pagination from "./Pagination";

describe("Pagination", () => {
  it("renderiza la navegación", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={vi.fn()} />);

    expect(
      screen.getByRole("navigation", {
        name: "Paginación",
      }),
    ).toBeInTheDocument();
  });

  it("renderiza todas las páginas cuando caben", () => {
    render(<Pagination page={2} totalPages={5} onPageChange={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: "Página 1" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Página 2" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Página 3" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Página 4" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Página 5" }),
    ).toBeInTheDocument();
  });

  it("marca la página actual con aria-current", () => {
    render(<Pagination page={3} totalPages={5} onPageChange={vi.fn()} />);

    expect(
      screen.getByRole("button", {
        name: "Página 3",
        current: "page",
      }),
    ).toBeInTheDocument();
  });

  it("deshabilita anterior y primera página en la primera página", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={vi.fn()} />);

    expect(
      screen.getByRole("button", {
        name: "Primera página",
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Anterior",
      }),
    ).toBeDisabled();
  });

  it("deshabilita siguiente y última página en la última página", () => {
    render(<Pagination page={5} totalPages={5} onPageChange={vi.fn()} />);

    expect(
      screen.getByRole("button", {
        name: "Siguiente",
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Última página",
      }),
    ).toBeDisabled();
  });

  it("permite avanzar a la página siguiente", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);

    await user.click(
      screen.getByRole("button", {
        name: "Siguiente",
      }),
    );

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("permite volver a la página anterior", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);

    await user.click(
      screen.getByRole("button", {
        name: "Anterior",
      }),
    );

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("permite seleccionar una página", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);

    await user.click(
      screen.getByRole("button", {
        name: "Página 4",
      }),
    );

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("permite ir directamente a la primera página", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<Pagination page={4} totalPages={5} onPageChange={onPageChange} />);

    await user.click(
      screen.getByRole("button", {
        name: "Primera página",
      }),
    );

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("permite ir directamente a la última página", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);

    await user.click(
      screen.getByRole("button", {
        name: "Última página",
      }),
    );

    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  it("no dispara cambios al hacer click en la página actual", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);

    await user.click(
      screen.getByRole("button", {
        name: "Página 3",
      }),
    );

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("permite ocultar primera y última página", () => {
    render(
      <Pagination
        page={2}
        totalPages={5}
        showFirstLast={false}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: "Primera página",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Última página",
      }),
    ).not.toBeInTheDocument();
  });

  it("usa labels personalizados", () => {
    render(
      <Pagination
        page={2}
        totalPages={5}
        previousLabel="Anterior personalizado"
        nextLabel="Siguiente personalizado"
        firstLabel="Inicio"
        lastLabel="Fin"
        ariaLabel="Navegación de resultados"
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("navigation", {
        name: "Navegación de resultados",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Anterior personalizado",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Siguiente personalizado",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Inicio",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Fin",
      }),
    ).toBeInTheDocument();
  });

  it("normaliza una página menor que 1", () => {
    render(<Pagination page={0} totalPages={5} onPageChange={vi.fn()} />);

    expect(
      screen.getByRole("button", {
        name: "Página 1",
        current: "page",
      }),
    ).toBeInTheDocument();
  });

  it("normaliza una página mayor que totalPages", () => {
    render(<Pagination page={99} totalPages={5} onPageChange={vi.fn()} />);

    expect(
      screen.getByRole("button", {
        name: "Página 5",
        current: "page",
      }),
    ).toBeInTheDocument();
  });

  it("garantiza al menos una página", () => {
    render(<Pagination page={1} totalPages={0} onPageChange={vi.fn()} />);

    expect(
      screen.getByRole("button", {
        name: "Página 1",
        current: "page",
      }),
    ).toBeInTheDocument();
  });

  it("renderiza ellipsis con muchas páginas", () => {
    render(<Pagination page={50} totalPages={100} onPageChange={vi.fn()} />);

    expect(screen.getAllByText("…")).toHaveLength(2);

    expect(
      screen.getByRole("button", {
        name: "Página 1",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Página 100",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Página 50",
        current: "page",
      }),
    ).toBeInTheDocument();
  });

  it("respeta siblingCount", () => {
    render(
      <Pagination
        page={50}
        totalPages={100}
        siblingCount={2}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Página 48",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Página 49",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Página 50",
        current: "page",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Página 51",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Página 52",
      }),
    ).toBeInTheDocument();
  });

  it("normaliza siblingCount negativo", () => {
    render(
      <Pagination
        page={5}
        totalPages={10}
        siblingCount={-10}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Página 5",
        current: "page",
      }),
    ).toBeInTheDocument();
  });

  it("aplica className personalizada", () => {
    render(
      <Pagination
        page={1}
        totalPages={5}
        className="custom-pagination"
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("navigation")).toHaveClass("custom-pagination");
  });

  it("pasa atributos HTML al nav", () => {
    render(
      <Pagination
        page={1}
        totalPages={5}
        data-testid="pagination"
        id="results-pagination"
        onPageChange={vi.fn()}
      />,
    );

    const navigation = screen.getByTestId("pagination");

    expect(navigation).toHaveAttribute("id", "results-pagination");
  });
});
