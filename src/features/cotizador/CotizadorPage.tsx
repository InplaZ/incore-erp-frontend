import { useEffect, useMemo, useState } from "react";
import {
    Calculator,
    CircleDollarSign,
    History,
    Loader2,
    Package,
    Percent,
    Printer,
    ReceiptText,
    RotateCcw,
    TrendingUp,
    UserRound,
    Weight,
    Plus,
    Pencil,
    Power,
    Search,
    MoreHorizontal,
    CheckCircle2,
    AlertCircle,
    Sparkles,
} from "lucide-react";

import {
    useMaterialesCotizador,
    useTarifasImpresion,
    useMargenesComerciales,
    useCalcularCotizacion,
    useCalculosCotizador,
    useUpdateMaterialCotizador,
    useUpdateTarifaImpresion,
    useUpdateMargenComercial,
    useParametrosCotizador,
    useUpdateParametroCotizador,
} from "./cotizador.hooks";

import type {
    CalcularCotizacionRequest,
    CalculoCotizador,
    MaterialCotizador,
    TarifaImpresion,
    MargenComercial,
    ParametroCotizador,
} from "./cotizador.types";

import MaterialCotizadorModal from "@/features/cotizador/components/MaterialCotizadorModal";
import TarifaImpresionModal from "@/features/cotizador/components/TarifaImpresionModal";
import MargenComercialModal from "@/features/cotizador/components/MargenComercialModal";

// ============================================================
// UTILIDADES
// ============================================================

