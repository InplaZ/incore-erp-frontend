//////////////////////////
//COMPONENTE PADRE
//Guarda todos los datos del formulario
//Decide que paso mostrar step1, ....
/////////////////////////
import { useState } from "react";
import Toast from "@/components/ui/Toast";
import {
  useCuentasComerciales,
  useFormalizarCotizacionDesdeWizard,
} from "@/features/comercial/comercial.hooks";

import CotizacionModal, {
  type CotizacionFormData,
} from "@/features/comercial/cotizaciones/CotizacionModal";

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
import { 
  useProductosCategorias,
 } from "@/features/productos/productos.hooks";
import RequerimientoSteps from "../components/requerimientos/RequerimientoSteps";
import RequerimientoStepProducto, {
  type ProductType,
} from "../components/requerimientos/RequerimientoStepProducto";
import RequerimientoStepBusquedaProducto from "../components/requerimientos/RequerimientoStepBusquedaProducto";
import RequerimientoStepDetalles from "../components/requerimientos/RequerimientoStepDetalles";
import RequerimientoStepEntrega from "../components/requerimientos/RequerimientoStepEntrega";
import RequerimientoStepConfirmacion from "../components/requerimientos/RequerimientoStepConfirmacion";
import RequerimientoNavigation from "../components/requerimientos/RequerimientoNavigation";
import ProductoConfirmacionModal from "../components/requerimientos/ProductoConfirmacionModal";

import type {
  ProductoBusquedaResultado,
} from "@/features/comercial/comercial.types";

import type { EvaluarViabilidadResponse } from "@/features/viabilidad/viabilidad.types";
import { useEvaluarViabilidad } from "@/features/viabilidad/viabilidad.hook";

import ViabilidadAnalizando from "@/features/viabilidad/requerimientos/ViabilidadAnalizando";
import ViabilidadResultado from "@/features/viabilidad/requerimientos/ViabilidadResultado";

export type RequirementStep = 1 | 2 | 3 | 4 | 5;

