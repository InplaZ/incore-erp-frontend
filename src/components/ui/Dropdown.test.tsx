import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger,
} from "./Dropdown";

function renderDropdown() {
  const onFirstClick = vi.fn();
  const onSecondClick = vi.fn();

  render(
    <Dropdown>
      <DropdownTrigger>
        <span>Acciones</span>
      </DropdownTrigger>

      <DropdownContent>
        <DropdownItem onClick={onFirstClick}>Editar</DropdownItem>

        <DropdownSeparator />

        <DropdownItem onClick={onSecondClick}>Eliminar</DropdownItem>
      </DropdownContent>
    </Dropdown>,
  );

  return {
    onFirstClick,
    onSecondClick,
  };
}

describe("Dropdown", () => {
  it("renderiza cerrado inicialmente", () => {
    renderDropdown();

    expect(screen.getByRole("button", { name: "Acciones" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("abre al hacer click en el trigger", () => {
    renderDropdown();

    const trigger = screen.getByRole("button", {
      name: "Acciones",
    });

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("cierra al volver a hacer click en el trigger", () => {
    renderDropdown();

    const trigger = screen.getByRole("button", {
      name: "Acciones",
    });

    fireEvent.click(trigger);
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("configura correctamente aria-haspopup y aria-controls", () => {
    renderDropdown();

    const trigger = screen.getByRole("button", {
      name: "Acciones",
    });

    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).not.toHaveAttribute("aria-controls");

    fireEvent.click(trigger);

    const menu = screen.getByRole("menu");

    expect(trigger).toHaveAttribute("aria-controls", menu.getAttribute("id"));
  });

  it("renderiza los items del menú", () => {
    renderDropdown();

    fireEvent.click(screen.getByRole("button", { name: "Acciones" }));

    expect(
      screen.getByRole("menuitem", { name: "Editar" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("menuitem", { name: "Eliminar" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("ejecuta el onClick del item y cierra el menú", () => {
    const { onFirstClick } = renderDropdown();

    fireEvent.click(screen.getByRole("button", { name: "Acciones" }));

    fireEvent.click(screen.getByRole("menuitem", { name: "Editar" }));

    expect(onFirstClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("no cierra el menú si el item hace preventDefault", () => {
    const onClick = vi.fn((event) => {
      event.preventDefault();
    });

    render(
      <Dropdown>
        <DropdownTrigger>
          <span>Acciones</span>
        </DropdownTrigger>

        <DropdownContent>
          <DropdownItem onClick={onClick}>Editar</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Acciones" }));

    fireEvent.click(screen.getByRole("menuitem", { name: "Editar" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("cierra al presionar Escape", () => {
    renderDropdown();

    fireEvent.click(screen.getByRole("button", { name: "Acciones" }));

    fireEvent.keyDown(document, {
      key: "Escape",
    });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("cierra al hacer click fuera", () => {
    render(
      <>
        <div>Fuera</div>

        <Dropdown>
          <DropdownTrigger>
            <span>Acciones</span>
          </DropdownTrigger>

          <DropdownContent>
            <DropdownItem>Editar</DropdownItem>
          </DropdownContent>
        </Dropdown>
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Acciones" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByText("Fuera"));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("no cierra al hacer click dentro del menú", () => {
    renderDropdown();

    fireEvent.click(screen.getByRole("button", { name: "Acciones" }));

    fireEvent.mouseDown(screen.getByRole("menuitem", { name: "Editar" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("respeta disabled en los items", () => {
    const onClick = vi.fn();

    render(
      <Dropdown>
        <DropdownTrigger>
          <span>Acciones</span>
        </DropdownTrigger>

        <DropdownContent>
          <DropdownItem disabled onClick={onClick}>
            Editar
          </DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Acciones" }));

    const item = screen.getByRole("menuitem", {
      name: "Editar",
    });

    expect(item).toBeDisabled();

    fireEvent.click(item);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("abre con ArrowDown desde el trigger", () => {
    renderDropdown();

    const trigger = screen.getByRole("button", {
      name: "Acciones",
    });

    fireEvent.keyDown(trigger, {
      key: "ArrowDown",
    });

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("abre con Enter desde el trigger", () => {
    renderDropdown();

    const trigger = screen.getByRole("button", {
      name: "Acciones",
    });

    fireEvent.keyDown(trigger, {
      key: "Enter",
    });

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("abre con Space desde el trigger", () => {
    renderDropdown();

    const trigger = screen.getByRole("button", {
      name: "Acciones",
    });

    fireEvent.keyDown(trigger, {
      key: " ",
    });

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("navega al primer item con ArrowDown", async () => {
    renderDropdown();

    const trigger = screen.getByRole("button", {
      name: "Acciones",
    });

    fireEvent.click(trigger);

    const firstItem = screen.getByRole("menuitem", {
      name: "Editar",
    });

    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });

    expect(document.activeElement).toBe(firstItem);
  });

  it("navega al siguiente item con ArrowDown", () => {
    renderDropdown();

    fireEvent.click(screen.getByRole("button", { name: "Acciones" }));

    const items = screen.getAllByRole("menuitem");

    items[0].focus();

    fireEvent.keyDown(screen.getByRole("menu"), {
      key: "ArrowDown",
    });

    expect(document.activeElement).toBe(items[1]);
  });

  it("navega al item anterior con ArrowUp", () => {
    renderDropdown();

    fireEvent.click(screen.getByRole("button", { name: "Acciones" }));

    const items = screen.getAllByRole("menuitem");

    items[1].focus();

    fireEvent.keyDown(screen.getByRole("menu"), {
      key: "ArrowUp",
    });

    expect(document.activeElement).toBe(items[0]);
  });

  it("navega al primer item con Home", () => {
    renderDropdown();

    fireEvent.click(screen.getByRole("button", { name: "Acciones" }));

    const items = screen.getAllByRole("menuitem");

    items[1].focus();

    fireEvent.keyDown(screen.getByRole("menu"), {
      key: "Home",
    });

    expect(document.activeElement).toBe(items[0]);
  });

  it("navega al último item con End", () => {
    renderDropdown();

    fireEvent.click(screen.getByRole("button", { name: "Acciones" }));

    const items = screen.getAllByRole("menuitem");

    items[0].focus();

    fireEvent.keyDown(screen.getByRole("menu"), {
      key: "End",
    });

    expect(document.activeElement).toBe(items[1]);
  });

  it("ignora items disabled durante la navegación", () => {
    render(
      <Dropdown>
        <DropdownTrigger>
          <span>Acciones</span>
        </DropdownTrigger>

        <DropdownContent>
          <DropdownItem>Editar</DropdownItem>

          <DropdownItem disabled>Deshabilitado</DropdownItem>

          <DropdownItem>Eliminar</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Acciones" }));

    const items = screen.getAllByRole("menuitem");

    items[0].focus();

    fireEvent.keyDown(screen.getByRole("menu"), {
      key: "ArrowDown",
    });

    expect(document.activeElement).toBe(items[2]);
  });

  it("restaura el foco al trigger al cerrar con Escape", () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });

    renderDropdown();

    const trigger = screen.getByRole("button", {
      name: "Acciones",
    });

    fireEvent.click(trigger);

    fireEvent.keyDown(document, {
      key: "Escape",
    });

    expect(document.activeElement).toBe(trigger);

    vi.unstubAllGlobals();
  });

  it("permite usar DropdownTrigger con asChild", () => {
    render(
      <Dropdown>
        <DropdownTrigger asChild>
          <button type="button">Acciones personalizadas</button>
        </DropdownTrigger>

        <DropdownContent>
          <DropdownItem>Editar</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    const trigger = screen.getByRole("button", {
      name: "Acciones personalizadas",
    });

    fireEvent.click(trigger);

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("preserva preventDefault del trigger con asChild", () => {
    const onClick = vi.fn((event) => {
      event.preventDefault();
    });

    render(
      <Dropdown>
        <DropdownTrigger asChild>
          <button type="button" onClick={onClick}>
            Acciones
          </button>
        </DropdownTrigger>

        <DropdownContent>
          <DropdownItem>Editar</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );

    const trigger = screen.getByRole("button", {
      name: "Acciones",
    });

    fireEvent.click(trigger);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
