////////////////////////////////////////////
// Pantalla principal, indicadores y istado
////////////////////////////////////////////
import { useMemo, useState } from "react";
import {
  Cog,
  Plus,
  Search,
  Pencil,
  Eye,
  Wrench,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import {
  useMaquinarias,
  useEquipos,
  useAreasProduccion,
  useDeleteMaquinaria,
} from "../maquinaria.hooks";

import type {
  MaquinariaDetalle,
} from "../maquinaria.types";

import MaquinariaFormModal from "../components/MaquinariaFormModal";
import Toast from "@/components/ui/Toast";

type ToastState = {
  open: boolean;
  title: string;
  description?: string;
  type: "success" | "error";
};

type FiltroEstado = "todos" | "operativo" | "mantenimiento" | "fuera_servicio";

export default function MaquinariaPage() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [filtroArea, setFiltroArea] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [seleccionada, setSeleccionada] =
    useState<MaquinariaDetalle | null>(null);
  const [pendienteEliminar, setPendienteEliminar] =
    useState<MaquinariaDetalle | null>(null);
  const [toast, setToast] = useState<ToastState>({
    open: false,
    title: "",
    type: "success",
  });

  //Permite ejecutar la eliminación
  const deleteMaquinaria = useDeleteMaquinaria();

  const {
    data: maquinarias = [],
    isLoading: loadingMaquinarias,
    isError: errorMaquinarias,
    error,
    refetch,
  } = useMaquinarias();

  const {
    data: equipos = [],
    isLoading: loadingEquipos,
  } = useEquipos();

  const {
    data: areas = [],
    isLoading: loadingAreas,
  } = useAreasProduccion();

  const cargando = loadingMaquinarias || loadingEquipos || loadingAreas;

  // Combinar información de los tres recursos.
  const registros = useMemo<MaquinariaDetalle[]>(() => {
    return maquinarias.flatMap((maquinaria) => {
      const equipo = equipos.find(
        (equipo) => equipo.id === maquinaria.equipo
      );

      const area = areas.find(
        (area) => area.id === maquinaria.area_produccion
      );

      if (!equipo) return [];

      return [{
        ...maquinaria,
        equipo_detalle: equipo,
        area_detalle: area,
      }];
    });
  }, [maquinarias, equipos, areas]);

  // Búsqueda y filtros.
  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return registros.filter(item => {
      const e = item.equipo_detalle;

      const coincideBusqueda =
        !termino ||
        e.codigo.toLowerCase().includes(termino) ||
        e.nombre.toLowerCase().includes(termino) ||
        e.marca.toLowerCase().includes(termino) ||
        e.modelo.toLowerCase().includes(termino);

      const coincideEstado =
        filtroEstado === "todos" ||
        e.estado === filtroEstado;

      const coincideArea =
        !filtroArea ||
        String(item.area_produccion) === filtroArea;

      return coincideBusqueda && coincideEstado && coincideArea;
    });
  }, [registros, busqueda, filtroEstado, filtroArea]);

  // Indicadores.
  const resumen = useMemo(() => ({
    total: registros.length,
    operativas: registros.filter(
      item => item.equipo_detalle.estado === "operativo"
    ).length,
    mantenimiento: registros.filter(
      item => item.equipo_detalle.estado === "mantenimiento"
    ).length,
    fueraServicio: registros.filter(
      item => item.equipo_detalle.estado === "fuera_servicio"
    ).length,
  }), [registros]);

  const abrirCrear = () => {
    setSeleccionada(null);
    setModalOpen(true);
  };

  const abrirEditar = (item: MaquinariaDetalle) => {
    setSeleccionada(item);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setSeleccionada(null);
  };

  const notificarGuardado = () => {
    const editando = Boolean(seleccionada);

    setToast({
      open: true,
      title: editando
        ? "Maquinaria actualizada correctamente"
        : "Maquinaria registrada correctamente",
      description: editando
        ? "Los cambios se guardaron correctamente."
        : "La maquinaria se agregó al sistema.",
      type: "success",
    });

    void refetch();
  };

  // Confirmación y eliminación de maquinaria.
  const confirmarEliminacion = async () => {
    if (!pendienteEliminar) return;

    const item = pendienteEliminar;

    try {
      await deleteMaquinaria.mutateAsync(item.id);
      setPendienteEliminar(null);
      setToast({
        open: true,
        title: "Maquinaria eliminada correctamente",
        description: `Se eliminó ${item.equipo_detalle.nombre}.`,
        type: "success",
      });
    } catch (error) {
      setPendienteEliminar(null);
      setToast({
        open: true,
        title: "No se pudo eliminar la maquinaria",
        description:
          error instanceof Error
            ? error.message
            : "Verifica si tiene registros relacionados e inténtalo nuevamente.",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">

      {/* ENCABEZADO */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Cog className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recursos
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold text-foreground">
            MAQUINAS
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona los equipos y maquinaria de producción.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirCrear}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nueva maquinaria
        </button>
      </div>

      {/* RESUMEN */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total maquinaria"
          value={resumen.total}
          icon={<Cog className="h-4 w-4" />}
        />

        <SummaryCard
          label="Operativas"
          value={resumen.operativas}
          icon={<Cog className="h-4 w-4" />}
          color="emerald"
        />

        <SummaryCard
          label="En mantenimiento"
          value={resumen.mantenimiento}
          icon={<Wrench className="h-4 w-4" />}
          color="amber"
        />

        <SummaryCard
          label="Fuera de servicio"
          value={resumen.fueraServicio}
          icon={<Wrench className="h-4 w-4" />}
          color="rose"
        />
      </div>

      {/* FILTROS */}
      <section className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">

        <Field label="Estado">
          <select
            className={filterClass}
            value={filtroEstado}
            onChange={e =>
              setFiltroEstado(e.target.value as FiltroEstado)
            }
          >
            <option value="todos">Todos los estados</option>
            <option value="operativo">Operativo</option>
            <option value="mantenimiento">En mantenimiento</option>
            <option value="fuera_servicio">Fuera de servicio</option>
          </select>
        </Field>

        <Field label="Área de producción">
          <select
            className={filterClass}
            value={filtroArea}
            onChange={e => setFiltroArea(e.target.value)}
          >
            <option value="">Todas las áreas</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>
                {area.nombre}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setFiltroEstado("todos");
              setFiltroArea("");
              setBusqueda("");
            }}
            className="h-10 rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      {/* TABLA */}
      <section className="overflow-hidden rounded-lg border border-border bg-card">

        {/* BÚSQUEDA */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex h-10 w-full max-w-md items-center gap-2 rounded-md border border-border px-3">
            <Search className="h-4 w-4 text-muted-foreground" />

            <input
              type="search"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar código, máquina o marca..."
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* CARGANDO */}
        {cargando && (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            Cargando maquinaria...
          </div>
        )}

        {/* ERROR */}
        {errorMaquinarias && (
          <div className="px-5 py-10 text-center text-sm text-destructive">
            No se pudo cargar la maquinaria.

            {error instanceof Error && (
              <span className="mt-1 block">{error.message}</span>
            )}

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 block mx-auto text-primary hover:underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* CONTENIDO */}
        {!cargando && !errorMaquinarias && (
          <div className="overflow-x-auto">
            <div className="min-w-[1050px]">

              <TableHeader />

              {filtradas.map(item => (
                <MaquinariaRow
                  key={item.id}
                  item={item}
                  onEdit={() => abrirEditar(item)}
                  onView={() => abrirEditar(item)}
                  onDelete={() => setPendienteEliminar(item)}
                  deleting={deleteMaquinaria.isPending}
                />
              ))}

              {filtradas.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No se encontraron maquinarias.
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOOTER */}
        {!cargando && !errorMaquinarias && (
          <div className="border-t border-border px-5 py-3">
            <span className="text-xs text-muted-foreground">
              Mostrando {filtradas.length} de {registros.length} maquinarias
            </span>
          </div>
        )}
      </section>

      {/* MODAL */}
      <MaquinariaFormModal
        open={modalOpen}
        onClose={cerrarModal}
        onSuccess={notificarGuardado}
        maquinaria={seleccionada}
      />

      {/* CONFIRMACIÓN DE ELIMINACIÓN */}
      {pendienteEliminar && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirmar-eliminacion-titulo"
            aria-describedby="confirmar-eliminacion-descripcion"
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2
                  id="confirmar-eliminacion-titulo"
                  className="text-lg font-bold text-foreground"
                >
                  ¿Eliminar maquinaria?
                </h2>
                <p
                  id="confirmar-eliminacion-descripcion"
                  className="mt-2 text-sm leading-6 text-muted-foreground"
                >
                  ¿Estás seguro de eliminar la maquinaria{" "}
                  <strong className="text-foreground">
                    {pendienteEliminar.equipo_detalle.nombre}
                  </strong>
                  ? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendienteEliminar(null)}
                disabled={deleteMaquinaria.isPending}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminacion}
                disabled={deleteMaquinaria.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {deleteMaquinaria.isPending ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </section>
        </div>
      )}

      <Toast
        open={toast.open}
        title={toast.title}
        description={toast.description}
        type={toast.type}
        onClose={() => setToast((actual) => ({ ...actual, open: false }))}
      />
    </div>
  );
}

// ============================================================
// TABLA
// ============================================================

function TableHeader() {
  const columns =
    "grid-cols-[110px_minmax(170px,1.5fr)_120px_120px_minmax(140px,1fr)_140px_110px]";

  return (
    <div className={`grid ${columns} items-center gap-4 border-b border-border bg-secondary/30 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground`}>
      <span>Código</span>
      <span>Maquinaria</span>
      <span>Marca</span>
      <span>Modelo</span>
      <span>Área</span>
      <span>Estado</span>
      <span>Acciones</span>
    </div>
  );
}

function MaquinariaRow({
  item,
  onEdit,
  onView,
  onDelete,
  deleting,
}: {
  item: MaquinariaDetalle;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const equipo = item.equipo_detalle;

  return (
    <div className="grid grid-cols-[110px_minmax(170px,1.5fr)_120px_120px_minmax(140px,1fr)_140px_110px] items-center gap-4 border-b border-border px-5 py-4 transition-colors hover:bg-secondary/40">

      <span className="text-sm font-semibold text-primary">
        {equipo.codigo}
      </span>

      <div className="min-w-0">
        <span className="block truncate text-sm font-semibold text-foreground">
          {equipo.nombre}
        </span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {equipo.ubicacion || "Sin ubicación"}
        </span>
      </div>

      <span className="text-sm text-foreground">
        {equipo.marca || "—"}
      </span>

      <span className="text-sm text-foreground">
        {equipo.modelo || "—"}
      </span>

      <span className="text-sm text-foreground">
        {item.area_detalle?.nombre || "—"}
      </span>

      <EstadoBadge estado={equipo.estado} />

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onView}
          title="Ver detalle"
          className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-primary"
        >
          <Eye className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onEdit}
          title="Editar maquinaria"
          className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-primary"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onDelete}
          title="Eliminar maquinaria"
          disabled={deleting}
          className="rounded-md p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// ESTADO
// ============================================================

function EstadoBadge({ estado }: { estado: string }) {
  const styles: Record<string, string> = {
    operativo: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    mantenimiento: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    fuera_servicio: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  };

  const labels: Record<string, string> = {
    operativo: "Operativo",
    mantenimiento: "Mantenimiento",
    fuera_servicio: "Fuera de servicio",
  };

  return (
    <span className={`inline-flex w-fit rounded-full px-2.5 py-1.5 text-xs font-semibold ${styles[estado] ?? "bg-secondary text-secondary-foreground"}`}>
      {labels[estado] ?? estado}
    </span>
  );
}

// ============================================================
// RESUMEN
// ============================================================

function SummaryCard({
  label,
  value,
  icon,
  color = "blue",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: "blue" | "emerald" | "amber" | "rose";
}) {
  const colors = {
    blue: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    rose: "bg-rose-500/10 text-rose-600",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          {label}
        </p>

        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>

      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

const filterClass =
  "h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {

  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
