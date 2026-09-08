const HomePage = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container py-12">
        <div className="max-w-2xl space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              React + Vite + Tailwind CSS v4
            </p>

            <h1 className="text-4xl font-bold tracking-tight">
              Frontend Template React
            </h1>

            <p className="text-lg text-muted-foreground">
              Plantilla base de React preparada para construir aplicaciones
              reutilizables y escalables.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Sistema de estilos</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Esta tarjeta comprueba que Tailwind, los tokens semánticos y la
              utility container están funcionando correctamente.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Primary
              </button>

              <button className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
                Secondary
              </button>

              <button className="rounded-md bg-success px-4 py-2 text-sm font-medium text-success-foreground">
                Success
              </button>

              <button className="rounded-md bg-warning px-4 py-2 text-sm font-medium text-warning-foreground">
                Warning
              </button>

              <button className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground">
                Destructive
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
