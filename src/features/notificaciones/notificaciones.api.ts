import { api } from "@/api/api.config";

export interface NotificacionApi {
  id: number;
  usuario: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  prioridad: "baja" | "media" | "alta";
  entidad_tipo: string;
  entidad_id: number | null;
  leida: boolean;
  fecha_creacion: string;
  fecha_lectura: string | null;
}

type PaginatedNotifications = { results: NotificacionApi[] };

function unwrapNotifications(response: NotificacionApi[] | PaginatedNotifications) {
  return Array.isArray(response) ? response : response.results;
}

export const notificacionesApi = {
  async list() {
    const response = await api.get<NotificacionApi[] | PaginatedNotifications>("/notificacion/notificaciones/");
    return unwrapNotifications(response);
  },
  countUnread: () => api.get<{ count: number }>("/notificacion/notificaciones/no-leidas-count/"),
  markRead: (id: number) => api.post<NotificacionApi>(`/notificacion/notificaciones/${id}/marcar-leida/`, {}),
  markAllRead: () => api.post<{ actualizadas: number }>("/notificacion/notificaciones/marcar-todas-leidas/", {}),
};
