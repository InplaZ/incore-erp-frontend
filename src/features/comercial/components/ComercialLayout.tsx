import { NavLink, Outlet } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  Truck,
  UsersRound,
} from "lucide-react";

const comercialNavigation = [
  {
    label: "Agenda comercial",
    href: "/comercial",
    icon: CalendarDays,
    end: true,
  },
  {
    label: "Clientes",
    href: "/comercial/clientes",
    icon: UsersRound,
  },
  {
    label: "Requerimientos",
    href: "/comercial/requerimientos",
    icon: ClipboardList,
  },
  {
    label: "Producción y envíos",
    href: "/comercial/produccion",
    icon: Truck,
  },
];

export default function ComercialLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Comercial
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Gestión comercial de clientes, requerimientos, producción y envíos.
        </p>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-border">
        {comercialNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                [
                  "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3",
                  "text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                ].join(" ")
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}