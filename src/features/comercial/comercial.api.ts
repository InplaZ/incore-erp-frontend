import { api } from "@/api/api.config";
import type { ApiQueryParams } from "@/api/api.types";
import type {
  ActividadComercial,
  ActividadComercialCreate,
  ActividadComercialUpdate,
  Comunicacion,
  ComunicacionCreate,
  ComunicacionUpdate,
  CuentaComercial,
  CuentaComercialCreate,
  CuentaComercialUpdate,
  Cotizacion,
  CotizacionCreate,
  CotizacionDetalle,
  CotizacionDetalleCreate,
  CotizacionDetalleUpdate,
  CotizacionUpdate,
  CotizacionVersion,
  CotizacionVersionCreate,
  CotizacionVersionUpdate,
  EspecificacionBobinaSolicitada,
  EspecificacionBobinaSolicitadaCreate,
  EspecificacionBobinaSolicitadaUpdate,
  EspecificacionBolsaSolicitada,
  EspecificacionBolsaSolicitadaCreate,
  EspecificacionBolsaSolicitadaUpdate,
  EspecificacionProductoSolicitado,
  EspecificacionProductoSolicitadoCreate,
  EspecificacionProductoSolicitadoUpdate,
  EspecificacionProductoSolicitadoVersionCreateRequest,
  CrearVersionEspecificacionResponse,
  PaginatedResponse,
  Pedido,
  PedidoCreate,
  PedidoDetalle,
  PedidoDetalleCreate,
  PedidoDetalleUpdate,
  PedidoUpdate,
  SolicitudComercial,
  SolicitudComercialCreate,
  SolicitudComercialUpdate,
  EjecutivoComercial,
  RequerimientoDetalle,
  VarianteColorSolicitada,
  VarianteColorSolicitadaCreate,
  VarianteColorSolicitadaUpdate, 
  Moneda,
  CrearCotizacionResponse,
  CrearCotizacionVersionResponse,
  AgregarDetalleCotizacionResponse,
  FormalizarCotizacionWizardPayload,
  FormalizarCotizacionWizardResponse,
} from "./comercial.types";

// ============================================================
// CUENTAS COMERCIALES
// ============================================================

export const cuentasComercialesApi = {
  list: async (
    params?: ApiQueryParams,
  ) => api.get<CuentaComercial[]>(
    "/comercial/cuentas-comerciales/",
    { params },
  ),

  get: async (id: number): Promise<CuentaComercial> => {
    return api.get<CuentaComercial>(
      `/comercial/cuentas-comerciales/${id}/`,
    );
  },

  create: async (
    data: CuentaComercialCreate,
  ): Promise<CuentaComercial> => {
    return api.post<CuentaComercial>(
      "/comercial/cuentas-comerciales/",
      data,
    );
  },

  update: async (
    id: number,
    data: CuentaComercialUpdate,
  ): Promise<CuentaComercial> => {
    return api.patch<CuentaComercial>(
      `/comercial/cuentas-comerciales/${id}/`,
      data,
    );
  },

  desactivar: async (id: number): Promise<CuentaComercial> => {
    return api.patch<CuentaComercial>(
      `/comercial/cuentas-comerciales/${id}/desactivar/`,
    );
  },

  activar: async (id: number): Promise<CuentaComercial> => {
  return api.patch<CuentaComercial>(
    `/comercial/cuentas-comerciales/${id}/activar/`,
  );
},

  remove: async (id: number): Promise<void> => {
    await api.delete(`/comercial/cuentas-comerciales/${id}/`);
  },
};

// ============================================================
// EJECUTIVOS COMERCIAL
// ============================================================
export const ejecutivosComercialesApi = {
  list: async (): Promise<EjecutivoComercial[]> => {
    return api.get<EjecutivoComercial[]>(
      "/usuarios/ejecutivos-comerciales/",
    );
  },
};

// ============================================================
// ACTIVIDADES COMERCIALES
// ============================================================

