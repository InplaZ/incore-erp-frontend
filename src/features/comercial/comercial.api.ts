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

  remove: async (id: number): Promise<void> => {
    await api.delete(`/comercial/cuentas-comerciales/${id}/`);
  },
};


// ============================================================
// ACTIVIDADES COMERCIALES
// ============================================================

export const actividadesComercialesApi = {
  list: async (
    params?: ApiQueryParams,
  ): Promise<PaginatedResponse<ActividadComercial>> => {
    return api.get<PaginatedResponse<ActividadComercial>>(
      "/actividades/",
      { params },
    );
  },

  get: async (id: number): Promise<ActividadComercial> => {
    return api.get<ActividadComercial>(
      `/actividades/${id}/`,
    );
  },

  create: async (
    data: ActividadComercialCreate,
  ): Promise<ActividadComercial> => {
    return api.post<ActividadComercial>(
      "/actividades/",
      data,
    );
  },

  update: async (
    id: number,
    data: ActividadComercialUpdate,
  ): Promise<ActividadComercial> => {
    return api.patch<ActividadComercial>(
      `/actividades/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/actividades/${id}/`);
  },
};


// ============================================================
// SOLICITUDES COMERCIALES
// ============================================================

export const solicitudesComercialesApi = {
  list: async (
    params?: ApiQueryParams,
  ): Promise<PaginatedResponse<SolicitudComercial>> => {
    return api.get<PaginatedResponse<SolicitudComercial>>(
      "/solicitudes/",
      { params },
    );
  },

  get: async (id: number): Promise<SolicitudComercial> => {
    return api.get<SolicitudComercial>(
      `/solicitudes/${id}/`,
    );
  },

  create: async (
    data: SolicitudComercialCreate,
  ): Promise<SolicitudComercial> => {
    return api.post<SolicitudComercial>(
      "/solicitudes/",
      data,
    );
  },

  update: async (
    id: number,
    data: SolicitudComercialUpdate,
  ): Promise<SolicitudComercial> => {
    return api.patch<SolicitudComercial>(
      `/solicitudes/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/solicitudes/${id}/`);
  },
};


// ============================================================
// ESPECIFICACIÓN DE PRODUCTO SOLICITADO
// ============================================================

export const especificacionesProductoApi = {
  list: async (
    params?: ApiQueryParams,
  ): Promise<PaginatedResponse<EspecificacionProductoSolicitado>> => {
    return api.get<PaginatedResponse<EspecificacionProductoSolicitado>>(
      "/especificacion-producto-solicitado/",
      { params },
    );
  },

  get: async (
    id: number,
  ): Promise<EspecificacionProductoSolicitado> => {
    return api.get<EspecificacionProductoSolicitado>(
      `/especificacion-producto-solicitado/${id}/`,
    );
  },

  create: async (
    data: EspecificacionProductoSolicitadoCreate,
  ): Promise<EspecificacionProductoSolicitado> => {
    return api.post<EspecificacionProductoSolicitado>(
      "/especificacion-producto-solicitado/",
      data,
    );
  },

  update: async (
    id: number,
    data: EspecificacionProductoSolicitadoUpdate,
  ): Promise<EspecificacionProductoSolicitado> => {
    const response =
      await api.patch<EspecificacionProductoSolicitado>(
        `/especificacion-producto-solicitado/${id}/`,
        data,
      );

    return response;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(
      `/especificacion-producto-solicitado/${id}/`,
    );
  },
};


// ============================================================
// ESPECIFICACIÓN DE BOLSA SOLICITADA
// ============================================================

