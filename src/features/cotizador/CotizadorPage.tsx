
import { useMemo, useState } from "react";
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
} from "lucide-react";

import {
    useMaterialesCotizador,
    useTarifasImpresion,
    useMargenesComerciales,
    useCalcularCotizacion,
    useCalculosCotizador,
} from "./cotizador.hooks";

import type {
    CalcularCotizacionRequest,
    CalculoCotizador,
} from "./cotizador.types";

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


// Admite tanto una lista directa como una respuesta paginada.
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
    "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

const LABEL_CLASS =
    "mb-1.5 block text-sm font-medium text-foreground";

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
    const [resultadoActual, setResultadoActual] =
        useState<CalculoCotizador | null>(null);

    // Consultas
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

    const materiales = extraerLista<NonNullable<typeof materialesData>[number]>(
        materialesData
    );

    const tarifas = extraerLista<NonNullable<typeof tarifasData>[number]>(
        tarifasData
    );

    const margenes = extraerLista<NonNullable<typeof margenesData>[number]>(
        margenesData
    );

    const historial = extraerLista<CalculoCotizador>(calculosData);

    // Solo mostrar elementos activos
    const materialesActivos = materiales.filter((item) => item.activo);
    const tarifasActivas = tarifas.filter((item) => item.activo);
    const margenesActivos = margenes.filter((item) => item.activo);

    // Elementos seleccionados
    const materialSeleccionado = materialesActivos.find(
        (item) => item.id === Number(materialId)
    );

    const tarifaSeleccionada = tarifasActivas.find(
        (item) => item.id === Number(tarifaId)
    );

    const margenSeleccionado = margenesActivos.find(
        (item) => item.id === Number(margenId)
    );

    // Historial: más recientes primero
    const historialOrdenado = useMemo(
        () =>
            [...historial].sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
            ),
        [historial]
    );

    // ==========================================================
    // ACCIONES
    // ==========================================================

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

    const realizarCalculo = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
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
            // El error se presenta en la interfaz mediante la mutación.
        }
    };

    const cargandoCatalogos =
        cargandoMateriales || cargandoTarifas || cargandoMargenes;

    const errorCatalogos =
        errorMateriales || errorTarifas || errorMargenes;

    const formularioCompleto =
        Boolean(materialId && tarifaId && margenId) &&
        cantidadKg !== "" &&
        Number(cantidadKg) > 0 &&
        manoObraKg !== "" &&
        Number(manoObraKg) >= 0 &&
        costosIndirectosKg !== "" &&
        Number(costosIndirectosKg) >= 0;

    return (
        <div className="space-y-6">

            {/* ======================================================
          ENCABEZADO
      ====================================================== */}

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Calculator className="h-5 w-5" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Cotizador
                            </h1>

                            <p className="text-sm text-muted-foreground">
                                Calcula precios de venta según materiales y condiciones comerciales.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={limpiarFormulario}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-foreground transition hover:bg-secondary"
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
                    className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
                    role="alert"
                >
                    No se pudieron cargar los catálogos del cotizador.
                    Verifica tu conexión e inténtalo nuevamente.
                </div>
            )}

            {/* ======================================================
          CONTENIDO PRINCIPAL
      ====================================================== */}

            <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.15fr_0.85fr]">

                {/* FORMULARIO */}

                <section className="overflow-hidden rounded-xl border border-border bg-card">

                    <div className="border-b border-border px-5 py-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            <h2 className="font-semibold text-foreground">
                                Datos de la cotización
                            </h2>
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Completa los datos para obtener el precio de venta.
                        </p>
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
                                <div className="mt-2 flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                                    <span className="text-xs text-muted-foreground">
                                        Costo del material por kg
                                    </span>
                                    <span className="text-sm font-semibold text-foreground">
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
                                <option value="">
                                    Selecciona una tarifa de impresión
                                </option>

                                {tarifasActivas.map((tarifa) => (
                                    <option key={tarifa.id} value={tarifa.id}>
                                        {tarifa.nombre}
                                    </option>
                                ))}
                            </select>

                            {tarifaSeleccionada && (
                                <div className="mt-2 flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                                    <span className="text-xs text-muted-foreground">
                                        Costo de impresión por kg
                                    </span>
                                    <span className="text-sm font-semibold text-foreground">
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
                                <option value="">
                                    Selecciona un margen comercial
                                </option>

                                {margenesActivos.map((margen) => (
                                    <option key={margen.id} value={margen.id}>
                                        {margen.nombre} - {formatoNumero(margen.porcentaje)}%
                                    </option>
                                ))}
                            </select>

                            {margenSeleccionado && (
                                <div className="mt-2 flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                                    <span className="text-xs text-muted-foreground">
                                        Margen seleccionado
                                    </span>
                                    <span className="text-sm font-semibold text-foreground">
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

                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                                    kg
                                </span>
                            </div>
                        </div>
                        {/* MANO DE OBRA Y COSTOS INDIRECTOS */}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="mano-obra" className={LABEL_CLASS}>
                                    Mano de obra (Bs/kg)
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
                                    Costos indirectos (Bs/kg)
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

                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 transition hover:bg-secondary/30">
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
                                    Se aplicará el factor de factura configurado en el sistema.
                                </p>
                            </div>
                        </label>

                        {/* ERROR DE CÁLCULO */}

                        {calcularMutation.isError && (
                            <div
                                className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                                role="alert"
                            >
                                No se pudo realizar el cálculo.
                                {calcularMutation.error instanceof Error && (
                                    <p className="mt-1">
                                        {calcularMutation.error.message}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* BOTÓN */}

                        <button
                            type="submit"
                            disabled={!formularioCompleto || cargandoCatalogos || calcularMutation.isPending}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {calcularMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Calculando...
                                </>
                            ) : (
                                <>
                                    <Calculator className="h-4 w-4" />
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

                <section className="overflow-hidden rounded-xl border border-border bg-card">

                    <div className="border-b border-border px-5 py-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <h2 className="font-semibold text-foreground">
                                Resultado de la cotización
                            </h2>
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Aquí se mostrará el resultado de tu cálculo.
                        </p>
                    </div>

                    {resultadoActual ? (
                        <div className="space-y-5 p-5">

                            {/* PRECIO TOTAL */}

                            <div className="rounded-xl bg-primary/5 p-5">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Precio de venta por kilo
                                </p>

                                <p className="mt-2 text-3xl font-bold tracking-tight text-primary">
                                    {formatoMoneda(resultadoActual.precio_venta_kg)}
                                </p>

                                <p className="mt-2 text-base text-muted-foreground">
                                    Total por {formatoNumero(resultadoActual.cantidad_kg, 3)} kg: {formatoMoneda(resultadoActual.precio_total)}
                                </p>
                            </div>

                            {/* PRECIO POR KG */}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-border p-3">
                                    <p className="text-xs text-muted-foreground">
                                        Precio total de venta
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-primary">
                                        {formatoMoneda(resultadoActual.precio_total)}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border p-3">
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
                                <h3 className="mb-3 text-sm font-semibold text-foreground">
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

                            <div className="rounded-lg bg-secondary/50 p-4">
                                <h3 className="mb-3 text-sm font-semibold text-foreground">
                                    Condiciones aplicadas
                                </h3>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between gap-3">
                                        <span className="text-muted-foreground">
                                            Margen comercial
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {resultadoActual.margen_nombre} (
                                            {formatoNumero(resultadoActual.margen_porcentaje)}%)
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-3">
                                        <span className="text-muted-foreground">
                                            Facturación
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {resultadoActual.factura ? "Incluida" : "No incluida"}
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

                            <p className="text-xs text-muted-foreground">
                                Cálculo registrado el {formatoFecha(resultadoActual.created_at)}.
                            </p>
                        </div>
                    ) : (
                        <div className="flex min-h-[440px] flex-col items-center justify-center px-6 py-10 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                                <CircleDollarSign className="h-8 w-8" />
                            </div>

                            <h3 className="mt-5 font-semibold text-foreground">
                                Tu resultado aparecerá aquí
                            </h3>

                            <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                                Selecciona el material, la tarifa de impresión, el margen comercial
                                y la cantidad para calcular el precio de venta.
                            </p>
                        </div>
                    )}
                </section>
            </div>

            {/* ======================================================
          HISTORIAL
      ====================================================== */}

            <section className="overflow-hidden rounded-xl border border-border bg-card">

                <div className="flex flex-col justify-between gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <History className="h-5 w-5 text-primary" />
                            <h2 className="font-semibold text-foreground">
                                Historial de cotizaciones
                            </h2>
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Consulta los cálculos realizados anteriormente.
                        </p>
                    </div>

                    <span className="text-xs text-muted-foreground">
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
                                <tr className="border-b border-border bg-secondary/30 text-xs font-semibold text-muted-foreground">
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
                                            {calculo.cliente_nombre || "Sin cliente"}
                                        </td>

                                        <td className="px-5 py-3 text-sm text-foreground">
                                            {calculo.material_nombre}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-3 text-right text-sm text-foreground">
                                            {formatoNumero(calculo.cantidad_kg, 3)} kg
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-3 text-right text-sm text-foreground">
                                            {formatoMoneda(calculo.precio_venta_kg)}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-3 text-right text-sm font-semibold text-foreground">
                                            {formatoMoneda(calculo.precio_total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!cargandoHistorial && !errorHistorial && historialOrdenado.length > 10 && (
                    <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
                        Se muestran los 10 cálculos más recientes.
                    </div>
                )}
            </section>
        </div>
    );
}

// ============================================================
// COMPONENTE: DETALLE DE COSTO
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
                        ? "font-bold text-foreground"
                        : "font-medium text-foreground"
                }
            >
                {formatoMoneda(valor)}
            </span>
        </div>
    );
}
