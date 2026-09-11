import { useState } from "react";
import { X } from "lucide-react";
import {
  useCreateComunicacion,
  useSolicitudesComerciales,
} from "../comercial.hooks";
import type {
  MedioComunicacion,
  TipoComunicacion,
} from "../comercial.types";

interface RegistrarComunicacionModalProps {
  open: boolean;
  onClose: () => void;
  solicitudInicial?: number;
}

export default function RegistrarComunicacionModal({
  open,
  onClose,
  solicitudInicial,
}: RegistrarComunicacionModalProps) {
  const createComunicacion = useCreateComunicacion();

  const { data: solicitudesData, isLoading: solicitudesLoading } =
    useSolicitudesComerciales();

  const solicitudes = solicitudesData?.results ?? [];

  const [solicitudComercial, setSolicitudComercial] = useState(
    solicitudInicial ? String(solicitudInicial) : "",
  );

  const [tipo, setTipo] = useState<TipoComunicacion>("enviado");
  const [medio, setMedio] = useState<MedioComunicacion>("llamada");
  const [asunto, setAsunto] = useState("");
  const [contenido, setContenido] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!solicitudComercial || !contenido.trim()) return;

    try {
      await createComunicacion.mutateAsync({
        solicitud_comercial: Number(solicitudComercial),
        tipo,
        medio,
        asunto: asunto.trim() || null,
        contenido: contenido.trim(),
      });

      setSolicitudComercial(
        solicitudInicial ? String(solicitudInicial) : "",
      );
      setTipo("enviado");
      setMedio("llamada");
      setAsunto("");
      setContenido("");

      onClose();
    } catch (error) {
      console.error("Error al registrar comunicación:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-background shadow-xl">
        {/* Header */}
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
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Solicitud */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Solicitud comercial
            </label>

            <select
              value={solicitudComercial}
              onChange={(e) => setSolicitudComercial(e.target.value)}
              disabled={solicitudesLoading || !!solicitudInicial}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              required
            >
              <option value="">
                {solicitudesLoading
                  ? "Cargando solicitudes..."
                  : "Seleccionar solicitud"}
              </option>

              {solicitudes.map((solicitud) => (
                <option key={solicitud.id} value={solicitud.id}>
                  #{solicitud.id} — {solicitud.descripcion}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo y medio */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Tipo
              </label>

              <select
                value={tipo}
                onChange={(e) =>
                  setTipo(e.target.value as TipoComunicacion)
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="enviado">Enviado</option>
                <option value="recibido">Recibido</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Medio
              </label>

              <select
                value={medio}
                onChange={(e) =>
                  setMedio(e.target.value as MedioComunicacion)
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="llamada">Llamada</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="correo">Correo</option>
                <option value="reunion">Reunión</option>
              </select>
            </div>
          </div>

          {/* Asunto */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Asunto
            </label>

            <input
              type="text"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Ej. Confirmación de medidas"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          {/* Contenido */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Contenido
            </label>

            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Describe lo conversado con el cliente..."
              rows={5}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              required
            />
          </div>

          {/* Error */}
          {createComunicacion.isError && (
            <p className="text-sm text-destructive">
              No se pudo registrar la comunicación. Verifica los datos.
            </p>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
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
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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