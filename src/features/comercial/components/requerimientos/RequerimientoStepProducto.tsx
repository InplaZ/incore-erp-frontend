//ESTE ARCHIVO DEFINE SI ES BOBINA O BOLSA//

import { Package, Plus } from "lucide-react";

export type ProductType = "bag" | "roll" | "other" | null;

interface RequerimientoStepProductoProps {
  product: ProductType;
  setProduct: (product: ProductType) => void;
  onNext?: () => void;
}

export default function RequerimientoStepProducto({
  product,
  setProduct,
  onNext,
}: RequerimientoStepProductoProps) {
  const opciones = [
    {
      value: "bag" as const,
      label: "Bolsas",
      icon: Package,
    },
    {
      value: "roll" as const,
      label: "Bobinas",
      icon: Package,
    },
    {
      value: "other" as const,
      label: "Otro producto",
      icon: Plus,
    },
  ];

  const seleccionarProducto = (tipo: ProductType) => {
    setProduct(tipo);

    if (tipo !== "other" && onNext) {
      onNext();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {opciones.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => seleccionarProducto(value)}
          aria-pressed={product === value}
          className={[
            "inline-flex items-center gap-2 rounded-lg border px-3 py-2",
            "text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-primary",
            product === value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-foreground hover:bg-secondary",
          ].join(" ")}
        >
          <Icon className="h-4 w-4" />
          {label}
          {product === value && (
            <span className="text-xs">✓</span>
          )}
        </button>
      ))}
    </div>
  );
}
