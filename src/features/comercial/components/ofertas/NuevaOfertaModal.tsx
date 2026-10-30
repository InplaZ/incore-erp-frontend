import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { CuentaComercial } from "../../comercial.types";
import NuevaCuentaComercialWizard from "../NuevaCuentaComercialWizard";

function accountLabel(cuenta: CuentaComercial) {
  const persona = [cuenta.nombres, cuenta.apellido_paterno, cuenta.apellido_materno].filter(Boolean).join(" ").trim();
  const company = cuenta.razon_social?.trim() || persona || `Cliente #${cuenta.codigo_cliente}`;
  const contacto = cuenta.contacto_principal;
  const contactName = contacto ? [contacto.nombres, contacto.apellido_paterno, contacto.apellido_materno].filter(Boolean).join(" ").trim() : "";
  return contactName && company !== contactName ? `${contactName} · ${company}` : company;
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();
}

export default function NuevaOfertaModal({
  open,
  cuentas,
  cuentaId,
  onSelect,
  onContinue,
  onCancel,
}: {
  open: boolean;
  cuentas: CuentaComercial[];
  cuentaId: number | null;
  onSelect: (id: number | null) => void;
  onContinue: () => void;
  onCancel: () => void;
}) {
  const [nuevoContacto, setNuevoContacto] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const cuentaActual = cuentas.find((cuenta) => cuenta.id === cuentaId && cuenta.estado !== "inactivo");
  const coincidencias = useMemo(() => {
    const query = normalize(buscar);
    const cuentasActivas = cuentas.filter((cuenta) => cuenta.estado !== "inactivo");
    if (!query) return cuentasActivas;
    return cuentasActivas.filter((cuenta) => {
      const nombreCompleto = [cuenta.nombres, cuenta.apellido_paterno, cuenta.apellido_materno].filter(Boolean).join(" ");
      return [nombreCompleto, cuenta.razon_social, cuenta.nombre_comercial, accountLabel(cuenta), String(cuenta.codigo_cliente)]
        .some((value) => normalize(value || "").includes(query));
    });
  }, [buscar, cuentas]);

  useEffect(() => {
    if (cuentaActual) setBuscar(accountLabel(cuentaActual));
  }, [cuentaActual?.id]);
  if (!open) return null;

  return <>
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-3 sm:p-5 ">
<section
  role="dialog"
  aria-modal="true"
  aria-labelledby="nueva-oferta-titulo"
  className="flex h-[70dvh] max-h-[700px] min-h-[550px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
>
        <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-5 sm:px-6">
          <h2 id="nueva-oferta-titulo" className="font-semibold">Nueva oferta comercial</h2>
          <button type="button" onClick={onCancel} aria-label="Cerrar" className="rounded-md p-1 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
          <div className="relative" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setMostrarResultados(false); }}>
            <label htmlFor="buscar-cliente-nueva-oferta" className="block text-xs font-semibold text-muted-foreground">Contacto / empresa</label>
            <div className="relative mt-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input id="buscar-cliente-nueva-oferta" type="search" role="combobox" aria-autocomplete="list" aria-expanded={mostrarResultados} aria-controls="resultados-cliente-nueva-oferta" value={buscar} onFocus={() => setMostrarResultados(true)} onKeyDown={(event) => { if (event.key === "Escape") setMostrarResultados(false); }} onChange={(event) => { setBuscar(event.target.value); onSelect(null); setMostrarResultados(true); }} placeholder="Buscar por nombre completo o razón social..." className="block w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-9 text-sm text-foreground" />
              {buscar && <button type="button" aria-label="Limpiar búsqueda" onClick={() => { setBuscar(""); onSelect(null); setMostrarResultados(true); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="h-4 w-4" /></button>}
            </div>
            {mostrarResultados && <div id="resultados-cliente-nueva-oferta" role="listbox" aria-label="Clientes encontrados" className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lg">
              {coincidencias.length ? coincidencias.slice(0, 10).map((cuenta) => <button key={cuenta.id} type="button" role="option" aria-selected={cuenta.id === cuentaId} onClick={() => { onSelect(cuenta.id); setBuscar(accountLabel(cuenta)); setMostrarResultados(false); }} className="flex w-full flex-col items-start rounded-md px-3 py-2 text-left hover:bg-muted focus:bg-muted focus:outline-none">
                <span className="text-sm font-medium text-foreground">{accountLabel(cuenta)}</span><span className="text-xs text-muted-foreground">Cliente #{cuenta.codigo_cliente}</span>
              </button>) : <p className="px-3 py-2 text-sm text-muted-foreground">No se encontraron clientes.</p>}
            </div>}
            {cuentaActual && <p className="mt-1.5 text-xs text-primary">Cliente seleccionado: {accountLabel(cuentaActual)}</p>}
          </div>
          <button type="button" onClick={() => setNuevoContacto(true)} className="rounded-lg border border-primary/30 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5">＋ Crear contacto</button>
        </div>
        <footer className="flex shrink-0 justify-end gap-2 border-t border-border px-5 py-4 sm:px-6">
          <button type="button" onClick={onCancel} className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium">Cancelar</button>
          <button type="button" onClick={onContinue} disabled={!cuentaId} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">Crear borrador</button>
        </footer>
      </section>
    </div>
    <NuevaCuentaComercialWizard open={nuevoContacto} onClose={() => setNuevoContacto(false)} onSuccess={(id) => { onSelect(id); setNuevoContacto(false); }} />
  </>;
}
