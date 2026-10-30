import { useEffect, useMemo, useState } from "react";
import { CalendarDays, X } from "lucide-react";
import {
  useCreateActividadComercial,
  useUpdateActividadComercial,
  useCuentasComerciales,
  useCotizaciones,
  useCotizacionesVersiones,
  useSolicitudesComerciales,
} from "../../comercial.hooks";
import type {
  ActividadComercial,
  ActividadComercialCreate,
  ActividadComercialUpdate,
  TipoActividad,
} from "../../comercial.types";

interface NuevaActividadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  actividad?: ActividadComercial;
  cuentaComercialInicial?: number;
  solicitudInicial?: number;
  cotizacionVersionInicial?: number;
}

const tiposActividad: { value: TipoActividad; label: string }[] = [
  { value: "llamada", label: "Llamada" },
  { value: "reunion", label: "Reunión" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "correo", label: "Correo" },
  { value: "visita", label: "Visita" },
];
const resultados = ["No contesta", "Interesado", "Solicita información", "Solicita cambios", "Acepta propuesta", "Rechaza propuesta", "Otro"];

function nombreCliente(cliente: { nombres: string; apellido_paterno: string; apellido_materno: string; razon_social: string; tipo_persona: string }) {
  return cliente.tipo_persona === "juridica"
    ? cliente.razon_social || "Sin razón social"
    : [cliente.nombres, cliente.apellido_paterno, cliente.apellido_materno].filter(Boolean).join(" ");
}

