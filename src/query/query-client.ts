import { QueryClient } from "@tanstack/react-query";

/**
 * ===========================================================================
 * QUERY CLIENT
 * ===========================================================================
 *
 * Cliente global de TanStack Query.
 *
 * Esta configuración define el comportamiento general del
 * server state de la aplicación.
 *
 * Las reglas específicas de cada recurso deben configurarse
 * en sus respectivas queries/mutations, no aquí.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * Los datos se consideran frescos durante 1 minuto.
       *
       * Durante este período React Query no necesita volver a
       * solicitar automáticamente los datos por considerarlos
       * obsoletos.
       */
      staleTime: 60_000,

      /**
       * Conserva en caché los datos que ya no tienen observers
       * durante 5 minutos.
       */
      gcTime: 5 * 60_000,

      /**
       * Reintenta una petición fallida hasta 2 veces.
       *
       * No hacemos reintentos infinitos para evitar generar
       * tráfico innecesario contra el backend.
       */
      retry: 2,

      /**
       * React Query puede volver a consultar datos obsoletos
       * cuando la ventana recupera el foco.
       */
      refetchOnWindowFocus: true,

      /**
       * React Query puede volver a consultar datos obsoletos
       * cuando se recupera la conexión.
       */
      refetchOnReconnect: true,
    },

    mutations: {
      /**
       * Las mutaciones no se reintentan automáticamente.
       *
       * Repetir automáticamente operaciones como crear,
       * actualizar, eliminar o ejecutar acciones puede provocar
       * efectos duplicados dependiendo del backend.
       */
      retry: 0,
    },
  },
});
