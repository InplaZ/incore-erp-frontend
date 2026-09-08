import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { createApiClient } from "./api-client";

/**
 * ============================================================================
 * TEST HELPERS
 * ============================================================================
 */

/**
 * Crea una respuesta Axios válida para nuestros adapters de prueba.
 */
const createResponse = <T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
  statusText = "OK",
): AxiosResponse<T> => {
  return {
    data,
    status,
    statusText,
    headers: new AxiosHeaders(),
    config,
    request: {},
  };
};

/**
 * Crea un adapter Axios que simula una respuesta exitosa.
 *
 * IMPORTANTE:
 *
 * No mockeamos `instance.request()`.
 *
 * El adapter está por debajo de los interceptores,
 * por lo que los interceptores reales del ApiClient
 * siguen ejecutándose.
 */
const createSuccessAdapter = <T>(
  data: T,
  status = 200,
  statusText = "OK",
): AxiosAdapter => {
  return async (
    config: InternalAxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return createResponse(config, data, status, statusText);
  };
};

/**
 * Crea un adapter que simula un error HTTP de Axios.
 */
const createErrorAdapter = (
  status: number,
  data: unknown = {},
  statusText = "Error",
): AxiosAdapter => {
  return async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    const response = createResponse(config, data, status, statusText);

    throw new AxiosError(
      `Request failed with status ${status}`,
      "ERR_BAD_REQUEST",
      config,
      undefined,
      response,
    );
  };
};

/**
 * Convierte los headers de Axios a un objeto sencillo.
 */
const getHeaders = (
  config: AxiosRequestConfig | undefined,
): Record<string, unknown> => {
  if (!config?.headers) {
    return {};
  }

  if (config.headers instanceof AxiosHeaders) {
    return config.headers.toJSON();
  }

  return config.headers as Record<string, unknown>;
};

/**
 * ============================================================================
 * TESTS
 * ============================================================================
 */

