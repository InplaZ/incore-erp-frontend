import { describe, expect, it, vi } from "vitest";

import { createCrudOperations } from "./api-crud";
import type { ApiClient } from "./api.types";

interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUser {
  name: string;
  email: string;
}

interface UpdateUser {
  name?: string;
  email?: string;
}

const createMockApi = (): ApiClient => {
  return {
    instance: {} as ApiClient["instance"],

    request: vi.fn(),

    requestResponse: vi.fn(),

    get: vi.fn().mockResolvedValue([]),

    post: vi.fn().mockResolvedValue({}),

    put: vi.fn().mockResolvedValue({}),

    patch: vi.fn().mockResolvedValue({}),

    delete: vi.fn().mockResolvedValue(undefined),
  };
};

describe("createCrudOperations", () => {
  describe("URL construction", () => {
    it("construye correctamente las URLs sin slash final", async () => {
      const api = createMockApi();

      const crud = createCrudOperations<User>(api, "/users/");

      await crud.list();
      await crud.getOne(123);

      expect(api.get).toHaveBeenNthCalledWith(1, "/users", {
        params: undefined,
      });

      expect(api.get).toHaveBeenNthCalledWith(2, "/users/123");
    });

    it("construye correctamente las URLs con trailingSlash", async () => {
      const api = createMockApi();

      const crud = createCrudOperations<User>(api, "/users/", {
        trailingSlash: true,
      });

      await crud.list();
      await crud.getOne(123);

      expect(api.get).toHaveBeenNthCalledWith(1, "/users/", {
        params: undefined,
      });

      expect(api.get).toHaveBeenNthCalledWith(2, "/users/123/");
    });

    it("acepta IDs numéricos y string", async () => {
      const api = createMockApi();

      const crud = createCrudOperations<User>(api, "users");

      await crud.getOne(123);
      await crud.getOne("abc");

      expect(api.get).toHaveBeenNthCalledWith(1, "/users/123");

      expect(api.get).toHaveBeenNthCalledWith(2, "/users/abc");
    });

    it("codifica correctamente IDs especiales", async () => {
      const api = createMockApi();

      const crud = createCrudOperations<User>(api, "users");

      await crud.getOne("john/doe");

      expect(api.get).toHaveBeenCalledWith("/users/john%2Fdoe");
    });
  });

  describe("list", () => {
    it("obtiene la colección", async () => {
      const api = createMockApi();

      const users: User[] = [
        {
          id: 1,
          name: "Juan",
          email: "juan@example.com",
        },
      ];

      vi.mocked(api.get).mockResolvedValueOnce(users);

      const crud = createCrudOperations<User>(api, "users");

      const result = await crud.list();

      expect(result).toEqual(users);

      expect(api.get).toHaveBeenCalledWith("/users", {
        params: undefined,
      });
    });

    it("envía los parámetros de consulta", async () => {
      const api = createMockApi();

      const crud = createCrudOperations<User>(api, "users");

      const params = {
        page: 2,
        search: "juan",
        active: true,
      };

      await crud.list(params);

      expect(api.get).toHaveBeenCalledWith("/users", {
        params,
      });
    });
  });

  describe("getOne", () => {
    it("obtiene una entidad por ID", async () => {
      const api = createMockApi();

      const user: User = {
        id: 1,
        name: "Juan",
        email: "juan@example.com",
      };

      vi.mocked(api.get).mockResolvedValueOnce(user);

      const crud = createCrudOperations<User>(api, "users");

      const result = await crud.getOne(1);

      expect(result).toEqual(user);

      expect(api.get).toHaveBeenCalledWith("/users/1");
    });
  });

  describe("create", () => {
    it("crea una entidad", async () => {
      const api = createMockApi();

      const createdUser: User = {
        id: 1,
        name: "Juan",
        email: "juan@example.com",
      };

      vi.mocked(api.post).mockResolvedValueOnce(createdUser);

      const crud = createCrudOperations<User, CreateUser>(api, "users");

      const data: CreateUser = {
        name: "Juan",
        email: "juan@example.com",
      };

      const result = await crud.create(data);

      expect(result).toEqual(createdUser);

      expect(api.post).toHaveBeenCalledWith("/users", data);
    });
  });

  describe("update", () => {
    it("actualiza usando PATCH por defecto", async () => {
      const api = createMockApi();

      const crud = createCrudOperations<User, CreateUser, UpdateUser>(
        api,
        "users",
      );

      const data: UpdateUser = {
        name: "Juan actualizado",
      };

      await crud.update(1, data);

      expect(api.patch).toHaveBeenCalledWith("/users/1", data);

      expect(api.put).not.toHaveBeenCalled();
    });

    it("permite actualizar usando PUT", async () => {
      const api = createMockApi();

      const crud = createCrudOperations<User, CreateUser, UpdateUser>(
        api,
        "users",
        {
          updateMethod: "PUT",
        },
      );

      const data: UpdateUser = {
        name: "Juan actualizado",
        email: "nuevo@example.com",
      };

      await crud.update(1, data);

      expect(api.put).toHaveBeenCalledWith("/users/1", data);

      expect(api.patch).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("elimina una entidad", async () => {
      const api = createMockApi();

      const crud = createCrudOperations<User>(api, "users");

      await crud.delete(1);

      expect(api.delete).toHaveBeenCalledWith("/users/1");
    });
  });

  describe("generic responses", () => {
    it("permite utilizar una respuesta de lista personalizada", async () => {
      const api = createMockApi();

      interface UserListResponse {
        results: User[];
        count: number;
      }

      const response: UserListResponse = {
        results: [],
        count: 0,
      };

      vi.mocked(api.get).mockResolvedValueOnce(response);

      const crud = createCrudOperations<
        User,
        CreateUser,
        UpdateUser,
        UserListResponse
      >(api, "users");

      const result = await crud.list();

      expect(result).toEqual(response);
      expect(result.results).toEqual([]);
      expect(result.count).toBe(0);
    });

    it("permite utilizar una respuesta personalizada para DELETE", async () => {
      const api = createMockApi();

      interface DeleteResponse {
        success: boolean;
      }

      const response: DeleteResponse = {
        success: true,
      };

      vi.mocked(api.delete).mockResolvedValueOnce(response);

      const crud = createCrudOperations<
        User,
        CreateUser,
        UpdateUser,
        User[],
        Record<string, string | number | boolean | null | undefined>,
        DeleteResponse
      >(api, "users");

      const result = await crud.delete(1);

      expect(result).toEqual(response);

      expect(api.delete).toHaveBeenCalledWith("/users/1");
    });
  });

  it("rechaza un recurso vacío", () => {
    const api = createMockApi();

    expect(() => {
      createCrudOperations<User>(api, "");
    }).toThrow("El recurso CRUD no puede estar vacío.");
  });

  it("normaliza múltiples slashes alrededor del recurso", async () => {
    const api = createMockApi();

    const crud = createCrudOperations<User>(api, "///users///");

    await crud.list();
    await crud.getOne(123);

    expect(api.get).toHaveBeenNthCalledWith(1, "/users", {
      params: undefined,
    });

    expect(api.get).toHaveBeenNthCalledWith(2, "/users/123");
  });
});
