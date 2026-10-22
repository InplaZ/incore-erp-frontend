import {
  ArrowRight,
  ArrowLeft,
  Check,
  FileText,
  Route,
  ShieldCheck,
  AlertTriangle,
  Clock3,
} from "lucide-react";

import type {
  EvaluarViabilidadResponse,
} from "@/features/viabilidad/viabilidad.types";

interface ViabilidadResultadoProps {
  resultado?: EvaluarViabilidadResponse;
  error?: string;
  onContinuarCotizacion?: () => void;
  onCompletarEspecificacion?: () => void;
}

const nombresProceso: Record<string, string> = {
  extrusion: "Extrusión",
  flexografia: "Flexografía",
  confeccion: "Confección",
};

function obtenerNombreProceso(proceso: string) {
  return (
    nombresProceso[proceso.toLowerCase()] ??
    proceso.charAt(0).toUpperCase() + proceso.slice(1)
  );
}

function obtenerMaquinas(
  resultadoProceso: any,
): string[] {
  const maquinas: string[] = [];

  /*
   * Primero intentamos utilizar la máquina recomendada.
   */
  if (resultadoProceso?.recomendada) {
    const recomendada = resultadoProceso.recomendada;

    if (recomendada.equipo) {
      maquinas.push(String(recomendada.equipo));
    }
  }

  /*
   * Si existen resultados de evaluación,
   * buscamos las máquinas viables.
   */
  if (
    Array.isArray(resultadoProceso?.resultados_evaluacion)
  ) {
    resultadoProceso.resultados_evaluacion.forEach(
      (resultado: any) => {
        if (
          resultado?.viable &&
          resultado?.equipo
        ) {
          const equipo = String(resultado.equipo);

          if (!maquinas.includes(equipo)) {
            maquinas.push(equipo);
          }
        }
      },
    );
  }

  /*
   * Algunas evaluaciones pueden utilizar "resultados"
   * en lugar de "resultados_evaluacion".
   */
  if (
    maquinas.length === 0 &&
    Array.isArray(resultadoProceso?.resultados)
  ) {
    resultadoProceso.resultados.forEach(
      (resultado: any) => {
        if (
          resultado?.resultado === "viable" &&
          resultado?.equipo
        ) {
          const equipo = String(resultado.equipo);

          if (!maquinas.includes(equipo)) {
            maquinas.push(equipo);
          }
        }
      },
    );
  }

  return maquinas;
}

