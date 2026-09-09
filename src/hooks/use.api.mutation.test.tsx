import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { useApiMutation } from "./use.api.mutation";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
    },
  });
}

function createWrapper() {
  const queryClient = createTestQueryClient();

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useApiMutation", () => {
  it("ejecuta la mutación y devuelve los datos", async () => {
    const mutationFn = async (name: string) => {
      return {
        id: 1,
        name,
      };
    };

    const { result } = renderHook(
      () =>
        useApiMutation({
          mutationFn,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    result.current.mutate("Usuario de prueba");

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      id: 1,
      name: "Usuario de prueba",
    });
  });

  it("expone el estado de error", async () => {
    const error = new Error("Error de prueba");

    const mutationFn = async () => {
      throw error;
    };

    const { result } = renderHook(
      () =>
        useApiMutation({
          mutationFn,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });

  it("permite ejecutar la mutación con variables", async () => {
    const mutationFn = async (id: number) => {
      return {
        id,
        deleted: true,
      };
    };

    const { result } = renderHook(
      () =>
        useApiMutation({
          mutationFn,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    result.current.mutate(25);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      id: 25,
      deleted: true,
    });
  });
});
