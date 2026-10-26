/**
 * PAGINA DONDE SE MUESTRA LA TABLA DE CLIENTES.
 *
 * Esta página se encarga principalmente de:
 * 1. Obtener los clientes desde el backend mediante React Query.
 * 2. Mostrar los clientes en una tabla.
 * 3. Permitir buscar y filtrar clientes.
 * 4. Abrir el formulario para crear un cliente.
 * 5. Abrir el mismo formulario para editar un cliente.
 * 6. Permitir desactivar un cliente.
 */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ChevronDown,
  BriefcaseBusiness,
  ContactRound,
  Plus,
  Search,
  UserX,
  ArrowUpNarrowWide,
  User,
} from "lucide-react";

/**
 * Los hooks son la capa que conecta esta página
 * con las operaciones de React Query.
 *
 * IMPORTANTE:
 *
 * ClientesPage NO hace directamente una petición HTTP.
 *
 * El flujo es:
 *
 * ClientesPage
 *      ↓
 * useCuentasComerciales()
 *      ↓
 * cuentasComercialesApi.list()
 *      ↓
 * Backend Django
 */
import {
  useCuentasComerciales,
  useDesactivarCuentaComercial,
  useEjecutivosComerciales,
  useActivarCuentaComercial,
} from "../comercial.hooks";

import type {
  CuentaComercial,
  EstadoCuenta,
  EjecutivoComercial,
} from "../comercial.types";

/**
 * Este mismo componente se utiliza tanto para:
 *
 * - Crear un cliente
 * - Editar un cliente
 *
 * La diferencia está en si recibe o no la propiedad "client".
 */
import NuevaCuentaComercialWizard from "../components/NuevaCuentaComercialWizard";

import ConfirmDialog from "@/components/feedback/ConfirmDialog";