export const actividadesComercialesApi = {
  list: async (
    params?: ApiQueryParams,
  ): Promise<ActividadComercial[]> => {
    return api.get<ActividadComercial[]>(
      "/comercial/actividades/",
      { params },
    );
  },

  get: async (id: number): Promise<ActividadComercial> => {
    return api.get<ActividadComercial>(
      `/comercial/actividades/${id}/`,
    );
  },

  create: async (
    data: ActividadComercialCreate,
  ): Promise<ActividadComercial> => {
    return api.post<ActividadComercial>(
      "/comercial/actividades/",
      data,
    );
  },

  update: async (
    id: number,
    data: ActividadComercialUpdate,
  ): Promise<ActividadComercial> => {
    return api.patch<ActividadComercial>(
      `/comercial/actividades/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/comercial/actividades/${id}/`);
  },
};


// ============================================================
// SOLICITUDES COMERCIALES
// ============================================================

export const solicitudesComercialesApi = {
  list: async (
    params?: ApiQueryParams,
  ): Promise<SolicitudComercial[]> => {
    return api.get<SolicitudComercial[]>(
      "/comercial/solicitudes/",
      { params },
    );
  },

  get: async (id: number): Promise<RequerimientoDetalle> => {
    return api.get<RequerimientoDetalle>(
      `/comercial/solicitudes/${id}/detalle/`,
    );
  },

  create: async (
    data: SolicitudComercialCreate,
  ): Promise<SolicitudComercial> => {
    return api.post<SolicitudComercial>(
      "/comercial/solicitudes/",
      data,
    );
  },

  update: async (
    id: number,
    data: SolicitudComercialUpdate,
  ): Promise<SolicitudComercial> => {
    return api.patch<SolicitudComercial>(
      `/comercial/solicitudes/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/comercial/solicitudes/${id}/`);
  },
};


// ============================================================
// ESPECIFICACIÓN DE PRODUCTO SOLICITADO
// ============================================================

export const especificacionesProductoApi = {
  list: async (
    params?: ApiQueryParams,
  ): Promise<EspecificacionProductoSolicitado[]> => {
    return api.get<EspecificacionProductoSolicitado[]>(
      "/comercial/especificacion-producto-solicitado/",
      { params },
    );
  },

  get: async (
    id: number,
  ): Promise<EspecificacionProductoSolicitado> => {
    return api.get<EspecificacionProductoSolicitado>(
      `/comercial/especificacion-producto-solicitado/${id}/`,
    );
  },

  create: async (
    data: EspecificacionProductoSolicitadoCreate,
  ): Promise<EspecificacionProductoSolicitado> => {
    return api.post<EspecificacionProductoSolicitado>(
      "/comercial/especificacion-producto-solicitado/",
      data,
    );
  },

  update: async (
    id: number,
    data: EspecificacionProductoSolicitadoUpdate,
  ): Promise<EspecificacionProductoSolicitado> => {
    const response =
      await api.patch<EspecificacionProductoSolicitado>(
        `/comercial/especificacion-producto-solicitado/${id}/`,
        data,
      );

    return response;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(
      `/comercial/especificacion-producto-solicitado/${id}/`,
    );
  },

  crearVersion: async (
    solicitudId: number,
    data: EspecificacionProductoSolicitadoVersionCreateRequest,
  ): Promise<CrearVersionEspecificacionResponse> =>
    api.post<CrearVersionEspecificacionResponse>(
      `/comercial/solicitudes/${solicitudId}/crear_nueva_version/`,
      data,
    ),
};


// ============================================================
// VARIANTES DE COLOR SOLICITADAS
// ============================================================

