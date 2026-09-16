///////////////////////////////
// INTERFAZ DONDE SE MUESTRA LOS DETALLES DEL PRODUCTO A ENTRAGAR 
///////////////////////////////

import type { ReactNode } from "react";

import {
  Check,
  FileText,
  Package,
  Palette,
  Sparkles,
  Truck,
  UserRound,
} from "lucide-react";

import type { CuentaComercial } from "../../comercial.types";
import type { ProductType } from "./RequerimientoStepProducto";

interface RequerimientoStepConfirmacionProps {
  cuentaSeleccionada?: CuentaComercial;

  product: ProductType;

  cantidadUnidades: string;
  cantidadKg: string;
  prioridad: string;
  fechaEntrega: string;

  descripcion: string;
  observaciones: string;
  lugarEntrega: string;

  material: string;
  aptoAlimento : boolean;
  micraje: string;
  colorBolsa: string;
  opacidad: string;

  tratamientosAcabadosEspeciales: string[];

  impresion: boolean;
  colorImpresion: string;
  tipoImpresion: string;
  tratamientoImpresion: string;

  otrasCaracteristicas: string;

  anchoDoblado: string;
  anchoDesdoblado: string;
  largoDoblado: string;
  largoDesdoblado: string;

  fuelle: boolean;
  fuelleIzquierdo: string;
  fuelleDerecho: string;
  fuelleInferior: string;
  fuelleSuperior: string;

  tipoTroquel: string;
  tipoSello: string;
  pestana: string;
}

