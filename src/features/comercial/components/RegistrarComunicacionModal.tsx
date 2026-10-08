import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  useCreateComunicacion,
  useSolicitudesComerciales,
} from "../comercial.hooks";

import type {
  DireccionComunicacion,
  MedioComunicacion,
  TipoComunicacion,
} from "../comercial.types";

interface RegistrarComunicacionModalProps {
  open: boolean;
  onClose: () => void;
  solicitudInicial?: number;
  cotizacionVersionInicial?: number | null;
}

export default function RegistrarComunicacionModal({
  open,
  onClose,
  solicitudInicial,
  cotizacionVersionInicial,
}: RegistrarComunicacionModalProps) {
  const createComunicacion = useCreateComunicacion();

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

  type AccionCotizacion = "ninguna" | "enviar" | "aceptar";

  const [accionCotizacion, setAccionCotizacion] =
    useState<AccionCotizacion>("ninguna");

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

    if (
      !solicitudComercial ||
      !contenido.trim()
    ) {
      return;
    }

    try {
      await createComunicacion.mutateAsync({
        solicitud_comercial: Number(solicitudComercial),
        tipo,
        medio,
        direccion,
        asunto: asunto.trim() || null,
        contenido: contenido.trim(),
        cotizacion_version_id: cotizacionVersionInicial ?? null,
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

      onClose();
    } catch (error) {
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
              Registrar comunicación
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Registra una interacción con el cliente.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
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

          <div className="space-y-2">
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
          </div>

          {/* ======================================================
              TIPO / MEDIO
          ====================================================== */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

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
          </div>

          {/* ======================================================
              DIRECCIÓN
          ====================================================== */}

          <div className="space-y-2">
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
          </div>

          {cotizacionVersionInicial && (
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
                  Registrar aceptación
                </option>
              </select>

              <p className="text-xs text-muted-foreground">
                Cotización versión #{cotizacionVersionInicial}
              </p>
            </div>
          )}

          {/* ======================================================
              ASUNTO
          ====================================================== */}

          <div className="space-y-2">
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
          </div>

          {/* ======================================================
              CONTENIDO
          ====================================================== */}

          <div className="space-y-2">
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
          </div>

          {/* ======================================================
              ERROR
          ====================================================== */}

          {createComunicacion.isError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
              <p className="text-sm text-destructive">
                No se pudo registrar la comunicación.
                Verifica los datos e inténtalo nuevamente.
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
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                createComunicacion.isPending ||
                !solicitudComercial ||
                !contenido.trim()
              }
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createComunicacion.isPending
                ? "Guardando..."
                : "Registrar comunicación"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}