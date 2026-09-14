import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Package,
  Palette,
  Ruler,
  Settings2,
  Sparkles,
} from "lucide-react";

import type {
  MaterialProducto,
  Opacidad,
  TipoImpresion,
  TratamientoAcabadoEspecial,
  TratamientoImpresion,
  TipoSello,
  TipoTroquel,
} from "../../comercial.types";

import type { ProductType } from "./RequerimientoStepProducto";

interface RequerimientoStepDetallesProps {
  product: ProductType;

  // Cantidad solicitada
  cantidadUnidades: string;
  setCantidadUnidades: (value: string) => void;
  cantidadKg: string;
  setCantidadKg: (value: string) => void;

  // Información general
  descripcion: string;
  setDescripcion: (value: string) => void;
  material: MaterialProducto;
  setMaterial: (value: MaterialProducto) => void;
  micraje: string;
  setMicraje: (value: string) => void;
  colorBolsa: string;
  setColorBolsa: (value: string) => void;
  opacidad: Opacidad;
  setOpacidad: (value: Opacidad) => void;

  tratamientosAcabadosEspeciales: TratamientoAcabadoEspecial[];
  setTratamientosAcabadosEspeciales: (
    value: TratamientoAcabadoEspecial[],
  ) => void;

  // Impresión
  impresion: boolean;
  setImpresion: (value: boolean) => void;
  colorImpresion: string;
  setColorImpresion: (value: string) => void;
  tipoImpresion: TipoImpresion;
  setTipoImpresion: (value: TipoImpresion) => void;
  tratamientoImpresion: TratamientoImpresion;
  setTratamientoImpresion: (value: TratamientoImpresion) => void;
  otrasCaracteristicas: string;
  setOtrasCaracteristicas: (value: string) => void;

  // Dimensiones
  anchoDoblado: string;
  setAnchoDoblado: (value: string) => void;
  anchoDesdoblado: string;
  setAnchoDesdoblado: (value: string) => void;
  largoDoblado: string;
  setLargoDoblado: (value: string) => void;
  largoDesdoblado: string;
  setLargoDesdoblado: (value: string) => void;

  // Fuelle
  fuelle: boolean;
  setFuelle: (value: boolean) => void;
  fuelleIzquierdo: string;
  setFuelleIzquierdo: (value: string) => void;
  fuelleDerecho: string;
  setFuelleDerecho: (value: string) => void;
  fuelleInferior: string;
  setFuelleInferior: (value: string) => void;
  fuelleSuperior: string;
  setFuelleSuperior: (value: string) => void;

  // Bolsa
  tipoTroquel: TipoTroquel | "";
  setTipoTroquel: (value: TipoTroquel | "") => void;
  tipoSello: TipoSello;
  setTipoSello: (value: TipoSello) => void;
  pestana: string;
  setPestana: (value: string) => void;
}

