
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  LoaderCircle,
} from "lucide-react";

import type {
  CriterioViabilidad,
  EvaluarViabilidadResponse,
  ResultadoMaquinaViabilidad,
} from "@/features/viabilidad/viabilidad.types";

interface ViabilidadPreviaPanelProps {
  resultado: EvaluarViabilidadResponse | null;
  cargando: boolean;
  error: string | null;
}

const nombresProceso: Record<string, string> = {
  extrusion: "Extrusión",
  flexografia: "Flexografía",
  confeccion: "Confección",
};

function nombreProceso(proceso: string) {
  return nombresProceso[proceso.toLowerCase()] ?? proceso;
}

function criterioPendiente(criterio: CriterioViabilidad) {
  return criterio.estado === "pendiente" || criterio.cumple === null;
}

function obtenerMaquinas(
  detalle: EvaluarViabilidadResponse["resultados_por_proceso"][string] | undefined,
): ResultadoMaquinaViabilidad[] {
  if (!detalle) return [];

  const maquinas = [
    ...(detalle.resultados_evaluacion ?? detalle.resultados ?? []),
    ...(detalle.pendientes ?? []),
    ...(detalle.no_viables ?? []),
  ];

  // Agrupar por máquina física, no por capacidad de material.
  const agrupadas = new Map<string, ResultadoMaquinaViabilidad[]>();

  for (const maquina of maquinas) {
    const clave = String(maquina.maquinaria_id ?? maquina.equipo_id ?? maquina.equipo);

    if (!agrupadas.has(clave)) {
      agrupadas.set(clave, []);
    }

    agrupadas.get(clave)!.push(maquina);
  }

  // Una máquina es apta si alguna de sus capacidades cumple
  // todos los criterios y está operativa.
  return Array.from(agrupadas.values()).map((capacidades) => {
    const viable = capacidades.find(
      (m) =>
        m.resultado === "viable" &&
        m.cumple === true &&
        m.disponibilidad === "operativo",
    );

    if (viable) return viable;

    // Preferir la capacidad con el material correspondiente si
    // alguna está pendiente, antes de mostrar una incompatible.
    const pendiente = capacidades.find(
      (m) => m.resultado === "pendiente" || m.cumple === null,
    );

    return pendiente ?? capacidades[0];
  });
}

export default function ViabilidadPreviaPanel({
  resultado,
  cargando,
  error,
}: ViabilidadPreviaPanelProps) {
  const estado = resultado?.estado_global ??
    (resultado?.viable_global ? "viable" : "no_viable");

  return (
    <section
      aria-live="polite"
      className="rounded-xl border border-border bg-card p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {cargando ? (
            <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
          ) : estado === "viable" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : estado === "no_viable" ? (
            <AlertTriangle className="h-5 w-5 text-red-600" />
          ) : (
            <Clock3 className="h-5 w-5 text-amber-600" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-foreground">
              Previsualización de viabilidad
            </h4>

            {!cargando && resultado && (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  estado === "viable"
                    ? "bg-emerald-50 text-emerald-700"
                    : estado === "no_viable"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-800"
                }`}
              >
                {estado === "viable"
                  ? "Compatible"
                  : estado === "no_viable"
                    ? "No viable"
                    : "Pendiente"}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {cargando
              ? "Evaluando las características actuales…"
              : error
                ? "No se pudo consultar la evaluación técnica."
                : !resultado
                  ? "Completa los datos para consultar las capacidades de fabricación."
                  : estado === "viable"
                    ? "Existe al menos una alternativa viable para cada proceso requerido."
                    : estado === "no_viable"
                      ? "Hay incompatibilidades técnicas confirmadas en la ruta."
                      : "Faltan datos técnicos para completar la evaluación."}
          </p>

          {error && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {resultado && (
            <div className="mt-4 space-y-3">
              {resultado.ruta.map((proceso) => {
                const detalle = resultado.resultados_por_proceso?.[proceso];
                const maquinas = obtenerMaquinas(detalle);

                const maquinasViables = maquinas.filter(
                  (m) =>
                    m.resultado === "viable" &&
                    m.cumple === true &&
                    m.disponibilidad === "operativo",
                );

                const procesoEstado =
                  detalle?.estado ??
                  (resultado.procesos_no_viables.includes(proceso)
                    ? "no_viable"
                    : resultado.procesos_pendientes?.includes(proceso)
                      ? "pendiente"
                      : resultado.procesos_viables.includes(proceso)
                        ? "viable"
                        : "pendiente");

                const color =
                  maquinasViables.length > 0
                    ? "text-emerald-700 bg-emerald-50"
                    : procesoEstado === "no_viable"
                      ? "text-red-700 bg-red-50"
                      : "text-amber-800 bg-amber-50";

                const codigos = maquinasViables.map((m) => m.equipo);

                const incompatibilidades = maquinas.flatMap((maquina) => {
                  const criterios =
                    maquina.criterios ?? maquina.criterios_evaluados ?? [];

                  return criterios
                    .filter((criterio) => criterio.cumple === false)
                    .map((criterio) => ({ maquina, criterio }));
                });

                const pendientes = maquinas.flatMap((maquina) => {
                  const criterios =
                    maquina.criterios ?? maquina.criterios_evaluados ?? [];

                  return criterios
                    .filter(criterioPendiente)
                    .map((criterio) => ({ maquina, criterio }));
                });

                return (
                  <div
                    key={proceso}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold">
                        {nombreProceso(proceso)}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${color}`}
                      >
                        {maquinasViables.length > 0
                          ? "Compatible"
                          : procesoEstado === "no_viable"
                            ? "No viable"
                            : "Pendiente"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-foreground">
                      {maquinasViables.length}{" "}
                      {maquinasViables.length === 1
                        ? "máquina compatible"
                        : "máquinas compatibles"}
                    </p>

                    {codigos.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Aptas: {codigos.join(", ")}
                      </p>
                    )}

                    {maquinasViables.length === 0 &&
                      procesoEstado === "pendiente" && (
                        <p className="mt-2 text-sm text-amber-800">
                          Completa los datos pendientes para determinar las
                          máquinas compatibles.
                        </p>
                      )}

                    {maquinasViables.length === 0 &&
                      procesoEstado === "no_viable" && (
                        <p className="mt-2 text-sm text-red-700">
                          No se ha confirmado una alternativa compatible para
                          este proceso.
                        </p>
                      )}

                    {incompatibilidades.length > 0 && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                          Ver incompatibilidades técnicas
                        </summary>

                        <ul className="mt-2 space-y-2 text-sm text-red-700">
                          {incompatibilidades.map(
                            ({ maquina, criterio }, index) => (
                              <li key={`fail-${index}`}>
                                <span className="font-medium">
                                  {maquina.equipo} ·{" "}
                                  {criterio.criterio.replaceAll("_", " ")}:
                                </span>{" "}
                                {criterio.mensaje ??
                                  "No cumple la capacidad registrada."}
                              </li>
                            ),
                          )}
                        </ul>
                      </details>
                    )}

                    {pendientes.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                          Ver criterios pendientes
                        </summary>

                        <ul className="mt-2 space-y-2 text-sm text-amber-800">
                          {pendientes.map(({ maquina, criterio }, index) => (
                            <li key={`pending-${index}`}>
                              <span className="font-medium">
                                {maquina.equipo} ·{" "}
                                {criterio.criterio.replaceAll("_", " ")}:
                              </span>{" "}
                              {criterio.mensaje ??
                                "Falta información para evaluar este criterio."}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
