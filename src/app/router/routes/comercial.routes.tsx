import { lazy } from "react";
import type { AppRoute } from "../route.types";

const ComercialLayout = lazy(
    () => import("@/features/comercial/components/ComercialLayout")
);

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

const ProduccionPage = lazy(
    () => import("@/features/comercial/pages/ProduccionPage")
);

const DetalleCliente = lazy(
    () => import("@/features/comercial/pages/DetalleClientePage")
);

const RequerimientoDetallePage = lazy(
    () => import("@/features/comercial/pages/RequerimientoDetallePage")
)

export const comercialRoutes: AppRoute[] = [
    {
        path: "/comercial",
        element: <ComercialLayout />,
        children: [
            {
                index: true,
                element: <ComercialPage />
            },
            {
                path: "clientes",
                element: <ClientesPage />
            },
            {
                path: "requerimientoListPage",
                element: <RequerimientoListPage />
            },
            {
                path: "produccion",
                element: <ProduccionPage />
            },
            {
                path: "clientes/:id",
                element: <DetalleCliente />,
            },
            {
                path: "requerimientos/",
                element: <RequerimientosPage/>
            },
            {
                path: "requerimientos/:id",
                element: <RequerimientoDetallePage/>
            }

        ]
    }
];