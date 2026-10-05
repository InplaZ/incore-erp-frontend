export default function ViabilidadAnalizando() {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center">

      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground/20 border-t-primary" />
      </div>

      <h2 className="text-xl font-semibold text-foreground">
        Analizando viabilidad...
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Evaluando las variables de producción
      </p>

      <div className="mt-8 w-full max-w-md space-y-4">

        <div className="flex items-center gap-3">
          <span className="text-primary">✓</span>
          <span className="text-sm">
            Validando especificación
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-primary">✓</span>
          <span className="text-sm">
            Determinando ruta de producción
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="h-4 w-4 animate-pulse rounded-full border-2 border-primary" />
          <span className="text-sm text-muted-foreground">
            Evaluando procesos
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
          <span className="text-sm text-muted-foreground">
            Evaluando máquinas
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
          <span className="text-sm text-muted-foreground">
            Consolidando resultado
          </span>
        </div>

      </div>
    </div>
  );
}