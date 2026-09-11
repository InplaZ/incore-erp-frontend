import { ArrowRight, Package, Plus } from "lucide-react";

export type ProductType = "bag" | "roll" | "other" | null;

interface RequerimientoStepProductoProps {
  product: ProductType;
  setProduct: (product: ProductType) => void;
}

export default function RequerimientoStepProducto({
  product,
  setProduct,
}: RequerimientoStepProductoProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold">
          ¿Qué producto necesitas fabricar?
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Selecciona una opción para personalizar tu requerimiento.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Bolsas */}
        <button
          type="button"
          onClick={() => setProduct("bag")}
          className={[
            "group relative rounded-xl border p-4 text-left transition-all",
            product === "bag"
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "border-border hover:border-primary/50 hover:bg-secondary/40",
          ].join(" ")}
        >
          <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-secondary/60">
            <Package
              className={[
                "h-14 w-14 transition-colors",
                product === "bag"
                  ? "text-primary"
                  : "text-muted-foreground",
              ].join(" ")}
            />
          </div>

          <h4 className="font-semibold">
            Bolsas
          </h4>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Conoce las opciones de bolsas plásticas.
          </p>

          <div
            className={[
              "absolute right-4 top-4 h-5 w-5 rounded-full border",
              product === "bag"
                ? "border-primary bg-primary"
                : "border-border",
            ].join(" ")}
          >
            {product === "bag" && (
              <div className="m-1.5 h-2 w-2 rounded-full bg-primary-foreground" />
            )}
          </div>
        </button>

        {/* Bobinas */}
        <button
          type="button"
          onClick={() => setProduct("roll")}
          className={[
            "group relative rounded-xl border p-4 text-left transition-all",
            product === "roll"
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "border-border hover:border-primary/50 hover:bg-secondary/40",
          ].join(" ")}
        >
          <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-secondary/60">
            <Package
              className={[
                "h-14 w-14 transition-colors",
                product === "roll"
                  ? "text-primary"
                  : "text-muted-foreground",
              ].join(" ")}
            />
          </div>

          <h4 className="font-semibold">
            Bobinas
          </h4>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Material en rollo para tus procesos.
          </p>

          <div
            className={[
              "absolute right-4 top-4 h-5 w-5 rounded-full border",
              product === "roll"
                ? "border-primary bg-primary"
                : "border-border",
            ].join(" ")}
          >
            {product === "roll" && (
              <div className="m-1.5 h-2 w-2 rounded-full bg-primary-foreground" />
            )}
          </div>
        </button>

        {/* Otro */}
        <button
          type="button"
          onClick={() => setProduct("other")}
          className={[
            "group rounded-xl border p-4 text-left transition-all",
            product === "other"
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "border-border hover:border-primary/50 hover:bg-secondary/40",
          ].join(" ")}
        >
          <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-secondary/60">
            <Plus className="h-10 w-10 text-muted-foreground" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">
                Otro producto
              </h4>

              <p className="mt-1 text-xs text-muted-foreground">
                Cuéntanos qué necesitas.
              </p>
            </div>

            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </button>
      </div>

      <div className="mx-auto max-w-md rounded-lg border border-border bg-secondary/30 px-4 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          ✨ ¿No sabes cuál elegir?{" "}
          <span className="font-medium text-primary">
            Te ayudamos a identificarlo.
          </span>
        </p>
      </div>
    </div>
  );
}