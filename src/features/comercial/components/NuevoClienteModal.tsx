import { useState } from "react";
import { X } from "lucide-react";

import {
  useCreateCuentaComercial,
  useUpdateCuentaComercial,
} from "../comercial.hooks";

import type {
  CuentaComercial,
  CuentaComercialCreate,
  CuentaComercialUpdate,
} from "../comercial.types";

interface NuevoClienteModalProps {
  onClose: () => void;
  onSuccess: () => void;
  client?: CuentaComercial;
}

export default function NuevoClienteModal({
  onClose,
  onSuccess,
  client,
}: NuevoClienteModalProps) {
  const createCuenta = useCreateCuentaComercial();
  const updateCuenta = useUpdateCuentaComercial();

  const isEditing = !!client;

  const [form, setForm] = useState<CuentaComercialCreate>({
    nombres: client?.nombres ?? "",
    apellido_paterno: client?.apellido_paterno ?? "",
    apellido_materno: client?.apellido_materno ?? "",
    tipo_persona: client?.tipo_persona ?? "natural",
    razon_social: client?.razon_social ?? "",
    documento_identidad: client?.documento_identidad ?? "ci",
    numero_documento: client?.numero_documento ?? "",
    telefono: client?.telefono ?? "",
    correo: client?.correo ?? "",
    direccion: client?.direccion ?? "",
    estado: client?.estado ?? "prospecto",
    tipo_relacion: client?.tipo_relacion ?? "cliente",
    fecha_alta: client?.fecha_alta ?? new Date().toISOString(),
  });

  const isPending =
    createCuenta.isPending || updateCuenta.isPending;

  const handleChange = (
    field: keyof CuentaComercialCreate,
    value: string | number,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      if (isEditing && client) {
        const updateData: CuentaComercialUpdate = {
          ...form,
        };

        await updateCuenta.mutateAsync({
          id: client.id,
          data: updateData,
        });
      } else {
        await createCuenta.mutateAsync(form);
      }

      onSuccess();
    } catch (error) {
      console.error(
        isEditing
          ? "Error al actualizar cliente:"
          : "Error al crear cliente:",
        error,
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEditing ? "Editar cliente" : "Nuevo cliente"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {isEditing
                ? "Modifica los datos del cliente."
                : "Registra una nueva cuenta comercial."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {/* Tipo de persona */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Tipo de persona
                </label>

                <select
                  value={form.tipo_persona}
                  onChange={(e) =>
                    handleChange("tipo_persona", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="natural">Natural</option>
                  <option value="juridica">Jurídica</option>
                </select>
              </div>

              {/* Documento */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Tipo de documento
                </label>

                <select
                  value={form.documento_identidad ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "documento_identidad",
                      e.target.value,
                    )
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="ci">CI</option>
                  <option value="nit">NIT</option>
                </select>
              </div>

              {/* Número de documento */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Número de documento *
                </label>

                <input
                  type="text"
                  required
                  value={form.numero_documento ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "numero_documento",
                      e.target.value,
                    )
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  placeholder={
                    form.documento_identidad === "nit"
                      ? "Ingrese el NIT"
                      : "Ingrese el CI"
                  }
                />
              </div>

              {/* Nombres */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Nombres
                </label>

                <input
                  value={form.nombres ?? ""}
                  onChange={(e) =>
                    handleChange("nombres", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Apellido paterno */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Apellido paterno
                </label>

                <input
                  value={form.apellido_paterno ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "apellido_paterno",
                      e.target.value,
                    )
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Apellido materno */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Apellido materno
                </label>

                <input
                  value={form.apellido_materno ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "apellido_materno",
                      e.target.value,
                    )
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Razón social */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  Razón social
                </label>

                <input
                  value={form.razon_social ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "razon_social",
                      e.target.value,
                    )
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Teléfono
                </label>

                <input
                  value={form.telefono ?? ""}
                  onChange={(e) =>
                    handleChange("telefono", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Correo */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Correo electrónico
                </label>

                <input
                  type="email"
                  value={form.correo ?? ""}
                  onChange={(e) =>
                    handleChange("correo", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Dirección */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  Dirección
                </label>

                <input
                  value={form.direccion ?? ""}
                  onChange={(e) =>
                    handleChange("direccion", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Estado
                </label>

                <select
                  value={form.estado}
                  onChange={(e) =>
                    handleChange("estado", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="prospecto">Prospecto</option>
                  <option value="cliente">Cliente</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              {/* Tipo relación */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Tipo de relación
                </label>

                <select
                  value={form.tipo_relacion ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "tipo_relacion",
                      e.target.value,
                    )
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="cliente">Cliente</option>
                  <option value="proveedor">Proveedor</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>
            </div>

            {/* Error */}
            {(createCuenta.isError || updateCuenta.isError) && (
              <p className="mt-4 text-sm text-destructive">
                {isEditing
                  ? "No se pudo actualizar el cliente. Verifica los datos e inténtalo nuevamente."
                  : "No se pudo crear el cliente. Verifica los datos e inténtalo nuevamente."}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}