
///////////////////////////////////////////////////////
// Configurar capacidades según el área
///////////////////////////////////////////////////////

import type {
  AreaProduccion,
  CapacidadExtrusionCreate,
  CapacidadFlexografiaCreate,
  CapacidadConfeccionCreate,
  CapacidadRefiladoCreate,
} from "../../maquinaria.types";
import CapacidadFlexografiaForm from "./capacidades/CapacidadFlexografiaForm";
import CapacidadExtrusionForm from "./capacidades/CapacidadExtrusionForm";
import CapacidadConfeccionForm from "./capacidades/CapacidadConfeccionForm";
import CapacidadRefiladoForm from "./capacidades/CapacidadRefiladoForm";

export type CapacidadesFormulario = {
  extrusion: CapacidadExtrusionCreate[];
  flexografia: CapacidadFlexografiaCreate | null;
  confeccion: CapacidadConfeccionCreate | null;
  refilado: CapacidadRefiladoCreate | null;
};

interface Props {
  area: AreaProduccion | null;
  maquinariaId: number;
  capacidades: CapacidadesFormulario;
  onChange: (capacidades: CapacidadesFormulario) => void;
}

type TipoCapacidad =
  | "extrusion"
  | "flexografia"
  | "confeccion"
  | "refilado"
  | "desconocida";

const normalizar = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const detectarTipoCapacidad = (nombreArea: string): TipoCapacidad => {
  const nombre = normalizar(nombreArea);

  if (nombre.includes("extrusion")) return "extrusion";
  if (nombre.includes("flexografia")) return "flexografia";
  if (nombre.includes("confeccion")) return "confeccion";
  if (nombre.includes("refilado")) return "refilado";

  return "desconocida";
};

export default function PasoCapacidad({
  area,
  maquinariaId,
  capacidades,
  onChange,
}: Props) {
  if (!area) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <p className="font-medium text-amber-800">
          Selecciona un área de producción.
        </p>
        <p className="mt-1 text-sm text-amber-700">
          Necesitamos conocer el área para mostrar el formulario técnico
          correspondiente.
        </p>
      </div>
    );
  }

  const tipoCapacidad = detectarTipoCapacidad(area.nombre);

  const actualizarExtrusion = (
    value: CapacidadExtrusionCreate[],
  ) => {
    onChange({
      ...capacidades,
      extrusion: value.map((item) => ({
        ...item,
        maquinaria: maquinariaId,
      })),
    });
  };

  const actualizarFlexografia = (
    value: CapacidadFlexografiaCreate | null,
  ) => {
    onChange({
      ...capacidades,
      flexografia: value
        ? { ...value, maquinaria: maquinariaId }
        : null,
    });
  };

  const actualizarConfeccion = (
    value: CapacidadConfeccionCreate | null,
  ) => {
    onChange({
      ...capacidades,
      confeccion: value
        ? { ...value, maquinaria: maquinariaId }
        : null,
    });
  };

  const actualizarRefilado = (
    value: CapacidadRefiladoCreate | null,
  ) => {
    onChange({
      ...capacidades,
      refilado: value
        ? { ...value, maquinaria: maquinariaId }
        : null,
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
          Área de producción
        </p>
        <h3 className="mt-1 font-semibold text-blue-900">
          {area.nombre}
        </h3>
        {area.descripcion && (
          <p className="mt-1 text-sm text-blue-700">
            {area.descripcion}
          </p>
        )}
      </div>

      {tipoCapacidad === "extrusion" && (
        <CapacidadExtrusionForm
          value={capacidades.extrusion}
          onChange={actualizarExtrusion}
        />
      )}

      {tipoCapacidad === "flexografia" && (
        <CapacidadFlexografiaForm
          value={capacidades.flexografia}
          onChange={actualizarFlexografia}
          maquinariaId={maquinariaId}
        />
      )}

      {tipoCapacidad === "confeccion" && (
        <CapacidadConfeccionForm
          value={capacidades.confeccion}
          onChange={actualizarConfeccion}
          maquinariaId={maquinariaId}
        />
      )}

      {tipoCapacidad === "refilado" && (
        <CapacidadRefiladoForm
          value={capacidades.refilado}
          onChange={actualizarRefilado}
          maquinariaId={maquinariaId}
        />
      )}

      {tipoCapacidad === "desconocida" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-medium text-amber-800">
            No se reconoce el área de producción.
          </p>
          <p className="mt-1 text-sm text-amber-700">
            No podemos determinar qué capacidad técnica corresponde
            a esta maquinaria.
          </p>
        </div>
      )}
    </div>
  );
}
