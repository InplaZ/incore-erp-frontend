import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  actividadesComercialesApi,
  comunicacionesApi,
  cuentasComercialesApi,
  cotizacionesApi,
  cotizacionesDetallesApi,
  cotizacionesVersionesApi,
  especificacionesBobinaApi,
  especificacionesBolsaApi,
  especificacionesProductoApi,
  pedidosApi,
  pedidosDetallesApi,
  solicitudesComercialesApi,
} from "./comercial.api";

import type {
  ActividadComercialCreate,
  ActividadComercialUpdate,
  ComunicacionCreate,
  ComunicacionUpdate,
  CuentaComercialCreate,
  CuentaComercialUpdate,
  CotizacionCreate,
  CotizacionDetalleCreate,
  CotizacionDetalleUpdate,
  CotizacionUpdate,
  CotizacionVersionCreate,
  CotizacionVersionUpdate,
  EspecificacionBobinaSolicitadaCreate,
  EspecificacionBobinaSolicitadaUpdate,
  EspecificacionBolsaSolicitadaCreate,
  EspecificacionBolsaSolicitadaUpdate,
  EspecificacionProductoSolicitadoCreate,
  EspecificacionProductoSolicitadoUpdate,
  PedidoCreate,
  PedidoDetalleCreate,
  PedidoDetalleUpdate,
  PedidoUpdate,
  SolicitudComercialCreate,
  SolicitudComercialUpdate,
  CuentaComercial,
} from "./comercial.types";

import type { ApiQueryParams } from "@/api/api.types";


// ============================================================
// QUERY KEYS
// ============================================================

export const comercialQueryKeys = {
  all: ["comercial"] as const,

  cuentas: () => [...comercialQueryKeys.all, "cuentas"] as const,
  cuenta: (id: number) =>
    [...comercialQueryKeys.cuentas(), id] as const,

  actividades: () =>
    [...comercialQueryKeys.all, "actividades"] as const,
  actividad: (id: number) =>
    [...comercialQueryKeys.actividades(), id] as const,

  solicitudes: () =>
    [...comercialQueryKeys.all, "solicitudes"] as const,
  solicitud: (id: number) =>
    [...comercialQueryKeys.solicitudes(), id] as const,

  especificacionesProducto: () =>
    [...comercialQueryKeys.all, "especificaciones-producto"] as const,

  especificacionProducto: (id: number) =>
    [...comercialQueryKeys.especificacionesProducto(), id] as const,

  especificacionesBolsa: () =>
    [...comercialQueryKeys.all, "especificaciones-bolsa"] as const,

  especificacionBolsa: (id: number) =>
    [...comercialQueryKeys.especificacionesBolsa(), id] as const,

  especificacionesBobina: () =>
    [...comercialQueryKeys.all, "especificaciones-bobina"] as const,

  especificacionBobina: (id: number) =>
    [...comercialQueryKeys.especificacionesBobina(), id] as const,

  comunicaciones: () =>
    [...comercialQueryKeys.all, "comunicaciones"] as const,

  comunicacion: (id: number) =>
    [...comercialQueryKeys.comunicaciones(), id] as const,

  cotizaciones: () =>
    [...comercialQueryKeys.all, "cotizaciones"] as const,

  cotizacion: (id: number) =>
    [...comercialQueryKeys.cotizaciones(), id] as const,

  cotizacionesVersiones: () =>
    [...comercialQueryKeys.all, "cotizaciones-versiones"] as const,

  cotizacionVersion: (id: number) =>
    [...comercialQueryKeys.cotizacionesVersiones(), id] as const,

  cotizacionesDetalles: () =>
    [...comercialQueryKeys.all, "cotizaciones-detalles"] as const,

  cotizacionDetalle: (id: number) =>
    [...comercialQueryKeys.cotizacionesDetalles(), id] as const,

  pedidos: () =>
    [...comercialQueryKeys.all, "pedidos"] as const,

  pedido: (id: number) =>
    [...comercialQueryKeys.pedidos(), id] as const,

  pedidosDetalles: () =>
    [...comercialQueryKeys.all, "pedidos-detalles"] as const,

  pedidoDetalle: (id: number) =>
    [...comercialQueryKeys.pedidosDetalles(), id] as const,
};


