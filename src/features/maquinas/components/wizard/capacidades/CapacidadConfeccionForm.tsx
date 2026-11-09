import { useState } from "react";
import { Plus, Trash2, Scissors } from "lucide-react";

import type { CapacidadConfeccionCreate } from "../../../maquinaria.types";

interface Props {
  value: CapacidadConfeccionCreate | null;
  onChange: (value: CapacidadConfeccionCreate | null) => void;
  maquinariaId: number;
}

type CampoLista = "tipo_sello" | "tipo_troquel" | "acabado_especial";
type CampoNumero =
  | "bobina_ancho_min"
  | "bobina_ancho_max"
  | "producto_ancho_min"
  | "producto_ancho_max"
  | "largo_min"
  | "largo_max"
  | "fuelle_min"
  | "fuelle_max"
  | "velocidad_unidad_min";

const materialesDisponibles = ["PEAD", "PEBD", "PP"];

const crearCapacidadInicial = (
  maquinariaId: number,
): CapacidadConfeccionCreate => ({
  maquinaria: maquinariaId,
  materiales: [],
  tipo_sello: [],
  tipo_troquel: [],
  acabado_especial: [],
  bobina_ancho_min: 0,
  bobina_ancho_max: 0,
  producto_ancho_min: null,
  producto_ancho_max: null,
  largo_min: 0,
  largo_max: 0,
  fuelle_min: null,
  fuelle_max: null,
  velocidad_unidad_min: 0,
  observaciones: "",
});

interface CampoNumeroProps {
  label: string;
  campo: CampoNumero;
  value: CapacidadConfeccionCreate | null;
  step?: string;
  onChange: (campo: CampoNumero, valor: number | null) => void;
}

// Se declara fuera del formulario para conservar la identidad del componente
// y evitar que los inputs pierdan el foco durante la escritura.
function CampoNumero({
  label,
  campo,
  value,
  step = "0.01",
  onChange,
}: CampoNumeroProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-600">
        {label}
      </span>
      <input
        type="number"
        min="0"
        step={step}
        value={value?.[campo] ?? ""}
        onChange={(e) => {
          const texto = e.target.value;
          if (texto === "") {
            onChange(campo, texto === "" ? null : Number(texto));
            return;
          }
          onChange(campo, Number(texto));
        }}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

interface ListaValoresProps {
  campo: CampoLista;
  titulo: string;
  descripcion: string;
  value: CapacidadConfeccionCreate | null;
  nuevoValor: string;
  onNuevoValorChange: (campo: CampoLista, valor: string) => void;
  onAgregar: (campo: CampoLista) => void;
  onEliminar: (campo: CampoLista, indice: number) => void;
}

function ListaValores({
  campo,
  titulo,
  descripcion,
  value,
  nuevoValor,
  onNuevoValorChange,
  onAgregar,
  onEliminar,
}: ListaValoresProps) {
  const valores = value?.[campo] ?? [];

  return (
    <div className="space-y-2">
      <div>
        <h4 className="text-sm font-semibold text-gray-700">{titulo}</h4>
        <p className="text-xs text-gray-500">{descripcion}</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={nuevoValor}
          onChange={(e) => onNuevoValorChange(campo, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAgregar(campo);
            }
          }}
          placeholder={`Agregar ${titulo.toLowerCase()}...`}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={() => onAgregar(campo)}
          className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {valores.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-800"
          >
            {item}
            <button
              type="button"
              onClick={() => onEliminar(campo, index)}
              className="text-blue-600 hover:text-red-600"
              title={`Eliminar ${item}`}
            >
              <Trash2 size={14} />
            </button>
          </span>
        ))}
        {valores.length === 0 && (
          <span className="text-xs text-gray-400">No hay valores registrados.</span>
        )}
      </div>
    </div>
  );
}

