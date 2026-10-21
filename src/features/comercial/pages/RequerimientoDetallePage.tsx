import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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
    Pencil,
} from "lucide-react";

import { useSolicitudComercial, useCrearCotizacionVersion } from "../comercial.hooks";
import { useProductosCategorias } from "@/features/productos/productos.hooks";
import ComunicacionesModal from "@/features/comercial/components/ComunicacionModal";
import EditarRequerimientoModal from "@/features/comercial/components/EditarRequerimientoModal";
import { api } from "@/api/api.config";

interface LineaEdicionForm {
    cantidad: string;
    precio_lista: string;
    descuento_porcentaje: string;
    unidad_comercial: string;
    peso_kg: string;
    motivo_cambio: string;
    ancho_doblado: string;
    ancho_desdoblado: string;
    largo_doblado: string;
    largo_desdoblado: string;
    ancho_bobina: string;
    tecnica: Record<string, string | boolean | string[]>;
}

export default function RequerimientoDetallePage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const solicitudId = Number(id);

    //MOSTRAR COMUNICACIÓN
    const [showComunicaciones, setShowComunicaciones] = useState(false);

    //MOSTRAR EDICIÓN
    const [showEditar, setShowEditar] = useState(false);
    const [lineaSeleccionadaId, setLineaSeleccionadaId] = useState<number | null>(null);
    const [lineaEditandoId, setLineaEditandoId] = useState<number | null>(null);
    const [formLinea, setFormLinea] = useState<LineaEdicionForm | null>(null);
    const [guardandoLinea, setGuardandoLinea] = useState(false);
    const [calculandoPeso, setCalculandoPeso] = useState(false);
    const crearVersionCotizacion = useCrearCotizacionVersion();
    const cantidadPeso = formLinea?.cantidad;
    const materialPeso = formLinea?.tecnica.material;
    const micrajePeso = formLinea?.tecnica.micraje;
    const anchoBolsaPeso = formLinea?.tecnica["especificacion_bolsa.ancho_doblado"];
    const anchoDesdobladoBolsaPeso = formLinea?.tecnica["especificacion_bolsa.ancho_desdoblado"];
    const largoBolsaPeso = formLinea?.tecnica["especificacion_bolsa.largo_doblado"];
    const anchoBobinaPeso = formLinea?.tecnica["especificacion_bobina.ancho"];
    const metrosBobinaPeso = formLinea?.tecnica["especificacion_bobina.longitud"];

    useEffect(() => {
        if (!lineaEditandoId || cantidadPeso == null) return;
        let vigente = true;
        const temporizador = window.setTimeout(async () => {
            setCalculandoPeso(true);
            const datosEspecificacion = {
                material: materialPeso || undefined,
                micraje: micrajePeso || undefined,
                especificacion_bolsa: {
                    ancho_doblado: anchoBolsaPeso || undefined,
                    ancho_desdoblado: anchoDesdobladoBolsaPeso || undefined,
                    largo_doblado: largoBolsaPeso || undefined,
                },
                especificacion_bobina: {
                    ancho: anchoBobinaPeso || undefined,
                    longitud: metrosBobinaPeso || undefined,
                },
            };
            try {
                const resultado = await api.post<{ peso_kg: string | null }>(
                    `/comercial/cotizaciones-detalles/${lineaEditandoId}/calcular-peso/`,
                    { cantidad: cantidadPeso, datos_especificacion: datosEspecificacion },
                );
                if (vigente) setFormLinea((actual) => actual ? { ...actual, peso_kg: resultado.peso_kg ?? "" } : actual);
            } catch (error) {
                if (vigente) console.error("No se pudo calcular el peso de la línea", error);
            } finally {
                if (vigente) setCalculandoPeso(false);
            }
        }, 250);
        return () => {
            vigente = false;
            window.clearTimeout(temporizador);
        };
    }, [
        lineaEditandoId,
        cantidadPeso,
        materialPeso,
        micrajePeso,
        anchoBolsaPeso,
        anchoDesdobladoBolsaPeso,
        largoBolsaPeso,
        anchoBobinaPeso,
        metrosBobinaPeso,
    ]);


    const { data, isLoading, isError } =
        useSolicitudComercial(solicitudId);

    const { data: categorias } = useProductosCategorias();

    //IMPRIMIR

    const handleImprimir = async () => {
        try {
            const pdfBlob = await api.get<Blob>(
                `/comercial/solicitudes/${solicitudId}/pdf/`,
                {
                    config: {
                        responseType: "blob",
                    },
                }
            );

            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, "_blank");

        } catch (error) {
            console.error("Error al generar el PDF:", error);
            alert("No se pudo generar la orden de producción.");
        }
    };


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

    const productoCotizado = (data.productosCotizados ?? []).find(
        (linea) => linea.cotizacionDetalle.id === lineaSeleccionadaId,
    ) ?? data.productosCotizados?.[0] ?? null;
    const versionesCotizacion = Array.from(new Map(
        (data.productosCotizados ?? []).map((linea) => [linea.cotizacionVersion.id, linea.cotizacionVersion]),
    ).values()).sort((a, b) => b.version - a.version);
    const versionEnviada = versionesCotizacion.find((version) => version.estado === "enviada");
    const productoVersion = productoCotizado?.productoVersion ?? null;
    const especificacionVersionada = productoCotizado?.especificacionProductoSolicitadoVersion ?? null;
    const variantesColorSolicitadas =
        especificacionProducto?.variantes_color ?? [];
    const bolsaMostrar =
        especificacionVersionada?.especificacionBolsa ?? especificacionBolsa ?? productoCotizado?.especificacionBolsa ?? null;
    const bobinaMostrar =
        especificacionVersionada?.especificacionBobina ?? especificacionBobina ?? productoCotizado?.especificacionBobina ?? null;
    const datosTecnicos = especificacionVersionada ?? (productoVersion
            ? {
                material: productoVersion.material,
                apto_alimento: productoVersion.apto_alimento,
                micraje: productoVersion.micraje,
                color_bolsa: productoVersion.color_bolsa,
                opacidad: "",
                capas: productoVersion.capas ?? "",
                cara_impresion: productoVersion.cara_impresion ?? "",
                impresion: productoVersion.impresion,
                color_impresion: productoVersion.color_impresion,
                tipo_impresion: productoVersion.tipo_impresion,
                tratamiento_impresion: productoVersion.tratamiento_impresion ?? "",
                posicion_impresion: "",
                distancia_impresion_superior: null,
                distancia_impresion_inferior: null,
                distancia_impresion_izquierda: null,
                distancia_impresion_derecha: null,
                variantes_color: [],
                tratamientos_acabados_especiales: [],
                otras_caracteristicas:
                    productoCotizado?.especificacionBolsa?.otras_caracteristicas ??
                    productoCotizado?.especificacionBobina?.otras_caracteristicas ??
                    "",
            }
            : productoCotizado ? null : especificacionProducto);
    const categoriaProducto = productoCotizado?.categoria?.nombre ??
        categorias?.find(
            (categoria) => categoria.id === (especificacionVersionada?.categoria_producto ?? especificacionProducto?.categoria_producto),
        )?.nombre ?? "—";

    const iniciarEdicionLinea = (linea: NonNullable<typeof data.productosCotizados>[number]) => {
        const versionTecnica = linea.especificacionProductoSolicitadoVersion;
        const tecnica: Record<string, string | boolean | string[]> = {};
        if (versionTecnica) {
            for (const [campo, valor] of Object.entries(versionTecnica)) {
                if (campo !== "especificacionBolsa" && campo !== "especificacionBobina" && campo !== "id" && campo !== "version" && campo !== "especificacion_producto_solicitado" && campo !== "categoria_producto") {
                    tecnica[campo] = Array.isArray(valor) ? valor.join(", ") : (valor as string | boolean | null) ?? "";
                }
            }
            for (const [grupo, valores] of [["especificacion_bolsa", versionTecnica.especificacionBolsa], ["especificacion_bobina", versionTecnica.especificacionBobina]] as const) {
                if (valores) Object.entries(valores).forEach(([campo, valor]) => { tecnica[`${grupo}.${campo}`] = typeof valor === "boolean" ? valor : valor == null ? "" : String(valor); });
            }
        }
        setLineaSeleccionadaId(linea.cotizacionDetalle.id);
        setLineaEditandoId(linea.cotizacionDetalle.id);
        setCalculandoPeso(false);
        setFormLinea({
            cantidad: String(linea.cotizacionDetalle.cantidad),
            precio_lista: String(linea.cotizacionDetalle.precio_lista ?? ""),
            descuento_porcentaje: String(linea.cotizacionDetalle.descuento_porcentaje ?? "0"),
            unidad_comercial: linea.cotizacionDetalle.unidad_comercial || "unidad",
            peso_kg: String(linea.cotizacionDetalle.peso_kg ?? ""),
            motivo_cambio: "Cambio solicitado por el cliente",
            ancho_doblado: String(versionTecnica?.especificacionBolsa?.ancho_doblado ?? ""),
            ancho_desdoblado: String(versionTecnica?.especificacionBolsa?.ancho_desdoblado ?? ""),
            largo_doblado: String(versionTecnica?.especificacionBolsa?.largo_doblado ?? ""),
            largo_desdoblado: String(versionTecnica?.especificacionBolsa?.largo_desdoblado ?? ""),
            ancho_bobina: String(versionTecnica?.especificacionBobina?.ancho ?? ""),
            tecnica,
        });
    };

    const guardarEdicionLinea = async (linea: NonNullable<typeof data.productosCotizados>[number]) => {
        if (!formLinea) return;
        const versionTecnica = linea.especificacionProductoSolicitadoVersion;
        const bolsa = versionTecnica?.especificacionBolsa;
        const bobina = versionTecnica?.especificacionBobina;
        const datosEspecificacion: Record<string, unknown> = {};
        if (versionTecnica) {
            const base: Record<string, unknown> = { ...versionTecnica };
            if (bolsa) base.especificacion_bolsa = bolsa;
            if (bobina) base.especificacion_bobina = bobina;
            const normalizar = (valor: unknown) => Array.isArray(valor) ? valor.join(", ") : valor == null ? "" : String(valor);
            for (const [clave, valor] of Object.entries(formLinea.tecnica)) {
                const separador = clave.indexOf(".");
                const grupo = separador >= 0 ? clave.slice(0, separador) : null;
                const campo = separador >= 0 ? clave.slice(separador + 1) : clave;
                const original = grupo ? (base[grupo] as Record<string, unknown> | null)?.[campo] : base[campo];
                if (normalizar(valor) === normalizar(original)) continue;
                const convertido = Array.isArray(original) && typeof valor === "string"
                    ? valor.split(",").map((item) => item.trim()).filter(Boolean)
                    : typeof original === "boolean" ? valor === true || valor === "true" : valor === "" ? null : valor;
                if (grupo) {
                    (datosEspecificacion[grupo] as Record<string, unknown> | undefined) ??= {};
                    (datosEspecificacion[grupo] as Record<string, unknown>)[campo] = convertido;
                } else datosEspecificacion[campo] = convertido;
            }
        }
        const hayCambioTecnico = Object.keys(datosEspecificacion).length > 0;

        setGuardandoLinea(true);
        try {
            await api.patch(`/comercial/cotizaciones-detalles/${linea.cotizacionDetalle.id}/editar-version/`, {
                cantidad: formLinea.cantidad,
                precio_lista: formLinea.precio_lista,
                descuento_porcentaje: formLinea.descuento_porcentaje,
                unidad_comercial: formLinea.unidad_comercial,
                motivo_cambio: formLinea.motivo_cambio,
                ...(hayCambioTecnico ? { datos_especificacion: datosEspecificacion } : {}),
            });
            window.location.reload();
        } catch (error) {
            console.error("No se pudo guardar la modificación de la línea", error);
            alert("No se pudo guardar. Verifica la viabilidad de la nueva medida y que la versión esté en borrador.");
        } finally {
            setGuardandoLinea(false);
        }
    };

    const actualizarTecnica = (campo: string, valor: string | boolean) => {
        if (!formLinea) return;
        setFormLinea({ ...formLinea, tecnica: { ...formLinea.tecnica, [campo]: valor } });
    };
    const campoTecnico = (campo: string, etiqueta: string, opciones?: string[]) => {
        if (!formLinea) return null;
        const valor = formLinea.tecnica[campo] ?? "";
        if (typeof valor === "boolean") return <label key={campo} className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={valor} onChange={(event) => actualizarTecnica(campo, event.target.checked)} />{etiqueta}</label>;
        return <label key={campo} className="text-xs text-muted-foreground">{etiqueta}{opciones ? <select value={String(valor)} onChange={(event) => actualizarTecnica(campo, event.target.value)} className="mt-1 w-full rounded border border-border bg-background px-2 py-2 text-sm text-foreground"><option value="">—</option>{opciones.map((opcion) => <option key={opcion} value={opcion}>{opcion.replaceAll("_", " ")}</option>)}</select> : <input value={Array.isArray(valor) ? valor.join(", ") : String(valor)} onChange={(event) => actualizarTecnica(campo, event.target.value)} className="mt-1 w-full rounded border border-border bg-background px-2 py-2 text-sm text-foreground" />}</label>;
    };

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
                            <span>Solicitud #{solicitud.id}  </span>
                            <EstadoBadge estado={solicitud.estado} />
                        </p>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Detalle del Requerimiento
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setShowEditar(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
                    >
                        <Pencil className="h-4 w-4" />
                        Editar requerimiento
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowComunicaciones(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Ver comunicaciones
                    </button>
                {solicitud.estado == "aprobada" && (
                    <button
                        type="button"
                        onClick={handleImprimir}
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Imprimir
                    </button>
                )}
                </div>
            </header>

            {/* ============================================================
                GRID PRINCIPAL
               ============================================================ */}

            {versionesCotizacion.length > 0 && (
                <section className="mb-8 rounded-2xl border border-border bg-card p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold">Historial de cotizaciones</h2>
                            <p className="text-sm text-muted-foreground">Selecciona una línea para consultar su detalle. Las versiones anteriores conservan sus importes.</p>
                        </div>
                        {solicitud.estado !== "aprobada" && solicitud.estado !== "convertida" && !["aceptada", "borrador"].includes(versionesCotizacion[0].estado) && (
                            <button type="button" onClick={async () => {
                                const response = await crearVersionCotizacion.mutateAsync({ cotizacionId: versionesCotizacion[0].cotizacion, moneda: versionesCotizacion[0].moneda });
                                window.location.assign(`/comercial/requerimientos/${solicitudId}?version_preparada=${response.cotizacion_version}`);
                            }} disabled={crearVersionCotizacion.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
                                {crearVersionCotizacion.isPending ? "Preparando…" : "Preparar nueva versión para editar"}
                            </button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {versionesCotizacion.map((version) => {
                            const lineas = (data.productosCotizados ?? []).filter((linea) => linea.cotizacionVersion.id === version.id);
                            return <div key={version.id} className="rounded-xl border border-border p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold">{lineas[0]?.cotizacion.numero} · Versión {version.version}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(version.created_at).toLocaleDateString()} · {version.estado} · {version.moneda} {Number(version.precio_total).toFixed(2)}</p>
                                    </div>
                                    <button type="button" onClick={async () => {
                                        const blob = await api.get<Blob>(`/comercial/cotizaciones-versiones/${version.id}/pdf/`, { config: { responseType: "blob" } });
                                        window.open(URL.createObjectURL(blob), "_blank");
                                    }} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">Ver PDF</button>
                                </div>
                                <div className="mt-3 divide-y divide-border">
                                    {lineas.map((linea) => {
                                        const seleccionada = linea.cotizacionDetalle.id === lineaSeleccionadaId;
                                        const versionTecnica = linea.especificacionProductoSolicitadoVersion;
                                        return <div key={linea.cotizacionDetalle.id} className="border-b border-border last:border-0">
                                            <button
                                                type="button"
                                                aria-expanded={seleccionada}
                                                onClick={() => {
                                                    setLineaSeleccionadaId(linea.cotizacionDetalle.id);
                                                    if (lineaEditandoId !== linea.cotizacionDetalle.id) setLineaEditandoId(null);
                                                }}
                                                className={`flex w-full flex-wrap justify-between gap-2 py-3 text-left text-sm ${seleccionada ? "text-primary" : "hover:text-primary"}`}
                                            >
                                                <span>{linea.producto?.nombre || `Producto solicitado · especificación #${versionTecnica?.id ?? "—"}`}{linea.producto?.codigo ? ` · ${linea.producto.codigo}` : " · Sin código definitivo"}</span>
                                                <span>{linea.cotizacionDetalle.cantidad} {linea.cotizacionDetalle.unidad_comercial} × {version.moneda} {Number(linea.cotizacionDetalle.precio_unitario).toFixed(2)} = {version.moneda} {Number(linea.cotizacionDetalle.precio_total).toFixed(2)}</span>
                                            </button>
                                            {seleccionada && (
                                                <div className="mb-3 rounded-lg bg-muted/30 p-3 text-sm">
                                                    <p className="font-medium">Detalle de línea · cotización {linea.cotizacion.numero}, versión {version.version}</p>
                                                    <p className="mt-1 text-muted-foreground">
                                                        {versionTecnica
                                                            ? `Especificación técnica V${versionTecnica.version} · ${versionTecnica.especificacionBolsa ? `ancho ${versionTecnica.especificacionBolsa.ancho_doblado} cm` : versionTecnica.especificacionBobina ? `ancho ${versionTecnica.especificacionBobina.ancho} cm` : "medidas no disponibles"}`
                                                            : `Versión de catálogo ${linea.productoVersion?.numero_version ?? "—"} · ${linea.producto?.codigo ?? ""}`}
                                                    </p>
                                                    {version.estado !== "borrador" && <p className="mt-2 text-xs text-muted-foreground">Esta versión es histórica y no se modifica. Prepara una nueva versión para registrar cambios.</p>}
                                                    {version.estado === "borrador" && (
                                                        <button type="button" onClick={() => iniciarEdicionLinea(linea)} className="mt-3 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-background">
                                                            Editar esta línea
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            {lineaEditandoId === linea.cotizacionDetalle.id && formLinea && version.estado === "borrador" && (
                                                <form onSubmit={(event) => { event.preventDefault(); void guardarEdicionLinea(linea); }} className="mb-4 space-y-4 rounded-lg border border-primary/30 bg-background p-4">
                                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                        <label className="text-xs text-muted-foreground">Cantidad<input required type="number" min="0.01" step="0.01" value={formLinea.cantidad} onChange={(event) => setFormLinea({ ...formLinea, cantidad: event.target.value })} className="mt-1 w-full rounded border border-border bg-background px-2 py-2 text-sm text-foreground" /></label>
                                                        <label className="text-xs text-muted-foreground">Precio lista<input required type="number" min="0" step="0.01" value={formLinea.precio_lista} onChange={(event) => setFormLinea({ ...formLinea, precio_lista: event.target.value })} className="mt-1 w-full rounded border border-border bg-background px-2 py-2 text-sm text-foreground" /></label>
                                                        <label className="text-xs text-muted-foreground">Descuento %<input required type="number" min="0" max="100" step="0.01" value={formLinea.descuento_porcentaje} onChange={(event) => setFormLinea({ ...formLinea, descuento_porcentaje: event.target.value })} className="mt-1 w-full rounded border border-border bg-background px-2 py-2 text-sm text-foreground" /></label>
                                                        <label className="text-xs text-muted-foreground">Unidad comercial<select required value={formLinea.unidad_comercial} onChange={(event) => setFormLinea({ ...formLinea, unidad_comercial: event.target.value })} className="mt-1 w-full rounded border border-border bg-background px-2 py-2 text-sm text-foreground"><option value="unidad">Unidad</option><option value="kg">Kilogramo</option><option value="bobina">Bobina</option><option value="fajo">Fajo</option><option value="metro">Metro</option></select></label>
                                                        <label className="text-xs text-muted-foreground">Peso total calculado (kg)<input type="number" step="0.001" value={formLinea.peso_kg} readOnly aria-readonly="true" placeholder={calculandoPeso ? "Calculando…" : "Sin datos para calcular"} className="mt-1 w-full rounded border border-border bg-muted px-2 py-2 text-sm text-foreground" /><span className="mt-1 block text-[11px]">{calculandoPeso ? "Actualizando cálculo…" : "Cálculo automático según material, medidas y cantidad."}</span></label>
                                                    </div>
                                                    {versionTecnica && <div className="space-y-4 rounded-lg border border-border p-3">
                                                        <p className="font-medium">Características técnicas · versión actual V{versionTecnica.version}</p>
                                                        <fieldset className="space-y-3"><legend className="mb-2 text-sm font-semibold">Material e impresión</legend><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                            {campoTecnico("material", "Material", ["PEAD", "PEBD", "PP", "BOPP", "OTRO"])}{campoTecnico("capas", "Capas", ["monocapa", "bicapa", "tricapa"])}{campoTecnico("apto_alimento", "Apto para alimentos")}{campoTecnico("micraje", "Micraje")}{campoTecnico("color_bolsa", "Color")}{campoTecnico("impresion", "Lleva impresión")}{campoTecnico("color_impresion", "Colores de impresión (separados por coma)")}{campoTecnico("tipo_impresion", "Tipo de impresión", ["corrida", "dimensionada"])}{campoTecnico("tratamiento_impresion", "Tratamiento de impresión", ["solido", "degradado", "trameado"])}{campoTecnico("cara_impresion", "Cara de impresión", ["anverso", "reverso", "ambas"])}{campoTecnico("posicion_impresion", "Posición", ["centrada", "personalizada"])}{campoTecnico("opacidad", "Opacidad", ["alta", "media", "baja"])}{campoTecnico("distancia_impresion_superior", "Distancia superior")}{campoTecnico("distancia_impresion_inferior", "Distancia inferior")}{campoTecnico("distancia_impresion_izquierda", "Distancia izquierda")}{campoTecnico("distancia_impresion_derecha", "Distancia derecha")}{campoTecnico("tratamientos_acabados_especiales", "Acabados especiales (separados por coma)")}{campoTecnico("otras_caracteristicas", "Otras características")}
                                                        </div></fieldset>
                                                        {versionTecnica.especificacionBolsa && <fieldset><legend className="mb-2 text-sm font-semibold">Bolsa · medidas y acabados</legend><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{["ancho_doblado", "ancho_desdoblado", "largo_doblado", "largo_desdoblado", "fuelle_izquierdo", "fuelle_derecho", "fuelle_inferior", "fuelle_superior"].map((campo) => campoTecnico(`especificacion_bolsa.${campo}`, `${campo.replaceAll("_", " ")} (cm)`))}{campoTecnico("especificacion_bolsa.fuelle", "Tiene fuelle")}{campoTecnico("especificacion_bolsa.tipo_troquel", "Tipo de troquel", ["camiseta", "normal", "rinonera", "con_asa", "refuerzo", "solapa", "adhesiva", "cierre_facil"])}{campoTecnico("especificacion_bolsa.tipo_sello", "Tipo de sello", ["lateral", "fondo", "ninguno"])}{campoTecnico("especificacion_bolsa.pestana", "Pestaña", ["sin_pestana", "superior", "inferior", "ambas"])}{campoTecnico("especificacion_bolsa.acabado_especial", "Acabado especial")}{campoTecnico("especificacion_bolsa.otras_caracteristicas", "Otras características de bolsa")}</div></fieldset>}
                                                        {versionTecnica.especificacionBobina && <fieldset><legend className="mb-2 text-sm font-semibold">Bobina · medidas</legend><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{["ancho", "diametro", "diametro_nucleo", "peso", "longitud"].map((campo) => campoTecnico(`especificacion_bobina.${campo}`, `${campo.replaceAll("_", " ")} (cm / kg según corresponda)`))}{campoTecnico("especificacion_bobina.tipo_nucleo", "Tipo de núcleo")}{campoTecnico("especificacion_bobina.otras_caracteristicas", "Otras características de bobina")}</div></fieldset>}
                                                        <p className="text-xs text-muted-foreground">Al guardar, las características modificadas crean una nueva versión técnica y vuelven a pasar por la evaluación de viabilidad. Los datos de esta versión quedarán en el historial.</p>
                                                    </div>}
                                                    {!versionTecnica && <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">Producto de catálogo: su versión técnica es de solo lectura. Para cambiar sus características debe generarse una solicitud de producto nuevo conforme al proceso comercial.</p>}
                                                    {versionTecnica && <label className="block max-w-xl text-xs text-muted-foreground">Motivo del cambio<input value={formLinea.motivo_cambio} onChange={(event) => setFormLinea({ ...formLinea, motivo_cambio: event.target.value })} className="mt-1 w-full rounded border border-border bg-background px-2 py-2 text-sm text-foreground" /></label>}
                                                    <div className="flex justify-end gap-2">
                                                        <button type="button" onClick={() => setLineaEditandoId(null)} className="rounded-md border border-border px-3 py-2 text-sm">Cancelar</button>
                                                        <button type="submit" disabled={guardandoLinea} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{guardandoLinea ? "Guardando…" : "Guardar cambios en esta versión"}</button>
                                                    </div>
                                                    {versionTecnica && <p className="text-xs text-muted-foreground">Si cambias medidas, el servidor crea una nueva versión técnica y evalúa su viabilidad antes de actualizar esta línea.</p>}
                                                </form>
                                            )}
                                        </div>;
                                    })}
                                </div>
                            </div>;
                        })}
                    </div>
                </section>
            )}

            {productoCotizado && (
                <section className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-5" aria-live="polite">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Línea seleccionada · versión {productoCotizado.cotizacionVersion.version}</p>
                    <h2 className="mt-1 text-lg font-semibold">{productoCotizado.producto?.nombre ?? `Producto solicitado · especificación #${productoCotizado.especificacionProductoSolicitadoVersion?.id ?? "—"}`}</h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <InfoItem label="Cantidad solicitada" value={`${productoCotizado.cotizacionDetalle.cantidad} ${productoCotizado.cotizacionDetalle.unidad_comercial}`} />
                        <InfoItem label="Precio unitario" value={`${productoCotizado.cotizacionVersion.moneda} ${Number(productoCotizado.cotizacionDetalle.precio_unitario).toFixed(2)}`} />
                        <InfoItem label="Descuento" value={`${Number(productoCotizado.cotizacionDetalle.descuento_porcentaje ?? 0).toFixed(2)}%`} />
                        <InfoItem label="Subtotal de línea" value={`${productoCotizado.cotizacionVersion.moneda} ${Number(productoCotizado.cotizacionDetalle.precio_total).toFixed(2)}`} />
                        <InfoItem label="Peso total" value={productoCotizado.cotizacionDetalle.peso_kg ? `${productoCotizado.cotizacionDetalle.peso_kg} kg` : "No especificado"} />
                    </div>
                </section>
            )}

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
                            value={categoriaProducto}
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

                {datosTecnicos && (
                    <InfoCard
                        icon={<Package className="h-5 w-5" />}
                        title="Producto"
                    >
                        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                            {productoVersion && (
                                <>
                                    <InfoItem
                                        label="Código"
                                        value={productoCotizado?.producto?.codigo}
                                    />
                                    <InfoItem
                                        label="Producto de catálogo"
                                        value={productoCotizado?.producto?.nombre}
                                    />
                                    <InfoItem
                                        label="Categoría"
                                        value={productoCotizado?.categoria?.nombre || "—"}
                                    />
                                    <InfoItem
                                        label="Versión de catálogo"
                                        value={`V${productoVersion?.numero_version ?? "—"}`}
                                    />
                                </>
                            )}
                            {especificacionVersionada && <>
                                <InfoItem label="Código de producto" value="Sin código definitivo" />
                                <InfoItem label="Versión técnica solicitada" value={`V${especificacionVersionada.version}`} />
                                <InfoItem label="Categoría" value={categoriaProducto} />
                            </>}
                            <InfoItem
                                label="Material"
                                value={getMaterialLabel(
                                    datosTecnicos.material,
                                )}
                            />

                            <InfoItem
                                label="Apto para alimentos"
                                value={
                                    datosTecnicos.apto_alimento
                                        ? "Sí"
                                        : "No"
                                }
                            />

                            <InfoItem
                                label="Micraje"
                                value={
                                    datosTecnicos.micraje
                                        ? `${datosTecnicos.micraje} micras`
                                        : "—"
                                }
                            />

                            <InfoItem
                                label="Color"
                                value={
                                    datosTecnicos.color_bolsa || "—"
                                }
                            />

                            <InfoItem
                                label="Opacidad"
                                value={getOpacidadLabel(
                                    datosTecnicos.opacidad,
                                )}
                            />

                            <InfoItem
                                label="Tipo de capa"
                                value={getCapasLabel(
                                    datosTecnicos.capas,
                                )}
                            />

                            <InfoItem
                                label="Cara impresión"
                                value={getCaraImpresionLabel(
                                    datosTecnicos.cara_impresion,
                                )}
                            />
                        </div>

                        {/* ========================================================
            COLORES Y CANTIDADES
           ======================================================== */}

                        {variantesColorSolicitadas.length > 0 && (
                            <div className="mt-6 border-t border-border pt-5">
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold">
                                        Colores y cantidades
                                    </h4>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Colores solicitados y cantidad correspondiente.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {variantesColorSolicitadas.map(
                                        (variante, index) => (
                                            <div
                                                key={variante.id ?? index}
                                                className="rounded-xl border border-border bg-muted/20 p-4"
                                            >
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <InfoItem
                                                        label={`Color ${index + 1}`}
                                                        value={variante.color || "—"}
                                                    />

                                                    <InfoItem
                                                        label="Cantidad"
                                                        value={getColorCantidadLabel(
                                                            variante.cantidad,
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}
                    </InfoCard>
                )}

                {/* ========================================================
                    ESPECIFICACIONES
                   ======================================================== */}

                {datosTecnicos && (
                    <InfoCard
                        icon={<Palette className="h-5 w-5" />}
                        title="Especificaciones"
                    >
                        <div className="space-y-7">
                            {/* =================================================
                                DIMENSIONES DE BOLSA
                               ================================================= */}

                            {bolsaMostrar && (
                                <div>
                                    <SectionTitle>
                                        Dimensiones
                                    </SectionTitle>

                                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                                        <InfoItem
                                            label="Ancho doblado"
                                            value={
                                                bolsaMostrar.ancho_doblado
                                                    ? `${bolsaMostrar.ancho_doblado} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Ancho desdoblado"
                                            value={
                                                bolsaMostrar.ancho_desdoblado
                                                    ? `${bolsaMostrar.ancho_desdoblado} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Largo doblado"
                                            value={
                                                bolsaMostrar.largo_doblado
                                                    ? `${bolsaMostrar.largo_doblado} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Largo desdoblado"
                                            value={
                                                bolsaMostrar.largo_desdoblado
                                                    ? `${bolsaMostrar.largo_desdoblado} cm`
                                                    : "—"
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            {/* =================================================
                                FUELLE
                               ================================================= */}

                            {bolsaMostrar && (
                                <div>
                                    <SectionTitle>Fuelle</SectionTitle>

                                    {bolsaMostrar.fuelle ? (
                                        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                                            <InfoItem
                                                label="Izquierdo"
                                                value={
                                                    bolsaMostrar.fuelle_izquierdo
                                                        ? `${bolsaMostrar.fuelle_izquierdo} cm`
                                                        : "—"
                                                }
                                            />

                                            <InfoItem
                                                label="Derecho"
                                                value={
                                                    bolsaMostrar.fuelle_derecho
                                                        ? `${bolsaMostrar.fuelle_derecho} cm`
                                                        : "—"
                                                }
                                            />

                                            <InfoItem
                                                label="Inferior"
                                                value={
                                                    bolsaMostrar.fuelle_inferior
                                                        ? `${bolsaMostrar.fuelle_inferior} cm`
                                                        : "—"
                                                }
                                            />

                                            <InfoItem
                                                label="Superior"
                                                value={
                                                    bolsaMostrar.fuelle_superior
                                                        ? `${bolsaMostrar.fuelle_superior} cm`
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

                            {bolsaMostrar && (
                                <div>
                                    <SectionTitle>
                                        Configuración de bolsa
                                    </SectionTitle>

                                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                                        <InfoItem
                                            label="Troquel"
                                            value={getTroquelLabel(
                                                bolsaMostrar.tipo_troquel,
                                            )}
                                        />

                                        <InfoItem
                                            label="Sello"
                                            value={getSelloLabel(
                                                bolsaMostrar.tipo_sello,
                                            )}
                                        />

                                        <InfoItem
                                            label="Pestaña"
                                            value={bolsaMostrar.pestana}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* =================================================
                                BOBINA
                               ================================================= */}

                            {/* BOBINA */}
                            {bobinaMostrar && (
                                <div>
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Características de bobina
                                    </p>

                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <InfoItem
                                            label="Ancho de bobina"
                                            value={
                                                bobinaMostrar.ancho
                                                    ? `${bobinaMostrar.ancho} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Longitud"
                                            value={
                                                bobinaMostrar.longitud
                                                    ? `${bobinaMostrar.longitud} m`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Peso"
                                            value={
                                                bobinaMostrar.peso
                                                    ? `${bobinaMostrar.peso} kg`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Diámetro"
                                            value={
                                                bobinaMostrar.diametro
                                                    ? `${bobinaMostrar.diametro} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Diámetro núcleo"
                                            value={
                                                bobinaMostrar.diametro_nucleo
                                                    ? `${bobinaMostrar.diametro_nucleo} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Tipo núcleo"
                                            value={bobinaMostrar.tipo_nucleo || "—"}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* =================================================
                                IMPRESIÓN
                               ================================================= */}

                            <div>
                                <SectionTitle>Impresión</SectionTitle>

                                {!datosTecnicos.impresion ? (
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
                                                datosTecnicos.color_impresion?.length
                                                    ? datosTecnicos.color_impresion.join(
                                                        ", ",
                                                    )
                                                    : "—"
                                            }
                                        />
                                        {"archivo_color_impresion" in datosTecnicos && datosTecnicos.archivo_color_impresion && (
                                            <div className="sm:col-span-2">
                                                <span className="text-xs text-muted-foreground">Diseño de impresión</span>
                                                <a className="mt-1 flex items-center gap-2 text-sm font-medium text-primary underline" href={datosTecnicos.archivo_color_impresion} target="_blank" rel="noreferrer"><FileText className="h-4 w-4" /> Ver archivo PDF</a>
                                            </div>
                                        )}

                                        <InfoItem
                                            label="Tipo"
                                            value={getTipoImpresionLabel(
                                                datosTecnicos.tipo_impresion,
                                            )}
                                        />

                                        <InfoItem
                                            label="Tratamiento"
                                            value={getTratamientoImpresionLabel(
                                                datosTecnicos.tratamiento_impresion,
                                            )}
                                        />

                                        <InfoItem
                                            label="Posición"
                                            value={getPosicionLabel(
                                                datosTecnicos.posicion_impresion ?? "",
                                            )}
                                        />

                                        <InfoItem
                                            label="Distancia superior"
                                            value={
                                                datosTecnicos.distancia_impresion_superior
                                                    ? `${datosTecnicos.distancia_impresion_superior} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Distancia inferior"
                                            value={
                                                datosTecnicos.distancia_impresion_inferior
                                                    ? `${datosTecnicos.distancia_impresion_inferior} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Distancia izquierda"
                                            value={
                                                datosTecnicos.distancia_impresion_izquierda
                                                    ? `${datosTecnicos.distancia_impresion_izquierda} cm`
                                                    : "—"
                                            }
                                        />

                                        <InfoItem
                                            label="Distancia derecha"
                                            value={
                                                datosTecnicos.distancia_impresion_derecha
                                                    ? `${datosTecnicos.distancia_impresion_derecha} cm`
                                                    : "—"
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            {/* =================================================
                                TRATAMIENTOS
                               ================================================= */}

                            {datosTecnicos.tratamientos_acabados_especiales?.length >
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
                                            {datosTecnicos.tratamientos_acabados_especiales.map(
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

                            {datosTecnicos.otras_caracteristicas && (
                                <InfoText
                                    label="Otras características"
                                    value={
                                        datosTecnicos.otras_caracteristicas
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
                    cotizacionVersionId={versionEnviada?.id ?? null}
                    onClose={() => setShowComunicaciones(false)}

                />
            )}

            {showEditar && (
                <EditarRequerimientoModal
                    open={showEditar}
                    requerimientoId={solicitudId}
                    onClose={() => setShowEditar(false)}
                    onSuccess={() => {
                        setShowEditar(false);
                        // Recargar los datos después de editar
                        window.location.reload();
                    }}
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
function getColorCantidadLabel(cantidad: string) {
    if (!cantidad) return "—";

    return `${cantidad} unidades`;
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

function getTratamientoImpresionLabel(value: string) {
    const labels: Record<string, string> = {
        solido: "Sólido",
        degradado: "Degradado",
        trameado: "Trameado",
    };

    return labels[value] ?? (value || "—");
}
function getCaraImpresionLabel(value: string) {
    const labels: Record<string, string> = {
        una_cara: "Una cara",
        dos_caras: "Dos caras",
    };

    return labels[value] ?? value;
}

function getCapasLabel(value: string) {
    const labels: Record<string, string> = {
        monocapa: "Monocapa",
        bicapa: "Bicapa",
        tricapa: "Tricapa",
    };

    return labels[value] ?? (value || "—");
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
