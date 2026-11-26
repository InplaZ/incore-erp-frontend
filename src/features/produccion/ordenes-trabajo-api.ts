import { api } from "@/api/api.config";
import type { PaginatedResponse, Pedido, PedidoConDetalles } from "@/features/comercial/comercial.types";

export interface PedidoHabilitadoConDetalles {
  pedido: Pedido;
  detalle: PedidoConDetalles;
}

export interface CrearOrdenProduccionDesdePedidoResponse {
  exito: boolean;
  orden_produccion_id?: number;
  numero_orden?: string;
  mensaje: string;
  pedido_detalle?: number;
}

export const ordenesTrabajoApi = {
  pedidosHabilitados: async (): Promise<PedidoHabilitadoConDetalles[]> => {
    const response = await api.get<PaginatedResponse<Pedido>>(
      "/comercial/pedidos/",
      { params: { estado: "habilitado_produccion", page_size: 100 } },
    );
    return Promise.all(response.results.map(async (pedido) => ({
      pedido,
      detalle: await api.get<PedidoConDetalles>(`/comercial/pedidos/${pedido.id}/con_detalles/`),
    })));
  },

  previsualizarRequerimiento: (pedidoDetalleId: number): Promise<Blob> =>
    api.get<Blob>(
      `/comercial/pedidos-detalles/${pedidoDetalleId}/pdf-requerimiento/`,
      { config: { responseType: "blob" } },
    ),

  crearDesdePedido: (pedidoDetalleId: number, observaciones = ""): Promise<CrearOrdenProduccionDesdePedidoResponse> =>
    api.post<CrearOrdenProduccionDesdePedidoResponse>(
      "/produccion/ordenes-produccion/crear-desde-pedido/",
      { pedido_detalle_id: pedidoDetalleId, observaciones },
    ),
};