export const especificacionesBolsaApi = {
  list: async (
    params?: ApiQueryParams,
  ): Promise<PaginatedResponse<EspecificacionBolsaSolicitada>> => {
    return api.get<PaginatedResponse<EspecificacionBolsaSolicitada>>(
      "/especificacion-bolsa-solicitada/",
      { params },
    );
  },

  get: async (
    id: number,
  ): Promise<EspecificacionBolsaSolicitada> => {
    return api.get<EspecificacionBolsaSolicitada>(
      `/especificacion-bolsa-solicitada/${id}/`,
    );
  },

  create: async (
    data: EspecificacionBolsaSolicitadaCreate,
  ): Promise<EspecificacionBolsaSolicitada> => {
    return api.post<EspecificacionBolsaSolicitada>(
      "/especificacion-bolsa-solicitada/",
      data,
    );
  },

  update: async (
    id: number,
    data: EspecificacionBolsaSolicitadaUpdate,
  ): Promise<EspecificacionBolsaSolicitada> => {
    return api.patch<EspecificacionBolsaSolicitada>(
      `/especificacion-bolsa-solicitada/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(
      `/especificacion-bolsa-solicitada/${id}/`,
    );
  },
};


// ============================================================
// ESPECIFICACIÓN DE BOBINA SOLICITADA
// ============================================================

export const especificacionesBobinaApi = {
  list: async (
    params?: ApiQueryParams,
  ): Promise<PaginatedResponse<EspecificacionBobinaSolicitada>> => {
    return api.get<PaginatedResponse<EspecificacionBobinaSolicitada>>(
      "/especificacion-bobina-solicitada/",
      { params },
    );
  },

  get: async (
    id: number,
  ): Promise<EspecificacionBobinaSolicitada> => {
    return api.get<EspecificacionBobinaSolicitada>(
      `/especificacion-bobina-solicitada/${id}/`,
    );
  },

  create: async (
    data: EspecificacionBobinaSolicitadaCreate,
  ): Promise<EspecificacionBobinaSolicitada> => {
    return api.post<EspecificacionBobinaSolicitada>(
      "/especificacion-bobina-solicitada/",
      data,
    );
  },

  update: async (
    id: number,
    data: EspecificacionBobinaSolicitadaUpdate,
  ): Promise<EspecificacionBobinaSolicitada> => {
    return api.patch<EspecificacionBobinaSolicitada>(
      `/especificacion-bobina-solicitada/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(
      `/especificacion-bobina-solicitada/${id}/`,
    );
  },
};


// ============================================================
// COMUNICACIONES
// ============================================================

export const comunicacionesApi = {
  list: async (
    params?: ApiQueryParams,
  ): Promise<PaginatedResponse<Comunicacion>> => {
    return api.get<PaginatedResponse<Comunicacion>>(
      "/comunicaciones/",
      { params },
    );
  },

  get: async (id: number): Promise<Comunicacion> => {
    return api.get<Comunicacion>(
      `/comunicaciones/${id}/`,
    );
  },

  create: async (
    data: ComunicacionCreate,
  ): Promise<Comunicacion> => {
    return api.post<Comunicacion>(
      "/comunicaciones/",
      data,
    );
  },

  update: async (
    id: number,
    data: ComunicacionUpdate,
  ): Promise<Comunicacion> => {
    return api.patch<Comunicacion>(
      `/comunicaciones/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/comunicaciones/${id}/`);
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
      "/cotizaciones/",
      { params },
    );
  },

  get: async (id: number): Promise<Cotizacion> => {
    return api.get<Cotizacion>(
      `/cotizaciones/${id}/`,
    );
  },

  create: async (
    data: CotizacionCreate,
  ): Promise<Cotizacion> => {
    return api.post<Cotizacion>(
      "/cotizaciones/",
      data,
    );
  },

  update: async (
    id: number,
    data: CotizacionUpdate,
  ): Promise<Cotizacion> => {
    return api.patch<Cotizacion>(
      `/cotizaciones/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/cotizaciones/${id}/`);
  },
};


// ============================================================
// VERSIONES DE COTIZACIÓN
// ============================================================

export const cotizacionesVersionesApi = {
  list: async (
    params?: ApiQueryParams,
  ): Promise<PaginatedResponse<CotizacionVersion>> => {
    return api.get<PaginatedResponse<CotizacionVersion>>(
      "/cotizaciones-versiones/",
      { params },
    );
  },

  get: async (id: number): Promise<CotizacionVersion> => {
    return api.get<CotizacionVersion>(
      `/cotizaciones-versiones/${id}/`,
    );
  },

  create: async (
    data: CotizacionVersionCreate,
  ): Promise<CotizacionVersion> => {
      return api.post<CotizacionVersion>(
        "/cotizaciones-versiones/",
        data,
      );
  },

  update: async (
    id: number,
    data: CotizacionVersionUpdate,
  ): Promise<CotizacionVersion> => {
    return api.patch<CotizacionVersion>(
        `/cotizaciones-versiones/${id}/`,
        data,
      );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(
      `/cotizaciones-versiones/${id}/`,
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
      "/cotizaciones-detalles/",
      { params },
    );
  },

  get: async (id: number): Promise<CotizacionDetalle> => {
    return api.get<CotizacionDetalle>(
      `/cotizaciones-detalles/${id}/`,
    );
  },

  create: async (
    data: CotizacionDetalleCreate,
  ): Promise<CotizacionDetalle> => {
    return api.post<CotizacionDetalle>(
      "/cotizaciones-detalles/",
      data,
    );
  },

  update: async (
    id: number,
    data: CotizacionDetalleUpdate,
  ): Promise<CotizacionDetalle> => {
    return api.patch<CotizacionDetalle>(
      `/cotizaciones-detalles/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(
      `/cotizaciones-detalles/${id}/`,
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
      "/pedidos/",
      { params },
    );
  },

  get: async (id: number): Promise<Pedido> => {
    return api.get<Pedido>(
      `/pedidos/${id}/`,
    );
  },

  create: async (
    data: PedidoCreate,
  ): Promise<Pedido> => {
    return api.post<Pedido>(
      "/pedidos/",
      data,
    );
  },

  update: async (
    id: number,
    data: PedidoUpdate,
  ): Promise<Pedido> => {
    return api.patch<Pedido>(
      `/pedidos/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/pedidos/${id}/`);
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
      "/pedidos-detalles/",
      { params },
    );
  },

  get: async (id: number): Promise<PedidoDetalle> => {
    return api.get<PedidoDetalle>(
      `/pedidos-detalles/${id}/`,
    );
  },

  create: async (
    data: PedidoDetalleCreate,
  ): Promise<PedidoDetalle> => {
    return api.post<PedidoDetalle>(
      "/pedidos-detalles/",
      data,
    );
  },

  update: async (
    id: number,
    data: PedidoDetalleUpdate,
  ): Promise<PedidoDetalle> => {
    return api.patch<PedidoDetalle>(
      `/pedidos-detalles/${id}/`,
      data,
    );
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(
      `/pedidos-detalles/${id}/`,
    );
  },
};