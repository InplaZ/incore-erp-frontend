//////////////////////////
//COMPONENTE PADRE
//Guarda todos los datos del formulario
//Decide que paso mostrar step1, ....
/////////////////////////
import { useEffect, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Toast from "@/components/ui/Toast";
import { api } from "@/api/api.config";
import { especificacionesProductoApi } from "@/features/comercial/comercial.api";
import {
  useCuentasComerciales,
  useFormalizarCotizacionDesdeWizard,
  useCotizacionVersion,
  useCotizacion,
  useSolicitudComercial,
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
  TipoLugarEntrega,
  DepartamentoBolivia,
  SucursalEntrega,
} from "../comercial.types";
import {
  useProductosCategorias,
} from "@/features/productos/productos.hooks";
import type { ProductType } from "@/features/comercial/comercial.types";
import RequerimientoStepProducto from "@/features/comercial/components/requerimientos/RequerimientoStepProducto";
import RequerimientoStepBusquedaProducto from "../components/requerimientos/RequerimientoStepBusquedaProducto";
import RequerimientoStepDetalles from "../components/requerimientos/RequerimientoStepDetalles";
import RequerimientoStepEntrega from "../components/requerimientos/RequerimientoStepEntrega";
import RequerimientoStepConfirmacion from "../components/requerimientos/RequerimientoStepConfirmacion";
import RequerimientoNavigation from "../components/requerimientos/RequerimientoNavigation";
import ProductoConfirmacionModal from "../components/requerimientos/ProductoConfirmacionModal";
import NuevoClienteModal from "../components/NuevoClienteModal";

import type {
  ProductoBusquedaResultado,
  FormalizarCotizacionWizardPayload,
} from "@/features/comercial/comercial.types";

import type { EvaluarViabilidadPayload, EvaluarViabilidadResponse } from "@/features/viabilidad/viabilidad.types";
import { useEvaluarViabilidad } from "@/features/viabilidad/viabilidad.hook";

import ViabilidadAnalizando from "@/features/viabilidad/requerimientos/ViabilidadAnalizando";
import ViabilidadResultado from "@/features/viabilidad/requerimientos/ViabilidadResultado";

export type RequirementStep = 1 | 2 | 3 | 4 | 5;

type CotizacionLineaBorrador = NonNullable<FormalizarCotizacionWizardPayload["detalles"]>[number] & {
  key: string;
  nombre: string;
  codigo: string;
  archivo_color_impresion?: File | null;
};

interface PesosProductoResponse {
  peso_unitario_kg: string | null;
  peso_total_kg: string | null;
}

interface CotizacionMetaBorrador extends CotizacionFormData {
  prioridad: PrioridadSolicitud;
  fechaEntrega: string;
  lugarEntrega: string;
  tipoLugarEntrega: TipoLugarEntrega;
  departamentoEntrega: DepartamentoBolivia | "";
  empresaTransporte: string;
  sucursalEntrega: SucursalEntrega | "";
}

export default function RequerimientosPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cotizacionVersionId = Number(searchParams.get("cotizacion_version_id") || 0);
  const { data: versionEnEdicion } = useCotizacionVersion(cotizacionVersionId);
  const { data: cotizacionEnEdicion } = useCotizacion(versionEnEdicion?.cotizacion || 0);
  const { data: solicitudEnEdicion } = useSolicitudComercial(cotizacionEnEdicion?.solicitud_comercial || 0);
  const [step, setStep] = useState<RequirementStep>(1);
  /*
   * Cliente
   */
  const [cuentaComercialId, setCuentaComercialId] =
    useState<number | null>(null);
  const [buscarCliente, setBuscarCliente] = useState("");
  const [mostrarSugerenciasCliente, setMostrarSugerenciasCliente] = useState(false);
  const [mostrarNuevoCliente, setMostrarNuevoCliente] = useState(false);

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
  const [lineasCotizacion, setLineasCotizacion] = useState<CotizacionLineaBorrador[]>([]);
  const [datosCotizacion, setDatosCotizacion] = useState<CotizacionMetaBorrador | null>(null);

  /*
   * Selección de producto del catálogo
   */
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<ProductoBusquedaResultado | null>(null);
  const [modoCatalogoExistente, setModoCatalogoExistente] = useState(false);

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
  const [archivoColorImpresion, setArchivoColorImpresion] = useState<File | null>(null);

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
  const [cantidadUnidades, setCantidadUnidades] = useState("");
  const [cantidadKg, setCantidadKg] = useState("");

  const [prioridad, setPrioridad] =
    useState<PrioridadSolicitud>("normal");

  const [fechaEntrega, setFechaEntrega] = useState("");
  const [lugarEntrega, setLugarEntrega] = useState("");

  const [tipoLugarEntrega, setTipoLugarEntrega] =
    useState<TipoLugarEntrega>("casa_matriz");

  const [departamentoEntrega, setDepartamentoEntrega] =
    useState<DepartamentoBolivia | "">("");

  const [empresaTransporte, setEmpresaTransporte] =
    useState("");

  const [sucursalEntrega, setSucursalEntrega] =
    useState<SucursalEntrega | "">("");

  const [observaciones, setObservaciones] = useState("");

  //TOAST
  const [toast, setToast] = useState(false);
  const [toastTitle, setToastTitle] = useState("");
  const [toastDescription, setToastDescription] = useState("");

  const mostrarToast = (title: string, description: string) => {
    setToastTitle(title);
    setToastDescription(description);
    setToast(true);
  };

  useEffect(() => {
    if (!cotizacionVersionId || !versionEnEdicion || !cotizacionEnEdicion || !solicitudEnEdicion) return;
    if (versionEnEdicion.estado !== "borrador") {
      mostrarToast("Versión bloqueada", "Solo se pueden agregar productos a una versión en borrador.");
      navigate(`/comercial/requerimientos/${solicitudEnEdicion.solicitud.id}`);
      return;
    }
    setCuentaComercialId(solicitudEnEdicion.solicitud.id);
    setDatosCotizacion((actual) => actual ?? {
      cantidad: "",
      moneda: versionEnEdicion.moneda,
      precioLista: "",
      descuentoPorcentaje: "0",
      precioUnitario: "0.00",
      precioTotal: versionEnEdicion.precio_total,
      fechaVencimiento: cotizacionEnEdicion.fecha_vencimiento || "",
      observaciones: "",

      prioridad: solicitudEnEdicion.solicitud.prioridad,
      fechaEntrega: solicitudEnEdicion.solicitud.fecha_entrega || "",
      lugarEntrega: solicitudEnEdicion.solicitud.lugar_entrega || "",

      tipoLugarEntrega: solicitudEnEdicion.solicitud.tipo_lugar_entrega,
      departamentoEntrega: solicitudEnEdicion.solicitud.departamento_entrega || "CB",
      empresaTransporte: solicitudEnEdicion.solicitud.empresa_transporte || "",
      sucursalEntrega: solicitudEnEdicion.solicitud.sucursal_entrega || "montes",

      observacionesSolicitud: solicitudEnEdicion.solicitud.observaciones,
    });
    const solicitud = solicitudEnEdicion.solicitud;

      setTipoLugarEntrega(solicitud.tipo_lugar_entrega || "casa_matriz");
      setDepartamentoEntrega(solicitud.departamento_entrega || "");
      setEmpresaTransporte(solicitud.empresa_transporte || "");
      setSucursalEntrega(solicitud.sucursal_entrega || "");
      setLugarEntrega(solicitud.lugar_entrega || "");
      setFechaEntrega(solicitud.fecha_entrega || "");
      setPrioridad(solicitud.prioridad);
      setObservaciones(solicitud.observaciones || "");
  }, [cotizacionVersionId, versionEnEdicion, cotizacionEnEdicion, solicitudEnEdicion, navigate]);

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
  const clientesFiltrados = (cuentas ?? []).filter((cuenta) => {
    const consulta = buscarCliente.trim().toLocaleLowerCase();
    if (!consulta) return true;
    const nombreCompleto = [cuenta.nombres, cuenta.apellido_paterno, cuenta.apellido_materno]
      .filter(Boolean)
      .join(" ");
    return [nombreCompleto, cuenta.razon_social, String(cuenta.codigo_cliente)]
      .some((valor) => valor?.toLocaleLowerCase().includes(consulta));
  });

  const nombreVisibleCliente = (cuenta: NonNullable<typeof cuentas>[number]) => {
    const nombreCompleto = [cuenta.nombres, cuenta.apellido_paterno, cuenta.apellido_materno]
      .filter(Boolean)
      .join(" ")
      .trim();
    return [...new Set([nombreCompleto, cuenta.razon_social.trim()].filter(Boolean))].join(" · ") || `Cliente #${cuenta.codigo_cliente}`;
  };

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
  };

  const agregarProductoAlCarrito = (producto: ProductoBusquedaResultado) => {
    if (lineasCotizacion.some((linea) => linea.producto_version_id === producto.version_id)) {
      mostrarToast("Producto ya agregado", `${producto.producto_codigo} ya está en el carrito.`);
      return;
    }
    setModoCatalogoExistente(true);
    setEsProductoNuevo(false);
    setProductoSeleccionado(producto);
    setLineasCotizacion((actuales) => [...actuales, {
      key: `catalogo-${producto.version_id}`,
      tipo_producto: producto.especificacion_bobina ? "bobina" : "bolsa",
      producto_version_id: producto.version_id,
      cantidad: "",
      precio_lista: "",
      descuento_porcentaje: "0",
      costo_estimado: null,
      unidad_comercial: producto.unidad_medida,
      peso_kg: null,
      nombre: producto.producto_nombre,
      codigo: producto.producto_codigo,
    }]);
  };

  const continuarConfiguracionExistentes = () => {
    setDatosCotizacion((actual) => actual ?? {
      cantidad: "", moneda: "BOB", precioLista: "", descuentoPorcentaje: "0", precioUnitario: "0.00", precioTotal: "0.00",
      fechaVencimiento: "", observaciones: observaciones,
      prioridad, fechaEntrega, lugarEntrega, tipoLugarEntrega, departamentoEntrega: departamentoEntrega || "CB",
      empresaTransporte, sucursalEntrega: sucursalEntrega || "montes", observacionesSolicitud: observaciones,
    });
    setStep(4);
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
    if (modoCatalogoExistente && lineasCotizacion.length) {
      mostrarToast("Finaliza la cotización actual", "Guarda o retira los productos del carrito antes de iniciar una solicitud de producto nuevo.");
      return;
    }
    setModoCatalogoExistente(false);
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

      const especificacionBolsa = esProductoNuevo && tipoProducto === "bolsa" ? {
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
      } : undefined;
      const especificacionBobina = esProductoNuevo && tipoProducto === "bobina" ? {
        ancho: anchoBobina,
        diametro: diametro || null,
        diametro_nucleo: diametroNucleo || null,
        longitud: longitud || null,
        tipo_nucleo: tipoNucleo,
        peso: peso || null,
        otras_caracteristicas: otrasCaracteristicas,
      } : undefined;
      const linea: CotizacionLineaBorrador = {
        key: `${Date.now()}-${Math.random()}`,
        tipo_producto: tipoProducto,
        producto_version_id: esProductoNuevo ? undefined : productoSeleccionado!.version_id,
        especificacion,
        archivo_color_impresion: esProductoNuevo && impresion ? archivoColorImpresion : null,
        especificacion_bolsa: especificacionBolsa,
        especificacion_bobina: especificacionBobina,
        cantidad: data.cantidad,
        precio_lista: data.precioLista,
        descuento_porcentaje: data.descuentoPorcentaje || "0",
        costo_estimado: null,
        unidad_comercial: esProductoNuevo
          ? (tipoProducto === "bobina" ? "kg" : "unidad")
          : productoSeleccionado!.unidad_medida,
        peso_kg: tipoProducto === "bobina" ? (peso || null) : null,
        nombre: esProductoNuevo
          ? descripcion.trim() || `Producto solicitado (${tipoProducto})`
          : productoSeleccionado!.producto_nombre,
        codigo: esProductoNuevo ? "Sin código definitivo" : productoSeleccionado!.producto_codigo,
      };
      setLineasCotizacion((actuales) => [...actuales, linea]);
      setDatosCotizacion((actual) => actual ?? {
        ...data,
        prioridad,
        fechaEntrega,
        lugarEntrega,
        tipoLugarEntrega,
        departamentoEntrega: departamentoEntrega || "CB",
        empresaTransporte,
        sucursalEntrega: sucursalEntrega || "montes",
        observacionesSolicitud: observaciones,
      });
      const clienteId = cuentaComercialId;
      setMostrarCotizacion(false);
      resetWizard();
      setCuentaComercialId(clienteId);
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

  const guardarCotizacion = async () => {
    if (!cuentaComercialId || !lineasCotizacion.length || !datosCotizacion) return;
    try {
      const unidades = lineasCotizacion
        .filter((linea) => linea.unidad_comercial === "unidad")
        .reduce((total, linea) => total + Number(linea.cantidad || 0), 0);
      const kilos = lineasCotizacion
        .filter((linea) => linea.unidad_comercial === "kg")
        .reduce((total, linea) => total + Number(linea.cantidad || 0), 0);
      const resultado = await formalizarCotizacion.mutateAsync({
        cotizacion_version_id: cotizacionVersionId || undefined,
        solicitud: {
          cuenta_comercial: cuentaComercialId,
          fecha: new Date().toISOString(),
          descripcion: `Cotización comercial (${lineasCotizacion.length} líneas)`,

          cantidad_unidades: unidades ? String(unidades) : "0",
          cantidad_kg: kilos ? String(kilos) : "0",

          fecha_entrega: datosCotizacion.fechaEntrega || null,
          lugar_entrega: datosCotizacion.lugarEntrega,

          tipo_lugar_entrega: datosCotizacion.tipoLugarEntrega,
          departamento_entrega: datosCotizacion.departamentoEntrega,
          empresa_transporte: datosCotizacion.empresaTransporte,
          sucursal_entrega: datosCotizacion.sucursalEntrega,

          observaciones: datosCotizacion.observaciones,
          prioridad: datosCotizacion.prioridad,
        },
        cotizacion: {
          fecha_vencimiento: datosCotizacion.fechaVencimiento || null,
          observaciones: datosCotizacion.observaciones || "",
          moneda: datosCotizacion.moneda,
        },
        detalles: lineasCotizacion.map(({ key: _key, nombre: _nombre, codigo: _codigo, archivo_color_impresion: _archivo, ...linea }) => linea),
      });
      let archivoPendiente = false;
      for (const [index, linea] of lineasCotizacion.entries()) {
        const archivo = linea.archivo_color_impresion;
        const versionId = resultado.detalles[index]?.especificacion_version;
        if (archivo && versionId) {
          try {
            await especificacionesProductoApi.subirArchivoColorImpresion(archivo, { versionId });
          } catch {
            archivoPendiente = true;
          }
        }
      }
      setLineasCotizacion([]);
      setDatosCotizacion(null);
      resetWizard();
      mostrarToast(archivoPendiente ? "Cotización creada; PDF pendiente" : "Cotización creada", archivoPendiente ? `Cotización ${resultado.numero} creada, pero no se pudo adjuntar uno o más PDF. Edítala para cargarlos.` : `Cotización ${resultado.numero} creada con ${resultado.detalles.length} líneas.`);
      if (cotizacionVersionId && solicitudEnEdicion) {
        navigate(`/comercial/requerimientos/${solicitudEnEdicion.solicitud.id}`);
      }
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje;
      mostrarToast("Error", message || "No se pudo guardar la cotización.");
    }
  };

  /*
   * Por ahora solo reinicia el formulario.
   * Después podemos convertir esto en "Guardar borrador".
   */
  const resetWizard = () => {
    setStep(1);
    setCuentaComercialId(null);
    setModoCatalogoExistente(false);
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
    setArchivoColorImpresion(null);
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

      let payload: EvaluarViabilidadPayload;
      if (!esProductoNuevo) {
        payload = {
          producto_version: productoSeleccionado!.version_id,
          previsualizar: true,
        };
      } else {
        if (!categoriaSeleccionada) throw new Error("No se encontró la categoría de producto seleccionada.");
        const tipoProducto = product === "bag" ? "bolsa" : "bobina";
        payload = {
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
            ...(tipoProducto === "bolsa" ? {
              especificacion_bolsa: {
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
              }
            } : {
              especificacion_bobina: {
                ancho: anchoBobina,
                diametro: diametro || null,
                diametro_nucleo: diametroNucleo || null,
                longitud: longitud || null,
                tipo_nucleo: tipoNucleo,
                peso: peso || null,
                otras_caracteristicas: otrasCaracteristicas,
              }
            }),
          },
        };
      }

      const resultado = await evaluarViabilidad.mutateAsync(payload);
      console.groupCollapsed("INCORE · Diagnóstico de viabilidad");
      console.info("Datos técnicos enviados:", payload.datos_especificacion ?? { producto_version: payload.producto_version });
      console.info("Ruta evaluada:", resultado.ruta);
      console.info("Procesos no viables:", resultado.procesos_no_viables);
      for (const [proceso, detalle] of Object.entries(resultado.resultados_por_proceso ?? {})) {
        const maquinas = detalle.resultados_evaluacion ?? detalle.resultados ?? [];
        const criteriosFallidos = maquinas.flatMap((maquina) =>
          (maquina.criterios ?? maquina.criterios_evaluados ?? [])
            .filter((criterio) => !criterio.cumple)
            .map((criterio) => ({ equipo: maquina.equipo ?? "Máquina", criterio: criterio.criterio, mensaje: criterio.mensaje ?? "No cumple", solicitado: criterio.valor_solicitado, capacidad: criterio.valor_capacidad })),
        );
        console.groupCollapsed(`${proceso}: ${detalle.viable ? "viable" : "no viable"}`);
        if (criteriosFallidos.length) console.table(criteriosFallidos);
        else if (!maquinas.length) console.warn("No hay capacidades o máquinas registradas para este proceso.");
        else console.info("No se recibieron criterios fallidos en la respuesta.");
        console.groupEnd();
      }
      console.groupEnd();

      setResultadoViabilidad(resultado);

    } catch (error) {
      console.error(
        "Error al evaluar viabilidad:",
        error
      );
      console.error("Respuesta del servidor al evaluar viabilidad:", (error as { response?: { data?: unknown } })?.response?.data);

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
          {cotizacionVersionId ? `Agregar productos a ${cotizacionEnEdicion?.numero ?? "la cotización"} · versión ${versionEnEdicion?.version ?? ""}` : "Nueva cotización"}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Registra la solicitud del cliente, evalúa la viabilidad técnica y genera la cotización económica.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-4">
        <label className="mb-2 block text-sm font-medium">Cliente de esta cotización</label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full max-w-xl">
            <label htmlFor="buscar-cliente-cotizacion" className="mb-1.5 block text-xs text-muted-foreground">Buscar cliente</label>
            <div className="relative" onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setMostrarSugerenciasCliente(false);
              }
            }}>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="buscar-cliente-cotizacion"
                type="search"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={mostrarSugerenciasCliente}
                aria-controls="sugerencias-clientes-cotizacion"
                value={buscarCliente}
                onFocus={() => setMostrarSugerenciasCliente(true)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setMostrarSugerenciasCliente(false);
                }}
                onChange={(event) => {
                  setCuentaComercialId(null);
                  setBuscarCliente(event.target.value);
                  setMostrarSugerenciasCliente(true);
                }}
                placeholder="Nombre, razón social o código…"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm"
              />
              {mostrarSugerenciasCliente && (
                <div id="sugerencias-clientes-cotizacion" role="listbox" aria-label="Clientes coincidentes" className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lg">
                  {clientesFiltrados.length ? clientesFiltrados.slice(0, 8).map((cuenta) => (
                    <button
                      key={cuenta.id}
                      type="button"
                      role="option"
                      aria-selected={cuenta.id === cuentaComercialId}
                      onClick={() => {
                        setCuentaComercialId(cuenta.id);
                        setBuscarCliente(nombreVisibleCliente(cuenta));
                        setMostrarSugerenciasCliente(false);
                      }}
                      className="flex w-full flex-col items-start rounded-md px-3 py-2 text-left transition hover:bg-muted focus:bg-muted focus:outline-none"
                    >
                      <span className="text-sm font-medium text-foreground">{nombreVisibleCliente(cuenta)}</span>
                      <span className="text-xs text-muted-foreground">Cliente #{cuenta.codigo_cliente}</span>
                    </button>
                  )) : (
                    <p className="px-3 py-2 text-sm text-muted-foreground">No se encontraron clientes.</p>
                  )}
                </div>
              )}
            </div>
            {cuentaSeleccionada && <p className="mt-1.5 text-xs text-primary">Cliente seleccionado: {nombreVisibleCliente(cuentaSeleccionada)}</p>}
          </div>
          <button
            type="button"
            onClick={() => setMostrarNuevoCliente(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-primary/30 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5"
          >
            <UserPlus className="h-4 w-4" /> Nuevo cliente
          </button>
        </div>
      </section>

      {lineasCotizacion.length > 0 && (
        <section className="space-y-4 rounded-xl border border-primary/30 bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Carrito de cotización</h2>
              <p className="text-sm text-muted-foreground">{lineasCotizacion.length} {lineasCotizacion.length === 1 ? "producto" : "productos"} · Los importes se recalculan al guardar.</p>
            </div>
            {modoCatalogoExistente && step === 2 ? <button type="button" onClick={continuarConfiguracionExistentes} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">Continuar a cantidades y entrega</button> : !modoCatalogoExistente && <button
              type="button"
              onClick={guardarCotizacion}
              disabled={formalizarCotizacion.isPending || !cuentaComercialId}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {formalizarCotizacion.isPending ? "Guardando…" : "Guardar cotización"}
            </button>}
          </div>
          <div className="space-y-3">
            {lineasCotizacion.map((linea, index) => {
              const unitario = Number(linea.precio_lista || 0) * (1 - Number(linea.descuento_porcentaje || 0) / 100);
              const subtotal = Number(linea.cantidad || 0) * unitario;
              return (
                <div key={linea.key} className="grid gap-3 rounded-lg border border-border p-4 lg:grid-cols-[minmax(200px,2fr)_110px_120px_110px_120px_130px_auto] lg:items-end">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Línea {index + 1} · {linea.tipo_producto}</p>
                    <p className="truncate font-medium">{linea.nombre}</p>
                    <p className="text-xs text-muted-foreground">{linea.codigo} · {linea.producto_version_id ? "Versión de catálogo conservada" : "Especificación técnica solicitada"}</p>
                  </div>
                  <label className="text-xs text-muted-foreground">Cantidad
                    <input type="number" min="0.01" step="0.01" value={linea.cantidad} onChange={(event) => setLineasCotizacion((items) => items.map((item) => item.key === linea.key ? { ...item, cantidad: event.target.value } : item))} className="mt-1 w-full rounded border border-border bg-background px-2 py-2 text-sm text-foreground" />
                  </label>
                  <label className="text-xs text-muted-foreground">Unidad comercial
                    <select value={linea.unidad_comercial} onChange={(event) => setLineasCotizacion((items) => items.map((item) => item.key === linea.key ? { ...item, unidad_comercial: event.target.value } : item))} className="mt-1 w-full rounded border border-border bg-background px-2 py-2 text-sm text-foreground">
                      <option value="unidad">Unidad</option><option value="kg">Kilogramo</option><option value="bobina">Bobina</option><option value="fajo">Fajo</option><option value="metro">Metro</option>
                    </select>
                  </label>
                  <label className="text-xs text-muted-foreground">Precio de lista
                    <input type="number" min="0" step="0.01" value={linea.precio_lista} onChange={(event) => setLineasCotizacion((items) => items.map((item) => item.key === linea.key ? { ...item, precio_lista: event.target.value } : item))} className="mt-1 w-full rounded border border-border bg-background px-2 py-2 text-sm text-foreground" />
                  </label>
                  <label className="text-xs text-muted-foreground">Descuento %
                    <input type="number" min="0" max="100" step="0.01" value={linea.descuento_porcentaje} onChange={(event) => setLineasCotizacion((items) => items.map((item) => item.key === linea.key ? { ...item, descuento_porcentaje: event.target.value } : item))} className="mt-1 w-full rounded border border-border bg-background px-2 py-2 text-sm text-foreground" />
                  </label>
                  <div><p className="text-xs text-muted-foreground">Subtotal preliminar</p><p className="font-semibold">{datosCotizacion?.moneda ?? "BOB"} {subtotal.toFixed(2)}</p></div>
                  <button type="button" onClick={() => { setLineasCotizacion((items) => items.filter((item) => item.key !== linea.key)); if (lineasCotizacion.length === 1) setModoCatalogoExistente(false); }} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">Quitar</button>
                  {linea.producto_version_id ? (
                    <PesoProductoCatalogo productoVersionId={linea.producto_version_id} cantidad={linea.cantidad} />
                  ) : linea.especificacion ? (
                    <PesoProductoNuevo
                      tipoProducto={linea.tipo_producto}
                      cantidad={linea.cantidad}
                      especificacion={linea.especificacion}
                      especificacionBolsa={linea.especificacion_bolsa}
                      especificacionBobina={linea.especificacion_bobina}
                    />
                  ) : (
                    <label className="text-xs text-muted-foreground lg:col-start-2">Peso total kg (opcional)
                      <input type="number" min="0.001" step="0.001" value={linea.peso_kg ?? ""} onChange={(event) => setLineasCotizacion((items) => items.map((item) => item.key === linea.key ? { ...item, peso_kg: event.target.value || null } : item))} className="mt-1 w-full rounded border border-border bg-background px-2 py-2 text-sm text-foreground" />
                    </label>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-end border-t border-border pt-3 text-right">
            <div><p className="text-xs text-muted-foreground">Total preliminar · sin impuestos añadidos</p><p className="text-xl font-semibold">{datosCotizacion?.moneda ?? "BOB"} {lineasCotizacion.reduce((sum, linea) => sum + Number(linea.cantidad || 0) * Number(linea.precio_lista || 0) * (1 - Number(linea.descuento_porcentaje || 0) / 100), 0).toFixed(2)}</p></div>
          </div>
        </section>
      )}

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
            onCompletarEspecificacion={() => {
              setResultadoViabilidad(null);
              setErrorViabilidad(null);
              setStep(3);
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
                onAddToCart={agregarProductoAlCarrito}
                versionesEnCarrito={lineasCotizacion.map((linea) => linea.producto_version_id).filter((id): id is number => id !== undefined)}
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
                archivoColorImpresion={archivoColorImpresion}
                setArchivoColorImpresion={setArchivoColorImpresion}

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

                prioridad={prioridad}
                setPrioridad={setPrioridad}
                fechaEntrega={fechaEntrega}
                setFechaEntrega={setFechaEntrega}
                lugarEntrega={lugarEntrega}
                setLugarEntrega={setLugarEntrega}
                tipoLugarEntrega={tipoLugarEntrega}
                setTipoLugarEntrega={setTipoLugarEntrega}
                departamentoEntrega={departamentoEntrega}
                setDepartamentoEntrega={setDepartamentoEntrega}
                empresaTransporte={empresaTransporte}
                setEmpresaTransporte={setEmpresaTransporte}
                sucursalEntrega={sucursalEntrega}
                setSucursalEntrega={setSucursalEntrega}
                observaciones={observaciones}
                setObservaciones={setObservaciones}
                showCantidad={false}
                showCliente={false}
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
        modoCatalogoExistente && step === 4 ? <div className="flex justify-between border-t border-border px-6 py-4"><button type="button" onClick={() => setStep(2)} className="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-secondary">Volver al catálogo</button><button type="button" onClick={guardarCotizacion} disabled={formalizarCotizacion.isPending || !cuentaComercialId || lineasCotizacion.some((linea) => !Number(linea.cantidad) || !linea.precio_lista.trim() || Number(linea.precio_lista) < 0)} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">{formalizarCotizacion.isPending ? "Guardando…" : "Guardar cotización"}</button></div> : !modoCatalogoExistente && (step !== 2 || esProductoNuevo) && <RequerimientoNavigation
            step={step}
            onNext={nextStep}
            onPrevious={previousStep}
            onCancel={resetWizard}
            onSubmit={handleAnalizarViabilidad}
            submitting={evaluarViabilidad.isPending}
          />
        )}

      {/* Modal de confirmación de producto */}
      {productoSeleccionado && !modoCatalogoExistente && (
        <ProductoConfirmacionModal
          open={showConfirmacionModal}
          producto={productoSeleccionado}
          productType={product}
          onConfirm={handleConfirmarProducto}
          onSearchAnother={handleBuscarOtroProducto}
          onClose={handleBuscarOtroProducto}
        />
      )}

      <NuevoClienteModal
        open={mostrarNuevoCliente}
        onClose={() => setMostrarNuevoCliente(false)}
        onSuccess={() => setBuscarCliente("")}
      />

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

function PesoProductoCatalogo({ productoVersionId, cantidad }: { productoVersionId: number; cantidad: string }) {
  const [pesos, setPesos] = useState<PesosProductoResponse | null>(null);
  const [calculando, setCalculando] = useState(false);
  const cantidadNumerica = Number(cantidad);

  useEffect(() => {
    let vigente = true;
    const temporizador = window.setTimeout(async () => {
      if (!cantidad.trim() || !Number.isFinite(cantidadNumerica) || cantidadNumerica <= 0) {
        setPesos(null);
        setCalculando(false);
        return;
      }
      setCalculando(true);
      try {
        const resultado = await api.post<PesosProductoResponse>(
          "/comercial/cotizaciones/calcular-peso/",
          { producto_version_id: productoVersionId, cantidad },
        );
        if (vigente) setPesos(resultado);
      } catch (error) {
        if (vigente) {
          console.error("No se pudo calcular el peso del producto", error);
          setPesos(null);
        }
      } finally {
        if (vigente) setCalculando(false);
      }
    }, 250);

    return () => {
      vigente = false;
      window.clearTimeout(temporizador);
    };
  }, [productoVersionId, cantidad, cantidadNumerica]);

  return (
    <div className="grid grid-cols-2 gap-2 lg:col-span-2 lg:col-start-2" aria-live="polite">
      <label className="text-xs text-muted-foreground">Peso por unidad (kg)
        <input type="text" readOnly value={pesos?.peso_unitario_kg ?? ""} placeholder={calculando ? "Calculando…" : "—"} className="mt-1 w-full rounded border border-border bg-muted px-2 py-2 text-sm text-foreground" />
      </label>
      <label className="text-xs text-muted-foreground">Peso total (kg)
        <input type="text" readOnly value={pesos?.peso_total_kg ?? ""} placeholder={calculando ? "Calculando…" : "—"} className="mt-1 w-full rounded border border-border bg-muted px-2 py-2 text-sm font-medium text-foreground" />
      </label>
    </div>
  );
}

function PesoProductoNuevo({
  tipoProducto,
  cantidad,
  especificacion,
  especificacionBolsa,
  especificacionBobina,
}: {
  tipoProducto: "bolsa" | "bobina";
  cantidad: string;
  especificacion: Record<string, unknown>;
  especificacionBolsa?: Record<string, unknown>;
  especificacionBobina?: Record<string, unknown>;
}) {
  const [pesos, setPesos] = useState<PesosProductoResponse | null>(null);
  const [calculando, setCalculando] = useState(false);
  const especificacionPayload = {
    tipo_producto: tipoProducto,
    especificacion,
    especificacion_bolsa: especificacionBolsa,
    especificacion_bobina: especificacionBobina,
  };

  useEffect(() => {
    let vigente = true;
    const temporizador = window.setTimeout(async () => {
      const cantidadNumerica = Number(cantidad);
      if (!cantidad.trim() || !Number.isFinite(cantidadNumerica) || cantidadNumerica <= 0) {
        setPesos(null);
        setCalculando(false);
        return;
      }
      setCalculando(true);
      try {
        const resultado = await api.post<PesosProductoResponse>(
          "/comercial/cotizaciones/calcular-peso/",
          { cantidad, datos_especificacion: especificacionPayload },
        );
        if (vigente) setPesos(resultado);
      } catch (error) {
        if (vigente) {
          console.error("No se pudo calcular el peso de la especificación nueva", error);
          setPesos(null);
        }
      } finally {
        if (vigente) setCalculando(false);
      }
    }, 250);
    return () => {
      vigente = false;
      window.clearTimeout(temporizador);
    };
  }, [cantidad, tipoProducto, especificacion, especificacionBolsa, especificacionBobina]);

  return (
    <div className="grid grid-cols-2 gap-2 lg:col-span-2 lg:col-start-2" aria-live="polite">
      <label className="text-xs text-muted-foreground">Peso por unidad (kg)
        <input type="text" readOnly value={pesos?.peso_unitario_kg ?? ""} placeholder={calculando ? "Calculando…" : "Complete material y medidas"} className="mt-1 w-full rounded border border-border bg-muted px-2 py-2 text-sm text-foreground" />
      </label>
      <label className="text-xs text-muted-foreground">Peso total (kg)
        <input type="text" readOnly value={pesos?.peso_total_kg ?? ""} placeholder={calculando ? "Calculando…" : "—"} className="mt-1 w-full rounded border border-border bg-muted px-2 py-2 text-sm font-medium text-foreground" />
      </label>
    </div>
  );
}