export const variantesColorApi = {
  create: async (
    data: VarianteColorSolicitadaCreate,
  ): Promise<VarianteColorSolicitada> => {
    return api.post<VarianteColorSolicitada>(
      "/comercial/variante-color-solicitada/",
      data,
    );
  },

  update: async (
    id: number,
    data: VarianteColorSolicitadaUpdate,
  ): Promise<VarianteColorSolicitada> => {
    return api.patch<VarianteColorSolicitada>(
      `/comercial/variante-color-solicitada/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(
      `/comercial/variante-color-solicitada/${id}/`,
    );
  },
};


// ============================================================
// ESPECIFICACIÓN DE BOLSA SOLICITADA
// ============================================================

export const especificacionesBolsaApi = {
  list: async (
    params?: ApiQueryParams,
  ): Promise<EspecificacionBolsaSolicitada[]> => {
    return api.get<EspecificacionBolsaSolicitada[]>(
      "/comercial/especificacion-bolsa-solicitada/",
      { params },
    );
  },

  get: async (
    id: number,
  ): Promise<EspecificacionBolsaSolicitada> => {
    return api.get<EspecificacionBolsaSolicitada>(
      `/comercial/especificacion-bolsa-solicitada/${id}/`,
    );
  },

  create: async (
    data: EspecificacionBolsaSolicitadaCreate,
  ): Promise<EspecificacionBolsaSolicitada> => {
    return api.post<EspecificacionBolsaSolicitada>(
      "/comercial/especificacion-bolsa-solicitada/",
      data,
    );
  },

  update: async (
    id: number,
    data: EspecificacionBolsaSolicitadaUpdate,
  ): Promise<EspecificacionBolsaSolicitada> => {
    return api.patch<EspecificacionBolsaSolicitada>(
      `/comercial/especificacion-bolsa-solicitada/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(
      `/comercial/especificacion-bolsa-solicitada/${id}/`,
    );
  },
};


// ============================================================
// ESPECIFICACIÓN DE BOBINA SOLICITADA
// ============================================================

export const especificacionesBobinaApi = {
  list: async (
    params?: ApiQueryParams,
  ): Promise<EspecificacionBobinaSolicitada[]> => {
    return api.get<EspecificacionBobinaSolicitada[]>(
      "/comercial/especificacion-bobina-solicitada/",
      { params },
    );
  },

  get: async (
    id: number,
  ): Promise<EspecificacionBobinaSolicitada> => {
    return api.get<EspecificacionBobinaSolicitada>(
      `/comercial/especificacion-bobina-solicitada/${id}/`,
    );
  },

  create: async (
    data: EspecificacionBobinaSolicitadaCreate,
  ): Promise<EspecificacionBobinaSolicitada> => {
    return api.post<EspecificacionBobinaSolicitada>(
      "/comercial/especificacion-bobina-solicitada/",
      data,
    );
  },

  update: async (
    id: number,
    data: EspecificacionBobinaSolicitadaUpdate,
  ): Promise<EspecificacionBobinaSolicitada> => {
    return api.patch<EspecificacionBobinaSolicitada>(
      `/comercial/especificacion-bobina-solicitada/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(
      `/comercial/especificacion-bobina-solicitada/${id}/`,
    );
  },
};


// ============================================================
// COMUNICACIONES
// ============================================================

export const comunicacionesApi = {
  list: async (
    params?: ApiQueryParams,
  ): Promise<Comunicacion[]> => {      /*Promise<PaginatedResponse<Comunicacion>> => {*/
     return api.get<Comunicacion[]>(   /*return api.get<PaginatedResponse<Comunicacion>>(*/
      "/comercial/comunicaciones/",
      { params },
    );
  },

  get: async (id: number): Promise<Comunicacion> => {
    return api.get<Comunicacion>(
      `/comercial/comunicaciones/${id}/`,
    );
  },

  create: async (
    data: ComunicacionCreate,
  ): Promise<Comunicacion> => {
    return api.post<Comunicacion>(
      "/comercial/comunicaciones/",
      data,
    );
  },

  update: async (
    id: number,
    data: ComunicacionUpdate,
  ): Promise<Comunicacion> => {
    return api.patch<Comunicacion>(
      `/comercial/comunicaciones/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/comercial/comunicaciones/${id}/`);
  },
};


// ============================================================
// COTIZACIONES
// ============================================================

export const cotizacionesApi = {
  list: async (
    params?: ApiQueryParams,
  ): Promise<PaginatedResponse<Cotizacion>> => {
    return api.get<PaginatedResponse<Cotizacion>>(
      "/comercial/cotizaciones/",
      { params },
    );
  },

  get: async (id: number): Promise<Cotizacion> => {
    return api.get<Cotizacion>(
      `/comercial/cotizaciones/${id}/`,
    );
  },

  create: async (
    data: CotizacionCreate,
  ): Promise<Cotizacion> => {
    return api.post<Cotizacion>(
      "/comercial/cotizaciones/",
      data,
    );
  },

  update: async (
    id: number,
    data: CotizacionUpdate,
  ): Promise<Cotizacion> => {
    return api.patch<Cotizacion>(
      `/comercial/cotizaciones/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/comercial/cotizaciones/${id}/`);
  },

  crearDesdeSolicitud: async (data: {
    solicitud_comercial_id: number;
    fecha_vencimiento?: string | null;
    observaciones?: string;
    producto_version_id?: number | null;
  }): Promise<CrearCotizacionResponse> => {
    return api.post<CrearCotizacionResponse>(
      "/comercial/cotizaciones/crear_desde_solicitud/",
      data
    );
  },

  formalizarDesdeWizard: async (
    data: FormalizarCotizacionWizardPayload,
  ): Promise<FormalizarCotizacionWizardResponse> =>
    api.post<FormalizarCotizacionWizardResponse>(
      "/comercial/cotizaciones/formalizar-desde-wizard/",
      data,
    ),
};



// ============================================================
// VERSIONES DE COTIZACIÓN
// ============================================================
export const cotizacionesVersionesApi = {
  list: async (
    params?: ApiQueryParams,
  ): Promise<PaginatedResponse<CotizacionVersion>> => {
    return api.get<PaginatedResponse<CotizacionVersion>>(
      "/comercial/cotizaciones-versiones/",
      { params },
    );
  },

  get: async (id: number): Promise<CotizacionVersion> => {
    return api.get<CotizacionVersion>(
      `/comercial/cotizaciones-versiones/${id}/`,
    );
  },

  create: async (
    data: CotizacionVersionCreate,
  ): Promise<CotizacionVersion> => {
    return api.post<CotizacionVersion>(
      "/comercial/cotizaciones-versiones/",
      data,
    );
  },

  crearVersion: async (
    cotizacionId: number,
    data?: {
      moneda?: Moneda;
    },
  ): Promise<CrearCotizacionVersionResponse> => {
    return api.post<CrearCotizacionVersionResponse>(
      `/comercial/cotizaciones/${cotizacionId}/crear_version/`,
      data ?? {},
    );
  },

  agregarDetalle: async (
    versionId: number,
    data: {
      especificacion_producto_solicitado_version_id?: number | null;
      producto_version_id?: number | null;
      cantidad: string;
      costo_estimado?: string | null;
      precio_lista: string;
      descuento_porcentaje?: string;
    },
  ): Promise<AgregarDetalleCotizacionResponse> => {
    return api.post<AgregarDetalleCotizacionResponse>(
      `/comercial/cotizaciones-versiones/${versionId}/agregar_detalle/`,
      data,
    );
  },

  enviar: async (
    versionId: number,
  ) => {
    return api.post(
      `/comercial/cotizaciones-versiones/${versionId}/enviar/`,
    );
  },

  aceptar: async (
    versionId: number,
    observaciones?: string,
  ) => {
    return api.post(
      `/comercial/cotizaciones-versiones/${versionId}/aceptar/`,
      { observaciones },
    );
  },

  rechazar: async (
    versionId: number,
    motivo?: string,
  ) => {
    return api.post(
      `/comercial/cotizaciones-versiones/${versionId}/rechazar/`,
      { motivo },
    );
  },

  update: async (
    id: number,
    data: CotizacionVersionUpdate,
  ): Promise<CotizacionVersion> => {
    return api.patch<CotizacionVersion>(
      `/comercial/cotizaciones-versiones/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(
      `/comercial/cotizaciones-versiones/${id}/`,
    );
  },
};


// ============================================================
// DETALLES DE COTIZACIÓN
// ============================================================

export const cotizacionesDetallesApi = {
  list: async (
    params?: ApiQueryParams,
  ): Promise<PaginatedResponse<CotizacionDetalle>> => {
    return api.get<PaginatedResponse<CotizacionDetalle>>(
      "/comercial/cotizaciones-detalles/",
      { params },
    );
  },

  get: async (id: number): Promise<CotizacionDetalle> => {
    return api.get<CotizacionDetalle>(
      `/comercial/cotizaciones-detalles/${id}/`,
    );
  },

  create: async (
    data: CotizacionDetalleCreate,
  ): Promise<CotizacionDetalle> => {
    return api.post<CotizacionDetalle>(
      "/comercial/cotizaciones-detalles/",
      data,
    );
  },

  update: async (
    id: number,
    data: CotizacionDetalleUpdate,
  ): Promise<CotizacionDetalle> => {
    return api.patch<CotizacionDetalle>(
      `/comercial/cotizaciones-detalles/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(
      `/comercial/cotizaciones-detalles/${id}/`,
    );
  },
};


// ============================================================
// PEDIDOS
// ============================================================

export const pedidosApi = {
  list: async (
    params?: ApiQueryParams,
  ): Promise<PaginatedResponse<Pedido>> => {
    return api.get<PaginatedResponse<Pedido>>(
      "/comercial/pedidos/",
      { params },
    );
  },

  get: async (id: number): Promise<Pedido> => {
    return api.get<Pedido>(
      `/comercial/pedidos/${id}/`,
    );
  },

  create: async (
    data: PedidoCreate,
  ): Promise<Pedido> => {
    return api.post<Pedido>(
      "/comercial/pedidos/",
      data,
    );
  },

  update: async (
    id: number,
    data: PedidoUpdate,
  ): Promise<Pedido> => {
    return api.patch<Pedido>(
      `/comercial/pedidos/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/comercial/pedidos/${id}/`);
  },
  crearDesdeCotizacion: async (data: {
    cotizacion_version_id: number;
    fecha_entrega_comprometida?: string;
    observaciones?: string;
  }) => {
    return api.post(
      "/comercial/pedidos/crear_desde_cotizacion/",
      data,
    );
  },

  crearDetallesDesdeCotizacion: async (
    pedidoId: number,
  ) => {
    return api.post(
      `/comercial/pedidos/${pedidoId}/crear_detalles_desde_cotizacion/`,
    );
  },

  confirmar: async (
    pedidoId: number,
    observaciones?: string,
  ) => {
    return api.post(
      `/comercial/pedidos/${pedidoId}/confirmar/`,
      { observaciones },
    );
  },

  conDetalles: async (pedidoId: number) => {
    return api.get(
      `/comercial/pedidos/${pedidoId}/con_detalles/`,
    );
  },
};


// ============================================================
// DETALLES DE PEDIDOS
// ============================================================

export const pedidosDetallesApi = {
  list: async (
    params?: ApiQueryParams,
  ): Promise<PaginatedResponse<PedidoDetalle>> => {
    return api.get<PaginatedResponse<PedidoDetalle>>(
      "/comercial/pedidos-detalles/",
      { params },
    );
  },

  get: async (id: number): Promise<PedidoDetalle> => {
    return api.get<PedidoDetalle>(
      `/comercial/pedidos-detalles/${id}/`,
    );
  },

  create: async (
    data: PedidoDetalleCreate,
  ): Promise<PedidoDetalle> => {
    return api.post<PedidoDetalle>(
      "/comercial/pedidos-detalles/",
      data,
    );
  },

  update: async (
    id: number,
    data: PedidoDetalleUpdate,
  ): Promise<PedidoDetalle> => {
    return api.patch<PedidoDetalle>(
      `/comercial/pedidos-detalles/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(
      `/comercial/pedidos-detalles/${id}/`,
    );
  },
};
