import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTheme } from "../hooks/useTheme";
import { ThemeProvider } from "./theme.provider";

function ThemeConsumer() {
  const { theme, resolvedTheme, colorTheme, setTheme, setColorTheme } =
    useTheme();

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <span data-testid="color-theme">{colorTheme}</span>

      <button type="button" onClick={() => setTheme("light")}>
        Light
      </button>

      <button type="button" onClick={() => setTheme("dark")}>
        Dark
      </button>

      <button type="button" onClick={() => setTheme("system")}>
        System
      </button>

      <button type="button" onClick={() => setColorTheme("blue")}>
        Blue
      </button>

      <button type="button" onClick={() => setColorTheme("violet")}>
        Violet
      </button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    localStorage.clear();

    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-color");
    document.documentElement.style.colorScheme = "";

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("inicializa con las preferencias por defecto", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("system");
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("light");
    expect(screen.getByTestId("color-theme")).toHaveTextContent("rose");
  });

  it("inicializa usando las preferencias almacenadas", () => {
    localStorage.setItem("theme", "dark");
    localStorage.setItem("color-theme", "blue");

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
    expect(screen.getByTestId("color-theme")).toHaveTextContent("blue");
  });

  it("aplica el tema inicial sobre html", () => {
    localStorage.setItem("theme", "dark");

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("aplica el color inicial sobre html", () => {
    localStorage.setItem("color-theme", "blue");

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(document.documentElement.dataset.color).toBe("blue");
  });

  it("cambia a light", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    act(() => {
      screen.getByRole("button", { name: "Light" }).click();
    });

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("light");

    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("cambia a dark", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    act(() => {
      screen.getByRole("button", { name: "Dark" }).click();
    });

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");

    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("cambia a system y resuelve según el sistema", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as MediaQueryList);

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    act(() => {
      screen.getByRole("button", { name: "System" }).click();
    });

    expect(screen.getByTestId("theme")).toHaveTextContent("system");
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");

    expect(localStorage.getItem("theme")).toBe("system");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("cambia el color de identidad", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    act(() => {
      screen.getByRole("button", { name: "Blue" }).click();
    });

    expect(screen.getByTestId("color-theme")).toHaveTextContent("blue");
    expect(localStorage.getItem("color-theme")).toBe("blue");
    expect(document.documentElement.dataset.color).toBe("blue");
  });

  it("permite cambiar entre diferentes colores", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    act(() => {
      screen.getByRole("button", { name: "Blue" }).click();
    });

    expect(document.documentElement.dataset.color).toBe("blue");

    act(() => {
      screen.getByRole("button", { name: "Violet" }).click();
    });

    expect(screen.getByTestId("color-theme")).toHaveTextContent("violet");
    expect(localStorage.getItem("color-theme")).toBe("violet");
    expect(document.documentElement.dataset.color).toBe("violet");
  });

  it("reacciona a cambios del tema del sistema", () => {
    let changeHandler: ((event: MediaQueryListEvent) => void) | undefined;

    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      media: "(prefers-color-scheme: dark)",
      onchange: null,

      addEventListener: vi.fn((event: string, handler: EventListener) => {
        if (event === "change") {
          changeHandler = handler as (event: MediaQueryListEvent) => void;
        }
      }),

      removeEventListener: vi.fn(),

      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as MediaQueryList);

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("system");
    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("light");

    act(() => {
      changeHandler?.({
        matches: true,
      } as MediaQueryListEvent);
    });

    expect(screen.getByTestId("resolved-theme")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("registra y elimina el listener del sistema", () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addEventListener,
      removeEventListener,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as MediaQueryList);

    const { unmount } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("no registra listener del sistema cuando el tema no es system", () => {
    localStorage.setItem("theme", "dark");

    const addEventListener = vi.fn();

    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addEventListener,
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as MediaQueryList);

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(addEventListener).not.toHaveBeenCalled();
  });
});
