import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { BadgeCheck, ChevronLeft, ChevronRight, CircleDollarSign, Eye, PackageCheck, RotateCcw, Search, Wallet, type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui";
import type { ApiQueryParams } from "@/api/api.types";
import { usePedidoConDetalles, usePedidos, useResumenPedidos } from "../comercial.hooks";
import type { EstadoPedido, Pedido, PedidoConDetalles, PedidoResumen } from "../comercial.types";

const PAGE_SIZE = 10;
const EMPTY_FILTERS = { search: "", estado: "confirmados", desde: "", hasta: "" };
type PedidoFilters = typeof EMPTY_FILTERS;
type EstadoFiltro = "confirmados" | EstadoPedido;

const ESTADOS_CONFIRMADOS: Array<[EstadoFiltro, string]> = [
  ["confirmados", "Todos los pedidos confirmados"],
  ["confirmado", "Confirmado"],
  ["en_produccion", "En producción"],
  ["finalizado", "Finalizado"],
];

function money(value: string | number | undefined, currency: "BOB" | "USD") {
  const amount = Number(value ?? 0).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${currency === "BOB" ? "Bs" : "USD"} ${amount}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
}

function displayMoneyByCurrency(summary?: PedidoResumen, key: "valor_comprometido" | "anticipos_recibidos" | "saldo_por_cobrar" = "valor_comprometido") {
  const currencies = (["BOB", "USD"] as const).filter(currency => summary?.por_moneda?.[currency]);
  if (!currencies.length) return <span>{money(0, "BOB")}</span>;
  return currencies.map(currency => <span key={currency} className="block">{money(summary?.por_moneda?.[currency]?.[key], currency)}</span>);
}

function statusLabel(status: EstadoPedido) {
  return ({
    borrador: "Borrador",
    confirmado: "Confirmado",
    en_produccion: "En producción",
    finalizado: "Finalizado",
    cancelado: "Cancelado",
  } satisfies Record<EstadoPedido, string>)[status];
}

export default function PedidoPage() {
  const [searchParams] = useSearchParams();
  const requestedPedidoId = Number(searchParams.get("pedido"));
  const [filters, setFilters] = useState<PedidoFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<PedidoFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null);
  const [filterError, setFilterError] = useState("");

  useEffect(() => {
    if (requestedPedidoId > 0) setSelectedPedidoId(requestedPedidoId);
  }, [requestedPedidoId]);

  const activeParams = useMemo(() => {
    const params: ApiQueryParams = {};
    for (const [key, value] of Object.entries(appliedFilters)) {
      if (value !== "") params[key] = value;
    }
    return params;
  }, [appliedFilters]);
  const listParams = useMemo(() => ({ ...activeParams, page, page_size: PAGE_SIZE }), [activeParams, page]);
  const { data, isLoading, isError, error } = usePedidos(listParams);
  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError } = useResumenPedidos(activeParams);
  const orders = data?.results ?? [];
  const pageCount = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (filters.desde && filters.hasta && filters.desde > filters.hasta) {
      setFilterError("La fecha inicial debe ser anterior o igual a la fecha final.");
      return;
    }
    setFilterError("");
    setAppliedFilters({ ...filters });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setFilterError("");
    setPage(1);
  };

  return <main className="mx-auto w-full max-w-[1500px] space-y-5 text-foreground">
    <header>
      <p className="text-xs font-medium uppercase tracking-wider text-primary">Comercial</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Pedidos confirmados</h1>
      <p className="mt-1 text-sm text-muted-foreground">Control comercial y financiero de los pedidos confirmados.</p>
    </header>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen financiero de pedidos">
      <SummaryCard icon={CircleDollarSign} title="Valor comprometido" loading={isSummaryLoading}>{displayMoneyByCurrency(summary, "valor_comprometido")}</SummaryCard>
      <SummaryCard icon={Wallet} title="Anticipos registrados" loading={isSummaryLoading}>{displayMoneyByCurrency(summary, "anticipos_recibidos")}</SummaryCard>
      <SummaryCard icon={BadgeCheck} title="Saldo por cobrar" loading={isSummaryLoading}>{displayMoneyByCurrency(summary, "saldo_por_cobrar")}</SummaryCard>
      <SummaryCard icon={PackageCheck} title="Pedidos registrados" loading={isSummaryLoading}>{summary?.pedidos_registrados ?? 0}</SummaryCard>
    </section>

    {isSummaryError && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">No se pudo cargar el resumen financiero.</p>}

    <Card className="overflow-hidden">
      <form onSubmit={applyFilters} className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.5fr)_minmax(190px,1fr)_minmax(145px,1fr)_minmax(145px,1fr)_auto] lg:items-end">
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Buscar pedido o cliente
          <span className="flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3">
            <Search className="h-4 w-4" />
            <input value={filters.search} onChange={event => setFilters(current => ({ ...current, search: event.target.value }))} placeholder="N.º pedido, nombre o alias" className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          </span>
        </label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">Estado<select value={filters.estado} onChange={event => setFilters(current => ({ ...current, estado: event.target.value }))} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground">{ESTADOS_CONFIRMADOS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">Desde · fecha de pedido<input type="date" value={filters.desde} onChange={event => setFilters(current => ({ ...current, desde: event.target.value }))} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground" /></label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">Hasta · fecha de pedido<input type="date" value={filters.hasta} onChange={event => setFilters(current => ({ ...current, hasta: event.target.value }))} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground" /></label>
        <div className="flex gap-2">
          <button type="submit" className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">Aplicar</button>
          <button type="button" onClick={clearFilters} aria-label="Limpiar filtros" title="Limpiar filtros" className="inline-flex h-10 items-center justify-center rounded-md border border-border px-3 text-muted-foreground hover:bg-muted"><RotateCcw className="h-4 w-4" /></button>
        </div>
        {filterError && <p role="alert" className="text-sm text-destructive lg:col-span-5">{filterError}</p>}
      </form>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1250px] text-left text-sm">
          <thead className="bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>{["N.º pedido", "Cliente / alias", "Oferta / versión", "Fecha del pedido", "Fecha de entrega", "Subtotal", "Anticipo", "Saldo", "Estado", "Productos", "Detalle"].map(label => <th key={label} className="px-3 py-3 font-semibold">{label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? <tr><td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">Cargando pedidos…</td></tr>
              : isError ? <tr><td colSpan={11} role="alert" className="px-4 py-12 text-center text-destructive">No se pudieron cargar los pedidos. {(error as Error)?.message}</td></tr>
                : orders.length === 0 ? <tr><td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">No hay pedidos confirmados para estos filtros.</td></tr>
                  : orders.map(order => <PedidoRow key={order.id} pedido={order} onDetail={() => setSelectedPedidoId(order.id)} />)}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <span>{data?.count ?? 0} pedidos · Página {Math.min(page, pageCount)} de {pageCount}</span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={page <= 1 || isLoading} onClick={() => setPage(value => Math.max(1, value - 1))} className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2.5 disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Anterior</button>
          <button type="button" disabled={page >= pageCount || isLoading} onClick={() => setPage(value => Math.min(pageCount, value + 1))} className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2.5 disabled:opacity-40">Siguiente<ChevronRight className="h-4 w-4" /></button>
        </div>
      </footer>
    </Card>

    {selectedPedidoId !== null && <PedidoDetailModal pedidoId={selectedPedidoId} onClose={() => setSelectedPedidoId(null)} />}
  </main>;
}