export default function RequerimientosPage() {
  const [step, setStep] = useState<RequirementStep>(1);
  /*
   * Cliente
   */
  const [cuentaComercialId, setCuentaComercialId] =
    useState<number | null>(null);

  /**
   * Viabilidad
   */
  const [resultadoViabilidad, setResultadoViabilidad] =
    useState<EvaluarViabilidadResponse | null>(null)

  const [errorViabilidad, setErrorViabilidad] =
    useState<string | null>(null);
  /**
   * Análisis viabilidad
   */
  const [analizandoViabilidad, setAnalizandoViabilidad] =
    useState(false);

  /*
   * Producto
   */
  const [product, setProduct] =
    useState<ProductType>(null);

  /**
   * Cotizacion
   */
  const [mostrarCotizacion, setMostrarCotizacion] = useState(false);

  /*
   * Selección de producto del catálogo
   */
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<ProductoBusquedaResultado | null>(null);

  const [esProductoNuevo, setEsProductoNuevo] =
    useState(false);

  const [showConfirmacionModal, setShowConfirmacionModal] =
    useState(false);
  /*
   * Características generales
   */

  /**
   * Evaluar viabilidad
   */
  const evaluarViabilidad = useEvaluarViabilidad();

  /**
   * Crear Solicitud comercial - cotización
   */
  const formalizarCotizacion = useFormalizarCotizacionDesdeWizard();

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
  const [toastTitle, setToastTitle] = useState("");
  const [toastDescription, setToastDescription] = useState("");

  const mostrarToast = (title: string, description: string) => {
    setToastTitle(title);
    setToastDescription(description);
    setToast(true);
  };

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
   * Manejo de selección de producto
   */
  const handleProductoSelect = (producto: ProductoBusquedaResultado) => {
    setProductoSeleccionado(producto);
    setShowConfirmacionModal(true);
  };

  const cargarProductoExistente = (
    producto: ProductoBusquedaResultado
  ) => {

    setDescripcion(producto.producto_nombre);

    setMaterial(producto.material);

    setMicraje(
      producto.micraje?.toString() || ""
    );

    setCapas(
      producto.capas || ""
    );

    setImpresion(
      producto.impresion
    );


    // Si es bolsa
    if (
      producto.especificacion_bolsa
    ) {

      const bolsa =
        producto.especificacion_bolsa;

      setAnchoDoblado(
        bolsa.ancho_doblado?.toString() || ""
      );

      setLargoDoblado(
        bolsa.largo_doblado?.toString() || ""
      );

      setTipoTroquel(
        bolsa.tipo_troquel || ""
      );

      setTipoSello(
        bolsa.tipo_sello || "fondo"
      );
    }


    // Si es bobina
    if (
      producto.especificacion_bobina
    ) {

      const bobina =
        producto.especificacion_bobina;

      setAnchoBobina(
        bobina.ancho?.toString() || ""
      );

      setDiametro(
        bobina.diametro?.toString() || ""
      );

      setDiametroNucleo(
        bobina.diametro_nucleo?.toString() || ""
      );

      setPeso(
        bobina.peso?.toString() || ""
      );

      setLongitud(
        bobina.longitud?.toString() || ""
      );
    }
  };



  /*
  * CODIGO PARA NAVEGAR Y CONFIRMAR EL PRODUCTO EXISTENTE SELECCIONADO
  */
  const handleConfirmarProducto = () => {
    if (productoSeleccionado) {
      setEsProductoNuevo(false);
      cargarProductoExistente(productoSeleccionado);
    }

    setShowConfirmacionModal(false);
    setStep(4);
  };

  const handleBuscarOtroProducto = () => {
    setShowConfirmacionModal(false);
    setProductoSeleccionado(null);
  };

  const handleCrearProductoNuevo = () => {
    setEsProductoNuevo(true);
    setProductoSeleccionado(null);
    nextStep();
  };

 const handleCrearCotizacion = async (
    data: CotizacionFormData
  ) => {
    try {
      if (!cuentaComercialId) {
        throw new Error("Debe seleccionar un cliente.");
      }
      if (!esProductoNuevo && !productoSeleccionado) {
        throw new Error("No se encontró la referencia técnica que se evaluó.");
      }
      if (esProductoNuevo && !categoriaSeleccionada) {
        throw new Error("No se encontró la categoría de producto seleccionada.");
      }

      const tipoProducto = product === "bag" ? "bolsa" : "bobina";
      const especificacion = esProductoNuevo ? {
        categoria_producto: categoriaSeleccionada!.id,
        material,
        capas: capas || "monocapa",
        apto_alimento: aptoAlimento,
        micraje: micraje || null,
        color_bolsa: colorBolsa,
        impresion,
        color_impresion: colorImpresion.split(",").map((color) => color.trim()).filter(Boolean),
        tipo_impresion: tipoImpresion,
        tratamiento_impresion: tratamientoImpresion,
        posicion_impresion: posicionImpresion,
        cara_impresion: caraImpresion,
        distancia_impresion_superior: distanciaImpresionSuperior || null,
        distancia_impresion_inferior: distanciaImpresionInferior || null,
        distancia_impresion_izquierda: distanciaImpresionIzquierda || null,
        distancia_impresion_derecha: distanciaImpresionDerecha || null,
        otras_caracteristicas: otrasCaracteristicas,
        opacidad,
        tratamientos_acabados_especiales: tratamientosAcabadosEspeciales,
      } : undefined;

      const resultado = await formalizarCotizacion.mutateAsync({
        solicitud: {
          cuenta_comercial: cuentaComercialId,
          fecha: new Date().toISOString(),
          descripcion: descripcion.trim() || `Solicitud de cotización - ${tipoProducto === "bolsa" ? "Bolsa" : "Bobina"}`,
          cantidad_unidades: cantidadUnidades || "0",
          cantidad_kg: cantidadKg || "0",
          fecha_entrega: fechaEntrega || null,
          lugar_entrega: lugarEntrega,
          observaciones,
          prioridad,
        },
        tipo_producto: tipoProducto,
        producto_version_id: esProductoNuevo ? undefined : productoSeleccionado!.version_id,
        especificacion,
        especificacion_bolsa: esProductoNuevo && tipoProducto === "bolsa" ? {
          ancho_doblado: anchoDoblado,
          ancho_desdoblado: anchoDesdoblado || null,
          largo_doblado: largoDoblado,
          largo_desdoblado: largoDesdoblado || null,
          fuelle,
          fuelle_izquierdo: fuelleIzquierdo || null,
          fuelle_derecho: fuelleDerecho || null,
          fuelle_inferior: fuelleInferior || null,
          fuelle_superior: fuelleSuperior || null,
          tipo_troquel: tipoTroquel || "normal",
          tipo_sello: tipoSello,
          pestana: tipoPestana || "sin_pestana",
          acabado_especial: tratamientosAcabadosEspeciales.join(","),
          otras_caracteristicas: otrasCaracteristicas,
        } : undefined,
        especificacion_bobina: esProductoNuevo && tipoProducto === "bobina" ? {
          ancho: anchoBobina,
          diametro: diametro || null,
          diametro_nucleo: diametroNucleo || null,
          longitud: longitud || null,
          tipo_nucleo: tipoNucleo,
          peso: peso || null,
          otras_caracteristicas: otrasCaracteristicas,
        } : undefined,
        cotizacion: {
          fecha_vencimiento: data.fechaVencimiento || null,
          observaciones: data.observaciones || "",
          moneda: data.moneda,
        },
        detalle: {
          cantidad: data.cantidad,
          precio_lista: data.precioLista,
          descuento_porcentaje: data.descuentoPorcentaje || "0",
          costo_estimado: null,
        },
      });

      // ============================================================
      // 6. ÉXITO
      // ============================================================

      setMostrarCotizacion(false);

      mostrarToast(
        "Cotización creada",
        `Cotización ${resultado.numero} creada correctamente.`
      );

      resetWizard();

    } catch (error: unknown) {
      console.error(
        "Error al crear cotización:",
        error
      );

      const apiMessage = (error as {
        response?: { data?: { mensaje?: string; detail?: string } };
      })?.response?.data?.mensaje || (error as {
        response?: { data?: { detail?: string } };
      })?.response?.data?.detail;

      mostrarToast(
        "Error",
        apiMessage ||
          (error instanceof Error ? error.message : "") ||
          "No se pudo crear la cotización."
      );
    }
  };

  /*
   * Por ahora solo reinicia el formulario.
   * Después podemos convertir esto en "Guardar borrador".
   */
  const resetWizard = () => {
    setStep(1);
    setCuentaComercialId(null);
    setResultadoViabilidad(null);
    setErrorViabilidad(null);
    setAnalizandoViabilidad(false);
    setProductoSeleccionado(null);
    setEsProductoNuevo(false);
    setShowConfirmacionModal(false);
    setMostrarCotizacion(false);

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
    setVariantesColor([]);
    setAptoAlimento(false);
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

  // La evaluación previa solo ejecuta reglas técnicas; no formaliza entidades
  // comerciales ni persiste evaluaciones.
  const handleAnalizarViabilidad = async () => {
    try {
      if (!cuentaComercialId) {
        throw new Error("Debe seleccionar un cliente.");
      }
      if (!esProductoNuevo && !productoSeleccionado) {
        mostrarToast(
          "Producto requerido",
          "Seleccione un producto existente o elija crear uno nuevo."
        );
        return;
      }

      // Limpiar resultado anterior y mostrar estado de análisis
      setResultadoViabilidad(null);
      setErrorViabilidad(null);

      //Mostrar pantalla de análisis
      setAnalizandoViabilidad(true);

      let resultado: EvaluarViabilidadResponse;
      if (!esProductoNuevo) {
        resultado = await evaluarViabilidad.mutateAsync({
          producto_version: productoSeleccionado!.version_id,
          previsualizar: true,
        });
      } else {
        if (!categoriaSeleccionada) throw new Error("No se encontró la categoría de producto seleccionada.");
        const tipoProducto = product === "bag" ? "bolsa" : "bobina";
        resultado = await evaluarViabilidad.mutateAsync({
          datos_especificacion: {
            tipo_producto: tipoProducto,
            especificacion: {
            categoria_producto: categoriaSeleccionada.id,
            material,
            capas: capas || "monocapa",
            apto_alimento: aptoAlimento,
            micraje: micraje || null,
            color_bolsa: colorBolsa,
            impresion,
            color_impresion: colorImpresion.split(",").map((color) => color.trim()).filter(Boolean),
            tipo_impresion: tipoImpresion,
            tratamiento_impresion: tratamientoImpresion,
            posicion_impresion: posicionImpresion,
            cara_impresion: caraImpresion,
            distancia_impresion_superior: distanciaImpresionSuperior || null,
            distancia_impresion_inferior: distanciaImpresionInferior || null,
            distancia_impresion_izquierda: distanciaImpresionIzquierda || null,
            distancia_impresion_derecha: distanciaImpresionDerecha || null,
            otras_caracteristicas: otrasCaracteristicas,
            opacidad,
            tratamientos_acabados_especiales: tratamientosAcabadosEspeciales,
            },
            ...(tipoProducto === "bolsa" ? { especificacion_bolsa: {
              ancho_doblado: anchoDoblado,
              ancho_desdoblado: anchoDesdoblado || null,
              largo_doblado: largoDoblado,
              largo_desdoblado: largoDesdoblado || null,
              fuelle,
              fuelle_izquierdo: fuelleIzquierdo || null,
              fuelle_derecho: fuelleDerecho || null,
              fuelle_inferior: fuelleInferior || null,
              fuelle_superior: fuelleSuperior || null,
              tipo_troquel: tipoTroquel || "normal",
              tipo_sello: tipoSello,
              pestana: tipoPestana || "sin_pestana",
              acabado_especial: tratamientosAcabadosEspeciales.join(","),
              otras_caracteristicas: otrasCaracteristicas,
            } } : { especificacion_bobina: {
              ancho: anchoBobina,
              diametro: diametro || null,
              diametro_nucleo: diametroNucleo || null,
              longitud: longitud || null,
              tipo_nucleo: tipoNucleo,
              peso: peso || null,
              otras_caracteristicas: otrasCaracteristicas,
            } }),
          },
        });
      }

      console.log("Resultado viabilidad:", resultado);

      setResultadoViabilidad(resultado);

    } catch (error) {
      console.error(
        "Error al evaluar viabilidad:",
        error
      );

      const apiMessage = (error as {
        response?: { data?: { mensaje?: string; detail?: string } };
      })?.response?.data?.mensaje || (error as {
        response?: { data?: { detail?: string } };
      })?.response?.data?.detail;
      const mensaje = apiMessage || (error instanceof Error
        ? error.message
        : "No se pudo evaluar la viabilidad del producto");

      setErrorViabilidad(mensaje);

    } finally {
      setAnalizandoViabilidad(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Nueva cotización
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Registra la solicitud del cliente, evalúa la viabilidad técnica y genera la cotización económica.
        </p>
      </div>

      {/* Progreso */}
      <RequerimientoSteps step={step} />

      {/* Contenido del paso */}
      <div className="min-h-[500px] rounded-xl border border-border bg-card p-6">
        {analizandoViabilidad ? (
          <ViabilidadAnalizando />

        ) : resultadoViabilidad ? (
          <ViabilidadResultado
            resultado={resultadoViabilidad}
            onContinuarCotizacion={() => {
              setMostrarCotizacion(true);
            }}
          />

        ) : errorViabilidad ? (
          <ViabilidadResultado
            error={errorViabilidad}
            onCompletarEspecificacion={() => {
              setErrorViabilidad(null);
              setStep(3);
            }}
          />

        ) : (
          <>
            {step === 1 && (
              <RequerimientoStepProducto
                product={product}
                setProduct={setProduct}
                onNext={nextStep}
              />
            )}

            {step === 2 && (
              <RequerimientoStepBusquedaProducto
                product={product}
                onProductSelect={handleProductoSelect}
                onCreateNew={handleCrearProductoNuevo}
              />
            )}

            {step === 3 && (
              <RequerimientoStepDetalles
                product={product}
                esProductoNuevo={esProductoNuevo}
                cuentaComercialId={cuentaComercialId}
                setCuentaComercialId={setCuentaComercialId}
                cantidadUnidades={cantidadUnidades}
                setCantidadUnidades={setCantidadUnidades}
                cantidadKg={cantidadKg}
                setCantidadKg={setCantidadKg}

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

                impresion={impresion}
                setImpresion={setImpresion}

                colorImpresion={colorImpresion}
                setColorImpresion={setColorImpresion}

                tipoImpresion={tipoImpresion}
                setTipoImpresion={setTipoImpresion}

                tratamientoImpresion={tratamientoImpresion}
                setTratamientoImpresion={setTratamientoImpresion}

                posicionImpresion={posicionImpresion}
                setPosicionImpresion={setPosicionImpresion}

                distanciaImpresionSuperior={
                  distanciaImpresionSuperior
                }
                setDistanciaImpresionSuperior={
                  setDistanciaImpresionSuperior
                }

                distanciaImpresionInferior={
                  distanciaImpresionInferior
                }
                setDistanciaImpresionInferior={
                  setDistanciaImpresionInferior
                }

                distanciaImpresionIzquierda={
                  distanciaImpresionIzquierda
                }
                setDistanciaImpresionIzquierda={
                  setDistanciaImpresionIzquierda
                }

                distanciaImpresionDerecha={
                  distanciaImpresionDerecha
                }
                setDistanciaImpresionDerecha={
                  setDistanciaImpresionDerecha
                }

                caraImpresion={caraImpresion}
                setCaraImpresion={setCaraImpresion}

                otrasCaracteristicas={otrasCaracteristicas}
                setOtrasCaracteristicas={setOtrasCaracteristicas}

                anchoDoblado={anchoDoblado}
                setAnchoDoblado={setAnchoDoblado}

                anchoDesdoblado={anchoDesdoblado}
                setAnchoDesdoblado={setAnchoDesdoblado}

                largoDoblado={largoDoblado}
                setLargoDoblado={setLargoDoblado}

                largoDesdoblado={largoDesdoblado}
                setLargoDesdoblado={setLargoDesdoblado}

                fuelle={fuelle}
                setFuelle={setFuelle}

                fuelleIzquierdo={fuelleIzquierdo}
                setFuelleIzquierdo={setFuelleIzquierdo}

                fuelleDerecho={fuelleDerecho}
                setFuelleDerecho={setFuelleDerecho}

                fuelleInferior={fuelleInferior}
                setFuelleInferior={setFuelleInferior}

                fuelleSuperior={fuelleSuperior}
                setFuelleSuperior={setFuelleSuperior}

                capas={capas}
                setCapas={setCapas}

                tipoTroquel={tipoTroquel}
                setTipoTroquel={setTipoTroquel}

                tipoSello={tipoSello}
                setTipoSello={setTipoSello}

                tipoPestana={tipoPestana}
                setTipoPestana={setTipoPestana}

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
                cuentaComercialId={cuentaComercialId}
                setCuentaComercialId={setCuentaComercialId}
                productoSeleccionado={productoSeleccionado}

                cantidadUnidades={cantidadUnidades}
                setCantidadUnidades={setCantidadUnidades}

                cantidadKg={cantidadKg}
                setCantidadKg={setCantidadKg}

                prioridad={prioridad}
                setPrioridad={setPrioridad}
                fechaEntrega={fechaEntrega}
                setFechaEntrega={setFechaEntrega}
                lugarEntrega={lugarEntrega}
                setLugarEntrega={setLugarEntrega}
                observaciones={observaciones}
                setObservaciones={setObservaciones}
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
                distanciaImpresionSuperior={
                  distanciaImpresionSuperior
                }
                distanciaImpresionInferior={
                  distanciaImpresionInferior
                }
                distanciaImpresionIzquierda={
                  distanciaImpresionIzquierda
                }
                distanciaImpresionDerecha={
                  distanciaImpresionDerecha
                }
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
                anchoBobina={anchoBobina}
                diametro={diametro}
                diametroNucleo={diametroNucleo}
                tipoNucleo={tipoNucleo}
                peso={peso}
                longitud={longitud}
              />
            )}
          </>
        )}
      </div>
      
      {/* Navegación */}
      {!analizandoViabilidad &&
        !resultadoViabilidad &&
        !errorViabilidad && (
          <RequerimientoNavigation
            step={step}
            onNext={nextStep}
            onPrevious={previousStep}
            onCancel={resetWizard}
            onSubmit={handleAnalizarViabilidad}
            submitting={evaluarViabilidad.isPending}
          />
        )}

      {/* Modal de confirmación de producto */}
      {productoSeleccionado && (
        <ProductoConfirmacionModal
          open={showConfirmacionModal}
          producto={productoSeleccionado}
          productType={product}
          onConfirm={handleConfirmarProducto}
          onSearchAnother={handleBuscarOtroProducto}
          onClose={handleBuscarOtroProducto}
        />
      )}

      {mostrarCotizacion && <CotizacionModal
        open
        onClose={() => setMostrarCotizacion(false)}
        cuenta={cuentaSeleccionada}
        producto={productoSeleccionado}
        productoNombre={productoSeleccionado?.producto_nombre || descripcion || (product === "bag" ? "Bolsa solicitada" : "Bobina solicitada")}
        productType={product}
        cantidadUnidades={cantidadUnidades}
        cantidadKg={cantidadKg}
        fechaEntrega={fechaEntrega}
        observaciones={observaciones}
        resultadoViabilidad={resultadoViabilidad}
        onCrear={handleCrearCotizacion}
      />}
      <Toast
        open={toast}
        title={toastTitle}
        description={toastDescription}
        onClose={() => setToast(false)}
      />
    </div>
  );
}