export default function CapacidadConfeccionForm({
  value,
  onChange,
  maquinariaId,
}: Props) {
  const [nuevosValores, setNuevosValores] = useState<Record<CampoLista, string>>({
    tipo_sello: "",
    tipo_troquel: "",
    acabado_especial: "",
  });

  const actualizar = <K extends keyof CapacidadConfeccionCreate>(
    campo: K,
    nuevoValor: CapacidadConfeccionCreate[K],
  ) => {
    if (!value) return;
    onChange({ ...value, [campo]: nuevoValor, maquinaria: maquinariaId });
  };

  const actualizarNumero = (campo: CampoNumero, nuevoValor: number | null) => {
    if (!value) return;
    onChange({
      ...value,
      [campo]: nuevoValor,
      maquinaria: maquinariaId,
    } as CapacidadConfeccionCreate);
  };

  const agregarValor = (campo: CampoLista) => {
    if (!value) return;
    const nuevoValor = nuevosValores[campo].trim();
    if (!nuevoValor) return;

    const valoresActuales = value[campo];
    if (valoresActuales.some((item) => item.toLowerCase() === nuevoValor.toLowerCase())) {
      return;
    }

    actualizar(campo, [...valoresActuales, nuevoValor]);
    setNuevosValores((prev) => ({ ...prev, [campo]: "" }));
  };

  const eliminarValor = (campo: CampoLista, indice: number) => {
    if (!value) return;
    actualizar(campo, value[campo].filter((_, index) => index !== indice));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Scissors className="h-5 w-5 text-blue-600" />
        <div>
          <h3 className="font-semibold text-gray-800">Capacidad de confección</h3>
          <p className="text-sm text-gray-500">
            Configura las características técnicas de la maquinaria.
          </p>
        </div>
      </div>

      {!value ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
          <Scissors className="mx-auto mb-3 h-8 w-8 text-gray-400" />
          <p className="mb-3 text-sm text-gray-600">
            Esta maquinaria todavía no tiene capacidad de confección configurada.
          </p>
          <button
            type="button"
            onClick={() => onChange(crearCapacidadInicial(maquinariaId))}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Configurar capacidad
          </button>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">
              Materiales que puede procesar
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {materialesDisponibles.map((material) => (
                <label
                  key={material}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={value.materiales.includes(material)}
                    onChange={(e) => {
                      const materiales = e.target.checked
                        ? [...value.materiales, material]
                        : value.materiales.filter((item) => item !== material);
                      actualizar("materiales", materiales);
                    }}
                    className="h-4 w-4 rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{material}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-5 rounded-xl border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-800">Características de confección</h4>
            <ListaValores
              campo="tipo_sello"
              titulo="Tipos de sello"
              descripcion="Registra los tipos de sello que puede realizar."
              value={value}
              nuevoValor={nuevosValores.tipo_sello}
              onNuevoValorChange={(campo, valor) =>
                setNuevosValores((prev) => ({ ...prev, [campo]: valor }))
              }
              onAgregar={agregarValor}
              onEliminar={eliminarValor}
            />
            <ListaValores
              campo="tipo_troquel"
              titulo="Tipos de troquel"
              descripcion="Registra los tipos de troquel disponibles."
              value={value}
              nuevoValor={nuevosValores.tipo_troquel}
              onNuevoValorChange={(campo, valor) =>
                setNuevosValores((prev) => ({ ...prev, [campo]: valor }))
              }
              onAgregar={agregarValor}
              onEliminar={eliminarValor}
            />
            <ListaValores
              campo="acabado_especial"
              titulo="Acabados especiales"
              descripcion="Registra los acabados que puede realizar."
              value={value}
              nuevoValor={nuevosValores.acabado_especial}
              onNuevoValorChange={(campo, valor) =>
                setNuevosValores((prev) => ({ ...prev, [campo]: valor }))
              }
              onAgregar={agregarValor}
              onEliminar={eliminarValor}
            />
          </section>

          <section className="space-y-3">
            <h4 className="font-semibold text-gray-800">Capacidad de entrada: bobina</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CampoNumero label="Ancho mínimo de bobina" campo="bobina_ancho_min" value={value} onChange={actualizarNumero} />
              <CampoNumero label="Ancho máximo de bobina" campo="bobina_ancho_max" value={value} onChange={actualizarNumero} />
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="font-semibold text-gray-800">
              Capacidad de salida: producto terminado
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CampoNumero label="Ancho mínimo del producto" campo="producto_ancho_min" value={value} onChange={actualizarNumero} />
              <CampoNumero label="Ancho máximo del producto" campo="producto_ancho_max" value={value} onChange={actualizarNumero} />
              <CampoNumero label="Largo mínimo" campo="largo_min" value={value} onChange={actualizarNumero} />
              <CampoNumero label="Largo máximo" campo="largo_max" value={value} onChange={actualizarNumero} />
              <CampoNumero label="Fuelle mínimo" campo="fuelle_min" value={value} onChange={actualizarNumero} />
              <CampoNumero label="Fuelle máximo" campo="fuelle_max" value={value} onChange={actualizarNumero} />
            </div>
          </section>

          <section>
            <CampoNumero
              label="Velocidad (unidades/min)"
              campo="velocidad_unidad_min"
              value={value}
              onChange={actualizarNumero}
            />
          </section>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-600">
              Observaciones
            </span>
            <textarea
              rows={3}
              value={value.observaciones ?? ""}
              onChange={(e) => actualizar("observaciones", e.target.value)}
              placeholder="Observaciones técnicas de la maquinaria..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </label>
        </>
      )}
    </div>
  );
}