// ============================================================
// CUENTAS COMERCIALES
// ============================================================

export function useCuentasComerciales(
  params?: ApiQueryParams,
) {
  return useQuery<CuentaComercial[]>({
    queryKey: [
      ...comercialQueryKeys.cuentas(),
      params,
    ],
    queryFn: () => cuentasComercialesApi.list(params),
  }); 
}

export function useCuentaComercial(id: number) {
  return useQuery({
    queryKey: comercialQueryKeys.cuenta(id),
    queryFn: () =>
      cuentasComercialesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateCuentaComercial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CuentaComercialCreate) =>
      cuentasComercialesApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: comercialQueryKeys.cuentas(),
      });
    },
  });
}

export function useUpdateCuentaComercial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: CuentaComercialUpdate;
    }) =>
      cuentasComercialesApi.update(id, data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: comercialQueryKeys.cuentas(),
      });

      queryClient.setQueryData(
        comercialQueryKeys.cuenta(data.id),
        data,
      );
    },
  });
}

export function useDeleteCuentaComercial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      cuentasComercialesApi.remove(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: comercialQueryKeys.cuentas(),
      });

      queryClient.removeQueries({
        queryKey: comercialQueryKeys.cuenta(id),
      });
    },
  });
}


// ============================================================
// ACTIVIDADES COMERCIALES
// ============================================================

export function useActividadesComerciales(
  params?: ApiQueryParams,
) {
  return useQuery({
    queryKey: [
      ...comercialQueryKeys.actividades(),
      params,
    ],
    queryFn: () =>
      actividadesComercialesApi.list(params),
  });
}

export function useActividadComercial(id: number) {
  return useQuery({
    queryKey: comercialQueryKeys.actividad(id),
    queryFn: () =>
      actividadesComercialesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateActividadComercial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ActividadComercialCreate) =>
      actividadesComercialesApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: comercialQueryKeys.actividades(),
      });
    },
  });
}

export function useUpdateActividadComercial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: ActividadComercialUpdate;
    }) =>
      actividadesComercialesApi.update(id, data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: comercialQueryKeys.actividades(),
      });

      queryClient.setQueryData(
        comercialQueryKeys.actividad(data.id),
        data,
      );
    },
  });
}


// ============================================================
// SOLICITUDES COMERCIALES
// ============================================================

export function useSolicitudesComerciales(
  params?: ApiQueryParams,
) {
  return useQuery({
    queryKey: [
      ...comercialQueryKeys.solicitudes(),
      params,
    ],
    queryFn: () =>
      solicitudesComercialesApi.list(params),
  });
}

export function useSolicitudComercial(id: number) {
  return useQuery({
    queryKey: comercialQueryKeys.solicitud(id),
    queryFn: () =>
      solicitudesComercialesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateSolicitudComercial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SolicitudComercialCreate) =>
      solicitudesComercialesApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: comercialQueryKeys.solicitudes(),
      });
    },
  });
}

export function useUpdateSolicitudComercial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: SolicitudComercialUpdate;
    }) =>
      solicitudesComercialesApi.update(id, data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: comercialQueryKeys.solicitudes(),
      });

      queryClient.setQueryData(
        comercialQueryKeys.solicitud(data.id),
        data,
      );
    },
  });
}


// ============================================================
// ESPECIFICACIÓN DE PRODUCTO
// ============================================================

export function useEspecificacionesProducto(
  params?: ApiQueryParams,
) {
  return useQuery({
    queryKey: [
      ...comercialQueryKeys.especificacionesProducto(),
      params,
    ],
    queryFn: () =>
      especificacionesProductoApi.list(params),
  });
}

export function useEspecificacionProducto(id: number) {
  return useQuery({
    queryKey:
      comercialQueryKeys.especificacionProducto(id),

    queryFn: () =>
      especificacionesProductoApi.get(id),

    enabled: !!id,
  });
}

export function useCreateEspecificacionProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: EspecificacionProductoSolicitadoCreate,
    ) =>
      especificacionesProductoApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          comercialQueryKeys.especificacionesProducto(),
      });
    },
  });
}

