import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
    ArrowLeft,
    Check,
    FileText,
    Package,
    Palette,
    Sparkles,
    Truck,
    UserRound,
    MessageCircle,
} from "lucide-react";

import { useSolicitudComercial } from "../comercial.hooks";
import { useProductosCategorias } from "@/features/productos/productos.hook";
import ComunicacionesModal from "@/features/comercial/components/ComunicacionModal";

export default function RequerimientoDetallePage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const solicitudId = Number(id);

    //MOSTRAR COMUNICACIÓN
    const [showComunicaciones, setShowComunicaciones] = useState(false);


    const { data, isLoading, isError } =
        useSolicitudComercial(solicitudId);

    const { data: categorias } = useProductosCategorias();

    /* ============================================================
       ESTADOS DE CARGA / ERROR
       ============================================================ */

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />

                    <p className="text-sm font-medium text-slate-500">
                        Cargando información…
                    </p>
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4">
                <div className="w-full max-w-md rounded-2xl border border-red-100 bg-red-50 p-8 text-center shadow-sm">
                    <p className="text-base font-semibold text-red-700">
                        No se pudo cargar la solicitud
                    </p>

                    <p className="mt-1 text-sm text-red-500">
                        Intenta nuevamente o regresa al listado.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    const {
        solicitud,
        cuentaComercial,
        especificacionProducto,
        especificacionBolsa,
        especificacionBobina,
    } = data;

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {/* ============================================================
                HEADER
               ============================================================ */}

            <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
                        aria-label="Volver"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Solicitud #{solicitud.id}
                        </p>

                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Detalle del Requerimiento
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setShowComunicaciones(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Ver comunicaciones
                    </button>

                    <EstadoBadge estado={solicitud.estado} />
                </div>
            </header>

            {/* ============================================================
                GRID PRINCIPAL
               ============================================================ */}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* ========================================================
                    CLIENTE
                   ======================================================== */}

                <InfoCard
                    icon={<UserRound className="h-5 w-5" />}
                    title="Información del Cliente"
                >
                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                        <InfoItem
                            label="Cliente"
                            value={
                                cuentaComercial?.tipo_persona === "juridica"
                                    ? cuentaComercial.razon_social
                                    : [
                                        cuentaComercial.nombres,
                                        cuentaComercial.apellido_paterno,
                                        cuentaComercial.apellido_materno,
                                    ]
                                        .filter(Boolean)
                                        .join(" ")
                            }
                        />

                        <InfoItem
                            label="Documento"
                            value={
                                cuentaComercial?.numero_documento ||
                                cuentaComercial?.documento_identidad
                            }
                        />

                        <InfoItem
                            label="Teléfono"
                            value={cuentaComercial?.telefono}
                        />

                        <InfoItem
                            label="Correo"
                            value={cuentaComercial?.correo}
                        />
                    </div>
                </InfoCard>

                {/* ========================================================
                    SOLICITUD
                   ======================================================== */}

                <InfoCard
                    icon={<FileText className="h-5 w-5" />}
                    title="Datos de la Solicitud"
                >
                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                        <InfoItem
                            label="Producto"
                            value={
                                categorias?.find(
                                    (categoria) =>
                                        categoria.id ===
                                        especificacionProducto?.categoria_producto,
                                )?.nombre ?? "—"
                            }
                        />

                        <InfoItem
                            label="Unidades"
                            value={
                                solicitud.cantidad_unidades
                                    ? `${solicitud.cantidad_unidades} unidades`
                                    : "—"
                            }
                        />

                        <InfoItem
                            label="Cantidad"
                            value={
                                solicitud.cantidad_kg
                                    ? `${solicitud.cantidad_kg} kg`
                                    : "—"
                            }
                        />

                        <InfoItem
                            label="Prioridad"
                            value={getPrioridadLabel(solicitud.prioridad)}
                        />

                        <InfoItem
                            label="Fecha"
                            value={formatDate(solicitud.fecha)}
                        />
                    </div>
                </InfoCard>

                {/* ========================================================
                    PRODUCTO
                   ======================================================== */}

                {especificacionProducto && (
                    <InfoCard
                        icon={<Package className="h-5 w-5" />}
                        title="Producto"
                    >
                        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                            <InfoItem
                                label="Material"
                                value={getMaterialLabel(
                                    especificacionProducto.material,
                                )}
                            />

                            <InfoItem
                                label="Apto para alimentos"
                                value={
                                    especificacionProducto.apto_alimento
                                        ? "Sí"
                                        : "No"
                                }
                            />

                            <InfoItem
                                label="Micraje"
                                value={
                                    especificacionProducto.micraje
                                        ? `${especificacionProducto.micraje} micras`
                                        : "—"
                                }
                            />

                            <InfoItem
                                label="Color"
                                value={especificacionProducto.color_bolsa}
                            />

                            <InfoItem
                                label="Opacidad"
                                value={getOpacidadLabel(
                                    especificacionProducto.opacidad,
                                )}
                            />
                        </div>
                    </InfoCard>
                )}

                {/* ========================================================
                    ESPECIFICACIONES
                   ======================================================== */}

                {especificacionProducto && (
                    <InfoCard
                        icon={<Palette className="h-5 w-5" />}
                        title="Especificaciones"
                    >
                        <div className="space-y-7">
                            {/* =================================================
                                DIMENSIONES DE BOLSA
                               ================================================= */}

                            {especificacionBolsa && (
                                <div>
                                    <SectionTitle>
                                        Dimensiones
                                    </SectionTitle>

                                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                                        <InfoItem
                                            label="Ancho doblado"
                                            value={
                                                especificacionBolsa.ancho_doblado
                                                    ? `${especificacionBolsa.ancho_doblado} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Ancho desdoblado"
                                            value={
                                                especificacionBolsa.ancho_desdoblado
                                                    ? `${especificacionBolsa.ancho_desdoblado} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Largo doblado"
                                            value={
                                                especificacionBolsa.largo_doblado
                                                    ? `${especificacionBolsa.largo_doblado} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Largo desdoblado"
                                            value={
                                                especificacionBolsa.largo_desdoblado
                                                    ? `${especificacionBolsa.largo_desdoblado} cm`
                                                    : "—"
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            {/* =================================================
                                FUELLE
                               ================================================= */}

                            {especificacionBolsa && (
                                <div>
                                    <SectionTitle>Fuelle</SectionTitle>

                                    {especificacionBolsa.fuelle ? (
                                        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                                            <InfoItem
                                                label="Izquierdo"
                                                value={
                                                    especificacionBolsa.fuelle_izquierdo
                                                        ? `${especificacionBolsa.fuelle_izquierdo} cm`
                                                        : "—"
                                                }
                                            />

                                            <InfoItem
                                                label="Derecho"
                                                value={
                                                    especificacionBolsa.fuelle_derecho
                                                        ? `${especificacionBolsa.fuelle_derecho} cm`
                                                        : "—"
                                                }
                                            />

                                            <InfoItem
                                                label="Inferior"
                                                value={
                                                    especificacionBolsa.fuelle_inferior
                                                        ? `${especificacionBolsa.fuelle_inferior} cm`
                                                        : "—"
                                                }
                                            />

                                            <InfoItem
                                                label="Superior"
                                                value={
                                                    especificacionBolsa.fuelle_superior
                                                        ? `${especificacionBolsa.fuelle_superior} cm`
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
                            )}

                            {/* =================================================
                                CONFIGURACIÓN DE BOLSA
                               ================================================= */}

                            {especificacionBolsa && (
                                <div>
                                    <SectionTitle>
                                        Configuración de bolsa
                                    </SectionTitle>

                                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                                        <InfoItem
                                            label="Troquel"
                                            value={getTroquelLabel(
                                                especificacionBolsa.tipo_troquel,
                                            )}
                                        />

                                        <InfoItem
                                            label="Sello"
                                            value={getSelloLabel(
                                                especificacionBolsa.tipo_sello,
                                            )}
                                        />

                                        <InfoItem
                                            label="Pestaña"
                                            value={especificacionBolsa.pestana}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* =================================================
                                BOBINA
                               ================================================= */}

                            {especificacionBobina && (
                                <div>
                                    <SectionTitle>
                                        Características de bobina
                                    </SectionTitle>

                                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                                        <InfoItem
                                            label="Ancho"
                                            value={
                                                especificacionBobina.ancho
                                                    ? `${especificacionBobina.ancho} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Diámetro"
                                            value={
                                                especificacionBobina.diametro
                                                    ? `${especificacionBobina.diametro} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Diámetro núcleo"
                                            value={
                                                especificacionBobina.diametro_nucleo
                                                    ? `${especificacionBobina.diametro_nucleo} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Peso"
                                            value={
                                                especificacionBobina.peso
                                                    ? `${especificacionBobina.peso} kg`
                                                    : "—"
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            {/* =================================================
                                IMPRESIÓN
                               ================================================= */}

                            <div>
                                <SectionTitle>Impresión</SectionTitle>

                                {!especificacionProducto.impresion ? (
                                    <p className="text-sm text-muted-foreground">
                                        Sin impresión
                                    </p>
                                ) : (
                                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                                        <InfoItem
                                            label="Impresión"
                                            value="Sí"
                                        />

                                        <InfoItem
                                            label="Colores"
                                            value={
                                                especificacionProducto
                                                    .color_impresion?.length
                                                    ? especificacionProducto.color_impresion.join(
                                                        ", ",
                                                    )
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Tipo"
                                            value={getTipoImpresionLabel(
                                                especificacionProducto.tipo_impresion,
                                            )}
                                        />

                                        <InfoItem
                                            label="Posición"
                                            value={getPosicionLabel(
                                                especificacionProducto.posicion_impresion,
                                            )}
                                        />

                                        <InfoItem
                                            label="Distancia superior"
                                            value={
                                                especificacionProducto.distancia_impresion_superior
                                                    ? `${especificacionProducto.distancia_impresion_superior} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Distancia inferior"
                                            value={
                                                especificacionProducto.distancia_impresion_inferior
                                                    ? `${especificacionProducto.distancia_impresion_inferior} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Distancia izquierda"
                                            value={
                                                especificacionProducto.distancia_impresion_izquierda
                                                    ? `${especificacionProducto.distancia_impresion_izquierda} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Distancia derecha"
                                            value={
                                                especificacionProducto.distancia_impresion_derecha
                                                    ? `${especificacionProducto.distancia_impresion_derecha} cm`
                                                    : "—"
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            {/* =================================================
                                TRATAMIENTOS
                               ================================================= */}

                            {especificacionProducto
                                .tratamientos_acabados_especiales?.length >
                                0 && (
                                    <div>
                                        <div className="mb-4 flex items-center gap-3">
                                            <Sparkles className="h-4 w-4 text-primary" />

                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                Tratamientos y acabados
                                            </p>

                                            <div className="h-px flex-1 bg-border" />
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {especificacionProducto.tratamientos_acabados_especiales.map(
                                                (tratamiento: string) => (
                                                    <span
                                                        key={tratamiento}
                                                        className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary"
                                                    >
                                                        {getTratamientoLabel(
                                                            tratamiento,
                                                        )}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* =================================================
                                OTRAS CARACTERÍSTICAS
                               ================================================= */}

                            {especificacionProducto.otras_caracteristicas && (
                                <InfoText
                                    label="Otras características"
                                    value={
                                        especificacionProducto.otras_caracteristicas
                                    }
                                />
                            )}
                        </div>
                    </InfoCard>
                )}

                {/* ========================================================
                    ENTREGA
                   ======================================================== */}

                <InfoCard
                    icon={<Truck className="h-5 w-5" />}
                    title="Entrega"
                    className="lg:col-span-2"
                >
                    <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                        <InfoItem
                            label="Fecha solicitada"
                            value={formatDate(solicitud.fecha_entrega)}
                        />

                        <InfoItem
                            label="Lugar de entrega"
                            value={solicitud.lugar_entrega || "—"}
                        />
                    </div>
                </InfoCard>

                {/* ========================================================
                    INFORMACIÓN ADICIONAL
                   ======================================================== */}

                <InfoCard
                    icon={<FileText className="h-5 w-5" />}
                    title="Información adicional"
                    className="lg:col-span-2"
                >
                    <div className="grid gap-6 lg:grid-cols-2">
                        <InfoText
                            label="Descripción"
                            value={solicitud.descripcion}
                        />

                        <InfoText
                            label="Observaciones"
                            value={solicitud.observaciones}
                        />
                    </div>
                </InfoCard>
            </div>

            {/* ============================================================
                FOOTER
               ============================================================ */}

            <footer className="mt-10 flex flex-col-reverse items-stretch gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Regresar
                </button>
            </footer>

            {showComunicaciones && (
                <ComunicacionesModal
                    open={showComunicaciones}
                    solicitudId={solicitudId}
                    onClose={() => setShowComunicaciones(false)}

                />
            )}
        </div>
    );
}

/* ============================================================
   COMPONENTES AUXILIARES
   ============================================================ */

function InfoCard({
    icon,
    title,
    children,
    className = "",
}: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section
            className={`rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md ${className}`}
        >
            <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                    {icon}
                </span>

                <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    {title}
                </h2>
            </div>

            {children}
        </section>
    );
}

interface InfoItemProps {
    label: string;
    value?: React.ReactNode;
}

function InfoItem({
    label,
    value,
}: InfoItemProps) {
    return (
        <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {label}
            </p>

            <p className="mt-1.5 min-h-5 break-words text-sm font-medium leading-5 text-foreground">
                {value || "—"}
            </p>
        </div>
    );
}

function InfoText({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    if (!value) return null;

    return (
        <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {label}
            </p>

            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                {value}
            </p>
        </div>
    );
}

function SectionTitle({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="mb-4 flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {children}
            </p>

            <div className="h-px flex-1 bg-border" />
        </div>
    );
}

/* ============================================================
   ESTADO
   ============================================================ */

function EstadoBadge({
    estado,
}: {
    estado: string;
}) {
    const estados: Record<
        string,
        {
            label: string;
            className: string;
        }
    > = {
        recibida: {
            label: "Recibida",
            className:
                "bg-blue-500/10 text-blue-700 dark:text-blue-400",
        },

        en_negociacion: {
            label: "En negociación",
            className: "bg-warning/10 text-warning",
        },

        en_viabilidad: {
            label: "En viabilidad",
            className:
                "bg-secondary text-secondary-foreground",
        },

        aprobada: {
            label: "Aprobada",
            className: "bg-success/10 text-success",
        },

        rechazada: {
            label: "Rechazada",
            className:
                "bg-destructive/10 text-destructive",
        },

        convertida: {
            label: "Convertida",
            className:
                "bg-sidebar/10 text-sidebar-foreground",
        },

        cancelada: {
            label: "Cancelada",
            className:
                "bg-muted text-muted-foreground",
        },
    };

    const config = estados[estado] ?? {
        label: estado,
        className: "bg-muted text-muted-foreground",
    };

    return (
        <span
            className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${config.className}`}
        >
            <Check className="h-3.5 w-3.5" />
            {config.label}
        </span>
    );
}

/* ============================================================
   LABELS
   ============================================================ */

function getPrioridadLabel(value: string) {
    const labels: Record<string, string> = {
        baja: "Baja",
        normal: "Normal",
        alta: "Alta",
        urgente: "Urgente",
    };

    return labels[value] ?? value;
}

function getMaterialLabel(value: string) {
    const labels: Record<string, string> = {
        PEAD: "PEAD",
        PEBD: "PEBD",
        PP: "PP",
        BOPP: "BOPP",
        OTRO: "Otro",
    };

    return labels[value] ?? value;
}

function getOpacidadLabel(value: string) {
    const labels: Record<string, string> = {
        alta: "Alta",
        media: "Media",
        baja: "Baja",
    };

    return labels[value] ?? (value || "—");
}

function getTipoImpresionLabel(value: string) {
    const labels: Record<string, string> = {
        corrida: "Corrida",
        dimensionada: "Dimensionada",
    };

    return labels[value] ?? value;
}

function getPosicionLabel(value: string) {
    const labels: Record<string, string> = {
        centrada: "Centrada",
        personalizada: "Personalizada",
    };

    return labels[value] ?? value;
}

function getTratamientoLabel(value: string) {
    const labels: Record<string, string> = {
        film_aromatizado: "Film aromatizado",
        oxobiodegradable: "Oxobiodegradable",
        perforada: "Perforada",
        precorte: "Precorte",
    };

    return labels[value] ?? value;
}

function getTroquelLabel(value: string) {
    const labels: Record<string, string> = {
        camiseta: "Camiseta",
        normal: "Normal",
        rinonera: "Riñonera",
        con_asa: "Con asa",
        refuerzo: "Refuerzo",
        solapa: "Solapa",
        adhesiva: "Adhesiva",
        cierre_facil: "Cierre fácil",
    };

    return labels[value] ?? (value || "—");
}

function getSelloLabel(value: string) {
    const labels: Record<string, string> = {
        lateral: "Lateral",
        fondo: "Fondo",
        ninguno: "Ninguno",
    };

    return labels[value] ?? (value || "—");
}

function formatDate(value?: string | null) {
    if (!value) return "—";

    const parts = value.split("T")[0].split("-");

    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    return value;
}