export default function ViabilidadResultado({
  resultado,
  error,
  onContinuarCotizacion,
  onCompletarEspecificacion,
}: ViabilidadResultadoProps) {

  /*
   * =====================================================
   * CASO 1: NO SE PUDO EVALUAR
   * =====================================================
   *
   * Existe un error de validación/precondición.
   * No debemos tratarlo como "producto no viable".
   */
  if (error) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-2xl flex-col items-center justify-center text-center">

        {/* Icono */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <AlertTriangle className="h-7 w-7 text-amber-600" />
        </div>

        {/* Título */}
        <h2 className="mt-4 text-2xl font-semibold text-amber-700">
          No se puede evaluar la viabilidad
        </h2>

        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          No es posible realizar la evaluación técnica porque
          faltan datos necesarios en la especificación del producto.
        </p>

        {/* Detalle del error */}
        <div className="mt-6 w-full rounded-lg border border-amber-200 bg-amber-50 p-5 text-left">

          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Información requerida
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-900">
            {error}
          </p>

        </div>

        {/* Acción */}
        <div className="mt-6">
          <button
            type="button"
            onClick={onCompletarEspecificacion}
            disabled={!onCompletarEspecificacion}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Completar especificación
          </button>
        </div>

      </div>
    );
  }

  /*
   * =====================================================
   * PROTECCIÓN
   * =====================================================
   *
   * Si no tenemos resultado ni error, no intentamos
   * acceder a resultado.viable_global.
   */
  if (!resultado) {
    return null;
  }

  const estado = resultado.estado_global ?? (
    resultado.viable_global ? "viable" :
      resultado.procesos_pendientes?.length ? "pendiente" : "no_viable"
  );
  const viable = estado === "viable";
  const pendiente = estado === "pendiente";

  return (
    <div className="mx-auto w-full max-w-5xl">

      {/* =====================================================
          ENCABEZADO DEL RESULTADO
          ===================================================== */}

      <div className="flex flex-col items-center text-center">

        <div
          className={[
            "flex h-14 w-14 items-center justify-center rounded-full",
            viable
              ? "bg-emerald-100"
              : pendiente ? "bg-amber-100" : "bg-red-100",
          ].join(" ")}
        >
          {viable ? (
            <Check className="h-7 w-7 text-emerald-600" />
          ) : pendiente ? (
            <Clock3 className="h-7 w-7 text-amber-600" />
          ) : (
            <span className="text-xl font-semibold text-red-600">
              !
            </span>
          )}
        </div>

        <h2
          className={[
            "mt-4 text-2xl font-semibold",
            viable
              ? "text-emerald-700"
              : pendiente ? "text-amber-700" : "text-red-700",
          ].join(" ")}
        >
          {viable
            ? "Producto viable"
            : pendiente ? "Evaluación pendiente" : "Producto no viable"}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {viable
            ? "El requerimiento puede producirse con la siguiente ruta"
            : pendiente ? "Faltan datos técnicos para confirmar todos los procesos" : "El requerimiento no puede producirse con la ruta evaluada"}
        </p>
      </div>

      {/* =====================================================
          RUTA DE PRODUCCIÓN
          ===================================================== */}

      {viable && (
        <div className="mt-8">

          <div className="mb-4 flex items-center gap-3">

            <Route className="h-5 w-5 text-emerald-600" />

            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Ruta propuesta por viabilidad
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Procesos identificados como técnicamente factibles
              </p>
            </div>

          </div>

          {/* =================================================
              PROCESOS
              ================================================= */}

          <div className="flex items-stretch gap-4 overflow-x-auto pb-2">

            {resultado.ruta.map(
              (proceso, index) => {

                const resultadoProceso =
                  resultado.resultados_por_proceso?.[
                  proceso
                  ];

                const maquinas =
                  obtenerMaquinas(
                    resultadoProceso,
                  );

                return (
                  <div
                    key={proceso}
                    className="flex min-w-0 flex-1 items-center gap-4"
                  >

                    {/* TARJETA DEL PROCESO */}

                    <div className="min-h-[130px] w-full rounded-lg border border-border bg-card p-4">

                      <p className="text-xs font-medium text-muted-foreground">
                        Paso {index + 1}
                      </p>

                      <h4 className="mt-2 text-base font-semibold text-foreground">
                        {obtenerNombreProceso(
                          proceso,
                        )}
                      </h4>

                      <p className="mt-4 text-xs text-muted-foreground">
                        Máquinas técnicamente disponibles
                      </p>

                      {maquinas.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">

                          {maquinas.map(
                            (maquina) => (
                              <span
                                key={maquina}
                                className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700"
                              >
                                {maquina}
                              </span>
                            ),
                          )}

                        </div>
                      ) : (
                        <span className="mt-2 inline-block text-xs text-muted-foreground">
                          Sin máquinas disponibles
                        </span>
                      )}

                    </div>

                    {/* FLECHA */}

                    {index <
                      resultado.ruta.length - 1 && (
                        <ArrowRight className="h-5 w-5 shrink-0 text-emerald-500" />
                      )}

                  </div>
                );
              },
            )}

          </div>

          {/* =================================================
              INFORMACIÓN
              ================================================= */}

          <div className="mt-4 flex items-start gap-3 rounded-lg bg-emerald-50 px-4 py-3">

            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

            <p className="text-xs leading-5 text-emerald-800">
              La máquina finalmente asignada se determina
              en la orden de producción. La ejecutiva comercial
              no necesita seleccionarla.
            </p>

          </div>

          {/* =================================================
              CONTINUAR
              ================================================= */}

          <div className="mt-6 flex justify-center">

            <button
              type="button"
              onClick={onContinuarCotizacion}
              disabled={!onContinuarCotizacion}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />

              Continuar a cotización

              <ArrowRight className="h-4 w-4" />
            </button>

          </div>

        </div>
      )}

      {/* =====================================================
          RESULTADO NO VIABLE
          ===================================================== */}

      {pendiente && (
        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-sm font-semibold text-amber-900">Faltan datos para completar la evaluación</h3>
          <p className="mt-2 text-sm text-amber-800">
            La información disponible todavía no permite confirmar la viabilidad. Completa los criterios pendientes y vuelve a evaluar.
          </p>
          {resultado.procesos_pendientes?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {resultado.procesos_pendientes.map((proceso) => (
                <span key={proceso} className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                  {obtenerNombreProceso(proceso)} · pendiente
                </span>
              ))}
            </div>
          ) : null}
          {resultado.procesos_pendientes?.map((proceso) => {
            const detalle = resultado.resultados_por_proceso?.[proceso];
            const maquinas = [
              ...(detalle?.resultados_evaluacion ?? detalle?.resultados ?? []),
              ...(detalle?.pendientes ?? []),
            ];
            const criteriosPendientes = maquinas.flatMap((maquina) =>
              (maquina.criterios ?? maquina.criterios_evaluados ?? [])
                .filter((criterio) => criterio.estado === "pendiente" || criterio.cumple === null)
                .map((criterio) => ({ equipo: maquina.equipo, criterio })),
            );
            return (
              <section key={`pendiente-${proceso}`} className="mt-4">
                <h4 className="text-sm font-semibold text-amber-900">Datos pendientes de {obtenerNombreProceso(proceso)}</h4>
                {criteriosPendientes.length ? (
                  <ul className="mt-2 space-y-1 text-sm text-amber-800">
                    {criteriosPendientes.map(({ equipo, criterio }, index) => (
                      <li key={`${proceso}-${index}`}>
                        <span className="font-medium">{equipo ? `${equipo} · ` : ""}{criterio.criterio.replaceAll("_", " ")}:</span>{" "}
                        {criterio.mensaje ?? "Completa este dato para evaluar el criterio."}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-amber-800">Completa la especificación técnica para continuar.</p>
                )}
              </section>
            );
          })}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onCompletarEspecificacion}
              disabled={!onCompletarEspecificacion}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a completar datos
            </button>
          </div>
        </div>
      )}

      {estado === "no_viable" && (

        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5">

          <h3 className="text-sm font-semibold text-red-800">
            El producto no es técnicamente viable
          </h3>

          <p className="mt-2 text-sm text-red-700">
            No todos los procesos necesarios cuentan con
            una alternativa técnicamente viable.
          </p>

          {resultado.procesos_no_viables?.length > 0 && (

            <div className="mt-4">

              <p className="text-xs font-medium text-red-800">
                Procesos no viables:
              </p>

              <div className="mt-2 flex flex-wrap gap-2">

                {resultado.procesos_no_viables.map(
                  (proceso) => (
                    <span
                      key={proceso}
                      className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                    >
                      {obtenerNombreProceso(
                        proceso,
                      )}
                    </span>
                  ),
                )}

              </div>

            </div>
          )}

          {resultado.procesos_no_viables?.map((proceso) => {
            const detalle = resultado.resultados_por_proceso?.[proceso];
            const maquinas = detalle?.resultados_evaluacion ?? detalle?.resultados ?? [];
            return (
              <section key={`detalle-${proceso}`} className="mt-5 space-y-3">
                <h4 className="text-sm font-semibold text-red-900">
                  Criterios de {obtenerNombreProceso(proceso)}
                </h4>
                {maquinas.length === 0 ? (
                  <p className="rounded-md border border-red-200 bg-white/70 p-3 text-sm text-red-800">
                    No hay capacidades o máquinas registradas para este proceso.
                  </p>
                ) : maquinas.map((maquina, indice) => {
                  const criterios = maquina.criterios ?? maquina.criterios_evaluados ?? [];
                  const fallidos = criterios.filter((criterio) => !criterio.cumple);
                  return (
                    <div key={`${maquina.equipo ?? proceso}-${indice}`} className="rounded-md border border-red-200 bg-white/70 p-3">
                      <p className="text-sm font-medium text-red-900">
                        {maquina.equipo ?? `Máquina ${indice + 1}`}
                        {maquina.disponibilidad ? ` · ${maquina.disponibilidad}` : ""}
                      </p>
                      {fallidos.length ? (
                        <ul className="mt-2 space-y-1.5">
                          {fallidos.map((criterio, criterioIndice) => (
                            <li key={`${criterio.criterio}-${criterioIndice}`} className="text-sm text-red-800">
                              <span className="font-medium">{criterio.criterio.replaceAll("_", " ")}:</span>{" "}
                              {criterio.mensaje ?? "El criterio no cumple la capacidad registrada."}
                              {criterio.valor_solicitado !== undefined && criterio.valor_solicitado !== null && (
                                <span className="ml-1 text-xs text-red-700">(solicitado: {String(criterio.valor_solicitado)})</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-red-800">La máquina no está disponible o no devolvió criterios detallados.</p>
                      )}
                    </div>
                  );
                })}
              </section>
            );
          })}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCompletarEspecificacion}
              disabled={!onCompletarEspecificacion}
              className="inline-flex items-center justify-center gap-2 rounded-lg
      border border-border bg-background px-5 py-2.5
      text-sm font-medium text-foreground transition-colors
      hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a editar especificación
            </button>
          </div>

        </div>
      )}

    </div>
  );
}





