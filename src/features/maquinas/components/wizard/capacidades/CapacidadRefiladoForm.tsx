
import { Plus, Scissors } from "lucide-react";

import type {
  CapacidadRefiladoCreate,
} from "../../../maquinaria.types";

interface Props {
  value: CapacidadRefiladoCreate | null;
  onChange: (value: CapacidadRefiladoCreate | null) => void;
  maquinariaId: number;
}

const crearCapacidadInicial = (
  maquinariaId: number,
): CapacidadRefiladoCreate => ({
  maquinaria: maquinariaId,
  ancho_entrada_min: 0,
  ancho_entrada_max: 0,
  ancho_salida_min: 0,
  ancho_salida_max: 0,
  velocidad_m_min: 0,
  observaciones: "",
});

export default function CapacidadRefiladoForm({
  value,
  onChange,
  maquinariaId,
}: Props) {
  const actualizar = <K extends keyof CapacidadRefiladoCreate>(
    campo: K,
    nuevoValor: CapacidadRefiladoCreate[K],
  ) => {
    if (!value) return;

    onChange({
      ...value,
      [campo]: nuevoValor,
      maquinaria: maquinariaId,
    });
  };

  const CampoNumero = ({
    label,
    campo,
  }: {
    label: string;
    campo:
      | "ancho_entrada_min"
      | "ancho_entrada_max"
      | "ancho_salida_min"
      | "ancho_salida_max"
      | "velocidad_m_min";
  }) => (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-600">
        {label}
      </span>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value?.[campo] ?? ""}
        onChange={(e) =>
          actualizar(
            campo,
            (e.target.value === "" ? 0 : Number(e.target.value)) as never,
          )
        }
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Scissors className="h-5 w-5 text-blue-600" />
        <div>
          <h3 className="font-semibold text-gray-800">
            Capacidad de refilado
          </h3>
          <p className="text-sm text-gray-500">
            Configura los rangos de ancho y velocidad de procesamiento.
          </p>
        </div>
      </div>

      {!value ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
          <Scissors className="mx-auto mb-3 h-8 w-8 text-gray-400" />
          <p className="mb-3 text-sm text-gray-600">
            Esta maquinaria todavía no tiene capacidad de refilado configurada.
          </p>

          <button
            type="button"
            onClick={() =>
              onChange(crearCapacidadInicial(maquinariaId))
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Configurar capacidad
          </button>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h4 className="font-semibold text-gray-800">
              Capacidad de entrada
            </h4>
            <p className="text-xs text-gray-500">
              Ancho de la bobina que ingresa a la máquina.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CampoNumero
                label="Ancho mínimo de entrada"
                campo="ancho_entrada_min"
              />
              <CampoNumero
                label="Ancho máximo de entrada"
                campo="ancho_entrada_max"
              />
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="font-semibold text-gray-800">
              Capacidad de salida
            </h4>
            <p className="text-xs text-gray-500">
              Ancho final del material después del proceso de refilado.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CampoNumero
                label="Ancho mínimo de salida"
                campo="ancho_salida_min"
              />
              <CampoNumero
                label="Ancho máximo de salida"
                campo="ancho_salida_max"
              />
            </div>
          </section>

          <section>
            <CampoNumero
              label="Velocidad (m/min)"
              campo="velocidad_m_min"
            />
          </section>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-600">
              Observaciones
            </span>
            <textarea
              rows={3}
              value={value.observaciones ?? ""}
              onChange={(e) =>
                actualizar("observaciones", e.target.value)
              }
              placeholder="Observaciones técnicas de la maquinaria..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </label>
        </>
      )}
    </div>
  );
}
