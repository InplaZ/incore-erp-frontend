import { createApiClient } from "./api-client";

/**
 * ============================================================================
 * PROJECT API CONFIGURATION
 * ============================================================================
 *
 * Este archivo conecta la configuración específica del proyecto
 * con la infraestructura HTTP genérica de `api-client.ts`.
 *
 * No contiene:
 *
 * - lógica de negocio
 * - autenticación obligatoria
 * - lógica de navegación
 * - lógica de React Query
 * - operaciones específicas de features
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API_TIMEOUT = 10_000;

/**
 * La URL base es necesaria para la configuración estándar del template.
 *
 * Si una aplicación concreta no utiliza una base URL, puede crear
 * su propia instancia de `createApiClient()` directamente.
 */
if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL no está configurada.");
}

/**
 * ============================================================================
 * API INSTANCE
 * ============================================================================
 */

/**
 * Instancia HTTP principal de la aplicación.
 *
 * La infraestructura genérica vive en `api-client.ts`.
 * Este archivo únicamente define la configuración específica
 * de este proyecto.
 */
export const api = createApiClient({
  /**
   * URL base del backend.
   *
   * Ejemplo:
   *
   * VITE_API_BASE_URL=https://api.example.com
   */
  baseURL: API_BASE_URL,

  /**
   * Tiempo máximo de espera por petición.
   */
  timeout: API_TIMEOUT,

  /**
   * Headers globales.
   *
   * No agregamos Content-Type aquí porque Axios puede
   * determinarlo automáticamente según el tipo de payload,
   * especialmente para FormData.
   */
  headers: {
    Accept: "application/json",
  },

  /**
   * Cookies cross-origin.
   *
   * Se cambia a true únicamente si el backend utiliza
   * autenticación basada en cookies/sesiones.
   */
  withCredentials: false,

  auth:{
    scheme: "Bearer",
    getToken: () => localStorage.getItem("access_token")
  },

  /**
   * Manejo específico de respuestas HTTP 401.
   *
   * Este cliente no decide automáticamente hacer logout
   * ni navegar a una ruta.
   *
   * Esa lógica pertenece a la capa de autenticación
   * de la aplicación.
   */
  onUnauthorized: (error) => {
    if (import.meta.env.DEV) {
      console.warn("[API] Unauthorized:", {
        code: error.code,
        message: error.message,
      });
    }
  },

  /**
   * Observador global de errores.
   *
   * No mostramos toasts aquí.
   * No navegamos aquí.
   *
   * La infraestructura HTTP solamente informa del error.
   * La capa superior decide cómo reaccionar.
   */
  onError: (error) => {
    if (import.meta.env.DEV) {
      console.error("[API] Error:", {
        code: error.code,
        message: error.message,
        details: error.details,
      });
    }
  },
});
