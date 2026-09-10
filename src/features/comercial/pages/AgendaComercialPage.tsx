import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  MoreHorizontal,
  Package,
  Phone,
  Sparkles,
  Truck,
  UserRound,
  UsersRound,
} from "lucide-react";

const activities = [
  {
    time: "09:00",
    title: "Llamada de seguimiento",
    client: "Empaques del Norte",
    type: "Llamada",
    icon: Phone,
  },
  {
    time: "10:30",
    title: "Confirmar medidas de producción",
    client: "Plásticos Andinos",
    type: "Seguimiento",
    icon: CalendarDays,
  },
  {
    time: "12:00",
    title: "Enviar cotización",
    client: "Manufacturas del Pacífico",
    type: "Cotización",
    icon: ClipboardList,
  },
  {
    time: "15:00",
    title: "Reunión comercial",
    client: "Industrias Carvajal",
    type: "Reunión",
    icon: UsersRound,
  },
];

export default function AgendaComercialPage() {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            LUNES, 31 DE AGOSTO DE 2026
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-foreground">
            Buenos días
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Tienes <strong>8 actividades</strong> para hoy. Aquí está el
            resumen de tu operación comercial.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <ClipboardList className="h-4 w-4" />
          Nuevo requerimiento
        </button>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={CalendarDays}
          label="Actividades hoy"
          value="8"
          detail="3 pendientes"
        />

        <MetricCard
          icon={Phone}
          label="Llamadas pendientes"
          value="5"
          detail="2 vencidas"
          negative
        />

        <MetricCard
          icon={UsersRound}
          label="Clientes por contactar"
          value="12"
          detail="+4 esta semana"
        />

        <MetricCard
          icon={Package}
          label="En producción"
          value="7"
          detail="2 listos para envío"
        />
      </div>

      {/* Agenda + acciones rápidas */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Agenda */}
        <section className="rounded-lg border border-border bg-card">
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div>
              <h2 className="font-semibold text-foreground">
                Agenda de hoy
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                31 de agosto · Tu actividad comercial
              </p>
            </div>

            <button className="hidden items-center gap-1 text-sm font-medium text-primary sm:flex">
              Ver calendario
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-border px-5">
            <button className="border-b-2 border-primary py-3 text-sm font-medium text-primary">
              Hoy <span className="ml-1">8</span>
            </button>

            <button className="py-3 text-sm text-muted-foreground hover:text-foreground">
              Próximos
            </button>

            <button className="py-3 text-sm text-muted-foreground hover:text-foreground">
              Completadas
            </button>
          </div>

          {/* Actividades */}
          <div className="divide-y divide-border">
            {activities.map((activity) => {
              const Icon = activity.icon;

              return (
                <div
                  key={activity.time}
                  className="flex items-center gap-3 px-5 py-4"
                >
                  <div className="w-12 shrink-0 text-xs font-medium text-muted-foreground">
                    {activity.time}
                  </div>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {activity.title}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {activity.client}
                    </p>
                  </div>

                  <span className="hidden rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground md:block">
                    {activity.type}
                  </span>

                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <button className="flex w-full items-center justify-center gap-2 border-t border-border px-5 py-3 text-sm font-medium text-primary hover:bg-secondary">
            Ver todas las actividades
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>

        {/* Acciones rápidas */}
        <section className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="font-semibold text-foreground">
                Acciones rápidas
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Lo que necesitas, a un clic
              </p>
            </div>

            <Sparkles className="h-5 w-5 text-primary" />
          </div>

          <div className="grid grid-cols-2 gap-3 p-5">
            <QuickAction
              icon={ClipboardList}
              label="Nuevo requerimiento"
            />

            <QuickAction
              icon={UserRound}
              label="Registrar nuevo cliente"
            />

            <QuickAction
              icon={Phone}
              label="Programar actividad"
            />

            <QuickAction
              icon={Truck}
              label="Revisar envíos"
            />
          </div>

          <div className="mx-5 mb-5 flex gap-3 rounded-lg bg-primary/5 p-4">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Tip comercial</strong>
              <br />
              Los seguimientos de esta semana tienen un 24% más de respuesta.
            </p>
          </div>
        </section>
      </div>

      {/* Parte inferior */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Clientes por contactar */}
        <section className="rounded-lg border border-border bg-card">
          <div className="flex items-start justify-between p-5">
            <div>
              <h2 className="font-semibold text-foreground">
                Clientes por contactar
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Oportunidades que requieren tu atención
              </p>
            </div>

            <button className="hidden items-center gap-1 text-sm font-medium text-primary sm:flex">
              Ver clientes
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="divide-y divide-border border-t border-border">
            <ContactRow
              initials="PA"
              name="Plásticos Andinos"
              note="Sin contacto hace 12 días"
              priority="Alta"
            />

            <ContactRow
              initials="MP"
              name="Manufacturas del Pacífico"
              note="Cotización por confirmar"
              priority="Media"
            />

            <ContactRow
              initials="IC"
              name="Industrias Carvajal"
              note="Nuevo prospecto"
              priority="Baja"
            />
          </div>
        </section>

        {/* Requerimientos */}
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-foreground">
                Requerimientos activos
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Estado de tus solicitudes
              </p>
            </div>

            <button className="flex items-center gap-1 text-sm font-medium text-primary">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <span className="text-4xl font-semibold text-foreground">
                12
              </span>

              <span className="ml-2 text-sm text-muted-foreground">
                totales
              </span>
            </div>

            <div className="flex h-24 w-24 items-center justify-center rounded-full border-8 border-primary/20">
              <span className="text-lg font-semibold text-foreground">
                58%
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <StatusRow label="En revisión" value="3" />
            <StatusRow label="En producción" value="7" />
            <StatusRow label="Listos" value="2" />
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  negative = false,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  detail: string;
  negative?: boolean;
}) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <span className="block text-xs text-muted-foreground">
          {label}
        </span>

        <strong className="mt-1 block text-2xl font-semibold text-foreground">
          {value}
        </strong>

        <small
          className={
            negative
              ? "text-xs text-destructive"
              : "text-xs text-muted-foreground"
          }
        >
          {detail}
        </small>
      </div>

      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
}: {
  icon: typeof ClipboardList;
  label: string;
}) {
  return (
    <button className="group flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-secondary">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>

      <span className="flex-1 text-xs font-medium text-foreground">
        {label}
      </span>

      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </button>
  );
}

function ContactRow({
  initials,
  name,
  note,
  priority,
}: {
  initials: string;
  name: string;
  note: string;
  priority: string;
}) {
  return (
    <button className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-secondary">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {name}
        </p>

        <p className="truncate text-xs text-muted-foreground">{note}</p>
      </div>

      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
        {priority}
      </span>

      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <strong className="text-foreground">{value}</strong>
    </div>
  );
}