const tratamientosDisponibles: {
  value: TratamientoAcabadoEspecial;
  label: string;
  description: string;
}[] = [
    {
      value: "film_aromatizado",
      label: "Film aromatizado",
      description: "Aroma incorporado al material",
    },
    {
      value: "oxobiodegradable",
      label: "Oxobiodegradable",
      description: "Tratamiento oxobiodegradable",
    },
    {
      value: "perforada",
      label: "Perforada",
      description: "Perforaciones en el material",
    },
    {
      value: "precorte",
      label: "Precorte",
      description: "Cortes preparados",
    },
  ];

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10";

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Package;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-start gap-3 border-b border-border bg-muted/20 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{title}</h4>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  type = "text",
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  type?: "text" | "number" | "select";
  options?: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative">
          <input
            type={type}
            step={type === "number" ? "0.01" : undefined}
            min={type === "number" ? "0" : undefined}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${inputClass} ${suffix ? "pr-14" : ""}`}
          />
          {suffix && (
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
              {suffix}
            </span>
          )}
        </div>
      )}
      {hint && (
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export default function RequerimientoStepDetalles(
  props: RequerimientoStepDetallesProps,
) {
  const {
    product,
    cantidadUnidades,
    setCantidadUnidades,
    cantidadKg,
    setCantidadKg,
    descripcion,
    setDescripcion,
    material,
    setMaterial,
    micraje,
    setMicraje,
    colorBolsa,
    setColorBolsa,
    opacidad,
    setOpacidad,
    tratamientosAcabadosEspeciales,
    setTratamientosAcabadosEspeciales,
    impresion,
    setImpresion,
    colorImpresion,
    setColorImpresion,
    tipoImpresion,
    setTipoImpresion,
    tratamientoImpresion,
    setTratamientoImpresion,
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
    fuelleIzquierdo,
    setFuelleIzquierdo,
    fuelleDerecho,
    setFuelleDerecho,
    fuelleInferior,
    setFuelleInferior,
    fuelleSuperior,
    setFuelleSuperior,
    tipoTroquel,
    setTipoTroquel,
    tipoSello,
    setTipoSello,
    pestana,
    setPestana,
  } = props;

  const [fuelleDerechoEditado, setFuelleDerechoEditado] = useState(false);
  const [mostrarAvanzado, setMostrarAvanzado] = useState(false);
  const [mostrarOtras, setMostrarOtras] = useState(false);
  const fuelleInicialRef = useRef(false);

  useEffect(() => {
    if (!fuelle) {
      fuelleInicialRef.current = false;
      setFuelleDerechoEditado(false);
    }
  }, [fuelle]);

  useEffect(() => {
    if (
      fuelle &&
      fuelleIzquierdo &&
      !fuelleDerechoEditado &&
      !fuelleInicialRef.current
    ) {
      setFuelleDerecho(fuelleIzquierdo);
      fuelleInicialRef.current = true;
    }
  }, [
    fuelle,
    fuelleIzquierdo,
    fuelleDerechoEditado,
    setFuelleDerecho,
  ]);
  useEffect(() => {
    if (!anchoDoblado) {
      setAnchoDesdoblado("");
      return;
    }

    const ancho = Number(anchoDoblado) || 0;
    const izquierdo = fuelle
      ? Number(fuelleIzquierdo) || 0
      : 0;
    const derecho = fuelle
      ? Number(fuelleDerecho) || 0
      : 0;

    setAnchoDesdoblado(
      String(ancho + izquierdo + derecho),
    );
  }, [
    anchoDoblado,
    fuelle,
    fuelleIzquierdo,
    fuelleDerecho,
    setAnchoDesdoblado,
  ]);
  useEffect(() => {
    if (!largoDoblado) {
      setLargoDesdoblado("");
      return;
    }

    const largo = Number(largoDoblado) || 0;
    const inferior = fuelle
      ? Number(fuelleInferior) || 0
      : 0;
    const superior = fuelle
      ? Number(fuelleSuperior) || 0
      : 0;

    setLargoDesdoblado(
      String(largo + inferior + superior),
    );
  }, [
    largoDoblado,
    fuelle,
    fuelleInferior,
    fuelleSuperior,
    setLargoDesdoblado,
  ]);

  const toggleTratamiento = (value: TratamientoAcabadoEspecial) => {
    if (tratamientosAcabadosEspeciales.includes(value)) {
      setTratamientosAcabadosEspeciales(
        tratamientosAcabadosEspeciales.filter((item) => item !== value),
      );
    } else {
      setTratamientosAcabadosEspeciales([
        ...tratamientosAcabadosEspeciales,
        value,
      ]);
    }
  };

  const ancho = Number(anchoDoblado) || 0;
  const izquierdo = fuelle
    ? Number(fuelleIzquierdo) || 0
    : 0;
  const derecho = fuelle
    ? Number(fuelleDerecho) || 0
    : 0;

  const anchoTotal = ancho + izquierdo + derecho;

  const setAncho = (value: string) => {
    setAnchoDoblado(value);

    const base = Number(value) || 0;
    const izquierdo = fuelle
      ? Number(fuelleIzquierdo) || 0
      : 0;
    const derecho = fuelle
      ? Number(fuelleDerecho) || 0
      : 0;

    setAnchoDesdoblado(
      value
        ? String(base + izquierdo + derecho)
        : "",
    );
  };

  const setLargo = (value: string) => {
    setLargoDoblado(value);

    const base = Number(value) || 0;
    const inferior = fuelle
      ? Number(fuelleInferior) || 0
      : 0;
    const superior = fuelle
      ? Number(fuelleSuperior) || 0
      : 0;

    setLargoDesdoblado(
      value
        ? String(base + inferior + superior)
        : "",
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">
            {product === "roll"
              ? "Detalles de la bobina"
              : product === "bag"
                ? "Detalles de la bolsa"
                : "Detalles del producto"}
          </h3>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
            Paso 3
          </span>
        </div>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Indica primero cuánto necesita el cliente y después las características
          del producto. Solo completa lo que conozcas.
        </p>
      </div>

      {/* 1. CANTIDAD */}
      <Section
        icon={Package}
        title="¿Cuánto necesita?"
        description="Esta es la cantidad solicitada por el cliente."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Cantidad de unidades"
            value={cantidadUnidades}
            onChange={setCantidadUnidades}
            placeholder="Ej. 10000"
            suffix="unid."
            type="number"
            hint="Número de bolsas, piezas o unidades solicitadas."
          />
          <Field
            label="Cantidad en kilogramos"
            value={cantidadKg}
            onChange={setCantidadKg}
            placeholder="Ej. 250"
            suffix="kg"
            type="number"
            hint="Puedes dejarlo vacío si todavía no se conoce."
          />
        </div>
      </Section>

      {/* 2. INFORMACIÓN */}
      <Section
        icon={Palette}
        title="Material y apariencia"
        description="Características básicas que definen el producto."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            label="Material"
            value={material}
            onChange={(v) => setMaterial(v as MaterialProducto)}
            type="select"
            options={[
              { value: "pead", label: "PEAD" },
              { value: "pebd", label: "PEBD" },
              { value: "pp", label: "PP" },
              { value: "bopp", label: "BOPP" },
              { value: "otro", label: "Otro" },
            ]}
          />
          <Field
            label="Micraje"
            value={micraje}
            onChange={setMicraje}
            placeholder="Ej. 50"
            suffix="µm"
            type="number"
          />
          <Field
            label="Color"
            value={colorBolsa}
            onChange={setColorBolsa}
            placeholder="Ej. transparente"
          />
          <Field
            label="Opacidad"
            value={opacidad}
            onChange={(v) => setOpacidad(v as Opacidad)}
            type="select"
            options={[
              { value: "alta", label: "Alta" },
              { value: "media", label: "Media" },
              { value: "baja", label: "Baja" },
            ]}
          />
        </div>
      </Section>

      {/* 3. DIMENSIONES */}
      {product === "bag" && (
        <Section
          icon={Ruler}
          title="Medidas de la bolsa"
          description="Ingresa las medidas principales. El ancho total se calcula automáticamente cuando hay fuelle."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Ancho"
              value={anchoDoblado}
              onChange={setAncho}
              placeholder="Ej. 30"
              suffix="cm"
              type="number"
              hint="Ancho de la bolsa sin contar el fuelle."
            />
            <Field
              label="Largo"
              value={largoDoblado}
              onChange={setLargo}
              placeholder="Ej. 40"
              suffix="cm"
              type="number"
            />
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Ancho total</p>
              <p className="text-lg font-semibold">
                {anchoTotal > 0 ? `${anchoTotal} cm` : "—"}
              </p>
            </div>
            <div className="rounded-lg bg-background px-3 py-2 text-xs text-muted-foreground">
              Ancho + fuelle A + fuelle B
            </div>
          </div>
        </Section>
      )}

      {/* 4. FUELLE */}
      {product === "bag" && (
        <Section
          icon={Ruler}
          title="¿La bolsa tiene fuelle?"
          description="El fuelle agrega profundidad a la bolsa."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { value: true, title: "Sí, tiene fuelle", text: "Necesito indicar sus medidas." },
              { value: false, title: "No tiene fuelle", text: "La bolsa no lleva fuelle." },
            ].map((option) => (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => setFuelle(option.value)}
                className={`rounded-xl border p-4 text-left transition-all ${fuelle === option.value
                  ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                  : "border-border hover:bg-muted/40"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.title}</span>
                  {fuelle === option.value && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {option.text}
                </p>
              </button>
            ))}
          </div>

          {fuelle && (
            <div className="mt-4 rounded-xl bg-muted/30 p-4">
              <div className="mb-4 flex items-center gap-2">
                <Ruler className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Medidas del fuelle</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field
                  label="Fuelle A"
                  value={fuelleIzquierdo}
                  onChange={(value) => {
                    setFuelleIzquierdo(value);
                    if (!fuelleDerechoEditado) setFuelleDerecho(value);
                  }}
                  placeholder="Ej. 5"
                  suffix="cm"
                  type="number"
                  hint="Izquierdo"
                />
                <Field
                  label="Fuelle B"
                  value={fuelleDerecho}
                  onChange={(value) => {
                    setFuelleDerechoEditado(true);
                    setFuelleDerecho(value);
                  }}
                  placeholder="Ej. 5"
                  suffix="cm"
                  type="number"
                  hint="Derecho"
                />
                <Field
                  label="Fuelle inferior"
                  value={fuelleInferior}
                  onChange={setFuelleInferior}
                  placeholder="Opcional"
                  suffix="cm"
                  type="number"
                />
                <Field
                  label="Fuelle superior"
                  value={fuelleSuperior}
                  onChange={setFuelleSuperior}
                  placeholder="Opcional"
                  suffix="cm"
                  type="number"
                />
              </div>
            </div>
          )}
        </Section>
      )}

      {/* 5. CONFIGURACIÓN */}
      {product === "bag" && (
        <Section
          icon={Settings2}
          title="Configuración de la bolsa"
          description="Selecciona la forma y el tipo de sellado."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Tipo de bolsa / troquel"
              value={tipoTroquel}
              onChange={(v) => setTipoTroquel(v as TipoTroquel | "")}
              type="select"
              options={[
                { value: "", label: "Seleccionar" },
                { value: "camiseta", label: "Camiseta" },
                { value: "normal", label: "Normal" },
                { value: "rinonera", label: "Riñonera" },
                { value: "con_asa", label: "Con asa" },
                { value: "refuerzo", label: "Refuerzo" },
                { value: "solapa", label: "Solapa" },
                { value: "adhesiva", label: "Adhesiva" },
                { value: "cierre_facil", label: "Cierre fácil" },
              ]}
            />
            <Field
              label="Tipo de sello"
              value={tipoSello}
              onChange={(v) => setTipoSello(v as TipoSello)}
              type="select"
              options={[
                { value: "ninguno", label: "Ninguno" },
                { value: "fondo", label: "Fondo" },
                { value: "lateral", label: "Lateral" },
              ]}
            />
            <Field
              label="Pestaña"
              value={pestana}
              onChange={setPestana}
              placeholder="Opcional"
              type="text"
            />
          </div>
        </Section>
      )}

      {/* 6. IMPRESIÓN */}
      <Section
        icon={Palette}
        title="¿Necesita impresión?"
        description="Activa esta opción solo si el cliente quiere imprimir un diseño."
      >
        <button
          type="button"
          onClick={() => setImpresion(!impresion)}
          className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${impresion
            ? "border-primary bg-primary/5 ring-2 ring-primary/10"
            : "border-border hover:bg-muted/40"
            }`}
        >
          <div>
            <p className="font-medium">
              {impresion ? "Sí, requiere impresión" : "No requiere impresión"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {impresion
                ? "Ahora puedes indicar cómo debe realizarse."
                : "Puedes activarlo si el cliente solicita un diseño impreso."}
            </p>
          </div>
          <span
            className={`relative h-6 w-11 rounded-full transition-colors ${impresion ? "bg-primary" : "bg-muted"
              }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${impresion ? "translate-x-6" : "translate-x-1"
                }`}
            />
          </span>
        </button>

        {impresion && (
          <div className="mt-4 grid gap-4 rounded-xl bg-muted/30 p-4 sm:grid-cols-2">
            <Field
              label="Colores de impresión"
              value={colorImpresion}
              onChange={setColorImpresion}
              placeholder="Ej. rojo, azul y negro"
            />
            <Field
              label="Tipo de impresión"
              value={tipoImpresion}
              onChange={(v) => setTipoImpresion(v as TipoImpresion)}
              type="select"
              options={[
                { value: "corrida", label: "Corrida" },
                { value: "dimensionada", label: "Dimensionada" },
              ]}
            />
            <div className="sm:col-span-2">
              <Field
                label="Tratamiento de impresión"
                value={tratamientoImpresion}
                onChange={(v) =>
                  setTratamientoImpresion(v as TratamientoImpresion)
                }
                type="select"
                options={[
                  { value: "solido", label: "Sólido" },
                  { value: "degradado", label: "Degradado" },
                  { value: "trameado", label: "Trameado" },
                ]}
              />
            </div>
          </div>
        )}
      </Section>

      {/* 7. ACABADOS */}
      <Section
        icon={Sparkles}
        title="Tratamientos y acabados"
        description="Selecciona todos los que correspondan."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {tratamientosDisponibles.map((item) => {
            const selected = tratamientosAcabadosEspeciales.includes(item.value);
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => toggleTratamiento(item.value)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${selected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                  : "border-border hover:bg-muted/40"
                  }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border"
                    }`}
                >
                  {selected && <Check className="h-3.5 w-3.5" />}
                </span>
                <span>
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* 8. DESCRIPCIÓN Y AVANZADO */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <button
          type="button"
          onClick={() => setMostrarAvanzado(!mostrarAvanzado)}
          className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/20"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CircleHelp className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold">Descripción y detalles adicionales</p>
              <p className="text-xs text-muted-foreground">
                Usa esta sección para indicaciones especiales del cliente.
              </p>
            </div>
          </div>
          {mostrarAvanzado ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {mostrarAvanzado && (
          <div className="space-y-5 border-t border-border p-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Descripción del producto / diseño
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                placeholder='Ej. Bolsa con diseño de "osito de hielo", según muestra del cliente...'
                className={`${inputClass} resize-none`}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Aquí puedes describir el diseño, uso o cualquier indicación que
                ayude a entender el pedido.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMostrarOtras(!mostrarOtras)}
              className="flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-left hover:bg-muted/30"
            >
              <span className="text-sm font-medium">Otras características</span>
              {mostrarOtras ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {mostrarOtras && (
              <textarea
                value={otrasCaracteristicas}
                onChange={(e) => setOtrasCaracteristicas(e.target.value)}
                rows={4}
                placeholder="Indica cualquier otra característica que deba conocer el área comercial o producción..."
                className={`${inputClass} resize-none`}
              />
            )}
          </div>
        )}
      </section>

      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Consejo:</span>{" "}
        si un dato todavía no lo conoce el cliente, puedes dejarlo vacío y
        completarlo posteriormente.
      </div>

      {/* Mantener compatibilidad con el modelo: los campos desdoblados se
          actualizan internamente y no se muestran como campos independientes. */}
      <input type="hidden" value={anchoDesdoblado} readOnly />
      <input type="hidden" value={largoDesdoblado} readOnly />
    </div>
  );
}
