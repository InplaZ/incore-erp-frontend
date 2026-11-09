
///////////////////////////////////////////////////////
// Registrar datos generales del equipo
///////////////////////////////////////////////////////

import type {
  EquipoCreate,
  EstadoEquipo,
} from "../../maquinaria.types";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

const labelClass =
  "mb-1.5 block text-xs font-semibold text-muted-foreground";

interface Props {
  value: EquipoCreate;
  onChange: (value: EquipoCreate) => void;
}

export default function PasoEquipo({
  value,
  onChange,
}: Props) {
  const actualizar = <K extends keyof EquipoCreate>(
    campo: K,
    nuevoValor: EquipoCreate[K]
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
          Información general del equipo
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Registra los datos de identificación de la maquinaria.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código *">
          <input
            required
            autoFocus
            maxLength={50}
            className={inputClass}
            value={value.codigo}
            onChange={e =>
              actualizar("codigo", e.target.value)
            }
            placeholder="Ej. EXT-001"
          />
        </Field>

        <Field label="Nombre *">
          <input
            required
            maxLength={150}
            className={inputClass}
            value={value.nombre}
            onChange={e =>
              actualizar("nombre", e.target.value)
            }
            placeholder="Ej. Extrusora 01"
          />
        </Field>

        <Field label="Marca">
          <input
            className={inputClass}
            value={value.marca ?? ""}
            onChange={e =>
              actualizar("marca", e.target.value)
            }
            placeholder="Marca del fabricante"
          />
        </Field>

        <Field label="Modelo">
          <input
            className={inputClass}
            value={value.modelo ?? ""}
            onChange={e =>
              actualizar("modelo", e.target.value)
            }
            placeholder="Modelo de la máquina"
          />
        </Field>

        <Field label="Tipo de equipo">
          <input
            disabled
            value="Maquinaria"
            className={`${inputClass} cursor-not-allowed bg-secondary text-muted-foreground`}
          />
        </Field>

        <Field label="Estado operativo *">
          <select
            className={inputClass}
            value={value.estado}
            onChange={e =>
              actualizar(
                "estado",
                e.target.value as EstadoEquipo
              )
            }
          >
            <option value="operativo">Operativo</option>
            <option value="mantenimiento">En mantenimiento</option>
            <option value="fuera_servicio">Fuera de servicio</option>
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Ubicación física">
            <input
              className={inputClass}
              value={value.ubicacion ?? ""}
              onChange={e =>
                actualizar("ubicacion", e.target.value)
              }
              placeholder="Ej. Planta de producción - Sector A"
            />
          </Field>
        </div>
      </div>
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