export default function ClientesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  /**
   * Guarda el filtro de estado seleccionado.
   *
   * Puede ser:
   *
   * - "todos"
   * - "cliente"
   * - "prospecto"
   * - "inactivo"
   */
  const [estado, setEstado] =
    useState<EstadoCuenta | "todos">("todos");

  /**
   * OBTENER CLIENTES
   *
   * Aquí comienza la obtención de los clientes.
   *
   * Este componente llama al hook:
   *
   * useCuentasComerciales()
   *
   * El hook se encarga posteriormente de llamar
   * al API y obtener los datos desde Django.
   *
   * data       → clientes recibidos
   * isLoading  → indica si todavía está cargando
   * isError    → indica si ocurrió un error
   * error      → contiene el error
   */

  //Ordenar cliente
  const [orden, setOrden] = useState<
    "recientes" | "alfabetico"
  >("recientes");

  const {
    data,
    isLoading,
    isError,
    error,
  } = useCuentasComerciales({
    /**
     * Si search está vacío enviamos undefined.
     *
     * Si tiene contenido enviamos el texto.
     */
    search: search || undefined,

    /**
     * Si el usuario seleccionó "todos",
     * no enviamos filtro de estado.
     *
     * Si seleccionó otro estado,
     * lo enviamos al backend.
     */
    estado: estado !== "todos" ? estado : undefined,
  });

  /**
   * Si data todavía no existe,
   * utilizamos un arreglo vacío.
   *
   * Esto evita errores al hacer:
   *
   * clients.map(...)
   *
   * cuando todavía no llegó la respuesta del backend.
   */
  const clients = data ?? [];

  const clientsOrdenados = useMemo(() => {
    const resultado = [...clients];

    if (orden === "recientes") {
      return resultado.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    }

    return resultado.sort((a, b) =>
      getClientName(a).localeCompare(
        getClientName(b),
        "es",
        { sensitivity: "base" }
      )
    );
  }, [clients, orden]);

  /**
   * RESUMEN DE CLIENTES
   *
   * useMemo evita recalcular estos valores
   * si la lista de clientes no cambió.
   */
  const summary = useMemo(() => {
    /**
     * Cuenta cuántos registros tienen estado "cliente".
     */
    const activos = clients.filter(
      (client) => client.estado === "cliente",
    ).length;

    /**
     * Cuenta cuántos registros son prospectos.
     */
    const prospectos = clients.filter(
      (client) => client.estado === "prospecto",
    ).length;

    return {
      activos,
      prospectos,
      inactivos: clients.filter((client) => client.estado === "inactivo").length,
    };
  }, [clients]);

  /**
   * OBTENER EJECUTIVOS COMERCIALES
   *
   * Este hook obtiene los ejecutivos disponibles.
   *
   * Después se utilizan para saber qué ejecutivo
   * está asignado a cada cliente.
   */
  const { data: ejecutivos } = useEjecutivosComerciales();

  /**
   * ============================================================
   * EDICIÓN DEL CLIENTE
   * ============================================================
   *
   * Esta variable es MUY IMPORTANTE.
   *
   * Aquí guardamos temporalmente el cliente que el usuario
   * quiere editar.
   *
   * Inicialmente:
   *
   * selectedCliente = null
   *
   * Eso significa:
   * "No estamos editando ningún cliente".
   *
   * Cuando el usuario presiona el botón editar de un cliente:
   *
   * setSelectedClient(client)
   *
   * entonces:
   *
   * selectedCliente = cliente seleccionado
   *
   * y posteriormente se abre NuevoClienteModal.
   */
  const [selectedCliente, setSelectedClient] =
    useState<CuentaComercial | null>(null);

  /**
   * ============================================================
   * CREACIÓN DE CLIENTE
   * ============================================================
   *
   * Este estado controla si se debe mostrar el modal
   * para crear un nuevo cliente.
   *
   * false → modal cerrado
   * true  → modal abierto
   */
  const [showNewClient, setShowNewClient] =
    useState(false);

  /**
   * Hook encargado de desactivar clientes.
   *
   * La petición real será realizada por el API
   * a través de este hook.
   */
  const desactivarCliente =
    useDesactivarCuentaComercial();

  const activarCliente = useActivarCuentaComercial();
  /**
   *
   * Guarda el cliente que el usuario quiere desactivar.
   *
   * Es diferente de selectedCliente porque:
   *
   * selectedCliente      → editar
   * clientToDeactivate   → desactivar
   */
  const [clientToDeactivate, setClientToDeactivate] =
    useState<CuentaComercial | null>(null);

  const [clientToActivate, setClientToActivate] =
    useState<CuentaComercial | null>(null);

  /**
   * ============================================================
   * DESACTIVAR CLIENTE
   * ============================================================
   */
  const handleDesactivar = async () => {
    /**
     * Si no existe un cliente seleccionado,
     * no hacemos nada.
     */
    if (!clientToDeactivate) return;

    try {
      /**
       * Ejecutamos la mutación de desactivación.
       *
       * Se envía solamente el ID del cliente.
       *
       * Flujo:
       *
       * handleDesactivar()
       *      ↓
       * desactivarCliente.mutateAsync(id)
       *      ↓
       * cuentasComercialesApi.desactivar(id)
       *      ↓
       * PATCH /desactivar/
       *      ↓
       * Backend Django
       *      ↓
       * estado = "inactivo"
       */
      await desactivarCliente.mutateAsync(
        clientToDeactivate.id,
      );

      /**
       * Una vez desactivado correctamente,
       * limpiamos el cliente seleccionado.
       *
       * Esto también cierra el ConfirmDialog.
       */
      setClientToDeactivate(null);
    } catch (error) {
      console.error(
        "Error al desactivar cliente:",
        error,
      );
    }
  };
  const handleActivar = async () => {
    if (!clientToActivate) return;

    await activarCliente.mutateAsync(clientToActivate.id);

    setClientToActivate(null);
  };



  return (
    <div className="space-y-6">
      {/* ========================================================
          ENCABEZADO
          ======================================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">
            Contactos y CRM
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Organizaciones, interlocutores y estado de la relación comercial.
          </p>
        </div>

        {/* BOTÓN NUEVO CLIENTE */}

        <button
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          type="button"
          /**
           * Al presionar "Nuevo cliente":
           *
           * showNewClient pasa de false → true.
           *
           * Esto provoca que más abajo se renderice
           * NuevoClienteModal sin la propiedad client.
           *
           * Al no recibir client, el modal sabe que
           * estamos creando un registro nuevo.
           */
          onClick={() => setShowNewClient(true)}
        >
          <Plus className="h-4 w-4" />

          Nuevo contacto / empresa
        </button>
      </div>

      {/* ========================================================
          RESUMEN
          ======================================================== */}

      <div className="grid gap-4 sm:grid-cols-4">
        <CrmStatCard icon={<ContactRound className="h-5 w-5" />} label="Contacto" value={summary.activos} detail="Cuentas en seguimiento inicial" tone="blue" />
        <CrmStatCard icon={<BriefcaseBusiness className="h-5 w-5" />} label="Lead" value={summary.activos} detail="Relaciones comerciales activas" tone="green" />
        <CrmStatCard icon={<ArrowUpNarrowWide className="h-5 w-5" />} label="Opertunidad" value={summary.inactivos} detail="Cuentas conservadas en el sistema" tone="slate" />
        <CrmStatCard icon={<User className="h-5 w-5" />} label="Cliente" value={summary.inactivos} detail="Cuentas conservadas en el sistema" tone="slate" />
      </div>

      {/* ========================================================
          TABLA
          ======================================================== */}

      <section className="overflow-hidden rounded-lg border border-border bg-card">
        {/* TOOLBAR */}

        <div className="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-center">
          {/* BUSCADOR */}

          <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 lg:max-w-lg">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />

            <input
              type="search"
              value={search}
              /**
               * Cada vez que el usuario escribe,
               * actualizamos el estado search.
               *
               * Esto provoca que el hook
               * useCuentasComerciales() reciba el nuevo valor.
               */
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar empresa, documento o contacto..."
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="orden-clientes"
              className="text-sm text-muted-foreground whitespace-nowrap"
            >
              Ordenar por:
            </label>

            <select
              id="orden-clientes"
              value={orden}
              onChange={(e) =>
                setOrden(
                  e.target.value as
                  | "recientes"
                  | "alfabetico"
                )
              }
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="recientes">Más recientes</option>
              <option value="alfabetico">Nombre A–Z</option>
            </select>
          </div>

          <div className="flex gap-2">
            {/* FILTRO POR ESTADO */}

            <div className="relative">
              <select
                value={estado}
                onChange={(event) =>
                  setEstado(
                    event.target.value as EstadoCuenta | "todos",
                  )
                }
                className="appearance-none rounded-md border border-border bg-background py-2 pl-3 pr-9 text-sm font-medium text-foreground outline-none"
              >
                <option value="todos">
                  Todos los clientes
                </option>

                <option value="cliente">
                  Clientes activos
                </option>

                <option value="prospecto">
                  Prospectos
                </option>

                <option value="inactivo">
                  Inactivos
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* ========================================================
            ESTADO DE CARGA
            ======================================================== */}

        {isLoading && (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            Cargando clientes...
          </div>
        )}

        {/* ========================================================
            ESTADO DE ERROR
            ======================================================== */}

        {isError && (
          <div className="px-5 py-10 text-center text-sm text-destructive">
            No se pudieron cargar los clientes.

            {error instanceof Error && (
              <span className="mt-1 block">
                {error.message}
              </span>
            )}
          </div>
        )}

        {/* ========================================================
            TABLA DE CLIENTES
            ======================================================== */}

        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* CABECERA */}

              <div className="grid grid-cols-[1.7fr_1.5fr_.65fr_.8fr_1fr] gap-4 border-b border-border bg-secondary/30 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Empresa / persona</span>
                <span>Interlocutor principal</span>
                <span>Contactos</span>
                <span>Documento</span>
                <span>Etapa </span>
              </div>

              {/* FILAS */}

              {clientsOrdenados.map((client) => (
                <ClientRow
                  key={client.id}
                  client={client}

                  /**
                   * Enviamos la lista de ejecutivos
                   * al componente ClientRow.
                   */
                  ejecutivos={ejecutivos ?? []}

                  /**
                   * =================================================
                   * AQUÍ COMIENZA EL FLUJO DE EDICIÓN
                   * =================================================
                   *
                   * ClientRow recibe una función llamada onEdit.
                   *
                   * Cuando ClientRow ejecute:
                   *
                   * onEdit()
                   *
                   * realmente estará ejecutando:
                   *
                   * setSelectedClient(client)
                   *
                   * Es decir, guardará el cliente actual
                   * en selectedCliente.
                   */
                  onEdit={() => setSelectedClient(client)}

                  /**
                   * De manera similar, guardamos el cliente
                   * que se desea desactivar.
                   */
                  onDeactivate={() =>
                    setClientToDeactivate(client)
                  }
                  onActivate={() => setClientToActivate(client)}
                />
              ))}

              {clients.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No se encontraron clientes.
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ========================================================
          MODAL PARA CREAR CLIENTE
          ======================================================== */}

      {showNewClient && (
        <NuevaCuentaComercialWizard
          /**
           * Indica que el modal está abierto.
           */
          open={showNewClient}
          /**
           * Al cerrar el modal:
           *
           * showNewClient → false
           */
          onClose={() => setShowNewClient(false)}
          /**
           * También cerramos el modal después
           * de crear correctamente el cliente.
           */
          onSuccess={(accountId) => {
            setShowNewClient(false);
            navigate(`/comercial/clientes/${accountId}`);
          }}
        /**
         * IMPORTANTE:
         *
         * Aquí NO enviamos "client".
         *
         * Por eso NuevoClienteModal entiende:
         *
         * "Estoy creando un cliente nuevo".
         */
        />
      )}

      {/* ========================================================
          MODAL PARA EDITAR CLIENTE
          ======================================================== */}

      {selectedCliente && (
        <NuevoClienteModal
          /**
           * Como selectedCliente existe,
           * el modal se muestra.
           */
          open={!!selectedCliente}
          /**
           * ======================================================
           * ESTA ES LA PARTE CLAVE
           * ======================================================
           *
           * Aquí enviamos el cliente seleccionado al mismo
           * componente que usamos para crear clientes.
           *
           * Por ejemplo:
           *
           * client = {
           *   id: 15,
           *   nombres: "Juan",
           *   apellido_paterno: "Perez",
           *   ...
           * }
           *
           * NuevoClienteModal utilizará esos datos
           * para llenar el formulario.
           */
          client={selectedCliente}
          /**
           * Cuando se cierra:
           *
           * selectedCliente → null
           *
           * Como la condición:
           *
           * {selectedCliente && (...)}
           *
           * deja de cumplirse, React desmonta el modal.
           */
          onClose={() => setSelectedClient(null)}
          /**
           * Después de actualizar correctamente
           * también limpiamos el cliente seleccionado
           * y cerramos el modal.
           */
          onSuccess={() => setSelectedClient(null)}
        />
      )}

      {/* ========================================================
          CONFIRMAR DESACTIVACIÓN
          ======================================================== */}

      <ConfirmDialog
        open={!!clientToDeactivate}
        title="¿Desactivar cliente?"
        description={
          clientToDeactivate
            ? `¿Estás seguro de desactivar a ${getClientName(clientToDeactivate)}? El cliente dejará de estar activo, pero se conservará todo su historial comercial.`
            : ""
        }
        confirmText="Desactivar"
        cancelText="Cancelar"
        loading={desactivarCliente.isPending}
        onCancel={() => setClientToDeactivate(null)}
        onConfirm={handleDesactivar}
      />

      <ConfirmDialog
        open={!!clientToActivate}
        title="Activar cliente"
        description={`¿Está seguro de que desea activar nuevamente a ${clientToActivate?.razon_social}?`}
        onCancel={() => setClientToActivate(null)}
        onConfirm={handleActivar}
        loading={activarCliente.isPending}
      />

    </div>
  );
}

