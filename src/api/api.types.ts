import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

import type { AppError } from "../app/errors/app-error";

/**
 * ============================================================================
 * COMMON TYPES
 * ============================================================================
 */

/**
 * Headers HTTP utilizados por la infraestructura de la API.
 *
 * Mantenemos el contrato simple e independiente de estructuras
 * específicas del backend.
 */
export type ApiHeaders = Record<string, string>;

/**
 * ============================================================================
 * AUTHENTICATION
 * ============================================================================
 *
 * Configuración opcional de autenticación.
 *
 * Este contrato no asume:
 *
 * - JWT
 * - Bearer
 * - cookies
 * - localStorage
 * - sesiones
 *
 * La aplicación consumidora decide cómo obtener y enviar sus credenciales.
 */

export interface ApiAuthConfig {
  /**
   * Obtiene la credencial actual.
   *
   * El cliente no decide dónde se almacena.
   */
  getToken?: () => string | null | undefined;

  /**
   * Esquema de autenticación.
   *
   * Ejemplos:
   * - Bearer
   * - Token
   * - JWT
   * - cualquier esquema personalizado
   *
   * Para mecanismos como Basic Auth que requieren construir
   * un valor específico, puede utilizarse `getHeaders`.
   */
  scheme?: string;

  /**
   * Nombre del header donde se enviará la credencial.
   *
   * Por defecto:
   * Authorization
   */
  headerName?: string;

  /**
   * Permite generar headers dinámicos personalizados.
   *
   * Útil para:
   * - API keys
   * - tenant IDs
   * - headers personalizados
   * - múltiples credenciales
   * - sistemas de autenticación especiales
   */
  getHeaders?: () => ApiHeaders;
}

/**
 * ============================================================================
 * RESPONSE
 * ============================================================================
 *
 * Representa la información HTTP de una respuesta exitosa.
 *
 * No impone ningún envelope específico al payload.
 *
 * El backend puede devolver:
 *
 * - un objeto
 * - un array
 * - un string
 * - un número
 * - null
 * - cualquier otra estructura
 */

export interface ApiResponse<TData = unknown> {
  /**
   * Payload devuelto por el backend.
   */
  data: TData;

  /**
   * Código HTTP de la respuesta.
   */
  status: number;

  /**
   * Texto asociado al código HTTP.
   */
  statusText?: string;

  /**
   * Headers de la respuesta normalizados.
   */
  headers?: ApiHeaders;
}

/**
 * ============================================================================
 * REQUEST
 * ============================================================================
 */

/**
 * Métodos HTTP soportados por la infraestructura.
 */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

/**
 * Valores permitidos para parámetros de consulta.
 *
 * No asumimos nombres concretos como:
 *
 * - page
 * - limit
 * - offset
 * - search
 * - ordering
 *
 * Cada feature puede definir sus propios parámetros.
 */
export type ApiQueryParamValue = string | number | boolean | null | undefined;

/**
 * Parámetros genéricos de consulta.
 *
 * Soporta valores simples y arrays de valores.
 */
export type ApiQueryParams = Record<
  string,
  ApiQueryParamValue | ApiQueryParamValue[]
>;

/**
 * Configuración de una petición HTTP.
 *
 * El payload es completamente genérico y puede representar:
 *
 * - objetos
 * - arrays
 * - FormData
 * - Blob
 * - File
 * - strings
 * - números
 * - null
 * - cualquier estructura específica de una feature
 */
export interface ApiRequestOptions<TData = unknown> {
  /**
   * Método HTTP.
   */
  method: HttpMethod;

  /**
   * URL relativa o absoluta.
   */
  url: string;

  /**
   * Payload de la petición.
   */
  data?: TData;

  /**
   * Parámetros de consulta.
   */
  params?: ApiQueryParams;

  /**
   * Headers específicos de esta petición.
   */
  headers?: ApiHeaders;

  /**
   * Permite cancelar la petición.
   *
   * Compatible con AbortController y React Query.
   */
  signal?: AbortSignal;

  /**
   * Escape hatch para opciones específicas del transporte Axios.
   *
   * Debe utilizarse únicamente cuando la abstracción genérica
   * no sea suficiente.
   */
  config?: AxiosRequestConfig;
}

/**
 * ============================================================================
 * CLIENT OPTIONS
 * ============================================================================
 *
 * Configuración del cliente HTTP principal.
 *
 * La API es backend-agnóstica, pero el transporte HTTP actual
 * está implementado mediante Axios.
 */

export interface ApiClientOptions {
  /**
   * URL base del servicio.
   *
   * Puede quedar indefinida cuando las peticiones utilizan
   * URLs absolutas o cuando la aplicación no necesita una base URL.
   */
  baseURL?: string;

  /**
   * Timeout de las peticiones en milisegundos.
   */
  timeout?: number;

  /**
   * Headers globales enviados por defecto.
   */
  headers?: ApiHeaders;

  /**
   * Configuración opcional de autenticación.
   */
  auth?: ApiAuthConfig;

