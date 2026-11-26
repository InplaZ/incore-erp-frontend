import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordenesTrabajoApi } from "@/features/produccion/ordenes-trabajo-api";

export const ordenesTrabajoQueryKeys = {
  all: ["ordenes-trabajo"] as const,
  pedidosHabilitados: () => [...ordenesTrabajoQueryKeys.all, "pedidos-habilitados"] as const,
};

export function usePedidosHabilitadosParaOT() {
  return useQuery({
    queryKey: ordenesTrabajoQueryKeys.pedidosHabilitados(),
    queryFn: ordenesTrabajoApi.pedidosHabilitados,
    refetchInterval: 30_000,
  });
}

export function useCrearOTDesdePedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pedidoDetalleId, observaciones }: { pedidoDetalleId: number; observaciones?: string }) =>
      ordenesTrabajoApi.crearDesdePedido(pedidoDetalleId, observaciones),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordenesTrabajoQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["comercial", "pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["comercial", "pedidos-detalles"] });
    },
  });
}
