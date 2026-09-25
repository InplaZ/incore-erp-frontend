///////////////////////////////////////////
// Toma los datos y los convierte en el 
// formato que espera el backend
///////////////////////////////////////////

import type {
  EspecificacionBolsaSolicitadaCreate,
  EspecificacionBobinaSolicitadaCreate,
  EspecificacionProductoSolicitadoCreate,
  SolicitudComercialCreate,
  MaterialProducto,
  Opacidad,
  PrioridadSolicitud,
  TipoImpresion,
  TipoSello,
  TipoTroquel,
  TratamientoAcabadoEspecial,
  TratamientoImpresion,
  PosicionImpresion,
  TipoCapa,
  CaraImpresion,
  VarianteColorSolicitadaCreate,
  TipoPestana,
} from "../../comercial.types";

import type { ProductType } from "./RequerimientoStepProducto";
import {
  solicitudesComercialesApi,
  especificacionesProductoApi,
  especificacionesBolsaApi,
  especificacionesBobinaApi,
  variantesColorApi,
} from "@/features/comercial/comercial.api"
/**
 * Datos completos que provienen del formulario
 * de Nuevo Requerimiento.
 */
export interface RequerimientoFormData {
  // Cliente
  cuentaComercialId: number | null;

  // Producto
  product: ProductType;
  categoriaProductoId: number | null,

  // Características generales
  descripcion: string;
  material: MaterialProducto;
  micraje: string;
  colorBolsa: string;
  opacidad: Opacidad;
  aptoAlimento: boolean;
  tratamientosAcabadosEspeciales: TratamientoAcabadoEspecial[];
  capas: TipoCapa | "";
  variantesColor: VarianteColorSolicitadaCreate[];

  caraImpresion: CaraImpresion | "";

  // Impresión
  impresion: boolean;
  colorImpresion: string;
  tipoImpresion: TipoImpresion;
  tratamientoImpresion: TratamientoImpresion;
  posicionImpresion: PosicionImpresion;
  distanciaImpresionSuperior: string;
  distanciaImpresionInferior: string;
  distanciaImpresionIzquierda: string;
  distanciaImpresionDerecha: string;
  otrasCaracteristicas: string;

  // Bolsa
  anchoDoblado: string;
  anchoDesdoblado: string;
  largoDoblado: string;
  largoDesdoblado: string;
  fuelle: boolean;
  fuelleIzquierdo: string;
  fuelleDerecho: string;
  fuelleInferior: string;
  fuelleSuperior: string;
  tipoTroquel: TipoTroquel | "";
  tipoSello: TipoSello;
  tipoPestana: TipoPestana | "";

  //Bobina
  anchoBobina:string;
  diametro: string;
  diametroNucleo: string;
  tipoNucleo: string;
  peso: string;
  longitud: string;

  // Solicitud
  cantidadUnidades: string;
  cantidadKg: string;
  prioridad: PrioridadSolicitud;
  fechaEntrega: string;
  lugarEntrega: string;
  observaciones: string;
}

/**
 * Convierte un string de colores
 * "Rojo, Azul, Blanco"
 * en:
 * ["Rojo", "Azul", "Blanco"]
 */
function convertirColores(colorImpresion: string): string[] {
  return colorImpresion
    .split(",")
    .map((color) => color.trim())
    .filter(Boolean);
}

/**
 * Convierte strings vacíos a null.
 *
 * Esto es útil para los DecimalField nullable
 * del backend.
 */
function valorDecimal(
  valor: string,
): string | null {
  return valor.trim() === "" ? null : valor;
}

/**
 * Construye el payload de Solicitud Comercial.
 */
export function construirSolicitudComercial(
  data: RequerimientoFormData,
): SolicitudComercialCreate {
  if (!data.cuentaComercialId) {
    throw new Error(
      "Debe seleccionar un cliente.",
    );
  }
  if (!data.descripcion.trim()) {
    throw new Error(
      "Debe ingresar una breve descripción del requerimiento.",
    );
  }

  return {
    cuenta_comercial: data.cuentaComercialId,

    fecha: new Date()
      .toISOString()
      .split("T")[0],

    descripcion: data.descripcion,

    cantidad_unidades:
      data.cantidadUnidades,

    cantidad_kg:
      data.cantidadKg,

    fecha_entrega:
      data.fechaEntrega || null,

    lugar_entrega:
      data.lugarEntrega,

    observaciones:
      data.observaciones,

    prioridad:
      data.prioridad,

    estado: "en_negociacion",
  };
}

/**
 * Construye la especificación general
 * del producto solicitado.
 *
 * solicitud_comcial se agrega después,
 * cuando el backend devuelve el ID de la solicitud.
 */
export function construirEspecificacionProducto(
  data: RequerimientoFormData,
): Omit<
  EspecificacionProductoSolicitadoCreate,
  "solicitud_comercial"
