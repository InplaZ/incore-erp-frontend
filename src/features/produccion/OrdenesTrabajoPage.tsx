import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  LoaderCircle,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/States";
import { useAuthStore } from "@/app/store/auth.store";
import {
  ordenesTrabajoApi,
  type PedidoHabilitadoConDetalles,
} from "@/features/produccion/ordenes-trabajo-api";
import {
  useCrearOTDesdePedido,
  usePedidosHabilitadosParaOT,
} from "./ordenes-trabajo.hooks";
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
  const createOT = useCrearOTDesdePedido();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PedidoProducto | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

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

  const closePreview = () => {
    setSelected(null);
    setPreviewError("");
    setObservaciones("");
    setConfirming(false);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  };

  const openPreview = async (
    pedido: PedidoHabilitadoConDetalles,
    line: PedidoDetalleVista,
  ) => {
    setSelected({ pedido, line });
    setPreviewLoading(true);
    setPreviewError("");
    setFeedback(null);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });

    try {
      const blob = await ordenesTrabajoApi.previsualizarRequerimiento(line.id);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (requestError) {
      setPreviewError(errorText(requestError));
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selected) return;
    setConfirming(true);
    setFeedback(null);

    try {
      const result = await createOT.mutateAsync({
        pedidoDetalleId: selected.line.id,
        observaciones,
      });

      if (!result.exito) {
        throw new Error(result.mensaje || "No se pudo generar la orden de trabajo.");
      }

      setFeedback({
        kind: "success",
        text: `${result.numero_orden ?? "La OT"} fue generada correctamente para ${productName(selected.line)}.`,
      });
      closePreview();
    } catch (requestError) {
      setFeedback({ kind: "error", text: errorText(requestError) });
    } finally {
      setConfirming(false);
    }
  };

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
        subtitle="Revisa el requerimiento de cada producto y genera su orden de producción individualmente."
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

      {feedback && (
        <div
          role={feedback.kind === "error" ? "alert" : "status"}
          className={`rounded-lg border p-3 text-sm ${feedback.kind === "error"
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
        >
          {feedback.text}
        </div>
      )}

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
                          Revisar requerimiento
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
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          OT generada
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => void openPreview(pedido, line)}
                        >
                          <Eye className="h-4 w-4" />
                          Ver OT
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Card>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-3 sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePreview();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
            className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
          >
            <header className="flex items-start justify-between gap-3 border-b border-border p-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  Pedido {selected.pedido.pedido.numero}
                </p>
                <h2
                  id="preview-title"
                  className="mt-1 truncate text-lg font-semibold"
                >
                  {productName(selected.line)}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {productCode(selected.line)} · Detalle #{selected.line.id}
                </p>
              </div>
              <button
                type="button"
                onClick={closePreview}
                aria-label="Cerrar previsualización"
                className="rounded-md p-2 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-auto p-4">
              {previewLoading && (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Generando previsualización…
                </div>
              )}
              {previewError && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
                >
                  No se pudo generar el PDF. {previewError}
                </div>
              )}
              {previewUrl && (
                <iframe
                  title={`Requerimiento del producto ${productName(selected.line)}`}
                  src={previewUrl}
                  className="h-[55vh] w-full rounded-md border border-border"
                />
              )}
              {!previewLoading && !previewError && !previewUrl && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  <FileText className="mx-auto mb-2 h-7 w-7" />
                  No hay una previsualización disponible.
                </div>
              )}
              {!selected.line.produccion_asociada && (
                <label className="mt-4 block space-y-1 text-sm">
                  <span className="font-medium">
                    Observaciones para la OT (opcional)
                  </span>
                  <textarea
                    value={observaciones}
                    onChange={(event) => setObservaciones(event.target.value)}
                    rows={2}
                    maxLength={2000}
                    placeholder="Añade una indicación para producción…"
                    className="w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                  />
                </label>
              )}
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
              <p className="text-xs text-muted-foreground">
                {selected.line.produccion_asociada
                  ? "Esta OT ya fue generada. El documento muestra su número correlativo definitivo."
                  : "La OT se creará únicamente al confirmar. La previsualización no guarda ni genera órdenes."}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={closePreview}
                  disabled={confirming}
                >
                  Cerrar
                </Button>
                {!selected.line.produccion_asociada && (
                  <Button
                    onClick={() => void handleCreate()}
                    disabled={
                      !previewUrl ||
                      previewLoading ||
                      confirming ||
                      createOT.isPending
                    }
                  >
                    {confirming || createOT.isPending ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Confirmar y generar OT
                  </Button>
                )}
              </div>
            </footer>
          </section>
        </div>
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
