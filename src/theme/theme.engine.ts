/**
 * ============================================================================
 * THEME ENGINE
 * ============================================================================
 *
 * Motor independiente de React para el sistema de temas.
 *
 * Responsabilidades:
 *
 * - Validar preferencias.
 * - Leer preferencias desde localStorage.
 * - Guardar preferencias en localStorage.
 * - Resolver el tema "system".
 * - Detectar la preferencia del sistema operativo.
 * - Aplicar el tema sobre <html>.
 * - Aplicar el color de identidad sobre <html>.
 *
 * Este archivo no depende de React ni de componentes de UI.
 */

import {
  COLOR_THEME_STORAGE_KEY,
  DEFAULT_COLOR_THEME,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
} from "./theme.config";

import type { ColorTheme, ResolvedTheme, Theme } from "./theme.types";

/**
 * ----------------------------------------------------------------------------
 * Validation
 * ----------------------------------------------------------------------------
 */

/**
 * Comprueba si un valor corresponde a un tema válido.
 */
export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

/**
 * Comprueba si un valor corresponde a un color de tema válido.
 */
export function isColorTheme(value: unknown): value is ColorTheme {
  return (
    value === "neutral" ||
    value === "blue" ||
    value === "violet" ||
    value === "green" ||
    value === "orange" ||
    value === "rose"
  );
}

/**
 * ----------------------------------------------------------------------------
 * System theme
 * ----------------------------------------------------------------------------
 */

/**
 * Obtiene la preferencia de apariencia del sistema operativo.
 *
 * En entornos donde `window` o `matchMedia` no están disponibles,
 * se utiliza "light" como valor seguro.
 */
export function getSystemTheme(): ResolvedTheme {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * ----------------------------------------------------------------------------
 * Theme resolution
 * ----------------------------------------------------------------------------
 */

/**
 * Convierte la preferencia del usuario en el tema efectivo.
 *
 * "system" se resuelve según la preferencia actual del sistema operativo.
 */
export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") {
    return getSystemTheme();
  }

  return theme;
}

/**
 * ----------------------------------------------------------------------------
 * Storage - read
 * ----------------------------------------------------------------------------
 */

/**
 * Obtiene el tema guardado en localStorage.
 *
 * Si no existe, no es válido o localStorage no está disponible,
 * devuelve el valor predeterminado.
 */
export function getStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    return isTheme(storedTheme) ? storedTheme : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/**
 * Obtiene el color de tema guardado en localStorage.
 *
 * Si no existe, no es válido o localStorage no está disponible,
 * devuelve el valor predeterminado.
 */
export function getStoredColorTheme(): ColorTheme {
  if (typeof window === "undefined") {
    return DEFAULT_COLOR_THEME;
  }

  try {
    const storedColorTheme = window.localStorage.getItem(
      COLOR_THEME_STORAGE_KEY,
    );

    return isColorTheme(storedColorTheme)
      ? storedColorTheme
      : DEFAULT_COLOR_THEME;
  } catch {
    return DEFAULT_COLOR_THEME;
  }
}

/**
 * ----------------------------------------------------------------------------
 * Storage - write
 * ----------------------------------------------------------------------------
 */

/**
 * Guarda la preferencia de apariencia.
 */
export function storeTheme(theme: Theme): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /**
     * La aplicación continúa funcionando aunque localStorage
     * no esté disponible o esté bloqueado.
     */
  }
}

/**
 * Guarda la preferencia de color de identidad.
 */
export function storeColorTheme(colorTheme: ColorTheme): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(COLOR_THEME_STORAGE_KEY, colorTheme);
  } catch {
    /**
     * La aplicación continúa funcionando aunque localStorage
     * no esté disponible o esté bloqueado.
     */
  }
}

/**
 * ----------------------------------------------------------------------------
 * DOM - resolved theme
 * ----------------------------------------------------------------------------
 */

/**
 * Aplica directamente un tema ya resuelto sobre <html>.
 *
 * Esta función únicamente acepta:
 *
 * - light
 * - dark
 *
 * Nunca recibe "system".
 *
 * Se mantiene separada de applyTheme() porque el provider necesita
 * aplicar directamente los cambios detectados del sistema operativo.
 */
export function applyResolvedTheme(resolvedTheme: ResolvedTheme): void {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  /**
   * globals.css utiliza la clase "dark" para activar los tokens
   * correspondientes al modo oscuro.
   */
  root.classList.toggle("dark", resolvedTheme === "dark");

  /**
   * Informa al navegador del esquema visual actual.
   *
   * Esto permite que elementos nativos del navegador respeten
   * el modo visual activo.
   */
  root.style.colorScheme = resolvedTheme;
}

/**
 * ----------------------------------------------------------------------------
 * DOM - theme
 * ----------------------------------------------------------------------------
 */

/**
 * Resuelve y aplica el tema seleccionado.
 *
 * Si el tema es "system", primero obtiene la preferencia actual
 * del sistema operativo.
 *
 * Devuelve el tema efectivo resultante.
 */
export function applyTheme(theme: Theme): ResolvedTheme {
  const resolvedTheme = resolveTheme(theme);

  applyResolvedTheme(resolvedTheme);

  return resolvedTheme;
}

/**
 * ----------------------------------------------------------------------------
 * DOM - color theme
 * ----------------------------------------------------------------------------
 */

/**
 * Aplica el color de identidad mediante el atributo `data-color`
 * del elemento raíz.
 *
 * globals.css utiliza este atributo para seleccionar la paleta.
 *
 * Ejemplo:
 *
 * <html data-color="violet">
 */
export function applyColorTheme(colorTheme: ColorTheme): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.color = colorTheme;
}

/**
 * ----------------------------------------------------------------------------
 * DOM - complete preferences
 * ----------------------------------------------------------------------------
 */

/**
 * Aplica simultáneamente el modo de apariencia y el color de identidad.
 *
 * Devuelve el tema efectivo después de resolver "system".
 */
export function applyThemePreferences(
  theme: Theme,
  colorTheme: ColorTheme,
): ResolvedTheme {
  const resolvedTheme = applyTheme(theme);

  applyColorTheme(colorTheme);

  return resolvedTheme;
}
