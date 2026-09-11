import type {
  MaterialProducto,
  TipoImpresion,
} from "../../comercial.types";

import type { ProductType } from "./RequerimientoStepProducto";

interface RequerimientoStepDetallesProps {
  product: ProductType;

  descripcion: string;
  setDescripcion: (value: string) => void;

  material: MaterialProducto;
  setMaterial: (value: MaterialProducto) => void;

  micraje: string;
  setMicraje: (value: string) => void;

  colorBolsa: string;
  setColorBolsa: (value: string) => void;

  impresion: boolean;
  setImpresion: (value: boolean) => void;

  colorImpresion: string;
  setColorImpresion: (value: string) => void;

  tipoImpresion: TipoImpresion;
  setTipoImpresion: (value: TipoImpresion) => void;

  otrasCaracteristicas: string;
  setOtrasCaracteristicas: (value: string) => void;

  anchoDoblado: string;
  setAnchoDoblado: (value: string) => void;

  anchoDesdoblado: string;
  setAnchoDesdoblado: (value: string) => void;

  largoDoblado: string;
  setLargoDoblado: (value: string) => void;

  largoDesdoblado: string;
  setLargoDesdoblado: (value: string) => void;

  fuelle: boolean;
  setFuelle: (value: boolean) => void;

  tipoTroquel: string;
  setTipoTroquel: (value: string) => void;

  tipoSello: string;
  setTipoSello: (value: string) => void;

  pestana: string;
  setPestana: (value: string) => void;
}

export default function RequerimientoStepDetalles({
  product,

  descripcion,
  setDescripcion,

  material,
  setMaterial,

  micraje,
  setMicraje,

  colorBolsa,
  setColorBolsa,

  impresion,
  setImpresion,

  colorImpresion,
  setColorImpresion,

  tipoImpresion,
  setTipoImpresion,

  otrasCaracteristicas,
  setOtrasCaracteristicas,

  anchoDoblado,
  setAnchoDoblado,

  anchoDesdoblado,
  setAnchoDesdoblado,

  largoDoblado,
  setLargoDoblado,

  largoDesdoblado,
  setLargoDesdoblado,

  fuelle,
  setFuelle,

  tipoTroquel,
  setTipoTroquel,

  tipoSello,
  setTipoSello,

  pestana,
  setPestana,
}: RequerimientoStepDetallesProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold">
          {product === "roll"
            ? "Cuéntanos sobre tu bobina"
            : product === "bag"
              ? "Cuéntanos sobre tu bolsa"
              : "Cuéntanos sobre tu producto"}
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Solo necesitas completar lo esencial. Podrás agregar detalles después.
        </p>
      </div>

      {/* Información general */}
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Descripción
          </label>

          <textarea
            value={descripcion}
            onChange={(event) =>
              setDescripcion(event.target.value)
            }
            rows={3}
            placeholder="Describe brevemente el producto que necesitas..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Micras
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                Espesor del material
              </span>
            </label>

            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={micraje}
                onChange={(event) =>
                  setMicraje(event.target.value)
                }
                placeholder="50"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-12 text-sm outline-none focus:border-primary"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                µm
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Material
            </label>

            <select
              value={material}
              onChange={(event) =>
                setMaterial(
                  event.target.value as MaterialProducto,
                )
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="PEAD">PEAD</option>
              <option value="PEBD">PEBD</option>
              <option value="PP">PP</option>
            </select>
          </div>
        </div>
      </div>

      {/* Impresión */}
      <div className="border-t border-border pt-6">
        <label className="mb-3 block text-sm font-medium">
          ¿Necesita alguna característica especial?
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setImpresion(!impresion)}
            className={[
              "rounded-lg border px-4 py-2 text-sm transition-colors",
              impresion
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:bg-secondary",
            ].join(" ")}
          >
            {impresion && "✓ "}
            Impresión
          </button>

          {product === "bag" && (
            <>
              <button
                type="button"
                onClick={() => setFuelle(!fuelle)}
                className={[
                  "rounded-lg border px-4 py-2 text-sm transition-colors",
                  fuelle
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-secondary",
                ].join(" ")}
              >
                {fuelle && "✓ "}
                Fuelle
              </button>

              <button
                type="button"
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary"
              >
                Refuerzo
              </button>
            </>
          )}

          {!impresion && !fuelle && (
            <span className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground">
              Ninguna
            </span>
          )}
        </div>
      </div>

      {impresion && (
        <div className="grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Colores de impresión
            </label>

            <input
              type="text"
              value={colorImpresion}
              onChange={(event) =>
                setColorImpresion(event.target.value)
              }
              placeholder="Ej. Rojo, Azul, Negro"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Tipo de impresión
            </label>

            <select
              value={tipoImpresion}
              onChange={(event) =>
                setTipoImpresion(
                  event.target.value as TipoImpresion,
                )
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="corrida">
                Corrida
              </option>

              <option value="dimensionada">
                Dimensionada
              </option>
            </select>
          </div>
        </div>
      )}

      {/* Bolsa */}
      {product === "bag" && (
        <div className="space-y-5 border-t border-border pt-6">
          <h4 className="font-medium">
            Medidas y características de la bolsa
          </h4>

          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              label="Ancho doblado"
              value={anchoDoblado}
              onChange={setAnchoDoblado}
            />

            <InputField
              label="Ancho desdoblado"
              value={anchoDesdoblado}
              onChange={setAnchoDesdoblado}
            />

            <InputField
              label="Largo doblado"
              value={largoDoblado}
              onChange={setLargoDoblado}
            />

            <InputField
              label="Largo desdoblado"
              value={largoDesdoblado}
              onChange={setLargoDesdoblado}
            />

            <div>
              <label className="mb-2 block text-sm font-medium">
                Tipo de sello
              </label>

              <select
                value={tipoSello}
                onChange={(event) =>
                  setTipoSello(event.target.value)
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="fondo">Fondo</option>
                <option value="lateral">Lateral</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Tipo de troquel
              </label>

              <select
                value={tipoTroquel}
                onChange={(event) =>
                  setTipoTroquel(event.target.value)
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">
                  Seleccionar
                </option>
                <option value="camiseta">
                  Camiseta
                </option>
                <option value="boutique">
                  Boutique
                </option>
                <option value="aza">
                  Asa
                </option>
                <option value="boutique_reforzado">
                  Boutique reforzado
                </option>
              </select>
            </div>

            <InputField
              label="Pestaña"
              value={pestana}
              onChange={setPestana}
              placeholder="Opcional"
            />
          </div>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Otras características
        </label>

        <textarea
          value={otrasCaracteristicas}
          onChange={(event) =>
            setOtrasCaracteristicas(event.target.value)
          }
          rows={4}
          placeholder="Características adicionales..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: InputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}