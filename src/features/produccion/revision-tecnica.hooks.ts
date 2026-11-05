import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { revisionesTecnicasApi } from "./revision-tecnica.api";

export const revisionTecnicaQueryKeys = {
  all: ["revision-tecnica"] as const,
  list: () => [...revisionTecnicaQueryKeys.all, "list"] as const,
  detail: (id: number) => [...revisionTecnicaQueryKeys.all, id] as const,
};

export function useRevisionesTecnicas() {
  return useQuery({
    queryKey: revisionTecnicaQueryKeys.list(),
    queryFn: () => revisionesTecnicasApi.list({ vigente: true }),
  });
}

export function useRevisionTecnica(id: number | null) {
  return useQuery({
    queryKey: id ? revisionTecnicaQueryKeys.detail(id) : [...revisionTecnicaQueryKeys.all, "detail", null],
    queryFn: () => revisionesTecnicasApi.get(id!),
    enabled: id !== null,
  });
}

export function useEvaluarProductoRevision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { productoId: number; resultado: "aprobar" | "observar"; observacion?: string }) =>
      input.resultado === "aprobar"
        ? revisionesTecnicasApi.aprobarProducto(input.productoId)
        : revisionesTecnicasApi.observarProducto(input.productoId, input.observacion ?? ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: revisionTecnicaQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["comercial", "pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["comercial", "pedidos-detalles"] });
    },
  });
}
