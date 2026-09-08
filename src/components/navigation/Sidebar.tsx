import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";

export interface SidebarItem {
  /**
   * Identificador único del elemento.
   */
  id: string;

  /**
   * Contenido visible.
   */
  label: ReactNode;

  /**
   * Icono opcional.
   */
  icon?: ReactNode;

  /**
   * Contenido adicional.
   */
  badge?: ReactNode;

  /**
   * Tooltip cuando el Sidebar está contraído.
   */
  tooltip?: string;

  /**
   * Estado deshabilitado.
   */
  disabled?: boolean;

  /**
   * Estado activo.
   *
   * El componente no depende de ningún router.
   */
  active?: boolean;

  /**
   * Acción al seleccionar el elemento.
   */
  onSelect?: () => void;
}

export interface SidebarItemRenderContext {
  collapsed: boolean;
  mobileOpen: boolean;

  closeMobileMenu: () => void;

  selectItem: () => void;
}

export interface SidebarProps<
  TItem extends SidebarItem = SidebarItem,
> extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /**
   * Elementos de navegación.
   */
  items?: TItem[];

  /**
   * Header personalizado.
   *
   * Permite reproducir logo + título o cualquier
   * otra composición visual.
   */
  header?: ReactNode;

  /**
   * Footer personalizado.
   */
  footer?: ReactNode;

  /**
   * Render personalizado de cada item.
   *
   * Ideal para integrar React Router, Next.js,
   * TanStack Router, etc.
   */
  renderItem?: (item: TItem, context: SidebarItemRenderContext) => ReactNode;

  /**
   * Estado controlado de contraído.
   */
  collapsed?: boolean;

  /**
   * Estado inicial no controlado.
   */
  defaultCollapsed?: boolean;

  /**
   * Callback al cambiar collapsed.
   */
  onCollapsedChange?: (collapsed: boolean) => void;

  /**
   * Estado controlado del menú móvil.
   */
  mobileOpen?: boolean;

  /**
   * Estado inicial móvil.
   */
  defaultMobileOpen?: boolean;

  /**
   * Callback al cambiar mobileOpen.
   */
  onMobileOpenChange?: (open: boolean) => void;

  /**
   * Mostrar trigger móvil propio.
   */
  showMobileTrigger?: boolean;

  /**
   * Mostrar botón de collapse.
   */
  showCollapseButton?: boolean;

  /**
   * Icono trigger móvil.
   */
  mobileTriggerIcon?: ReactNode;

  /**
   * Icono cerrar móvil.
   */
  mobileCloseIcon?: ReactNode;

  /**
   * Icono collapse.
   */
  collapseIcon?: ReactNode;

  /**
   * Icono expand.
   */
  expandIcon?: ReactNode;

  /**
   * Etiquetas accesibles.
   */
  ariaLabel?: string;
  mobileOpenLabel?: string;
  mobileCloseLabel?: string;
  collapseLabel?: string;
  expandLabel?: string;
}

