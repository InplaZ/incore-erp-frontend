import { describe, expect, it } from "vitest";

import { AppError } from "./app-error";

describe("AppError", () => {
  it("representa un error de aplicación", () => {
    const error = new AppError("SERVER_ERROR", "Error del servidor");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe("AppError");
    expect(error.code).toBe("SERVER_ERROR");
    expect(error.message).toBe("Error del servidor");
  });

  it("permite conservar la causa original", () => {
    const originalError = new Error("Database connection failed");

    const error = new AppError(
      "SERVER_ERROR",
      "No se pudo completar la operación",
      {
        cause: originalError,
      },
    );

    expect(error.cause).toBe(originalError);
  });

  it("permite almacenar detalles adicionales", () => {
    const error = new AppError(
      "VALIDATION_ERROR",
      "Los datos enviados no son válidos",
      {
        details: {
          email: "Correo inválido",
          password: "La contraseña es demasiado corta",
        },
      },
    );

    expect(error.details).toEqual({
      email: "Correo inválido",
      password: "La contraseña es demasiado corta",
    });
  });

  it("permite crear errores sin detalles adicionales", () => {
    const error = new AppError("NOT_FOUND", "Recurso no encontrado");

    expect(error.details).toBeUndefined();
    expect(error.cause).toBeUndefined();
  });

  it("mantiene códigos de error tipados", () => {
    const codes = [
      "NETWORK_ERROR",
      "UNAUTHORIZED",
      "FORBIDDEN",
      "NOT_FOUND",
      "VALIDATION_ERROR",
      "SERVER_ERROR",
      "UNKNOWN_ERROR",
    ] as const;

    for (const code of codes) {
      const error = new AppError(code, `Error ${code}`);

      expect(error.code).toBe(code);
    }
  });
});
