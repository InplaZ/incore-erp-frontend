
import { useEffect, useState } from "react";
import { Download, Plus, Eye, X } from "lucide-react";
import { cotizacionesVersionesApi } from "../../comercial.api";
import { useOfertaSeguimiento } from "../../comercial.hooks";
import RegistrarComunicacionModal from "../RegistrarComunicacionModal";

const eventTone: Record<string, string> = {
  version: "bg-amber-500",
  actividad: "bg-amber-500",
  comunicacion: "bg-sky-600",
  envio: "bg-sky-600",
  seguimiento: "bg-teal-600",
  aceptacion: "bg-emerald-600",
  rechazo: "bg-rose-600",
};

type EvidenciaPreview = {
  url: string;
  nombre: string;
};
// Función para determinar si un archivo es una imagen
const esImagen = (archivo: Blob, nombre: string) =>
  archivo.type.startsWith("image/") ||
  /\.(png|jpe?g|webp|gif)$/i.test(nombre);

export default function OfertaSeguimientoTimeline({
  versionId,
  solicitudId,
}: {
  versionId: number;
  solicitudId: number;
}) {
  const { data: eventos = [], isLoading, isError } =
    useOfertaSeguimiento(versionId);

  const [mostrarContacto, setMostrarContacto] = useState(false);
  const [errorDescarga, setErrorDescarga] = useState("");
  const [evidenciaPreview, setEvidenciaPreview] =
    useState<EvidenciaPreview | null>(null);

  // Liberar la URL temporal al cerrar o cambiar la imagen.
  useEffect(() => {
    return () => {
      if (evidenciaPreview?.url) {
        URL.revokeObjectURL(evidenciaPreview.url);
      }
    };
  }, [evidenciaPreview]);

  const obtenerArchivo = async (
    versionEventoId: number,
    evidenciaId: number
  ) => {
    return await cotizacionesVersionesApi.descargarEvidencia(
      versionEventoId,
      evidenciaId
    );
  };

  // Función para descargar un archivo
  const descargarArchivo = (archivo: Blob, nombre: string) => {
    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = nombre;
    enlace.click();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Función para abrir una evidencia
  const abrirEvidencia = async (
    versionEventoId: number,
    evidenciaId: number,
    nombre: string
  ) => {
    try {
      setErrorDescarga("");

      const archivo = await obtenerArchivo(versionEventoId, evidenciaId);

      if (esImagen(archivo, nombre)) {
        const url = URL.createObjectURL(archivo);
        setEvidenciaPreview({ url, nombre });
      } else {
        // Los archivos que no son imágenes conservan la descarga.
        descargarArchivo(archivo, nombre);
      }
    } catch {
      setErrorDescarga(
        "No se pudo abrir la evidencia. Intenta nuevamente."
      );
    }
  };

  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Línea de tiempo comercial
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Eventos vinculados a esta oferta y sus versiones
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMostrarContacto(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2.5 text-xs font-semibold text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          Registrar contacto
        </button>
      </div>

      {errorDescarga && (
        <p role="alert" className="mt-3 text-xs text-rose-700">
          {errorDescarga}
        </p>
      )}

      {isLoading ? (
        <p className="py-10 text-center text-sm text-slate-500">
          Cargando seguimiento…
        </p>
      ) : isError ? (
        <p role="alert" className="py-10 text-center text-sm text-rose-700">
          No se pudo cargar la línea de tiempo.
        </p>
      ) : eventos.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          Aún no hay eventos para esta oferta.
        </p>
      ) : (
        <ol className="relative mt-5 space-y-5 border-l border-slate-200 pl-5">
          {eventos.map((evento) => (
            <li key={evento.id} className="relative min-w-0">
              <span
                className={`absolute -left-[25px] top-1 h-3 w-3 rounded-full border-2 border-white ring-1 ring-slate-200 ${
                  eventTone[evento.categoria] || "bg-slate-500"
                }`}
              />

              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <h3 className="text-xs font-bold text-slate-900">
                    {evento.titulo}
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    V{String(evento.version_numero).padStart(2, "0")}
                  </span>
                  {evento.estado && (
                    <span className="text-[10px] text-slate-500">
                      · {evento.estado}
                    </span>
                  )}
                </div>

                <p className="mt-1 break-words text-[11px] text-slate-600">
                  {evento.descripcion}
                </p>

                {evento.resultado && (
                  <p className="mt-1 text-[10px] text-slate-600">
                    <span className="font-semibold">Resultado:</span>{" "}
                    {evento.resultado}
                  </p>
                )}

                {evento.fecha_proxima && (
                  <p className="mt-1 text-[10px] text-teal-700">
                    <span className="font-semibold">
                      Próximo seguimiento:
                    </span>{" "}
                    {new Date(evento.fecha_proxima).toLocaleString("es-BO", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                )}

                <p className="mt-1 flex flex-wrap items-center gap-x-1 text-[10px] text-slate-500">
                  <span>{evento.canal || evento.categoria}</span>
                  <span>·</span>
                  <time dateTime={evento.fecha}>
                    {new Date(evento.fecha).toLocaleString("es-BO", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                  <span>·</span>
                  <span>{evento.usuario}</span>
                </p>

                {evento.evidencias.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {evento.evidencias.map((evidencia) => (
                      <button
                        key={evidencia.id}
                        type="button"
                        onClick={() =>
                          void abrirEvidencia(
                            evento.version_id,
                            evidencia.id,
                            evidencia.nombre
                          )
                        }
                        className="inline-flex max-w-full items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[10px] font-medium text-blue-700 hover:bg-blue-50"
                        title="Abrir evidencia"
                      >
                        <Eye className="h-3 w-3 shrink-0" />
                        <span className="truncate">{evidencia.nombre}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {/* Modal de previsualización de imágenes */}
      {evidenciaPreview && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setEvidenciaPreview(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Previsualización de ${evidenciaPreview.nombre}`}
            className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <p className="min-w-0 truncate text-sm font-semibold text-slate-800">
                {evidenciaPreview.nombre}
              </p>

              <button
                type="button"
                onClick={() => setEvidenciaPreview(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="Cerrar previsualización"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-100 p-3">
              <img
                src={evidenciaPreview.url}
                alt={evidenciaPreview.nombre}
                className="max-h-[72vh] max-w-full rounded object-contain"
              />
            </div>

            <div className="flex justify-end border-t border-slate-200 px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  const enlace = document.createElement("a");
                  enlace.href = evidenciaPreview.url;
                  enlace.download = evidenciaPreview.nombre;
                  enlace.click();
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
              >
                <Download className="h-3.5 w-3.5" />
                Descargar imagen
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarContacto && (
        <RegistrarComunicacionModal
          open
          onClose={() => setMostrarContacto(false)}
          solicitudInicial={solicitudId}
          cotizacionVersionInicial={versionId}
        />
      )}
    </section>
  );
}
