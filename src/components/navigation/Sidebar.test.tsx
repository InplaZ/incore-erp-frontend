import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Sidebar, type SidebarItem } from "./Sidebar";

describe("Sidebar", () => {
  const items: SidebarItem[] = [
    {
      id: "home",
      label: "Inicio",
    },
    {
      id: "users",
      label: "Usuarios",
    },
    {
      id: "settings",
      label: "Configuración",
    },
  ];

  it("renderiza el sidebar y sus elementos", () => {
    render(<Sidebar items={items} />);

    expect(
      screen.getByRole("complementary", {
        name: "Navegación principal",
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Inicio" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Usuarios" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Configuración" }),
    ).toBeInTheDocument();
  });

  it("renderiza el header personalizado", () => {
    render(<Sidebar header={<div>Mi aplicación</div>} items={items} />);

    expect(screen.getByText("Mi aplicación")).toBeInTheDocument();
  });

  it("renderiza el footer personalizado", () => {
    render(<Sidebar footer={<div>Versión 1.0</div>} items={items} />);

    expect(screen.getByText("Versión 1.0")).toBeInTheDocument();
  });

  it("permite seleccionar un elemento", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Sidebar
        items={[
          {
            id: "home",
            label: "Inicio",
            onSelect,
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Inicio" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("no ejecuta onSelect cuando el elemento está deshabilitado", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Sidebar
        items={[
          {
            id: "disabled",
            label: "Deshabilitado",
            disabled: true,
            onSelect,
          },
        ]}
      />,
    );

    const button = screen.getByRole("button", {
      name: "Deshabilitado",
    });

    expect(button).toBeDisabled();

    await user.click(button);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("marca correctamente el elemento activo", () => {
    render(
      <Sidebar
        items={[
          {
            id: "home",
            label: "Inicio",
            active: true,
          },
          {
            id: "users",
            label: "Usuarios",
          },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: "Inicio" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    expect(
      screen.getByRole("button", { name: "Usuarios" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("renderiza iconos y badges", () => {
    render(
      <Sidebar
        items={[
          {
            id: "home",
            label: "Inicio",
            icon: <span data-testid="home-icon">I</span>,
            badge: <span data-testid="home-badge">3</span>,
          },
        ]}
      />,
    );

    expect(screen.getByTestId("home-icon")).toBeInTheDocument();
    expect(screen.getByTestId("home-badge")).toBeInTheDocument();
  });

  it("usa el tooltip del elemento cuando está contraído", () => {
    render(
      <Sidebar
        collapsed
        items={[
          {
            id: "home",
            label: "Inicio",
            tooltip: "Ir al inicio",
          },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: "Inicio" })).toHaveAttribute(
      "title",
      "Ir al inicio",
    );
  });

  it("usa el label como tooltip cuando está contraído y no existe tooltip", () => {
    render(
      <Sidebar
        collapsed
        items={[
          {
            id: "home",
            label: "Inicio",
          },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: "Inicio" })).toHaveAttribute(
      "title",
      "Inicio",
    );
  });

  it("permite contraer y expandir el sidebar", async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();

    render(<Sidebar items={items} onCollapsedChange={onCollapsedChange} />);

    const collapseButton = screen.getByRole("button", {
      name: "Contraer menú",
    });

    await user.click(collapseButton);

    expect(onCollapsedChange).toHaveBeenCalledWith(true);

    expect(
      screen.getByRole("button", {
        name: "Expandir menú",
      }),
    ).toBeInTheDocument();
  });

  it("respeta el estado collapsed controlado", async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();

    render(
      <Sidebar collapsed items={items} onCollapsedChange={onCollapsedChange} />,
    );

    expect(
      screen.getByRole("button", {
        name: "Expandir menú",
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Expandir menú",
      }),
    );

    expect(onCollapsedChange).toHaveBeenCalledWith(false);

    expect(
      screen.getByRole("button", {
        name: "Expandir menú",
      }),
    ).toBeInTheDocument();
  });

  it("permite controlar el estado inicial collapsed", () => {
    render(<Sidebar defaultCollapsed items={items} />);

    expect(
      screen.getByRole("button", {
        name: "Expandir menú",
      }),
    ).toBeInTheDocument();
  });

  it("permite abrir el menú móvil", async () => {
    const user = userEvent.setup();

    render(<Sidebar showMobileTrigger items={items} />);

    const trigger = screen.getByRole("button", {
      name: "Abrir menú",
    });

    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("permite cerrar el menú móvil", async () => {
    const user = userEvent.setup();

    render(<Sidebar showMobileTrigger defaultMobileOpen items={items} />);

    const closeButton = screen.getByRole("button", {
      name: "Cerrar menú",
    });

    expect(closeButton).toBeInTheDocument();

    await user.click(closeButton);

    expect(
      screen.getByRole("button", {
        name: "Abrir menú",
      }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("permite controlar el estado móvil", async () => {
    const user = userEvent.setup();
    const onMobileOpenChange = vi.fn();

    render(
      <Sidebar
        showMobileTrigger
        mobileOpen={false}
        onMobileOpenChange={onMobileOpenChange}
        items={items}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Abrir menú",
      }),
    );

    expect(onMobileOpenChange).toHaveBeenCalledWith(true);
  });

  it("cierra el menú móvil al seleccionar un elemento", async () => {
    const user = userEvent.setup();
    const onMobileOpenChange = vi.fn();

    render(
      <Sidebar
        mobileOpen
        onMobileOpenChange={onMobileOpenChange}
        items={items}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Inicio" }));

    expect(onMobileOpenChange).toHaveBeenCalledWith(false);
  });

  it("cierra el menú móvil con Escape", async () => {
    const user = userEvent.setup();
    const onMobileOpenChange = vi.fn();

    render(
      <Sidebar
        mobileOpen
        onMobileOpenChange={onMobileOpenChange}
        items={items}
      />,
    );

    await user.keyboard("{Escape}");

    expect(onMobileOpenChange).toHaveBeenCalledWith(false);
  });

  it("permite renderizar elementos personalizados", () => {
    const renderItem = vi.fn((item) => (
      <div data-testid={`custom-${item.id}`}>{item.label}</div>
    ));

    render(<Sidebar items={items} renderItem={renderItem} />);

    expect(screen.getByTestId("custom-home")).toBeInTheDocument();
    expect(screen.getByTestId("custom-users")).toBeInTheDocument();
    expect(screen.getByTestId("custom-settings")).toBeInTheDocument();

    expect(renderItem).toHaveBeenCalledTimes(3);
  });

  it("pasa el contexto correcto al render personalizado", () => {
    let receivedContext:
      | Parameters<
          NonNullable<React.ComponentProps<typeof Sidebar>["renderItem"]>
        >[1]
      | undefined;

    render(
      <Sidebar
        collapsed
        mobileOpen
        items={[
          {
            id: "home",
            label: "Inicio",
          },
        ]}
        renderItem={(item, context) => {
          receivedContext = context;

          return <div>{item.label}</div>;
        }}
      />,
    );

    expect(receivedContext).toBeDefined();
    expect(receivedContext?.collapsed).toBe(true);
    expect(receivedContext?.mobileOpen).toBe(true);
    expect(receivedContext?.closeMobileMenu).toEqual(expect.any(Function));
    expect(receivedContext?.selectItem).toEqual(expect.any(Function));
  });

  it("permite desactivar el botón de collapse", () => {
    render(<Sidebar showCollapseButton={false} items={items} />);

    expect(
      screen.queryByRole("button", {
        name: "Contraer menú",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Expandir menú",
      }),
    ).not.toBeInTheDocument();
  });

  it("permite desactivar el trigger móvil", () => {
    render(<Sidebar showMobileTrigger={false} items={items} />);

    expect(
      screen.queryByRole("button", {
        name: "Abrir menú",
      }),
    ).not.toBeInTheDocument();
  });

  it("permite personalizar las etiquetas accesibles", () => {
    render(
      <Sidebar
        items={items}
        ariaLabel="Menú principal"
        collapseLabel="Ocultar menú"
        expandLabel="Mostrar menú"
      />,
    );

    expect(
      screen.getByRole("complementary", {
        name: "Menú principal",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Ocultar menú",
      }),
    ).toBeInTheDocument();
  });
});
