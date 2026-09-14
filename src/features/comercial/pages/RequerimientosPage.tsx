import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useCuentasComerciales,
} from "../comercial.hooks";

import type {
  MaterialProducto,
  Opacidad,
  PrioridadSolicitud,
  TipoImpresion,
  TratamientoAcabadoEspecial,
  TratamientoImpresion,
  TipoSello,
  TipoTroquel,
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
  const navigate = useNavigate();
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
    useState<MaterialProducto>("pebd");

  const [micraje, setMicraje] =
    useState("");

  const [colorBolsa, setColorBolsa] =
    useState("");

  const [opacidad, setOpacidad] =
    useState<Opacidad>("media");

  const [
    tratamientosAcabadosEspeciales,
    setTratamientosAcabadosEspeciales,
  ] = useState<TratamientoAcabadoEspecial[]>([]);

  /*
   * Impresión
   */
  const [impresion, setImpresion] =
    useState(false);

  const [colorImpresion, setColorImpresion] =
    useState("");

  const [tipoImpresion, setTipoImpresion] =
    useState<TipoImpresion>("corrida");

  const [tratamientoImpresion, setTratamientoImpresion] =
    useState<TratamientoImpresion>("solido");

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

  const [fuelleIzquierdo, setFuelleIzquierdo] =
    useState("");

  const [fuelleDerecho, setFuelleDerecho] =
    useState("");

  const [fuelleInferior, setFuelleInferior] =
    useState("");

  const [fuelleSuperior, setFuelleSuperior] =
    useState("");

  const [tipoTroquel, setTipoTroquel] =
    useState<TipoTroquel | "">("");

  const [tipoSello, setTipoSello] =
    useState<TipoSello>("fondo");

  const [pestana, setPestana] =
    useState("");

  /*
   * Entrega
   */
  const [cantidadUnidades, setCantidadUnidades] =
    useState("");

  const [cantidadKg, setCantidadKg] =
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

    /*
     * Cliente
     */
    setCuentaComercialId(null);

    /*
     * Producto
     */
    setProduct(null);

    /*
     * Características generales
     */
    setDescripcion("");
    setMaterial("pebd");
    setMicraje("");
    setColorBolsa("");
    setOpacidad("media");
    setTratamientosAcabadosEspeciales([]);

    /*
     * Impresión
     */
    setImpresion(false);
    setColorImpresion("");
    setTipoImpresion("corrida");
    setTratamientoImpresion("solido");

    setOtrasCaracteristicas("");

    /*
     * Características de bolsa
     */
    setAnchoDoblado("");
    setAnchoDesdoblado("");
    setLargoDoblado("");
    setLargoDesdoblado("");

    setFuelle(false);
    setFuelleIzquierdo("");
    setFuelleDerecho("");
    setFuelleInferior("");
    setFuelleSuperior("");

    setTipoTroquel("");
    setTipoSello("fondo");
    setPestana("");

    /*
     * Entrega
     */
    setCantidadUnidades("");
    setCantidadKg("");
    setPrioridad("normal");
    setFechaEntrega("");
    setObservaciones("");
  };

  /*
   * Todavía no hacemos los POST.
   * Primero terminamos la estructura visual.
   */
  const handleSubmit = () => {
    try {
    console.log("Requerimiento:", {
      cuenta_comercial: cuentaComercialId,

      producto: product,

      /*
       * Especificación general
       */
      descripcion,
      material,
      micraje,
      color_bolsa: colorBolsa,
      opacidad,
      tratamientos_acabados_especiales:
        tratamientosAcabadosEspeciales,

      /*
       * Impresión
       */
      impresion,
      color_impresion: colorImpresion,
      tipo_impresion: tipoImpresion,
      tratamiento_impresion: tratamientoImpresion,

      otras_caracteristicas: otrasCaracteristicas,

      /*
       * Especificación de bolsa
       */
      bolsa: {
        ancho_doblado: anchoDoblado,
        ancho_desdoblado: anchoDesdoblado,
        largo_doblado: largoDoblado,
        largo_desdoblado: largoDesdoblado,

        fuelle,
        fuelle_izquierdo: fuelleIzquierdo,
        fuelle_derecho: fuelleDerecho,
        fuelle_inferior: fuelleInferior,
        fuelle_superior: fuelleSuperior,

        tipo_troquel: tipoTroquel,
        tipo_sello: tipoSello,
        pestana,
      },

      /*
       * Solicitud
       */
      cantidad_unidades: cantidadUnidades,
      cantidad_kg: cantidadKg,
      prioridad,
      fecha_entrega: fechaEntrega,
      observaciones,
    });

    navigate("/comercial");
    } catch(error) {
      console.log("Erro al registra requerimiento", error)
    }
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
            cantidadUnidades={cantidadUnidades}
            setCantidadUnidades={setCantidadUnidades}
            cantidadKg={cantidadKg}
            setCantidadKg={setCantidadKg}

            /*
             * Características generales
             */
            descripcion={descripcion}
            setDescripcion={setDescripcion}

            material={material}
            setMaterial={setMaterial}

            micraje={micraje}
            setMicraje={setMicraje}

            colorBolsa={colorBolsa}
            setColorBolsa={setColorBolsa}

            opacidad={opacidad}
            setOpacidad={setOpacidad}

            tratamientosAcabadosEspeciales={
              tratamientosAcabadosEspeciales
            }
            setTratamientosAcabadosEspeciales={
              setTratamientosAcabadosEspeciales
            }

            /*
             * Impresión
             */
            impresion={impresion}
            setImpresion={setImpresion}

            colorImpresion={colorImpresion}
            setColorImpresion={setColorImpresion}

            tipoImpresion={tipoImpresion}
            setTipoImpresion={setTipoImpresion}

            tratamientoImpresion={
              tratamientoImpresion
            }
            setTratamientoImpresion={
              setTratamientoImpresion
            }

            otrasCaracteristicas={
              otrasCaracteristicas
            }
            setOtrasCaracteristicas={
              setOtrasCaracteristicas
            }

            /*
             * Dimensiones de bolsa
             */
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

            /*
             * Fuelle
             */
            fuelle={fuelle}
              setFuelle={setFuelle}

            fuelleIzquierdo={
              fuelleIzquierdo
            }
            setFuelleIzquierdo={
              setFuelleIzquierdo
            }

            fuelleDerecho={fuelleDerecho}
            setFuelleDerecho={
              setFuelleDerecho
            }

            fuelleInferior={fuelleInferior}
            setFuelleInferior={
              setFuelleInferior
            }

            fuelleSuperior={fuelleSuperior}
            setFuelleSuperior={
              setFuelleSuperior
            }

            /*
             * Terminaciones de bolsa
             */
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
            cantidadUnidades={
              cantidadUnidades
            }
            setCantidadUnidades={
              setCantidadUnidades
            }

            cantidadKg={cantidadKg}
            setCantidadKg={setCantidadKg}

            prioridad={prioridad}
            setPrioridad={setPrioridad}

            fechaEntrega={fechaEntrega}
            setFechaEntrega={setFechaEntrega}

            observaciones={observaciones}
            setObservaciones={
              setObservaciones
            }
          />
        )}

        {step === 5 && (
          <RequerimientoStepConfirmacion
            cuentaSeleccionada={
              cuentaSeleccionada
            }

            product={product}

            cantidadUnidades={
              cantidadUnidades
            }
            cantidadKg={cantidadKg}

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