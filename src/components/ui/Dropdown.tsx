import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

interface DropdownContextValue {
  open: boolean;
  toggle: (trigger?: HTMLElement) => void;
  close: (restoreFocus?: boolean) => void;
  setTriggerElement: (element: HTMLElement | null) => void;
  registerItem: (element: HTMLButtonElement | null) => (() => void) | undefined;
  focusItem: (direction: "next" | "previous" | "first" | "last") => void;
  menuId: string;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const context = useContext(DropdownContext);

  if (!context) {
    throw new Error("Dropdown components must be used inside a Dropdown.");
  }

  return context;
}

interface DropdownProps {
  children: ReactNode;
  className?: string;
}

interface DropdownTriggerProps {
  children: ReactElement;
  asChild?: boolean;
}

interface DropdownContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: "left" | "right";
}

interface DropdownItemProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  destructive?: boolean;
  className?: string;
}

interface DropdownSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

function Dropdown({ children, className = "" }: DropdownProps) {
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const itemElementsRef = useRef<HTMLButtonElement[]>([]);

  const menuId = useId();

  const setTriggerElement = useCallback((element: HTMLElement | null) => {
    triggerElementRef.current = element;
  }, []);

  const registerItem = useCallback((element: HTMLButtonElement | null) => {
    if (!element) {
      return undefined;
    }

    if (!itemElementsRef.current.includes(element)) {
      itemElementsRef.current.push(element);
    }

    return () => {
      itemElementsRef.current = itemElementsRef.current.filter(
        (item) => item !== element,
      );
    };
  }, []);

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);

    if (restoreFocus) {
      requestAnimationFrame(() => {
        triggerElementRef.current?.focus();
      });
    }
  }, []);

  const toggle = useCallback(
    (trigger?: HTMLElement) => {
      if (trigger) {
        setTriggerElement(trigger);
      }

      setOpen((current) => !current);
    },
    [setTriggerElement],
  );

  const focusItem = useCallback(
    (direction: "next" | "previous" | "first" | "last") => {
      const items = itemElementsRef.current.filter(
        (item) => !item.disabled && item.isConnected,
      );

      if (items.length === 0) {
        return;
      }

      const activeElement = document.activeElement;
      const currentIndex = items.findIndex((item) => item === activeElement);

      let nextIndex = 0;

      if (direction === "first") {
        nextIndex = 0;
      } else if (direction === "last") {
        nextIndex = items.length - 1;
      } else if (direction === "next") {
        nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % items.length;
      } else {
        nextIndex =
          currentIndex === -1
            ? items.length - 1
            : (currentIndex - 1 + items.length) % items.length;
      }

      items[nextIndex]?.focus();
    },
    [],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        close(false);
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  const classes = ["relative inline-block", className]
    .filter(Boolean)
    .join(" ");

  return (
    <DropdownContext.Provider
      value={{
        open,
        toggle,
        close,
        setTriggerElement,
        registerItem,
        focusItem,
        menuId,
      }}
    >
      <div ref={containerRef} className={classes}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

function DropdownTrigger({ children, asChild = false }: DropdownTriggerProps) {
  const { open, toggle, setTriggerElement, focusItem, menuId } =
    useDropdownContext();

  if (!isValidElement(children)) {
    throw new Error("DropdownTrigger requires a valid React element.");
  }

  const child = Children.only(children);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (
      event.key === "ArrowDown" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      if (!open) {
        toggle(event.currentTarget);

        requestAnimationFrame(() => {
          focusItem("first");
        });
      }

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!open) {
        toggle(event.currentTarget);

        requestAnimationFrame(() => {
          focusItem("last");
        });
      }
    }
  };

  if (!asChild) {
    return (
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(event) => {
          toggle(event.currentTarget);
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        {child}
      </button>
    );
  }

  const childProps = child.props as {
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    childProps.onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    setTriggerElement(event.currentTarget);
    toggle(event.currentTarget);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    childProps.onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    handleTriggerKeyDown(event);
  };

  return cloneElement(child as ReactElement<Record<string, unknown>>, {
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? menuId : undefined,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
  });
}

function DropdownContent({
  align = "right",
  className = "",
  onKeyDown,
  ...props
}: DropdownContentProps) {
  const { open, menuId, close, focusItem } = useDropdownContext();

  if (!open) {
    return null;
  }

  const classes = [
    "absolute z-40 mt-2 min-w-48",
    "rounded-lg border border-border",
    "bg-card p-1 text-card-foreground",
    "shadow-lg",
    align === "right" ? "right-0" : "left-0",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem("next");
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem("previous");
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusItem("first");
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusItem("last");
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
    }
  };

  return (
    <div
      id={menuId}
      role="menu"
      className={classes}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}

function DropdownItem({
  children,
  onClick,
  destructive = false,
  disabled = false,
  className = "",
  ref,
  ...props
}: DropdownItemProps & {
  ref?: Ref<HTMLButtonElement>;
}) {
  const { close, registerItem } = useDropdownContext();

  const internalRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    return registerItem(internalRef.current);
  }, [registerItem]);

  const classes = [
    "flex w-full items-center gap-2.5",
    "rounded-md px-3 py-2",
    "text-left text-sm",
    "transition-colors",
    "hover:bg-secondary",
    "focus-visible:outline-none",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
    destructive ? "text-destructive" : "text-foreground",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    if (!event.defaultPrevented) {
      close(true);
    }
  };

  return (
    <button
      ref={(element) => {
        internalRef.current = element;

        if (typeof ref === "function") {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
      }}
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}

function DropdownSeparator({
  className = "",
  ...props
}: DropdownSeparatorProps) {
  const classes = ["my-1 h-px bg-border", className].filter(Boolean).join(" ");

  return <div role="separator" className={classes} {...props} />;
}

export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
};

export default Dropdown;
