import { useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Package,
  Search,
  Truck,
  AlertCircle,
} from "lucide-react";

type ProductionStatus =
  | "pendiente"
  | "produccion"
  | "listo"
  | "enviado";

interface ProductionOrder {
  id: string;
  client: string;
  product: string;
  quantity: string;
  deliveryDate: string;
  status: ProductionStatus;
}

const productionOrders: ProductionOrder[] = [
  {
    id: "REQ-001",
    client: "Industrias Andinas",
    product: "Bolsas",
    quantity: "5.000 unidades",
    deliveryDate: "12 Sep 2026",
    status: "produccion",
  },
  {
    id: "REQ-002",
    client: "Comercial Norte",
    product: "Rollos",
    quantity: "1.200 kg",
    deliveryDate: "13 Sep 2026",
    status: "pendiente",
  },
  {
    id: "REQ-003",
    client: "Distribuidora Central",
    product: "Bolsas",
    quantity: "8.000 unidades",
    deliveryDate: "10 Sep 2026",
    status: "listo",
  },
  {
    id: "REQ-004",
    client: "Alimentos del Sur",
    product: "Rollos",
    quantity: "950 kg",
    deliveryDate: "09 Sep 2026",
    status: "enviado",
  },
];

const statusConfig: Record<
  ProductionStatus,
  {
    label: string;
    className: string;
    icon: typeof Clock3;
  }
> = {
  pendiente: {
    label: "Pendiente",
    className: "bg-secondary text-muted-foreground",
    icon: Clock3,
  },
  produccion: {
    label: "En producción",
    className: "bg-primary/10 text-primary",
    icon: Package,
  },
  listo: {
    label: "Listo para envío",
    className: "bg-green-500/10 text-green-600",
    icon: CheckCircle2,
  },
  enviado: {
    label: "Enviado",
    className: "bg-blue-500/10 text-blue-600",
    icon: Truck,
  },
};

function StatusBadge({ status }: { status: ProductionStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Package;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

export default function ProduccionPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    ProductionStatus | "todos"
  >("todos");

  const filteredOrders = productionOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.client.toLowerCase().includes(search.toLowerCase()) ||
      order.product.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "todos" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Producción y envíos
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Seguimiento de los requerimientos desde producción hasta la
          entrega.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Pendientes"
          value="8"
          icon={Clock3}
        />

        <MetricCard
          label="En producción"
          value="5"
          icon={Package}
        />

        <MetricCard
          label="Listos para envío"
          value="3"
          icon={CheckCircle2}
        />

        <MetricCard
          label="Enviados"
          value="12"
          icon={Truck}
        />
      </div>

      {/* Alert */}
      <div className="flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />

        <div>
          <p className="text-sm font-medium">
            Entregas próximas
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Hay requerimientos con fechas de entrega próximas que
            necesitan seguimiento.
          </p>
        </div>
      </div>

      {/* Main panel */}
      <div className="rounded-xl border border-border bg-card">
        {/* Panel header */}
        <div className="border-b border-border p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-semibold">
                Seguimiento de producción
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Consulta el estado de cada requerimiento.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar..."
                  className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 sm:w-56"
                />
              </div>

              {/* Filter */}
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as ProductionStatus | "todos",
                  )
                }
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="produccion">En producción</option>
                <option value="listo">Listo para envío</option>
                <option value="enviado">Enviado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Requerimiento
                </th>

                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Cliente
                </th>

                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Producto
                </th>

                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Cantidad
                </th>

                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Entrega
                </th>

                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Estado
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/20"
                >
                  <td className="px-5 py-4">
                    <span className="font-medium">
                      {order.id}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm">
                    {order.client}
                  </td>

                  <td className="px-5 py-4 text-sm">
                    {order.product}
                  </td>

                  <td className="px-5 py-4 text-sm">
                    {order.quantity}
                  </td>

                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {order.deliveryDate}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center"
                  >
                    <Package className="mx-auto h-8 w-8 text-muted-foreground" />

                    <p className="mt-3 text-sm font-medium">
                      No se encontraron requerimientos
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Prueba con otro término de búsqueda o filtro.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <p className="text-sm text-muted-foreground">
            Mostrando{" "}
            <span className="font-medium text-foreground">
              {filteredOrders.length}
            </span>{" "}
            requerimientos
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-secondary"
            >
              Anterior
            </button>

            <button
              type="button"
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-secondary"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}