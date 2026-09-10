import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  FileText,
  Package,
  Truck,
  UserRound,
} from "lucide-react";

type RequirementStep = 1 | 2 | 3 | 4 | 5;
type ProductType = "bag" | "roll" | null;

const steps = [
  { number: 1, label: "Cliente" },
  { number: 2, label: "Producto" },
  { number: 3, label: "Detalles" },
  { number: 4, label: "Entrega" },
  { number: 5, label: "Confirmación" },
];

export default function RequerimientosPage() {
  const [step, setStep] = useState<RequirementStep>(1);
  const [product, setProduct] = useState<ProductType>(null);

  const [client, setClient] = useState("");
  const [quantity, setQuantity] = useState("");
  const [observations, setObservations] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const nextStep = () => {
    setStep((current) => Math.min(current + 1, 5) as RequirementStep);
  };

  const previousStep = () => {
    setStep((current) => Math.max(current - 1, 1) as RequirementStep);
  };

  const resetWizard = () => {
    setStep(1);
    setProduct(null);
    setClient("");
    setQuantity("");
    setObservations("");
    setDeliveryDate("");
    setDeliveryAddress("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Nuevo requerimiento
              </h2>

              <p className="text-sm text-muted-foreground">
                Registra y gestiona un nuevo requerimiento comercial.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          {steps.map((item, index) => {
            const completed = step > item.number;
            const active = step === item.number;

            return (
              <div key={item.number} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      "text-sm font-semibold transition-colors",
                      completed || active
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    ].join(" ")}
                  >
                    {completed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      item.number
                    )}
                  </div>

                  <span
                    className={[
                      "mt-2 hidden text-xs font-medium sm:block",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={[
                      "mx-2 h-px flex-1",
                      step > item.number
                        ? "bg-primary"
                        : "bg-border",
                    ].join(" ")}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-5">
          <h3 className="text-lg font-semibold">
            {step === 1 && "Seleccionar cliente"}
            {step === 2 && "Seleccionar producto"}
            {step === 3 && "Detalles del requerimiento"}
            {step === 4 && "Información de entrega"}
            {step === 5 && "Confirmar requerimiento"}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {step === 1 &&
              "Selecciona el cliente para el nuevo requerimiento."}
            {step === 2 &&
              "Indica qué producto necesita el cliente."}
            {step === 3 &&
              "Completa las cantidades y observaciones del pedido."}
            {step === 4 &&
              "Define cuándo y dónde debe realizarse la entrega."}
            {step === 5 &&
              "Revisa la información antes de registrar el requerimiento."}
          </p>
        </div>

        <div className="p-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="mx-auto max-w-2xl space-y-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary">
                <UserRound className="h-9 w-9 text-muted-foreground" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Cliente
                </label>

                <select
                  value={client}
                  onChange={(event) => setClient(event.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Seleccionar cliente...</option>
                  <option value="Industrias Andinas">
                    Industrias Andinas
                  </option>
                  <option value="Comercial Norte">
                    Comercial Norte
                  </option>
                  <option value="Distribuidora Central">
                    Distribuidora Central
                  </option>
                  <option value="Alimentos del Sur">
                    Alimentos del Sur
                  </option>
                </select>
              </div>

              <div className="rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">
                El cliente seleccionado será asociado al requerimiento y
                podrá consultarse posteriormente desde su ficha comercial.
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setProduct("bag")}
                className={[
                  "rounded-xl border p-6 text-left transition-all",
                  product === "bag"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40 hover:bg-secondary/40",
                ].join(" ")}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>

                <h4 className="font-semibold">Bolsas</h4>

                <p className="mt-1 text-sm text-muted-foreground">
                  Requerimiento de producción de bolsas.
                </p>

                {product === "bag" && (
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                    <Check className="h-4 w-4" />
                    Seleccionado
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setProduct("roll")}
                className={[
                  "rounded-xl border p-6 text-left transition-all",
                  product === "roll"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40 hover:bg-secondary/40",
                ].join(" ")}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>

                <h4 className="font-semibold">Rollos</h4>

                <p className="mt-1 text-sm text-muted-foreground">
                  Requerimiento de producción de rollos.
                </p>

                {product === "roll" && (
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                    <Check className="h-4 w-4" />
                    Seleccionado
                  </div>
                )}
              </button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="mx-auto max-w-2xl space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Cantidad
                </label>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="Ej. 5000"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Observaciones
                </label>

                <textarea
                  value={observations}
                  onChange={(event) => setObservations(event.target.value)}
                  placeholder="Especificaciones adicionales del requerimiento..."
                  rows={5}
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="mx-auto max-w-2xl space-y-5">
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
                <Truck className="h-5 w-5 text-muted-foreground" />

                <p className="text-sm text-muted-foreground">
                  Define los datos necesarios para coordinar la entrega.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Fecha de entrega
                </label>

                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(event) => setDeliveryDate(event.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Dirección de entrega
                </label>

                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(event) =>
                    setDeliveryAddress(event.target.value)
                  }
                  placeholder="Dirección..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="mx-auto max-w-2xl space-y-4">
              <div className="rounded-xl border border-border bg-secondary/30 p-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Cliente
                    </p>
                    <p className="mt-1 font-medium">
                      {client || "No seleccionado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Producto
                    </p>
                    <p className="mt-1 font-medium">
                      {product === "bag"
                        ? "Bolsas"
                        : product === "roll"
                          ? "Rollos"
                          : "No seleccionado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Cantidad
                    </p>
                    <p className="mt-1 font-medium">
                      {quantity || "No especificada"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Fecha de entrega
                    </p>
                    <p className="mt-1 font-medium">
                      {deliveryDate || "No especificada"}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Dirección
                    </p>
                    <p className="mt-1 font-medium">
                      {deliveryAddress || "No especificada"}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Observaciones
                    </p>
                    <p className="mt-1 text-sm">
                      {observations || "Sin observaciones"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
                Al confirmar, el requerimiento quedará registrado para su
                posterior seguimiento y gestión de producción.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={step === 1 ? resetWizard : previousStep}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 1 ? "Cancelar" : "Anterior"}
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                console.log("Requerimiento listo para registrar:", {
                  client,
                  product,
                  quantity,
                  observations,
                  deliveryDate,
                  deliveryAddress,
                });
              }}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Check className="h-4 w-4" />
              Registrar requerimiento
            </button>
          )}
        </div>
      </div>
    </div>
  );
}