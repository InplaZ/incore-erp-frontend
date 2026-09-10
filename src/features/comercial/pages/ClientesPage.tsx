import {
  ChevronDown,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";

const clients = [
  {
    initials: "PA",
    name: "Plásticos Andinos",
    nit: "1029384756",
    contact: "Carlos Mendoza",
    phone: "+591 71234567",
    type: "En seguimiento",
    value: "$42.8M",
  },
  {
    initials: "MP",
    name: "Manufacturas del Pacífico",
    nit: "2038475619",
    contact: "Laura Fernández",
    phone: "+591 76543210",
    type: "Activo",
    value: "$36.4M",
  },
  {
    initials: "IC",
    name: "Industrias Carvajal",
    nit: "3049582716",
    contact: "Miguel Torres",
    phone: "+591 72123456",
    type: "Activo",
    value: "$28.7M",
  },
  {
    initials: "EN",
    name: "Empaques del Norte",
    nit: "4058673921",
    contact: "Andrea Rojas",
    phone: "+591 78901234",
    type: "Activo",
    value: "$24.5M",
  },
  {
    initials: "DC",
    name: "Distribuciones Central",
    nit: "5069783412",
    contact: "Daniel Castro",
    phone: "+591 73456789",
    type: "En seguimiento",
    value: "$18.2M",
  },
];

export default function ClientesPage() {
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

        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nuevo cliente
        </button>
      </div>

      {/* Resumen */}
      <div className="grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-3">
        <SummaryItem
          label="Clientes activos"
          value="48"
          detail="+6 este mes"
        />

        <SummaryItem
          label="Prospectos"
          value="14"
          detail="3 nuevos"
        />

        <SummaryItem
          label="Valor en cartera"
          value="$186.4M"
          detail="+12.8% vs. anterior"
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
              placeholder="Buscar por nombre, NIT o contacto..."
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Filter className="h-4 w-4" />
              Filtros
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                2
              </span>
            </button>

            <button className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
              Todos los clientes
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <div className="min-w-[850px]">
            {/* Cabecera */}
            <div className="grid grid-cols-[2fr_1.5fr_1.2fr_1.2fr_40px] gap-4 border-b border-border bg-secondary/30 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Cliente</span>
              <span>Contacto principal</span>
              <span>Estado</span>
              <span>Valor en cartera</span>
              <span />
            </div>

            {/* Filas */}
            {clients.map((client) => (
              <button
                key={client.nit}
                className="grid w-full grid-cols-[2fr_1.5fr_1.2fr_1.2fr_40px] items-center gap-4 border-b border-border px-5 py-4 text-left last:border-b-0 hover:bg-secondary/40"
              >
                {/* Cliente */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {client.initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {client.name}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      NIT {client.nit}
                    </p>
                  </div>
                </div>

                {/* Contacto */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {client.contact}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {client.phone}
                  </p>
                </div>

                {/* Estado */}
                <span
                  className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    client.type === "En seguimiento"
                      ? "bg-primary/10 text-primary"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {client.type}
                </span>

                {/* Valor */}
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {client.value}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Últimos 12 meses
                  </p>
                </div>

                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <span className="text-xs text-muted-foreground">
            Mostrando 5 de 48 clientes
          </span>

          <div className="flex gap-1">
            <button className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary">
              Anterior
            </button>

            <button className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary">
              Siguiente
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

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