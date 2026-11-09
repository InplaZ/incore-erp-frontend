import { viabilidadApi } from "@/features/viabilidad/viabilidad.api"; //Se comunica con el backend para evaluar la viabilidad
import type {
    EvaluarViabilidadPayload, //Define estructura de los datos que se envian
    EvaluarViabilidadResponse, //Define la estructura de la respuesta del backend
} from "@/features/viabilidad/viabilidad.types";
import ViabilidadPreviaPanel from "@/features/viabilidad/requerimientos/ViabilidadPreviaPanel"; //Muestra los resultados de la evaluación
import { useProductosCategorias } from "@/features/productos/productos.hooks"; //Obtiene las categorias de productos
import { useEffect, useMemo, useState } from "react";
// ======================================================
// 1. TIPOS DEL FORMULARIO
// ======================================================

type SimuladorForm = {
    tipoProducto: "bolsa" | "bobina";
    categoriaId: string;

    // Material
    material: string;
    capas: string;
    micraje: string;

    // Dimensiones
    metros: string;

    // Características de bolsa
    sello: string;
    troquel: string;

    // Impresión
    impresion: boolean;
    carasImpresion: "una_cara" | "dos_caras";
    coloresCaraA: string;
    coloresCaraB: string;

    // Datos generales de la especificación
    aptoAlimento: boolean;
    color: string;
    tipoImpresion: string;
    tratamientoImpresion: string;
    rodilloCaraA: string;
    rodilloCaraB: string;

    // Dimensiones adicionales de bolsa

    anchoDoblado: string;
    anchoDesdoblado: string;
    largoDesdoblado: string;
    largoDoblado: string;
    fuelle: boolean;
    fuelleIzquierdo: string;
    fuelleDerecho: string;
    fuelleInferior: string;
    fuelleSuperior: string;
    pestana: string;

    // Datos adicionales de bobina
    tipoAncho: "doblado" | "desdoblado";
    diametro: string;
    diametroNucleo: string;
    tipoNucleo: string;
    configuracionPelicula: "tubular" | "corte_lateral" | "corte_separacion";
    peso: string;

    // Acabados y observaciones
    acabados: string[];
    otroAcabado: string;
    observaciones: string;

};

// Campos que almacenan texto
type StringField = {
    [K in keyof SimuladorForm]:
    SimuladorForm[K] extends string ? K : never;
}[keyof SimuladorForm];

// ======================================================
// 2. ESTADO INICIAL
// ======================================================

const initialForm: SimuladorForm = {
    tipoProducto: "bolsa",
    categoriaId: "",

    material: "",
    capas: "",
    micraje: "",

    anchoDoblado: "",
    anchoDesdoblado: "",
    largoDesdoblado: "",
    largoDoblado: "",
    metros: "",

    sello: "",
    troquel: "",

    impresion: false,
    carasImpresion: "una_cara",
    coloresCaraA: "",
    coloresCaraB: "",

    aptoAlimento: false,
    color: "",
    tipoImpresion: "corrida",
    tratamientoImpresion: "solido",
    rodilloCaraA: "",
    rodilloCaraB: "",

    fuelle: false,
    fuelleIzquierdo: "",
    fuelleDerecho: "",
    fuelleInferior: "",
    fuelleSuperior: "",
    pestana: "sin_pestana",

    tipoAncho: "desdoblado",
    diametro: "",
    diametroNucleo: "",
    tipoNucleo: "",
    configuracionPelicula: "tubular",
    peso: "",

    acabados: [],
    otroAcabado: "",
    observaciones: "",
};

// ======================================================
// 3. ESTILOS REUTILIZABLES
// ======================================================

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass =
    "mb-1.5 block text-xs font-semibold text-slate-600";

// ======================================================
// 4. COMPONENTE PRINCIPAL
// ======================================================