/* ================================================================
   FILA DE CLIENTE
   ================================================================ */

function ClientRow({
  client,
  ejecutivos,
}: {
  client: CuentaComercial;
  ejecutivos: EjecutivoComercial[];

  /**
   * Función que viene desde ClientesPage.
   *
   * ClientRow no sabe cómo se edita el cliente.
   *
   * Simplemente ejecuta onEdit().
   */
  onEdit: () => void;

  /**
   * Función que viene desde ClientesPage
   * para iniciar la desactivación.
   */
  onDeactivate: () => void;
  onActivate: () => void;
}) {
  /**
   * Hook utilizado para navegar a la página
   * de detalle del cliente.
   */
  const navigate = useNavigate();

  /**
   * Obtener nombre que se mostrará.
   */
  const displayName = getClientName(client);

  /**
   * Obtener iniciales para el avatar.
   */
  const initials = getInitials(displayName);

  /**
   * Buscar el ejecutivo cuyo ID coincide
   * con el ejecutivo asignado al cliente.
   */
  const ejecutivo = ejecutivos.find(
    (item) => item.id === client.ejecutivo_asignado,
  );

  const nombreEjecutivo = ejecutivo
    ? `${ejecutivo.first_name} ${ejecutivo.last_name}`.trim()
    : "Sin asignar";

  return (
    <div className="grid w-full grid-cols-[1.7fr_1.5fr_.65fr_.8fr_1fr] items-center gap-4 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-secondary/40">
      <button
        type="button"
        onClick={() =>
          navigate(`/comercial/clientes/${client.id}`)
        }
        className="group flex min-w-0 items-center gap-3 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
          {initials}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
            {displayName}
          </p>

          <p className="truncate text-xs text-muted-foreground">
            {client.tipo_persona === "juridica" ? "Organización" : "Persona natural"} · Ejecutivo: {nombreEjecutivo}
          </p>
        </div>
      </button>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {client.contacto_principal
            ? [client.contacto_principal.nombres, client.contacto_principal.apellido_paterno, client.contacto_principal.apellido_materno]
                .filter(Boolean)
                .join(" ")
            : "Sin interlocutor principal"}
        </p>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {client.contacto_principal?.cargo || client.contacto_principal?.correo || client.contacto_principal?.telefono || "Agrega personas desde la ficha"}
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm text-foreground">
        <UserX className="h-4 w-4 text-muted-foreground" />
        {client.contactos_count}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {client.documento_identidad?.toUpperCase() || "—"} {client.numero_documento || "Sin documento"}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${client.estado === "prospecto"
            ? "bg-primary/10 text-primary"
            : client.estado === "cliente"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-secondary text-muted-foreground"
            }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {client.etapa_crm ? getEtapaLabel(client.etapa_crm) : getEstadoLabel(client.estado)}
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   HELPERS
   ================================================================ */

/**
 * Obtiene el nombre que se mostrará en la tabla.
 *
 * Si es una persona jurídica:
 *
 *     razon_social
 *
 * Si es una persona natural:
 *
 *     nombres + apellido_paterno + apellido_materno
 */
function getClientName(
  client: CuentaComercial,
): string {
  if (client.tipo_persona === "juridica") {
    return (
      client.nombre_comercial || client.razon_social ||
      "Sin razón social"
    );
  }

  return [
    client.nombres,
    client.apellido_paterno,
    client.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ") || "Sin nombre";
}

/**
 * Obtiene las iniciales del nombre.
 *
 * Ejemplo:
 *
 * "Juan Perez"
 *      ↓
 * "JP"
 */
function getInitials(name: string): string {
  const words = name
    .split(" ")
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[1][0]
  ).toUpperCase();
}

/**
 * Convierte los valores internos del estado
 * en textos que se muestran al usuario.
 *
 * Backend:
 *
 * "cliente"
 *
 * Frontend:
 *
 * "Activo"
 */
function getEstadoLabel(
  estado: EstadoCuenta,
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

function getEtapaLabel(etapa: CuentaComercial["etapa_crm"]): string {
  switch (etapa) {
    case "contacto": return "Contacto";
    case "lead": return "Lead";
    case "oportunidad": return "Oportunidad";
    case "cliente": return "Cliente";
    default: return "";
  }
}

function CrmStatCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail: string;
  tone: "blue" | "green" | "slate";
}) {
  const color = {
    blue: "bg-primary/10 text-primary",
    green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    slate: "bg-secondary text-muted-foreground",
  }[tone];

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <strong className="mt-2 block text-3xl font-semibold tracking-tight text-foreground">{value}</strong>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>{icon}</span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
