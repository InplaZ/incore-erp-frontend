import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, type ReactNode, type FormEvent } from "react";

import {
  ArrowLeft,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShoppingCart,
  User,
  MessageCircle,
  UserPlus,
  ContactRound,
  RotateCcw,
  Star,
  Trash2,
  Save,
  X,
} from "lucide-react";

import {
  useCuentaComercial,
  useActividadesComerciales,
  useSolicitudesComerciales,
  usePedidos,
  useDeleteActividadComercial,
  useContactosComerciales,
  useCreateContactoComercial,
  useUpdateContactoComercial,
  useDesactivarContactoComercial,
} from "../comercial.hooks";

import type {
  CuentaComercial,
  ActividadComercial,
  SolicitudComercial,
  Pedido,
  ContactoComercial,
  ContactoComercialCreate,
  ContactoComercialUpdate,
} from "../comercial.types";

import FichaGeneralEditable from "@/features/comercial/components/FichaGeneralEditable";
import UbicacionesComercialesSection from "@/features/comercial/components/UbicacionesComercialesSection";
import DocumentacionCuentaSection from "@/features/comercial/components/DocumentacionCuentaSection";
import ComunicacionesModal from "@/features/comercial/components/ComunicacionModal";
type DetailTab =
  | "resumen"
  | "actividades"
  | "solicitudes"
  | "pedidos";

import NuevaActividadModal from "@/features/comercial/components/actividades/NuevaActividadModal";
import ActividadMenu from "@/features/comercial/components/actividades/ActividadMenu";
import RegistrarComunicacionModal from "@/features/comercial/components/RegistrarComunicacionModal";
import ConfirmDialog from "../../../components/feedback/ConfirmDialog";