function SummaryCard({ icon: Icon, title, children, loading }: { icon: LucideIcon; title: string; children: ReactNode; loading: boolean }) {
  return <Card className="p-4">
    <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-muted-foreground">{title}</p><span className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" /></span></div>
    <div className="mt-2 min-h-7 text-lg font-semibold">{loading ? <span className="text-sm text-muted-foreground">Cargando…</span> : children}</div>
  </Card>;
}

function PedidoRow({ pedido, onDetail }: { pedido: Pedido; onDetail: () => void }) {
  return <tr className="hover:bg-muted/30">
    <td className="whitespace-nowrap px-3 py-3 font-semibold text-primary">{pedido.numero}</td>
    <td className="px-3 py-3"><span className="block font-medium">{pedido.cliente_nombre}</span>{pedido.cliente_alias && <span className="text-xs text-muted-foreground">{pedido.cliente_alias}</span>}</td>
    <td className="whitespace-nowrap px-3 py-3">{pedido.cotizacion_numero} / V{String(pedido.version_numero).padStart(2, "0")}</td>
    <td className="whitespace-nowrap px-3 py-3">{formatDate(pedido.fecha_pedido)}</td>
    <td className="whitespace-nowrap px-3 py-3">{formatDate(pedido.fecha_entrega_comprometida)}</td>
    <td className="whitespace-nowrap px-3 py-3 font-medium">{money(pedido.subtotal, pedido.moneda)}</td>
    <td className="whitespace-nowrap px-3 py-3">{money(pedido.anticipo_recibido, pedido.moneda)}</td>
    <td className="whitespace-nowrap px-3 py-3">{money(Math.max(0, Number(pedido.subtotal) - Number(pedido.anticipo_recibido)), pedido.moneda)}</td>
    <td className="px-3 py-3"><PedidoStatus status={pedido.estado} /></td>
    <td className="px-3 py-3 text-center">{pedido.productos_count}</td>
    <td className="px-3 py-3"><button type="button" onClick={onDetail} className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-xs font-medium hover:bg-muted"><Eye className="h-3.5 w-3.5" />Ver</button></td>
  </tr>;
}

