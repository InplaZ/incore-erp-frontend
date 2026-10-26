import { useState } from "react";
import { Building2, Plus, Trash2, X } from "lucide-react";
import { useCreateCuentaCRM } from "../comercial.hooks";
import type {
  CuentaComercialCreate,
  ContactoCRMInicial,
  DepartamentoBolivia,
  EtapaCRM,
  UbicacionCRMInicial,
} from "../comercial.types";

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const labelClass = "mb-1.5 block text-xs font-semibold text-muted-foreground";
const emptyContact = (): ContactoCRMInicial => ({ nombres: "", apellido_paterno: "", apellido_materno: "", cargo: "", area: "", telefono: "", correo: "", direccion: "", es_principal: true });
const emptyLocation = (): UbicacionCRMInicial => ({ alias: "", departamento: "" as DepartamentoBolivia, ciudad: "", direccion: "", latitud: null, longitud: null, principal: true });
const departments: [DepartamentoBolivia, string][] = [["LP", "La Paz"], ["CB", "Cochabamba"], ["SC", "Santa Cruz"], ["OR", "Oruro"], ["PT", "Potosí"], ["CH", "Chuquisaca"], ["TJ", "Tarija"], ["BN", "Beni"], ["PD", "Pando"]];

export default function NuevaCuentaComercialWizard({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: (id: number) => void }) {
  const create = useCreateCuentaCRM();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [cuenta, setCuenta] = useState<CuentaComercialCreate>({ tipo_persona: "juridica", documento_identidad: "nit", numero_documento: "", nombres: "", apellido_paterno: "", apellido_materno: "", razon_social: "", nombre_comercial: "", alias: "", etapa_crm: "contacto", estado: "prospecto", tipo_relacion: "cliente", fecha_alta: new Date().toISOString(), telefono: "", correo: "", direccion: "" });
  const [contactos, setContactos] = useState<ContactoCRMInicial[]>([]);
  const [ubicaciones, setUbicaciones] = useState<UbicacionCRMInicial[]>([]);
  if (!open) return null;

  const updateCuenta = <K extends keyof CuentaComercialCreate>(key: K, value: CuentaComercialCreate[K]) => setCuenta(current => ({ ...current, [key]: value }));
  const submit = async () => {
    setError("");
    if (contactos.some(persona => !persona.nombres.trim())) { setError("Completa el nombre de cada persona agregada."); setStep(2); return; }
    if (ubicaciones.some(site => !site.alias.trim() || !site.departamento)) { setError("Completa el nombre y departamento de cada ubicación o elimínala."); setStep(3); return; }
    try {
      const result = await create.mutateAsync({ cuenta, contactos: contactos.map(persona => ({ ...persona, es_principal: persona.es_principal })), ubicaciones });
      onSuccess(result.cuenta.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la cuenta. Revisa los datos e inténtalo nuevamente.");
    }
  };
  const changeContact = (index: number, patch: Partial<ContactoCRMInicial>) => setContactos(items => items.map((item, i) => ({ ...item, ...(i === index ? patch : {}), ...(patch.es_principal ? { es_principal: i === index } : {}) })));
  const changeLocation = (index: number, patch: Partial<UbicacionCRMInicial>) => setUbicaciones(items => items.map((item, i) => ({ ...item, ...(i === index ? patch : {}), ...(patch.principal ? { principal: i === index } : {}) })));

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
    <section className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
      <header className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></span><div><p className="text-xs font-semibold uppercase tracking-wide text-primary">Agenda comercial · INCORE</p><h2 className="mt-1 text-lg font-bold text-foreground">Nuevo contacto · {step}. {(["Información general", "Personas", "Direcciones"] as const)[step - 1]}</h2></div></div>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><X className="h-5 w-5" /></button>
      </header>
      <nav aria-label="Pasos de creación" className="flex gap-2 px-5 pt-4 sm:px-6">{["Información general", "Personas", "Direcciones"].map((name, i) => <span key={name} className={`rounded-full px-3 py-2 text-[11px] font-bold ${step === i + 1 ? "bg-primary/10 text-primary" : step > i + 1 ? "bg-emerald-500/10 text-emerald-700" : "bg-secondary text-muted-foreground"}`}>{i + 1}. {name}</span>)}</nav>
      <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        {step === 1 && <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo de documento"><select className={inputClass} value={cuenta.documento_identidad ?? "nit"} onChange={e => updateCuenta("documento_identidad", e.target.value as CuentaComercialCreate["documento_identidad"])}>
            <option value="nit">NIT</option>
            <option value="ci">CI</option>
            <option value="ruce">RUCE</option>
            <option value="otro">OTRO</option>
            
            </select></Field>
          <Field label="Número de documento (opcional antes del primer pedido)"><input className={inputClass} value={cuenta.numero_documento ?? ""} onChange={e => updateCuenta("numero_documento", e.target.value)} /></Field>
          <Field label="Nombre comercial *"><input autoFocus required className={inputClass} value={cuenta.nombre_comercial ?? ""} onChange={e => updateCuenta("nombre_comercial", e.target.value)} /></Field>
          <Field label="Razón social"><input className={inputClass} value={cuenta.razon_social ?? ""} onChange={e => updateCuenta("razon_social", e.target.value)} /></Field>
          <Field label="Alias"><input className={inputClass} value={cuenta.alias ?? ""} onChange={e => updateCuenta("alias", e.target.value)} /></Field>
          <Field label="Etapa"><select className={inputClass} value={cuenta.etapa_crm ?? "contacto"} onChange={e => updateCuenta("etapa_crm", e.target.value as EtapaCRM)}><option value="contacto">Contacto</option><option value="lead">Lead</option><option value="oportunidad">Oportunidad</option></select></Field>
          {cuenta.tipo_persona === "natural" && <><Field label="Nombres"><input className={inputClass} value={cuenta.nombres ?? ""} onChange={e => updateCuenta("nombres", e.target.value)} /></Field><Field label="Apellido paterno"><input className={inputClass} value={cuenta.apellido_paterno ?? ""} onChange={e => updateCuenta("apellido_paterno", e.target.value)} /></Field></>}
          <div className="sm:col-span-2 rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-xs leading-5 text-muted-foreground">Se revisarán posibles coincidencias de empresa, documento y contactos. Las cuentas históricas conservan su estado comercial actual.</div>
        </div>}
        {step === 2 && <div className="space-y-4"><p className="text-sm text-muted-foreground">Añade interlocutores asociados a la cuenta. Esta sección es opcional y el contacto principal se utiliza como referencia en el listado.</p>{contactos.length === 0 && <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">No hay personas agregadas. Puedes continuar y añadirlas después.</div>}{contactos.map((person, i) => <article key={i} className="rounded-xl border border-border p-4"><div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold text-foreground">Persona {i + 1}</span><div className="flex items-center gap-3"><label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="radio" checked={person.es_principal} onChange={() => changeContact(i, { es_principal: true })} />Principal</label><button type="button" onClick={() => setContactos(items => { const next = items.filter((_, index) => index !== i); if (!next.some(item => item.es_principal) && next.length) next[0].es_principal = true; return next; })} aria-label="Quitar persona" className="rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button></div></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Nombres *"><input className={inputClass} value={person.nombres} onChange={e => changeContact(i, { nombres: e.target.value })} /></Field><Field label="Apellidos"><input className={inputClass} value={[person.apellido_paterno, person.apellido_materno].filter(Boolean).join(" ")} onChange={e => { const [paterno = "", ...rest] = e.target.value.split(" "); changeContact(i, { apellido_paterno: paterno, apellido_materno: rest.join(" ") }); }} /></Field><Field label="Cargo"><input className={inputClass} value={person.cargo} onChange={e => changeContact(i, { cargo: e.target.value })} /></Field><Field label="Área"><input className={inputClass} value={person.area} onChange={e => changeContact(i, { area: e.target.value })} /></Field><Field label="Teléfono"><input className={inputClass} value={person.telefono} onChange={e => changeContact(i, { telefono: e.target.value })} /></Field><Field label="Correo"><input className={inputClass} type="email" value={person.correo} onChange={e => changeContact(i, { correo: e.target.value })} /></Field></div></article>)}<button type="button" onClick={() => setContactos(items => [...items, { ...emptyContact(), es_principal: items.length === 0 }])} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-primary"><Plus className="h-4 w-4" />Agregar persona</button></div>}
        {step === 3 && <div className="space-y-4"><div><h3 className="text-sm font-semibold text-foreground">Direcciones de entrega</h3><p className="mt-1 text-sm text-muted-foreground">Son opcionales; puedes agregarlas ahora o desde la ficha de la cuenta.</p></div>{ubicaciones.map((site, i) => <article key={i} className="rounded-xl border border-border p-4"><div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold">Ubicación {i + 1}</span><div className="flex items-center gap-3"><label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="radio" checked={site.principal} onChange={() => changeLocation(i, { principal: true })} />Principal</label><button type="button" onClick={() => setUbicaciones(items => items.filter((_, index) => index !== i))} aria-label="Quitar ubicación" className="rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button></div></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Nombre de sucursal *"><input className={inputClass} value={site.alias} onChange={e => changeLocation(i, { alias: e.target.value })} /></Field><Field label="Departamento *"><select className={inputClass} value={site.departamento} onChange={e => changeLocation(i, { departamento: e.target.value as DepartamentoBolivia })}><option value="">Seleccionar departamento</option>{departments.map(([code, title]) => <option key={code} value={code}>{title}</option>)}</select></Field><Field label="Ciudad"><input className={inputClass} value={site.ciudad} onChange={e => changeLocation(i, { ciudad: e.target.value })} /></Field><Field label="Dirección"><input className={inputClass} value={site.direccion} onChange={e => changeLocation(i, { direccion: e.target.value })} /></Field><Field label="Latitud (opcional)"><input className={inputClass} type="number" min="-90" max="90" step="0.000001" value={site.latitud ?? ""} onChange={e => changeLocation(i, { latitud: e.target.value || null })} /></Field><Field label="Longitud (opcional)"><input className={inputClass} type="number" min="-180" max="180" step="0.000001" value={site.longitud ?? ""} onChange={e => changeLocation(i, { longitud: e.target.value || null })} /></Field></div></article>)}<button type="button" onClick={() => setUbicaciones(items => [...items, { ...emptyLocation(), principal: items.length === 0 }])} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-primary"><Plus className="h-4 w-4" />Agregar dirección</button></div>}
        {error && <p role="alert" className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
        {create.isError && !error && <p role="alert" className="mt-4 text-sm text-destructive">No se pudo crear la cuenta. Verifica la información o posibles duplicados.</p>}
      </div>
      <footer className="flex justify-end gap-2 border-t border-border px-5 py-4 sm:px-6"><button type="button" onClick={step === 1 ? onClose : () => { setError(""); setStep(s => s - 1); }} className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground">{step === 1 ? "Cancelar" : "Atrás"}</button>{step < 3 ? <button type="button" onClick={() => { setError(""); if (step === 1 && !cuenta.nombre_comercial?.trim()) { setError("Ingresa el nombre comercial."); return; } if (step === 2 && contactos.some(persona => !persona.nombres.trim())) { setError("Completa el nombre de cada persona agregada."); return; } setStep(s => s + 1); }} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Siguiente →</button> : <button type="button" onClick={submit} disabled={create.isPending} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{create.isPending ? "Guardando…" : "Crear cuenta"}</button>}</footer>
    </section>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block min-w-0"><span className={labelClass}>{label}</span>{children}</label>; }
