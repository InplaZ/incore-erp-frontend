
///////////////////////////////////////////////////////
// Asignar área y descripciòn
///////////////////////////////////////////////////////

import type {
  MaquinariaCreate,
  AreaProduccion,
} from "../../maquinaria.types";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

const labelClass =
  "mb-1.5 block text-xs font-semibold text-muted-foreground";

interface Props {
  value: Omit<MaquinariaCreate, "equipo">;
  areas: AreaProduccion[];
  loadingAreas?: boolean;
  onChange: (
    value: Omit<MaquinariaCreate, "equipo">
  ) => void;
}

export default function PasoMaquinaria({
  value,
  areas,
  loadingAreas = false,
  onChange,
}: Props) {
  const actualizar = <
    K extends keyof Omit<MaquinariaCreate, "equipo">
  >(
    campo: K,
    nuevoValor: Omit<MaquinariaCreate, "equipo">[K]
  ) => {
    onChange({
      ...value,
      [campo]: nuevoValor,
    });
  };

  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-foreground">
          Información de producción
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Define el área donde trabajará esta maquinaria.
          Esto determinará su configuración técnica.
        </p>
      </div>

      <div className="space-y-4">
        <Field label="Área de producción *">
          <select
            required
            className={inputClass}
            value={value.area_produccion || ""}
            disabled={loadingAreas}
            onChange={e =>
              actualizar(
                "area_produccion",
                Number(e.target.value)
              )
            }
          >
            <option value="">
              {loadingAreas
                ? "Cargando áreas..."
                : "Seleccionar área de producción"}
            </option>

            {areas.map(area => (
              <option key={area.id} value={area.id}>
                {area.nombre}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Descripción">
          <textarea
            rows={3}
            maxLength={500}
            className={inputClass}
            value={value.descripcion ?? ""}
            onChange={e =>
              actualizar("descripcion", e.target.value)
            }
            placeholder="Describe la función y características de la maquinaria..."
          />
        </Field>

        <Field label="Observaciones">
          <textarea
            rows={3}
            maxLength={1000}
            className={inputClass}
            value={value.observacion ?? ""}
            onChange={e =>
              actualizar("observacion", e.target.value)
            }
            placeholder="Información adicional..."
          />
        </Field>
      </div>

      {value.area_produccion > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs font-semibold text-primary">
            Área seleccionada
          </p>

          <p className="mt-1 text-sm text-foreground">
            {areas.find(
              area => area.id === value.area_produccion
            )?.nombre ?? "Área seleccionada"}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            En el siguiente paso configurarás la capacidad
            técnica correspondiente.
          </p>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}
