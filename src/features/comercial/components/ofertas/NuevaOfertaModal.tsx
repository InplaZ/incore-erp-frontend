
import { useEffect, useMemo, useState } from "react";
import { Search, X, Building2, UserRound } from "lucide-react";

import type {
  ContactoComercial,
  CuentaComercial,
} from "../../comercial.types";

import NuevaCuentaComercialWizard from "../NuevaCuentaComercialWizard";

// ============================================
// Etiquetas
// ============================================

function accountLabel(cuenta: CuentaComercial) {
  if (cuenta.tipo_persona === "juridica") {
    return (
      cuenta.nombre_comercial?.trim() ||
      cuenta.razon_social?.trim() ||
      `Cliente #${cuenta.codigo_cliente}`
    );
  }
  const persona = [
    cuenta.nombres,
    cuenta.apellido_paterno,
    cuenta.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return persona || `Cliente #${cuenta.codigo_cliente}`;
}
function companyDescription(cuenta: CuentaComercial) {
  const razonSocial = cuenta.razon_social?.trim();
  const nombreComercial = cuenta.nombre_comercial?.trim();

  if (razonSocial && nombreComercial) {
    return `${razonSocial} - ${nombreComercial}`;
  }

  return razonSocial || nombreComercial || "Sin empresa";
}


function contactLabel(contacto: ContactoComercial) {
  return [
    contacto.nombres,
    contacto.apellido_paterno,
    contacto.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();
}

// ============================================
// Componente
// ============================================

interface NuevaOfertaModalProps {
  open: boolean;
  cuentas: CuentaComercial[];
  cuentaId: number | null;
  contactoId: number | null;

  onSelect: (
    cuentaId: number | null,
    contactoId: number | null
  ) => void;

  onContinue: () => void;
  onCancel: () => void;
}

export default function NuevaOfertaModal({
  open,
  cuentas,
  cuentaId,
  contactoId,
  onSelect,
  onContinue,
  onCancel,
}: NuevaOfertaModalProps) {
  const [nuevoContacto, setNuevoContacto] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // ============================================
  // Cuenta y contacto seleccionados
  // ============================================

  const cuentaActual = cuentas.find(
    (cuenta) =>
      cuenta.id === cuentaId &&
      cuenta.estado !== "inactivo"
  );

  const contactoActual = cuentaActual?.contactos?.find(
    (contacto) =>
      contacto.id === contactoId &&
      contacto.activo
  );

  // Inicializar el buscador cuando se abre el modal.
  // No observar cuentaId/contactoId para evitar
  // borrar lo que el usuario está escribiendo.

  useEffect(() => {
    if (!open) return;

    if (cuentaActual && contactoActual) {
      setBuscar(
        `${contactLabel(contactoActual)} · ${accountLabel(cuentaActual)}`
      );
    } else if (cuentaActual) {
      setBuscar(accountLabel(cuentaActual));
    } else {
      setBuscar("");
    }

    setMostrarResultados(false);
  }, [open]);

  // ============================================
  // Búsqueda de empresas y contactos
  // ============================================


  const coincidencias = useMemo(() => {
    const query = normalize(buscar);

    const cuentasActivas = cuentas.filter(
      (cuenta) => cuenta.estado !== "inactivo"
    );

    if (!query) return cuentasActivas;

    return cuentasActivas.filter((cuenta) => {
      const esEmpresa = cuenta.tipo_persona === "juridica";

      const datosCuenta = esEmpresa
        ? [
          cuenta.nombre_comercial,
          cuenta.razon_social,
          cuenta.alias,
          String(cuenta.codigo_cliente),
        ]
        : [
          cuenta.nombres,
          cuenta.apellido_paterno,
          cuenta.apellido_materno,
          String(cuenta.codigo_cliente),
        ];

      const coincideCuenta = datosCuenta.some(
        (valor) => normalize(valor || "").includes(query)
      );

      const coincideContacto = (cuenta.contactos || []).some(
        (contacto) =>
          contacto.activo &&
          normalize(contactLabel(contacto)).includes(query)
      );

      return coincideCuenta || coincideContacto;
    });
  }, [buscar, cuentas]);


  // ============================================
  // Seleccionar empresa
  // ============================================

  const seleccionarCuenta = (cuenta: CuentaComercial) => {
    onSelect(cuenta.id, null);
    setBuscar(accountLabel(cuenta));
    setMostrarResultados(false);
  };

  // ============================================
  // Seleccionar contacto
  // ============================================

  const seleccionarContacto = (
    cuenta: CuentaComercial,
    contacto: ContactoComercial
  ) => {
    onSelect(cuenta.id, contacto.id);

    setBuscar(
      `${contactLabel(contacto)} · ${accountLabel(cuenta)}`
    );

    setMostrarResultados(false);
  };

  // ============================================
  // Limpiar selección
  // ============================================

  const limpiarBusqueda = () => {
    setBuscar("");
    onSelect(null, null);
    setMostrarResultados(true);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-3 sm:p-5">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="nueva-oferta-titulo"
          className="flex h-[70dvh] max-h-[700px] min-h-[550px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          {/* ================================= */}
          {/* HEADER */}
          {/* ================================= */}

          <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-5 sm:px-6">
            <h2
              id="nueva-oferta-titulo"
              className="font-semibold"
            >
              Nueva oferta comercial
            </h2>

            <button
              type="button"
              onClick={onCancel}
              aria-label="Cerrar"
              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          {/* ================================= */}
          {/* CONTENIDO */}
          {/* ================================= */}

          <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">

            {/* BUSCADOR */}

            <div
              className="relative"
              onBlur={(event) => {
                if (
                  !event.currentTarget.contains(
                    event.relatedTarget as Node | null
                  )
                ) {
                  setMostrarResultados(false);
                }
              }}
            >
              <label
                htmlFor="buscar-cliente-nueva-oferta"
                className="block text-xs font-semibold text-muted-foreground"
              >
                Contacto / empresa
              </label>

              <div className="relative mt-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="buscar-cliente-nueva-oferta"
                  type="search"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={mostrarResultados}
                  aria-controls="resultados-cliente-nueva-oferta"
                  value={buscar}
                  onFocus={() => setMostrarResultados(true)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setMostrarResultados(false);
                    }
                  }}
                  onChange={(event) => {
                    setBuscar(event.target.value);
                    onSelect(null, null);
                    setMostrarResultados(true);
                  }}
                  placeholder="Buscar empresa o persona de contacto..."
                  className="block w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-9 text-sm text-foreground"
                />

                {buscar && (
                  <button
                    type="button"
                    aria-label="Limpiar búsqueda"
                    onClick={limpiarBusqueda}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* ================================= */}
              {/* RESULTADOS */}
              {/* ================================= */}

              {mostrarResultados && (
                <div
                  id="resultados-cliente-nueva-oferta"
                  role="listbox"
                  aria-label="Clientes encontrados"
                  className="absolute z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lg"
                >
                  {coincidencias.length > 0 ? (
                    coincidencias.slice(0, 10).map((cuenta) => {
                      const query = normalize(buscar);

                      const esEmpresa = cuenta.tipo_persona === "juridica";

                      const contactos = (cuenta.contactos || []).filter(
                        (contacto) => contacto.activo
                      );

                      // La búsqueda de empresa NO debe incluir nombres
                      // de personas naturales ni nombres de contactos.
                      const datosEmpresa = [
                        cuenta.nombre_comercial,
                        cuenta.razon_social,
                        cuenta.alias,
                        String(cuenta.codigo_cliente),
                      ];

                      const coincideEmpresa = datosEmpresa.some(
                        (valor) => normalize(valor || "").includes(query)
                      );

                      // Coincidencias individuales de contactos.
                      const contactosCoincidentes = contactos.filter(
                        (contacto) =>
                          normalize(contactLabel(contacto)).includes(query)
                      );

                      // Persona natural: es una cuenta independiente.
                      const nombrePersona = [
                        cuenta.nombres,
                        cuenta.apellido_paterno,
                        cuenta.apellido_materno,
                      ].filter(Boolean).join(" ");

                      const coincidePersonaNatural =
                        !esEmpresa &&
                        normalize(nombrePersona).includes(query);

                      // Determinar si mostramos la cuenta.
                      const mostrarCuenta =
                        coincideEmpresa || coincidePersonaNatural;

                      // Si coincide la empresa, mostramos todos sus contactos.
                      // Si coincide una persona, solamente mostramos esa persona.
                      const contactosVisibles = coincideEmpresa
                        ? contactos
                        : contactosCoincidentes;

                      // Evitar mostrar resultados sin coincidencias.
                      if (!mostrarCuenta && contactosVisibles.length === 0) {
                        return null;
                      }

                      return (
                        <div
                          key={cuenta.id}
                          className="mb-2 overflow-hidden rounded-lg border border-border"
                        >
                          {/* PERSONA NATURAL O EMPRESA */}

                          {mostrarCuenta && (
                            <button
                              type="button"
                              role="option"
                              aria-selected={
                                cuenta.id === cuentaId && contactoId === null
                              }
                              onClick={() => seleccionarCuenta(cuenta)}
                              className="flex w-full items-start gap-3 p-3 text-left hover:bg-muted"
                            >
                              {esEmpresa ? (
                                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                              ) : (
                                <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                              )}

                              <div className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold">
                                  {accountLabel(cuenta)}
                                </span>

                                <span className="block text-xs text-muted-foreground">
                                  {esEmpresa
                                    ? cuenta.razon_social || "Empresa"
                                    : "Cuenta comercial · Persona natural"}
                                </span>

                                {esEmpresa && (
                                  <span className="mt-1 block text-[11px] text-muted-foreground">
                                    Empresa
                                  </span>
                                )}
                              </div>
                            </button>
                          )}

                          {/* CONTACTOS DE ESTA EMPRESA */}

                          {contactosVisibles.length > 0 && (
                            <div className={mostrarCuenta ? "border-t border-border" : ""}>
                              {contactosVisibles.map((contacto) => (
                                <button
                                  key={contacto.id}
                                  type="button"
                                  role="option"
                                  aria-selected={
                                    cuenta.id === cuentaId &&
                                    contacto.id === contactoId
                                  }
                                  onClick={() =>
                                    seleccionarContacto(cuenta, contacto)
                                  }
                                  className="flex w-full items-start gap-3 border-b border-border/50 px-4 py-3 pl-6 text-left last:border-b-0 hover:bg-muted"
                                >
                                  <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                                  <div className="min-w-0 flex-1">
                                    {/*Nombre*/}
                                    <span className="block text-sm font-medium">
                                      {contactLabel(contacto)}
                                    </span>
                                    {/*Razón social y nombre comerical*/}
                                    {esEmpresa && (
                                      <span className="block text-xs text-muted-foreground">
                                        {companyDescription(cuenta)}
                                      </span>
                                    )}

                                    {(contacto.area || contacto.cargo) && (
                                      <span className="mt-1 block text-[11px] text-muted-foreground">
                                        {[contacto.area, contacto.cargo]
                                          .filter(Boolean)
                                          .join(" · ")}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })


                  ) : (
                    <p className="px-3 py-3 text-sm text-muted-foreground">
                      No se encontraron clientes ni contactos.
                    </p>
                  )}
                </div>
              )}

              {/* ================================= */}
              {/* SELECCIÓN ACTUAL */}
              {/* ================================= */}

              {cuentaActual && (
                <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <span className="block text-xs font-semibold text-primary">
                    Selección actual
                  </span>

                  <span className="mt-1 block text-sm font-medium">
                    {accountLabel(cuentaActual)}
                  </span>

                  {contactoActual ? (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Contacto: {contactLabel(contactoActual)}
                    </span>
                  ) : (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Solicitud a nombre de la empresa
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* CREAR CONTACTO */}

            <button
              type="button"
              onClick={() => setNuevoContacto(true)}
              className="rounded-lg border border-primary/30 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5"
            >
              ＋ Crear contacto
            </button>
          </div>

          {/* ================================= */}
          {/* FOOTER */}
          {/* ================================= */}

          <footer className="flex shrink-0 justify-end gap-2 border-t border-border px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={onContinue}
              disabled={!cuentaId}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Crear borrador
            </button>
          </footer>
        </section>
      </div>

      {/* ================================= */}
      {/* MODAL NUEVO CONTACTO */}
      {/* ================================= */}

      <NuevaCuentaComercialWizard
        open={nuevoContacto}
        onClose={() => setNuevoContacto(false)}
        onSuccess={(id) => {
          onSelect(id, null);
          setNuevoContacto(false);
        }}
      />
    </>
  );
}
