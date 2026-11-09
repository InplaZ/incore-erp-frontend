
///////////////////////////////////////////////////////
// Cordina los tres pasos en un solo modal
///////////////////////////////////////////////////////

import { useEffect, useRef, useState } from "react";
import { Cog, X, ChevronLeft, ChevronRight } from "lucide-react";

import {
  useCapacidadesExtrusion,
  useCapacidadesFlexografia,
  useCapacidadesConfeccion,
  useCapacidadesRefilado,

  useUpdateCapacidadExtrusion,
  useUpdateCapacidadFlexografia,
  useUpdateCapacidadConfeccion,
  useUpdateCapacidadRefilado,

  useDeleteCapacidadExtrusion,
  useDeleteCapacidadFlexografia,
  useDeleteCapacidadConfeccion,
  useDeleteCapacidadRefilado,

  useCreateEquipo,
  useCreateMaquinaria,
  useUpdateEquipo,
  useUpdateMaquinaria,
  useCreateCapacidadExtrusion,
  useCreateCapacidadFlexografia,
  useCreateCapacidadConfeccion,
  useCreateCapacidadRefilado,
  useAreasProduccion,
} from "../maquinaria.hooks";

import type {
  EquipoCreate,
  MaquinariaCreate,
  MaquinariaDetalle,
} from "../maquinaria.types";

import WizardProgress from "./wizard/WizardProgress";
import PasoEquipo from "./wizard/PasoEquipo";
import PasoMaquinaria from "./wizard/PasoMaquinaria";
import PasoCapacidad, {
  type CapacidadesFormulario,
} from "./wizard/PasoCapacidad";

const initialEquipo: EquipoCreate = {
  codigo: "",
  nombre: "",
  tipo_equipo: "maquinaria",
  marca: "",
  modelo: "",
  estado: "operativo",
  ubicacion: "",
};

const initialProduccion: Omit<MaquinariaCreate, "equipo"> = {
  area_produccion: 0,
  descripcion: "",
  observacion: "",
};

const initialCapacidades: CapacidadesFormulario = {
  extrusion: [],
  flexografia: null,
  confeccion: null,
  refilado: null,
};

interface RegistroParcial {
  equipoId: number;
  maquinariaId: number | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  maquinaria?: MaquinariaDetalle | null;
}