describe("createApiClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * ==========================================================================
   * CREATION & CONFIGURATION
   * ==========================================================================
   */

  describe("creation", () => {
    it("crea correctamente el cliente API", () => {
      const api = createApiClient();

      expect(api).toBeDefined();
      expect(api.instance).toBeDefined();

      expect(api.request).toBeTypeOf("function");
      expect(api.requestResponse).toBeTypeOf("function");

      expect(api.get).toBeTypeOf("function");
      expect(api.post).toBeTypeOf("function");
      expect(api.put).toBeTypeOf("function");
      expect(api.patch).toBeTypeOf("function");
      expect(api.delete).toBeTypeOf("function");
    });

    it("aplica baseURL y timeout", () => {
      const api = createApiClient({
        baseURL: "https://api.example.com",
        timeout: 5_000,
      });

      expect(api.instance.defaults.baseURL).toBe("https://api.example.com");

      expect(api.instance.defaults.timeout).toBe(5_000);
    });

    it("usa el timeout por defecto de 10 segundos", () => {
      const api = createApiClient({
        baseURL: "https://api.example.com",
      });

      expect(api.instance.defaults.timeout).toBe(10_000);
    });

    it("permite configurar headers globales", () => {
      const api = createApiClient({
        headers: {
          Accept: "application/json",
          "X-Test": "hello",
        },
      });

      expect(api.instance.defaults.headers.Accept).toBe("application/json");

      expect(api.instance.defaults.headers["X-Test"]).toBe("hello");
    });

    it("permite configurar withCredentials", () => {
      const api = createApiClient({
        withCredentials: true,
      });

      expect(api.instance.defaults.withCredentials).toBe(true);
    });
  });

  /**
   * ==========================================================================
   * HTTP METHODS
   * ==========================================================================
   */

  describe("HTTP methods", () => {
    it("ejecuta GET y devuelve response.data", async () => {
      const api = createApiClient();

      api.instance.defaults.adapter = createSuccessAdapter({
        id: 1,
        name: "John",
      });

      const result = await api.get<{
        id: number;
        name: string;
      }>("/users/1");

      expect(result).toEqual({
        id: 1,
        name: "John",
      });
    });

    it("ejecuta POST con data", async () => {
      const api = createApiClient();

      let receivedData: unknown;

      api.instance.defaults.adapter = async (config) => {
        receivedData = config.data;

        return createResponse(
          config,
          {
            id: 1,
            name: "John",
          },
          201,
          "Created",
        );
      };

      const data = {
        name: "John",
      };

      const result = await api.post<
        {
          id: number;
          name: string;
        },
        typeof data
      >("/users", data);

      expect(result).toEqual({
        id: 1,
        name: "John",
      });

      expect(JSON.parse(String(receivedData))).toEqual(data);
    });

    it("ejecuta PUT con data", async () => {
      const api = createApiClient();

      let receivedMethod: string | undefined;

      api.instance.defaults.adapter = async (config) => {
        receivedMethod = config.method;

        return createResponse(config, {
          id: 1,
          name: "Updated",
        });
      };

      const result = await api.put("/users/1", {
        name: "Updated",
      });

      expect(result).toEqual({
        id: 1,
        name: "Updated",
      });

      expect(receivedMethod).toBe("put");
    });

    it("ejecuta PATCH con data", async () => {
      const api = createApiClient();

      let receivedMethod: string | undefined;

      api.instance.defaults.adapter = async (config) => {
        receivedMethod = config.method;

        return createResponse(config, {
          id: 1,
          name: "Patched",
        });
      };

      const result = await api.patch("/users/1", {
        name: "Patched",
      });

      expect(result).toEqual({
        id: 1,
        name: "Patched",
      });

      expect(receivedMethod).toBe("patch");
    });

    it("ejecuta DELETE", async () => {
      const api = createApiClient();

      let receivedMethod: string | undefined;

      api.instance.defaults.adapter = async (config) => {
        receivedMethod = config.method;

        return createResponse(config, {
          success: true,
        });
      };

      const result = await api.delete<{
        success: boolean;
      }>("/users/1");

      expect(result).toEqual({
        success: true,
      });

      expect(receivedMethod).toBe("delete");
    });
  });

  /**
   * ==========================================================================
   * REQUEST OPTIONS
   * ==========================================================================
   */

  describe("request options", () => {
    it("envía query params", async () => {
      const api = createApiClient();

      let receivedParams: unknown;

      api.instance.defaults.adapter = async (config) => {
        receivedParams = config.params;

        return createResponse(config, []);
      };

      await api.get("/users", {
        params: {
          search: "john",
          page: 2,
          active: true,
        },
      });

      expect(receivedParams).toEqual({
        search: "john",
        page: 2,
        active: true,
      });
    });

    it("envía headers específicos de una petición", async () => {
      const api = createApiClient();

      let receivedHeaders: Record<string, unknown> = {};

      api.instance.defaults.adapter = async (config) => {
        receivedHeaders = getHeaders(config);

        return createResponse(config, {});
      };

      await api.get("/users", {
        headers: {
          "X-Request-ID": "123",
        },
      });

      expect(receivedHeaders["X-Request-ID"]).toBe("123");
    });

    it("permite utilizar AbortSignal", async () => {
      const api = createApiClient();

      let receivedSignal: unknown;

      api.instance.defaults.adapter = async (config) => {
        receivedSignal = config.signal;

        return createResponse(config, {});
      };

      const controller = new AbortController();

      await api.get("/users", {
        signal: controller.signal,
      });

      expect(receivedSignal).toBe(controller.signal);
    });

    it("permite utilizar configuración específica de Axios", async () => {
      const api = createApiClient();

      let receivedResponseType: unknown;

      api.instance.defaults.adapter = async (config) => {
        receivedResponseType = config.responseType;

        return createResponse(config, {});
      };

      await api.get("/users", {
        config: {
          responseType: "blob",
        },
      });

      expect(receivedResponseType).toBe("blob");
    });
  });

  /**
   * ==========================================================================
   * REQUEST RESPONSE
   * ==========================================================================
   */

  describe("requestResponse", () => {
    it("devuelve payload y metadata HTTP", async () => {
      const api = createApiClient();

      api.instance.defaults.adapter = createSuccessAdapter(
        {
          id: 1,
        },
        201,
        "Created",
      );

      const result = await api.requestResponse({
        method: "GET",
        url: "/users/1",
      });

      expect(result).toEqual({
        data: {
          id: 1,
        },
        status: 201,
        statusText: "Created",
        headers: {},
      });
    });
  });

  /**
   * ==========================================================================
   * AUTHENTICATION
   * ==========================================================================
   */

  describe("authentication", () => {
    it("agrega Authorization con scheme y token", async () => {
      const api = createApiClient({
        auth: {
          getToken: () => "abc123",
          scheme: "Bearer",
        },
      });

      let receivedHeaders: Record<string, unknown> = {};

      api.instance.defaults.adapter = async (config) => {
        receivedHeaders = getHeaders(config);

        return createResponse(config, {});
      };

      await api.get("/users");

      expect(receivedHeaders.Authorization).toBe("Bearer abc123");
    });

    it("permite utilizar un header de autenticación personalizado", async () => {
      const api = createApiClient({
        auth: {
          getToken: () => "abc123",
          headerName: "X-API-Key",
        },
      });

      let receivedHeaders: Record<string, unknown> = {};

      api.instance.defaults.adapter = async (config) => {
        receivedHeaders = getHeaders(config);

        return createResponse(config, {});
      };

      await api.get("/users");

      expect(receivedHeaders["X-API-Key"]).toBe("abc123");
    });

    it("permite autenticación mediante headers personalizados", async () => {
      const api = createApiClient({
        auth: {
          getHeaders: () => ({
            Authorization: "Custom credential",
            "X-Tenant-ID": "tenant-1",
          }),
        },
      });

      let receivedHeaders: Record<string, unknown> = {};

      api.instance.defaults.adapter = async (config) => {
        receivedHeaders = getHeaders(config);

        return createResponse(config, {});
      };

      await api.get("/users");

      expect(receivedHeaders.Authorization).toBe("Custom credential");

      expect(receivedHeaders["X-Tenant-ID"]).toBe("tenant-1");
    });

    it("no agrega Authorization cuando no existe token", async () => {
      const api = createApiClient({
        auth: {
          getToken: () => null,
          scheme: "Bearer",
        },
      });

      let receivedHeaders: Record<string, unknown> = {};

      api.instance.defaults.adapter = async (config) => {
        receivedHeaders = getHeaders(config);

        return createResponse(config, {});
      };

      await api.get("/users");

      expect(receivedHeaders.Authorization).toBeUndefined();
    });
  });

  /**
   * ==========================================================================
   * CALLBACKS
   * ==========================================================================
   */

  describe("callbacks", () => {
    it("ejecuta onRequest", async () => {
      const onRequest = vi.fn((config) => {
        config.headers?.set("X-Test", "request");

        return config;
      });

      const api = createApiClient({
        onRequest,
      });

      let receivedHeaders: Record<string, unknown> = {};

      api.instance.defaults.adapter = async (config) => {
        receivedHeaders = getHeaders(config);

        return createResponse(config, {});
      };

      await api.get("/users");

      expect(onRequest).toHaveBeenCalledTimes(1);

      expect(receivedHeaders["X-Test"]).toBe("request");
    });

    it("ejecuta onResponse ante una respuesta exitosa", async () => {
      const onResponse = vi.fn();

      const api = createApiClient({
        onResponse,
      });

      api.instance.defaults.adapter = createSuccessAdapter({
        id: 1,
      });

      await api.get("/users/1");

      expect(onResponse).toHaveBeenCalledTimes(1);

      expect(onResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 200,
          data: {
            id: 1,
          },
        }),
      );
    });
  });

  /**
   * ==========================================================================
   * ERROR NORMALIZATION
   * ==========================================================================
   */

  describe("error normalization", () => {
    it("normaliza un error HTTP a AppError", async () => {
      const api = createApiClient();

      api.instance.defaults.adapter = createErrorAdapter(
        400,
        {
          message: "Invalid data",
        },
        "Bad Request",
      );

      try {
        await api.get("/users");

        throw new Error("La petición debería haber fallado");
      } catch (error) {
        expect(error).toMatchObject({
          name: "AppError",
          code: "UNKNOWN_ERROR",
          message: "Request failed with status 400",
        });

        expect(error).toHaveProperty("cause");

        const appError = error as {
          cause?: AxiosError;
        };

        expect(appError.cause).toBeInstanceOf(AxiosError);
        expect(appError.cause?.response?.status).toBe(400);
        expect(appError.cause?.response?.data).toEqual({
          message: "Invalid data",
        });
      }
    });

    it("conserva el error original de Axios como cause", async () => {
      const api = createApiClient();

      let originalError: AxiosError | undefined;

      api.instance.defaults.adapter = async (config) => {
        const response = createResponse(
          config,
          {
            message: "Invalid data",
          },
          400,
          "Bad Request",
        );

        originalError = new AxiosError(
          "Request failed",
          "ERR_BAD_REQUEST",
          config,
          undefined,
          response,
        );

        throw originalError;
      };

      try {
        await api.get("/users");

        throw new Error("La petición debería haber fallado");
      } catch (error) {
        expect(error).toMatchObject({
          name: "AppError",
          code: "UNKNOWN_ERROR",
        });

        expect(error).toHaveProperty("cause", originalError);
      }
    });

    it("ejecuta onError ante un error HTTP", async () => {
      const onError = vi.fn();

      const api = createApiClient({
        onError,
      });

      api.instance.defaults.adapter = createErrorAdapter(
        404,
        {
          message: "User not found",
        },
        "Not Found",
      );

      try {
        await api.get("/users/999");

        throw new Error("La petición debería haber fallado");
      } catch (error) {
        expect(error).toMatchObject({
          name: "AppError",
          code: "NOT_FOUND",
        });
      }

      expect(onError).toHaveBeenCalledTimes(1);

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "AppError",
          code: "NOT_FOUND",
        }),
      );
    });

    it("ejecuta onUnauthorized ante HTTP 401", async () => {
      const onUnauthorized = vi.fn();

      const api = createApiClient({
        onUnauthorized,
      });

      api.instance.defaults.adapter = createErrorAdapter(
        401,
        {
          message: "Unauthorized",
        },
        "Unauthorized",
      );

      try {
        await api.get("/users");

        throw new Error("La petición debería haber fallado");
      } catch (error) {
        expect(error).toMatchObject({
          name: "AppError",
          code: "UNAUTHORIZED",
        });
      }

      expect(onUnauthorized).toHaveBeenCalledTimes(1);

      expect(onUnauthorized).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "AppError",
          code: "UNAUTHORIZED",
        }),
      );
    });
  });
});
