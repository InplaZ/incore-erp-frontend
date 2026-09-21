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
  Filter,
  Pencil,
  Plus,
  Search,
  UserCheck,
  UserX,
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
import NuevoClienteModal from "../components/NuevoClienteModal";

import ConfirmDialog from "@/components/feedback/ConfirmDialog";

export default function ClientesPage() {
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
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            RELACIÓN COMERCIAL
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-foreground">
            Clientes
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona tus relaciones y encuentra toda la historia comercial.
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

          Nuevo cliente
        </button>
      </div>

      {/* ========================================================
          RESUMEN
          ======================================================== */}

      <div className="grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-3">
        <SummaryItem
          label="Clientes activos"
          value={String(summary.activos)}
          detail="Registros cargados"
        />

        <SummaryItem
          label="Prospectos"
          value={String(summary.prospectos)}
          detail="Registros cargados"
        />

        <SummaryItem
          label="Total de cuentas"
          value={String(data?.length ?? 0)}
          detail="Según API"
        />
      </div>

      {/* ========================================================
          TABLA
          ======================================================== */}

      <section className="overflow-hidden rounded-lg border border-border bg-card">
        {/* TOOLBAR */}

        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center">
          {/* BUSCADOR */}

          <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-border px-3 md:max-w-md">
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
              placeholder="Buscar por nombre, NIT o contacto..."
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Filter className="h-4 w-4" />

              Filtros
            </button>

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
            <div className="min-w-[850px]">
              {/* CABECERA */}

              <div className="grid grid-cols-[2fr_1.5fr_1.2fr_1.2fr_40px] gap-4 border-b border-border bg-secondary/30 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Cliente</span>
                <span>Contacto principal</span>
                <span>Estado</span>
                <span>Teléfono</span>
                <span />
              </div>

              {/* FILAS */}

              {clients.map((client) => (
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
        <NuevoClienteModal
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
          onSuccess={() => setShowNewClient(false)}
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
  onEdit,
  onDeactivate,
  onActivate,
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
    <div className="grid w-full grid-cols-[2fr_1.5fr_1.2fr_1.2fr_40px] items-center gap-4 border-b border-border px-5 py-4 hover:bg-secondary/90">
      {/* ========================================================
          CLIENTE
          ======================================================== */}

      <button
        type="button"
        /**
         * IMPORTANTE:
         *
         * Al hacer clic sobre el nombre del cliente
         * NO editamos.
         *
         * Navegamos a:
         *
         * /comercial/clientes/{id}
         *
         * Ejemplo:
         *
         * /comercial/clientes/15
         *
         * Esta sería la página de detalle.
         */
        onClick={() =>
          navigate(`/comercial/clientes/${client.id}`)
        }
        className="flex min-w-0 items-center gap-3 text-left"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {initials}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {displayName}
          </p>

          <p className="truncate text-xs text-muted-foreground">
            Ejecutivo: {nombreEjecutivo}
          </p>
        </div>
      </button>

      {/* ========================================================
          CONTACTO
          ======================================================== */}

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {client.correo || "Sin correo"}
        </p>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {client.documento_identidad?.toUpperCase() ?? "ID"}{" "}
          {client.numero_documento || "Sin documento"}
        </p>
      </div>

      {/* ========================================================
          ESTADO
          ======================================================== */}

      <span
        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${client.estado === "prospecto"
          ? "bg-primary/10 text-primary"
          : client.estado === "cliente"
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-secondary text-muted-foreground"
          }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />

        {getEstadoLabel(client.estado)}
      </span>

      {/* ========================================================
          TELÉFONO
          ======================================================== */}

      <div>
        <p className="text-sm font-semibold text-foreground">
          {client.telefono || "-"}
        </p>
      </div>

      {/* ========================================================
          ACCIONES
          ======================================================== */}

      <div className="flex items-center justify-end gap-3">
        {/* ======================================================
            BOTÓN EDITAR
            ====================================================== */}

        <button
          type="button"
          onClick={(event) => {
            /**
             * Evita que el clic continúe hacia otros elementos
             * que puedan tener eventos asociados.
             */
            event.stopPropagation();

            /**
             * AQUÍ NO LLAMAMOS DIRECTAMENTE AL HOOK.
             *
             * Aquí solamente ejecutamos:
             *
             * onEdit()
             *
             * Esta función fue enviada desde ClientesPage:
             *
             * onEdit={() => setSelectedClient(client)}
             *
             * Por lo tanto el flujo completo es:
             *
             * Usuario pulsa Editar
             *        ↓
             * ClientRow ejecuta onEdit()
             *        ↓
             * ClientesPage ejecuta
             * setSelectedClient(client)
             *        ↓
             * selectedCliente contiene el cliente
             *        ↓
             * Se renderiza NuevoClienteModal
             *        ↓
             * client={selectedCliente}
             *        ↓
             * El formulario se llena con los datos
             * del cliente.
             */
            onEdit();
          }}
          title="Editar cliente"
        >
          <Pencil
            width={24}
            height={24}
          />
        </button>

        {/* ======================================================
            BOTÓN DESACTIVAR
            ====================================================== */}

        {client.estado === "inactivo" ? (
          <button
            type="button"
            onClick={onActivate}
            title="Activar cliente"
            className="..."
          >
            <UserCheck className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onDeactivate}
            title="Desactivar cliente"
            className="..."
          >
            <UserX className="h-4 w-4" />
          </button>
        )}
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
      client.razon_social ||
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

/* ================================================================
   COMPONENTE SUMMARY
   ================================================================ */

/**
 * Componente reutilizable para mostrar
 * cada tarjeta del resumen.
 */
function SummaryItem({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border-b border-border p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <span className="block text-xs text-muted-foreground">
        {label}
      </span>

      <div className="mt-1 flex items-baseline gap-2">
        <strong className="text-2xl font-semibold text-foreground">
          {value}
        </strong>

        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {detail}
        </span>
      </div>
    </div>
  );
}
