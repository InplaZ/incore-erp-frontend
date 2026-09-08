import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Header, type HeaderNotification } from "./Header";
import { ThemeProvider } from "../../theme";
import type { ComponentProps } from "react";

const notifications: HeaderNotification[] = [
  {
    id: "1",
    title: "Nueva factura",
    message: "Se creó una nueva factura.",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Usuario actualizado",
    message: "El usuario fue actualizado.",
    read: true,
  },
  {
    id: "3",
    title: "Nuevo pedido",
    read: false,
  },
];

function renderHeader(props: ComponentProps<typeof Header> = {}) {
  return render(
    <ThemeProvider>
      <Header {...props} />
    </ThemeProvider>,
  );
}

function mockMatchMedia(matches = false) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("Header", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    localStorage.clear();

    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-color");
    document.documentElement.style.colorScheme = "";

    mockMatchMedia(false);
  });

  describe("contenido básico", () => {
    it("renderiza título y subtítulo", () => {
      renderHeader({
        title: "Dashboard",
        subtitle: "Resumen general",
      });

      expect(
        screen.getByRole("heading", { name: "Dashboard" }),
      ).toBeInTheDocument();

      expect(screen.getByText("Resumen general")).toBeInTheDocument();
    });

    it("renderiza el botón de menú por defecto", () => {
      renderHeader();

      expect(
        screen.getByRole("button", { name: "Abrir menú" }),
      ).toBeInTheDocument();
    });

    it("permite ocultar el botón de menú", () => {
      renderHeader({
        showMenuButton: false,
      });

      expect(
        screen.queryByRole("button", { name: "Abrir menú" }),
      ).not.toBeInTheDocument();
    });

    it("ejecuta onMenuClick", async () => {
      const user = userEvent.setup();
      const onMenuClick = vi.fn();

      renderHeader({
        onMenuClick,
      });

      await user.click(
        screen.getByRole("button", {
          name: "Abrir menú",
        }),
      );

      expect(onMenuClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("búsqueda", () => {
    it("no renderiza búsqueda cuando search es false", () => {
      renderHeader({
        search: false,
      });

      expect(
        screen.queryByRole("button", { name: "Buscar" }),
      ).not.toBeInTheDocument();

      expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    });

    it("renderiza la búsqueda cuando search es true", () => {
      renderHeader({
        search: true,
      });

      expect(
        screen.getByRole("button", {
          name: "Buscar...Ctrl K",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: "Buscar",
        }),
      ).toBeInTheDocument();
    });

    it("permite personalizar el placeholder", () => {
      renderHeader({
        search: true,
        searchPlaceholder: "Buscar usuarios...",
      });

      expect(
        screen.getByRole("button", {
          name: "Buscar usuarios...Ctrl K",
        }),
      ).toBeInTheDocument();
    });

    it("abre el modal de búsqueda desde el botón desktop", async () => {
      const user = userEvent.setup();

      renderHeader({
        search: true,
      });

      await user.click(
        screen.getByRole("button", {
          name: "Buscar...Ctrl K",
        }),
      );

      expect(screen.getByRole("searchbox")).toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: "Cerrar búsqueda",
        }),
      ).toBeInTheDocument();
    });

    it("abre el modal de búsqueda desde el botón móvil", async () => {
      const user = userEvent.setup();

      renderHeader({
        search: true,
      });

      await user.click(
        screen.getByRole("button", {
          name: "Buscar",
        }),
      );

      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    it("permite escribir en la búsqueda", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();

      renderHeader({
        search: true,
        onSearch,
      });

      await user.click(
        screen.getByRole("button", {
          name: "Buscar...Ctrl K",
        }),
      );

      const input = screen.getByRole("searchbox");

      await user.type(input, "clientes");

      expect(input).toHaveValue("clientes");

      expect(onSearch).toHaveBeenLastCalledWith("clientes");
    });

    it("ejecuta onSearch al pulsar Enter", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();

      renderHeader({
        search: true,
        onSearch,
      });

      await user.click(
        screen.getByRole("button", {
          name: "Buscar...Ctrl K",
        }),
      );

      const input = screen.getByRole("searchbox");

      await user.type(input, "facturas");

      onSearch.mockClear();

      await user.keyboard("{Enter}");

      expect(onSearch).toHaveBeenCalledTimes(1);
      expect(onSearch).toHaveBeenCalledWith("facturas");
    });

    it("cierra la búsqueda mediante su botón de cierre", async () => {
      const user = userEvent.setup();

      renderHeader({
        search: true,
      });

      await user.click(
        screen.getByRole("button", {
          name: "Buscar...Ctrl K",
        }),
      );

      expect(screen.getByRole("searchbox")).toBeInTheDocument();

      await user.click(
        screen.getByRole("button", {
          name: "Cerrar búsqueda",
        }),
      );

      expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    });

    it("cierra la búsqueda al hacer clic fuera del contenido", async () => {
      const user = userEvent.setup();

      renderHeader({
        search: true,
      });

      await user.click(
        screen.getByRole("button", {
          name: "Buscar...Ctrl K",
        }),
      );

      expect(screen.getByRole("searchbox")).toBeInTheDocument();

      const overlay = screen.getByRole("searchbox").closest("div.fixed");

      expect(overlay).not.toBeNull();

      if (!overlay) {
        throw new Error("No se encontró el contenedor de búsqueda.");
      }

      await user.click(overlay);

      expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    });

    it("cierra la búsqueda con Escape", async () => {
      const user = userEvent.setup();

      renderHeader({
        search: true,
      });

      await user.click(
        screen.getByRole("button", {
          name: "Buscar...Ctrl K",
        }),
      );

      expect(screen.getByRole("searchbox")).toBeInTheDocument();

      await user.keyboard("{Escape}");

      expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    });

    it("abre la búsqueda con Ctrl+K", async () => {
      const user = userEvent.setup();

      renderHeader({
        search: true,
      });

      expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();

      await user.keyboard("{Control>}k{/Control}");

      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    it("abre la búsqueda con Meta+K", async () => {
      const user = userEvent.setup();

      renderHeader({
        search: true,
      });

      await user.keyboard("{Meta>}k{/Meta}");

      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    it("no abre la búsqueda con Ctrl+K cuando está deshabilitada", async () => {
      const user = userEvent.setup();

      renderHeader({
        search: false,
      });

      await user.keyboard("{Control>}k{/Control}");

      expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    });
  });

  describe("tema", () => {
    it("muestra el botón para cambiar a modo oscuro", () => {
      renderHeader();

      expect(
        screen.getByRole("button", {
          name: "Cambiar a modo oscuro",
        }),
      ).toBeInTheDocument();
    });

    it("cambia de sistema a modo oscuro", async () => {
      const user = userEvent.setup();

      localStorage.setItem("theme", "light");

      renderHeader();

      await user.click(
        screen.getByRole("button", {
          name: "Cambiar a modo oscuro",
        }),
      );

      expect(localStorage.getItem("theme")).toBe("dark");

      expect(
        screen.getByRole("button", {
          name: "Cambiar a modo claro",
        }),
      ).toBeInTheDocument();
    });

    it("cambia de modo oscuro a modo claro", async () => {
      const user = userEvent.setup();

      localStorage.setItem("theme", "dark");

      renderHeader();

      expect(
        screen.getByRole("button", {
          name: "Cambiar a modo claro",
        }),
      ).toBeInTheDocument();

      await user.click(
        screen.getByRole("button", {
          name: "Cambiar a modo claro",
        }),
      );

      expect(localStorage.getItem("theme")).toBe("light");

      expect(
        screen.getByRole("button", {
          name: "Cambiar a modo oscuro",
        }),
      ).toBeInTheDocument();
    });

    it("permite ocultar el selector de tema", () => {
      renderHeader({
        showThemeToggle: false,
      });

      expect(
        screen.queryByRole("button", {
          name: "Cambiar a modo oscuro",
        }),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole("button", {
          name: "Cambiar a modo claro",
        }),
      ).not.toBeInTheDocument();
    });

    it("responde al cambio del tema del sistema", async () => {
      let changeHandler: ((event: MediaQueryListEvent) => void) | undefined;

      const mediaQuery = {
        matches: false,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addEventListener: vi.fn(
          (_event: string, handler: (event: MediaQueryListEvent) => void) => {
            changeHandler = handler;
          },
        ),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };

      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockReturnValue(mediaQuery),
      });

      localStorage.setItem("theme", "system");

      renderHeader();

      expect(
        screen.getByRole("button", {
          name: "Cambiar a modo oscuro",
        }),
      ).toBeInTheDocument();

      expect(changeHandler).toBeDefined();

      changeHandler?.({ matches: true } as MediaQueryListEvent);

      await waitFor(() => {
        expect(
          screen.getByRole("button", {
            name: "Cambiar a modo claro",
          }),
        ).toBeInTheDocument();
      });
    });
  });

  describe("notificaciones", () => {
    it("no muestra notificaciones si no hay notificaciones ni callback", () => {
      renderHeader();

      expect(
        screen.queryByRole("button", {
          name: "Notificaciones",
        }),
      ).not.toBeInTheDocument();
    });

    it("muestra el botón de notificaciones cuando existen notificaciones", () => {
      renderHeader({
        notifications,
      });

      expect(
        screen.getByRole("button", {
          name: "Notificaciones",
        }),
      ).toBeInTheDocument();
    });

    it("muestra el contador de no leídas", () => {
      renderHeader({
        notifications,
      });

      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("limita el contador a 9+", () => {
      const manyNotifications = Array.from({ length: 12 }, (_, index) => ({
        id: String(index),
        title: `Notificación ${index}`,
        read: false,
      }));

      renderHeader({
        notifications: manyNotifications,
      });

      expect(screen.getByText("9+")).toBeInTheDocument();
    });

    it("abre el panel de notificaciones", async () => {
      const user = userEvent.setup();

      renderHeader({
        notifications,
      });

      const button = screen.getByRole("button", {
        name: "Notificaciones",
      });

      expect(button).toHaveAttribute("aria-expanded", "false");

      await user.click(button);

      expect(button).toHaveAttribute("aria-expanded", "true");

      expect(screen.getByText("Notificaciones")).toBeInTheDocument();

      expect(screen.getByText("Nueva factura")).toBeInTheDocument();

      expect(screen.getByText("Usuario actualizado")).toBeInTheDocument();
    });

    it("ejecuta onNotificationClick y cierra el panel", async () => {
      const user = userEvent.setup();
      const onNotificationClick = vi.fn();

      renderHeader({
        notifications,
        onNotificationClick,
      });

      await user.click(
        screen.getByRole("button", {
          name: "Notificaciones",
        }),
      );

      await user.click(
        screen.getByRole("button", {
          name: /Nueva factura/,
        }),
      );

      expect(onNotificationClick).toHaveBeenCalledTimes(1);

      expect(onNotificationClick).toHaveBeenCalledWith(notifications[0]);

      expect(
        screen.queryByText("Se creó una nueva factura."),
      ).not.toBeInTheDocument();
    });

    it("muestra y ejecuta Marcar todas", async () => {
      const user = userEvent.setup();
      const onMarkAllRead = vi.fn();

      renderHeader({
        notifications,
        onMarkAllRead,
      });

      await user.click(
        screen.getByRole("button", {
          name: "Notificaciones",
        }),
      );

      const button = screen.getByRole("button", {
        name: /Marcar todas/i,
      });

      expect(button).toBeInTheDocument();

      await user.click(button);

      expect(onMarkAllRead).toHaveBeenCalledTimes(1);
    });

    it("muestra el botón de notificaciones solo con onMarkAllRead", () => {
      renderHeader({
        notifications: [],
        onMarkAllRead: vi.fn(),
      });

      expect(
        screen.getByRole("button", {
          name: "Notificaciones",
        }),
      ).toBeInTheDocument();
    });

    it("muestra el estado vacío", async () => {
      const user = userEvent.setup();

      renderHeader({
        notifications: [],
        onMarkAllRead: vi.fn(),
      });

      await user.click(
        screen.getByRole("button", {
          name: "Notificaciones",
        }),
      );

      expect(screen.getByText("No tienes notificaciones")).toBeInTheDocument();
    });

    it("muestra el mensaje de una notificación cuando existe", async () => {
      const user = userEvent.setup();

      renderHeader({
        notifications: [notifications[0]],
      });

      await user.click(
        screen.getByRole("button", {
          name: "Notificaciones",
        }),
      );

      expect(
        screen.getByText("Se creó una nueva factura."),
      ).toBeInTheDocument();
    });

    it("muestra el tiempo relativo de una notificación reciente", async () => {
      const user = userEvent.setup();

      renderHeader({
        notifications: [
          {
            id: "1",
            title: "Notificación reciente",
            createdAt: new Date().toISOString(),
          },
        ],
      });

      await user.click(
        screen.getByRole("button", {
          name: "Notificaciones",
        }),
      );

      expect(screen.getByText("Ahora")).toBeInTheDocument();
    });

    it("muestra una cadena vacía para una fecha inválida", async () => {
      const user = userEvent.setup();

      renderHeader({
        notifications: [
          {
            id: "invalid",
            title: "Notificación inválida",
            createdAt: "fecha-invalida",
          },
        ],
      });

      await user.click(
        screen.getByRole("button", {
          name: "Notificaciones",
        }),
      );

      expect(screen.getByText("Notificación inválida")).toBeInTheDocument();

      expect(screen.queryByText("Invalid Date")).not.toBeInTheDocument();
    });

    it("cierra el panel de notificaciones con Escape", async () => {
      const user = userEvent.setup();

      renderHeader({
        notifications,
      });

      await user.click(
        screen.getByRole("button", {
          name: "Notificaciones",
        }),
      );

      expect(screen.getByText("Nueva factura")).toBeInTheDocument();

      await user.keyboard("{Escape}");

      expect(
        screen.queryByText("Se creó una nueva factura."),
      ).not.toBeInTheDocument();
    });
  });

  describe("usuario", () => {
    const userData = {
      name: "Juan Pérez",
      email: "juan@example.com",
      role: "Administrador",
    };

    it("renderiza la información del usuario", () => {
      renderHeader({
        user: userData,
      });

      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();

      expect(screen.getByText("Administrador")).toBeInTheDocument();
    });

    it("muestra las iniciales generadas automáticamente en el avatar", () => {
      renderHeader({
        user: userData,
      });

      expect(screen.getByText("JP")).toBeInTheDocument();
    });

    it("usa las iniciales personalizadas", () => {
      renderHeader({
        user: {
          ...userData,
          initials: "AB",
        },
      });

      expect(screen.getByText("AB")).toBeInTheDocument();

      expect(screen.queryByText("JP")).not.toBeInTheDocument();
    });

    it("muestra ? cuando el nombre está vacío", () => {
      renderHeader({
        user: {
          name: "",
        },
      });

      expect(screen.getByText("?")).toBeInTheDocument();
    });

    it("abre el menú de usuario", async () => {
      const user = userEvent.setup();

      renderHeader({
        user: userData,
      });

      const button = screen.getByRole("button", {
        name: "Menú de usuario",
      });

      expect(button).toHaveAttribute("aria-expanded", "false");

      await user.click(button);

      expect(button).toHaveAttribute("aria-expanded", "true");

      expect(screen.getByText("juan@example.com")).toBeInTheDocument();

      expect(screen.getByText("Administrador")).toBeInTheDocument();
    });

    it("muestra las acciones personalizadas del usuario", async () => {
      const user = userEvent.setup();
      const onProfile = vi.fn();
      const onSettings = vi.fn();

      renderHeader({
        user: userData,
        userActions: [
          {
            label: "Mi perfil",
            onClick: onProfile,
          },
          {
            label: "Configuración",
            onClick: onSettings,
          },
        ],
      });

      await user.click(
        screen.getByRole("button", {
          name: "Menú de usuario",
        }),
      );

      expect(
        screen.getByRole("button", {
          name: "Mi perfil",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: "Configuración",
        }),
      ).toBeInTheDocument();

      await user.click(
        screen.getByRole("button", {
          name: "Mi perfil",
        }),
      );

      expect(onProfile).toHaveBeenCalledTimes(1);
    });

    it("ejecuta onLogout", async () => {
      const user = userEvent.setup();
      const onLogout = vi.fn();

      renderHeader({
        user: userData,
        onLogout,
      });

      await user.click(
        screen.getByRole("button", {
          name: "Menú de usuario",
        }),
      );

      await user.click(
        screen.getByRole("button", {
          name: "Cerrar sesión",
        }),
      );

      expect(onLogout).toHaveBeenCalledTimes(1);
    });

    it("cierra el menú después de ejecutar una acción", async () => {
      const user = userEvent.setup();

      renderHeader({
        user: userData,
        userActions: [
          {
            label: "Mi perfil",
            onClick: vi.fn(),
          },
        ],
      });

      await user.click(
        screen.getByRole("button", {
          name: "Menú de usuario",
        }),
      );

      expect(
        screen.getByRole("button", {
          name: "Mi perfil",
        }),
      ).toBeInTheDocument();

      await user.click(
        screen.getByRole("button", {
          name: "Mi perfil",
        }),
      );

      expect(
        screen.queryByRole("button", {
          name: "Mi perfil",
        }),
      ).not.toBeInTheDocument();
    });

    it("cierra el menú de usuario con Escape", async () => {
      const user = userEvent.setup();

      renderHeader({
        user: userData,
        onLogout: vi.fn(),
      });

      await user.click(
        screen.getByRole("button", {
          name: "Menú de usuario",
        }),
      );

      expect(
        screen.getByRole("button", {
          name: "Cerrar sesión",
        }),
      ).toBeInTheDocument();

      await user.keyboard("{Escape}");

      expect(
        screen.queryByRole("button", {
          name: "Cerrar sesión",
        }),
      ).not.toBeInTheDocument();
    });

    it("cierra las notificaciones al abrir el menú de usuario", async () => {
      const user = userEvent.setup();

      renderHeader({
        user: userData,
        notifications,
      });

      await user.click(
        screen.getByRole("button", {
          name: "Notificaciones",
        }),
      );

      expect(screen.getByText("Nueva factura")).toBeInTheDocument();

      await user.click(
        screen.getByRole("button", {
          name: "Menú de usuario",
        }),
      );

      expect(
        screen.queryByText("Se creó una nueva factura."),
      ).not.toBeInTheDocument();

      expect(screen.getByText("juan@example.com")).toBeInTheDocument();
    });

    it("cierra el menú de usuario al abrir notificaciones", async () => {
      const user = userEvent.setup();

      renderHeader({
        user: userData,
        notifications,
      });

      await user.click(
        screen.getByRole("button", {
          name: "Menú de usuario",
        }),
      );

      expect(screen.getByText("juan@example.com")).toBeInTheDocument();

      await user.click(
        screen.getByRole("button", {
          name: "Notificaciones",
        }),
      );

      expect(screen.queryByText("juan@example.com")).not.toBeInTheDocument();

      expect(
        screen.getByText("Se creó una nueva factura."),
      ).toBeInTheDocument();
    });
  });

  describe("acciones personalizadas", () => {
    it("renderiza actions", () => {
      renderHeader({
        actions: <button type="button">Acción personalizada</button>,
      });

      expect(
        screen.getByRole("button", {
          name: "Acción personalizada",
        }),
      ).toBeInTheDocument();
    });

    it("ejecuta una acción personalizada", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      renderHeader({
        actions: (
          <button type="button" onClick={onClick}>
            Acción
          </button>
        ),
      });

      await user.click(
        screen.getByRole("button", {
          name: "Acción",
        }),
      );

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("interacciones entre menús", () => {
    it("Escape cierra búsqueda, notificaciones y usuario", async () => {
      const user = userEvent.setup();

      renderHeader({
        search: true,
        notifications: [
          {
            id: "1",
            title: "Nueva notificación",
            read: false,
          },
        ],
        user: {
          name: "Juan Pérez",
          email: "juan@example.com",
        },
      });

      await user.click(
        screen.getByRole("button", {
          name: "Buscar...Ctrl K",
        }),
      );

      expect(screen.getByRole("searchbox")).toBeInTheDocument();

      await user.keyboard("{Escape}");

      expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();

      await user.click(
        screen.getByRole("button", {
          name: "Notificaciones",
        }),
      );

      expect(screen.getByText("Nueva notificación")).toBeInTheDocument();

      await user.keyboard("{Escape}");

      expect(screen.queryByText("Nueva notificación")).not.toBeInTheDocument();

      await user.click(
        screen.getByRole("button", {
          name: "Menú de usuario",
        }),
      );

      expect(screen.getByText("juan@example.com")).toBeInTheDocument();

      await user.keyboard("{Escape}");

      expect(screen.queryByText("juan@example.com")).not.toBeInTheDocument();
    });
  });
});
