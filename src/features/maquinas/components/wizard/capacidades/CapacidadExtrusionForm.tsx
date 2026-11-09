import { useState } from "react";
import { Plus, Trash2, Layers } from "lucide-react";

import type {
  CapacidadExtrusionCreate,
  MaterialExtrusion,
} from "../../../maquinaria.types";

interface Props {
  value: CapacidadExtrusionCreate[];
  onChange: (value: CapacidadExtrusionCreate[]) => void;
}

const materiales: MaterialExtrusion[] = ["PEAD", "PEBD", "PP"];

const nuevaCapacidad = (
  maquinaria: number,
  material: MaterialExtrusion,
): CapacidadExtrusionCreate => ({
  maquinaria,
  material,
  ancho_min: 0,
  ancho_max: 0,
  micronaje_min: 0,
  micronaje_max: 0,
  diametro_min: null,
  diametro_max: null,
  peso_min: null,
  peso_max: null,
  kg_h: 0,
  capas: 1,
  fuelle_minimo: null,
  fuelle_maximo: null,
  observaciones: "",
});

interface InputNumberProps {
  label: string;
  campo: keyof CapacidadExtrusionCreate;
  capacidad: CapacidadExtrusionCreate;
  nullable?: boolean;
  step?: string;
  onChange: (
    campo: keyof CapacidadExtrusionCreate,
    nuevoValor: string | number | null,
  ) => void;
}

// Este componente debe permanecer fuera de CapacidadExtrusionForm.
// Así React conserva su identidad y el input no pierde el foco al escribir.
function InputNumber({
  label,
  campo,
  capacidad,
  step = "1",
  onChange,
}: InputNumberProps) {
  const valor = capacidad[campo];

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-600">
        {label}
      </span>
      <input
        type="number"
        min="0"
        step={step}
        value={valor ?? ""}
        onChange={(e) =>
          onChange(
            campo,
            e.target.value === "" ? null : Number(e.target.value),
          )
        }
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

export default function CapacidadExtrusionForm({
  value,
  onChange,
}: Props) {
  const [materialSeleccionado, setMaterialSeleccionado] =
    useState<MaterialExtrusion>("PEBD");

  const maquinariaId = value[0]?.maquinaria ?? 0;
  const materialesRegistrados = value.map((item) => item.material);

  const agregarCapacidad = () => {
    if (materialesRegistrados.includes(materialSeleccionado)) return;

    onChange([
      ...value,
      nuevaCapacidad(maquinariaId, materialSeleccionado),
    ]);

    const siguiente = materiales.find(
      (material) =>
        ![...materialesRegistrados, materialSeleccionado].includes(material),
    );

    if (siguiente) setMaterialSeleccionado(siguiente);
  };

  const eliminarCapacidad = (material: MaterialExtrusion) => {
    onChange(value.filter((item) => item.material !== material));
  };

  const actualizarCapacidad = (
    material: MaterialExtrusion,
    campo: keyof CapacidadExtrusionCreate,
    nuevoValor: string | number | null,
  ) => {
    onChange(
      value.map((item) =>
        item.material === material
          ? { ...item, [campo]: nuevoValor }
          : item,
      ),
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">
            Capacidades de extrusión
          </h3>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Registra los rangos de trabajo de esta máquina por cada material
          que puede procesar.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={materialSeleccionado}
          onChange={(e) =>
            setMaterialSeleccionado(e.target.value as MaterialExtrusion)
          }
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {materiales.map((material) => (
            <option
              key={material}
              value={material}
              disabled={materialesRegistrados.includes(material)}
            >
              {material}
              {materialesRegistrados.includes(material)
                ? " (registrado)"
                : ""}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={agregarCapacidad}
          disabled={materialesRegistrados.length >= materiales.length}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} />
          Agregar material
        </button>
      </div>

      {value.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <Layers className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">
            Todavía no se registraron capacidades.
          </p>
          <p className="text-xs text-gray-400">
            Selecciona un material y presiona Agregar material.
          </p>
        </div>
      )}

      {value.map((capacidad) => (
        <section
          key={capacidad.material}
          className="space-y-4 rounded-xl border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-800">
                Material: {capacidad.material}
              </h4>
              <p className="text-xs text-gray-500">
                Parámetros técnicos de producción
              </p>
            </div>

            <button
              type="button"
              onClick={() => eliminarCapacidad(capacidad.material)}
              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
              title="Eliminar capacidad"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InputNumber label="Ancho mínimo" campo="ancho_min" capacidad={capacidad} step="0.01" onChange={(campo, valor) => actualizarCapacidad(capacidad.material, campo, valor)} />
            <InputNumber label="Ancho máximo" campo="ancho_max" capacidad={capacidad} step="0.01" onChange={(campo, valor) => actualizarCapacidad(capacidad.material, campo, valor)} />
            <InputNumber label="Micronaje mínimo" campo="micronaje_min" capacidad={capacidad} step="0.01" onChange={(campo, valor) => actualizarCapacidad(capacidad.material, campo, valor)} />
            <InputNumber label="Micronaje máximo" campo="micronaje_max" capacidad={capacidad} step="0.01" onChange={(campo, valor) => actualizarCapacidad(capacidad.material, campo, valor)} />
            <InputNumber label="Producción (kg/h)" campo="kg_h" capacidad={capacidad} step="0.01" onChange={(campo, valor) => actualizarCapacidad(capacidad.material, campo, valor)} />
            <InputNumber label="Número de capas" campo="capas" capacidad={capacidad} onChange={(campo, valor) => actualizarCapacidad(capacidad.material, campo, valor)} />
            <InputNumber label="Diámetro mínimo" campo="diametro_min" capacidad={capacidad} nullable step="0.01" onChange={(campo, valor) => actualizarCapacidad(capacidad.material, campo, valor)} />
            <InputNumber label="Diámetro máximo" campo="diametro_max" capacidad={capacidad} nullable step="0.01" onChange={(campo, valor) => actualizarCapacidad(capacidad.material, campo, valor)} />
            <InputNumber label="Peso mínimo" campo="peso_min" capacidad={capacidad} nullable step="0.01" onChange={(campo, valor) => actualizarCapacidad(capacidad.material, campo, valor)} />
            <InputNumber label="Peso máximo" campo="peso_max" capacidad={capacidad} nullable step="0.01" onChange={(campo, valor) => actualizarCapacidad(capacidad.material, campo, valor)} />
            <InputNumber label="Fuelle mínimo" campo="fuelle_minimo" capacidad={capacidad} nullable step="0.01" onChange={(campo, valor) => actualizarCapacidad(capacidad.material, campo, valor)} />
            <InputNumber label="Fuelle máximo" campo="fuelle_maximo" capacidad={capacidad} nullable step="0.01" onChange={(campo, valor) => actualizarCapacidad(capacidad.material, campo, valor)} />
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-600">
              Observaciones
            </span>
            <textarea
              rows={2}
              value={capacidad.observaciones ?? ""}
              onChange={(e) =>
                actualizarCapacidad(
                  capacidad.material,
                  "observaciones",
                  e.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Observaciones técnicas..."
            />
          </label>
        </section>
      ))}
    </div>
  );
}