function PedidoStatus({ status }: { status: EstadoPedido }) {
  const styles: Record<EstadoPedido, string> = {
    borrador: "bg-amber-100 text-amber-800",
    confirmado: "bg-emerald-100 text-emerald-800",
    en_produccion: "bg-blue-100 text-blue-800",
    finalizado: "bg-slate-100 text-slate-800",
    cancelado: "bg-rose-100 text-rose-800",
  };
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>{statusLabel(status)}</span>;
}

function PedidoDetailModal({ pedidoId, onClose }: { pedidoId: number; onClose: () => void }) {
  const { data, isLoading, isError } = usePedidoConDetalles(pedidoId);
  const order = data?.pedido;
  const currentVersion = order?.version_cotizacion_vigente ?? order?.cotizacion_version;
  const currency = currentVersion?.moneda ?? "BOB";

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="pedido-detail-title" className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-border bg-background shadow-xl">
      <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-background px-5 py-4">
        <div><h2 id="pedido-detail-title" className="text-lg font-semibold">{order ? `Pedido ${order.numero}` : "Detalle del pedido"}</h2><p className="mt-1 text-sm text-muted-foreground">Productos y condiciones del pedido confirmado.</p></div>
        <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">Cerrar</button>
      </header>
      {isLoading ? <p className="p-8 text-center text-sm text-muted-foreground">Cargando detalle…</p>
        : isError || !data ? <p role="alert" className="p-8 text-center text-sm text-destructive">No se pudo cargar el detalle del pedido.</p>
          : <div className="space-y-5 p-5">
            <div className="grid gap-3 rounded-lg bg-muted/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <DetailValue label="Cliente" value={order?.cuenta_comercial.nombre || "—"} />
              <DetailValue label="Oferta / versión vigente" value={`${order?.cotizacion_version.cotizacion_numero} / V${String(order?.version_cotizacion_vigente?.numero ?? order?.cotizacion_version.version ?? "—").padStart(2, "0")}`} />
              <DetailValue label="Fecha del pedido" value={formatDate(order?.fecha_pedido)} />
              <DetailValue label="Entrega comprometida" value={formatDate(order?.fecha_entrega_comprometida)} />
              <DetailValue label="Valor comprometido vigente" value={money(currentVersion?.precio_total, currency)} />
              <DetailValue label="Anticipo registrado" value={money(order?.anticipo_recibido, currency)} />
              <DetailValue label="Saldo por cobrar" value={money(order?.saldo_por_cobrar, currency)} />
              <DetailValue label="Estado" value={order ? statusLabel(order.estado) : "—"} />
            </div>
            {order?.alerta_excedente_anticipo && <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
              El anticipo registrado supera el importe de la versión vigente por {money(order.excedente_anticipo, currency)}. Requiere gestión manual.
            </div>}
            <div><div className="mb-3 flex items-center gap-2"><PackageCheck className="h-4 w-4 text-primary" /><h3 className="font-semibold">Productos ({data.cantidad_detalles})</h3></div>
              {data.detalles.length ? <div className="space-y-3">{data.detalles.map(line => <article key={line.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="font-medium">{line.especificacion_snapshot?.nombre || line.especificacion_snapshot?.descripcion || line.producto_version?.nombre || line.especificacion_producto_solicitado_version?.categoria || "Producto solicitado"}</p><p className="mt-1 text-xs text-muted-foreground">{line.especificacion_snapshot?.codigo ? `${line.especificacion_snapshot.codigo} · ` : line.producto_version?.codigo ? `${line.producto_version.codigo} · ` : ""}{line.especificacion_snapshot?.tipo === "solicitado" ? "Especificación solicitada" : line.especificacion_snapshot?.tipo === "catalogo" ? "Producto de catálogo" : line.producto_version ? `Versión de producto V${line.producto_version.numero_version}` : line.especificacion_producto_solicitado_version ? `Especificación solicitada V${line.especificacion_producto_solicitado_version.version}` : "Sin código de catálogo"}</p></div>
                  {line.especificacion_snapshot?.estado_homologacion && <span className="rounded-full bg-muted px-2.5 py-1 text-xs">Homologación: {line.especificacion_snapshot.estado_homologacion}</span>}
                </div>
                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <DetailValue label="Cantidad" value={`${line.cantidad} ${line.unidad_comercial || line.producto_version?.unidad_medida || ""}`} />
                  <DetailValue label="Precio unitario" value={money(line.precio_unitario, currency)} />
                  <DetailValue label="Subtotal" value={money(line.precio_total, currency)} />
                  <DetailValue label="Entrega" value={formatDate(line.fecha_entrega_comprometida)} />
                </div>
                <div className="mt-3 rounded-md bg-muted/30 p-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Especificaciones aceptadas: </span>{specificationSummary(line)}
                </div>
                <div className="mt-3 flex flex-wrap items-start justify-between gap-2 border-t border-border pt-3 text-sm">
                  <span>Revisión técnica: <TechnicalStatus status={line.estado_revision_tecnica} /></span>
                  {line.observacion_tecnica && <p className="max-w-xl whitespace-pre-wrap text-orange-800">{line.observacion_tecnica}</p>}
                  {line.produccion_asociada && <span className="text-xs text-muted-foreground">Tiene producción asociada</span>}
                </div>
              </article>)}</div> : <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">El pedido no tiene productos asociados.</p>}
            </div>
            <OrderVersionHistory versions={data.historial_versiones} currency={currency} />
            {order?.observaciones && <div><p className="text-xs font-medium text-muted-foreground">Observaciones</p><p className="mt-1 whitespace-pre-wrap text-sm">{order.observaciones}</p></div>}
          </div>}
    </section>
  </div>;
}

function specificationSummary(line: PedidoConDetalles["detalles"][number]) {
  const snapshot = line.especificacion_snapshot;
  if (snapshot) {
    const values = [
      snapshot.codigo && `Código ${snapshot.codigo}`,
      snapshot.nombre,
      snapshot.descripcion,
      snapshot.unidad_medida && `Unidad ${snapshot.unidad_medida}`,
      ...Object.entries(snapshot.version ?? {}).map(([key, value]) => snapshotField(key, value)),
      ...Object.entries(snapshot.especificacion_bolsa ?? {}).map(([key, value]) => snapshotField(key, value)),
      ...Object.entries(snapshot.especificacion_bobina ?? {}).map(([key, value]) => snapshotField(key, value)),
    ];
    return values.filter(Boolean).join(" · ") || "Sin especificaciones adicionales";
  }
  const product = line.producto_version;
  const requested = line.especificacion_producto_solicitado_version;
  const fields = product ? [
    product.categoria && `Categoría ${product.categoria}`,
    product.material && `Material ${product.material}`,
    product.capas && `${product.capas}`,
    product.micraje && `${product.micraje} micras`,
    product.impresion && `Impresión ${product.color_impresion.join(", ")}`,
  ] : requested ? [
    requested.categoria && `Categoría ${requested.categoria}`,
    requested.material && `Material ${requested.material}`,
    requested.capas && `${requested.capas}`,
    requested.micraje && `${requested.micraje} micras`,
    requested.apto_alimento && "Apto para alimentos",
    requested.impresion && `Impresión ${requested.color_impresion.join(", ")}`,
    requested.tratamiento_impresion && `Tratamiento ${requested.tratamiento_impresion}`,
    requested.otras_caracteristicas,
  ] : [];
  return fields.filter(Boolean).join(" · ") || "Sin especificaciones adicionales";
}

function snapshotField(key: string, value: unknown) {
  if (value === null || value === undefined || value === "" || value === false || key.endsWith("_id")) return "";
  const label = key.replaceAll("_", " ");
  const formatted = typeof value === "boolean" ? (value ? "Sí" : "No") : Array.isArray(value) ? value.join(", ") : typeof value === "object" ? JSON.stringify(value) : String(value);
  return `${label}: ${formatted}`;
}

function TechnicalStatus({ status }: { status: PedidoConDetalles["detalles"][number]["estado_revision_tecnica"] }) {
  const labels = { pendiente: "Pendiente", aprobado: "Aprobado", observado: "Observado" } as const;
  return <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${status === "aprobado" ? "bg-emerald-100 text-emerald-800" : status === "observado" ? "bg-orange-100 text-orange-800" : status === "pendiente" ? "bg-amber-100 text-amber-800" : "bg-muted text-muted-foreground"}`}>{status ? labels[status] : "Sin revisión"}</span>;
}

function OrderVersionHistory({ versions, currency }: { versions: PedidoConDetalles["historial_versiones"]; currency: "BOB" | "USD" }) {
  if (!versions.length) return null;
  return <section className="space-y-3">
    <h3 className="font-semibold">Historial de versiones aceptadas</h3>
    <div className="space-y-3">{versions.map(version => <article key={version.id} className={`rounded-lg border p-4 ${version.vigente ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><p className="font-medium">R{String(version.numero).padStart(2, "0")} {version.vigente && <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Vigente</span>}</p><p className="mt-1 text-xs text-muted-foreground">Aceptada: {formatDate(version.fecha_aceptacion)}</p></div>
        <div className="text-right text-sm"><p>{money(version.precio_total, version.moneda ?? currency)}</p><p className="text-xs text-muted-foreground">Revisión: {version.revision_tecnica?.estado ?? "Pendiente de creación"}</p></div>
      </div>
      {version.detalles.length > 0 && <ul className="mt-3 space-y-2 border-t border-border pt-3">{version.detalles.map(detail => <li key={detail.id} className="text-xs">
        <p className="font-medium">{detail.especificacion_snapshot?.nombre || detail.especificacion_snapshot?.descripcion || detail.producto_version?.nombre || detail.especificacion_producto_solicitado_version?.categoria || "Producto"} · {detail.cantidad} {detail.unidad_comercial}</p>
        <p className="mt-0.5 text-muted-foreground">{specificationSummary(detail)} · Evaluación: {detail.estado_revision_tecnica ?? "Sin evaluación"}{detail.observacion_tecnica ? ` · ${detail.observacion_tecnica}` : ""}</p>
      </li>)}</ul>}
    </article>)}</div>
  </section>;
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[11px] font-medium text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm">{value}</p></div>;
}