export function useUpdateEspecificacionProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: EspecificacionProductoSolicitadoUpdate;
    }) =>
      especificacionesProductoApi.update(id, data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey:
          comercialQueryKeys.especificacionesProducto(),
      });

      queryClient.setQueryData(
        comercialQueryKeys.especificacionProducto(
          data.id,
        ),
        data,
      );
    },
  });
}


// ============================================================
// ESPECIFICACIÓN DE BOLSA
// ============================================================

export function useEspecificacionesBolsa(
  params?: ApiQueryParams,
) {
  return useQuery({
    queryKey: [
      ...comercialQueryKeys.especificacionesBolsa(),
      params,
    ],
    queryFn: () =>
      especificacionesBolsaApi.list(params),
  });
}

export function useEspecificacionBolsa(id: number) {
  return useQuery({
    queryKey:
      comercialQueryKeys.especificacionBolsa(id),

    queryFn: () =>
      especificacionesBolsaApi.get(id),

    enabled: !!id,
  });
}

export function useCreateEspecificacionBolsa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: EspecificacionBolsaSolicitadaCreate,
    ) =>
      especificacionesBolsaApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          comercialQueryKeys.especificacionesBolsa(),
      });
    },
  });
}

export function useUpdateEspecificacionBolsa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: EspecificacionBolsaSolicitadaUpdate;
    }) =>
      especificacionesBolsaApi.update(id, data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey:
          comercialQueryKeys.especificacionesBolsa(),
      });

      queryClient.setQueryData(
        comercialQueryKeys.especificacionBolsa(
          data.id,
        ),
        data,
      );
    },
  });
}


// ============================================================
// ESPECIFICACIÓN DE BOBINA
// ============================================================

export function useEspecificacionesBobina(
  params?: ApiQueryParams,
) {
  return useQuery({
    queryKey: [
      ...comercialQueryKeys.especificacionesBobina(),
      params,
    ],
    queryFn: () =>
      especificacionesBobinaApi.list(params),
  });
}

export function useEspecificacionBobina(id: number) {
  return useQuery({
    queryKey:
      comercialQueryKeys.especificacionBobina(id),

    queryFn: () =>
      especificacionesBobinaApi.get(id),

    enabled: !!id,
  });
}

export function useCreateEspecificacionBobina() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: EspecificacionBobinaSolicitadaCreate,
    ) =>
      especificacionesBobinaApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          comercialQueryKeys.especificacionesBobina(),
      });
    },
  });
}

export function useUpdateEspecificacionBobina() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: EspecificacionBobinaSolicitadaUpdate;
    }) =>
      especificacionesBobinaApi.update(id, data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey:
          comercialQueryKeys.especificacionesBobina(),
      });

      queryClient.setQueryData(
        comercialQueryKeys.especificacionBobina(
          data.id,
        ),
        data,
      );
    },
  });
}


// ============================================================
// COMUNICACIONES
// ============================================================

export function useComunicaciones(
  params?: ApiQueryParams,
) {
  return useQuery({
    queryKey: [
      ...comercialQueryKeys.comunicaciones(),
      params,
    ],
    queryFn: () =>
      comunicacionesApi.list(params),
  });
}

export function useComunicacion(id: number) {
  return useQuery({
    queryKey:
      comercialQueryKeys.comunicacion(id),

    queryFn: () =>
      comunicacionesApi.get(id),

    enabled: !!id,
  });
}

export function useCreateComunicacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ComunicacionCreate) =>
      comunicacionesApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          comercialQueryKeys.comunicaciones(),
      });
    },
  });
}

export function useUpdateComunicacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: ComunicacionUpdate;
    }) =>
      comunicacionesApi.update(id, data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey:
          comercialQueryKeys.comunicaciones(),
      });

      queryClient.setQueryData(
        comercialQueryKeys.comunicacion(data.id),
        data,
      );
    },
  });
}


// ============================================================
// COTIZACIONES
// ============================================================

export function useCotizaciones(
  params?: ApiQueryParams,
) {
  return useQuery({
    queryKey: [
      ...comercialQueryKeys.cotizaciones(),
      params,
    ],
    queryFn: () =>
      cotizacionesApi.list(params),
  });
}

export function useCotizacion(id: number) {
  return useQuery({
    queryKey:
      comercialQueryKeys.cotizacion(id),

    queryFn: () =>
      cotizacionesApi.get(id),

    enabled: !!id,
  });
}

