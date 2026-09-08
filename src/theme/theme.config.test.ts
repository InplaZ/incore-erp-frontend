import { describe, expect, it } from "vitest";

import {
  COLOR_THEME_LABELS,
  COLOR_THEME_STORAGE_KEY,
  COLOR_THEMES,
  DEFAULT_COLOR_THEME,
  DEFAULT_THEME,
  THEME_LABELS,
  THEME_STORAGE_KEY,
} from "./theme.config";

describe("theme.config", () => {
  describe("defaults", () => {
    it("define system como tema por defecto", () => {
      expect(DEFAULT_THEME).toBe("system");
    });

    it("define rose como color por defecto", () => {
      expect(DEFAULT_COLOR_THEME).toBe("rose");
    });
  });

  describe("localStorage keys", () => {
    it("define correctamente la clave del tema", () => {
      expect(THEME_STORAGE_KEY).toBe("theme");
    });

    it("define correctamente la clave del color", () => {
      expect(COLOR_THEME_STORAGE_KEY).toBe("color-theme");
    });

    it("usa claves diferentes para tema y color", () => {
      expect(THEME_STORAGE_KEY).not.toBe(COLOR_THEME_STORAGE_KEY);
    });
  });

  describe("COLOR_THEMES", () => {
    it("contiene todos los colores soportados", () => {
      expect(COLOR_THEMES).toEqual([
        "neutral",
        "blue",
        "violet",
        "green",
        "orange",
        "rose",
      ]);
    });

    it("contiene exactamente seis colores", () => {
      expect(COLOR_THEMES).toHaveLength(6);
    });

    it("no contiene colores duplicados", () => {
      expect(new Set(COLOR_THEMES).size).toBe(COLOR_THEMES.length);
    });
  });

  describe("COLOR_THEME_LABELS", () => {
    it("define una etiqueta para cada color", () => {
      for (const color of COLOR_THEMES) {
        expect(COLOR_THEME_LABELS[color]).toBeTruthy();
      }
    });

    it("contiene las etiquetas correctas", () => {
      expect(COLOR_THEME_LABELS).toEqual({
        neutral: "Neutro",
        blue: "Azul",
        violet: "Violeta",
        green: "Verde",
        orange: "Naranja",
        rose: "Rosa",
      });
    });
  });

  describe("THEME_LABELS", () => {
    it("define las tres opciones de apariencia", () => {
      expect(THEME_LABELS).toEqual({
        light: "Claro",
        dark: "Oscuro",
        system: "Sistema",
      });
    });

    it("contiene exactamente tres opciones", () => {
      expect(Object.keys(THEME_LABELS)).toHaveLength(3);
    });
  });

  describe("consistencia de configuración", () => {
    it("el color por defecto pertenece a los colores soportados", () => {
      expect(COLOR_THEMES).toContain(DEFAULT_COLOR_THEME);
    });

    it("el tema por defecto tiene una etiqueta definida", () => {
      expect(THEME_LABELS[DEFAULT_THEME]).toBeTruthy();
    });

    it("todos los colores soportados tienen etiqueta", () => {
      expect(
        COLOR_THEMES.every(
          (color) => typeof COLOR_THEME_LABELS[color] === "string",
        ),
      ).toBe(true);
    });
  });
});