  /**
   * Permite utilizar cookies en peticiones cross-origin.
   *
   * Debe activarse únicamente cuando el backend lo requiera.
   */
  withCredentials?: boolean;

  /**
   * Permite modificar la configuración de Axios
   * antes de enviar una petición.
   *
   * Este callback es deliberadamente específico de Axios.
   */
  onRequest?: (config: AxiosRequestConfig) => AxiosRequestConfig | void;

  /**
   * Observa una respuesta exitosa.
   *
   * No reemplaza ni transforma la respuesta.
   *
   * Este callback es deliberadamente específico de Axios.
   */
  onResponse?: <T>(response: AxiosResponse<T>) => void;

  /**
   * Se ejecuta ante cualquier error normalizado de la API.
   *
   * La aplicación recibe el contrato genérico `AppError`,
   * independientemente de la implementación concreta
   * que haya originado el error.
   */
  onError?: (error: AppError) => void;

  /**
   * Se ejecuta específicamente cuando la API responde HTTP 401.
   *
   * La aplicación decide qué hacer:
   *
   * - logout
   * - refresh token
   * - redirect
   * - mostrar una pantalla
   * - etc.
   */
  onUnauthorized?: (error: AppError) => void;

  /**
   * Escape hatch para utilizar opciones específicas de Axios.
   *
   * Permite acceder a funcionalidades avanzadas sin tener
   * que modificar la abstracción principal del cliente.
   */
  axiosConfig?: AxiosRequestConfig;
}

/**
 * ============================================================================
 * API CLIENT
 * ============================================================================
 *
 * Contrato público del cliente HTTP.
 *
 * La aplicación normalmente debería utilizar estos métodos.
 * La instancia Axios subyacente está disponible únicamente
 * como escape hatch para casos avanzados.
 */

export interface ApiClient {
  /**
   * Instancia Axios subyacente.
   *
   * Disponible para casos avanzados que requieran acceso
   * directo al transporte.
   */
  instance: AxiosInstance;

  /**
   * Ejecuta una petición y devuelve únicamente el payload.
   */
  request<TResponse = unknown, TData = unknown>(
    options: ApiRequestOptions<TData>,
  ): Promise<TResponse>;

  /**
   * Ejecuta una petición y devuelve el payload junto
   * con información HTTP de la respuesta.
   */
  requestResponse<TResponse = unknown, TData = unknown>(
    options: ApiRequestOptions<TData>,
  ): Promise<ApiResponse<TResponse>>;

  /**
   * HTTP GET.
   */
  get<TResponse = unknown>(
    url: string,
    options?: Omit<ApiRequestOptions, "method" | "url" | "data">,
  ): Promise<TResponse>;

  /**
   * HTTP POST.
   */
  post<TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    options?: Omit<ApiRequestOptions, "method" | "url" | "data">,
  ): Promise<TResponse>;

  /**
   * HTTP PUT.
   */
  put<TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    options?: Omit<ApiRequestOptions, "method" | "url" | "data">,
  ): Promise<TResponse>;

  /**
   * HTTP PATCH.
   */
  patch<TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    options?: Omit<ApiRequestOptions, "method" | "url" | "data">,
  ): Promise<TResponse>;

  /**
   * HTTP DELETE.
   */
  delete<TResponse = unknown>(
    url: string,
    options?: Omit<ApiRequestOptions, "method" | "url" | "data">,
  ): Promise<TResponse>;
}

/**
 * ============================================================================
 * CRUD
 * ============================================================================
 */

/**
 * Identificador genérico de una entidad.
 *
 * UUIDs y otros identificadores textuales se representan como string.
 */
export type EntityId = string | number;

/**
 * Métodos HTTP permitidos para actualizar una entidad.
 */
export type CrudUpdateMethod = "PUT" | "PATCH";

/**
 * Parámetros genéricos de una colección.
 *
 * No asumimos:
 *
 * - page
 * - limit
 * - offset
 * - search
 * - ordering
 * - filtros específicos
 *
 * Cada feature puede extender este contrato con sus propios parámetros.
 */
export type CrudListParams = ApiQueryParams;

/**
 * Contrato de operaciones CRUD genéricas.
 *
 * No asumimos que todas las APIs utilicen CRUD.
 * Esta abstracción es únicamente una utilidad opcional para
 * endpoints que sigan una estructura convencional.
 */
export interface CrudOperations<
  TEntity,
  TCreate = Partial<TEntity>,
  TUpdate = Partial<TEntity>,
  TListResponse = TEntity[],
  TParams extends CrudListParams = CrudListParams,
  TDeleteResponse = void,
> {
  /**
   * Obtiene una colección de entidades.
   */
  list(params?: TParams): Promise<TListResponse>;

  /**
   * Obtiene una entidad por su identificador.
   */
  getOne(id: EntityId): Promise<TEntity>;

  /**
   * Crea una entidad.
   */
  create(data: TCreate): Promise<TEntity>;

  /**
   * Actualiza una entidad.
   */
  update(id: EntityId, data: TUpdate): Promise<TEntity>;

  /**
   * Elimina una entidad.
   */
  delete(id: EntityId): Promise<TDeleteResponse>;
}
