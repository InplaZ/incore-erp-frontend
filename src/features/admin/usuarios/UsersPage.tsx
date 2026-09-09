import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCreateUser } from "./users.hooks";

export default function UserCreatePage() {
  const navigate = useNavigate();
  const createUser = useCreateUser();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    is_active: true,
  });

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await createUser.mutateAsync(form);

    navigate("/users");
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Crear usuario</h1>

        <p className="mt-1 text-sm text-gray-500">
          Registra un nuevo usuario en el sistema.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-5 rounded-lg border p-6"
      >
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium">
            Usuario
          </label>

          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Contraseña
          </label>

          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="first_name"
              className="mb-1 block text-sm font-medium"
            >
              Nombre
            </label>

            <input
              id="first_name"
              name="first_name"
              type="text"
              value={form.first_name}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="last_name"
              className="mb-1 block text-sm font-medium"
            >
              Apellido
            </label>

            <input
              id="last_name"
              name="last_name"
              type="text"
              value={form.last_name}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            name="is_active"
            type="checkbox"
            checked={form.is_active}
            onChange={handleChange}
          />
          Usuario activo
        </label>

        {createUser.isError && (
          <p className="text-sm text-red-600">
            {createUser.error instanceof Error
              ? createUser.error.message
              : "No se pudo crear el usuario."}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={createUser.isPending}
            className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {createUser.isPending ? "Creando..." : "Crear usuario"}
          </button>
        </div>
      </form>
    </div>
  );
}
