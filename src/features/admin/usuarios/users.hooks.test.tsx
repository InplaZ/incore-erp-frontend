import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usersApi } from "./users.api";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUser,
  useUsers,
} from "./users.hooks";

const mockUser = {
  id: 1,
  username: "juan",
  email: "juan@example.com",
  first_name: "Juan",
  last_name: "Pérez",
  is_active: true,
  last_login: null,
  date_joined: "2026-01-01T10:00:00Z",
};

const mockListResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [mockUser],
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("users hooks", () => {
  it("obtiene la lista de usuarios", async () => {
    vi.spyOn(usersApi, "list").mockResolvedValue(mockListResponse);

    const { result } = renderHook(
      () =>
        useUsers({
          search: "juan",
          page: 1,
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockListResponse);
    expect(usersApi.list).toHaveBeenCalledWith({
      search: "juan",
      page: 1,
    });
  });

  it("obtiene un usuario por id", async () => {
    vi.spyOn(usersApi, "getOne").mockResolvedValue(mockUser);

    const { result } = renderHook(() => useUser(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUser);
    expect(usersApi.getOne).toHaveBeenCalledWith(1);
  });

  it("crea un usuario", async () => {
    vi.spyOn(usersApi, "create").mockResolvedValue(mockUser);

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: createWrapper(),
    });

    const createdUser = await result.current.mutateAsync({
      username: "juan",
      email: "juan@example.com",
      password: "Password123!",
      first_name: "Juan",
      last_name: "Pérez",
    });

    expect(usersApi.create).toHaveBeenCalledWith({
      username: "juan",
      email: "juan@example.com",
      password: "Password123!",
      first_name: "Juan",
      last_name: "Pérez",
    });

    expect(createdUser).toEqual(mockUser);
  });

  it("actualiza un usuario", async () => {
    const updatedUser = {
      ...mockUser,
      first_name: "Juan Carlos",
    };

    vi.spyOn(usersApi, "update").mockResolvedValue(updatedUser);

    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: createWrapper(),
    });

    const returnedUser = await result.current.mutateAsync({
      id: 1,
      data: {
        first_name: "Juan Carlos",
      },
    });

    expect(usersApi.update).toHaveBeenCalledWith(1, {
      first_name: "Juan Carlos",
    });

    expect(returnedUser).toEqual(updatedUser);
  });

  it("elimina un usuario", async () => {
    vi.spyOn(usersApi, "delete").mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync(1);

    expect(usersApi.delete).toHaveBeenCalledWith(1);
  });
});
