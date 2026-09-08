import type { HTMLAttributes, ReactNode } from "react";

interface PaginationProps extends HTMLAttributes<HTMLElement> {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  firstLabel?: string;
  lastLabel?: string;
  ariaLabel?: string;
}

interface PaginationButtonProps {
  page: number;
  currentPage: number;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  ariaLabel?: string;
}

function PaginationButton({
  page,
  currentPage,
  onClick,
  disabled = false,
  children,
  ariaLabel,
}: PaginationButtonProps) {
  const isActive = page === currentPage;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={isActive ? "page" : undefined}
      className={[
        "inline-flex h-9 min-w-9 items-center justify-center rounded-md",
        "border px-3 text-sm font-medium",
        "transition-colors",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-primary",
        "disabled:pointer-events-none",
        "disabled:opacity-50",
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-secondary",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function createPageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): Array<number | "ellipsis"> {
  const totalVisiblePages = siblingCount * 2 + 5;

  if (totalPages <= totalVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);

  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSibling > 2;

  const showRightEllipsis = rightSibling < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + siblingCount * 2;

    return [
      ...Array.from({ length: leftItemCount }, (_, index) => index + 1),
      "ellipsis",
      totalPages,
    ];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + siblingCount * 2;

    const start = totalPages - rightItemCount + 1;

    return [
      1,
      "ellipsis",
      ...Array.from({ length: rightItemCount }, (_, index) => start + index),
    ];
  }

  return [
    1,
    "ellipsis",
    ...Array.from(
      {
        length: rightSibling - leftSibling + 1,
      },
      (_, index) => leftSibling + index,
    ),
    "ellipsis",
    totalPages,
  ];
}

function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  previousLabel = "Anterior",
  nextLabel = "Siguiente",
  firstLabel = "Primera página",
  lastLabel = "Última página",
  ariaLabel = "Paginación",
  className = "",
  ...props
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);

  const currentPage = Math.min(Math.max(page, 1), safeTotalPages);

  const safeSiblingCount = Math.max(0, siblingCount);

  const pages = createPageRange(currentPage, safeTotalPages, safeSiblingCount);

  const canGoPrevious = currentPage > 1;

  const canGoNext = currentPage < safeTotalPages;

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > safeTotalPages || nextPage === currentPage) {
      return;
    }

    onPageChange(nextPage);
  };

  const classes = ["flex w-full items-center justify-between gap-4", className]
    .filter(Boolean)
    .join(" ");

  return (
    <nav aria-label={ariaLabel} className={classes} {...props}>
      <div className="flex items-center gap-2">
        {showFirstLast && (
          <PaginationButton
            page={1}
            currentPage={currentPage}
            disabled={!canGoPrevious}
            onClick={() => handlePageChange(1)}
            ariaLabel={firstLabel}
          >
            «
          </PaginationButton>
        )}

        <PaginationButton
          page={currentPage - 1}
          currentPage={currentPage}
          disabled={!canGoPrevious}
          onClick={() => handlePageChange(currentPage - 1)}
          ariaLabel={previousLabel}
        >
          ‹
        </PaginationButton>
      </div>

      <div className="flex items-center gap-1">
        {pages.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className={[
                  "flex h-9 min-w-9",
                  "items-center justify-center",
                  "px-2 text-sm",
                  "text-muted-foreground",
                ].join(" ")}
              >
                …
              </span>
            );
          }

          return (
            <PaginationButton
              key={item}
              page={item}
              currentPage={currentPage}
              onClick={() => handlePageChange(item)}
              ariaLabel={`Página ${item}`}
            >
              {item}
            </PaginationButton>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <PaginationButton
          page={currentPage + 1}
          currentPage={currentPage}
          disabled={!canGoNext}
          onClick={() => handlePageChange(currentPage + 1)}
          ariaLabel={nextLabel}
        >
          ›
        </PaginationButton>

        {showFirstLast && (
          <PaginationButton
            page={safeTotalPages}
            currentPage={currentPage}
            disabled={!canGoNext}
            onClick={() => handlePageChange(safeTotalPages)}
            ariaLabel={lastLabel}
          >
            »
          </PaginationButton>
        )}
      </div>
    </nav>
  );
}

export default Pagination;
