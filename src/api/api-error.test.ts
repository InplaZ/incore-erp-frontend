import { describe, expect, it } from "vitest";

import { normalizeApiError, type ApiErrorContext } from "./api-error";

describe("normalizeApiError", () => {
  it("convierte un error de red en NETWORK_ERROR", () => {
    const originalError = new Error("Network unavailable");

    const error = normalizeApiError(originalError);

    expect(error.code).toBe("NETWORK_ERROR");
    expect(error.message).toBe("Network unavailable");
    expect(error.cause).toBe(originalError);
  });

  it("convierte HTTP 401 en UNAUTHORIZED", () => {
    const originalError = new Error("Unauthorized");

    const context: ApiErrorContext = {
      status: 401,
    };

    const error = normalizeApiError(originalError, context);

    expect(error.code).toBe("UNAUTHORIZED");
    expect(error.cause).toBe(originalError);
  });

  it("convierte HTTP 403 en FORBIDDEN", () => {
    const originalError = new Error("Forbidden");

    const error = normalizeApiError(originalError, {
      status: 403,
    });

    expect(error.code).toBe("FORBIDDEN");
  });

  it("convierte HTTP 404 en NOT_FOUND", () => {
    const originalError = new Error("Not found");

    const error = normalizeApiError(originalError, {
      status: 404,
    });

    expect(error.code).toBe("NOT_FOUND");
  });

  it("convierte errores de validación configurados por la aplicación", () => {
    const originalError = new Error("Invalid data");

    const error = normalizeApiError(originalError, {
      status: 422,
    });

    expect(error.code).toBe("VALIDATION_ERROR");
  });

  it("convierte errores HTTP 5xx en SERVER_ERROR", () => {
    const originalError = new Error("Internal server error");

    const error = normalizeApiError(originalError, {
      status: 500,
    });

    expect(error.code).toBe("SERVER_ERROR");
  });

  it("convierte cualquier estado HTTP 5xx en SERVER_ERROR", () => {
    const originalError = new Error("Service unavailable");

    const error = normalizeApiError(originalError, {
      status: 503,
    });

    expect(error.code).toBe("SERVER_ERROR");
  });

  it("convierte un error desconocido en UNKNOWN_ERROR", () => {
    const originalError = {
      unexpected: true,
    };

    const error = normalizeApiError(originalError);

    expect(error.code).toBe("UNKNOWN_ERROR");
    expect(error.cause).toBe(originalError);
  });

  it("conserva los detalles proporcionados por la capa API", () => {
    const originalError = new Error("Validation failed");

    const details = {
      fields: {
        email: "Invalid email",
      },
    };

    const error = normalizeApiError(originalError, {
      status: 422,
      details,
    });

    expect(error.details).toEqual(details);
  });

  it("permite proporcionar un mensaje normalizado", () => {
    const originalError = new Error("Internal error");

    const error = normalizeApiError(originalError, {
      status: 500,
      message: "No fue posible completar la operación.",
    });

    expect(error.message).toBe("No fue posible completar la operación.");
  });

  it("no reemplaza un AppError ya normalizado", async () => {
    const { AppError } = await import("../app/errors/app-error");

    const originalError = new AppError("FORBIDDEN", "Acceso denegado");

    const error = normalizeApiError(originalError);

    expect(error).toBe(originalError);
  });
});
