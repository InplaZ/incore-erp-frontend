import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Eye,
  RefreshCw,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/States";
import { useAuthStore } from "@/app/store/auth.store";
import type { PedidoHabilitadoConDetalles } from "@/features/produccion/ordenes-trabajo-api";
import { usePedidosHabilitadosParaOT } from "./ordenes-trabajo.hooks";
import OrdenTrabajoFormulario from "./OrdenTrabajoFormulario";
import type {
  PedidoDetalleVista,
  SnapshotValor,
} from "@/features/comercial/comercial.types";

type PedidoProducto = {
  pedido: PedidoHabilitadoConDetalles;
  line: PedidoDetalleVista;
};

type PedidoAgrupado = {
  pedido: PedidoHabilitadoConDetalles;
  productos: PedidoDetalleVista[];
};

function productName(line: PedidoDetalleVista) {
  return (
    line.producto_version?.nombre ||
    line.especificacion_snapshot?.nombre ||
    line.especificacion_snapshot?.descripcion ||
    line.especificacion_producto_solicitado_version?.categoria ||
    `Producto del pedido · detalle #${line.id}`
  );
}

function productCode(line: PedidoDetalleVista) {
  return (
    line.producto_version?.codigo ||
    line.especificacion_snapshot?.codigo ||
    `Detalle #${line.id}`
  );
}

function readable(value: SnapshotValor | undefined) {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "object") {
    return Array.isArray(value)
      ? value.join(", ")
      : Object.entries(value)
        .map(([key, item]) => `${key}: ${String(item)}`)
        .join(" · ");
  }
  return String(value);
}

function technicalSummary(line: PedidoDetalleVista) {
  const product = line.producto_version;
  const requested = line.especificacion_producto_solicitado_version;
  const snapshot = line.especificacion_snapshot?.version;
  const entries: Array<[string, SnapshotValor | undefined]> = [
    ["Material", product?.material ?? requested?.material ?? snapshot?.material],
    ["Micraje", product?.micraje ?? requested?.micraje ?? snapshot?.micraje],
    ["Capas", product?.capas ?? requested?.capas ?? snapshot?.capas],
    ["Impresión", product?.impresion ?? requested?.impresion ?? snapshot?.impresion],
  ];

  return entries.filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}

function groupByPedido(items: PedidoProducto[]): PedidoAgrupado[] {
  const groups = new Map<number, PedidoAgrupado>();

  items.forEach(({ pedido, line }) => {
    const pedidoId = pedido.pedido.id;
    const current = groups.get(pedidoId);

    if (current) {
      current.productos.push(line);
    } else {
      groups.set(pedidoId, { pedido, productos: [line] });
    }
  });

  return Array.from(groups.values());
}

