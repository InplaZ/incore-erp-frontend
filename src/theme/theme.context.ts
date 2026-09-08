/**
 * ============================================================================
 * THEME CONTEXT
 * ============================================================================
 *
 * Contexto React del sistema de temas.
 *
 * El contexto se mantiene separado del provider para que:
 *
 * - useTheme pueda consumirlo.
 * - ThemeProvider pueda proveerlo.
 * - otros componentes puedan importar los tipos sin crear dependencias
 *   circulares.
 */

import { createContext } from "react";

import type { ThemeContextValue } from "./theme.types";

/**
 * Contexto interno del sistema de temas.
 *
 * Se inicializa como null para poder detectar cuando useTheme se utiliza
 * fuera de ThemeProvider.
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null);