const formatoMoneda = (valor: string | number) =>
    `Bs ${Number(valor).toLocaleString("es-BO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatoNumero = (valor: string | number, decimales = 2) =>
    Number(valor).toLocaleString("es-BO", {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales,
    });

const formatoFecha = (fecha: string) =>
    new Date(fecha).toLocaleString("es-BO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

function extraerLista<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];

    if (
        data &&
        typeof data === "object" &&
        "results" in data &&
        Array.isArray(data.results)
    ) {
        return data.results as T[];
    }

    return [];
}

const CONTROL_CLASS =
    "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60 disabled:cursor-not-allowed";

const LABEL_CLASS = "mb-1.5 block text-sm font-medium text-foreground";

// ============================================================
// PÁGINA PRINCIPAL
// ============================================================

export default function CotizadorPage() {
    const [materialId, setMaterialId] = useState("");
    const [tarifaId, setTarifaId] = useState("");
    const [margenId, setMargenId] = useState("");
    const [cantidadKg, setCantidadKg] = useState("");
    const [clienteNombre, setClienteNombre] = useState("");
    const [factura, setFactura] = useState(false);
    const [manoObraKg, setManoObraKg] = useState("");
    const [costosIndirectosKg, setCostosIndirectosKg] = useState("");
    const [resultadoActual, setResultadoActual] = useState<CalculoCotizador | null>(null);

    // MATERIAL
    const [materialModalOpen, setMaterialModalOpen] = useState(false);
    const [materialEditar, setMaterialEditar] = useState<MaterialCotizador | null>(null);
    const [errorEstadoMaterial, setErrorEstadoMaterial] = useState("");
    const actualizarMaterial = useUpdateMaterialCotizador();
    const [busquedaMaterial, setBusquedaMaterial] = useState("");
    const [menuMaterialId, setMenuMaterialId] = useState<number | null>(null);

    // TARIFAS
    const [tarifaModalOpen, setTarifaModalOpen] = useState(false);
    const [tarifaEditar, setTarifaEditar] = useState<TarifaImpresion | null>(null);
    const [busquedaTarifa, setBusquedaTarifa] = useState("");
    const [menuTarifaId, setMenuTarifaId] = useState<number | null>(null);
    const [errorEstadoTarifa, setErrorEstadoTarifa] = useState("");
    const actualizarTarifa = useUpdateTarifaImpresion();

    // MÁRGENES
    const [margenModalOpen, setMargenModalOpen] = useState(false);
    const [margenEditar, setMargenEditar] = useState<MargenComercial | null>(null);
    const [busquedaMargen, setBusquedaMargen] = useState("");
    const [menuMargenId, setMenuMargenId] = useState<number | null>(null);
    const [errorEstadoMargen, setErrorEstadoMargen] = useState("");
    const actualizarMargen = useUpdateMargenComercial();

    // PARÁMETROS
    const [parametroEditando, setParametroEditando] = useState<number | null>(null);
    const [nuevoValorParametro, setNuevoValorParametro] = useState("");
    const [errorParametro, setErrorParametro] = useState("");
    const [mensajeParametro, setMensajeParametro] = useState("");

    // CONSULTAS
    const {
        data: materialesData,
        isLoading: cargandoMateriales,
        isError: errorMateriales,
    } = useMaterialesCotizador();

    const {
        data: tarifasData,
        isLoading: cargandoTarifas,
        isError: errorTarifas,
    } = useTarifasImpresion();

    const {
        data: margenesData,
        isLoading: cargandoMargenes,
        isError: errorMargenes,
    } = useMargenesComerciales();

    const {
        data: calculosData,
        isLoading: cargandoHistorial,
        isError: errorHistorial,
    } = useCalculosCotizador();

    const calcularMutation = useCalcularCotizacion();

    const materiales = extraerLista<NonNullable<typeof materialesData>[number]>(materialesData);
    const tarifas = extraerLista<NonNullable<typeof tarifasData>[number]>(tarifasData);
    const margenes = extraerLista<NonNullable<typeof margenesData>[number]>(margenesData);
    const historial = extraerLista<CalculoCotizador>(calculosData);

    const materialesActivos = materiales.filter((item) => item.activo);

    const materialesFiltrados = useMemo(() => {
        const termino = busquedaMaterial.trim().toLowerCase();
        if (!termino) return [];
        return materiales.filter((material) =>
            material.nombre.toLowerCase().includes(termino)
        );
    }, [materiales, busquedaMaterial]);

    const tarifasFiltradas = useMemo(() => {
        const termino = busquedaTarifa.trim().toLowerCase();
        if (!termino) return [];
        return tarifas.filter((tarifa) => tarifa.nombre.toLowerCase().includes(termino));
    }, [tarifas, busquedaTarifa]);

    const margenesFiltrados = useMemo(() => {
        const termino = busquedaMargen.trim().toLowerCase();
        if (!termino) return [];
        return margenes.filter((margen) => margen.nombre.toLowerCase().includes(termino));
    }, [margenes, busquedaMargen]);

    const tarifasActivas = tarifas.filter((item) => item.activo);
    const margenesActivos = margenes.filter((item) => item.activo);

    const materialSeleccionado = materialesActivos.find(
        (item) => item.id === Number(materialId)
    );
    const tarifaSeleccionada = tarifasActivas.find(
        (item) => item.id === Number(tarifaId)
    );
    const margenSeleccionado = margenesActivos.find(
        (item) => item.id === Number(margenId)
    );

    const historialOrdenado = useMemo(
        () =>
            [...historial].sort(
                (a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ),
        [historial]
    );

    const {
        data: parametrosData,
        isLoading: cargandoParametros,
        isError: errorParametros,
    } = useParametrosCotizador();

    const parametros = extraerLista<ParametroCotizador>(parametrosData);
    const actualizarParametro = useUpdateParametroCotizador();

    const parametroManoObra = parametros.find((item) => item.codigo === "mano_obra");
    const parametroCostosIndirectos = parametros.find(
        (item) => item.codigo === "costos_indirectos"
    );
    const parametroFactorFactura = parametros.find(
        (item) => item.codigo === "factor_factura"
    );

    useEffect(() => {
        if (parametroManoObra && manoObraKg === "") {
            setManoObraKg(parametroManoObra.valor);
        }
        if (parametroCostosIndirectos && costosIndirectosKg === "") {
            setCostosIndirectosKg(parametroCostosIndirectos.valor);
        }
    }, [
        parametroManoObra,
        parametroCostosIndirectos,
        manoObraKg,
        costosIndirectosKg,
    ]);

    // ==========================================================
    // ACCIONES
    // ==========================================================

    const abrirEdicionParametro = (parametro: ParametroCotizador) => {
        setParametroEditando(parametro.id);
        setNuevoValorParametro(parametro.valor);
        setErrorParametro("");
        setMensajeParametro("");
    };

    const cancelarEdicionParametro = () => {
        setParametroEditando(null);
        setNuevoValorParametro("");
        setErrorParametro("");
    };

    const guardarParametro = async (parametro: ParametroCotizador) => {
        setErrorParametro("");
        setMensajeParametro("");

        const valor = Number(nuevoValorParametro);

        if (nuevoValorParametro.trim() === "" || !Number.isFinite(valor)) {
            setErrorParametro("Ingresa un valor numérico válido.");
            return;
        }

        if (parametro.codigo === "factor_factura" ? valor <= 0 : valor < 0) {
            setErrorParametro(
                parametro.codigo === "factor_factura"
                    ? "El factor de factura debe ser mayor que cero."
                    : "El valor no puede ser negativo."
            );
            return;
        }

        try {
            await actualizarParametro.mutateAsync({
                id: parametro.id,
                data: { valor: nuevoValorParametro },
            });
            setParametroEditando(null);
            setNuevoValorParametro("");
            setMensajeParametro("Parámetro actualizado correctamente.");
        } catch (error) {
            setErrorParametro(
                error instanceof Error
                    ? error.message
                    : "No se pudo actualizar el parámetro."
            );
        }
    };

    const limpiarFormulario = () => {
        setMaterialId("");
        setTarifaId("");
        setMargenId("");
        setCantidadKg("");
        setClienteNombre("");
        setFactura(false);
        setResultadoActual(null);
        calcularMutation.reset();
        setManoObraKg("");
        setCostosIndirectosKg("");
    };

    const realizarCalculo = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setResultadoActual(null);

        const datos: CalcularCotizacionRequest = {
            material_id: Number(materialId),
            tarifa_impresion_id: Number(tarifaId),
            margen_comercial_id: Number(margenId),
            cantidad_kg: Number(cantidadKg),
            cliente_nombre: clienteNombre.trim(),
            mano_obra_kg: Number(manoObraKg),
            costos_indirectos_kg: Number(costosIndirectosKg),
            factura,
        };

        try {
            const resultado = await calcularMutation.mutateAsync(datos);
            setResultadoActual(resultado);
        } catch {
            /* manejado por la mutación */
        }
    };

    const abrirNuevaTarifa = () => {
        setTarifaEditar(null);
        setTarifaModalOpen(true);
    };

    const abrirEditarTarifa = (tarifa: TarifaImpresion) => {
        setTarifaEditar(tarifa);
        setTarifaModalOpen(true);
    };

    const cambiarEstadoTarifa = async (tarifa: TarifaImpresion) => {
        setErrorEstadoTarifa("");
        try {
            await actualizarTarifa.mutateAsync({
                id: tarifa.id,
                data: { activo: !tarifa.activo },
            });
            if (tarifa.activo && tarifaId === String(tarifa.id)) {
                setTarifaId("");
                setResultadoActual(null);
            }
        } catch (error) {
            setErrorEstadoTarifa(
                error instanceof Error
                    ? error.message
                    : "No se pudo actualizar el estado de la tarifa."
            );
        }
    };

    const abrirNuevoMargen = () => {
        setMargenEditar(null);
        setMargenModalOpen(true);
    };

    const abrirEditarMargen = (margen: MargenComercial) => {
        setMargenEditar(margen);
        setMargenModalOpen(true);
    };

    const cambiarEstadoMargen = async (margen: MargenComercial) => {
        setErrorEstadoMargen("");
        try {
            await actualizarMargen.mutateAsync({
                id: margen.id,
                data: { activo: !margen.activo },
            });
            if (margen.activo && margenId === String(margen.id)) {
                setMargenId("");
                setResultadoActual(null);
            }
        } catch (error) {
            setErrorEstadoMargen(
                error instanceof Error
                    ? error.message
                    : "No se pudo actualizar el estado del margen."
            );
        }
    };

    const cargandoCatalogos =
        cargandoMateriales || cargandoTarifas || cargandoMargenes || cargandoParametros;

    const errorCatalogos =
        errorMateriales || errorTarifas || errorMargenes || errorParametros;

    const formularioCompleto =
        Boolean(materialId && tarifaId && margenId) &&
        cantidadKg !== "" &&
        Number(cantidadKg) > 0 &&
        manoObraKg !== "" &&
        Number(manoObraKg) >= 0 &&
        costosIndirectosKg !== "" &&
        Number(costosIndirectosKg) >= 0;

    const abrirNuevoMaterial = () => {
        setMaterialEditar(null);
        setMaterialModalOpen(true);
    };

    const abrirEditarMaterial = (material: MaterialCotizador) => {
        setMaterialEditar(material);
        setMaterialModalOpen(true);
    };

    const cambiarEstadoMaterial = async (material: MaterialCotizador) => {
        setErrorEstadoMaterial("");
        try {
            await actualizarMaterial.mutateAsync({
                id: material.id,
                data: { activo: !material.activo },
            });
            if (material.activo && materialId === String(material.id)) {
                setMaterialId("");
                setResultadoActual(null);
            }
        } catch (error) {
            setErrorEstadoMaterial(
                error instanceof Error
                    ? error.message
                    : "No se pudo actualizar el estado del material."
            );
        }
    };

    return (
        <div className="space-y-6">
            {/* ======================================================
                ENCABEZADO
            ====================================================== */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md shadow-primary/20">
                        <Calculator className="h-5 w-5" />
                    </div>

                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                            Cotizador
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Calcula precios de venta según materiales y condiciones comerciales.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={limpiarFormulario}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-secondary/60"
                >
                    <RotateCcw className="h-4 w-4" />
                    Limpiar formulario
                </button>
            </div>

            {/* ======================================================
                ERROR DE CATÁLOGOS
            ====================================================== */}
            {errorCatalogos && (
                <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
                >
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div>
                        <p className="font-medium">No se pudieron cargar los catálogos.</p>
                        <p className="mt-0.5 text-xs opacity-90">
                            Verifica tu conexión e inténtalo nuevamente.
                        </p>
                    </div>
                </div>
            )}

            {/* ======================================================
                CONTENIDO PRINCIPAL
            ====================================================== */}
            <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                {/* FORMULARIO */}
                <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="border-b border-border bg-secondary/20 px-5 py-4">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Package className="h-4 w-4" />
                            </span>
                            <div>
                                <h2 className="font-semibold text-foreground">Datos de la cotización</h2>
                                <p className="text-xs text-muted-foreground">
                                    Completa los datos para obtener el precio de venta.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={realizarCalculo} className="space-y-5 p-5">
                        {/* CLIENTE */}
                        <div>
                            <label htmlFor="cliente" className={LABEL_CLASS}>
                                <span className="inline-flex items-center gap-2">
                                    <UserRound className="h-4 w-4 text-muted-foreground" />
                                    Cliente
                                </span>
                            </label>
                            <input
                                id="cliente"
                                type="text"
                                maxLength={200}
                                value={clienteNombre}
                                onChange={(e) => setClienteNombre(e.target.value)}
                                placeholder="Nombre del cliente (opcional)"
                                className={CONTROL_CLASS}
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Puedes dejar este campo vacío si el cálculo es interno.
                            </p>
                        </div>

                        <div className="border-t border-border" />

                        {/* MATERIAL */}
                        <div>
                            <label htmlFor="material" className={LABEL_CLASS}>
                                <span className="inline-flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    Material
                                </span>
                            </label>
                            <select
                                id="material"
                                required
                                value={materialId}
                                onChange={(e) => {
                                    setMaterialId(e.target.value);
                                    setResultadoActual(null);
                                }}
                                disabled={cargandoCatalogos}
                                className={CONTROL_CLASS}
                            >
                                <option value="">
                                    {cargandoCatalogos
                                        ? "Cargando materiales..."
                                        : "Selecciona un material"}
                                </option>
                                {materialesActivos.map((material) => (
                                    <option key={material.id} value={material.id}>
                                        {material.nombre}
                                    </option>
                                ))}
                            </select>

                            {materialSeleccionado && (
                                <div className="mt-2 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                                    <span className="text-xs text-muted-foreground">
                                        Costo del material por kg
                                    </span>
                                    <span className="text-sm font-semibold text-primary">
                                        {formatoMoneda(materialSeleccionado.costo_por_kg)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* IMPRESIÓN */}
                        <div>
                            <label htmlFor="tarifa" className={LABEL_CLASS}>
                                <span className="inline-flex items-center gap-2">
                                    <Printer className="h-4 w-4 text-muted-foreground" />
                                    Tarifa de impresión
                                </span>
                            </label>
                            <select
                                id="tarifa"
                                required
                                value={tarifaId}
                                onChange={(e) => {
                                    setTarifaId(e.target.value);
                                    setResultadoActual(null);
                                }}
                                disabled={cargandoCatalogos}
                                className={CONTROL_CLASS}
                            >
                                <option value="">Selecciona una tarifa de impresión</option>
                                {tarifasActivas.map((tarifa) => (
                                    <option key={tarifa.id} value={tarifa.id}>
                                        {tarifa.nombre}
                                    </option>
                                ))}
                            </select>

                            {tarifaSeleccionada && (
                                <div className="mt-2 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                                    <span className="text-xs text-muted-foreground">
                                        Costo de impresión por kg
                                    </span>
                                    <span className="text-sm font-semibold text-primary">
                                        {formatoMoneda(tarifaSeleccionada.costo_por_kg)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* MARGEN */}
                        <div>
                            <label htmlFor="margen" className={LABEL_CLASS}>
                                <span className="inline-flex items-center gap-2">
                                    <Percent className="h-4 w-4 text-muted-foreground" />
                                    Margen comercial
                                </span>
                            </label>
                            <select
                                id="margen"
                                required
                                value={margenId}
                                onChange={(e) => {
                                    setMargenId(e.target.value);
                                    setResultadoActual(null);
                                }}
                                disabled={cargandoCatalogos}
                                className={CONTROL_CLASS}
                            >
                                <option value="">Selecciona un margen comercial</option>
                                {margenesActivos.map((margen) => (
                                    <option key={margen.id} value={margen.id}>
                                        {margen.nombre} - {formatoNumero(margen.porcentaje)}%
                                    </option>
                                ))}
                            </select>

                            {margenSeleccionado && (
                                <div className="mt-2 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                                    <span className="text-xs text-muted-foreground">
                                        Margen seleccionado
                                    </span>
                                    <span className="text-sm font-semibold text-primary">
                                        {formatoNumero(margenSeleccionado.porcentaje)}%
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-border" />

                        {/* CANTIDAD */}
                        <div>
                            <label htmlFor="cantidad" className={LABEL_CLASS}>
                                <span className="inline-flex items-center gap-2">
                                    <Weight className="h-4 w-4 text-muted-foreground" />
                                    Cantidad a cotizar
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    id="cantidad"
                                    type="number"
                                    required
                                    min="0.001"
                                    step="0.001"
                                    value={cantidadKg}
                                    onChange={(e) => {
                                        setCantidadKg(e.target.value);
                                        setResultadoActual(null);
                                    }}
                                    placeholder="Ej. 500"
                                    className={`${CONTROL_CLASS} pr-14`}
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded bg-secondary px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
                                    kg
                                </span>
                            </div>
                        </div>

                        {/* MANO DE OBRA Y COSTOS INDIRECTOS */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="mano-obra" className={LABEL_CLASS}>
                                    Mano de obra <span className="text-xs font-normal text-muted-foreground">(Bs/kg)</span>
                                </label>
                                <input
                                    id="mano-obra"
                                    type="number"
                                    required
                                    min="0"
                                    step="0.0001"
                                    value={manoObraKg}
                                    onChange={(e) => {
                                        setManoObraKg(e.target.value);
                                        setResultadoActual(null);
                                    }}
                                    placeholder="Ej. 6.15"
                                    className={CONTROL_CLASS}
                                />
                            </div>

                            <div>
                                <label htmlFor="costos-indirectos" className={LABEL_CLASS}>
                                    Costos indirectos <span className="text-xs font-normal text-muted-foreground">(Bs/kg)</span>
                                </label>
                                <input
                                    id="costos-indirectos"
                                    type="number"
                                    required
                                    min="0"
                                    step="0.0001"
                                    value={costosIndirectosKg}
                                    onChange={(e) => {
                                        setCostosIndirectosKg(e.target.value);
                                        setResultadoActual(null);
                                    }}
                                    placeholder="Ej. 1.39"
                                    className={CONTROL_CLASS}
                                />
                            </div>
                        </div>

                        {/* FACTURA */}
                        <label
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${factura
                                ? "border-primary/40 bg-primary/5"
                                : "border-border hover:bg-secondary/30"
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={factura}
                                onChange={(e) => {
                                    setFactura(e.target.checked);
                                    setResultadoActual(null);
                                }}
                                className="mt-0.5 h-4 w-4 accent-primary"
                            />
                            <div className="flex-1">
                                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <ReceiptText className="h-4 w-4 text-muted-foreground" />
                                    Incluir factura
                                </span>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Se aplicará el factor de factura configurado en el sistema
                                    {parametroFactorFactura && (
                                        <> ({formatoNumero(parametroFactorFactura.valor, 4)})</>
                                    )}.
                                </p>
                            </div>
                        </label>

                        {/* ERROR DE CÁLCULO */}
                        {calcularMutation.isError && (
                            <div
                                role="alert"
                                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                            >
                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">No se pudo realizar el cálculo.</p>
                                    {calcularMutation.error instanceof Error && (
                                        <p className="mt-0.5 text-xs opacity-90">
                                            {calcularMutation.error.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* BOTÓN */}
                        <button
                            type="submit"
                            disabled={!formularioCompleto || cargandoCatalogos || calcularMutation.isPending}
                            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/90 px-4 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                        >
                            {calcularMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Calculando...
                                </>
                            ) : (
                                <>
                                    <Calculator className="h-4 w-4 transition group-hover:scale-110" />
                                    Calcular cotización
                                </>
                            )}
                        </button>

                        <p className="text-center text-xs text-muted-foreground">
                            El cálculo se procesa con los parámetros registrados en el sistema.
                        </p>
                    </form>
                </section>

                {/* RESULTADO */}
                <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm xl:sticky xl:top-6">
                    <div className="border-b border-border bg-secondary/20 px-5 py-4">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <TrendingUp className="h-4 w-4" />
                            </span>
                            <div>
                                <h2 className="font-semibold text-foreground">
                                    Resultado de la cotización
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Aquí se mostrará el resultado de tu cálculo.
                                </p>
                            </div>
                        </div>
                    </div>

                    {resultadoActual ? (
                        <div className="space-y-5 p-5">
                            {/* PRECIO PRINCIPAL */}
                            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-md">
                                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                                <div className="absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-white/5 blur-xl" />

                                <div className="relative">
                                    <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider opacity-90">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Precio de venta por kilo
                                    </div>
                                    <p className="mt-2 text-4xl font-bold tracking-tight">
                                        {formatoMoneda(resultadoActual.precio_venta_kg)}
                                    </p>
                                    <div className="mt-3 border-t border-white/20 pt-3 text-sm opacity-95">
                                        Total por{" "}
                                        <span className="font-semibold">
                                            {formatoNumero(resultadoActual.cantidad_kg, 3)} kg
                                        </span>
                                        :{" "}
                                        <span className="font-bold">
                                            {formatoMoneda(resultadoActual.precio_total)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* TARJETAS */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-border bg-background p-3">
                                    <p className="text-xs text-muted-foreground">
                                        Precio total de venta
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-primary">
                                        {formatoMoneda(resultadoActual.precio_total)}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border bg-background p-3">
                                    <p className="text-xs text-muted-foreground">
                                        Costo base por kg
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-foreground">
                                        {formatoMoneda(resultadoActual.costo_base_kg)}
                                    </p>
                                </div>
                            </div>

                            {/* DESGLOSE */}
                            <div>
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                                    Desglose de costos por kilogramo
                                </h3>

                                <div className="space-y-3">
                                    <DetalleCosto
                                        label={`Material · ${resultadoActual.material_nombre}`}
                                        valor={resultadoActual.material_costo_kg}
                                    />
                                    <DetalleCosto
                                        label={`Impresión · ${resultadoActual.impresion_nombre}`}
                                        valor={resultadoActual.impresion_costo_kg}
                                    />
                                    <DetalleCosto
                                        label="Mano de obra"
                                        valor={resultadoActual.mano_obra_kg}
                                    />
                                    <DetalleCosto
                                        label="Costos indirectos"
                                        valor={resultadoActual.costos_indirectos_kg}
                                    />
                                    <div className="border-t border-border pt-3">
                                        <DetalleCosto
                                            label="Costo base"
                                            valor={resultadoActual.costo_base_kg}
                                            destacado
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* CONDICIONES */}
                            <div className="rounded-lg border border-border bg-secondary/40 p-4">
                                <h3 className="mb-3 text-sm font-semibold text-foreground">
                                    Condiciones aplicadas
                                </h3>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between gap-3">
                                        <span className="text-muted-foreground">
                                            Margen comercial
                                        </span>
                                        <span className="text-right font-medium text-foreground">
                                            {resultadoActual.margen_nombre} (
                                            {formatoNumero(resultadoActual.margen_porcentaje)}%)
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-3">
                                        <span className="text-muted-foreground">
                                            Facturación
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${resultadoActual.factura
                                                ? "bg-primary/10 text-primary"
                                                : "bg-secondary text-muted-foreground"
                                                }`}
                                        >
                                            {resultadoActual.factura
                                                ? "Incluida"
                                                : "No incluida"}
                                        </span>
                                    </div>

                                    {resultadoActual.factura && (
                                        <div className="flex justify-between gap-3">
                                            <span className="text-muted-foreground">
                                                Factor factura
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {formatoNumero(resultadoActual.factor_factura, 4)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-center text-xs text-muted-foreground">
                                Cálculo registrado el {formatoFecha(resultadoActual.created_at)}.
                            </p>
                        </div>
                    ) : (
                        <div className="flex min-h-[440px] flex-col items-center justify-center px-6 py-10 text-center">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl" />
                                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-background text-primary">
                                    <CircleDollarSign className="h-8 w-8" />
                                </div>
                            </div>

                            <h3 className="mt-5 font-semibold text-foreground">
                                Tu resultado aparecerá aquí
                            </h3>
                            <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                                Selecciona el material, la tarifa de impresión, el margen
                                comercial y la cantidad para calcular el precio de venta.
                            </p>

                            <ul className="mt-5 space-y-1.5 text-left text-xs text-muted-foreground">
                                <StepItem done={Boolean(materialId)} label="Material" />
                                <StepItem done={Boolean(tarifaId)} label="Tarifa de impresión" />
                                <StepItem done={Boolean(margenId)} label="Margen comercial" />
                                <StepItem done={Number(cantidadKg) > 0} label="Cantidad en kg" />
                            </ul>
                        </div>
                    )}
                </section>
            </div>

            {/* ======================================================
                CONFIGURACIÓN DE CATÁLOGOS
            ====================================================== */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* MATERIALES */}
                <CatalogCard
                    icon={<Package className="h-4 w-4" />}
                    title="Materiales"
                    subtitle={`${materiales.length} registrados`}
                    onAdd={abrirNuevoMaterial}
                    addLabel="Nuevo"
                    searchValue={busquedaMaterial}
                    onSearch={setBusquedaMaterial}
                    searchPlaceholder="Buscar material..."
                    error={errorEstadoMaterial}
                    loading={cargandoMateriales}
                    loadingLabel="Cargando materiales..."
                    isError={errorMateriales}
                    errorLabel="No se pudieron cargar los materiales."
                    emptyIcon={<Package className="h-7 w-7" />}
                    emptyMessage={
                        busquedaMaterial
                            ? "No se encontraron materiales."
                            : "Busca un material para administrarlo."
                    }
                    items={materialesFiltrados}
                    renderItem={(material) => (
                        <CatalogRow
                            key={material.id}
                            title={material.nombre}
                            subtitle={[
                                material.tipo_material || "Sin clasificar",
                                material.categoria === "COLOR"
                                    ? "Color"
                                    : material.categoria === "ESPECIAL"
                                        ? "Especial"
                                        : "Sin categoría",
                                `${formatoMoneda(material.costo_por_kg)} / kg`,
                            ].join(" · ")}
                            active={material.activo}
                            menuOpen={menuMaterialId === material.id}
                            onToggleMenu={() =>
                                setMenuMaterialId(
                                    menuMaterialId === material.id ? null : material.id
                                )
                            }
                            onCloseMenu={() => setMenuMaterialId(null)}
                            onEdit={() => {
                                setMenuMaterialId(null);
                                abrirEditarMaterial(material);
                            }}
                            onToggleActive={() => {
                                setMenuMaterialId(null);
                                cambiarEstadoMaterial(material);
                            }}
                            isPending={actualizarMaterial.isPending}
                            editLabel="Editar material"
                        />
                    )}
                />

                {/* TARIFAS */}
                <CatalogCard
                    icon={<Printer className="h-4 w-4" />}
                    title="Impresión"
                    subtitle={`${tarifas.length} tarifas registradas`}
                    onAdd={abrirNuevaTarifa}
                    addLabel="Nueva"
                    searchValue={busquedaTarifa}
                    onSearch={setBusquedaTarifa}
                    searchPlaceholder="Buscar tarifa de impresión..."
                    error={errorEstadoTarifa}
                    loading={cargandoTarifas}
                    loadingLabel="Cargando tarifas..."
                    isError={errorTarifas}
                    errorLabel="No se pudieron cargar las tarifas."
                    emptyIcon={<Printer className="h-7 w-7" />}
                    emptyMessage={
                        busquedaTarifa
                            ? "No se encontraron tarifas."
                            : "Busca una tarifa para administrarla."
                    }
                    items={tarifasFiltradas}
                    renderItem={(tarifa) => (
                        <CatalogRow
                            key={tarifa.id}
                            title={tarifa.nombre}
                            subtitle={`${formatoMoneda(tarifa.costo_por_kg)} / kg`}
                            active={tarifa.activo}
                            menuOpen={menuTarifaId === tarifa.id}
                            onToggleMenu={() =>
                                setMenuTarifaId(menuTarifaId === tarifa.id ? null : tarifa.id)
                            }
                            onCloseMenu={() => setMenuTarifaId(null)}
                            onEdit={() => {
                                setMenuTarifaId(null);
                                abrirEditarTarifa(tarifa);
                            }}
                            onToggleActive={() => {
                                setMenuTarifaId(null);
                                cambiarEstadoTarifa(tarifa);
                            }}
                            isPending={actualizarTarifa.isPending}
                            editLabel="Editar tarifa"
                        />
                    )}
                />

                {/* MÁRGENES */}
                <CatalogCard
                    icon={<Percent className="h-4 w-4" />}
                    title="Márgenes comerciales"
                    subtitle={`${margenes.length} registrados`}
                    onAdd={abrirNuevoMargen}
                    addLabel="Nuevo"
                    searchValue={busquedaMargen}
                    onSearch={setBusquedaMargen}
                    searchPlaceholder="Buscar margen comercial..."
                    error={errorEstadoMargen}
                    loading={cargandoMargenes}
                    loadingLabel="Cargando márgenes..."
                    isError={errorMargenes}
                    errorLabel="No se pudieron cargar los márgenes."
                    emptyIcon={<Percent className="h-7 w-7" />}
                    emptyMessage={
                        busquedaMargen
                            ? "No se encontraron márgenes."
                            : "Busca un margen para administrarlo."
                    }
                    items={margenesFiltrados}
                    renderItem={(margen) => (
                        <CatalogRow
                            key={margen.id}
                            title={margen.nombre}
                            subtitle={`${formatoNumero(margen.porcentaje)}%`}
                            active={margen.activo}
                            menuOpen={menuMargenId === margen.id}
                            onToggleMenu={() =>
                                setMenuMargenId(menuMargenId === margen.id ? null : margen.id)
                            }
                            onCloseMenu={() => setMenuMargenId(null)}
                            onEdit={() => {
                                setMenuMargenId(null);
                                abrirEditarMargen(margen);
                            }}
                            onToggleActive={() => {
                                setMenuMargenId(null);
                                cambiarEstadoMargen(margen);
                            }}
                            isPending={actualizarMargen.isPending}
                            editLabel="Editar margen"
                        />
                    )}
                />

                {/* PARÁMETROS */}
                <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-2 border-b border-border bg-secondary/20 px-4 py-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Calculator className="h-4 w-4" />
                        </span>
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">
                                Parámetros del cotizador
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Valores generales utilizados en los cálculos.
                            </p>
                        </div>
                    </div>

                    {errorParametro && (
                        <p
                            role="alert"
                            className="mx-4 mt-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive"
                        >
                            {errorParametro}
                        </p>
                    )}

                    {mensajeParametro && (
                        <p
                            role="status"
                            className="mx-4 mt-3 flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {mensajeParametro}
                        </p>
                    )}

                    {cargandoParametros ? (
                        <div className="flex items-center justify-center gap-2 px-4 py-8 text-xs text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cargando parámetros...
                        </div>
                    ) : errorParametros ? (
                        <p className="px-4 py-8 text-center text-xs text-destructive">
                            No se pudieron cargar los parámetros.
                        </p>
                    ) : (
                        <div className="divide-y divide-border">
                            {[
                                parametroManoObra,
                                parametroCostosIndirectos,
                                parametroFactorFactura,
                            ]
                                .filter(
                                    (parametro): parametro is ParametroCotizador =>
                                        Boolean(parametro && parametro.activo)
                                )
                                .map((parametro) => {
                                    const estaEditando =
                                        parametroEditando === parametro.id;

                                    return (
                                        <div
                                            key={parametro.id}
                                            className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-foreground">
                                                    {parametro.nombre}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {parametro.unidad}
                                                </p>
                                            </div>

                                            {estaEditando ? (
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min={
                                                            parametro.codigo === "factor_factura"
                                                                ? "0.0001"
                                                                : "0"
                                                        }
                                                        step="0.0001"
                                                        value={nuevoValorParametro}
                                                        onChange={(e) =>
                                                            setNuevoValorParametro(e.target.value)
                                                        }
                                                        disabled={actualizarParametro.isPending}
                                                        className="h-9 w-28 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => guardarParametro(parametro)}
                                                        disabled={actualizarParametro.isPending}
                                                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                                                    >
                                                        {actualizarParametro.isPending ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            "Guardar"
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={cancelarEdicionParametro}
                                                        disabled={actualizarParametro.isPending}
                                                        className="h-9 rounded-lg border border-border px-3 text-xs font-medium text-foreground transition hover:bg-secondary"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between gap-3 sm:justify-end">
                                                    <span className="rounded-md bg-secondary px-2 py-1 text-sm font-semibold tabular-nums text-foreground">
                                                        {formatoNumero(parametro.valor, 4)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            abrirEdicionParametro(parametro)
                                                        }
                                                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium text-foreground transition hover:border-primary/40 hover:bg-secondary"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        Editar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </section>
            </div>

            {/* ======================================================
                HISTORIAL
            ====================================================== */}
            <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex flex-col justify-between gap-2 border-b border-border bg-secondary/20 px-5 py-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <History className="h-4 w-4" />
                        </span>
                        <div>
                            <h2 className="font-semibold text-foreground">
                                Historial de cotizaciones
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Consulta los cálculos realizados anteriormente.
                            </p>
                        </div>
                    </div>

                    <span className="self-start rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground sm:self-auto">
                        {historialOrdenado.length} registros
                    </span>
                </div>

                {cargandoHistorial ? (
                    <div className="flex items-center justify-center gap-2 px-5 py-10 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando historial...
                    </div>
                ) : errorHistorial ? (
                    <div className="px-5 py-10 text-center text-sm text-destructive">
                        No se pudo cargar el historial de cotizaciones.
                    </div>
                ) : historialOrdenado.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                        <History className="mx-auto h-8 w-8 text-muted-foreground/50" />
                        <p className="mt-3 text-sm font-medium text-foreground">
                            Todavía no hay cotizaciones registradas.
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Los cálculos que realices aparecerán en esta sección.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] text-left">
                            <thead>
                                <tr className="border-b border-border bg-secondary/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    <th className="px-5 py-3">Fecha</th>
                                    <th className="px-5 py-3">Cliente</th>
                                    <th className="px-5 py-3">Material</th>
                                    <th className="px-5 py-3 text-right">Cantidad</th>
                                    <th className="px-5 py-3 text-right">Precio/kg</th>
                                    <th className="px-5 py-3 text-right">Total</th>
                                </tr>
                            </thead>

                            <tbody>
                                {historialOrdenado.slice(0, 10).map((calculo) => (
                                    <tr
                                        key={calculo.id}
                                        className="border-b border-border last:border-0 transition hover:bg-secondary/30"
                                    >
                                        <td className="whitespace-nowrap px-5 py-3 text-xs text-muted-foreground">
                                            {formatoFecha(calculo.created_at)}
                                        </td>
                                        <td className="px-5 py-3 text-sm text-foreground">
                                            {calculo.cliente_nombre || (
                                                <span className="text-muted-foreground">
                                                    Sin cliente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-sm text-foreground">
                                            {calculo.material_nombre}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3 text-right text-sm tabular-nums text-foreground">
                                            {formatoNumero(calculo.cantidad_kg, 3)} kg
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3 text-right text-sm tabular-nums text-foreground">
                                            {formatoMoneda(calculo.precio_venta_kg)}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3 text-right text-sm font-semibold tabular-nums text-primary">
                                            {formatoMoneda(calculo.precio_total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!cargandoHistorial && !errorHistorial && historialOrdenado.length > 10 && (
                    <div className="border-t border-border bg-secondary/20 px-5 py-3 text-xs text-muted-foreground">
                        Se muestran los 10 cálculos más recientes de {historialOrdenado.length}.
                    </div>
                )}
            </section>

            {/* MODALES */}
            <MaterialCotizadorModal
                open={materialModalOpen}
                onClose={() => {
                    setMaterialModalOpen(false);
                    setMaterialEditar(null);
                }}
                material={materialEditar}
                onSuccess={() => setErrorEstadoMaterial("")}
            />

            <TarifaImpresionModal
                open={tarifaModalOpen}
                onClose={() => {
                    setTarifaModalOpen(false);
                    setTarifaEditar(null);
                }}
                tarifa={tarifaEditar}
                onSuccess={() => setErrorEstadoTarifa("")}
            />

            <MargenComercialModal
                open={margenModalOpen}
                onClose={() => {
                    setMargenModalOpen(false);
                    setMargenEditar(null);
                }}
                margen={margenEditar}
                onSuccess={() => setErrorEstadoMargen("")}
            />
        </div>
    );
}

// ============================================================
// SUBCOMPONENTES
// ============================================================

function DetalleCosto({
    label,
    valor,
    destacado = false,
}: {
    label: string;
    valor: string;
    destacado?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-3 text-sm">
            <span
                className={
                    destacado
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                }
            >
                {label}
            </span>
            <span
                className={
                    destacado
                        ? "font-bold tabular-nums text-foreground"
                        : "font-medium tabular-nums text-foreground"
                }
            >
                {formatoMoneda(valor)}
            </span>
        </div>
    );
}

function StepItem({ done, label }: { done: boolean; label: string }) {
    return (
        <li className="flex items-center gap-2">
            <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border transition ${done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-transparent"
                    }`}
            >
                <CheckCircle2 className="h-3 w-3" />
            </span>
            <span className={done ? "text-foreground" : ""}>{label}</span>
        </li>
    );
}

interface CatalogCardProps<T> {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onAdd: () => void;
    addLabel: string;
    searchValue: string;
    onSearch: (v: string) => void;
    searchPlaceholder: string;
    error?: string;
    loading: boolean;
    loadingLabel: string;
    isError: boolean;
    errorLabel: string;
    emptyIcon: React.ReactNode;
    emptyMessage: string;
    items: T[];
    renderItem: (item: T) => React.ReactNode;
}

function CatalogCard<T>({
    icon,
    title,
    subtitle,
    onAdd,
    addLabel,
    searchValue,
    onSearch,
    searchPlaceholder,
    error,
    loading,
    loadingLabel,
    isError,
    errorLabel,
    emptyIcon,
    emptyMessage,
    items,
    renderItem,
}: CatalogCardProps<T>) {
    return (
        <section className="overflow-visible rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/20 px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {icon}
                    </span>
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                        <p className="text-xs text-muted-foreground">{subtitle}</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onAdd}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                    <Plus className="h-3.5 w-3.5" />
                    {addLabel}
                </button>
            </div>

            <div className="border-b border-border px-4 py-2.5">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                </div>
            </div>

            {error && (
                <p
                    role="alert"
                    className="mx-4 mt-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive"
                >
                    {error}
                </p>
            )}

            {loading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {loadingLabel}
                </div>
            ) : isError ? (
                <p className="px-4 py-8 text-center text-xs text-destructive">{errorLabel}</p>
            ) : items.length === 0 ? (
                <div className="px-4 py-8 text-center">
                    <span className="mx-auto block h-7 w-7 text-muted-foreground/40">
                        {emptyIcon}
                    </span>
                    <p className="mt-2 text-xs text-muted-foreground">{emptyMessage}</p>
                </div>
            ) : (
                <div className="divide-y divide-border">
                    {items.map(renderItem)}
                </div>
            )}
        </section>
    );
}

interface CatalogRowProps {
    title: string;
    subtitle: string;
    active: boolean;
    menuOpen: boolean;
    onToggleMenu: () => void;
    onCloseMenu: () => void;
    onEdit: () => void;
    onToggleActive: () => void;
    isPending: boolean;
    editLabel: string;
}

function CatalogRow({
    title,
    subtitle,
    active,
    menuOpen,
    onToggleMenu,
    onCloseMenu,
    onEdit,
    onToggleActive,
    isPending,
    editLabel,
}: CatalogRowProps) {
    return (
        <div className="flex min-h-[54px] items-center justify-between gap-3 px-4 py-2 transition hover:bg-secondary/30">
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                        {title}
                    </span>
                    {!active && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            Inactivo
                        </span>
                    )}
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">
                    {subtitle}
                </span>
            </div>

            <div className="relative">
                <button
                    type="button"
                    onClick={onToggleMenu}
                    aria-label={`Acciones de ${title}`}
                    aria-expanded={menuOpen}
                    className="rounded-md p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>

                {menuOpen && (
                    <>
                        <button
                            type="button"
                            aria-label="Cerrar menú"
                            onClick={onCloseMenu}
                            className="fixed inset-0 z-10 cursor-default"
                        />
                        <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-xl">
                            <button
                                type="button"
                                onClick={onEdit}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-foreground transition hover:bg-secondary"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                {editLabel}
                            </button>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={onToggleActive}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-foreground transition hover:bg-secondary disabled:opacity-50"
                            >
                                <Power className="h-3.5 w-3.5" />
                                {active ? "Desactivar" : "Activar"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}