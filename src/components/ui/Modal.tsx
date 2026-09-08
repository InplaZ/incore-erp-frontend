import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

type ModalSize = "sm" | "md" | "lg" | "xl";

interface ModalContextValue {
  titleId: string;
  descriptionId: string;
  hasTitle: boolean;
  hasDescription: boolean;
  registerTitle: () => void;
  unregisterTitle: () => void;
  registerDescription: () => void;
  unregisterDescription: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalContext() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("Modal subcomponents must be used inside a Modal.");
  }

  return context;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  closeLabel?: string;
}

interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {}

interface ModalTitleProps extends Omit<
  HTMLAttributes<HTMLHeadingElement>,
  "id"
> {}

interface ModalDescriptionProps extends Omit<
  HTMLAttributes<HTMLParagraphElement>,
  "id"
> {}

interface ModalContentProps extends HTMLAttributes<HTMLDivElement> {}

interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const focusableSelector = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function Modal({
  open,
  onClose,
  children,
  className = "",
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  closeLabel = "Cerrar",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const titleId = useId();
  const descriptionId = useId();

  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);

  const registerTitle = useCallback(() => {
    setHasTitle(true);
  }, []);

  const unregisterTitle = useCallback(() => {
    setHasTitle(false);
  }, []);

  const registerDescription = useCallback(() => {
    setHasDescription(true);
  }, []);

  const unregisterDescription = useCallback(() => {
    setHasDescription(false);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    previousActiveElement.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const focusFirstElement = () => {
      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      const focusableElements =
        dialog.querySelectorAll<HTMLElement>(focusableSelector);

      const firstElement = focusableElements[0];

      if (firstElement) {
        firstElement.focus();
      } else {
        dialog.focus();
      }
    };

    const frameId = requestAnimationFrame(focusFirstElement);

    return () => {
      cancelAnimationFrame(frameId);

      document.body.style.overflow = originalOverflow;

      previousActiveElement.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!closeOnEscape) {
          return;
        }

        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      const focusableElements =
        dialog.querySelectorAll<HTMLElement>(focusableSelector);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closeOnEscape, onClose]);

  if (!open) {
    return null;
  }

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };

  const dialogClasses = [
    "relative z-10 w-full",
    sizeClasses[size],
    "max-h-[calc(100vh-2rem)]",
    "overflow-y-auto",
    "rounded-xl border border-border",
    "bg-card text-card-foreground shadow-xl",
    "outline-none",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ModalContext.Provider
      value={{
        titleId,
        descriptionId,
        hasTitle,
        hasDescription,
        registerTitle,
        unregisterTitle,
        registerDescription,
        unregisterDescription,
      }}
    >
      <div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
        role="presentation"
        onMouseDown={handleBackdropMouseDown}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={hasTitle ? titleId : undefined}
          aria-describedby={hasDescription ? descriptionId : undefined}
          tabIndex={-1}
          className={dialogClasses}
        >
          {children}

          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className={[
              "absolute right-4 top-4",
              "rounded-md p-1",
              "text-muted-foreground",
              "transition-colors",
              "hover:bg-secondary hover:text-foreground",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-primary",
            ].join(" ")}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
    </ModalContext.Provider>
  );
}

function ModalHeader({ className = "", ...props }: ModalHeaderProps) {
  const classes = ["flex flex-col gap-1.5", "p-6 pb-0", className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}

function ModalTitle({ className = "", ...props }: ModalTitleProps) {
  const { titleId, registerTitle, unregisterTitle } = useModalContext();

  useEffect(() => {
    registerTitle();

    return () => {
      unregisterTitle();
    };
  }, [registerTitle, unregisterTitle]);

  const classes = ["pr-8 text-lg font-semibold leading-none", className]
    .filter(Boolean)
    .join(" ");

  return <h2 {...props} id={titleId} className={classes} />;
}

function ModalDescription({ className = "", ...props }: ModalDescriptionProps) {
  const { descriptionId, registerDescription, unregisterDescription } =
    useModalContext();

  useEffect(() => {
    registerDescription();

    return () => {
      unregisterDescription();
    };
  }, [registerDescription, unregisterDescription]);

  const classes = ["pr-8 text-sm text-muted-foreground", className]
    .filter(Boolean)
    .join(" ");

  return <p {...props} id={descriptionId} className={classes} />;
}

function ModalContent({ className = "", ...props }: ModalContentProps) {
  const classes = ["p-6", className].filter(Boolean).join(" ");

  return <div className={classes} {...props} />;
}

function ModalFooter({ className = "", ...props }: ModalFooterProps) {
  const classes = ["flex items-center justify-end gap-2", "p-6 pt-0", className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}

export {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
};

export default Modal;
