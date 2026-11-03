import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  useCreateComunicacion,
  useCuentaComercial,
  useCotizacionVersion,
  useDocumentosCuentaComercial,
  useSolicitudesComerciales,
} from "../comercial.hooks";

import type {
  DireccionComunicacion,
  MedioComunicacion,
  TipoComunicacion,
  TipoEvidenciaAceptacion,
} from "../comercial.types";

type AccionCotizacion = "ninguna" | "enviar" | "aceptar" | "rechazar" | "cerrar";

interface RegistrarComunicacionModalProps {
  open: boolean;
  onClose: () => void;
  solicitudInicial?: number;
  cotizacionVersionInicial?: number | null;
  actividadComercialInicial?: number | null;
  accionInicial?: AccionCotizacion;
}

export default function RegistrarComunicacionModal({
  open,
  onClose,
  solicitudInicial,
  cotizacionVersionInicial,
  actividadComercialInicial,
  accionInicial = "ninguna",
}: RegistrarComunicacionModalProps) {
  const createComunicacion = useCreateComunicacion();
  const { data: cotizacionVersion } = useCotizacionVersion(cotizacionVersionInicial ?? 0);

  const {
    data: solicitudesData,
    isLoading: solicitudesLoading,
  } = useSolicitudesComerciales();

  const solicitudes = solicitudesData ?? [];

  // ============================================================
  // SOLICITUD SELECCIONADA
  // ============================================================

  const solicitudSeleccionada = solicitudes.find(
    (solicitud) => solicitud.id === solicitudInicial,
  );
  const cuentaComercialId = solicitudSeleccionada?.cuenta_comercial ?? 0;
  const { data: cuentaCliente } = useCuentaComercial(cuentaComercialId);
  const { data: documentosCuenta = [] } = useDocumentosCuentaComercial(cuentaComercialId, false);
  const contratosCuenta = documentosCuenta.filter((documento) => documento.activo && documento.tipo === "contrato");

  // ============================================================
  // ESTADOS DEL FORMULARIO
  // ============================================================

  const [solicitudComercial, setSolicitudComercial] = useState(
    solicitudInicial ? String(solicitudInicial) : "",
  );

  const [tipo, setTipo] =
    useState<TipoComunicacion>("llamada");

  const [medio, setMedio] =
    useState<MedioComunicacion>("telefono");

  const [direccion, setDireccion] =
    useState<DireccionComunicacion>("saliente");

  const [asunto, setAsunto] = useState("");

  const [contenido, setContenido] = useState("");
  const [archivoEvidencia, setArchivoEvidencia] = useState<File | null>(null);
  const [errorEnvio, setErrorEnvio] = useState("");

  const [accionCotizacion, setAccionCotizacion] =
    useState<AccionCotizacion>("ninguna");
  const [codigoErp, setCodigoErp] = useState("");
  const [tipoEvidencia, setTipoEvidencia] = useState<TipoEvidenciaAceptacion>("deposito");
  const [anticipo, setAnticipo] = useState("0");
  const [diasCredito, setDiasCredito] = useState("0");
  const [referenciaPago, setReferenciaPago] = useState("");
  const [vencimientoContrato, setVencimientoContrato] = useState("");
  const [contratoExistente, setContratoExistente] = useState("");
  const [detalleAceptacion, setDetalleAceptacion] = useState("");
  const [observacionesAceptacion, setObservacionesAceptacion] = useState("");
  const [confirmarAceptacion, setConfirmarAceptacion] = useState(false);

  // ============================================================
  // SINCRONIZAR SOLICITUD INICIAL
  // ============================================================

  useEffect(() => {
    setSolicitudComercial(
      solicitudInicial
        ? String(solicitudInicial)
        : "",
    );
  }, [solicitudInicial]);

  useEffect(() => {
    if (!open) return;
    setAccionCotizacion(accionInicial);
    setArchivoEvidencia(null);
    setErrorEnvio("");
    setConfirmarAceptacion(false);
    setDetalleAceptacion("");
    setObservacionesAceptacion("");
    setCodigoErp("");
    setAnticipo("0");
    setDiasCredito("0");
    setReferenciaPago("");
    setVencimientoContrato("");
    setContratoExistente("");
  }, [open, accionInicial]);

  // ============================================================
  // CERRAR MODAL
  // ============================================================

  if (!open) {
    return null;
  }

  // ============================================================
  // REGISTRAR COMUNICACIÓN
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const esAceptacion = Boolean(cotizacionVersionInicial && accionCotizacion === "aceptar");
    const contenidoRegistro = esAceptacion
      ? [detalleAceptacion.trim(), observacionesAceptacion.trim() && `Observaciones de aceptación / pago: ${observacionesAceptacion.trim()}`].filter(Boolean).join("\n") || `Aceptación del cliente registrada. Evidencia: ${tipoEvidencia}.`
      : contenido.trim();

    if (
      !solicitudComercial ||
      !contenidoRegistro ||
      (esAceptacion && (!codigoErp.trim() || !confirmarAceptacion || Number(anticipo || 0) > Number(cotizacionVersion?.precio_total ?? 0)))
    ) {
      if (esAceptacion && Number(anticipo || 0) > Number(cotizacionVersion?.precio_total ?? 0)) {
        setErrorEnvio("El anticipo no puede superar el importe total de la oferta.");
      }
      return;
    }

    try {
      await createComunicacion.mutateAsync({
        solicitud_comercial: Number(solicitudComercial),
        tipo,
        medio,
        direccion,
        asunto: asunto.trim() || null,
        contenido: contenidoRegistro,
        cotizacion_version_id: cotizacionVersionInicial ?? null,
        actividad_comercial_id: actividadComercialInicial ?? null,
        evidencia: archivoEvidencia,
        ...(esAceptacion ? {
          tipo_evidencia: tipoEvidencia,
          codigo_erp: codigoErp.trim(),
          anticipo_recibido: anticipo || "0",
          dias_credito: Number(diasCredito || 0),
          referencia_comprobante: referenciaPago.trim(),
          fecha_vencimiento_contrato: vencimientoContrato || null,
          documento_cuenta: contratoExistente ? Number(contratoExistente) : null,
        } : {}),
        accion_cotizacion: cotizacionVersionInicial
          ? accionCotizacion
          : "ninguna",
      });

      // ========================================================
      // LIMPIAR FORMULARIO
      // ========================================================

      setSolicitudComercial(
        solicitudInicial
          ? String(solicitudInicial)
          : "",
      );

      setTipo("llamada");
      setMedio("telefono");
      setDireccion("saliente");
      setAsunto("");
      setContenido("");
      setAccionCotizacion("ninguna");
      setArchivoEvidencia(null);
      setErrorEnvio("");
      setCodigoErp("");
      setAnticipo("0");
      setDiasCredito("0");
      setReferenciaPago("");
      setVencimientoContrato("");
      setContratoExistente("");
      setDetalleAceptacion("");
      setObservacionesAceptacion("");
      setConfirmarAceptacion(false);

      onClose();
    } catch (error) {
      const data = (error as { response?: { data?: { detail?: string; evidencia?: string[]; cotizacion?: string } } })?.response?.data;
      setErrorEnvio(data?.detail || data?.cotizacion || data?.evidencia?.join(" ") || "No se pudo registrar la comunicación.");
      console.error(
        "Error al registrar comunicación:",
        error,
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-8/12 max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-background shadow-xl">

        {/* ========================================================
            HEADER
        ======================================================== */}

        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {accionCotizacion === "aceptar" ? "Aceptación respaldada → Generar pedido" : "Registrar comunicación"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {accionCotizacion === "aceptar" ? "Completa los datos comerciales y la evidencia de aceptación del cliente." : "Registra una interacción con el cliente."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={createComunicacion.isPending}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ========================================================
            FORMULARIO
        ======================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          {/* ======================================================
              SOLICITUD
          ====================================================== */}

          {accionCotizacion !== "aceptar" && <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Solicitud comercial
            </label>

            {solicitudInicial ? (
              <div className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                <p className="text-sm font-medium text-foreground">
                  Solicitud #{solicitudInicial}
                </p>

                {solicitudSeleccionada?.descripcion && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {solicitudSeleccionada.descripcion}
                  </p>
                )}

                <p className="mt-1 text-xs text-muted-foreground">
                  Esta comunicación pertenece a esta solicitud.
                </p>
              </div>
            ) : (
              <select
                value={solicitudComercial}
                onChange={(e) =>
                  setSolicitudComercial(e.target.value)
                }
                disabled={solicitudesLoading}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                required
              >
                <option value="">
                  {solicitudesLoading
                    ? "Cargando solicitudes..."
                    : "Seleccionar solicitud"}
                </option>

                {solicitudes.map((solicitud) => (
                  <option
                    key={solicitud.id}
                    value={solicitud.id}
                  >
                    #{solicitud.id} —{" "}
                    {solicitud.descripcion}
                  </option>
                ))}
              </select>
            )}
          </div>}

          {/* ======================================================
              TIPO / MEDIO
          ====================================================== */}

          {accionCotizacion !== "aceptar" && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Tipo */}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Tipo de comunicación
              </label>

              <select
                value={tipo}
                onChange={(e) =>
                  setTipo(
                    e.target.value as TipoComunicacion,
                  )
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                <option value="llamada">
                  Llamada
                </option>

                <option value="correo">
                  Correo
                </option>

                <option value="mensaje">
                  Mensaje
                </option>

                <option value="reunion">
                  Reunión
                </option>

                <option value="visita">
                  Visita
                </option>

                <option value="otro">
                  Otro
                </option>
              </select>
            </div>

            {/* Medio */}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Medio
              </label>

              <select
                value={medio}
                onChange={(e) =>
                  setMedio(
                    e.target.value as MedioComunicacion,
                  )
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                <option value="telefono">
                  Teléfono
                </option>

                <option value="email">
                  Correo electrónico
                </option>

                <option value="whatsapp">
                  WhatsApp
                </option>

                <option value="presencial">
                  Presencial
                </option>

                <option value="videollamada">
                  Videollamada
                </option>

                <option value="otro">
                  Otro
                </option>
              </select>
            </div>
          </div>}

          {/* ======================================================
              DIRECCIÓN
          ====================================================== */}

          {accionCotizacion !== "aceptar" && <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Dirección de la comunicación
            </label>

            <select
              value={direccion}
              onChange={(e) =>
                setDireccion(
                  e.target.value as DireccionComunicacion,
                )
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
            >
              <option value="saliente">
                Ejecutivo → Cliente
              </option>

              <option value="entrante">
                Cliente → Ejecutivo
              </option>
            </select>

            <p className="text-xs text-muted-foreground">
              Indica quién inició la comunicación.
            </p>
          </div>}

          {cotizacionVersionInicial && accionCotizacion !== "aceptar" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Acción sobre la cotización
              </label>

              <select
                value={accionCotizacion}
                onChange={(e) =>
                  setAccionCotizacion(
                    e.target.value as AccionCotizacion,
                  )
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                <option value="ninguna">
                  Solo registrar comunicación
                </option>

                <option value="enviar">
                  Informar / enviar cotización
                </option>

                <option value="aceptar">
                  Registrar aceptación del cliente
                </option>
                <option value="rechazar">Rechazar oferta</option>
                <option value="cerrar">Cerrar oportunidad</option>
              </select>

              <p className="text-xs text-muted-foreground">
                Cotización versión #{cotizacionVersionInicial}
              </p>
              {(accionCotizacion === "enviar" || accionCotizacion === "rechazar") && <label className="block space-y-2 text-sm font-medium text-foreground">Adjuntar evidencia (opcional, máx. 1,5 MB)<input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(event) => { const file = event.target.files?.[0] ?? null; if (file && file.size > 1572864) { setErrorEnvio("El comprobante no puede superar 1,5 MB."); setArchivoEvidencia(null); event.target.value = ""; return; } setErrorEnvio(""); setArchivoEvidencia(file); }} className="block w-full rounded-lg border border-border bg-background p-2 text-xs" />{archivoEvidencia && <span className="block text-xs text-muted-foreground">{archivoEvidencia.name}</span>}</label>}
            </div>
          )}

          {cotizacionVersionInicial && accionCotizacion === "aceptar" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                La aceptación generará el pedido a partir de esta versión. La API actual lo crea como borrador; el envío a Producción es un paso posterior.
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border p-4"><p className="text-xs font-semibold text-muted-foreground">Oferta / versión</p><p className="mt-2 text-xl font-bold">OF-{String(cotizacionVersion?.cotizacion ?? "—").padStart(4, "0")} / V{cotizacionVersion?.version ?? "—"}</p></div>
                <div className="rounded-xl border border-border p-4"><p className="text-xs font-semibold text-muted-foreground">Total</p><p className="mt-2 text-xl font-bold">{cotizacionVersion?.moneda ?? "Bs"} {Number(cotizacionVersion?.precio_total ?? 0).toLocaleString("es-BO", { minimumFractionDigits: 2 })}</p></div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-semibold text-muted-foreground">Tipo de documento<input readOnly value={cuentaCliente?.documento_identidad?.toUpperCase() ?? ""} placeholder="Sin documento registrado en la cuenta" className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm font-normal text-foreground" /></label>
                <label className="space-y-1 text-xs font-semibold text-muted-foreground">N.º documento cliente<input readOnly value={cuentaCliente?.numero_documento ?? ""} placeholder="Sin documento registrado en la cuenta" className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm font-normal text-foreground" /></label>
                <label className="space-y-1 text-xs font-semibold text-muted-foreground">Código ERP (obligatorio)<input required value={codigoErp} onChange={e => setCodigoErp(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal text-foreground" /></label>
                <label className="space-y-1 text-xs font-semibold text-muted-foreground">Evidencia de aceptación<select value={tipoEvidencia} onChange={e => setTipoEvidencia(e.target.value as TipoEvidenciaAceptacion)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal text-foreground">{[["deposito","Depósito"],["contrato","Contrato"],["licitacion","Licitación"],["orden_compra","Orden de compra"],["email","Correo"],["whatsapp","WhatsApp"],["otro","Otro"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label>
                <label className="space-y-1 text-xs font-semibold text-muted-foreground">Anticipo recibido ({cotizacionVersion?.moneda === "BOB" ? "Bs" : cotizacionVersion?.moneda ?? "Bs"})<input type="number" min="0" step="0.01" value={anticipo} onChange={e => setAnticipo(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal text-foreground" /></label>
                <label className="space-y-1 text-xs font-semibold text-muted-foreground">Días de crédito<input type="number" min="0" value={diasCredito} onChange={e => setDiasCredito(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal text-foreground" /></label>
                <label className="space-y-1 text-xs font-semibold text-muted-foreground">Referencia de comprobante / contrato<input value={referenciaPago} onChange={e => setReferenciaPago(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal text-foreground" /></label>
                <label className="space-y-1 text-xs font-semibold text-muted-foreground">Fecha vencimiento del contrato<input type="date" value={vencimientoContrato} onChange={e => setVencimientoContrato(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal text-foreground" /></label>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">Anticipo: {cotizacionVersion?.precio_total ? (Number(anticipo || 0) / Number(cotizacionVersion.precio_total) * 100).toFixed(2) : "0.00"}% del importe total · Saldo: Bs {Math.max(0, Number(cotizacionVersion?.precio_total ?? 0) - Number(anticipo || 0)).toLocaleString("es-BO", { minimumFractionDigits: 2 })}</div>
              <label className="block space-y-1 text-xs font-semibold text-muted-foreground">Contrato existente (si aplica; no subirlo otra vez)<select value={contratoExistente} onChange={e => { const id = e.target.value; setContratoExistente(id); const documento = contratosCuenta.find(item => item.id === Number(id)); setReferenciaPago(documento?.referencia ?? ""); setVencimientoContrato(documento?.vigencia_hasta ?? ""); }} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal text-foreground"><option value="">Adjuntar nueva evidencia / no utilizar contrato existente</option>{contratosCuenta.map(documento => <option key={documento.id} value={documento.id}>{documento.referencia || documento.nombre_archivo}{documento.vigencia_hasta ? ` · vence ${documento.vigencia_hasta}` : ""}</option>)}</select></label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-semibold text-muted-foreground">Medio / tipo de evidencia<select value={medio} onChange={e => setMedio(e.target.value as MedioComunicacion)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal text-foreground"><option value="whatsapp">WhatsApp</option><option value="email">Correo electrónico</option><option value="telefono">Teléfono</option><option value="presencial">Presencial</option><option value="videollamada">Videollamada</option><option value="otro">Otro</option></select></label>
                <label className="space-y-1 text-xs font-semibold text-muted-foreground">Adjuntar comprobante / captura (máx. 1,5 MB)<input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={event => { const file = event.target.files?.[0] ?? null; if (file && file.size > 1572864) { setErrorEnvio("El comprobante no puede superar 1,5 MB."); setArchivoEvidencia(null); event.target.value = ""; return; } setErrorEnvio(""); setArchivoEvidencia(file); }} className="block w-full rounded-lg border border-border bg-background p-2 text-xs font-normal text-foreground" /></label>
              </div>
              <label className="block space-y-1 text-xs font-semibold text-muted-foreground">Detalle del envío o confirmación<textarea value={detalleAceptacion} onChange={e => setDetalleAceptacion(e.target.value)} rows={3} placeholder="Ej. Confirmó la aceptación por WhatsApp..." className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal text-foreground" /></label>
              <label className="block space-y-1 text-xs font-semibold text-muted-foreground">Observaciones de aceptación / pago<textarea value={observacionesAceptacion} onChange={e => setObservacionesAceptacion(e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal text-foreground" /></label>
              <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={confirmarAceptacion} onChange={e => setConfirmarAceptacion(e.target.checked)} className="mt-1" /><span>Verifiqué la aceptación y autorizo registrar la aceptación y crear el pedido.</span></label>
            </div>
          )}

          {/* ======================================================
              ASUNTO
          ====================================================== */}

          {accionCotizacion !== "aceptar" && <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Asunto
            </label>
            <input
              type="text"
              value={asunto}
              onChange={(e) =>
                setAsunto(e.target.value)
              }
              placeholder="Ej. Confirmación de medidas"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>}

          {/* ======================================================
              CONTENIDO
          ====================================================== */}

          {accionCotizacion !== "aceptar" && <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Contenido
            </label>

            <textarea
              value={contenido}
              onChange={(e) =>
                setContenido(e.target.value)
              }
              placeholder="Describe lo conversado con el cliente..."
              rows={5}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20"
              required
            />
          </div>}

          {/* ======================================================
              ERROR
          ====================================================== */}

          {(createComunicacion.isError || errorEnvio) && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
              <p className="text-sm text-destructive">
                {errorEnvio || "No se pudo registrar la comunicación. Verifica los datos e inténtalo nuevamente."}
              </p>
            </div>
          )}

          {/* ======================================================
              BOTONES
          ====================================================== */}

          <div className="flex justify-end gap-3 border-t border-border pt-4">

            <button
              type="button"
              onClick={onClose}
              disabled={createComunicacion.isPending}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                createComunicacion.isPending ||
                !solicitudComercial ||
                (accionCotizacion === "aceptar" ? !codigoErp.trim() || !confirmarAceptacion : !contenido.trim())
              }
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createComunicacion.isPending
                ? "Guardando..."
                : accionCotizacion === "aceptar" ? "Registrar aceptación y generar pedido" : "Registrar comunicación"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
