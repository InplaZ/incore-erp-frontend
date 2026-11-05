import { api } from "@/api/api.config";
import type { RevisionTecnicaOferta, RevisionTecnicaProducto } from "@/features/comercial/comercial.types";

export const revisionesTecnicasApi = {
  list: (params?: { vigente?: boolean; estado?: string }) =>
    api.get<RevisionTecnicaOferta[]>("/produccion/revisiones-tecnicas/", { params }),

  get: (id: number) =>
    api.get<RevisionTecnicaOferta>(`/produccion/revisiones-tecnicas/${id}/`),

  aprobarProducto: (productoId: number) =>
    api.post<RevisionTecnicaProducto>(`/produccion/revision-tecnica-productos/${productoId}/aprobar/`, {}),

  observarProducto: (productoId: number, observacion_tecnica: string) =>
    api.post<RevisionTecnicaProducto>(`/produccion/revision-tecnica-productos/${productoId}/observar/`, { observacion_tecnica }),
};
