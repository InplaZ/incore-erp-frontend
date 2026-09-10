import { useMemo, useState } from "react";
import {
  ChevronDown,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";

import { useCuentasComerciales } from "../comercial.hooks";
import type {
  CuentaComercial,
  EstadoCuenta,
} from "../comercial.types";

import NuevoClienteModal from "../components/NuevoClienteModal";

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<EstadoCuenta | "todos">("todos");

  const { data, isLoading, isError, error } =
    useCuentasComerciales({
      search: search || undefined,
      estado: estado !== "todos" ? estado : undefined,
    });

  const clients = data ?? [];

  const summary = useMemo(() => {
    const activos = clients.filter(
      (client) => client.estado === "cliente",
    ).length;

    const prospectos = clients.filter(
      (client) => client.estado === "prospecto",
    ).length;

    return {
      activos,
      prospectos,
    };
  }, [clients]);

  const [showNewClient, setShowNewClient] = useState(false);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            RELACIÓN COMERCIAL
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-foreground">
            Clientes
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona tus relaciones y encuentra toda la historia comercial.
          </p>
        </div>

        <button
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          type="button"
          onClick={() => setShowNewClient(true)}
        >
          <Plus className="h-4 w-4" />
          Nuevo cliente
        </button>
      </div>

      {/* Resumen */}
      <div className="grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-3">
        <SummaryItem
          label="Clientes activos"
          value={String(summary.activos)}
          detail="Registros cargados"
        />

        <SummaryItem
          label="Prospectos"
          value={String(summary.prospectos)}
          detail="Registros cargados"
        />

        <SummaryItem
          label="Total de cuentas"
          value={String(data?.length ?? 0)}
          detail="Según API"
        />
      </div>

      {/* Tabla */}
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center">
          <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-border px-3 md:max-w-md">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, NIT o contacto..."
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Filter className="h-4 w-4" />
              Filtros
            </button>

            <div className="relative">
              <select
                value={estado}
                onChange={(event) =>
                  setEstado(
                    event.target.value as EstadoCuenta | "todos",
                  )
                }
                className="appearance-none rounded-md border border-border bg-background py-2 pl-3 pr-9 text-sm font-medium text-foreground outline-none"
              >
                <option value="todos">
                  Todos los clientes
                </option>

                <option value="cliente">
                  Clientes activos
                </option>

                <option value="prospecto">
                  Prospectos
                </option>

                <option value="inactivo">
                  Inactivos
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Estados */}
        {isLoading && (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            Cargando clientes...
          </div>
        )}

        {isError && (
          <div className="px-5 py-10 text-center text-sm text-destructive">
            No se pudieron cargar los clientes.
            {error instanceof Error && (
              <span className="block mt-1">
                {error.message}
              </span>
            )}
          </div>
        )}

        {/* Tabla */}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <div className="min-w-[850px]">
              {/* Cabecera */}
              <div className="grid grid-cols-[2fr_1.5fr_1.2fr_1.2fr_40px] gap-4 border-b border-border bg-secondary/30 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Cliente</span>
                <span>Contacto principal</span>
                <span>Estado</span>
                <span>Identificación</span>
                <span />
              </div>

              {/* Filas */}
              {clients.map((client) => (
                <ClientRow
                  key={client.id}
                  client={client}
                />
              ))}

              {clients.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No se encontraron clientes.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        {!isLoading && !isError && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <span className="text-xs text-muted-foreground">
              Mostrando {clients.length} de {clients.length} cuentas
            </span>

            <div className="flex gap-1">
              <button
                disabled
                className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>

              <button
                disabled
                className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </section>
      {showNewClient && (
        <NuevoClienteModal
          onClose={() => setShowNewClient(false)}
          onSuccess={() => setShowNewClient(false)}
        />
      )}
    </div>
  );
}


// ============================================================
// FILA DE CLIENTE
// ============================================================

function ClientRow({
  client,
}: {
  client: CuentaComercial;
}) {
  const displayName = getClientName(client);
  const initials = getInitials(displayName);

  return (
    <button
      type="button"
      className="grid w-full grid-cols-[2fr_1.5fr_1.2fr_1.2fr_40px] items-center gap-4 border-b border-border px-5 py-4 text-left last:border-b-0 hover:bg-secondary/40"
    >
      {/* Cliente */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {initials}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {displayName}
          </p>

          <p className="truncate text-xs text-muted-foreground">
            {client.documento_identidad?.toUpperCase() ?? "ID"}{" "}
            {client.identificacion}
          </p>
        </div>
      </div>

      {/* Contacto */}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {client.correo || "Sin correo"}
        </p>

        <p className="truncate text-xs text-muted-foreground">
          {client.telefono || "Sin teléfono"}
        </p>
      </div>

      {/* Estado */}
      <span
        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${client.estado === "prospecto"
          ? "bg-primary/10 text-primary"
          : client.estado === "cliente"
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-secondary text-muted-foreground"
          }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />

        {getEstadoLabel(client.estado)}
      </span>

      {/* Identificación */}
      <div>
        <p className="text-sm font-semibold text-foreground">
          {client.identificacion}
        </p>

        <p className="text-xs text-muted-foreground">
          {client.documento_identidad?.toUpperCase() ?? "Documento"}
        </p>
      </div>

      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}


// ============================================================
// HELPERS
// ============================================================

function getClientName(client: CuentaComercial): string {
  if (client.tipo_persona === "juridica") {
    return client.razon_social || "Sin razón social";
  }

  return [
    client.nombres,
    client.apellido_paterno,
    client.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ") || "Sin nombre";
}

function getInitials(name: string): string {
  const words = name
    .split(" ")
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (
    words[0][0] + words[1][0]
  ).toUpperCase();
}

function getEstadoLabel(
  estado: EstadoCuenta,
): string {
  switch (estado) {
    case "cliente":
      return "Activo";

    case "prospecto":
      return "Prospecto";

    case "inactivo":
      return "Inactivo";

    default:
      return estado;
  }
}


// ============================================================
// SUMMARY
// ============================================================

function SummaryItem({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border-b border-border p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <span className="block text-xs text-muted-foreground">
        {label}
      </span>

      <div className="mt-1 flex items-baseline gap-2">
        <strong className="text-2xl font-semibold text-foreground">
          {value}
        </strong>

        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {detail}
        </span>
      </div>
    </div>
  );
}