export function Sidebar<TItem extends SidebarItem = SidebarItem>({
  items = [],
  header,
  footer,
  renderItem,

  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,

  mobileOpen: mobileOpenProp,
  defaultMobileOpen = false,
  onMobileOpenChange,

  showMobileTrigger = false,
  showCollapseButton = true,

  mobileTriggerIcon = "☰",
  mobileCloseIcon = "×",
  collapseIcon = "‹",
  expandIcon = "›",

  ariaLabel = "Navegación principal",
  mobileOpenLabel = "Abrir menú",
  mobileCloseLabel = "Cerrar menú",
  collapseLabel = "Contraer menú",
  expandLabel = "Expandir menú",

  className = "",
  ...props
}: SidebarProps<TItem>) {
  /*
   * Estado interno.
   */
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);

  const [internalMobileOpen, setInternalMobileOpen] =
    useState(defaultMobileOpen);

  /*
   * Referencias.
   */
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);

  const mobileMenuId = useId();

  /*
   * Controlled / uncontrolled.
   */
  const collapsed =
    collapsedProp !== undefined ? collapsedProp : internalCollapsed;

  const mobileOpen =
    mobileOpenProp !== undefined ? mobileOpenProp : internalMobileOpen;

  /*
   * Actualizar collapsed.
   */
  const setCollapsed = useCallback(
    (nextValue: boolean) => {
      if (collapsedProp === undefined) {
        setInternalCollapsed(nextValue);
      }

      onCollapsedChange?.(nextValue);
    },
    [collapsedProp, onCollapsedChange],
  );

  /*
   * Actualizar menú móvil.
   */
  const setMobileOpen = useCallback(
    (nextValue: boolean) => {
      if (mobileOpenProp === undefined) {
        setInternalMobileOpen(nextValue);
      }

      onMobileOpenChange?.(nextValue);
    },
    [mobileOpenProp, onMobileOpenChange],
  );

  /*
   * Cerrar móvil.
   */
  const closeMobileMenu = useCallback(
    (restoreFocus = false) => {
      setMobileOpen(false);

      if (restoreFocus) {
        requestAnimationFrame(() => {
          mobileTriggerRef.current?.focus();
        });
      }
    },
    [setMobileOpen],
  );

  /*
   * Seleccionar item.
   */
  const handleItemSelect = useCallback(
    (item: TItem) => {
      if (item.disabled) {
        return;
      }

      item.onSelect?.();

      closeMobileMenu();
    },
    [closeMobileMenu],
  );

  /*
   * Escape cierra menú móvil.
   */
  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen, closeMobileMenu]);

  /*
   * Renderer visual por defecto.
   *
   * Replica conceptualmente el Sidebar antiguo.
   */
  const renderDefaultItem = (item: TItem) => {
    const itemClasses = [
      "flex w-full items-center gap-3",
      "rounded-md px-3 py-2.5",
      "text-sm font-medium",
      "transition-colors",

      collapsed && "justify-center px-2",

      item.disabled && "cursor-not-allowed opacity-50",

      item.active && !item.disabled
        ? "bg-primary text-primary-foreground"
        : [
            "text-muted-foreground",
            "hover:bg-secondary",
            "hover:text-foreground",
          ].join(" "),

      "focus-visible:outline-none",
      "focus-visible:ring-2",
      "focus-visible:ring-ring",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        key={item.id}
        type="button"
        disabled={item.disabled}
        aria-current={item.active ? "page" : undefined}
        title={
          collapsed
            ? (item.tooltip ??
              (typeof item.label === "string" ? item.label : undefined))
            : undefined
        }
        className={itemClasses}
        onClick={() => handleItemSelect(item)}
      >
        {item.icon ? (
          <span
            aria-hidden="true"
            className="flex h-5 w-5 shrink-0 items-center justify-center"
          >
            {item.icon}
          </span>
        ) : null}

        {!collapsed ? (
          <span className="min-w-0 flex-1 truncate text-left">
            {item.label}
          </span>
        ) : (
          <span className="sr-only">{item.label}</span>
        )}

        {!collapsed && item.badge ? (
          <span className="shrink-0">{item.badge}</span>
        ) : null}
      </button>
    );
  };

  /*
   * Clases principales.
   *
   * Importante:
   * Recuperamos md:sticky como el Sidebar original.
   */
  const sidebarClasses = [
    "fixed inset-y-0 left-0 z-50",
    "flex min-h-screen shrink-0 flex-col",
    "border-r border-border bg-card",
    "transition-all duration-200",

    "md:sticky md:top-0 md:z-0",

    collapsed ? "w-16" : "w-64",

    mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",

    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* Trigger móvil */}
      {showMobileTrigger ? (
        <button
          ref={mobileTriggerRef}
          type="button"
          aria-label={mobileOpenLabel}
          aria-expanded={mobileOpen}
          aria-controls={mobileMenuId}
          onClick={() => setMobileOpen(true)}
          className={[
            "fixed left-4 top-4 z-40",
            "rounded-md border bg-card p-2",
            "text-foreground shadow-sm",
            "md:hidden",

            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-ring",
          ].join(" ")}
        >
          <span aria-hidden="true">{mobileTriggerIcon}</span>
        </button>
      ) : null}

      {/* Overlay móvil */}
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => closeMobileMenu(true)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      ) : null}

      {/* Sidebar */}
      <aside
        id={mobileMenuId}
        aria-label={ariaLabel}
        className={sidebarClasses}
        {...props}
      >
        {/* Header */}
        {header ? (
          <div
            className={[
              "flex h-16 shrink-0 items-center border-b",

              collapsed ? "justify-center px-2" : "justify-between px-4",
            ].join(" ")}
          >
            {header}

            {/* Close móvil */}
            <button
              type="button"
              aria-label={mobileCloseLabel}
              onClick={() => closeMobileMenu(true)}
              className={[
                "rounded-md p-2",
                "text-muted-foreground",
                "transition-colors",
                "hover:bg-secondary",
                "hover:text-foreground",
                "md:hidden",
              ].join(" ")}
            >
              <span aria-hidden="true">{mobileCloseIcon}</span>
            </button>
          </div>
        ) : null}

        {/* Navegación */}
        <nav aria-label={ariaLabel} className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-1">
            {items.map((item) => {
              if (renderItem) {
                return (
                  <Fragment key={item.id}>
                    {renderItem(item, {
                      collapsed,
                      mobileOpen,

                      closeMobileMenu: () => closeMobileMenu(),

                      selectItem: () => handleItemSelect(item),
                    })}
                  </Fragment>
                );
              }

              return renderDefaultItem(item);
            })}
          </div>
        </nav>

        {/* Footer */}
        {footer ? <div className="border-t p-3">{footer}</div> : null}

        {/* Collapse */}
        {showCollapseButton ? (
          <div className="hidden border-t p-3 md:block">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? expandLabel : collapseLabel}
              className={[
                "flex w-full items-center gap-3",
                "rounded-md px-3 py-2.5",
                "text-sm font-medium",
                "text-muted-foreground",
                "transition-colors",

                "hover:bg-secondary",
                "hover:text-foreground",

                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-ring",

                collapsed && "justify-center px-2",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span
                aria-hidden="true"
                className={[
                  "flex h-5 w-5 shrink-0",
                  "items-center justify-center",
                  "transition-transform duration-200",
                ].join(" ")}
              >
                {collapsed ? expandIcon : collapseIcon}
              </span>

              {!collapsed && <span>{collapseLabel}</span>}
            </button>
          </div>
        ) : null}
      </aside>
    </>
  );
}

export default Sidebar;
