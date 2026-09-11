/**
 * ============================================================================
 * THEME CONFIG
 * ============================================================================
 *
 * Configuración central del sistema de temas.
 *
 * Este archivo no contiene colores CSS.
 *
 * Los valores visuales viven en globals.css para mantener separados:
 *
 * - comportamiento/configuración -> TypeScript
 * - presentación/tokens -> CSS
 *
 * Esto permite que los componentes no dependan directamente de ningún
 * color concreto.
 */

import type { ColorTheme, Theme } from "./theme.types";

/**
 * ----------------------------------------------------------------------------
 * Defaults
 * ----------------------------------------------------------------------------
 */

/**
 * Tema por defecto.
 *
 * "system" permite respetar la preferencia del sistema operativo.
 */
export const DEFAULT_THEME: Theme = "system";

/**
 * Color de identidad por defecto.
 *
 * "neutral" corresponde al comportamiento original del template.
 */
export const DEFAULT_COLOR_THEME: ColorTheme = "green"; //CAMBIO DE COLOR POR DEFECTO

/**
 * ----------------------------------------------------------------------------
 * Local storage
 * ----------------------------------------------------------------------------
 *
 * Las preferencias se almacenan de forma independiente.
 */
export const THEME_STORAGE_KEY = "theme";

export const COLOR_THEME_STORAGE_KEY = "color-theme";

/**
 * ----------------------------------------------------------------------------
 * Available themes
 * ----------------------------------------------------------------------------
 *
 * Lista explícita de opciones soportadas.
 *
 * Usamos "as const" para conservar los valores como literales y obtener
 * tipado fuerte automáticamente.
 */
export const COLOR_THEMES = [
  "neutral",
  "blue",
  "violet",
  "green",
  "orange",
  "rose",
] as const satisfies readonly ColorTheme[];

/**
 * ----------------------------------------------------------------------------
 * Labels
 * ----------------------------------------------------------------------------
 *
 * Etiquetas pensadas para ser mostradas en selectores, menús o configuraciones
 * de la aplicación.
 */
export const COLOR_THEME_LABELS: Record<ColorTheme, string> = {
  neutral: "Neutro",
  blue: "Azul",
  violet: "Violeta",
  green: "Verde",
  orange: "Naranja",
  rose: "Rosa",
};

/**
 * Etiquetas para el selector del modo de apariencia.
 */
export const THEME_LABELS: Record<Theme, string> = {
  light: "Claro",
  dark: "Oscuro",
  system: "Sistema",
};
