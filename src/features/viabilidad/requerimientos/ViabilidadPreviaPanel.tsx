import { AlertTriangle, CheckCircle2, Clock3, LoaderCircle } from "lucide-react";
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

export default function ViabilidadPreviaPanel({
  resultado,
  cargando,
  error,
}: ViabilidadPreviaPanelProps) {
  const estado = resultado?.estado_global ?? (resultado?.viable_global ? "viable" : "no_viable");

  return (
    <section aria-live="polite" className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-primary">
          {cargando ? <LoaderCircle className="h-5 w-5 animate-spin" /> :
            estado === "viable" ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> :
              estado === "no_viable" ? <AlertTriangle className="h-5 w-5 text-red-600" /> :
                <Clock3 className="h-5 w-5 text-amber-600" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-foreground">Previsualización de viabilidad</h4>
            {!cargando && resultado && (
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                estado === "viable" ? "bg-emerald-50 text-emerald-700" :
                  estado === "no_viable" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"
              }`}>
                {estado === "viable" ? "Viable" : estado === "no_viable" ? "No viable" : "Pendiente"}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {cargando ? "Evaluando las características actuales…" :
              error ? "No se pudo consultar la evaluación técnica." :
                !resultado ? "Completa los datos conocidos para consultar las capacidades de fabricación." :
                  estado === "viable" ? "Los procesos evaluados tienen una alternativa técnicamente viable." :
                    estado === "no_viable" ? "Hay incompatibilidades técnicas confirmadas en la ruta." :
                      "La evaluación sigue pendiente porque faltan datos técnicos."}
          </p>

          {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}

          {resultado && (
            <div className="mt-4 space-y-3">
              {resultado.ruta.map((proceso) => {
                const detalle = resultado.resultados_por_proceso?.[proceso];
                const procesoEstado = detalle?.estado ?? (
                  resultado.procesos_no_viables.includes(proceso) ? "no_viable" :
                    resultado.procesos_pendientes?.includes(proceso) ? "pendiente" :
                      resultado.procesos_viables.includes(proceso) ? "viable" : "pendiente"
                );
                const maquinas: ResultadoMaquinaViabilidad[] = [
                  ...(detalle?.resultados_evaluacion ?? detalle?.resultados ?? []),
                  ...(detalle?.pendientes ?? []),
                  ...(detalle?.no_viables ?? []),
                ];
                const uniqueMachines = maquinas.filter((machine, index) =>
                  maquinas.findIndex((candidate) => candidate.equipo === machine.equipo) === index,
                );
                const incompatibilidades = uniqueMachines.flatMap((maquina) => {
                  const criterios = maquina.criterios ?? maquina.criterios_evaluados ?? [];
                  return criterios.filter((criterio) => criterio.cumple === false).map((criterio) => ({ maquina, criterio }));
                });
                const pendientes = uniqueMachines.flatMap((maquina) => {
                  const criterios = maquina.criterios ?? maquina.criterios_evaluados ?? [];
                  return criterios.filter(criterioPendiente).map((criterio) => ({ maquina, criterio }));
                });
                const color = procesoEstado === "viable" ? "text-emerald-700 bg-emerald-50" :
                  procesoEstado === "no_viable" ? "text-red-700 bg-red-50" : "text-amber-800 bg-amber-50";

                return (
                  <div key={proceso} className="rounded-lg border border-border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium">{nombreProceso(proceso)}</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
                        {procesoEstado === "viable" ? "Viable" : procesoEstado === "no_viable" ? "No viable" : "Pendiente"}
                      </span>
                    </div>
                    {incompatibilidades.length > 0 && (
                      <ul className="mt-2 space-y-1 text-sm text-red-700">
                        {incompatibilidades.map(({ maquina, criterio }, index) => (
                          <li key={`fail-${index}`}><span className="font-medium">{maquina.equipo ?? "Máquina"} · {criterio.criterio.replaceAll("_", " ")}:</span> {criterio.mensaje ?? "No cumple la capacidad registrada."}</li>
                        ))}
                      </ul>
                    )}
                    {pendientes.length > 0 && (
                      <ul className="mt-2 space-y-1 text-sm text-amber-800">
                        {pendientes.map(({ maquina, criterio }, index) => (
                          <li key={`pending-${index}`}><span className="font-medium">{maquina.equipo ?? "Máquina"} · {criterio.criterio.replaceAll("_", " ")}:</span> {criterio.mensaje ?? "Falta información para evaluar este criterio."}</li>
                        ))}
                      </ul>
                    )}
                    {procesoEstado === "pendiente" && pendientes.length === 0 && (
                      <p className="mt-2 text-sm text-amber-800">Se requieren más datos para completar la evaluación de este proceso.</p>
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
