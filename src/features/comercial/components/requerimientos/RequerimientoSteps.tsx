import { Check } from "lucide-react";

type RequirementStep = 1 | 2 | 3 | 4 | 5;

interface RequerimientoStepsProps {
  step: RequirementStep;
}

const steps = [
  { number: 1, label: "Cliente" },
  { number: 2, label: "Producto" },
  { number: 3, label: "Detalles" },
  { number: 4, label: "Entrega" },
  { number: 5, label: "Confirmación" },
];

export default function RequirementSteps({
  step,
}: RequerimientoStepsProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        {steps.map((item, index) => {
          const active = step === item.number;
          const completed = step > item.number;

          return (
            <div
              key={item.number}
              className="flex flex-1 items-center"
            >
              <div className="flex items-center gap-3">
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium",
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
                    "hidden text-sm font-medium sm:block",
                    active || completed
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
                    "mx-4 h-px flex-1",
                    completed ? "bg-primary" : "bg-border",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}