export function useCreateCotizacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CotizacionCreate) =>
      cotizacionesApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          comercialQueryKeys.cotizaciones(),
      });
    },
  });
}

export function useUpdateCotizacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: CotizacionUpdate;
    }) =>
      cotizacionesApi.update(id, data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey:
          comercialQueryKeys.cotizaciones(),
      });

      queryClient.setQueryData(
        comercialQueryKeys.cotizacion(data.id),
        data,
      );
    },
  });
}


// ============================================================
// VERSIONES DE COTIZACIÓN
// ============================================================

export function useCotizacionesVersiones(
  params?: ApiQueryParams,
) {
  return useQuery({
    queryKey: [
      ...comercialQueryKeys.cotizacionesVersiones(),
      params,
    ],
    queryFn: () =>
      cotizacionesVersionesApi.list(params),
  });
}

export function useCotizacionVersion(id: number) {
  return useQuery({
    queryKey:
      comercialQueryKeys.cotizacionVersion(id),

    queryFn: () =>
      cotizacionesVersionesApi.get(id),

    enabled: !!id,
  });
}

export function useCreateCotizacionVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: CotizacionVersionCreate,
    ) =>
      cotizacionesVersionesApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          comercialQueryKeys.cotizacionesVersiones(),
      });
    },
  });
}

export function useUpdateCotizacionVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: CotizacionVersionUpdate;
    }) =>
      cotizacionesVersionesApi.update(id, data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey:
          comercialQueryKeys.cotizacionesVersiones(),
      });

      queryClient.setQueryData(
        comercialQueryKeys.cotizacionVersion(
          data.id,
        ),
        data,
      );
    },
  });
}


// ============================================================
// DETALLES DE COTIZACIÓN
// ============================================================

export function useCotizacionesDetalles(
  params?: ApiQueryParams,
) {
  return useQuery({
    queryKey: [
      ...comercialQueryKeys.cotizacionesDetalles(),
      params,
    ],
    queryFn: () =>
      cotizacionesDetallesApi.list(params),
  });
}

export function useCreateCotizacionDetalle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: CotizacionDetalleCreate,
    ) =>
      cotizacionesDetallesApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          comercialQueryKeys.cotizacionesDetalles(),
      });
    },
  });
}

export function useUpdateCotizacionDetalle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: CotizacionDetalleUpdate;
    }) =>
      cotizacionesDetallesApi.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          comercialQueryKeys.cotizacionesDetalles(),
      });
    },
  });
}


// ============================================================
// PEDIDOS
// ============================================================

export function usePedidos(
  params?: ApiQueryParams,
) {
  return useQuery({
    queryKey: [
      ...comercialQueryKeys.pedidos(),
      params,
    ],
    queryFn: () =>
      pedidosApi.list(params),
  });
}

export function usePedido(id: number) {
  return useQuery({
    queryKey:
      comercialQueryKeys.pedido(id),

    queryFn: () =>
      pedidosApi.get(id),

    enabled: !!id,
  });
}

export function useCreatePedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PedidoCreate) =>
      pedidosApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          comercialQueryKeys.pedidos(),
      });
    },
  });
}

export function useUpdatePedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: PedidoUpdate;
    }) =>
      pedidosApi.update(id, data),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey:
          comercialQueryKeys.pedidos(),
      });

      queryClient.setQueryData(
        comercialQueryKeys.pedido(data.id),
        data,
      );
    },
  });
}


// ============================================================
// DETALLES DE PEDIDOS
// ============================================================

export function usePedidosDetalles(
  params?: ApiQueryParams,
) {
  return useQuery({
    queryKey: [
      ...comercialQueryKeys.pedidosDetalles(),
      params,
    ],
    queryFn: () =>
      pedidosDetallesApi.list(params),
  });
}

export function useCreatePedidoDetalle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: PedidoDetalleCreate,
    ) =>
      pedidosDetallesApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          comercialQueryKeys.pedidosDetalles(),
      });
    },
  });
}

export function useUpdatePedidoDetalle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: PedidoDetalleUpdate;
    }) =>
      pedidosDetallesApi.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          comercialQueryKeys.pedidosDetalles(),
      });
    },
  });
}