const normalizar = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export default function MaquinariaFormModal({
  open,
  onClose,
  onSuccess,
  maquinaria = null,
}: Props) {
  // Mutaciones de equipo y maquinaria
  const createEquipo = useCreateEquipo();
  const createMaquinaria = useCreateMaquinaria();
  const updateEquipo = useUpdateEquipo();
  const updateMaquinaria = useUpdateMaquinaria();

  //Estados de consulta
  const {
    data: capacidadesExtrusion = [],
    isLoading: loadingExtrusion,
  } = useCapacidadesExtrusion();

  const {
    data: capacidadesFlexografia = [],
    isLoading: loadingFlexografia,
  } = useCapacidadesFlexografia();

  const {
    data: capacidadesConfeccion = [],
    isLoading: loadingConfeccion,
  } = useCapacidadesConfeccion();

  const {
    data: capacidadesRefilado = [],
    isLoading: loadingRefilado,
  } = useCapacidadesRefilado();

  const loadingCapacidades =
    loadingExtrusion ||
    loadingFlexografia ||
    loadingConfeccion ||
    loadingRefilado;

  // Mutaciones de capacidades
  const createExtrusion = useCreateCapacidadExtrusion();
  const createFlexografia = useCreateCapacidadFlexografia();
  const createConfeccion = useCreateCapacidadConfeccion();
  const createRefilado = useCreateCapacidadRefilado();

  const updateExtrusion = useUpdateCapacidadExtrusion();
  const updateFlexografia = useUpdateCapacidadFlexografia();
  const updateConfeccion = useUpdateCapacidadConfeccion();
  const updateRefilado = useUpdateCapacidadRefilado();

  const deleteExtrusion = useDeleteCapacidadExtrusion();
  const deleteFlexografia = useDeleteCapacidadFlexografia();
  const deleteConfeccion = useDeleteCapacidadConfeccion();
  const deleteRefilado = useDeleteCapacidadRefilado();

  const { data: areas = [], isLoading: loadingAreas } =
    useAreasProduccion();

  const [paso, setPaso] = useState(1);

  const [equipo, setEquipo] =
    useState<EquipoCreate>(initialEquipo);

  const [produccion, setProduccion] =
    useState(initialProduccion);

  const [capacidades, setCapacidades] =
    useState<CapacidadesFormulario>(initialCapacidades);

  const [capacidadIds, setCapacidadIds] = useState({
    extrusion: {} as Record<string, number>,
    flexografia: null as number | null,
    confeccion: null as number | null,
    refilado: null as number | null,
  });

  const capacidadesCargadasRef = useRef<number | null>(null);

  const [error, setError] = useState("");

  // Permite reintentar sin duplicar equipo ni maquinaria
  // si falla el registro de una capacidad.
  const [registroParcial, setRegistroParcial] =
    useState<RegistroParcial | null>(null);

  const editando = Boolean(maquinaria);

  useEffect(() => {
    if (!open) {
      capacidadesCargadasRef.current = null;
      return;
    }

    setPaso(1);
    setError("");
    setRegistroParcial(null);
    setCapacidades(initialCapacidades);
    setCapacidadIds({
      extrusion: {},
      flexografia: null,
      confeccion: null,
      refilado: null,
    });

    if (maquinaria) {
      const e = maquinaria.equipo_detalle;

      setEquipo({
        codigo: e.codigo,
        nombre: e.nombre,
        tipo_equipo: "maquinaria",
        marca: e.marca,
        modelo: e.modelo,
        estado: e.estado,
        ubicacion: e.ubicacion,
      });

      setProduccion({
        area_produccion: maquinaria.area_produccion,
        descripcion: maquinaria.descripcion,
        observacion: maquinaria.observacion,
      });
    } else {
      setEquipo({ ...initialEquipo });
      setProduccion({ ...initialProduccion });
    }
  }, [open, maquinaria]);

  useEffect(() => {
    if (!open || !maquinaria || loadingCapacidades) return;
    if (capacidadesCargadasRef.current === maquinaria.id) return;
    const maquinariaId = maquinaria.id;

    // EXTRUSIÓN
    const extrusion = capacidadesExtrusion.filter(
      (item) => item.maquinaria === maquinariaId
    );

    setCapacidades((actual) => ({
      ...actual,

      extrusion: extrusion.map(({ id, ...datos }) => datos),
    }));

    // Conservar IDs de extrusión por material.
    setCapacidadIds((actual) => ({
      ...actual,

      extrusion: Object.fromEntries(
        extrusion.map((item) => [item.material, item.id])
      ),
    }));

    // FLEXOGRAFÍA
    const flexografia = capacidadesFlexografia.find(
      (item) => item.maquinaria === maquinariaId
    );

    if (flexografia) {
      const { id, ...datos } = flexografia;

      setCapacidades((actual) => ({
        ...actual,
        flexografia: datos,
      }));

      setCapacidadIds((actual) => ({
        ...actual,
        flexografia: id,
      }));
    }

    // CONFECCIÓN
    const confeccion = capacidadesConfeccion.find(
      (item) => item.maquinaria === maquinariaId
    );

    if (confeccion) {
      const { id, ...datos } = confeccion;

      setCapacidades((actual) => ({
        ...actual,
        confeccion: datos,
      }));

      setCapacidadIds((actual) => ({
        ...actual,
        confeccion: id,
      }));
    }

    // REFILADO
    const refilado = capacidadesRefilado.find(
      (item) => item.maquinaria === maquinariaId
    );

    if (refilado) {
      const { id, ...datos } = refilado;

      setCapacidades((actual) => ({
        ...actual,
        refilado: datos,
      }));

      setCapacidadIds((actual) => ({
        ...actual,
        refilado: id,
      }));
    }
    capacidadesCargadasRef.current = maquinariaId;
  }, [
    open,
    maquinaria,
    loadingCapacidades,
    capacidadesExtrusion,
    capacidadesFlexografia,
    capacidadesConfeccion,
    capacidadesRefilado,
  ]);

  const updateEquipoField = <K extends keyof EquipoCreate>(
    key: K,
    value: EquipoCreate[K],
  ) => {
    setEquipo((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateProduccionField = <
    K extends keyof Omit<MaquinariaCreate, "equipo">
  >(
    key: K,
    value: Omit<MaquinariaCreate, "equipo">[K],
  ) => {
    setProduccion((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const areaSeleccionada =
    areas.find((area) => area.id === produccion.area_produccion) ?? null;

  const validarPaso = () => {
    setError("");

    if (paso === 1) {
      if (!equipo.codigo.trim() || !equipo.nombre.trim()) {
        setError("El código y el nombre de la maquinaria son obligatorios.");
        return false;
      }
    }

    if (paso === 2) {
      if (!produccion.area_produccion) {
        setError("Selecciona un área de producción.");
        return false;
      }
    }

    return true;
  };

  const siguientePaso = () => {
    if (!validarPaso()) return;

    setPaso((actual) => Math.min(actual + 1, 3));
  };

  const anteriorPaso = () => {
    setError("");
    setPaso((actual) => Math.max(actual - 1, 1));
  };

  const validarCapacidad = () => {
    if (!areaSeleccionada) {
      setError("Selecciona un área de producción.");
      return false;
    }

    const nombre = normalizar(areaSeleccionada.nombre);

    if (nombre.includes("extrusion")) {
      if (capacidades.extrusion.length === 0) {
        setError("Agrega al menos una capacidad de extrusión.");
        return false;
      }
    } else if (nombre.includes("flexografia")) {
      if (!capacidades.flexografia) {
        setError("Configura la capacidad de flexografía.");
        return false;
      }
    } else if (nombre.includes("confeccion")) {
      if (!capacidades.confeccion) {
        setError("Configura la capacidad de confección.");
        return false;
      }
    } else if (nombre.includes("refilado")) {
      if (!capacidades.refilado) {
        setError("Configura la capacidad de refilado.");
        return false;
      }
    } else {
      setError("No se reconoce el área de producción seleccionada.");
      return false;
    }

    return true;
  };

  const guardarCapacidades = async (maquinariaId: number) => {
    const nombre = normalizar(areaSeleccionada?.nombre ?? "");

    if (nombre.includes("extrusion")) {
      for (const capacidad of capacidades.extrusion) {
        await createExtrusion.mutateAsync({
          ...capacidad,
          maquinaria: maquinariaId,
        });
      }
      return;
    }

    if (nombre.includes("flexografia")) {
      if (capacidades.flexografia) {
        await createFlexografia.mutateAsync({
          ...capacidades.flexografia,
          maquinaria: maquinariaId,
        });
      }
      return;
    }

    if (nombre.includes("confeccion")) {
      if (capacidades.confeccion) {
        await createConfeccion.mutateAsync({
          ...capacidades.confeccion,
          maquinaria: maquinariaId,
        });
      }
      return;
    }

    if (nombre.includes("refilado")) {
      if (capacidades.refilado) {
        await createRefilado.mutateAsync({
          ...capacidades.refilado,
          maquinaria: maquinariaId,
        });
      }
      return;
    }

    throw new Error("No se reconoce el área de producción.");
  };

  const registrar = async () => {
    setError("");

    if (!validarCapacidad()) return;

    try {
      // Recuperar IDs de un intento anterior si hubo un fallo parcial.
      let equipoId = registroParcial?.equipoId ?? null;
      let maquinariaId = registroParcial?.maquinariaId ?? null;

      // 1. Crear equipo si todavía no existe.
      if (!equipoId) {
        const nuevoEquipo = await createEquipo.mutateAsync(equipo);
        equipoId = nuevoEquipo.id;

        setRegistroParcial({
          equipoId,
          maquinariaId: null,
        });
      }

      // 2. Crear maquinaria si todavía no existe.
      if (!maquinariaId) {
        const nuevaMaquinaria = await createMaquinaria.mutateAsync({
          ...produccion,
          equipo: equipoId,
        });

        maquinariaId = nuevaMaquinaria.id;

        setRegistroParcial({
          equipoId,
          maquinariaId,
        });
      }

      // 3. Registrar capacidad técnica.
      await guardarCapacidades(maquinariaId);

      setRegistroParcial(null);
      onSuccess();
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo completar el registro de maquinaria. Verifica los datos e inténtalo nuevamente.",
      );
    }
  };

  const guardarCapacidadesEdicion = async () => {
    if (!maquinaria) return;

    const maquinariaId = maquinaria.id;
    const nombre = normalizar(areaSeleccionada?.nombre ?? "");

    // EXTRUSIÓN: actualizar, crear o eliminar por material.
    if (nombre.includes("extrusion")) {
      const materialesActuales = new Set(
        capacidades.extrusion.map((capacidad) => capacidad.material),
      );

      // Eliminar registros de materiales que el usuario quitó del formulario.
      for (const [material, id] of Object.entries(capacidadIds.extrusion)) {
        if (!materialesActuales.has(material as (typeof capacidades.extrusion)[number]["material"])) {
          await deleteExtrusion.mutateAsync(id);
        }
      }

      // Actualizar capacidades existentes o crear las nuevas.
      for (const capacidad of capacidades.extrusion) {
        const id = capacidadIds.extrusion[capacidad.material];
        const data = {
          ...capacidad,
          maquinaria: maquinariaId,
        };

        if (id) {
          await updateExtrusion.mutateAsync({ id, data });
        } else {
          await createExtrusion.mutateAsync(data);
        }
      }
      return;
    }

    // FLEXOGRAFÍA: relación uno a uno.
    if (nombre.includes("flexografia")) {
      if (capacidades.flexografia) {
        const data = {
          ...capacidades.flexografia,
          maquinaria: maquinariaId,
        };

        if (capacidadIds.flexografia) {
          await updateFlexografia.mutateAsync({
            id: capacidadIds.flexografia,
            data,
          });
        } else {
          await createFlexografia.mutateAsync(data);
        }
      } else if (capacidadIds.flexografia) {
        await deleteFlexografia.mutateAsync(capacidadIds.flexografia);
      }
      return;
    }

    // CONFECCIÓN.
    if (nombre.includes("confeccion")) {
      if (capacidades.confeccion) {
        const data = {
          ...capacidades.confeccion,
          maquinaria: maquinariaId,
        };

        if (capacidadIds.confeccion) {
          await updateConfeccion.mutateAsync({
            id: capacidadIds.confeccion,
            data,
          });
        } else {
          await createConfeccion.mutateAsync(data);
        }
      } else if (capacidadIds.confeccion) {
        await deleteConfeccion.mutateAsync(capacidadIds.confeccion);
      }
      return;
    }

    // REFILADO.
    if (nombre.includes("refilado")) {
      if (capacidades.refilado) {
        const data = {
          ...capacidades.refilado,
          maquinaria: maquinariaId,
        };

        if (capacidadIds.refilado) {
          await updateRefilado.mutateAsync({
            id: capacidadIds.refilado,
            data,
          });
        } else {
          await createRefilado.mutateAsync(data);
        }
      } else if (capacidadIds.refilado) {
        await deleteRefilado.mutateAsync(capacidadIds.refilado);
      }
      return;
    }

    throw new Error("No se reconoce el área de producción seleccionada.");
  };

  const guardarEdicion = async () => {
    setError("");

    if (!equipo.codigo.trim() || !equipo.nombre.trim()) {
      setError("El código y el nombre son obligatorios.");
      return;
    }

    if (!produccion.area_produccion) {
      setError("Selecciona un área de producción.");
      return;
    }

    if (!maquinaria) return;

    // En esta edición mantenemos el área original para no cambiar
    // el tipo de capacidad técnica asociado a la maquinaria.
    if (produccion.area_produccion !== maquinaria.area_produccion) {
      setError(
        "No se puede cambiar el área de producción durante la edición de capacidades.",
      );
      return;
    }

    if (!validarCapacidad()) return;

    try {
      await updateEquipo.mutateAsync({
        id: maquinaria.equipo,
        data: equipo,
      });

      await updateMaquinaria.mutateAsync({
        id: maquinaria.id,
        data: produccion,
      });

      await guardarCapacidadesEdicion();

      onSuccess();
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo actualizar la maquinaria y sus capacidades.",
      );
    }
  };

  const guardando =
    createEquipo.isPending ||
    createMaquinaria.isPending ||
    updateEquipo.isPending ||
    updateMaquinaria.isPending ||
    createExtrusion.isPending ||
    createFlexografia.isPending ||
    createConfeccion.isPending ||
    createRefilado.isPending ||
    updateExtrusion.isPending ||
    updateFlexografia.isPending ||
    updateConfeccion.isPending ||
    updateRefilado.isPending ||
    deleteExtrusion.isPending ||
    deleteFlexografia.isPending ||
    deleteConfeccion.isPending ||
    deleteRefilado.isPending;

  const cerrar = () => {
    if (guardando) return;

    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
      <section className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">

        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Cog className="h-5 w-5" />
            </span>

            <div>
              <h2 className="text-lg font-bold text-foreground">
                {editando ? "Editar maquinaria" : "Nueva maquinaria"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {editando
                  ? "Actualiza la información general."
                  : "Registra el equipo y configura su capacidad técnica."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={cerrar}
            disabled={guardando}
            aria-label="Cerrar"
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* CONTENIDO */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">

          {editando ? (
            <>
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-foreground">
                  Información del equipo
                </h3>

                <PasoEquipo
                  value={equipo}
                  onChange={setEquipo}
                />
                <PasoCapacidad
                  area={areaSeleccionada}
                  maquinariaId={maquinaria?.id ?? 0}
                  capacidades={capacidades}
                  onChange={setCapacidades}
                />
              </section>

              <div className="border-t border-border" />

              <section className="space-y-4">

                <PasoMaquinaria
                  value={produccion}
                  areas={areas}
                  loadingAreas={loadingAreas}
                  onChange={setProduccion}
                />
              </section>
            </>
          ) : (
            <>
              <WizardProgress pasoActual={paso} />

              {paso === 1 && (
                <PasoEquipo
                  value={equipo}
                  onChange={setEquipo}
                />
              )}

              {paso === 2 && (
                <PasoMaquinaria
                  value={produccion}
                  areas={areas}
                  loadingAreas={loadingAreas}
                  onChange={setProduccion}
                />
              )}

              {paso === 3 && (
                <PasoCapacidad
                  area={areaSeleccionada}
                  maquinariaId={0}
                  capacidades={capacidades}
                  onChange={setCapacidades}
                />
              )}
            </>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          {registroParcial && !editando && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              El equipo y la maquinaria ya fueron creados. Se conservaron sus
              identificadores para que puedas reintentar el registro de la
              capacidad sin duplicarlos.
            </p>
          )}
        </div>

        {/* FOOTER */}
        <footer className="flex flex-wrap justify-between gap-2 border-t border-border px-5 py-4 sm:px-6">

          {editando ? (
            <>
              <button
                type="button"
                onClick={cerrar}
                disabled={guardando}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={guardarEdicion}
                disabled={guardando || loadingAreas}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </>
          ) : (
            <>
              <div>
                {paso > 1 && (
                  <button
                    type="button"
                    onClick={anteriorPaso}
                    disabled={guardando}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={cerrar}
                  disabled={guardando}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary disabled:opacity-50"
                >
                  Cancelar
                </button>

                {paso < 3 ? (
                  <button
                    type="button"
                    onClick={siguientePaso}
                    disabled={loadingAreas || guardando}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    Siguiente
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={registrar}
                    disabled={guardando || loadingAreas}
                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {guardando
                      ? "Registrando..."
                      : "Registrar maquinaria"}
                  </button>
                )}
              </div>
            </>
          )}
        </footer>
      </section>
    </div>
  );
}
