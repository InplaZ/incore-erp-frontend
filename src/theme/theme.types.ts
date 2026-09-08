/**
 * ============================================================================
 * THEME TYPES
 * ============================================================================
 *
 * Tipos centrales del sistema de temas.
 *
 * El modo de apariencia y el color de identidad son independientes.
 *
 * Ejemplo:
 *
 * theme = "dark"
 * colorTheme = "violet"
 *
 * Resultado:
 *
 * <html class="dark" data-color="violet">
 *
 * Esto permite que los componentes trabajen únicamente con tokens
 * semánticos y no conozcan la configuración visual concreta.
 */

/**
 * ----------------------------------------------------------------------------
 * Theme mode
 * ----------------------------------------------------------------------------
 *
 * light  -> fuerza el tema claro.
 * dark   -> fuerza el tema oscuro.
 * system -> utiliza la preferencia del sistema operativo/navegador.
 */
export type Theme = "light" | "dark" | "system";

/**
 * ----------------------------------------------------------------------------
 * Resolved theme
 * ----------------------------------------------------------------------------
 *
 * Es el tema efectivo que se está mostrando.
 *
 * Nunca puede ser "system" porque ya fue resuelto a light o dark.
 */
export type ResolvedTheme = "light" | "dark";

/**
 * ----------------------------------------------------------------------------
 * Color theme
 * ----------------------------------------------------------------------------
 *
 * Define el color principal de identidad de la aplicación.
 *
 * Los colores están implementados mediante los tokens CSS de globals.css.
 */
export type ColorTheme =
  | "neutral"
  | "blue"
  | "violet"
  | "green"
  | "orange"
  | "rose";

/**
 * ----------------------------------------------------------------------------
 * Theme context
 * ----------------------------------------------------------------------------
 *
 * API pública disponible mediante useTheme().
 */
export interface ThemeContextValue {
  /**
   * Preferencia seleccionada por el usuario.
   */
  theme: Theme;

  /**
   * Tema efectivo actualmente aplicado.
   */
  resolvedTheme: ResolvedTheme;

  /**
   * Color de identidad seleccionado.
   */
  colorTheme: ColorTheme;

  /**
   * Cambia el modo claro/oscuro/sistema.
   */
  setTheme: (theme: Theme) => void;

  /**
   * Cambia el color de identidad.
   */
  setColorTheme: (colorTheme: ColorTheme) => void;
}
