
/**
 * Componente de progreso del wizard
 * Muestra los pasos del formulario en una barra horizontal
 */
import { Check } from "lucide-react";

const pasos = [
  { numero: 1, titulo: "Equipo", descripcion: "Identificación" },
  { numero: 2, titulo: "Maquinaria", descripcion: "Producción" },
  { numero: 3, titulo: "Capacidad", descripcion: "Configuración técnica" },
];

interface Props {
  pasoActual: number;
}

export default function WizardProgress({ pasoActual }: Props) {
  return (
    <div className="px-5 py-5 sm:px-6">
      <div className="flex items-center">
        {pasos.map((paso, index) => {
          const completado = pasoActual > paso.numero;
          const activo = pasoActual === paso.numero;

          return (
            <div
              key={paso.numero}
              className={`flex items-center ${
                index < pasos.length - 1 ? "flex-1" : ""
              }`}
            >
              <div className="flex min-w-0 flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                    completado
                      ? "border-primary bg-primary text-primary-foreground"
                      : activo
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {completado ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-bold">
                      {paso.numero}
                    </span>
                  )}
                </div>

                <span
                  className={`mt-2 text-xs font-semibold ${
                    activo || completado
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {paso.titulo}
                </span>

                <span className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">
                  {paso.descripcion}
                </span>
              </div>

              {index < pasos.length - 1 && (
                <div
                  className={`mx-2 mb-6 h-0.5 flex-1 rounded-full ${
                    pasoActual > paso.numero
                      ? "bg-primary"
                      : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
