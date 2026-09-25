//////////////////////////
//COMPONENTE PADRE
//Guarda todos los datos del formulario
//Decide que paso mostrar step1, ....
/////////////////////////
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Toast from "@/components/ui/Toast";
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
  PosicionImpresion,
  VarianteColorSolicitadaCreate,
  TipoCapa,
  CaraImpresion,
  TipoPestana,
} from "../comercial.types";
import { useProductosCategorias } from "@/features/productos/productos.hooks";
import RequerimientoSteps from "../components/requerimientos/RequerimientoSteps";
import RequerimientoStepCliente from "../components/requerimientos/RequerimientoStepCliente";
import RequerimientoStepProducto, {
  type ProductType,
} from "../components/requerimientos/RequerimientoStepProducto";
import RequerimientoStepDetalles from "../components/requerimientos/RequerimientoStepDetalles";
import RequerimientoStepEntrega from "../components/requerimientos/RequerimientoStepEntrega";
import RequerimientoStepConfirmacion from "../components/requerimientos/RequerimientoStepConfirmacion";
import RequerimientoNavigation from "../components/requerimientos/RequerimientoNavigation";

import {
  crearRequerimiento,
  type RequerimientoFormData,
} from "@/features/comercial/components/requerimientos/requerimiento.service";

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
    useState<MaterialProducto>("PEBD");

  const [micraje, setMicraje] =
    useState("");

  const [colorBolsa, setColorBolsa] =
    useState("");

  const [variantesColor, setVariantesColor] =
    useState<VarianteColorSolicitadaCreate[]>([]);

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

  const [posicionImpresion, setPosicionImpresion] =
    useState<PosicionImpresion>("centrada");

  const [distanciaImpresionSuperior, setDistanciaImpresionSuperior] =
    useState("");

  const [distanciaImpresionInferior, setDistanciaImpresionInferior] =
    useState("");

  const [distanciaImpresionIzquierda, setDistanciaImpresionIzquierda] =
    useState("");

  const [distanciaImpresionDerecha, setDistanciaImpresionDerecha] =
    useState("");

  const [otrasCaracteristicas, setOtrasCaracteristicas] =
    useState("");

  const [caraImpresion, setCaraImpresion] =
    useState<CaraImpresion | "">("");

  const [capas, setCapas] =
    useState<TipoCapa | "">("");

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

  const [tipoPestana, setTipoPestana] =
    useState<TipoPestana | "">("sin_pestana")

  const [aptoAlimento, setAptoAlimento] =
    useState(false);

  /**
   * CARACTERISTICAS DE LA BOBINA
   * 
   *  */
  const [anchoBobina, setAnchoBobina] = useState("");
  const [diametro, setDiametro] = useState("");
  const [diametroNucleo, setDiametroNucleo] = useState("");
  const [tipoNucleo, setTipoNucleo] = useState("");
  const [peso, setPeso] = useState("");
  const [longitud, setLongitud] = useState("");
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

  const [lugarEntrega, setLugarEntrega] =
    useState("");

  const [observaciones, setObservaciones] =
    useState("");

  //TOAST
  const [toast, setToast] = useState(false);
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

  const { data: categorias = [] } =
    useProductosCategorias();

  const categoriaSeleccionada = categorias.find((categoria) => {
    if (product === "bag") {
      return categoria.nombre.toLowerCase() === "bolsas";
    }

    if (product === "roll") {
      return categoria.nombre.toLowerCase() === "bobinas";
    }

    return false;
  });

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
     * Producto
     */
    setProduct(null);
    /*
     * Características generales
     */
    setDescripcion("");
    setMaterial("PEBD");
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

    setPosicionImpresion("centrada");
    setDistanciaImpresionSuperior("");
    setDistanciaImpresionInferior("");
    setDistanciaImpresionIzquierda("");
    setDistanciaImpresionDerecha("");
    setCaraImpresion("");

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
    setTipoPestana("sin_pestana");
    setCapas("");

    //Caracteristicas de bobina
    setAnchoBobina("");
    setDiametro("");
    setDiametroNucleo("");
    setTipoNucleo("");
    setPeso("");
    setLongitud("");

    /*
     * Entrega
     */
    setCantidadUnidades("");
    setCantidadKg("");
    setPrioridad("normal");
    setFechaEntrega("");
    setLugarEntrega("");
    setObservaciones("");
  };

  /*
   * Todavía no hacemos los POST.
   * Primero terminamos la estructura visual.
   */
  const handleSubmit = async () => {
    try {
      if (!cuentaComercialId) {
        throw new Error(
          "Debe seleccionar un cliente.",
        );
      }

      if (!categoriaSeleccionada) {
        throw new Error(
          "No se encontró una categoría de producto.",
        );
      }

      if (!product) {
        throw new Error(
          "Debe seleccionar un tipo de producto.",
        );
      }

      const formData: RequerimientoFormData = {
        cuentaComercialId,
        product,
        categoriaProductoId:
          categoriaSeleccionada.id,

        descripcion,
        material,
        micraje,
        colorBolsa,
        opacidad,
        aptoAlimento,
        tratamientosAcabadosEspeciales,
        variantesColor,

        impresion,
        colorImpresion,
        tipoImpresion,
        tratamientoImpresion,
        posicionImpresion,
        caraImpresion,

        distanciaImpresionSuperior,
        distanciaImpresionInferior,
        distanciaImpresionIzquierda,
        distanciaImpresionDerecha,

        otrasCaracteristicas,

        anchoDoblado,
        anchoDesdoblado,
        largoDoblado,
        largoDesdoblado,

        fuelle,
        fuelleIzquierdo,
        fuelleDerecho,
        fuelleInferior,
        fuelleSuperior,

        tipoTroquel,
        tipoSello,
        capas,
        tipoPestana,

        cantidadUnidades,
        cantidadKg,
        prioridad,
        fechaEntrega,
        lugarEntrega,
        observaciones,

        anchoBobina,
        diametro,
        diametroNucleo,
        tipoNucleo,
        peso,
        longitud,
      };

      const resultado = await crearRequerimiento(formData);

      console.log(
        "Requerimiento creado correctamente:",
        resultado,
      );

      setToast(true);

      setTimeout(() => {
        navigate("/comercial");
      }, 1500);

    } catch (error) {
      console.error(
        "Error al registrar requerimiento:",
        error,
      );
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

            variantesColor={variantesColor}
            setVariantesColor={setVariantesColor}

            opacidad={opacidad}
            setOpacidad={setOpacidad}

            tratamientosAcabadosEspeciales={
              tratamientosAcabadosEspeciales
            }
            setTratamientosAcabadosEspeciales={
              setTratamientosAcabadosEspeciales
            }

            aptoAlimento={aptoAlimento}
            setAptoAlimento={setAptoAlimento}


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

            posicionImpresion={posicionImpresion}
            setPosicionImpresion={setPosicionImpresion}

            distanciaImpresionSuperior={distanciaImpresionSuperior}
            setDistanciaImpresionSuperior={setDistanciaImpresionSuperior}

            distanciaImpresionInferior={distanciaImpresionInferior}
            setDistanciaImpresionInferior={setDistanciaImpresionInferior}

            distanciaImpresionIzquierda={distanciaImpresionIzquierda}
            setDistanciaImpresionIzquierda={setDistanciaImpresionIzquierda}

            distanciaImpresionDerecha={distanciaImpresionDerecha}
            setDistanciaImpresionDerecha={setDistanciaImpresionDerecha}

            caraImpresion={caraImpresion}
            setCaraImpresion={setCaraImpresion}

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

            capas={capas}
            setCapas={setCapas}

            /*
             * Terminaciones de bolsa
             */
            tipoTroquel={tipoTroquel}
            setTipoTroquel={setTipoTroquel}

            tipoSello={tipoSello}
            setTipoSello={setTipoSello}

            tipoPestana={tipoPestana}
            setTipoPestana={setTipoPestana}

            // Características de bobina
            anchoBobina={anchoBobina}
            setAnchoBobina={setAnchoBobina}

            diametro={diametro}
            setDiametro={setDiametro}

            diametroNucleo={diametroNucleo}
            setDiametroNucleo={setDiametroNucleo}

            tipoNucleo={tipoNucleo}
            setTipoNucleo={setTipoNucleo}

            peso={peso}
            setPeso={setPeso}

            longitud={longitud}
            setLongitud={setLongitud}
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

            lugarEntrega={lugarEntrega}
            setLugarEntrega={setLugarEntrega}

            observaciones={observaciones}
            setObservaciones={
              setObservaciones
            }
          />
        )}

        {step === 5 && (
          <RequerimientoStepConfirmacion
            cuentaSeleccionada={cuentaSeleccionada}
            product={product}

            cantidadUnidades={cantidadUnidades}
            cantidadKg={cantidadKg}
            prioridad={prioridad}
            fechaEntrega={fechaEntrega}

            descripcion={descripcion}
            observaciones={observaciones}
            lugarEntrega={lugarEntrega}

            material={material}
            aptoAlimento={aptoAlimento}
            micraje={micraje}
            colorBolsa={colorBolsa}
            opacidad={opacidad}
            capas={capas}

            variantesColor={variantesColor}

            tratamientosAcabadosEspeciales={
              tratamientosAcabadosEspeciales
            }

            impresion={impresion}
            colorImpresion={colorImpresion}
            tipoImpresion={tipoImpresion}
            tratamientoImpresion={tratamientoImpresion}
            caraImpresion={caraImpresion}
            posicionImpresion={posicionImpresion}
            distanciaImpresionSuperior={distanciaImpresionSuperior}
            distanciaImpresionInferior={distanciaImpresionInferior}
            distanciaImpresionIzquierda={distanciaImpresionIzquierda}
            distanciaImpresionDerecha={distanciaImpresionDerecha}

            otrasCaracteristicas={otrasCaracteristicas}

            anchoDoblado={anchoDoblado}
            anchoDesdoblado={anchoDesdoblado}
            largoDoblado={largoDoblado}
            largoDesdoblado={largoDesdoblado}

            fuelle={fuelle}
            fuelleIzquierdo={fuelleIzquierdo}
            fuelleDerecho={fuelleDerecho}
            fuelleInferior={fuelleInferior}
            fuelleSuperior={fuelleSuperior}

            tipoTroquel={tipoTroquel}
            tipoSello={tipoSello}
            tipoPestana={tipoPestana}

            // Bobina
            anchoBobina={anchoBobina}
            diametro={diametro}
            diametroNucleo={diametroNucleo}
            tipoNucleo={tipoNucleo}
            peso={peso}
            longitud={longitud}
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
      <Toast
        open={toast}
        title="Requerimiento registrado"
        description="Se registró automáticamente la actividad de seguimiento."
        onClose={() => setToast(false)}
      />
    </div>
  );
}