> {
  if (data.categoriaProductoId === null) {
    throw new Error(
      "Debe seleccionar una categoría de producto",
    )
  }
  if (!data.capas) {
    throw new Error("Debe seleccionar el tipo de capa.");
  }
  return {
    categoria_producto: data.categoriaProductoId,
    material: data.material,

    apto_alimento:
      data.aptoAlimento,

    micraje:
      valorDecimal(data.micraje),

    color_bolsa:
      data.colorBolsa,

    impresion:
      data.impresion,

    color_impresion:
      data.impresion
        ? convertirColores(data.colorImpresion)
        : [],

    tipo_impresion:
      data.tipoImpresion,

    posicion_impresion:
      data.posicionImpresion,

    distancia_impresion_superior:
      data.impresion &&
        data.posicionImpresion === "personalizada"
        ? valorDecimal(
          data.distanciaImpresionSuperior,
        )
        : null,

    distancia_impresion_inferior:
      data.impresion &&
        data.posicionImpresion === "personalizada"
        ? valorDecimal(
          data.distanciaImpresionInferior,
        )
        : null,

    distancia_impresion_izquierda:
      data.impresion &&
        data.posicionImpresion === "personalizada"
        ? valorDecimal(
          data.distanciaImpresionIzquierda,
        )
        : null,

    distancia_impresion_derecha:
      data.impresion &&
        data.posicionImpresion === "personalizada"
        ? valorDecimal(
          data.distanciaImpresionDerecha,
        )
        : null,

    otras_caracteristicas:
      data.otrasCaracteristicas,

    cara_impresion:
        data.caraImpresion || "",

    opacidad:
        data.opacidad,

    tratamientos_acabados_especiales:
      data.tratamientosAcabadosEspeciales,

    capas: data.capas || "",

    tratamiento_impresion:
        data.TratamientImpresion  !! ""
  };
}

/**
 * Construye la especificación particular
 * cuando el producto es una bolsa.
 *
 * especificacion_producto_solicitado
 * se agrega después de crear la especificación general.
 */
export function construirEspecificacionBolsa(
  data: RequerimientoFormData,
): Omit<
  EspecificacionBolsaSolicitadaCreate,
  "especificacion_producto_solicitado"
> {
  return {
    ancho_doblado:
      data.anchoDoblado,

    ancho_desdoblado:
      valorDecimal(data.anchoDesdoblado),

    largo_doblado:
      data.largoDoblado,

    largo_desdoblado:
      valorDecimal(data.largoDesdoblado),

    fuelle:
      data.fuelle,

    fuelle_izquierdo:
      valorDecimal(data.fuelleIzquierdo),

    fuelle_derecho:
      valorDecimal(data.fuelleDerecho),

    fuelle_inferior:
      valorDecimal(data.fuelleInferior),

    fuelle_superior:
      valorDecimal(data.fuelleSuperior),

    tipo_troquel:
      data.tipoTroquel || "normal",

    tipo_sello:
      data.tipoSello,

    pestana:
      data.tipoPestana || "sin_pestana",
  };
}

/**
 * Construye la especificación de bobina.
 *
 * Actualmente el formulario de RequerimientosPage
 * está preparado principalmente para bolsa.
 *
 * Se deja separado para cuando conectemos
 * el flujo de bobina.
 */
export function construirEspecificacionBobina(
  data: RequerimientoFormData,
): Omit<
  EspecificacionBobinaSolicitadaCreate,
  "especificacion_producto_solicitado"
> {
  return {
    ancho: data.anchoBobina,

    diametro: valorDecimal(data.diametro),

    diametro_nucleo: valorDecimal(
      data.diametroNucleo,
    ),

    tipo_nucleo: data.tipoNucleo,

    peso: valorDecimal(data.peso),

    longitud: valorDecimal(data.longitud),

    otras_caracteristicas:
      data.otrasCaracteristicas,
  };
}

/**
 * Obtiene la categoría de producto.
 *
 * IMPORTANTE:
 * aquí necesitamos utilizar los IDs reales
 * de CategoriaProducto de tu backend.
 */
/**
 * Crea un requerimiento completo.
 *
 * Flujo:
 * 1. Solicitud Comercial
 * 2. Especificación del Producto
 * 3. Especificación de Bolsa o Bobina
 */
export async function crearRequerimiento(
  data: RequerimientoFormData,
) {
  // 1. Crear Solicitud Comercial
  const solicitud =
    await solicitudesComercialesApi.create(
      construirSolicitudComercial(data),
    );

  // 2. Crear Especificación General del Producto
  const especificacionProducto =
    await especificacionesProductoApi.create({
      ...construirEspecificacionProducto(data),
      solicitud_comercial: solicitud.id,
    });

  // 3. Crear especificación particular
  // 3. Crear especificación particular
  let especificacionBolsa = null;
  let especificacionBobina = null;

  if (data.product === "bag") {
    especificacionBolsa =
      await especificacionesBolsaApi.create({
        ...construirEspecificacionBolsa(data),
        especificacion_producto_solicitado:
          especificacionProducto.id,
      });
  }

  if (data.product === "roll") {
    especificacionBobina =
      await especificacionesBobinaApi.create({
        ...construirEspecificacionBobina(data),
        especificacion_producto_solicitado:
          especificacionProducto.id,
      });
  }

  // 4. Crear variantes de color
  const variantesColor = await Promise.all(
    data.variantesColor.map((variante) =>
      variantesColorApi.create({
        ...variante,
        especificacion_producto_solicitado: especificacionProducto.id,
      })
    )
  );

  return {
    solicitud,
    especificacionProducto,
    especificacionBolsa,
    especificacionBobina,
    variantesColor,
  };
}
