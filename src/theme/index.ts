/**
 * ============================================================================
 * THEME
 * ============================================================================
 *
 * API pública del sistema de temas.
 */

export { ThemeProvider } from "./theme.provider";

export {
  COLOR_THEMES,
  COLOR_THEME_LABELS,
  DEFAULT_COLOR_THEME,
  DEFAULT_THEME,
  THEME_LABELS,
  COLOR_THEME_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from "./theme.config";

export type {
  ColorTheme,
  ResolvedTheme,
  Theme,
  ThemeContextValue,
} from "./theme.types";
