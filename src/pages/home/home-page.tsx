import { useMemo, useState, type FormEvent } from "react";
import { Activity, BadgeCheck, Ban, CalendarDays, CircleDollarSign, Clock3, Filter, RotateCcw, Send, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui";
import { useDashboardComercial, useEjecutivosComerciales } from "@/features/comercial/comercial.hooks";
import type { DashboardComercialFiltros, DashboardComercialData, EstadoDashboardComercial } from "@/features/comercial/comercial.types";

const EMPTY_FILTERS: DashboardComercialFiltros = { desde: "", hasta: "", ejecutivo: "", estado: "todos", moneda: "" };
const STATUS_OPTIONS: Array<[EstadoDashboardComercial, string]> = [
  ["todos", "Todos los estados"],
  ["recibida", "Recibidas"],
  ["abierta", "Abiertas"],
  ["aceptada", "Aceptadas"],
  ["rechazada", "Rechazadas por cliente"],
  ["cerrada_sin_respuesta", "Cerradas sin respuesta"],
  ["descartada_viabilidad", "Descartes por viabilidad"],
];
const REASON_LABELS: Record<string, string> = {
  precio: "Precio",
  competencia: "Competencia",
  plazo: "Plazo de entrega",
  caracteristicas: "No cumple características",
  sin_respuesta: "Sin respuesta (motivo heredado)",
  cancelacion_cliente: "Cancelación del cliente",
  otro: "Otro",
  sin_motivo: "Sin motivo registrado",
};

function money(value: string | undefined, currency: "BOB" | "USD") {
  const formatted = Number(value ?? 0).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${currency === "BOB" ? "Bs" : "USD"} ${formatted}`;
}

function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("es-BO", { month: "short", year: "2-digit" });
}

function DashboardSkeleton() {
  return <div className="grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="h-28 rounded-xl bg-muted" /><div className="h-28 rounded-xl bg-muted" /><div className="h-28 rounded-xl bg-muted" /><div className="h-28 rounded-xl bg-muted" /></div>;
}

function DashboardContent({ data }: { data: DashboardComercialData }) {
  const cards = [
    { label: "Recibidas", value: data.resumen.recibidas, icon: Send, color: "text-sky-700 bg-sky-50" },
    { label: "Abiertas", value: data.resumen.abiertas, icon: Activity, color: "text-amber-700 bg-amber-50" },
    { label: "Aceptadas", value: data.resumen.aceptadas, icon: BadgeCheck, color: "text-emerald-700 bg-emerald-50" },
    { label: "Rechazadas por cliente", value: data.resumen.rechazadas, icon: Ban, color: "text-rose-700 bg-rose-50" },
    { label: "Cerradas sin respuesta", value: data.resumen.cerradas_sin_respuesta, icon: Clock3, color: "text-slate-700 bg-slate-100" },
    { label: "Descartes por viabilidad", value: data.resumen.descartadas_viabilidad, icon: Filter, color: "text-violet-700 bg-violet-50" },
  ];
  const maxSeries = Math.max(1, ...data.evolucion.flatMap(item => [item.recibida, item.abierta, item.aceptada, item.rechazada, item.cerrada_sin_respuesta]));
  const motivosTotal = data.motivos_rechazo.reduce((total, item) => total + item.oportunidades, 0);

  return <>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {cards.map(({ label, value, icon: Icon, color }) => <Card key={label} className="p-4">
        <div className="flex items-start justify-between gap-3"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p></div><span className={`rounded-lg p-2 ${color}`}><Icon className="h-5 w-5" /></span></div>
      </Card>)}
    </section>

    <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
      <Card className="p-5">
        <header className="mb-5 flex items-center gap-3"><span className="rounded-lg bg-primary/10 p-2 text-primary"><TrendingUp className="h-5 w-5" /></span><div><h2 className="font-semibold">Evolución comercial</h2><p className="text-xs text-muted-foreground">Solicitudes por fecha del evento comercial</p></div></header>
        {data.evolucion.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">No hay eventos en el período seleccionado.</p> : <div className="space-y-3">
          {data.evolucion.map(item => <div key={item.periodo} className="grid grid-cols-[4.5rem_1fr_2rem] items-center gap-3 text-xs">
            <span className="text-muted-foreground">{monthLabel(item.periodo)}</span>
            <div className="flex h-6 items-end gap-1" aria-label={`${item.periodo}: recibidas ${item.recibida}, aceptadas ${item.aceptada}, rechazadas ${item.rechazada}, cerradas sin respuesta ${item.cerrada_sin_respuesta}`}>
              {([ [item.recibida, "bg-sky-500"], [item.abierta, "bg-amber-400"], [item.aceptada, "bg-emerald-500"], [item.rechazada, "bg-rose-500"], [item.cerrada_sin_respuesta, "bg-slate-400"] ] as Array<[number, string]>).map(([value, color], index) => <span key={index} className={`min-w-1 flex-1 rounded-t ${color}`} style={{ height: `${Math.max(value ? 12 : 2, (value / maxSeries) * 100)}%` }} />)}
            </div><span className="text-right font-medium">{item.recibida + item.abierta + item.aceptada + item.rechazada + item.cerrada_sin_respuesta}</span>
          </div>)}
          <div className="flex flex-wrap gap-x-4 gap-y-2 border-t pt-3 text-xs text-muted-foreground">{[["Recibidas", "bg-sky-500"], ["Abiertas", "bg-amber-400"], ["Aceptadas", "bg-emerald-500"], ["Rechazadas", "bg-rose-500"], ["Cerradas", "bg-slate-400"]].map(([label, color]) => <span key={label} className="inline-flex items-center gap-1.5"><i className={`h-2 w-2 rounded-full ${color}`} />{label}</span>)}</div>
        </div>}
      </Card>

      <Card className="p-5">
        <header className="mb-5 flex items-center gap-3"><span className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><CircleDollarSign className="h-5 w-5" /></span><div><h2 className="font-semibold">Rendimiento económico</h2><p className="text-xs text-muted-foreground">Importes de las versiones efectivamente aceptadas</p></div></header>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["BOB", "USD"] as const).map(currency => <div key={currency} className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Aceptado en {currency === "BOB" ? "bolivianos" : "dólares"}</p><p className="mt-2 text-xl font-semibold">{money(data.importes_aceptados[currency], currency)}</p></div>)}
        </div>
        <div className="mt-4 divide-y divide-border border-y">
          <MetricRow label="Ofertas aceptadas" value={String(data.ofertas_aceptadas)} />
          <MetricRow label="Tasa de aceptación por oportunidades" value={`${data.resumen.tasa_aceptacion.toLocaleString("es-BO", { maximumFractionDigits: 2 })}%`} />
          <MetricRow label="Días promedio para aceptar" value={data.dias_promedio_aceptacion === null ? "—" : `${data.dias_promedio_aceptacion.toLocaleString("es-BO")} días`} />
          <MetricRow label="Versiones promedio hasta aceptar" value={data.versiones_promedio_hasta_aceptar === null ? "—" : data.versiones_promedio_hasta_aceptar.toLocaleString("es-BO")} />
        </div>
        <div className="mt-4"><p className="mb-2 text-xs font-medium text-muted-foreground">Importe aceptado por mes</p>{data.importe_aceptado_por_periodo.length ? data.importe_aceptado_por_periodo.slice(-5).map(row => <div key={row.periodo} className="flex justify-between py-1 text-xs"><span>{monthLabel(row.periodo)}</span><span>{money(row.BOB, "BOB")} · {money(row.USD, "USD")}</span></div>) : <p className="text-xs text-muted-foreground">Sin aceptaciones en el período.</p>}</div>
        <div className="mt-4"><p className="mb-2 text-xs font-medium text-muted-foreground">Importes aceptados por ejecutivo asignado actualmente</p>{data.importes_por_ejecutivo.length ? data.importes_por_ejecutivo.map(row => <div key={row.ejecutivo ?? "sin-ejecutivo"} className="flex flex-wrap justify-between gap-2 border-t py-2 text-xs"><span>{row.ejecutivo_nombre}</span><span>{money(row.BOB, "BOB")} · {money(row.USD, "USD")}</span></div>) : <p className="text-xs text-muted-foreground">Sin importes aceptados para los filtros.</p>}</div>
      </Card>
    </section>

    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-semibold">Motivos de rechazo del cliente</h2><p className="mt-1 text-xs text-muted-foreground">Excluye los cierres sin respuesta y los descartes internos por viabilidad.</p></div><span className="text-sm font-semibold">{motivosTotal} oportunidades</span></div>
      {data.motivos_rechazo.length ? <div className="space-y-3">{data.motivos_rechazo.map(item => <div key={item.motivo} className="grid grid-cols-[minmax(9rem,1fr)_3fr_5rem] items-center gap-3 text-sm"><span>{REASON_LABELS[item.motivo] ?? item.motivo}</span><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-rose-500" style={{ width: `${motivosTotal ? item.oportunidades / motivosTotal * 100 : 0}%` }} /></div><span className="text-right text-muted-foreground">{item.oportunidades} · {motivosTotal ? (item.oportunidades / motivosTotal * 100).toFixed(1) : "0.0"}%</span></div>)}</div> : <p className="py-8 text-center text-sm text-muted-foreground">No hay rechazos de cliente para los filtros seleccionados.</p>}
    </Card>

    {data.resumen.inconsistentes > 0 && <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">Hay {data.resumen.inconsistentes} solicitudes con estado histórico sin evento comercial verificable. No se asignaron arbitrariamente a rechazo o aceptación.</div>}
  </>;
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 py-3 text-sm"><span className="text-muted-foreground">{label}</span><span className="font-semibold">{value}</span></div>;
}

export default function HomePage() {
  const [filters, setFilters] = useState<DashboardComercialFiltros>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<DashboardComercialFiltros>(EMPTY_FILTERS);
  const { data, isLoading, isError, error, isFetching } = useDashboardComercial(appliedFilters);
  const { data: executives = [] } = useEjecutivosComerciales();
  const executiveOptions = useMemo(() => executives.map(item => ({ id: item.id, label: `${item.first_name} ${item.last_name}`.trim() || item.username })), [executives]);

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedFilters({ ...filters });
  };
  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
  };

  return <main className="mx-auto w-full max-w-[1500px] space-y-5 text-foreground">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-medium uppercase tracking-wider text-primary">Comercial</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">Resumen comercial</h1><p className="mt-1 text-sm text-muted-foreground">Oportunidades, resultados e importes de ofertas aceptadas.</p></div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="h-4 w-4" />{isFetching && !isLoading ? "Actualizando indicadores…" : "Datos actualizados desde el backend"}</div>
    </header>

    <Card className="p-4">
      <form onSubmit={applyFilters} className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <label className="space-y-1 text-xs font-medium text-muted-foreground">Desde<input type="date" value={filters.desde ?? ""} onChange={event => setFilters(current => ({ ...current, desde: event.target.value }))} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground" /></label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">Hasta<input type="date" value={filters.hasta ?? ""} onChange={event => setFilters(current => ({ ...current, hasta: event.target.value }))} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground" /></label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">Estado<select value={filters.estado ?? "todos"} onChange={event => setFilters(current => ({ ...current, estado: event.target.value as EstadoDashboardComercial }))} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground">{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">Ejecutivo<select value={filters.ejecutivo ?? ""} onChange={event => setFilters(current => ({ ...current, ejecutivo: event.target.value ? Number(event.target.value) : "" }))} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"><option value="">Todos</option>{executiveOptions.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">Moneda<select value={filters.moneda ?? ""} onChange={event => setFilters(current => ({ ...current, moneda: event.target.value as DashboardComercialFiltros["moneda"] }))} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"><option value="">BOB y USD</option><option value="BOB">BOB</option><option value="USD">USD</option></select></label>
        <div className="flex gap-2"><button type="submit" className="h-10 flex-1 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90">Aplicar</button><button type="button" onClick={clearFilters} title="Limpiar filtros" aria-label="Limpiar filtros" className="inline-flex h-10 items-center justify-center rounded-md border border-border px-3 text-muted-foreground hover:bg-muted"><RotateCcw className="h-4 w-4" /></button></div>
      </form>
    </Card>

    {isLoading ? <DashboardSkeleton /> : isError ? <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">No se pudo cargar el dashboard comercial. {(error as Error)?.message}</div> : data ? <DashboardContent data={data} /> : null}
  </main>;
}
