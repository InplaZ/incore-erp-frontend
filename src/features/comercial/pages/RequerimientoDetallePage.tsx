import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Check,
    FileText,
    Package,
    Palette,
    Sparkles,
    Truck,
    UserRound,
} from "lucide-react";

import { useSolicitudComercial } from "../comercial.hooks";
import { useProductosCategorias } from "@/features/productos/productos.hook";

export default function RequerimientoDetallePage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const solicitudId = Number(id);

    const { data, isLoading, isError } =
        useSolicitudComercial(solicitudId);

        console.log("DATA DETALLE:", data);

    const { data: categorias } = useProductosCategorias();

    if (isLoading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Cargando requerimiento...
                </p>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="space-y-4">
                <button
                    type="button"
                    onClick={() =>
                        navigate("/comercial/requerimientos")
                    }
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a requerimientos
                </button>

                <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <p className="font-medium">
                        No se pudo encontrar el requerimiento.
                    </p>
                </div>
            </div>
        );
    }

    const {
        solicitud,
        especificacionProducto,
        especificacionBolsa,
        especificacionBobina,
    } = data;

    return (
        <div className="mx-auto max-w-5xl space-y-5">
            {/* ENCABEZADO */}

            <div className="rounded-xl border border-border bg-card p-5">
                <button
                    type="button"
                    onClick={() =>
                        navigate("/comercial/requerimientos")
                    }
                    className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a requerimientos
                </button>

                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Check className="h-5 w-5 text-primary" />
                        </div>

                        <div>
                            <h1 className="text-xl font-semibold text-foreground">
                                Requerimiento #{solicitud.id}
                            </h1>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Detalle del requerimiento comercial
                            </p>
                        </div>
                    </div>

                    <EstadoBadge estado={solicitud.estado} />
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
                            value={`Cuenta #${solicitud.cuenta_comercial}`}
                        />

                        <InfoItem
                            label="Documento"
                            value="—"
                        />

                        <InfoItem
                            label="Teléfono"
                            value="—"
                        />

                        <InfoItem
                            label="Correo"
                            value="—"
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
                </InfoGroup>

                {/* ESPECIFICACIONES */}

                {especificacionProducto && (
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

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                                        value={
                                            especificacionProducto.color_bolsa
                                        }
                                    />

                                    <InfoItem
                                        label="Opacidad"
                                        value={
                                            getOpacidadLabel(
                                                especificacionProducto.opacidad,
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* DIMENSIONES DE BOLSA */}

                            {especificacionBolsa && (
                                <>
                                    <div>
                                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Dimensiones
                                        </p>

                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

                                    {/* FUELLE */}

                                    <div>
                                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Fuelle
                                        </p>

                                        {especificacionBolsa.fuelle ? (
                                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

                                    {/* CONFIGURACIÓN DE BOLSA */}

                                    <div>
                                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Configuración de bolsa
                                        </p>

                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                                                value={
                                                    especificacionBolsa.pestana
                                                }
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* BOBINA */}

                            {especificacionBobina && (
                                <div>
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Características de bobina
                                    </p>

                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

                            {/* IMPRESIÓN */}

                            <div>
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Impresión
                                </p>

                                {!especificacionProducto.impresion ? (
                                    <p className="text-sm text-muted-foreground">
                                        Sin impresión
                                    </p>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                                                especificacionProducto
                                                    .distancia_impresion_superior
                                                    ? `${especificacionProducto.distancia_impresion_superior} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Distancia inferior"
                                            value={
                                                especificacionProducto
                                                    .distancia_impresion_inferior
                                                    ? `${especificacionProducto.distancia_impresion_inferior} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Distancia izquierda"
                                            value={
                                                especificacionProducto
                                                    .distancia_impresion_izquierda
                                                    ? `${especificacionProducto.distancia_impresion_izquierda} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Distancia derecha"
                                            value={
                                                especificacionProducto
                                                    .distancia_impresion_derecha
                                                    ? `${especificacionProducto.distancia_impresion_derecha} cm`
                                                    : "—"
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            {/* TRATAMIENTOS */}

                            {especificacionProducto
                                .tratamientos_acabados_especiales?.length >
                                0 && (
                                    <div>
                                        <div className="mb-3 flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-primary" />

                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Tratamientos y acabados
                                            </p>
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

                            {/* OTRAS CARACTERÍSTICAS */}

                            {especificacionProducto.otras_caracteristicas && (
                                <InfoText
                                    label="Otras características"
                                    value={
                                        especificacionProducto.otras_caracteristicas
                                    }
                                />
                            )}
                        </div>
                    </InfoGroup>
                )}

                {/* ENTREGA */}

                <InfoGroup
                    icon={<Truck className="h-4 w-4" />}
                    title="Entrega"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <InfoItem
                            label="Fecha solicitada"
                            value={formatDate(
                                solicitud.fecha_entrega,
                            )}
                        />

                        <InfoItem
                            label="Lugar de entrega"
                            value={
                                solicitud.lugar_entrega || "—"
                            }
                        />
                    </div>
                </InfoGroup>

                {/* INFORMACIÓN ADICIONAL */}

                <InfoGroup
                    icon={<FileText className="h-4 w-4" />}
                    title="Información adicional"
                >
                    <div className="space-y-4">
                        <InfoText
                            label="Descripción"
                            value={solicitud.descripcion}
                        />

                        <InfoText
                            label="Observaciones"
                            value={solicitud.observaciones}
                        />
                    </div>
                </InfoGroup>
            </div>
        </div>
    );
}

/* =====================================================
   COMPONENTES VISUALES
===================================================== */

interface InfoGroupProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
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

                <h2 className="text-sm font-semibold text-foreground">
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
    value?: string | null;
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

/* =====================================================
   ESTADO
===================================================== */

function EstadoBadge({
    estado,
}: {
    estado: string;
}) {
    const estados: Record<
        string,
        { label: string; className: string }
    > = {
        recibida: {
            label: "Recibida",
            className:
                "bg-blue-500/10 text-blue-700 dark:text-blue-400",
        },
        en_negociacion: {
            label: "En negociación",
            className:
                "bg-warning/10 text-warning",
        },
        en_viabilidad: {
            label: "En viabilidad",
            className:
                "bg-secondary text-secondary-foreground",
        },
        aprobada: {
            label: "Aprobada",
            className:
                "bg-success/10 text-success",
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
            className={`inline-flex rounded-full px-3 py-1.5 text-sm font-medium ${config.className}`}
        >
            {config.label}
        </span>
    );
}

/* =====================================================
   LABELS
===================================================== */

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
};
