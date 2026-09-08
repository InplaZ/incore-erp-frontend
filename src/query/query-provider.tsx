import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./query-client";

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * ===========================================================================
 * QUERY PROVIDER
 * ===========================================================================
 *
 * Proporciona el QueryClient global a toda la aplicación.
 *
 * La configuración del cliente vive en `query-client.ts`.
 * Este componente únicamente conecta esa instancia con React.
 */
export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
