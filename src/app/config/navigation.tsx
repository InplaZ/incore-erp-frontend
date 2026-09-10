import { Home, LayoutDashboard, PanelsTopLeft, BriefcaseBusiness } from "lucide-react";

import type { SidebarItem } from "../../components/navigation";

/**
 * Elemento de navegación específico de la aplicación.
 *
 * Extiende el contrato genérico del Sidebar con la información
 * necesaria para integrar React Router.
 */
export interface NavigationItem extends SidebarItem {
  /**
   * Ruta a la que debe navegar el elemento.
   */
  href: string;

  /**
   * Icono de Lucide utilizado por la aplicación.
   */
  icon?: React.ReactNode;
}

/**
 * Configuración de navegación de la aplicación.
 *
 * Este archivo sí puede depender de:
 *
 * - React Router
 * - Lucide
 * - permisos
 * - rutas específicas
 * - features de la aplicación
 *
 * El Sidebar genérico no conoce ninguna de estas decisiones.
 */
export const navigationItems: NavigationItem[] = [
  {
    id: "home",
    label: "Inicio",
    href: "/",
    icon: <Home className="size-5" />,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="size-5" />,
  },
  {
    id: "comercial",
    label: "Comercial",
    href: "/comercial",
    icon: <BriefcaseBusiness className="size-5" />,
  },
  {
    id: "ui-playground",
    label: "UI Playground",
    href: "/ui-playground",
    icon: <PanelsTopLeft className="size-5" />,
  },
  {
    id: "admin",
    label: "Usuario", //Como se ve en el navar
    href: "/admin", //usuarios 
    icon: <PanelsTopLeft className="size-5" />,
  },
];
