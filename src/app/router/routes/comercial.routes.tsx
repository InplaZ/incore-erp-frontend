import { lazy } from "react";
import type { AppRoute } from "../route.types";

const ComercialPage = lazy(
    () => import("@/features/comercial/pages/AgendaComercialPage")
);

const ClientesPage = lazy(
    () => import("@/features/comercial/pages/ClientesPage")
);
const RequerimientosPage = lazy(
    () => import("@/features/comercial/pages/RequerimientosPage")
);

const RequerimientoListPage = lazy(
    () => import("@/features/comercial/pages/RequerimientoListPage")
);

const PedidoPage = lazy(
    () => import("@/features/comercial/pages/PedidoPage")
);

const DetalleCliente = lazy(
    () => import("@/features/comercial/pages/DetalleClientePage")
);

const RequerimientoDetallePage = lazy(
    () => import("@/features/comercial/pages/RequerimientoDetallePage")
)

export const comercialRoutes: AppRoute[] = [
    {
        path: "agenda",
        element: <ComercialPage />
    },
    {
        path: "requerimientoListPage",
        element: <RequerimientoListPage />
    },
    {
        path: "pedido",
        element: <PedidoPage />
    },
    {
        path: "clientes/:id",
        element: <DetalleCliente />,
    },
    {
        path: "requerimientos/",
        element: <RequerimientosPage />
    },
    {
        path: "requerimientos/:id",
        element: <RequerimientoDetallePage />
    },

    {
        path: "clientes",
        element: <ClientesPage />
    },
    
];