export default function OrdenesTrabajoPage() {
  const roles = useAuthStore((state) => state.roles);
  const canManage = roles.some((role) => role.name === "Jefe de Producción");
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePedidosHabilitadosParaOT();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PedidoProducto | null>(null);
  const pending = useMemo(
    () =>
      orders.flatMap((item) =>
        item.detalle.detalles
          .filter((line) => !line.es_historico && !line.produccion_asociada)
          .map((line) => ({ pedido: item, line })),
      ),
    [orders],
  );

  const completed = useMemo(
    () =>
      orders.flatMap((item) =>
        item.detalle.detalles
          .filter((line) => !line.es_historico && line.produccion_asociada)
          .map((line) => ({ pedido: item, line })),
      ),
    [orders],
  );

  const filteredPendingGroups = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = pending.filter(({ pedido, line }) =>
      !term ||
      [
        pedido.pedido.numero,
        pedido.pedido.cliente_nombre,
        pedido.pedido.cliente_alias,
        productName(line),
        productCode(line),
      ].some((value) => String(value ?? "").toLowerCase().includes(term)),
    );

    return groupByPedido(filtered);
  }, [pending, search]);

  const completedGroups = useMemo(
    () => groupByPedido(completed),
    [completed],
  );

  const closePreview = () => setSelected(null);

  const openPreview = (
    pedido: PedidoHabilitadoConDetalles,
    line: PedidoDetalleVista,
  ) => setSelected({ pedido, line });

  if (!canManage) {
    return (
      <main className="mx-auto w-full max-w-4xl p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto h-9 w-9 text-amber-600" />
          <h1 className="mt-3 text-xl font-semibold">Acceso restringido</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta pantalla está destinada al Jefe de Producción.
          </p>
        </Card>
      </main>
    );
  }

  if (isLoading) {
    return <LoadingState message="Cargando pedidos habilitados para producción…" />;
  }

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-5 text-foreground">
      <PageHeader
        title="Órdenes de trabajo"
        subtitle="Revisa y ajusta los parámetros técnicos de cada producto antes de generar su PDF de fabricación."
        breadcrumb={[
          { label: "Producción" },
          { label: "Órdenes de trabajo" },
        ]}
        actions={
          <Button
            variant="outline"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        }
      />

      {isError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          No se pudieron cargar los pedidos habilitados. {errorText(error)}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Summary label="Pedidos consultados" value={orders.length} />
        <Summary label="Productos pendientes de OT" value={pending.length} />
        <Summary label="Productos con OT generada" value={completed.length} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Pedidos con productos pendientes</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Los productos de un mismo pedido se muestran agrupados. Cada OT se
              genera individualmente.
            </p>
          </div>
          <label className="flex h-10 items-center gap-2 rounded-md border border-border px-3 sm:w-80">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar pedido, cliente o producto"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
        </div>

        {filteredPendingGroups.length === 0 ? (
          <div className="p-10 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">No hay productos pendientes</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Los productos de pedidos confirmados aparecerán aquí mientras no
              tengan una OT generada.
            </p>
          </div>
        ) : (
          <div className="space-y-3 bg-muted/20 p-3 sm:p-4">
            {filteredPendingGroups.map(({ pedido, productos }) => (
              <section
                key={pedido.pedido.id}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-primary/[0.04] px-4 py-3">
                  <div className="min-w-0 border-l-4 border-primary pl-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold tracking-tight text-primary">
                        {pedido.pedido.numero}
                      </h3>

                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        {productos.length}{" "}
                        {productos.length === 1
                          ? "producto pendiente"
                          : "productos pendientes"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-medium text-foreground">
                      {pedido.pedido.cliente_nombre ||
                        pedido.pedido.cliente_alias ||
                        "Cliente no disponible"}
                    </p>
                  </div>

                  <span className="text-xs font-medium text-muted-foreground">
                    Pedido confirmado
                  </span>
                </header>

                <div className="divide-y divide-border">
                  {productos.map((line) => (
                    <article
                      key={line.id}
                      className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-semibold">
                            {productName(line)}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {productCode(line)}
                          </span>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                            Pendiente de OT
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Detalle #{line.id} · Cantidad:{" "}
                          <strong className="font-semibold text-foreground">
                            {line.cantidad} {line.unidad_comercial}
                          </strong>
                          {line.peso_kg ? ` · ${line.peso_kg} kg` : ""}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {technicalSummary(line).map(([label, value]) => (
                            <span key={label}>
                              {label}: {readable(value)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex shrink-0 sm:pl-3">
                        <Button
                          onClick={() => void openPreview(pedido, line)}
                          className="w-full sm:w-auto"
                        >
                          <Eye className="h-4 w-4" />
                          Revisar datos técnicos
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </Card>

      {completedGroups.length > 0 && (
        <Card className="overflow-hidden">
          <div className="border-b border-border p-4">
            <h2 className="font-semibold">Pedidos con OT generadas</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Se agrupan por pedido; cada producto conserva su propio estado.
            </p>
          </div>
          <div className="space-y-3 bg-muted/20 p-3 sm:p-4">
            {completedGroups.map(({ pedido, productos }) => (
              <section
                key={pedido.pedido.id}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3">
                  <div>
                    <h3 className="font-semibold">{pedido.pedido.numero}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {pedido.pedido.cliente_nombre ||
                        pedido.pedido.cliente_alias ||
                        "Cliente no disponible"}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                    {productos.length}{" "}
                    {productos.length === 1 ? "OT generada" : "OT generadas"}
                  </span>
                </header>
                <div className="divide-y divide-border">
                  {productos.map((line) => (
                    <div
                      key={line.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {productName(line)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {productCode(line)} · Detalle #{line.id} ·{" "}
                          {line.cantidad} {line.unidad_comercial}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        OT generada
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Card>
      )}

      {selected && (
        <OrdenTrabajoFormulario
          pedido={selected.pedido}
          line={selected.line}
          onClose={closePreview}
        />
      )}
    </main>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </Card>
  );
}
