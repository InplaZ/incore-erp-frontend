import { NavLink } from "react-router-dom";

import type { SidebarItemRenderContext } from "./Sidebar";

import type { NavigationItem } from "../../app/config/navigation";

interface SidebarNavigationLinkProps {
  item: NavigationItem;

  context: SidebarItemRenderContext;
}

export function SidebarNavigationLink({
  item,
  context,
}: SidebarNavigationLinkProps) {
  return (
    <NavLink
      to={item.href}
      title={context.collapsed ? item.tooltip : undefined}
      aria-disabled={item.disabled}
      onClick={(event) => {
        if (item.disabled) {
          event.preventDefault();
          return;
        }

        context.closeMobileMenu();
      }}
      className={({ isActive }) =>
        [
          "flex items-center gap-3",
          "rounded-md px-3 py-2.5",
          "text-sm font-medium",
          "transition-colors",

          context.collapsed && "justify-center px-2",

          item.disabled && "cursor-not-allowed opacity-50",

          isActive && !item.disabled
            ? "bg-primary text-primary-foreground"
            : [
                "text-muted-foreground",
                "hover:bg-secondary",
                "hover:text-foreground",
              ].join(" "),
        ]
          .filter(Boolean)
          .join(" ")
      }
    >
      {item.icon && (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
          {item.icon}
        </span>
      )}

      {!context.collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

export default SidebarNavigationLink;
