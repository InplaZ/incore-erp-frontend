import { useEffect, useRef, useState, type ReactNode } from "react";

import {
  Bell,
  Check,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";

import { useTheme } from "../../hooks/useTheme";

export interface HeaderUser {
  name: string;
  email?: string;
  role?: string;
  initials?: string;
}

export interface HeaderNotification {
  id: string;
  title: string;
  message?: string;
  read?: boolean;
  createdAt?: string;
}

export interface HeaderUserAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

export interface HeaderProps {
  title?: string;
  subtitle?: string;

  showMenuButton?: boolean;
  onMenuClick?: () => void;

  search?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;

  user?: HeaderUser;
  userActions?: HeaderUserAction[];
  onLogout?: () => void;

  notifications?: HeaderNotification[];
  onNotificationClick?: (notification: HeaderNotification) => void;
  onMarkAllRead?: () => void;

  actions?: ReactNode;

  showThemeToggle?: boolean;
}

export function Header({
  title,
  subtitle,

  showMenuButton = true,
  onMenuClick,

  search = false,
  searchPlaceholder = "Buscar...",
  onSearch,

  user,
  userActions = [],
  onLogout,

  notifications = [],
  onNotificationClick,
  onMarkAllRead,

  actions,

  showThemeToggle = true,
}: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  /**
   * --------------------------------------------------------------------------
   * Atajos de teclado
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();

        if (!search) {
          return;
        }

        setSearchOpen(true);

        setTimeout(() => {
          searchRef.current?.focus();
        }, 0);
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setUserOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [search]);

  /**
   * --------------------------------------------------------------------------
   * Usuario
   * --------------------------------------------------------------------------
   */

  const initials =
    user?.initials ||
    user?.name
      ?.split(" ")
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    "?";

  /**
   * --------------------------------------------------------------------------
   * Búsqueda
   * --------------------------------------------------------------------------
   */

  const handleSearchSubmit = () => {
    onSearch?.(searchValue);
  };

  /**
   * --------------------------------------------------------------------------
   * Tema
   * --------------------------------------------------------------------------
   *
   * La UI debe utilizar resolvedTheme porque theme también puede ser
   * "system". resolvedTheme siempre representa el tema visual efectivo.
   */

  const handleThemeToggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  /**
   * --------------------------------------------------------------------------
   * Notificaciones
   * --------------------------------------------------------------------------
   */

  const handleNotificationClick = (notification: HeaderNotification) => {
    onNotificationClick?.(notification);

    setNotificationsOpen(false);
  };

  /**
   * --------------------------------------------------------------------------
   * Menús
   * --------------------------------------------------------------------------
   */

  const closeMenus = () => {
    setNotificationsOpen(false);
    setUserOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6">
        {showMenuButton && (
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {(title || subtitle) && (
          <div className="hidden min-w-0 sm:block">
            {title && (
              <h1 className="truncate text-sm font-semibold text-foreground">
                {title}
              </h1>
            )}

            {subtitle && (
              <p className="truncate text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {search && (
          <div className="hidden flex-1 md:block md:max-w-md">
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);

                setTimeout(() => {
                  searchRef.current?.focus();
                }, 0);
              }}
              className="flex w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary"
            >
              <Search className="h-4 w-4 shrink-0" />

              <span className="truncate">{searchPlaceholder}</span>

              <kbd className="ml-auto hidden rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground lg:inline-block">
                Ctrl K
              </kbd>
            </button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {search && (
            <button
              type="button"
              aria-label="Buscar"
              onClick={() => {
                setSearchOpen(true);

                setTimeout(() => {
                  searchRef.current?.focus();
                }, 0);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
            >
              <Search className="h-5 w-5" />
            </button>
          )}

          {actions}

          {showThemeToggle && (
            <button
              type="button"
              aria-label={
                resolvedTheme === "dark"
                  ? "Cambiar a modo claro"
                  : "Cambiar a modo oscuro"
              }
              onClick={handleThemeToggle}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          )}

          {(notifications.length > 0 || onMarkAllRead) && (
            <div className="relative">
              <button
                type="button"
                aria-label="Notificaciones"
                aria-expanded={notificationsOpen}
                onClick={() => {
                  setNotificationsOpen((current) => !current);
                  setUserOpen(false);
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Bell className="h-5 w-5" />

                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-card">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                  <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                    <span className="text-sm font-semibold text-foreground">
                      Notificaciones
                    </span>

                    {unreadCount > 0 && onMarkAllRead && (
                      <button
                        type="button"
                        onClick={onMarkAllRead}
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Check className="h-3 w-3" />
                        Marcar todas
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                        No tienes notificaciones
                      </p>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => handleNotificationClick(notification)}
                          className={[
                            "flex w-full gap-3 border-b border-border px-3 py-3 text-left transition-colors hover:bg-secondary",
                            !notification.read && "bg-primary/5",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <span
                            className={[
                              "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                              notification.read ? "bg-muted" : "bg-primary",
                            ].join(" ")}
                          />

                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-foreground">
                              {notification.title}
                            </span>

                            {notification.message && (
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {notification.message}
                              </span>
                            )}

                            {notification.createdAt && (
                              <span className="mt-1 block text-[10px] text-muted-foreground">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                            )}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {user && (
            <div className="relative">
              <button
                type="button"
                aria-label="Menú de usuario"
                aria-expanded={userOpen}
                onClick={() => {
                  setUserOpen((current) => !current);
                  setNotificationsOpen(false);
                }}
                className="flex h-9 items-center gap-2 rounded-md px-1.5 pr-2 transition-colors hover:bg-secondary"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {initials}
                </span>

                <span className="hidden max-w-32 text-left leading-tight lg:block">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {user.name}
                  </span>

                  {user.role && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {user.role}
                    </span>
                  )}
                </span>

                <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" />
              </button>

              {userOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-lg border border-border bg-card p-1.5 shadow-lg">
                  <div className="mb-1 border-b border-border px-3 py-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.name}
                    </p>

                    {user.email && (
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>

                  {userActions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => {
                        action.onClick();
                        closeMenus();
                      }}
                      className={[
                        "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
                        action.danger ? "text-destructive" : "text-foreground",
                      ].join(" ")}
                    >
                      {action.icon}

                      <span>{action.label}</span>
                    </button>
                  ))}

                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        closeMenus();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-secondary"
                    >
                      <LogOut className="h-4 w-4" />

                      <span>Cerrar sesión</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Modal búsqueda */}
      {searchOpen && search && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20"
          onClick={() => setSearchOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div
            className="relative w-full max-w-xl overflow-hidden rounded-lg border border-border bg-card shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />

              <input
                ref={searchRef}
                type="search"
                value={searchValue}
                onChange={(event) => {
                  setSearchValue(event.target.value);
                  onSearch?.(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearchSubmit();
                  }
                }}
                placeholder={searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />

              <button
                type="button"
                aria-label="Cerrar búsqueda"
                onClick={() => setSearchOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Buscar
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Escribe lo que deseas encontrar en el sistema.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return "Ahora";
  }

  if (minutes < 60) {
    return `Hace ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `Hace ${hours}h`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `Hace ${days}d`;
  }

  return date.toLocaleDateString();
}

export default Header;