export default function RequerimientoStepConfirmacion({
  cuentaSeleccionada,
  product,
  cantidadUnidades,
  cantidadKg,
  prioridad,
  fechaEntrega,
  descripcion,
  observaciones,
  lugarEntrega,

  material,
  aptoAlimento,
  micraje,
  colorBolsa,
  opacidad,

  tratamientosAcabadosEspeciales = [],

  impresion,
  colorImpresion,
  tipoImpresion,
  tratamientoImpresion,

  otrasCaracteristicas,

  anchoDoblado,
  anchoDesdoblado,
  largoDoblado,
  largoDesdoblado,

  fuelle,
  fuelleIzquierdo,
  fuelleDerecho,
  fuelleInferior,
  fuelleSuperior,

  tipoTroquel,
  tipoSello,
  pestana,
}: RequerimientoStepConfirmacionProps) {
  const nombreCliente = cuentaSeleccionada
    ? cuentaSeleccionada.razon_social ||
      `${cuentaSeleccionada.nombres} ${cuentaSeleccionada.apellido_paterno}`.trim()
    : "No seleccionado";

  const nombreProducto =
    product === "bag"
      ? "Bolsas"
      : product === "roll"
        ? "Bobinas"
        : product === "other"
          ? "Otro producto"
          : "No seleccionado";

  const tratamientosLabels: Record<string, string> = {
    film_aromatizado: "Film aromatizado",
    oxobiodegradable: "Oxobiodegradable",
    perforada: "Perforada",
    precorte: "Precorte",
  };

  const prioridadLabels: Record<string, string> = {
    baja: "Baja",
    normal: "Normal",
    alta: "Alta",
    urgente: "Urgente",
  };

  const materialLabels: Record<string, string> = {
    PEAD: "PEAD",
    PEBD: "PEBD",
    PP: "PP",
    BOPP: "BOPP",
    OTRO: "Otro",
  };

  const opacidadLabels: Record<string, string> = {
    alta: "Alta",
    media: "Media",
    baja: "Baja",
  };

  const tipoImpresionLabels: Record<string, string> = {
    corrida: "Corrida",
    dimensionada: "Dimensionada",
  };

  const tratamientoImpresionLabels: Record<string, string> = {
    solido: "Sólido",
    degradado: "Degradado",
    trameado: "Trameado",
  };

  const tipoTroquelLabels: Record<string, string> = {
    camiseta: "Camiseta",
    normal: "Normal",
    rinonera: "Riñonera",
    con_asa: "Con asa",
    refuerzo: "Refuerzo",
    solapa: "Solapa",
    adhesiva: "Adhesiva",
    cierre_facil: "Cierre fácil",
  };

  const tipoSelloLabels: Record<string, string> = {
    lateral: "Lateral",
    fondo: "Fondo",
    ninguno: "Ninguno",
  };

  

  const getLabel = (
    value: string,
    labels: Record<string, string>,
  ) => {
    return labels[value] || value;
  };

  const formatDate = (value: string) => {
    if (!value) return "—";

    const parts = value.split("-");

    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    return value;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">

      {/* ENCABEZADO */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground">
              Confirmar requerimiento
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Revisa la información antes de registrar la
              solicitud.
            </p>
          </div>
        </div>
      </div>

      {/* FICHA PRINCIPAL */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

        {/* CLIENTE */}
        <InfoGroup
          icon={<UserRound className="h-4 w-4" />}
          title="Cliente"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              label="Cliente"
              value={nombreCliente}
            />

            <InfoItem
              label="Documento"
              value={cuentaSeleccionada?.numero_documento}
            />

            <InfoItem
              label="Teléfono"
              value={cuentaSeleccionada?.telefono}
            />

            <InfoItem
              label="Correo"
              value={cuentaSeleccionada?.correo}
            />
          </div>
        </InfoGroup>

        {/* SOLICITUD */}
        <InfoGroup
          icon={<Package className="h-4 w-4" />}
          title="Solicitud"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <InfoItem
              label="Producto"
              value={nombreProducto}
            />

            <InfoItem
              label="Unidades"
              value={
                cantidadUnidades
                  ? `${cantidadUnidades} unidades`
                  : "—"
              }
            />

            <InfoItem
              label="Cantidad"
              value={
                cantidadKg
                  ? `${cantidadKg} kg`
                  : "—"
              }
            />

            <InfoItem
              label="Prioridad"
              value={getLabel(
                prioridad,
                prioridadLabels,
              )}
            />

            <InfoItem
              label="Fecha"
              value={formatDate(fechaEntrega)}
            />
          </div>
        </InfoGroup>

        {/* ESPECIFICACIONES */}
        <InfoGroup
          icon={<Palette className="h-4 w-4" />}
          title="Especificaciones técnicas"
        >
          <div className="space-y-6">

            {/* MATERIAL */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Material y apariencia
              </p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoItem
                  label="Material"
                  value={getLabel(
                    material,
                    materialLabels,
                  )}
                />

                <InfoItem
                  label="Apto para alimentos"
                  value={aptoAlimento ? "Sí" : "No"}
                />

                <InfoItem
                  label="Micraje"
                  value={
                    micraje
                      ? `${micraje} micras`
                      : "—"
                  }
                />

                <InfoItem
                  label="Color"
                  value={colorBolsa}
                />

                <InfoItem
                  label="Opacidad"
                  value={getLabel(
                    opacidad,
                    opacidadLabels,
                  )}
                />
              </div>
            </div>

            {/* DIMENSIONES */}
            {(anchoDoblado ||
              anchoDesdoblado ||
              largoDoblado ||
              largoDesdoblado) && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Dimensiones
                </p>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoItem
                    label="Ancho doblado"
                    value={
                      anchoDoblado
                        ? `${anchoDoblado} cm`
                        : "—"
                    }
                  />

                  <InfoItem
                    label="Ancho desdoblado"
                    value={
                      anchoDesdoblado
                        ? `${anchoDesdoblado} cm`
                        : "—"
                    }
                  />

                  <InfoItem
                    label="Largo doblado"
                    value={
                      largoDoblado
                        ? `${largoDoblado} cm`
                        : "—"
                    }
                  />

                  <InfoItem
                    label="Largo desdoblado"
                    value={
                      largoDesdoblado
                        ? `${largoDesdoblado} cm`
                        : "—"
                    }
                  />
                </div>
              </div>
            )}

            {/* FUELLE */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Fuelle
              </p>

              {fuelle ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoItem
                    label="A"
                    value={
                      fuelleIzquierdo
                        ? `${fuelleIzquierdo} cm`
                        : "—"
                    }
                  />

                  <InfoItem
                    label="B"
                    value={
                      fuelleDerecho
                        ? `${fuelleDerecho} cm`
                        : "—"
                    }
                  />

                  <InfoItem
                    label="Inferior"
                    value={
                      fuelleInferior
                        ? `${fuelleInferior} cm`
                        : "—"
                    }
                  />

                  <InfoItem
                    label="Superior"
                    value={
                      fuelleSuperior
                        ? `${fuelleSuperior} cm`
                        : "—"
                    }
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sin fuelle
                </p>
              )}
            </div>

            {/* CONFIGURACIÓN DE BOLSA */}
            {(tipoTroquel ||
              tipoSello ||
              pestana) && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Configuración de bolsa
                </p>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoItem
                    label="Troquel"
                    value={getLabel(
                      tipoTroquel,
                      tipoTroquelLabels,
                    )}
                  />

                  <InfoItem
                    label="Sello"
                    value={getLabel(
                      tipoSello,
                      tipoSelloLabels,
                    )}
                  />

                  <InfoItem
                    label="Pestaña"
                    value={pestana}
                  />
                </div>
              </div>
            )}

            {/* IMPRESIÓN */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Impresión
              </p>

              {!impresion ? (
                <p className="text-sm text-muted-foreground">
                  Sin impresión
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoItem
                    label="Impresión"
                    value="Sí"
                  />

                  <InfoItem
                    label="Colores"
                    value={colorImpresion}
                  />

                  <InfoItem
                    label="Tipo"
                    value={getLabel(
                      tipoImpresion,
                      tipoImpresionLabels,
                    )}
                  />

                  <InfoItem
                    label="Tratamiento"
                    value={getLabel(
                      tratamientoImpresion,
                      tratamientoImpresionLabels,
                    )}
                  />
                </div>
              )}
            </div>

            {/* TRATAMIENTOS */}
            {tratamientosAcabadosEspeciales.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />

                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tratamientos y acabados
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tratamientosAcabadosEspeciales.map(
                    (tratamiento) => (
                      <span
                        key={tratamiento}
                        className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary"
                      >
                        {getLabel(
                          tratamiento,
                          tratamientosLabels,
                        )}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </InfoGroup>

        {/* ENTREGA */}
        {(fechaEntrega || lugarEntrega) && (
          <InfoGroup
            icon={<Truck className="h-4 w-4" />}
            title="Entrega"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem
                label="Fecha solicitada"
                value={formatDate(fechaEntrega)}
              />

              <InfoItem
                label="Lugar de entrega"
                value={lugarEntrega}
              />
            </div>
          </InfoGroup>
        )}

        {/* INFORMACIÓN ADICIONAL */}
        {(descripcion ||
          observaciones ||
          otrasCaracteristicas) && (
          <InfoGroup
            icon={<FileText className="h-4 w-4" />}
            title="Información adicional"
          >
            <div className="space-y-4">
              {descripcion && (
                <InfoText
                  label="Descripción"
                  value={descripcion}
                />
              )}

              {otrasCaracteristicas && (
                <InfoText
                  label="Otras características"
                  value={otrasCaracteristicas}
                />
              )}

              {observaciones && (
                <InfoText
                  label="Observaciones"
                  value={observaciones}
                />
              )}
            </div>
          </InfoGroup>
        )}
      </div>

      {/* CONFIRMACIÓN FINAL */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-5 w-5 text-primary" />
          </div>

          <div>
            <p className="font-medium text-foreground">
              Requerimiento listo para registrar
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Verifica que la información sea correcta.
              Al registrar el requerimiento, será enviado
              a revisión de viabilidad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


/* =====================================================
   COMPONENTES VISUALES AUXILIARES
===================================================== */

interface InfoGroupProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

function InfoGroup({
  icon,
  title,
  children,
}: InfoGroupProps) {
  return (
    <section className="border-b border-border px-5 py-5 last:border-b-0">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>

        <h4 className="text-sm font-semibold text-foreground">
          {title}
        </h4>
      </div>

      {children}
    </section>
  );
}


interface InfoItemProps {
  label: string;
  value?: ReactNode;
}

function InfoItem({
  label,
  value,
}: InfoItemProps) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-foreground">
        {value || "—"}
      </p>
    </div>
  );
}


interface InfoTextProps {
  label: string;
  value?: string;
}

function InfoText({
  label,
  value,
}: InfoTextProps) {
  if (!value) return null;

  return (
    <div>
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
        {value}
      </p>
    </div>
  );
}