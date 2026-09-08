import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  applyColorTheme,
  applyResolvedTheme,
  applyTheme,
  applyThemePreferences,
  getStoredColorTheme,
  getStoredTheme,
  getSystemTheme,
  isColorTheme,
  isTheme,
  resolveTheme,
  storeColorTheme,
  storeTheme,
} from "./theme.engine";

describe("theme.engine", () => {
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

  describe("isTheme", () => {
    it("acepta light", () => {
      expect(isTheme("light")).toBe(true);
    });

    it("acepta dark", () => {
      expect(isTheme("dark")).toBe(true);
    });

    it("acepta system", () => {
      expect(isTheme("system")).toBe(true);
    });

    it("rechaza valores inválidos", () => {
      expect(isTheme("blue")).toBe(false);
      expect(isTheme("invalid")).toBe(false);
      expect(isTheme(null)).toBe(false);
      expect(isTheme(undefined)).toBe(false);
    });
  });

  describe("isColorTheme", () => {
    it.each(["neutral", "blue", "violet", "green", "orange", "rose"])(
      "acepta el color %s",
      (color) => {
        expect(isColorTheme(color)).toBe(true);
      },
    );

    it("rechaza valores inválidos", () => {
      expect(isColorTheme("red")).toBe(false);
      expect(isColorTheme("invalid")).toBe(false);
      expect(isColorTheme(null)).toBe(false);
      expect(isColorTheme(undefined)).toBe(false);
    });
  });

  describe("getSystemTheme", () => {
    it("devuelve dark cuando el sistema prefiere modo oscuro", () => {
      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: true,
      } as MediaQueryList);

      expect(getSystemTheme()).toBe("dark");
    });

    it("devuelve light cuando el sistema prefiere modo claro", () => {
      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: false,
      } as MediaQueryList);

      expect(getSystemTheme()).toBe("light");
    });
  });

  describe("resolveTheme", () => {
    it("devuelve light cuando el tema es light", () => {
      expect(resolveTheme("light")).toBe("light");
    });

    it("devuelve dark cuando el tema es dark", () => {
      expect(resolveTheme("dark")).toBe("dark");
    });

    it("resuelve system según la preferencia del sistema", () => {
      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: true,
      } as MediaQueryList);

      expect(resolveTheme("system")).toBe("dark");
    });
  });

  describe("getStoredTheme", () => {
    it("devuelve el tema almacenado", () => {
      localStorage.setItem("theme", "dark");

      expect(getStoredTheme()).toBe("dark");
    });

    it("devuelve el tema por defecto cuando no existe almacenamiento", () => {
      expect(getStoredTheme()).toBe("system");
    });

    it("devuelve el tema por defecto cuando el valor almacenado es inválido", () => {
      localStorage.setItem("theme", "invalid");

      expect(getStoredTheme()).toBe("system");
    });
  });

  describe("getStoredColorTheme", () => {
    it("devuelve el color almacenado", () => {
      localStorage.setItem("color-theme", "blue");

      expect(getStoredColorTheme()).toBe("blue");
    });

    it("devuelve el color por defecto cuando no existe almacenamiento", () => {
      expect(getStoredColorTheme()).toBe("rose");
    });

    it("devuelve el color por defecto cuando el valor almacenado es inválido", () => {
      localStorage.setItem("color-theme", "invalid");

      expect(getStoredColorTheme()).toBe("rose");
    });
  });

  describe("storeTheme", () => {
    it("guarda el tema en localStorage", () => {
      storeTheme("dark");

      expect(localStorage.getItem("theme")).toBe("dark");
    });

    it("puede guardar system", () => {
      storeTheme("system");

      expect(localStorage.getItem("theme")).toBe("system");
    });
  });

  describe("storeColorTheme", () => {
    it("guarda el color en localStorage", () => {
      storeColorTheme("blue");

      expect(localStorage.getItem("color-theme")).toBe("blue");
    });

    it("puede guardar cualquier color válido", () => {
      storeColorTheme("violet");

      expect(localStorage.getItem("color-theme")).toBe("violet");
    });
  });

  describe("applyResolvedTheme", () => {
    it("activa la clase dark para dark", () => {
      applyResolvedTheme("dark");

      expect(document.documentElement).toHaveClass("dark");
      expect(document.documentElement.style.colorScheme).toBe("dark");
    });

    it("elimina la clase dark para light", () => {
      document.documentElement.classList.add("dark");

      applyResolvedTheme("light");

      expect(document.documentElement).not.toHaveClass("dark");
      expect(document.documentElement.style.colorScheme).toBe("light");
    });

    it("mantiene otras clases del elemento html", () => {
      document.documentElement.classList.add("otra-clase");

      applyResolvedTheme("dark");

      expect(document.documentElement).toHaveClass("otra-clase");
      expect(document.documentElement).toHaveClass("dark");

      applyResolvedTheme("light");

      expect(document.documentElement).toHaveClass("otra-clase");
      expect(document.documentElement).not.toHaveClass("dark");
    });
  });

  describe("applyTheme", () => {
    it("aplica directamente el tema light", () => {
      const result = applyTheme("light");

      expect(result).toBe("light");
      expect(document.documentElement).not.toHaveClass("dark");
      expect(document.documentElement.style.colorScheme).toBe("light");
    });

    it("aplica directamente el tema dark", () => {
      const result = applyTheme("dark");

      expect(result).toBe("dark");
      expect(document.documentElement).toHaveClass("dark");
      expect(document.documentElement.style.colorScheme).toBe("dark");
    });

    it("resuelve y aplica system", () => {
      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: true,
      } as MediaQueryList);

      const result = applyTheme("system");

      expect(result).toBe("dark");
      expect(document.documentElement).toHaveClass("dark");
      expect(document.documentElement.style.colorScheme).toBe("dark");
    });
  });

  describe("applyColorTheme", () => {
    it("aplica el color blue sobre data-color", () => {
      applyColorTheme("blue");

      expect(document.documentElement.dataset.color).toBe("blue");
    });

    it("puede cambiar de un color a otro", () => {
      applyColorTheme("blue");

      expect(document.documentElement.dataset.color).toBe("blue");

      applyColorTheme("violet");

      expect(document.documentElement.dataset.color).toBe("violet");
    });

    it.each(["neutral", "blue", "violet", "green", "orange", "rose"])(
      "aplica correctamente el color %s",
      (color) => {
        applyColorTheme(color as Parameters<typeof applyColorTheme>[0]);

        expect(document.documentElement.dataset.color).toBe(color);
      },
    );
  });

  describe("applyThemePreferences", () => {
    it("aplica tema y color simultáneamente", () => {
      const result = applyThemePreferences("light", "blue");

      expect(result).toBe("light");
      expect(document.documentElement).not.toHaveClass("dark");
      expect(document.documentElement.style.colorScheme).toBe("light");
      expect(document.documentElement.dataset.color).toBe("blue");
    });

    it("aplica tema oscuro y color", () => {
      const result = applyThemePreferences("dark", "violet");

      expect(result).toBe("dark");
      expect(document.documentElement).toHaveClass("dark");
      expect(document.documentElement.style.colorScheme).toBe("dark");
      expect(document.documentElement.dataset.color).toBe("violet");
    });

    it("resuelve system y aplica el color", () => {
      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: true,
      } as MediaQueryList);

      const result = applyThemePreferences("system", "blue");

      expect(result).toBe("dark");
      expect(document.documentElement).toHaveClass("dark");
      expect(document.documentElement.dataset.color).toBe("blue");
    });
  });
});
