import { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { Outlet } from "react-router-dom";

import { Header } from "../../components/navigation/Header";

import { Sidebar, type SidebarItem } from "../../components/navigation/Sidebar";

import { SidebarNavigationLink } from "../../components/navigation/SidebarNavigationLink";

import { navigationItems } from "../../app/config/navigation";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  /*
   * Convertimos NavigationItem a la interfaz
   * mínima que entiende Sidebar.
   */
  const sidebarItems: SidebarItem[] = navigationItems.map((item) => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
    disabled: item.disabled,
  }));

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        items={sidebarItems}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
        showMobileTrigger={false}
        mobileCloseIcon={<X className="h-5 w-5" />}
        collapseIcon={<ChevronLeft className="h-5 w-5" />}
        expandIcon={<ChevronLeft className="h-5 w-5 rotate-180" />}
        header={<SidebarBrand />}
        renderItem={(sidebarItem, context) => {
          const navigationItem = navigationItems.find(
            (item) => item.id === sidebarItem.id,
          );

          if (!navigationItem) {
            return null;
          }

          return (
            <SidebarNavigationLink item={navigationItem} context={context} />
          );
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title="Frontend Template"
          search
          searchPlaceholder="Buscar..."
          showMenuButton
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="min-w-0 flex-1 overflow-x-hidden bg-background p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/**
 * Branding del Sidebar.
 *
 * Esto está fuera del Sidebar porque el Sidebar
 * no debe saber qué es un logo o una aplicación.
 */
function SidebarBrand() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
        F
      </div>

      <span className="truncate font-semibold text-foreground">
        Frontend Template
      </span>
    </div>
  );
}

export default AppLayout;