function ahoraLocal() {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function aFechaLocal(value: string) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function aIso(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function mensajeError(error: unknown) {
  if (error && typeof error === "object" && "response" in error) {
    const data = (error as { response?: { data?: unknown } }).response?.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object") return Object.values(data).flat().join(" ");
  }
  return "No se pudo guardar el seguimiento. Verifica los datos e inténtalo nuevamente.";
}

export default function NuevaActividadModal({
  open,
  onClose,
  onSuccess,
  actividad,
  cuentaComercialInicial,
  solicitudInicial,
  cotizacionVersionInicial,
}: NuevaActividadModalProps) {
  const createActividad = useCreateActividadComercial();
  const updateActividad = useUpdateActividadComercial();
  const { data: clientes = [], isLoading: loadingClientes } = useCuentasComerciales();
  const { data: solicitudesData } = useSolicitudesComerciales({ page_size: 1000 });
  const { data: cotizacionesData } = useCotizaciones({ page_size: 1000 });
  const { data: versionesData } = useCotizacionesVersiones({ page_size: 1000 });
  const solicitudes = solicitudesData ?? [];
  const cotizaciones = cotizacionesData?.results ?? [];
  const versiones = versionesData?.results ?? [];
  const isEditing = Boolean(actividad);
  const isOfertaOrigen = Boolean(cuentaComercialInicial && cotizacionVersionInicial);

  const [cuentaComercial, setCuentaComercial] = useState<number | "">("");
  const [tipo, setTipo] = useState<TipoActividad>("llamada");
  const [resultado, setResultado] = useState("No contesta");
  const [otroResultado, setOtroResultado] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [observacionesPrivadas, setObservacionesPrivadas] = useState("");
  const [fechaProgramada, setFechaProgramada] = useState(ahoraLocal());
  const [programarProximo, setProgramarProximo] = useState(false);
  const [fechaProxima, setFechaProxima] = useState("");
  const [horaProxima, setHoraProxima] = useState("");
  const [ofertasSeleccionadas, setOfertasSeleccionadas] = useState<number[]>([]);
  const [error, setError] = useState("");

  const versionPorId = useMemo(() => new Map(versiones.map((version) => [version.id, version])), [versiones]);
  const versionOrigen = cotizacionVersionInicial ? versionPorId.get(cotizacionVersionInicial) : undefined;
  const ofertasCuenta = useMemo(() => {
    if (!cuentaComercial) return [];
    const solicitudesCliente = new Set(solicitudes.filter((solicitud) => solicitud.cuenta_comercial === Number(cuentaComercial)).map((solicitud) => solicitud.id));
    return cotizaciones.filter((cotizacion) => solicitudesCliente.has(cotizacion.solicitud_comercial));
  }, [cuentaComercial, cotizaciones, solicitudes]);
  const guardando = createActividad.isPending || updateActividad.isPending;

  useEffect(() => {
    if (!open) return;
    setError("");
    if (actividad) {
      setCuentaComercial(actividad.cuenta_comercial);
      setTipo(actividad.tipo);
      setResultado(actividad.resultado || "No contesta");
      setDescripcion(actividad.descripcion);
      setObservacionesPrivadas(actividad.observaciones_privadas || "");
      setFechaProgramada(aFechaLocal(actividad.fecha_programada));
      setProgramarProximo(Boolean(actividad.fecha_proxima));
      setFechaProxima(actividad.fecha_proxima ? aFechaLocal(actividad.fecha_proxima).slice(0, 10) : "");
      setHoraProxima(actividad.fecha_proxima ? aFechaLocal(actividad.fecha_proxima).slice(11, 16) : "");
      setOfertasSeleccionadas(actividad.cotizaciones_relacionadas || []);
    } else {
      setCuentaComercial(cuentaComercialInicial || "");
      setTipo("llamada");
      setResultado("No contesta");
      setOtroResultado("");
      setDescripcion("");
      setObservacionesPrivadas("");
      setFechaProgramada(ahoraLocal());
      setProgramarProximo(Boolean(cotizacionVersionInicial));
      setFechaProxima("");
      setHoraProxima("");
      setOfertasSeleccionadas([]);
      createActividad.reset();
      updateActividad.reset();
    }
  }, [open, actividad, cuentaComercialInicial, cotizacionVersionInicial]);

  useEffect(() => {
    if (!open || !versionOrigen) return;
    setOfertasSeleccionadas((actuales) => actuales.includes(versionOrigen.cotizacion) ? actuales : [...actuales, versionOrigen.cotizacion]);
  }, [open, versionOrigen]);

  if (!open) return null;

  const cambiarOferta = (id: number) => setOfertasSeleccionadas((actuales) => actuales.includes(id) ? actuales.filter((actual) => actual !== id) : [...actuales, id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cuentaComercial || !descripcion.trim()) return;
    if (programarProximo && (!fechaProxima || !horaProxima)) {
      setError("Completa la fecha y hora del próximo seguimiento.");
      return;
    }
    setError("");
    const fechaProximoIso = programarProximo ? aIso(`${fechaProxima}T${horaProxima}`) : null;
    const resultadoFinal = resultado === "Otro" ? otroResultado.trim() : resultado;
    try {
      if (isEditing && actividad) {
        const data: ActividadComercialUpdate = {
          cuenta_comercial: Number(cuentaComercial),
          tipo,
          descripcion: descripcion.trim(),
          resultado: resultadoFinal,
          observaciones_privadas: observacionesPrivadas.trim(),
          fecha_programada: aIso(fechaProgramada)!,
          fecha_proxima: fechaProximoIso,
          cotizaciones_relacionadas: ofertasSeleccionadas,
        };
        await updateActividad.mutateAsync({ id: actividad.id, data });
      } else {
        const data: ActividadComercialCreate = {
          cuenta_comercial: Number(cuentaComercial),
          solicitud_comercial: solicitudInicial ?? null,
          cotizacion_version: cotizacionVersionInicial ?? null,
          cotizaciones_relacionadas: ofertasSeleccionadas,
          tipo,
          descripcion: descripcion.trim(),
          resultado: resultadoFinal,
          observaciones_privadas: observacionesPrivadas.trim(),
          fecha_programada: isOfertaOrigen ? new Date().toISOString() : aIso(fechaProgramada)!,
          fecha_proxima: fechaProximoIso,
        };
        await createActividad.mutateAsync(data);
      }
      onSuccess?.();
      onClose();
    } catch (submitError) {
      setError(mensajeError(submitError));
    }
  };

  const control = "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100";
  const label = "mb-1 block text-xs font-semibold text-slate-600";
  const clienteActual = clientes.find((cliente) => cliente.id === cuentaComercial);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-5">
      <section role="dialog" aria-modal="true" aria-labelledby="nueva-actividad-title" className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id="nueva-actividad-title" className="text-base font-bold text-slate-800">{isEditing ? "Editar seguimiento comercial" : isOfertaOrigen ? "Nuevo seguimiento / llamada / visita" : "Nueva actividad comercial"}</h2>
          <button type="button" aria-label="Cerrar" onClick={onClose} disabled={guardando} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-50"><X className="h-5 w-5" /></button>
        </header>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {isOfertaOrigen && <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 text-xs text-slate-600">Origen vinculado a oferta: el cliente y la oferta de origen no podrán cambiarse desde esta actividad.</div>}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div><label className={label} htmlFor="actividad-empresa">Empresa</label><select id="actividad-empresa" value={cuentaComercial} onChange={(e) => { setCuentaComercial(e.target.value ? Number(e.target.value) : ""); setOfertasSeleccionadas([]); }} disabled={loadingClientes || guardando || Boolean(cuentaComercialInicial)} className={control} required><option value="">{loadingClientes ? "Cargando clientes..." : "Selecciona una empresa"}</option>{clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{nombreCliente(cliente)}</option>)}</select></div>
              <div><label className={label} htmlFor="actividad-tipo">Tipo</label><select id="actividad-tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoActividad)} disabled={guardando} className={control}>{tiposActividad.map((opcion) => <option key={opcion.value} value={opcion.value}>{opcion.label}</option>)}</select></div>
              <div><label className={label} htmlFor="actividad-resultado">Resultado</label><select id="actividad-resultado" value={resultado} onChange={(e) => setResultado(e.target.value)} disabled={guardando} className={control}>{resultados.map((opcion) => <option key={opcion}>{opcion}</option>)}</select>{resultado === "Otro" && <input className={`${control} mt-2`} value={otroResultado} onChange={(e) => setOtroResultado(e.target.value)} placeholder="Describe el resultado" required />}</div>
            </div>
            <fieldset><legend className={label}>Ofertas relacionadas (puedes seleccionar varias)</legend><div className="grid max-h-36 grid-cols-1 gap-1 overflow-y-auto rounded-lg bg-slate-50 p-2 sm:grid-cols-2 lg:grid-cols-3">{ofertasCuenta.length ? ofertasCuenta.map((oferta) => { const bloqueada = isOfertaOrigen && versionOrigen?.cotizacion === oferta.id; return <label key={oferta.id} className="flex min-w-0 items-center gap-2 rounded px-1.5 py-1 text-xs text-slate-700"><input type="checkbox" checked={ofertasSeleccionadas.includes(oferta.id)} onChange={() => cambiarOferta(oferta.id)} disabled={guardando || bloqueada} className="accent-blue-600" /><span className="truncate">{oferta.numero} · {clienteActual ? nombreCliente(clienteActual) : "Cliente"}</span></label>; }) : <p className="col-span-full px-1 py-2 text-xs text-slate-500">No hay ofertas asociadas a esta empresa.</p>}</div></fieldset>
            <div><label className={label} htmlFor="actividad-descripcion">Descripción de la interacción</label><textarea id="actividad-descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Qué ocurrió con este cliente..." rows={3} disabled={guardando} required className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" /></div>
            <div><label className={label} htmlFor="actividad-observaciones">Observaciones privadas de atención (no aparecen en la oferta PDF)</label><textarea id="actividad-observaciones" value={observacionesPrivadas} onChange={(e) => setObservacionesPrivadas(e.target.value)} rows={3} disabled={guardando} className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" /></div>
            {!isOfertaOrigen && <div><label className={label} htmlFor="actividad-fecha">Fecha y hora del registro</label><input id="actividad-fecha" type="datetime-local" value={fechaProgramada} onChange={(e) => setFechaProgramada(e.target.value)} disabled={guardando} className={control} required /></div>}
            <div className="border-t border-slate-200 pt-3"><label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={programarProximo} onChange={(e) => setProgramarProximo(e.target.checked)} disabled={guardando} className="accent-blue-600" />¿Programar próximo seguimiento?</label>{programarProximo && <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className={label} htmlFor="actividad-fecha-proxima">Fecha próxima</label><input id="actividad-fecha-proxima" type="date" value={fechaProxima} onChange={(e) => setFechaProxima(e.target.value)} disabled={guardando} className={control} required /></div><div><label className={label} htmlFor="actividad-hora-proxima">Hora</label><input id="actividad-hora-proxima" type="time" value={horaProxima} onChange={(e) => setHoraProxima(e.target.value)} disabled={guardando} className={control} required /></div></div>}</div>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {isOfertaOrigen && <p className="flex items-center gap-1 text-xs text-slate-400"><CalendarDays className="h-3.5 w-3.5" />La fecha del registro se asigna automáticamente; la fecha próxima se guarda como recordatorio.</p>}
          </div>
          <footer className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-white px-5 py-3"><button type="button" onClick={onClose} disabled={guardando} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancelar</button><button type="submit" disabled={guardando || !cuentaComercial || !descripcion.trim()} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">{guardando ? "Guardando..." : "Guardar seguimiento"}</button></footer>
        </form>
      </section>
    </div>
  );
}
