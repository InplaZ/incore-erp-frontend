import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificacionesApi } from "./notificaciones.api";

export const notificacionesQueryKeys = {
  all: ["notificaciones"] as const,
  list: () => [...notificacionesQueryKeys.all, "list"] as const,
  unreadCount: () => [...notificacionesQueryKeys.all, "no-leidas-count"] as const,
};

export function useNotificaciones() {
  return useQuery({
    queryKey: notificacionesQueryKeys.list(),
    queryFn: notificacionesApi.list,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useNotificacionesNoLeidasCount() {
  return useQuery({
    queryKey: notificacionesQueryKeys.unreadCount(),
    queryFn: notificacionesApi.countUnread,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

function useRefreshNotifications() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: notificacionesQueryKeys.all });
  };
}

export function useMarcarNotificacionLeida() {
  const refresh = useRefreshNotifications();
  return useMutation({ mutationFn: notificacionesApi.markRead, onSuccess: refresh });
}

export function useMarcarTodasNotificacionesLeidas() {
  const refresh = useRefreshNotifications();
  return useMutation({ mutationFn: notificacionesApi.markAllRead, onSuccess: refresh });
}
