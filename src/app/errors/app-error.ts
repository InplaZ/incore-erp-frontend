/**
 * ============================================================================
 * APPLICATION ERROR
 * ============================================================================
 *
 * Contrato común para representar errores dentro de la aplicación.
 *
 * `AppError` es independiente de:
 *
 * - Axios
 * - React Query
 * - React Router
 * - cualquier backend específico
 * - cualquier formato concreto de respuesta de una API
 *
 * Las diferentes capas de la aplicación pueden transformar sus errores
 * originales a este formato para que la capa superior trabaje con un
 * contrato consistente.
 *
 * Ejemplo de flujo:
 *
 * Backend / Browser / Library
 *            ↓
 *      Error original
 *            ↓
 *       AppError
 *            ↓
 *       Application UI
 *
 * ============================================================================
 */

/**
 * Códigos normalizados de error utilizados por la aplicación.
 *
 * Estos códigos representan categorías de errores, no mensajes concretos.
 *
 * Los mensajes pueden variar según el contexto, idioma o información
 * proporcionada por el backend, mientras que el código mantiene una
 * clasificación estable para que la aplicación pueda tomar decisiones.
 *
 * Ejemplos:
 *
 * `NETWORK_ERROR`
 * → No fue posible establecer o mantener la comunicación.
 *
 * `UNAUTHORIZED`
 * → La operación requiere autenticación o las credenciales no son válidas.
 *
 * `FORBIDDEN`
 * → El usuario está identificado, pero no tiene autorización suficiente.
 *
 * `NOT_FOUND`
 * → El recurso solicitado no existe o no está disponible.
 *
 * `VALIDATION_ERROR`
 * → Los datos proporcionados no cumplen las reglas esperadas.
 *
 * `SERVER_ERROR`
 * → Se produjo un error en el servidor o servicio remoto.
 *
 * `UNKNOWN_ERROR`
 * → Error que no puede clasificarse de forma más específica.
 */
export type AppErrorCode =
  | "NETWORK_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";

/**
 * Opciones adicionales para construir un `AppError`.
 *
 * Permite conservar información útil sin acoplar el contrato a una
 * tecnología o estructura de backend concreta.
 */
export interface AppErrorOptions {
  /**
   * Error original que provocó el `AppError`.
   *
   * Puede ser cualquier valor porque JavaScript/TypeScript permite que
   * diferentes librerías lancen valores que no necesariamente son
   * instancias de `Error`.
   *
   * Ejemplo:
   *
   * ```ts
   * const originalError = new Error("Connection failed");
   *
   * const error = new AppError(
   *   "NETWORK_ERROR",
   *   "No fue posible conectarse con el servidor.",
   *   {
   *     cause: originalError,
   *   },
   * );
   * ```
   */
  cause?: unknown;

  /**
   * Información adicional asociada al error.
   *
   * Su estructura permanece deliberadamente abierta porque cada aplicación
   * puede necesitar diferentes tipos de detalles.
   *
   * Ejemplos:
   *
   * - errores de validación por campo
   * - información adicional del backend
   * - identificadores de una operación
   * - datos útiles para logging
   *
   * La capa de infraestructura no debe asumir una estructura concreta.
   */
  details?: unknown;
}

/**
 * Error normalizado de la aplicación.
 *
 * Extiende el `Error` nativo de JavaScript y añade un código estable y
 * detalles opcionales.
 *
 * `AppError` permite que las diferentes capas de la aplicación trabajen
 * con un contrato común sin depender directamente de la implementación
 * concreta del error original.
 *
 * Ejemplo:
 *
 * ```ts
 * const error = new AppError(
 *   "NOT_FOUND",
 *   "El recurso solicitado no existe.",
 * );
 *
 * if (error.code === "NOT_FOUND") {
 *   // Mostrar comportamiento específico para recurso inexistente.
 * }
 * ```
 */
export class AppError extends Error {
  /**
   * Categoría normalizada del error.
   */
  readonly code: AppErrorCode;

  /**
   * Información adicional asociada al error.
   *
   * Su estructura depende del contexto que originó el error.
   */
  readonly details?: unknown;

  /**
   * Crea un nuevo error de aplicación.
   *
   * @param code - Categoría normalizada del error.
   * @param message - Mensaje descriptivo del error.
   * @param options - Información adicional opcional.
   */
  constructor(code: AppErrorCode, message: string, options?: AppErrorOptions) {
    super(message, {
      cause: options?.cause,
    });

    this.name = "AppError";
    this.code = code;
    this.details = options?.details;
  }
}
