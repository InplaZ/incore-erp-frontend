/**
 * ============================================================================
 * USE THEME
 * ============================================================================
 *
 * Hook público para consumir el sistema de temas.
 *
 * Ejemplo:
 *
 * const {
 *   theme,
 *   resolvedTheme,
 *   colorTheme,
 *   setTheme,
 *   setColorTheme,
 * } = useTheme();
 *
 * El hook no contiene lógica de persistencia ni manipulación del DOM.
 * Esa responsabilidad pertenece a ThemeProvider.
 */

import { useContext } from "react";

import { ThemeContext } from "../theme/theme.context";

import type { ThemeContextValue } from "../theme/theme.types";

/**
 * Consume el contexto global del sistema de temas.
 *
 * @throws Error si se utiliza fuera de ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme debe utilizarse dentro de ThemeProvider.");
  }

  return context;
}
