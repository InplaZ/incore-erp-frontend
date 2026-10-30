import type { ChangeEvent } from "react";
import type { DepartamentoBolivia, TipoLugarEntrega, UbicacionCuentaComercial } from "../../comercial.types";

export interface OfertaCondiciones {
  forma_pago: string;
  validez_dias: string;
  plazo_entrega_dias: string;
  tipo_dias: "calendario" | "habiles";
  inicio_plazo: "confirmacion" | "anticipo" | "emision";
  fecha_entrega_comprometida: string;
  tipo_lugar_entrega: TipoLugarEntrega;
  departamento_destino: DepartamentoBolivia | "";
  ciudad_destino: string;
  ubicacion_cliente: string;
  sucursal_inplaz: string;
  observaciones_comerciales: string;
}

const departamentos: Array<[DepartamentoBolivia, string]> = [
  ["LP", "La Paz"], ["CB", "Cochabamba"], ["SC", "Santa Cruz"],
  ["OR", "Oruro"], ["PT", "Potosí"], ["CH", "Chuquisaca"],
  ["TJ", "Tarija"], ["BN", "Beni"], ["PD", "Pando"],
];

const label = "mb-1 block text-[11px] font-semibold text-slate-600";
const control = "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none disabled:bg-slate-100";

export default function OfertaCondicionesForm({
  cliente, registroAutomatico, value, ubicaciones, disabled = false, saving = false,
  onChange, onSave,
}: {
  cliente: string;
  registroAutomatico: string;
  value: OfertaCondiciones;
  ubicaciones: UbicacionCuentaComercial[];
  disabled?: boolean;
  saving?: boolean;
  onChange: (value: OfertaCondiciones) => void;
  onSave: () => void;
}) {
  const update = (field: keyof OfertaCondiciones) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    onChange({ ...value, [field]: event.target.value });
  const calcularFecha = () => {
    const plazo = Number(value.plazo_entrega_dias);
    if (!Number.isInteger(plazo) || plazo < 0 || plazo > 3650) return;
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    let elapsed = 0;
    while (elapsed < plazo) {
      date.setDate(date.getDate() + 1);
      if (value.tipo_dias === "calendario" || ![0, 6].includes(date.getDay())) elapsed += 1;
    }
    onChange({ ...value, fecha_entrega_comprometida: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` });
  };
  const fechaRegistro = registroAutomatico ? new Date(registroAutomatico).toLocaleString("es-BO") : "—";

  return <div className="min-w-0">
    <h2 className="text-base font-bold text-slate-900">Condiciones de la oferta comercial</h2>
    <p className="mt-3 rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-3 text-[11px] text-slate-600">El contacto queda <strong>vinculado</strong> a esta oferta. Fecha/hora registradas automáticamente: <strong>{fechaRegistro}</strong>.</p>
    <div className="mt-4 grid min-w-0 grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
      <label><span className={label}>Cliente / empresa (no editable)</span><input className={control} value={cliente} readOnly /></label>
      <label><span className={label}>Registro automático</span><input className={control} value={fechaRegistro} readOnly /></label>
      <label><span className={label}>Forma de pago</span><select className={control} value={value.forma_pago} onChange={update("forma_pago")} disabled={disabled}><option value="">Seleccionar</option>{["Contado", "Crédito 7 días", "Crédito 15 días", "Crédito 30 días", "50% anticipo / saldo entrega", "100% anticipo", "Otro"].map((x) => <option key={x}>{x}</option>)}</select></label>
      <label><span className={label}>Validez (días)</span><select className={control} value={value.validez_dias} onChange={update("validez_dias")} disabled={disabled}><option value="">Seleccionar</option>{[2, 5, 10, 15, 20, 30, 45, 60].map((x) => <option key={x} value={x}>{x}</option>)}</select></label>
      <label><span className={label}>Plazo de entrega (días)</span><input className={control} type="number" min="0" max="3650" value={value.plazo_entrega_dias} onChange={update("plazo_entrega_dias")} disabled={disabled} /></label>
      <label><span className={label}>Tipo de días</span><select className={control} value={value.tipo_dias} onChange={update("tipo_dias")} disabled={disabled}><option value="calendario">Calendario</option><option value="habiles">Hábiles</option></select></label>
      <label><span className={label}>Inicio del plazo</span><select className={control} value={value.inicio_plazo} onChange={update("inicio_plazo")} disabled={disabled}><option value="confirmacion">Desde confirmación</option><option value="anticipo">Desde anticipo</option><option value="emision">Desde emisión</option></select></label>
      <label><span className={label}>Fecha de entrega comprometida</span><input className={control} type="date" value={value.fecha_entrega_comprometida} onChange={update("fecha_entrega_comprometida")} disabled={disabled} /></label>
      <label><span className={label}>Lugar de entrega</span><select className={control} value={value.tipo_lugar_entrega} onChange={update("tipo_lugar_entrega")} disabled={disabled}><option value="casa_matriz">Casa Matriz INPLAZ</option><option value="cliente">Almacén del cliente</option><option value="envio_interior">Envío nacional</option><option value="sucursal">Sucursal INPLAZ</option></select></label>
      <label><span className={label}>Departamento destino</span><select className={control} value={value.departamento_destino} onChange={update("departamento_destino")} disabled={disabled}><option value="">Seleccionar</option>{departamentos.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
      <label><span className={label}>Ciudad destino</span><input className={control} value={value.ciudad_destino} onChange={update("ciudad_destino")} disabled={disabled} /></label>
      <label><span className={label}>Ubicación del cliente</span><select className={control} value={value.ubicacion_cliente} onChange={update("ubicacion_cliente")} disabled={disabled}><option value="">Por definir</option>{ubicaciones.map((x) => <option key={x.id} value={x.id}>{x.alias} · {x.ciudad || departamentos.find(([code]) => code === x.departamento)?.[1]}</option>)}</select></label>
      <label><span className={label}>Sucursal INPLAZ</span><select className={control} value={value.sucursal_inplaz} onChange={update("sucursal_inplaz")} disabled={disabled}><option value="">Sin sucursal</option><option>Casa Matriz · El Alto</option><option>La Paz · Montes</option><option>Santa Cruz · Av. Paragua</option></select></label>
    </div>
    <label className="mt-1 block"><span className={label}>Observaciones comerciales</span><textarea className={`${control} min-h-16 resize-y`} value={value.observaciones_comerciales} onChange={update("observaciones_comerciales")} disabled={disabled} /></label>
    {!disabled && <div className="mt-1 flex flex-wrap gap-2"><button type="button" onClick={calcularFecha} disabled={!value.plazo_entrega_dias || saving} className="rounded-lg border border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-700 disabled:opacity-50">Calcular fecha de entrega</button><button type="button" onClick={onSave} disabled={saving} className="rounded-lg bg-blue-700 px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-50">{saving ? "Guardando…" : "Guardar condiciones"}</button></div>}
  </div>;
}
