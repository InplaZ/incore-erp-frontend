import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "./Modal";

function renderModal(props: Partial<React.ComponentProps<typeof Modal>> = {}) {
  const onClose = vi.fn();

  render(
    <Modal open onClose={onClose} {...props}>
      <ModalHeader>
        <ModalTitle>Eliminar usuario</ModalTitle>
        <ModalDescription>Esta acción no se puede deshacer.</ModalDescription>
      </ModalHeader>

      <ModalContent>
        <p>Contenido del modal</p>
      </ModalContent>

      <ModalFooter>
        <button type="button">Cancelar</button>
      </ModalFooter>
    </Modal>,
  );

  return { onClose };
}

describe("Modal", () => {
  it("no renderiza cuando open es false", () => {
    const onClose = vi.fn();

    render(
      <Modal open={false} onClose={onClose}>
        <p>Contenido del modal</p>
      </Modal>,
    );

    expect(screen.queryByText("Contenido del modal")).not.toBeInTheDocument();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renderiza cuando open es true", () => {
    renderModal();

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Eliminar usuario" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Esta acción no se puede deshacer."),
    ).toBeInTheDocument();

    expect(screen.getByText("Contenido del modal")).toBeInTheDocument();
  });

  it("cierra al hacer click en el botón cerrar", () => {
    const { onClose } = renderModal();

    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("cierra al presionar Escape", () => {
    const { onClose } = renderModal();

    fireEvent.keyDown(document, {
      key: "Escape",
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("no cierra con Escape cuando closeOnEscape es false", () => {
    const { onClose } = renderModal({
      closeOnEscape: false,
    });

    fireEvent.keyDown(document, {
      key: "Escape",
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("cierra al hacer click en el backdrop", () => {
    const { onClose } = renderModal();

    const backdrop = screen.getByRole("presentation");

    fireEvent.mouseDown(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("no cierra al hacer click dentro del dialog", () => {
    const { onClose } = renderModal();

    const dialog = screen.getByRole("dialog");

    fireEvent.mouseDown(dialog);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("no cierra con el backdrop cuando closeOnBackdrop es false", () => {
    const { onClose } = renderModal({
      closeOnBackdrop: false,
    });

    const backdrop = screen.getByRole("presentation");

    fireEvent.mouseDown(backdrop);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("usa el closeLabel personalizado", () => {
    renderModal({
      closeLabel: "Cerrar ventana",
    });

    expect(
      screen.getByRole("button", { name: "Cerrar ventana" }),
    ).toBeInTheDocument();
  });

  it("configura aria-labelledby cuando existe ModalTitle", () => {
    renderModal();

    const dialog = screen.getByRole("dialog");

    const title = screen.getByRole("heading", {
      name: "Eliminar usuario",
    });

    expect(dialog).toHaveAttribute("aria-labelledby", title.getAttribute("id"));
  });

  it("configura aria-describedby cuando existe ModalDescription", () => {
    renderModal();

    const dialog = screen.getByRole("dialog");

    const description = screen.getByText("Esta acción no se puede deshacer.");

    expect(dialog).toHaveAttribute(
      "aria-describedby",
      description.getAttribute("id"),
    );
  });

  it("no agrega aria-labelledby ni aria-describedby si no existen subcomponentes", () => {
    const onClose = vi.fn();

    render(
      <Modal open onClose={onClose}>
        <ModalContent>
          <p>Solo contenido</p>
        </ModalContent>
      </Modal>,
    );

    const dialog = screen.getByRole("dialog");

    expect(dialog).not.toHaveAttribute("aria-labelledby");
    expect(dialog).not.toHaveAttribute("aria-describedby");
  });
});
