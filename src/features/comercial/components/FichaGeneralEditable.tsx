import { useEffect, useState, type FormEvent } from "react";
import { Building2, CalendarDays, Check, LoaderCircle, Save } from "lucide-react";
import { useUpdateCuentaComercial } from "../comercial.hooks";
import { useEjecutivosComerciales } from "../comercial.hooks";
import type { CuentaComercial, CuentaComercialUpdate } from "../comercial.types";
import Toast from "@/components/ui/Toast";
const control = "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";
const label = "block text-xs font-semibold text-muted-foreground";

function datosIniciales(cuenta: CuentaComercial): CuentaComercialUpdate {
  return {
    documento_identidad: cuenta.documento_identidad,
    numero_documento: cuenta.numero_documento,
    nombre_comercial: cuenta.nombre_comercial,
    razon_social: cuenta.razon_social,
    alias: cuenta.alias,
    estado: cuenta.estado,
    etapa_crm: cuenta.etapa_crm,
    nombres: cuenta.nombres,
    apellido_paterno: cuenta.apellido_paterno,
    apellido_materno: cuenta.apellido_materno,
    telefono: cuenta.telefono,
    correo: cuenta.correo,
    direccion: cuenta.direccion,
    ejecutivo_asignado: cuenta.ejecutivo_asignado ?? null,
    codigo_cliente: cuenta.codigo_cliente ?? null,
  };
}

export default function FichaGeneralEditable({ cuenta }: { cuenta: CuentaComercial }) {
  const [toast, setToast] = useState({
    open: false,
    title: "",
    description: "",
  })
  const update = useUpdateCuentaComercial();
  const [form, setForm] = useState<CuentaComercialUpdate>(() => datosIniciales(cuenta));
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");
  const { data: ejecutivos = [], isLoading: cargandoEjecutivos } =
    useEjecutivosComerciales();

  useEffect(() => {
    setForm(datosIniciales(cuenta));
    setGuardado(false);
  }, [cuenta]);

  const set = <K extends keyof CuentaComercialUpdate>(key: K, value: CuentaComercialUpdate[K]) => {
    setForm(current => ({ ...current, [key]: value }));
    setGuardado(false);
    setError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await update.mutateAsync({ id: cuenta.id, data: form });

      setToast({
        open: true,
        title: "Ficha general actualizada",
        description: "Los cambios se guardaron correctamente.",
      });
    } catch {
      setToast({
        open: true,
        title: "Error al guardar",
        description: "No se pudo actualizar la ficha general.",
      });
    }
  };

  return (
    <section id="ficha-comercial" className="overflow-hidden rounded-xl border border-border bg-card">
      <header className="border-b border-border px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Building2 className="h-4 w-4" /></span>
          <div>
            <h2 className="text-base font-semibold text-foreground">Ficha comercial editable · {cuenta.nombre_comercial || cuenta.razon_social || "Cuenta"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Edita los datos de la cuenta y guarda los cambios directamente en INCORE.</p>
          </div>
        </div>
      </header>
      <form onSubmit={submit}>
        <div className="grid gap-x-4 gap-y-4 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
          <label className={label}>Tipo de persona<input className={`${control} cursor-not-allowed`} value={cuenta.tipo_persona === "juridica" ? "Persona jurídica" : "Persona natural"} readOnly /></label>
          <label className={label}>Tipo de documento<select className={control} value={form.documento_identidad ?? ""} onChange={e => set("documento_identidad", (e.target.value || null) as CuentaComercialUpdate["documento_identidad"])}><option value="">Sin documento</option><option value="nit">NIT</option><option value="ci">CI</option></select></label>
          <label className={label}>Número de documento<input className={control} maxLength={10} value={form.numero_documento ?? ""} onChange={e => set("numero_documento", e.target.value)} /></label>
          <label className={label}>Nombre comercial<input className={control} maxLength={200} value={form.nombre_comercial ?? ""} onChange={e => set("nombre_comercial", e.target.value)} /></label>
          <label className={label}>Razón social<input className={control} maxLength={200} value={form.razon_social ?? ""} onChange={e => set("razon_social", e.target.value)} /></label>
          <label className={label}>Alias<input className={control} maxLength={100} value={form.alias ?? ""} onChange={e => set("alias", e.target.value)} /></label>
          <label className={label}>
            Código de cliente
            <input
              className={control}
              type="number"
              min="1"
              step="1"
              value={form.codigo_cliente ?? ""}
              onChange={e =>
                set(
                  "codigo_cliente",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              placeholder="Ej. 1010"
            />
            <span className="mt-1 block text-[11px] font-normal">
              Código asignado por el sistema de ventas de INPLAZ.
            </span>
          </label>
          <label className={label}>
            Etapa
            <select
              className={control}
              value={form.etapa_crm ?? ""}
              onChange={e =>
                set("etapa_crm", e.target.value as CuentaComercialUpdate["etapa_crm"])
              }
            >
              <option value="contacto">Contacto</option>
              <option value="lead">Lead</option>
              <option value="oportunidad">Oportunidad</option>
              <option value="cliente">Cliente</option>
            </select>
            <span className="mt-1 block text-[11px] font-normal">
              Clasificación comercial de la cuenta.
            </span>
          </label>
          <label className={label}>Teléfono general<input className={control} maxLength={30} type="tel" value={form.telefono ?? ""} onChange={e => set("telefono", e.target.value)} /></label>
          <label className={label}>Correo general<input className={control} type="email" value={form.correo ?? ""} onChange={e => set("correo", e.target.value)} /></label>
          <label className={`${label} lg:col-span-2`}>Dirección general<input className={control} maxLength={300} value={form.direccion ?? ""} onChange={e => set("direccion", e.target.value)} /></label>
          <label className={label}>
            Ejecutivo comercial
            <select
              className={control}
              value={form.ejecutivo_asignado ?? ""}
              onChange={e =>
                set(
                  "ejecutivo_asignado",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              disabled={cargandoEjecutivos}
            >
              <option value="">
                Sin ejecutivo asignado
              </option>

              {ejecutivos.map(ejecutivo => (
                <option key={ejecutivo.id} value={ejecutivo.id}>
                  {ejecutivo.username}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end text-xs text-muted-foreground"><CalendarDays className="mr-2 mb-3 h-4 w-4 shrink-0" />Alta registrada: {new Date(cuenta.fecha_alta).toLocaleDateString("es-BO")}</div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 sm:px-6">
          <p className="text-xs text-muted-foreground">Los contactos y las direcciones se administran en las secciones siguientes.</p>
          <div className="flex items-center gap-3">
            {guardado && <span role="status" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700"><Check className="h-4 w-4" />Guardado</span>}
            {error && <span role="alert" className="text-sm text-destructive">{error}</span>}
            <button type="submit" disabled={update.isPending} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">
              {update.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {update.isPending ? "Guardando…" : "Guardar ficha general"}
            </button>
          </div>
        </div>
        <Toast
          open={toast.open}
          title={toast.title}
          description={toast.description}
          onClose={() => setToast(prev => ({ ...prev, open: false }))}
        />
      </form>
    </section>
  );
}

