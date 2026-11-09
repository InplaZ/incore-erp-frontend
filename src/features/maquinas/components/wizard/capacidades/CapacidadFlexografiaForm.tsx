import { Plus, Printer } from "lucide-react";
import type { CapacidadFlexografiaCreate } from "../../../maquinaria.types";

interface Props {
  value: CapacidadFlexografiaCreate | null;
  onChange: (value: CapacidadFlexografiaCreate | null) => void;
  maquinariaId: number;
}

const crearCapacidadInicial = (
  maquinariaId: number,
): CapacidadFlexografiaCreate => ({
  maquinaria: maquinariaId,
  ancho_min: 0,
  ancho_max: 0,
  colores_min: 1,
  colores_max: 1,
  puede_anverso: true,
  puede_reverso: false,
  puede_ambas_caras: false,
  puede_degradado: false,
  puede_trameado: false,
  velocidad_m_min: 0,
  observaciones: "",
});

type CampoNumerico =
  | "ancho_min"
  | "ancho_max"
  | "colores_min"
  | "colores_max"
  | "velocidad_m_min";

type CampoBooleano =
  | "puede_anverso"
  | "puede_reverso"
  | "puede_ambas_caras"
  | "puede_degradado"
  | "puede_trameado";

interface CampoNumeroProps {
  label: string;
  campo: CampoNumerico;
  value: number | null | undefined;
  step?: string;
  onChange: (campo: CampoNumerico, valor: number | null) => void;
}

// Mantener este componente fuera del formulario evita que el input
// se desmonte y pierda el foco durante cada actualización.
function CampoNumero({
  label,
  campo,
  value,
  step = "1",
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
        value={value ?? ""}
        onChange={(e) => {
          const texto = e.target.value;
          onChange(campo, texto === "" ? null : Number(texto));
        }}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

interface CampoBooleanoProps {
  label: string;
  campo: CampoBooleano;
  checked: boolean;
  onChange: (campo: CampoBooleano, valor: boolean) => void;
}

function CampoBooleano({
  label,
  campo,
  checked,
  onChange,
}: CampoBooleanoProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(campo, e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

export default function CapacidadFlexografiaForm({
  value,
  onChange,
  maquinariaId,
}: Props) {
  const actualizarNumero = (campo: CampoNumerico, nuevoValor: number | null) => {
    if (!value) return;

    // null representa temporalmente un campo vacío mientras se edita.
    // La validación de campos obligatorios debe realizarse antes de guardar.
    onChange({
      ...value,
      [campo]: nuevoValor,
      maquinaria: maquinariaId,
    } as CapacidadFlexografiaCreate);
  };

  const actualizarBooleano = (campo: CampoBooleano, nuevoValor: boolean) => {
    if (!value) return;

    onChange({
      ...value,
      [campo]: nuevoValor,
      maquinaria: maquinariaId,
    });
  };

  const actualizarObservaciones = (observaciones: string) => {
    if (!value) return;

    onChange({ ...value, observaciones, maquinaria: maquinariaId });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Printer className="h-5 w-5 text-blue-600" />
        <div>
          <h3 className="font-semibold text-gray-800">
            Capacidad de flexografía
          </h3>
          <p className="text-sm text-gray-500">
            Configura los parámetros técnicos de impresión.
          </p>
        </div>
      </div>

      {!value ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
          <Printer className="mx-auto mb-3 h-8 w-8 text-gray-400" />
          <p className="mb-3 text-sm text-gray-600">
            Esta maquinaria todavía no tiene una capacidad de flexografía configurada.
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
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">
              Rango de ancho de impresión
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CampoNumero
                label="Ancho mínimo"
                campo="ancho_min"
                value={value.ancho_min}
                step="0.01"
                onChange={actualizarNumero}
              />
              <CampoNumero
                label="Ancho máximo"
                campo="ancho_max"
                value={value.ancho_max}
                step="0.01"
                onChange={actualizarNumero}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">
              Capacidad de colores
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CampoNumero
                label="Colores mínimos"
                campo="colores_min"
                value={value.colores_min}
                onChange={actualizarNumero}
              />
              <CampoNumero
                label="Colores máximos"
                campo="colores_max"
                value={value.colores_max}
                onChange={actualizarNumero}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">
              Caras de impresión
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CampoBooleano
                label="Puede imprimir anverso"
                campo="puede_anverso"
                checked={value.puede_anverso}
                onChange={actualizarBooleano}
              />
              <CampoBooleano
                label="Puede imprimir reverso"
                campo="puede_reverso"
                checked={value.puede_reverso}
                onChange={actualizarBooleano}
              />
              <CampoBooleano
                label="Puede imprimir ambas caras"
                campo="puede_ambas_caras"
                checked={value.puede_ambas_caras}
                onChange={actualizarBooleano}
              />
              <CampoBooleano
                label="Puede imprimir degradados"
                campo="puede_degradado"
                checked={value.puede_degradado}
                onChange={actualizarBooleano}
              />
              <CampoBooleano
                label="Puede realizar tramado"
                campo="puede_trameado"
                checked={value.puede_trameado}
                onChange={actualizarBooleano}
              />
            </div>
          </div>

          <div>
            <CampoNumero
              label="Velocidad (m/min)"
              campo="velocidad_m_min"
              value={value.velocidad_m_min}
              step="0.01"
              onChange={actualizarNumero}
            />
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-600">
              Observaciones
            </span>
            <textarea
              rows={3}
              value={value.observaciones ?? ""}
              onChange={(e) => actualizarObservaciones(e.target.value)}
              placeholder="Observaciones técnicas de la maquinaria..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </label>
        </>
      )}
    </div>
  );
}