function DetallesCliente() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  /*
   * El id viene de la URL como string.
   *
   * Ejemplo:
   * /comercial/clientes/15
   *
   * useParams() devuelve:
   * { id: "15" }
   *
   * Lo convertimos a número porque los hooks
   * esperan un identificador numérico.
   */
  const clienteId = Number(id);

  /*
   * ============================================================
   * DATOS DEL CLIENTE
   * ============================================================
   */

  const {
    data: cliente,
    isLoading,
    isError,
    error,
  } = useCuentaComercial(clienteId);

  /*
   * ============================================================
   * HISTORIAL COMERCIAL
   * ============================================================
   *
   * Los tres endpoints utilizan el filtro:
   *
   * ?cuenta_comercial={clienteId}
   *
   * Estos filtros ya fueron verificados en backend.
   */

  const {
    data: actividades = [],
    isLoading: isLoadingActividades,
  } = useActividadesComerciales({
    cuenta_comercial: clienteId,
  });

  const {
    data: solicitudes = [],
    isLoading: isLoadingSolicitudes,
  } = useSolicitudesComerciales({
    cuenta_comercial: clienteId,
  });

  const {
    data: pedidosResponse,
    isLoading: isLoadingPedidos,
  } = usePedidos({
    cuenta_comercial: clienteId,
  });

  /*
   * pedidosApi devuelve una respuesta paginada.
   *
   * Extraemos solamente los resultados para trabajar
   * con ellos dentro de esta vista.
   */
  const pedidos: Pedido[] = pedidosResponse?.results ?? [];

  /*
   * Estado del modal de edición.
   */
  /*
   * Pestaña activa dentro del detalle del cliente.
   */
  const [activeTab, setActiveTab] = useState<DetailTab>("resumen");

  /**
   * ESTADOS PARA ACCIONES DE LA ACTIVIDAD
   */
  const [actividadEditar, setActividadEditar] =
    useState<ActividadComercial | null>(null);

  const [actividadEliminar, setActividadEliminar] =
    useState<ActividadComercial | null>(null);

  const [showRegistrarComunicacion, setShowRegistrarComunicacion] =
    useState(false);

  /**
   * HOOK PARA ELIMINAR
   */
  const deleteActividad = useDeleteActividadComercial();
  /**
   * Pestaña para ver historial comunicaciones
   */
  const [solicitudComunicacionId, setSolicitudComunicacionId] =
    useState<number | null>(null);

  /*
   * ============================================================
   * VALIDACIÓN DEL ID
   * ============================================================
   */

  if (!id || Number.isNaN(clienteId)) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate("/clientes")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a clientes
        </button>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-destructive">
            El identificador del cliente no es válido.
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * ESTADO DE CARGA
   * ============================================================
   */

  if (isLoading) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/clientes")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a clientes
        </button>

        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Cargando información del cliente...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * ESTADO DE ERROR
   * ============================================================
   */

  if (isError || !cliente) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/clientes")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a clientes
        </button>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground">
            No se pudo cargar el cliente
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Verifica que el cliente exista y que tengas permisos para
            consultarlo.
          </p>

          {error instanceof Error && (
            <p className="mt-3 text-xs text-destructive">
              {error.message}
            </p>
          )}
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * DATOS DERIVADOS
   * ============================================================
   */

  const nombreCliente = getClientName(cliente);
  const iniciales = getInitials(nombreCliente);

  const tipoPersonaLabel =
    cliente.tipo_persona === "natural"
      ? "Persona natural"
      : "Persona jurídica";

  const tipoDocumentoLabel =
    cliente.documento_identidad?.toUpperCase() || "-";

  const tipoRelacionLabel = getTipoRelacionLabel(
    cliente.tipo_relacion,
  );

  /*
   * ============================================================
   * ACTIVIDAD RECIENTE
   * ============================================================
   */

  const actividadesRecientes = [...actividades]
    .sort(
      (a, b) =>
        new Date(b.fecha_programada).getTime() -
        new Date(a.fecha_programada).getTime(),
    )
    .slice(0, 5);

  /*
   * ============================================================
   * SOLICITUDES RECIENTES
   * ============================================================
   */

  const solicitudesRecientes = [...solicitudes]
    .sort(
      (a, b) =>
        new Date(b.fecha).getTime() -
        new Date(a.fecha).getTime(),
    )
    .slice(0, 5);

  /*
   * ============================================================
   * PRÓXIMA ACTIVIDAD
   * ============================================================
   *
   * Buscamos la primera actividad pendiente/en proceso
   * sin importar si la fecha ya pasó.
   */

  const proximaActividad = [...actividades]
    .filter(
      (actividad) =>
        actividad.estado !== "completada" &&
        actividad.estado !== "cancelada",
    )
    .sort(
      (a, b) =>
        new Date(a.fecha_programada).getTime() -
        new Date(b.fecha_programada).getTime(),
    )[0];

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="space-y-6">
      {/* ======================================================
          NAVEGACIÓN
      ======================================================= */}

      <button
        type="button"
        onClick={() => navigate("/clientes")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a clientes
      </button>
      {/* ======================================================
    INFORMACIÓN DEL CLIENTE
======================================================= */}

      <FichaGeneralEditable cuenta={cliente} />

      {/* ======================================================
          CONTACTOS COMERCIALES
      ======================================================= */}

      <ContactosComercialesSection cuentaComercialId={clienteId} />
      <UbicacionesComercialesSection cuentaComercialId={clienteId} />
      <DocumentacionCuentaSection
        cuentaComercialId={clienteId}
        nombreComercial={cliente.nombre_comercial || cliente.razon_social || getClientName(cliente)}
      />

      {/* ======================================================
          NAVEGACIÓN COMERCIAL
      ======================================================= */}

      <section className="rounded-xl border border-border bg-card">
        <div className="overflow-x-auto border-b border-border">
          <div className="flex min-w-max">
            <TabButton
              active={activeTab === "resumen"}
              onClick={() => setActiveTab("resumen")}
            >
              Resumen
            </TabButton>

            <TabButton
              active={activeTab === "actividades"}
              onClick={() => setActiveTab("actividades")}
              count={actividades.length}
            >
              Actividades
            </TabButton>

            <TabButton
              active={activeTab === "solicitudes"}
              onClick={() => setActiveTab("solicitudes")}
              count={solicitudes.length}
            >
              Solicitudes
            </TabButton>

            <TabButton
              active={activeTab === "pedidos"}
              onClick={() => setActiveTab("pedidos")}
              count={pedidos.length}
            >
              Pedidos
            </TabButton>
          </div>
        </div>

        {/* ====================================================
            RESUMEN
        ===================================================== */}

        {activeTab === "resumen" && (
          <div className="space-y-6 p-6">
            {/* Resumen comercial + próxima actividad */}
            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <div className="rounded-xl border border-border">
                <SectionHeader
                  title="Resumen comercial"
                  description="Una vista rápida de la relación con este cliente."
                />

                <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  <SummaryMetric
                    icon={
                      <CalendarClock className="h-4 w-4" />
                    }
                    label="Actividades"
                    value={actividades.length}
                  />

                  <SummaryMetric
                    icon={
                      <ClipboardList className="h-4 w-4" />
                    }
                    label="Solicitudes"
                    value={solicitudes.length}
                  />

                  <SummaryMetric
                    icon={
                      <FileText className="h-4 w-4" />
                    }
                    label="Cotizaciones"
                    value="—"
                  />

                  <SummaryMetric
                    icon={
                      <ShoppingCart className="h-4 w-4" />
                    }
                    label="Pedidos"
                    value={pedidos.length}
                  />
                </div>
              </div>

              {/* Próxima actividad */}
              <div className="rounded-xl border border-border">
                <SectionHeader
                  title="Próxima actividad"
                  description="Siguiente actividad programada."
                />

                <div className="p-5">
                  {proximaActividad ? (
                    <NextActivityCard
                      actividad={proximaActividad}
                    />
                  ) : (
                    <EmptyState
                      title="No hay actividades próximas"
                      description="No existen actividades pendientes programadas para este cliente."
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            ACTIVIDADES
        ===================================================== */}

        {activeTab === "actividades" && (
          <div>
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <h2 className="font-semibold text-foreground">
                  Actividades comerciales
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Llamadas, reuniones y seguimientos asociados al cliente.
                </p>
              </div>

              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {actividades.length} registros
              </span>
            </div>

            {isLoadingActividades ? (
              <LoadingMessage />
            ) : actividades.length > 0 ? (
              <div>
                {[...actividades]
                  .sort(
                    (a, b) =>
                      new Date(
                        b.fecha_programada,
                      ).getTime() -
                      new Date(
                        a.fecha_programada,
                      ).getTime(),
                  )
                  .map((actividad, index, array) => (
                    <ActivityRow
                      key={actividad.id}
                      actividad={actividad}
                      last={index === array.length - 1}
                      onEdit={() => setActividadEditar(actividad)}
                      onDelete={() => setActividadEliminar(actividad)}
                      onRegistrarComunicacion={() =>
                        setShowRegistrarComunicacion(true)
                      }
                    />
                  ))}
              </div>
            ) : (
              <EmptyState
                title="No hay actividades registradas"
                description="Este cliente todavía no tiene actividades comerciales."
              />
            )}
          </div>
        )}

        {/* ====================================================
            SOLICITUDES
        ===================================================== */}

        {activeTab === "solicitudes" && (
          <div>
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <h2 className="font-semibold text-foreground">
                  Solicitudes comerciales
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Requerimientos registrados para este cliente.
                </p>
              </div>

              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {solicitudes.length} registros
              </span>
            </div>

            {isLoadingSolicitudes ? (
              <LoadingMessage />
            ) : solicitudes.length > 0 ? (
              <div>
                {[...solicitudes]
                  .sort(
                    (a, b) =>
                      new Date(b.fecha).getTime() -
                      new Date(a.fecha).getTime(),
                  )
                  .map((solicitud, index, array) => (
                    <SolicitudRow
                      key={solicitud.id}
                      solicitud={solicitud}
                      last={index === array.length - 1}
                      onViewComunicaciones={(solicitud) => {
                        setSolicitudComunicacionId(solicitud.id);
                      }}
                    />
                  ))}
              </div>
            ) : (
              <EmptyState
                title="No hay solicitudes registradas"
                description="Este cliente todavía no tiene requerimientos comerciales."
              />
            )}
          </div>
        )}

        {/* ====================================================
            PEDIDOS
        ===================================================== */}

        {activeTab === "pedidos" && (
          <div>
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <h2 className="font-semibold text-foreground">
                  Pedidos
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Pedidos asociados directamente a este cliente.
                </p>
              </div>

              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {pedidos.length} registros
              </span>
            </div>

            {isLoadingPedidos ? (
              <LoadingMessage />
            ) : pedidos.length > 0 ? (
              <div>
                {[...pedidos]
                  .sort(
                    (a, b) =>
                      new Date(
                        b.fecha_pedido,
                      ).getTime() -
                      new Date(
                        a.fecha_pedido,
                      ).getTime(),
                  )
                  .map((pedido, index, array) => (
                    <PedidoRow
                      key={pedido.id}
                      pedido={pedido}
                      last={index === array.length - 1}
                    />
                  ))}
              </div>
            ) : (
              <EmptyState
                title="No hay pedidos registrados"
                description="Este cliente todavía no tiene pedidos asociados."
              />
            )}
          </div>
        )}
      </section>

      {/* ======================================================
          MODAL PARA EDITAR CLIENTE
      ======================================================= */}

      {/* MODAL EDITAR ACTIVIDAD */}
      <NuevaActividadModal
        open={actividadEditar !== null}
        actividad={actividadEditar}
        onClose={() => setActividadEditar(null)}
      />

      {/* CONFIRMAR ELIMINACIÓN */}
      <ConfirmDialog
        open={actividadEliminar !== null}
        title="Eliminar actividad"
        description={
          actividadEliminar
            ? `¿Estás seguro de eliminar la actividad "${actividadEliminar.descripcion}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteActividad.isPending}
        onConfirm={async () => {
          if (!actividadEliminar) return;

          try {
            await deleteActividad.mutateAsync(
              actividadEliminar.id,
            );

            setActividadEliminar(null);
          } catch (error) {
            console.error(
              "Error al eliminar actividad:",
              error,
            );
          }
        }}
        onCancel={() => setActividadEliminar(null)}
      />

      {/* REGISTRAR COMUNICACIÓN */}
      <RegistrarComunicacionModal
        open={showRegistrarComunicacion}
        onClose={() =>
          setShowRegistrarComunicacion(false)
        }
      />
      {/* ======================================================
          MODAL COMUNICACIONES
      ======================================================= */}
      {solicitudComunicacionId !== null && (
        <ComunicacionesModal
          open={true}
          solicitudId={solicitudComunicacionId}
          titulo="Historial de comunicaciones"
          subtitulo={`Solicitud #${solicitudComunicacionId}`}
          onClose={() => setSolicitudComunicacionId(null)}
        />
      )}
    </div>
  );
}

/* ============================================================
   CONTACTOS COMERCIALES DE LA CUENTA
============================================================ */

type ContactoFormState = {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  cargo: string;
  area: string;
  telefono: string;
  correo: string;
  direccion: string;
  es_principal: boolean;
  activo: boolean;
};

const contactoFormInicial: ContactoFormState = {
  nombres: "",
  apellido_paterno: "",
  apellido_materno: "",
  cargo: "",
  area: "",
  telefono: "",
  correo: "",
  direccion: "",
  es_principal: false,
  activo: true,
};

function nombreContacto(contacto: ContactoComercial): string {
  return [
    contacto.nombres,
    contacto.apellido_paterno,
    contacto.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ");
}

function ContactosComercialesSection({
  cuentaComercialId,
}: {
  cuentaComercialId: number;
}) {
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const {
    data: contactos = [],
    isLoading,
    isError,
    error,
  } = useContactosComerciales(cuentaComercialId, mostrarInactivos);

  const crearContacto = useCreateContactoComercial();
  const actualizarContacto = useUpdateContactoComercial();
  const desactivarContacto = useDesactivarContactoComercial();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [contactoEditar, setContactoEditar] =
    useState<ContactoComercial | null>(null);
  const [contactoDesactivar, setContactoDesactivar] =
    useState<ContactoComercial | null>(null);
  const [formulario, setFormulario] =
    useState<ContactoFormState>(contactoFormInicial);
  const [errorFormulario, setErrorFormulario] = useState("");

  const guardando =
    crearContacto.isPending || actualizarContacto.isPending;

  const abrirNuevo = () => {
    setContactoEditar(null);
    setFormulario({
      ...contactoFormInicial,
      es_principal: contactos.filter((contacto) => contacto.activo).length === 0,
    });
    setErrorFormulario("");
    setMostrarFormulario(true);
  };

  const abrirEdicion = (contacto: ContactoComercial) => {
    setContactoEditar(contacto);
    setFormulario({
      nombres: contacto.nombres ?? "",
      apellido_paterno: contacto.apellido_paterno ?? "",
      apellido_materno: contacto.apellido_materno ?? "",
      cargo: contacto.cargo ?? "",
      area: contacto.area ?? "",
      telefono: contacto.telefono ?? "",
      correo: contacto.correo ?? "",
      direccion: contacto.direccion ?? "",
      es_principal: contacto.es_principal,
      activo: contacto.activo,
    });
    setErrorFormulario("");
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setContactoEditar(null);
    setFormulario(contactoFormInicial);
    setErrorFormulario("");
  };

  const cambiarCampo = (
    campo: keyof ContactoFormState,
    valor: string | boolean,
  ) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  };

  const guardarContacto = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorFormulario("");

    if (!formulario.nombres.trim()) {
      setErrorFormulario("Ingresa el nombre del contacto.");
      return;
    }

    const datos = {
      nombres: formulario.nombres.trim(),
      apellido_paterno: formulario.apellido_paterno.trim(),
      apellido_materno: formulario.apellido_materno.trim(),
      cargo: formulario.cargo.trim(),
      area: formulario.area.trim(),
      telefono: formulario.telefono.trim(),
      correo: formulario.correo.trim(),
      direccion: formulario.direccion.trim(),
      es_principal: formulario.es_principal,
      activo: formulario.activo,
    };

    try {
      if (contactoEditar) {
        const cambios: ContactoComercialUpdate = datos;
        await actualizarContacto.mutateAsync({
          id: contactoEditar.id,
          data: cambios,
        });
      } else {
        const nuevoContacto: ContactoComercialCreate = {
          cuenta_comercial: cuentaComercialId,
          ...datos,
          activo: true,
        };
        await crearContacto.mutateAsync(nuevoContacto);
      }
      cerrarFormulario();
    } catch (err) {
      console.error("Error al guardar el contacto comercial:", err);
      setErrorFormulario(
        "No se pudo guardar el contacto. Verifica los datos e inténtalo nuevamente.",
      );
    }
  };

  const confirmarDesactivacion = async () => {
    if (!contactoDesactivar) return;

    try {
      await desactivarContacto.mutateAsync(contactoDesactivar.id);
      setContactoDesactivar(null);
    } catch (err) {
      console.error("Error al desactivar el contacto comercial:", err);
      setErrorFormulario(
        "No se pudo desactivar el contacto. Inténtalo nuevamente.",
      );
      setContactoDesactivar(null);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex flex-col justify-between gap-4 border-b border-border bg-secondary/20 px-6 py-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ContactRound className="h-5 w-5" /></span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-foreground">Personas e interlocutores</h2>
              <span className="rounded-full bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">{contactos.filter((contacto) => contacto.activo).length} activas</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Contactos asociados a esta cuenta comercial.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setMostrarInactivos((value) => !value)} className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary">
            {mostrarInactivos ? "Ocultar inactivos" : "Ver inactivos"}
          </button>
          <button type="button" onClick={abrirNuevo} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <UserPlus className="h-4 w-4" /> Agregar persona
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingMessage />
      ) : isError ? (
        <div className="px-6 py-5">
          <p className="text-sm text-destructive">
            No se pudieron cargar los contactos comerciales.
          </p>
          {error instanceof Error && (
            <p className="mt-1 text-xs text-muted-foreground">
              {error.message}
            </p>
          )}
        </div>
      ) : contactos.length === 0 ? (
        <EmptyState
          title="No hay contactos registrados"
          description="Agrega el primer contacto comercial de esta empresa."
        />
      ) : (
        <div className="divide-y divide-border">
          {contactos.map((contacto) => (
            <div
              key={contacto.id}
              className={`flex flex-col gap-4 px-6 py-5 transition-colors sm:flex-row sm:items-start sm:justify-between ${contacto.activo ? "" : "bg-secondary/20 opacity-75"}`}
            >
              <div className="flex min-w-0 gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">
                      {nombreContacto(contacto) || "Contacto sin nombre"}
                    </p>
                    {contacto.es_principal && contacto.activo && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <Star className="h-3 w-3 fill-current" />
                        Principal
                      </span>
                    )}
                    {!contacto.activo && <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground">Inactiva</span>}
                  </div>

                  {(contacto.cargo || contacto.area) && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[contacto.cargo, contacto.area]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}

                  <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                    {contacto.telefono && (
                      <span className="inline-flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        {contacto.telefono}
                      </span>
                    )}
                    {contacto.correo && (
                      <span className="inline-flex items-center gap-2 break-all">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {contacto.correo}
                      </span>
                    )}
                    {contacto.direccion && (
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {contacto.direccion}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => abrirEdicion(contacto)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                {contacto.activo ? <button
                  type="button"
                  onClick={() => setContactoDesactivar(contacto)}
                  disabled={desactivarContacto.isPending}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Desactivar
                </button> : <button type="button" onClick={() => actualizarContacto.mutate({ id: contacto.id, data: { activo: true } })} disabled={actualizarContacto.isPending} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-500/10 disabled:opacity-50"><RotateCcw className="h-4 w-4" />Reactivar</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-start justify-between border-b border-border px-6 py-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserPlus className="h-5 w-5" /></span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Personas vinculadas</p>
                  <h3 className="mt-1 font-semibold text-foreground">
                    {contactoEditar ? "Editar interlocutor" : "Nuevo interlocutor"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">Datos de contacto y responsabilidad en la cuenta.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={cerrarFormulario}
                className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Cerrar formulario"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={guardarContacto} className="space-y-5 p-6">
              <div className="rounded-xl border border-border bg-secondary/20 p-4">
              <p className="mb-4 text-sm font-semibold text-foreground">Información de la persona</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <CampoContacto
                  label="Nombres *"
                  value={formulario.nombres}
                  onChange={(value) => cambiarCampo("nombres", value)}
                  required
                />
                <CampoContacto
                  label="Apellido paterno"
                  value={formulario.apellido_paterno}
                  onChange={(value) => cambiarCampo("apellido_paterno", value)}
                />
                <CampoContacto
                  label="Apellido materno"
                  value={formulario.apellido_materno}
                  onChange={(value) => cambiarCampo("apellido_materno", value)}
                />
                <CampoContacto
                  label="Cargo"
                  value={formulario.cargo}
                  onChange={(value) => cambiarCampo("cargo", value)}
                />
                <CampoContacto
                  label="Área"
                  value={formulario.area}
                  onChange={(value) => cambiarCampo("area", value)}
                />
                <CampoContacto
                  label="Teléfono"
                  value={formulario.telefono}
                  onChange={(value) => cambiarCampo("telefono", value)}
                  inputType="tel"
                />
                <CampoContacto
                  label="Correo electrónico"
                  value={formulario.correo}
                  onChange={(value) => cambiarCampo("correo", value)}
                  inputType="email"
                />
                <CampoContacto
                  label="Dirección"
                  value={formulario.direccion}
                  onChange={(value) => cambiarCampo("direccion", value)}
                />
              </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={formulario.es_principal}
                  onChange={(event) =>
                    cambiarCampo("es_principal", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                Interlocutor principal
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm text-foreground">
                <input type="checkbox" checked={formulario.activo} onChange={(event) => cambiarCampo("activo", event.target.checked)} className="h-4 w-4 rounded border-border accent-primary" />
                Persona activa
              </label>
              </div>

              {errorFormulario && (
                <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {errorFormulario}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cerrarFormulario}
                  disabled={guardando}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {guardando
                    ? "Guardando..."
                    : contactoEditar
                      ? "Guardar cambios"
                      : "Registrar contacto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {contactoDesactivar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <h3 className="font-semibold text-foreground">
              Desactivar contacto
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              ¿Deseas desactivar a{" "}
              <strong>{nombreContacto(contactoDesactivar)}</strong>? El contacto
              dejará de aparecer en la lista activa.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setContactoDesactivar(null)}
                disabled={desactivarContacto.isPending}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarDesactivacion}
                disabled={desactivarContacto.isPending}
                className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90 disabled:opacity-50"
              >
                {desactivarContacto.isPending ? "Desactivando..." : "Desactivar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CampoContacto({
  label,
  value,
  onChange,
  required = false,
  inputType = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputType?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      <input
        type={inputType}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

/* ============================================================
   COMPONENTES AUXILIARES
============================================================ */

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-border px-6 py-4">
      <h2 className="font-semibold text-foreground">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

function EstadoBadge({
  estado,
}: {
  estado: CuentaComercial["estado"];
}) {
  const styles =
    estado === "cliente"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : estado === "prospecto"
        ? "bg-primary/10 text-primary"
        : "bg-secondary text-muted-foreground";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {getEstadoLabel(estado)}
    </span>
  );
}

function TabButton({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-5 py-3.5 text-sm font-medium transition-colors ${active
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground"
        }`}
    >
      <span className="flex items-center gap-2">
        {children}

        {typeof count === "number" && (
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] ${active
              ? "bg-primary/10 text-primary"
              : "bg-secondary text-muted-foreground"
              }`}
          >
            {count}
          </span>
        )}
      </span>

      {active && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
      )}
    </button>
  );
}

function SummaryMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-3 p-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>

      <div>
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="mt-0.5 text-xl font-semibold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

function NextActivityCard({
  actividad,
}: {
  actividad: ActividadComercial;
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {getActividadIcon(actividad.tipo)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-foreground">
              {getActividadTipoLabel(actividad.tipo)}
            </span>

            <EstadoActividadBadge
              estado={actividad.estado}
            />
          </div>

          <p className="mt-1 text-sm text-foreground">
            {actividad.descripcion || "Sin descripción"}
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            {formatDateTime(actividad.fecha_programada)}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({
  actividad,
  last,
  onEdit,
  onDelete,
  onRegistrarComunicacion,
}: {
  actividad: ActividadComercial;
  last: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRegistrarComunicacion: () => void;
}) {
  return (
    <div
      className={`flex gap-4 px-6 py-4 ${!last ? "border-b border-border" : ""
        }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {getActividadIcon(actividad.tipo)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              {getActividadTipoLabel(actividad.tipo)}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {actividad.descripcion || "Sin descripción"}
            </p>
          </div>

          <EstadoActividadBadge
            estado={actividad.estado}
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            {formatDateTime(actividad.fecha_programada)}
          </span>

          {actividad.fecha_completada && (
            <span>
              Completada:{" "}
              {formatDateTime(actividad.fecha_completada)}
            </span>
          )}

          {actividad.resultado && (
            <span>
              Resultado: {actividad.resultado}
            </span>
          )}
        </div>
      </div>
      {/*Acciones*/}
      <ActividadMenu
        actividad={actividad}
        onEdit={onEdit}
        onDelete={onDelete}
        onRegistrarComunicacion={onRegistrarComunicacion}
      />
    </div>
  );
}

function SolicitudRow({
  solicitud,
  last,
  onViewComunicaciones,
}: {
  solicitud: SolicitudComercial;
  last: boolean;
  onViewComunicaciones: (solicitud: SolicitudComercial) => void;
}) {
  return (
    <div
      className={`flex gap-4 px-6 py-4 transition-colors hover:bg-secondary/40 ${!last ? "border-b border-border" : ""
        }`}
    >
      {/* Icono */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <ClipboardList className="h-4 w-4" />
      </div>

      {/* Información de la solicitud */}
      <Link
        to={`/comercial/requerimientos/${solicitud.id}`}
        className="min-w-0 flex-1"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              Solicitud #{solicitud.id}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {solicitud.descripcion || "Sin descripción"}
            </p>
          </div>

          <EstadoSolicitudBadge
            estado={solicitud.estado}
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            {formatDate(solicitud.fecha)}
          </span>

          {solicitud.cantidad_unidades && (
            <span>
              {formatNumber(solicitud.cantidad_unidades)} unidades
            </span>
          )}

          {solicitud.cantidad_kg && (
            <span>
              {formatNumber(solicitud.cantidad_kg)} kg
            </span>
          )}

          {solicitud.fecha_entrega && (
            <span>
              Entrega: {formatDate(solicitud.fecha_entrega)}
            </span>
          )}
        </div>
      </Link>

      {/* Acción de comunicaciones */}
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          onClick={() => onViewComunicaciones(solicitud)}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          title={`Ver comunicaciones de la solicitud #${solicitud.id}`}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Comunicaciones</span>
        </button>
      </div>
    </div>
  );
}

function PedidoRow({
  pedido,
  last,
}: {
  pedido: Pedido;
  last: boolean;
}) {
  return (
    <div
      className={`flex gap-4 px-6 py-4 ${!last ? "border-b border-border" : ""
        }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <ShoppingCart className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              {pedido.numero}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Pedido registrado el{" "}
              {formatDate(pedido.fecha_pedido)}
            </p>
          </div>

          <EstadoPedidoBadge estado={pedido.estado} />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {pedido.fecha_entrega_comprometida && (
            <span>
              Entrega comprometida:{" "}
              {formatDate(pedido.fecha_entrega_comprometida)}
            </span>
          )}

          {pedido.observaciones && (
            <span className="truncate">
              {pedido.observaciones}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function EstadoActividadBadge({
  estado,
}: {
  estado: ActividadComercial["estado"];
}) {
  const styles =
    estado === "completada"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : estado === "cancelada"
        ? "bg-red-500/10 text-red-600 dark:text-red-400"
        : estado === "en_proceso"
          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
          : "bg-amber-500/10 text-amber-600 dark:text-amber-400";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}
    >
      {getActividadEstadoLabel(estado)}
    </span>
  );
}

function EstadoSolicitudBadge({
  estado,
}: {
  estado: SolicitudComercial["estado"];
}) {
  const styles =
    estado === "rechazada"
      ? "bg-red-500/10 text-red-600 dark:text-red-400"
      : estado === "en_negociacion"
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
        : estado === "aprobada"
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-primary/10 text-primary";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}
    >
      {getSolicitudEstadoLabel(estado)}
    </span>
  );
}

function EstadoPedidoBadge({
  estado,
}: {
  estado: Pedido["estado"];
}) {
  const styles =
    estado === "finalizado"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : estado === "cancelado"
        ? "bg-red-500/10 text-red-600 dark:text-red-400"
        : "bg-primary/10 text-primary";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}
    >
      {getPedidoEstadoLabel(estado)}
    </span>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-6 py-10 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <CheckCircle2 className="h-5 w-5" />
      </div>

      <p className="mt-3 text-sm font-medium text-foreground">
        {title}
      </p>

      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function LoadingMessage() {
  return (
    <div className="px-6 py-10 text-center">
      <p className="text-sm text-muted-foreground">
        Cargando información...
      </p>
    </div>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function getClientName(client: CuentaComercial): string {
  if (client.tipo_persona === "juridica") {
    return client.nombre_comercial || client.razon_social || "Sin razón social";
  }

  return (
    [
      client.nombres,
      client.apellido_paterno,
      client.apellido_materno,
    ]
      .filter(Boolean)
      .join(" ") || "Sin nombre"
  );
}

function getInitials(name: string): string {
  const words = name
    .split(" ")
    .filter(Boolean);

  if (words.length === 0) {
    return "CL";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (
    words[0][0] +
    words[1][0]
  ).toUpperCase();
}

function getEstadoLabel(
  estado: CuentaComercial["estado"],
): string {
  switch (estado) {
    case "cliente":
      return "Activo";

    case "prospecto":
      return "Prospecto";

    case "inactivo":
      return "Inactivo";

    default:
      return estado;
  }
}

function getTipoRelacionLabel(
  tipoRelacion: CuentaComercial["tipo_relacion"],
): string {
  switch (tipoRelacion) {
    case "cliente":
      return "Cliente";

    case "proveedor":
      return "Proveedor";

    case "ambos":
      return "Cliente y proveedor";

    default:
      return tipoRelacion || "-";
  }
}

function getActividadIcon(
  tipo: ActividadComercial["tipo"],
) {
  switch (tipo) {
    case "llamada":
      return <Phone className="h-4 w-4" />;

    case "reunion":
      return <CalendarDays className="h-4 w-4" />;

    case "cotizacion":
      return <FileText className="h-4 w-4" />;

    case "seguimiento":
      return <CalendarClock className="h-4 w-4" />;

    case "confirmacion":
      return <CheckCircle2 className="h-4 w-4" />;

    default:
      return <CalendarClock className="h-4 w-4" />;
  }
}

function getActividadTipoLabel(
  tipo: ActividadComercial["tipo"],
): string {
  switch (tipo) {
    case "llamada":
      return "Llamada";

    case "reunion":
      return "Reunión";

    case "cotizacion":
      return "Cotización";

    case "seguimiento":
      return "Seguimiento";

    case "confirmacion":
      return "Confirmación";

    default:
      return tipo;
  }
}

function getActividadEstadoLabel(
  estado: ActividadComercial["estado"],
): string {
  switch (estado) {
    case "pendiente":
      return "Pendiente";

    case "en_proceso":
      return "En proceso";

    case "completada":
      return "Completada";

    case "cancelada":
      return "Cancelada";

    default:
      return estado;
  }
}

function getSolicitudEstadoLabel(
  estado: SolicitudComercial["estado"],
): string {
  switch (estado) {
    case "recibida":
      return "Recibida";

    case "en_revision":
      return "En revisión";

    case "en_negociacion":
      return "En negociación";

    case "aprobada":
      return "Aprobada";

    case "rechazada":
      return "Rechazada";

    case "cancelada":
      return "Cancelada";

    default:
      return estado;
  }
}

function getPedidoEstadoLabel(
  estado: Pedido["estado"],
): string {
  switch (estado) {
    case "pendiente":
      return "Pendiente";

    case "confirmado":
      return "Confirmado";

    case "en_proceso":
      return "En proceso";

    case "finalizado":
      return "Finalizado";

    case "cancelado":
      return "Cancelado";

    default:
      return estado;
  }
}

function formatDate(
  value?: string | null,
): string {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(
  value?: string | null,
): string {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNumber(
  value?: string | number | null,
): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("es-BO", {
    maximumFractionDigits: 2,
  }).format(number);
}

export default DetallesCliente;