export default function Simulador() {

    // Estado general del formulario
    const [form, setForm] = useState<SimuladorForm>(initialForm);

    // ==================================================
    // ESTADOS DE EVALUACIÓN
    // ==================================================

    const [feasibility, setFeasibility] =
        useState<EvaluarViabilidadResponse | null>(null);

    const [evaluatedKey, setEvaluatedKey] = useState("");

    const [feasibilityError, setFeasibilityError] =
        useState<string | null>(null);

    const [checking, setChecking] = useState(false);

    const { data: categorias = [] } = useProductosCategorias();

    const activeCategorias = categorias.filter(
        (categoria) => categoria.activo
    );
    // ==================================================
    // 5. ACTUALIZAR CAMPOS
    // ==================================================

    const handleChange = <K extends keyof SimuladorForm>(
        field: K,
        value: SimuladorForm[K]
    ) => {
        setForm(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    // ==================================================
    // 6. CONSTRUIR DATOS PARA EVALUAR LA VIABILIDAD
    // ==================================================

    const payload = useMemo<EvaluarViabilidadPayload | null>(() => {
        const categoriaId = Number(form.categoriaId);

        // No podemos evaluar sin una categoría válida.
        if (!categoriaId) return null;

        return {
            previsualizar: true,

            datos_especificacion: {
                tipo_producto: form.tipoProducto,

                especificacion: {
                    categoria_producto: categoriaId,
                    material: form.material,
                    capas: form.capas,
                    apto_alimento: form.aptoAlimento,
                    micraje: form.micraje || null,
                    color_bolsa: form.color,
                    impresion: form.impresion,

                    tipo_impresion: form.tipoImpresion,
                    tratamiento_impresion: form.tratamientoImpresion,

                    cara_impresion: form.impresion
                        ? form.carasImpresion
                        : "",

                    colores_cara_a:
                        form.impresion && form.coloresCaraA !== ""
                            ? Number(form.coloresCaraA)
                            : null,

                    colores_cara_b:
                        form.impresion &&
                            form.carasImpresion === "dos_caras" &&
                            form.coloresCaraB !== ""
                            ? Number(form.coloresCaraB)
                            : null,

                    rodillo_cara_a: form.impresion
                        ? form.rodilloCaraA.trim() || null
                        : null,

                    rodillo_cara_b:
                        form.impresion && form.carasImpresion === "dos_caras"
                            ? form.rodilloCaraB.trim() || null
                            : null,

                    opacidad: "",
                    tratamientos_acabados_especiales: [
                        ...form.acabados.filter(v => v !== "otro"),
                        ...(form.acabados.includes("otro") && form.otroAcabado.trim()
                            ? [form.otroAcabado.trim().toLowerCase()]
                            : []),
                    ],

                    otras_caracteristicas: form.observaciones,
                },

                ...(form.tipoProducto === "bolsa"
                    ? {
                        especificacion_bolsa: {
                            ancho_doblado: form.anchoDoblado || null,

                            ancho_desdoblado:
                                form.anchoDesdoblado || form.anchoDoblado || null,

                            largo_doblado: form.largoDoblado || null,
                            largo_desdoblado: form.largoDesdoblado || null,

                            fuelle: form.fuelle,
                            fuelle_izquierdo: form.fuelleIzquierdo || null,
                            fuelle_derecho: form.fuelleDerecho || null,
                            fuelle_inferior: form.fuelleInferior || null,
                            fuelle_superior: form.fuelleSuperior || null,

                            // Campos que faltaban y que utiliza Confección.
                            tipo_troquel: form.troquel,
                            tipo_sello: form.sello,
                            pestana: form.pestana,

                            acabado_especial: [
                                ...form.acabados.filter(v => v !== "otro"),
                                ...(form.acabados.includes("otro") && form.otroAcabado.trim()
                                    ? [form.otroAcabado.trim().toLowerCase()]
                                    : []),
                            ].join(","),

                            otras_caracteristicas: form.observaciones,
                        }
                    }
                    : {
                        especificacion_bobina: {
                            ancho: form.anchoDoblado || null,
                            tipo_ancho: form.tipoAncho,
                            diametro: form.diametro || null,
                            diametro_nucleo: form.diametroNucleo || null,
                            tipo_nucleo: form.tipoNucleo,
                            peso: form.peso || null,
                            configuracion_pelicula: form.configuracionPelicula,
                            otras_caracteristicas: form.observaciones,
                        },
                    }),
            },
        };
    }, [form]);

    // ==================================================
    // 7. CONTROLAR CUÁNDO SE PUEDE EVALUAR
    // ==================================================

    const payloadKey = JSON.stringify(payload);

    const isReadyForFeasibility = Boolean(
        payload &&
        form.material &&
        form.capas &&
        form.micraje
    );

    // ==================================================
    // 7. GENERAR INPUTS REUTILIZABLES
    // ==================================================

    const renderInput = (
        label: string,
        field: StringField,
        type: "text" | "number" = "text"
    ) => {
        return (
            <label className="block">
                <span className={labelClass}>
                    {label}
                </span>

                <input
                    type={type}
                    min={type === "number" ? 0 : undefined}
                    step={type === "number" ? "any" : undefined}
                    className={inputClass}
                    value={form[field]}
                    onChange={(e) =>
                        setForm(prev => ({
                            ...prev,
                            [field]: e.target.value,
                        }))
                    }
                />
            </label>
        );
    };
    // ==================================================
    // 8. EVALUAR VIABILIDAD AUTOMÁTICAMENTE
    // ==================================================

    useEffect(() => {
        if (!isReadyForFeasibility || !payload) return;

        const controller = new AbortController();

        const timer = window.setTimeout(async () => {
            setChecking(true);
            setFeasibilityError(null);

            try {
                const result = await viabilidadApi.evaluarProducto(
                    payload,
                    controller.signal
                );

                setFeasibility(result);
                setEvaluatedKey(payloadKey);

            } catch (e) {
                if (!controller.signal.aborted) {
                    const error = e as {
                        response?: {
                            data?: {
                                detail?: string;
                                mensaje?: string;
                            };
                        };
                        details?: unknown;
                        message?: string;
                    };

                    const response = error.response?.data;
                    const details = error.details;

                    const detailText =
                        typeof details === "string"
                            ? details
                            : details && typeof details === "object"
                                ? Object.values(
                                    details as Record<string, unknown>
                                )
                                    .flat()
                                    .map(String)
                                    .join(" ")
                                : "";

                    setFeasibilityError(
                        response?.mensaje ||
                        response?.detail ||
                        detailText ||
                        error.message ||
                        "No se pudo consultar la viabilidad."
                    );

                    setEvaluatedKey(payloadKey);
                }

            } finally {
                if (!controller.signal.aborted) {
                    setChecking(false);
                }
            }
        }, 450);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };

    }, [payload, payloadKey, isReadyForFeasibility]);

    // ==================================================
    // 8. GENERAR SELECTORES REUTILIZABLES
    // ==================================================

    const renderSelect = (
        label: string,
        field: StringField,
        options: { value: string; label: string }[]
    ) => {
        return (
            <label className="block">
                <span className={labelClass}>
                    {label}
                </span>

                <select
                    className={inputClass}
                    value={form[field]}
                    onChange={(e) =>
                        setForm(prev => ({
                            ...prev,
                            [field]: e.target.value,
                        }))
                    }
                >
                    <option value="">
                        Seleccionar...
                    </option>

                    {options.map(option => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
            </label>
        );
    };

    // ==================================================
    // 9. INTERFAZ PRINCIPAL
    // ==================================================

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">

            {/* ENCABEZADO */}

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    Simulador de factibilidad
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Disponible para Ventas y Producción, con las
                    mismas reglas del formulario técnico.
                </p>
            </div>

            {/* DISTRIBUCIÓN PRINCIPAL */}

            <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">

                {/* COLUMNA IZQUIERDA: FORMULARIO */}

                <div className="rounded-xl border border-slate-200 bg-white p-5">

                    <h2 className="mb-5 text-base font-bold text-slate-800">
                        Parámetros para simulación
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                        {/* CATEGORÍA DEL PRODUCTO */}
                        <label className="block">
                            <span className={labelClass}>
                                Categoría del producto
                            </span>

                            <select
                                className={inputClass}
                                value={form.categoriaId}
                                onChange={(e) => {
                                    const selected = activeCategorias.find(
                                        (category) => String(category.id) === e.target.value
                                    );

                                    const name = selected?.nombre.trim().toLowerCase();

                                    handleChange("categoriaId", e.target.value);

                                    if (name?.includes("bobina")) {
                                        handleChange("tipoProducto", "bobina");
                                    } else if (name?.includes("bolsa")) {
                                        handleChange("tipoProducto", "bolsa");
                                    }
                                }}
                            >
                                <option value="">Seleccionar categoría...</option>

                                {activeCategorias.map((category) => (
                                    <option
                                        key={category.id}
                                        value={String(category.id)}
                                    >
                                        {category.nombre}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* MATERIAL */}

                        {renderSelect("Material", "material", [
                            { value: "PEBD", label: "PEBD" },
                            { value: "PEAD", label: "PEAD" },
                            { value: "PP", label: "PP" },
                            { value: "BOPP", label: "BOPP" },
                            { value: "OTRO", label: "Otro" },
                        ])}

                        {/* CAPAS */}

                        {renderSelect("Capas", "capas", [
                            { value: "monocapa", label: "Monocapa" },
                            { value: "bicapa", label: "Bicapa" },
                            { value: "tricapa", label: "Tricapa" },
                        ])}

                        {/* ESPESOR */}

                        {renderInput(
                            "Espesor (µm)",
                            "micraje",
                            "number"
                        )}

                        {/* ANCHO */}
                        {renderInput(
                            form.tipoProducto === "bolsa"
                                ? "Ancho de bolsa (cm)"
                                : "Ancho de bobina (cm)",
                            "anchoDoblado",
                            "number"
                        )}

                        {/* LARGO O METROS */}
                        {form.tipoProducto === "bolsa" ? (
                            renderInput(
                                "Largo de bolsa (cm)",
                                "largoDesdoblado",
                                "number"
                            )
                        ) : (
                            renderInput(
                                "Metros por rollo",
                                "metros",
                                "number"
                            )
                        )}

                        {/* SELLO */}

                        {form.tipoProducto === "bolsa" &&
                            renderSelect("Sello", "sello", [
                                { value: "fondo", label: "Fondo" },
                                { value: "lateral", label: "Lateral" },
                            ])}

                        {/* TROQUEL */}

                        {form.tipoProducto === "bolsa" &&
                            renderSelect("Troquel", "troquel", [
                                { value: "plana", label: "Plana" },
                                { value: "camiseta", label: "Camiseta" },
                                { value: "boutique", label: "Boutique" },
                                { value: "boutique_reforzada", label: "Boutique reforzada" },
                                { value: "rinonera", label: "Rinonera" },
                                { value: "asa", label: "Asa" },
                                { value: "solapa", label: "Solapa" },
                                { value: "adhesiva", label: "Adhesiva" },
                                { value: "cierre_facil", label: "Cierre fácil" },
                                { value: "sello_doble_fondo", label: "Sello doble fondo" }
                            ])}

                    </div>

                    {/* CONFIGURACIÓN DE IMPRESIÓN */}

                    <div className="mt-6 border-t border-slate-200 pt-5">

                        <h3 className="mb-4 text-sm font-bold text-slate-800">
                            Configuración de impresión
                        </h3>

                        <label className="flex items-center gap-2 text-sm text-slate-700">

                            <input
                                type="checkbox"
                                checked={form.impresion}
                                onChange={(e) =>
                                    handleChange(
                                        "impresion",
                                        e.target.checked
                                    )
                                }
                                className="h-4 w-4 accent-blue-600"
                            />

                            Producto con impresión

                        </label>

                        {form.impresion && (
                            <div className="mt-4 space-y-4">

                                {/* CARAS DE IMPRESIÓN */}

                                {renderSelect(
                                    "Caras de impresión",
                                    "carasImpresion",
                                    [
                                        {
                                            value: "una_cara",
                                            label: "Una cara",
                                        },
                                        {
                                            value: "dos_caras",
                                            label: "Dos caras",
                                        },
                                    ]
                                )}

                                <div className="grid gap-4 sm:grid-cols-2">

                                    {/* COLORES CARA A */}

                                    {renderInput(
                                        "Colores cara A",
                                        "coloresCaraA",
                                        "number"
                                    )}

                                    {/* COLORES CARA B */}

                                    {form.carasImpresion === "dos_caras" &&
                                        renderInput(
                                            "Colores cara B",
                                            "coloresCaraB",
                                            "number"
                                        )}

                                </div>
                            </div>
                        )}

                    </div>

                    {/* NOTA INFORMATIVA */}

                    <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-3">

                        <p className="text-xs leading-5 text-blue-800">
                            El ancho corresponde al material desarrollado
                            total, incluidos los fuelles. Los rangos de
                            los equipos se consultarán desde la
                            configuración productiva.
                        </p>

                    </div>

                </div>

                {/* COLUMNA DERECHA: RESULTADOS */}

                <aside className="rounded-xl border border-slate-200 bg-white p-5">

                    <h2 className="mb-5 text-base font-bold text-slate-800">
                        Compatibilidad por área y máquina
                    </h2>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                        <p className="text-sm font-semibold text-slate-700">
                            Esperando evaluación
                        </p>

                        <ViabilidadPreviaPanel
                            resultado={
                                evaluatedKey === payloadKey
                                    ? feasibility
                                    : null
                            }
                            cargando={
                                checking ||
                                (isReadyForFeasibility && evaluatedKey !== payloadKey)
                            }
                            error={
                                evaluatedKey === payloadKey
                                    ? feasibilityError
                                    : null
                            }
                        />

                    </div>

                </aside>

            </div>

        </div>
    );
}
