import { useState } from "react";

import {
  useCuentasComerciales,
} from "../comercial.hooks";

import type {
  MaterialProducto,
  PrioridadSolicitud,
  TipoImpresion,
} from "../comercial.types";

import RequerimientoSteps from "../components/requerimientos/RequerimientoSteps";
import RequerimientoStepCliente from "../components/requerimientos/RequerimientoStepCliente";
import RequerimientoStepProducto, {
  type ProductType,
} from "../components/requerimientos/RequerimientoStepProducto";
import RequerimientoStepDetalles from "../components/requerimientos/RequerimientoStepDetalles";
import RequerimientoStepEntrega from "../components/requerimientos/RequerimientoStepEntrega";
import RequerimientoStepConfirmacion from "../components/requerimientos/RequerimientoStepConfirmacion";
import RequerimientoNavigation from "../components/requerimientos/RequerimientoNavigation";

export type RequirementStep = 1 | 2 | 3 | 4 | 5;

export default function RequerimientosPage() {
  const [step, setStep] = useState<RequirementStep>(1);

  /*
   * Cliente
   */
  const [cuentaComercialId, setCuentaComercialId] =
    useState<number | null>(null);

  /*
   * Producto
   */
  const [product, setProduct] =
    useState<ProductType>(null);

  /*
   * Características generales
   */
  const [descripcion, setDescripcion] =
    useState("");

  const [material, setMaterial] =
    useState<MaterialProducto>("PEBD");

  const [micraje, setMicraje] =
    useState("");

  const [colorBolsa, setColorBolsa] =
    useState("");

  const [impresion, setImpresion] =
    useState(false);

  const [colorImpresion, setColorImpresion] =
    useState("");

  const [tipoImpresion, setTipoImpresion] =
    useState<TipoImpresion>("corrida");

  const [otrasCaracteristicas, setOtrasCaracteristicas] =
    useState("");

  /*
   * Características de bolsa
   */
  const [anchoDoblado, setAnchoDoblado] =
    useState("");

  const [anchoDesdoblado, setAnchoDesdoblado] =
    useState("");

  const [largoDoblado, setLargoDoblado] =
    useState("");

  const [largoDesdoblado, setLargoDesdoblado] =
    useState("");

  const [fuelle, setFuelle] =
    useState(false);

  const [tipoTroquel, setTipoTroquel] =
    useState("");

  const [tipoSello, setTipoSello] =
    useState("fondo");

  const [pestana, setPestana] =
    useState("");

  /*
   * Entrega
   */
  const [cantidad, setCantidad] =
    useState("");

  const [prioridad, setPrioridad] =
    useState<PrioridadSolicitud>("normal");

  const [fechaEntrega, setFechaEntrega] =
    useState("");

  const [observaciones, setObservaciones] =
    useState("");

  /*
   * Cliente seleccionado
   *
   * React Query reutiliza la información que ya
   * obtuvo RequerimientoStepCliente.
   */
  const { data: cuentas } =
    useCuentasComerciales();

  const cuentaSeleccionada = cuentas?.find(
    (cuenta) =>
      cuenta.id === cuentaComercialId,
  );

  /*
   * Navegación
   */
  const nextStep = () => {
    setStep(
      (current) =>
        Math.min(
          current + 1,
          5,
        ) as RequirementStep,
    );
  };

  const previousStep = () => {
    setStep(
      (current) =>
        Math.max(
          current - 1,
          1,
        ) as RequirementStep,
    );
  };

  /*
   * Por ahora solo reinicia el formulario.
   * Después podemos convertir esto en "Guardar borrador".
   */
  const resetWizard = () => {
    setStep(1);

    setCuentaComercialId(null);

    setProduct(null);

    setDescripcion("");
    setMaterial("PEBD");
    setMicraje("");
    setColorBolsa("");
    setImpresion(false);
    setColorImpresion("");
    setTipoImpresion("corrida");
    setOtrasCaracteristicas("");

    setAnchoDoblado("");
    setAnchoDesdoblado("");
    setLargoDoblado("");
    setLargoDesdoblado("");
    setFuelle(false);
    setTipoTroquel("");
    setTipoSello("fondo");
    setPestana("");

    setCantidad("");
    setPrioridad("normal");
    setFechaEntrega("");
    setObservaciones("");
  };

  /*
   * Todavía no hacemos los POST.
   * Primero terminamos la estructura visual.
   */
  const handleSubmit = () => {
    console.log("Requerimiento:", {
      cuenta_comercial: cuentaComercialId,

      producto: product,

      descripcion,
      material,
      micraje,
      color_bolsa: colorBolsa,
      impresion,
      color_impresion: colorImpresion,
      tipo_impresion: tipoImpresion,
      otras_caracteristicas: otrasCaracteristicas,

      bolsa: {
        ancho_doblado: anchoDoblado,
        ancho_desdoblado: anchoDesdoblado,
        largo_doblado: largoDoblado,
        largo_desdoblado: largoDesdoblado,
        fuelle,
        tipo_troquel: tipoTroquel,
        tipo_sello: tipoSello,
        pestana,
      },

      cantidad,
      prioridad,
      fecha_entrega: fechaEntrega,
      observaciones,
    });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Nuevo requerimiento
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Registra las necesidades del cliente para iniciar la evaluación comercial.
        </p>
      </div>

      {/* Progreso */}
      <RequerimientoSteps step={step} />

      {/* Contenido del paso */}
      <div className="min-h-[500px] rounded-xl border border-border bg-card p-6">
        {step === 1 && (
          <RequerimientoStepCliente
            cuentaComercialId={cuentaComercialId}
            setCuentaComercialId={
              setCuentaComercialId
            }
          />
        )}

        {step === 2 && (
          <RequerimientoStepProducto
            product={product}
            setProduct={setProduct}
          />
        )}

        {step === 3 && (
          <RequerimientoStepDetalles
            product={product}

            descripcion={descripcion}
            setDescripcion={setDescripcion}

            material={material}
            setMaterial={setMaterial}

            micraje={micraje}
            setMicraje={setMicraje}

            colorBolsa={colorBolsa}
            setColorBolsa={setColorBolsa}

            impresion={impresion}
            setImpresion={setImpresion}

            colorImpresion={colorImpresion}
            setColorImpresion={setColorImpresion}

            tipoImpresion={tipoImpresion}
            setTipoImpresion={setTipoImpresion}

            otrasCaracteristicas={
              otrasCaracteristicas
            }
            setOtrasCaracteristicas={
              setOtrasCaracteristicas
            }

            anchoDoblado={anchoDoblado}
            setAnchoDoblado={setAnchoDoblado}

            anchoDesdoblado={anchoDesdoblado}
            setAnchoDesdoblado={
              setAnchoDesdoblado
            }

            largoDoblado={largoDoblado}
            setLargoDoblado={setLargoDoblado}

            largoDesdoblado={largoDesdoblado}
            setLargoDesdoblado={
              setLargoDesdoblado
            }

            fuelle={fuelle}
            setFuelle={setFuelle}

            tipoTroquel={tipoTroquel}
            setTipoTroquel={setTipoTroquel}

            tipoSello={tipoSello}
            setTipoSello={setTipoSello}

            pestana={pestana}
            setPestana={setPestana}
          />
        )}

        {step === 4 && (
          <RequerimientoStepEntrega
            cantidad={cantidad}
            setCantidad={setCantidad}

            prioridad={prioridad}
            setPrioridad={setPrioridad}

            fechaEntrega={fechaEntrega}
            setFechaEntrega={setFechaEntrega}

            observaciones={observaciones}
            setObservaciones={setObservaciones}
          />
        )}

        {step === 5 && (
          <RequerimientoStepConfirmacion
            cuentaSeleccionada={
              cuentaSeleccionada
            }

            product={product}

            cantidad={cantidad}
            prioridad={prioridad}
            fechaEntrega={fechaEntrega}

            descripcion={descripcion}
            observaciones={observaciones}
          />
        )}
      </div>

      {/* Navegación */}
      <RequerimientoNavigation
        step={step}
        onNext={nextStep}
        onPrevious={previousStep}
        onCancel={resetWizard}
        onSubmit={handleSubmit}
      />
    </div>
  );
}