import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, ChevronLeft, ChevronRight, LoaderCircle, X } from "lucide-react";
import { useProductos, useProductosCategorias, useCreateProductoComercial } from "@/features/productos/productos.hooks";
import type { ProductoComercialCreado } from "@/features/productos/productos.types";
import { viabilidadApi } from "@/features/viabilidad/viabilidad.api";
import type { EvaluarViabilidadPayload, EvaluarViabilidadResponse } from "@/features/viabilidad/viabilidad.types";
import ViabilidadPreviaPanel from "@/features/viabilidad/requerimientos/ViabilidadPreviaPanel";
import type { ProductoComercialCreate } from "./productos.types";
import { api } from "@/api/api.config";
const steps = [
  "Aplicación",
  "Características físicas",
  "Impresión, arte y diseño",
  "Cantidad y peso",
  "Observaciones"
];
const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1.5 block text-xs font-semibold text-slate-600";

type PesosProductoResponse = {
  exito: boolean;
  peso_unitario_kg: string | number | null;
  peso_total_kg: string | number | null;
  mensaje?: string;
};
// Estado local del formulario. Se transforma al guardar en ProductoComercialCreate;
// no representa una entidad paralela ni se persiste en localStorage.
type Wizard = {
  name: string; productType: "bolsa" | "bobina";
  categoria: string; subcategoria: string;
  application: string; use: string; content: string; food: boolean;
  material: string; layers: string; micraje: string; color: string;
  width: string; widthFlat: string; length: string; foldLength: string;
  fuelle: boolean;
  sides: string[];
  sideMeasures: Record<string, string>;
  sideSymmetry: "simetrico" | "asimetrico";
  commonSideMeasure: string;
  filmCutSides: string[];
  troquel: string; sello: string; pestana: string; meters: string; diameter: string;
  coreDiameter: string; coreType: string; weight: string;
  impression: boolean;
  printType: string;
  printTreatment: string;
  printFace: string;
  printRollerFaceA: string;
  printRollerFaceB: string;
  printTypeFaceA: string;
  printTypeFaceB: string;
  printArtNameFaceA: string;
  printArtNameFaceB: string;
  designReference: string;
  referenceFile: File | null;
  printColors: string;
  colorsFaceA: string;
  colorsFaceB: string;
  designId: string;
  unit: "unidad" | "kg" | "rollos"; unitsPerPack: string;
  packagesPerJaba: string; jabasPerBundle: string; finishes: string[]; otherFinish: string; notes: string;
  quantity: string;
  filmConfig: "tubular" | "corte_lateral" | "corte_separacion";
  bobinaFinishes: string[];
  widthType: "doblado" | "desdoblado";
  // Fuelle exclusivo de bobina
  bobinaSides: string[];
  bobinaSideMeasures: Record<string, string>;
  bobinaSideSymmetry: "simetrico" | "asimetrico";
  bobinaCommonSideMeasure: string;

};


const initialForm: Wizard = {
  name: "", productType: "bolsa", categoria: "", subcategoria: "", application: "Comercio y supermercados",
  use: "", content: "", food: false, material: "PEBD", layers: "monocapa", micraje: "", color: "",
  width: "", widthFlat: "", length: "", foldLength: "",
  fuelle: false,
  sides: [],
  sideMeasures: { Arriba: "", Abajo: "", Izquierda: "", Derecha: "" },
  sideSymmetry: "simetrico",
  commonSideMeasure: "",
  filmCutSides: [],
  troquel: "plana", sello: "fondo",
  pestana: "sin_pestana", meters: "", diameter: "", coreDiameter: "", coreType: "", weight: "",
  impression: false,
  printType: "corrida",
  printTreatment: "solido",
  printFace: "una_cara",
  printRollerFaceA: "",
  printRollerFaceB: "",
  printTypeFaceA: "corrida",
  printTypeFaceB: "corrida",
  printArtNameFaceA: "",
  printArtNameFaceB: "",
  designReference: "",
  referenceFile: null,
  colorsFaceA: "",
  colorsFaceB: "",
  printColors: "",
  designId: "", unit: "unidad", unitsPerPack: "0", packagesPerJaba: "0", jabasPerBundle: "0",
  finishes: [], otherFinish: "", notes: "",
  quantity: "",
  filmConfig: "tubular",
  bobinaFinishes: [],
  widthType: "desdoblado",
  bobinaSides: [],
  bobinaSideMeasures: {
    Izquierda: "",
    Derecha: "",
  },
  bobinaSideSymmetry: "simetrico",
  bobinaCommonSideMeasure: "",
};

// Opciones de presentación del formulario. Los valores enviados al backend
// permanecen separados de las etiquetas legibles que ve el usuario.
const materials = ["PEBD", "PEAD", "PP", "BOPP", "OTRO"];
const layers = [["monocapa", "Monocapa"], ["bicapa", "Bicapa"], ["tricapa", "Tricapa"]];
const applications = ["Empaque primario alimenticio", "Empaque secundario alimenticio", "Empaque industrial", "Agricultura y horticultura", "Comercio y supermercados", "Textil y confecciones", "Presentación de marca", "Agrupación y transporte", "Higiene y limpieza", "Otros usos"];
const sides = ["Arriba", "Abajo", "Izquierda", "Derecha"];
const troqueles = [
  { value: "plana", label: "Plana" },
  { value: "camiseta", label: "Camiseta" },
  { value: "boutique", label: "Boutique" },
  { value: "asa", label: "Con asa" },
  { value: "boutique_reforzada", label: "Boutique reforzada" },
  { value: "solapa", label: "Solapa" },
  { value: "adhesiva", label: "Cinta adhesiva" },
  { value: "cierre_facil", label: "Cinta cierre fácil" },
  { value: "sello_doble_fondo", label: "Sello doble fondo" },
];

type TroquelSVGProps = {
  type: string;
};

function TroquelSVG({ type }: TroquelSVGProps) {
  const bolsa = (
    <rect
      x="25"
      y="18"
      width="70"
      height="100"
      rx="2"
      fill="#e8f1fa"
      stroke="#52677d"
      strokeWidth="2"
    />
  );

  let dibujo;

  switch (type) {
    case "camiseta":
      dibujo = (
        <path
          d="M20 118 V18 H43 V51 H55 V45 Q60 39 65 45 V51 H77 V18 H100 V118 Z"
          fill="#e8f1fa"
          stroke="#52677d"
          strokeWidth="2"
        />
      );
      break;

    case "boutique":
      dibujo = (
        <>
          {bolsa}
          <rect
            x="42"
            y="30"
            width="36"
            height="11"
            rx="5"
            fill="white"
            stroke="#52677d"
            strokeWidth="2"
          />
        </>
      );
      break;

    case "asa":
      dibujo = (
        <>
          <path
            d="M25 41 H95 V118 H25 Z"
            fill="#e8f1fa"
            stroke="#52677d"
            strokeWidth="2"
          />
          <path
            d="M46 42 V25 Q46 5 60 5 Q75 5 75 25 V42"
            fill="none"
            stroke="#657585"
            strokeWidth="7"
          />
        </>
      );
      break;

    case "boutique_reforzada":
      dibujo = (
        <>
          {bolsa}
          <rect
            x="33"
            y="21"
            width="54"
            height="34"
            rx="2"
            fill="#c3d5e6"
            stroke="#7d9ab6"
            strokeWidth="1"
          />
          <rect
            x="42"
            y="29"
            width="36"
            height="12"
            rx="6"
            fill="white"
            stroke="#52677d"
            strokeWidth="2"
          />
        </>
      );
      break;

    case "solapa":
      dibujo = (
        <>
          {bolsa}
          <rect
            x="25"
            y="6"
            width="70"
            height="25"
            fill="#c5d6e6"
            stroke="#52677d"
            strokeWidth="2"
          />
          <path
            d="M25 18 H95"
            stroke="#7c94b0"
            strokeDasharray="4 3"
          />
        </>
      );
      break;

    case "adhesiva":
      dibujo = (
        <>
          {bolsa}
          <rect
            x="25"
            y="28"
            width="70"
            height="20"
            fill="#c7d7e7"
          />
          <path
            d="M25 28 H95"
            stroke="#4f6276"
            strokeWidth="4"
          />
        </>
      );
      break;

    case "cierre_facil":
      dibujo = (
        <>
          {bolsa}
          <path
            d="M25 31 H95 M25 37 H95"
            stroke="#677f97"
            strokeWidth="3"
          />
          <circle cx="34" cy="34" r="4" fill="#46596e" />
        </>
      );
      break;

    case "doble_sello_fondo":
      dibujo = (
        <>
          {bolsa}
          <path
            d="M25 24 H95 V31 H25 Z M25 105 H95 V112 H25 Z"
            fill="#91b9d5"
            stroke="#52677d"
            strokeWidth="1"
          />
          <path
            d="M25 31 H95 M25 105 H95"
            stroke="#315f8b"
            strokeWidth="1.5"
          />
          <text
            x="60"
            y="129"
            textAnchor="middle"
            fontSize="6"
            fill="#52677d"
          >
            2 sellos
          </text>
        </>
      );
      break;

    case "normal":
    default:
      dibujo = bolsa;
      break;
  }

  return (
    <svg
      viewBox="0 0 120 135"
      role="img"
      aria-label={`Troquel ${type}`}
      className="h-24 w-full max-w-[90px]"
    >
      {dibujo}
    </svg>
  );
}

type FuelleSVGProps = {
  sides: string[];
};

function FuelleSVG({ sides }: FuelleSVGProps) {
  return (
    <svg
      viewBox="0 0 175 197"
      className="w-full max-w-[170px]"
      role="img"
      aria-label="Ubicaciones de fuelle"
    >
      <rect
        x="35"
        y="30"
        width="105"
        height="138"
        rx="4"
        fill="#e8f1f9"
        stroke="#567083"
        strokeWidth="2"
      />

      {sides.includes("Arriba") && (
        <path
          d="M38 35 L87 53 L137 35 M38 43 L87 61 L137 43"
          fill="none"
          stroke="#1c77b7"
          strokeWidth="3"
        />
      )}

      {sides.includes("Abajo") && (
        <path
          d="M38 163 L87 145 L137 163 M38 155 L87 137 L137 155"
          fill="none"
          stroke="#1c77b7"
          strokeWidth="3"
        />
      )}

      {sides.includes("Izquierda") && (
        <path
          d="M39 34 L58 99 L39 164 M47 34 L66 99 L47 164"
          fill="none"
          stroke="#1c77b7"
          strokeWidth="3"
        />
      )}

      {sides.includes("Derecha") && (
        <path
          d="M137 34 L117 99 L137 164 M129 34 L109 99 L129 164"
          fill="none"
          stroke="#1c77b7"
          strokeWidth="3"
        />
      )}

      <text
        x="87"
        y="103"
        fontSize="10"
        textAnchor="middle"
        fill="#60738b"
      >
        ANCHO TOTAL
      </text>

      <text
        x="87"
        y="187"
        fontSize="10"
        textAnchor="middle"
        fill="currentColor"
      >
        FUELLES
      </text>
    </svg>
  );
}
type FilmConfigSVGProps = {
  type: "tubular" | "corte_lateral" | "corte_separacion";
};

function FilmConfigSVG({ type }: FilmConfigSVGProps) {
  return (
    <svg
      viewBox="0 0 110 64"
      className="h-16 w-28"
      role="img"
      aria-label={`Configuración ${type}`}
    >
      <ellipse
        cx="26" cy="31" rx="17" ry="23"
        fill="#d9e8f8" stroke="#567083" strokeWidth="2"
      />
      <path
        d="M26 8 H75 M26 54 H75"
        stroke="#567083"
        strokeWidth="2"
      />
      <ellipse
        cx="75" cy="31" rx="17" ry="23"
        fill="#d9e8f8" stroke="#567083" strokeWidth="2"
      />
      <ellipse
        cx="75" cy="31" rx="5" ry="8"
        fill="white" stroke="#567083"
      />

      {type === "corte_lateral" && (
        <path
          d="M93 10 V52"
          stroke="#e49c31"
          strokeWidth="3"
          strokeDasharray="4 3"
        />
      )}

      {type === "corte_separacion" && (
        <path
          d="M80 31 L104 12 M80 31 L104 52"
          stroke="#e49c31"
          strokeWidth="2"
        />
      )}
    </svg>
  );
}
const finishOptions = ["aromatizada", "perforada", "antideslizante", "oxobiodegradable", "otro"];
const finishLabels: Record<string, string> = { aromatizada: "Aromatizada", perforada: "Perforada", antideslizante: "Antideslizante", oxobiodegradable: "Oxobiodegradable", otro: "Otro" };

export default function ProductoComercialWizardModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess?: (producto: ProductoComercialCreado) => void }) {
  // Estado de navegación y datos temporales de esta creación.
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Wizard>(initialForm);
  const [quantityUnit, setQuantityUnit] = useState<
    "unidad" | "kg" | "rollos"
  >("unidad");
  const [referenceId, setReferenceId] = useState("");
  const [error, setError] = useState("");
  const [feasibility, setFeasibility] = useState<EvaluarViabilidadResponse | null>(null);
  const [evaluatedKey, setEvaluatedKey] = useState("");
  const [feasibilityError, setFeasibilityError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [weights, setWeights] = useState<PesosProductoResponse | null>(null);
  const [calculatingWeight, setCalculatingWeight] = useState(false);
  const [weightError, setWeightError] = useState("");

  const create = useCreateProductoComercial();
  const { data: categories = [] } = useProductosCategorias();
  const { data: products = [] } = useProductos();
  const categoryId = Number(form.categoria) || undefined;
  const commercialProducts = useMemo(() => products.filter(p => p.estado_homologacion === "homologado"), [products]);


  // Vista previa: usa el endpoint y las reglas de viabilidad existentes.
  // La evaluación no guarda producto ni crea registros de evaluación.
  const payload = useMemo<EvaluarViabilidadPayload | null>(() => {
    if (!categoryId) return null;
    const s = form;
    return {
      datos_especificacion: {
        tipo_producto: s.productType,
        especificacion: {
          categoria_producto: categoryId, material: s.material, capas: s.layers,
          apto_alimento: s.food, micraje: s.micraje || null, color_bolsa: s.color,
          impresion: s.impression, tipo_impresion: s.printType,
          tratamiento_impresion: s.printTreatment,
          cara_impresion: s.impression ? s.printFace : "",

          // Colores requeridos por cada cara
          colores_cara_a: s.impression && s.colorsFaceA !== ""
            ? Number(s.colorsFaceA)
            : null,
          colores_cara_b: s.impression && s.printFace === "dos_caras" && s.colorsFaceB !== ""
            ? Number(s.colorsFaceB)
            : null,

          // Rodillos requeridos por cada cara
          rodillo_cara_a: s.impression ? s.printRollerFaceA.trim() || null : null,
          rodillo_cara_b: s.impression && s.printFace === "dos_caras"
            ? s.printRollerFaceB.trim() || null
            : null,

          opacidad: "", tratamientos_acabados_especiales: s.finishes, otras_caracteristicas: s.notes,
        },
        ...(s.productType === "bolsa" ? {
          especificacion_bolsa: {
            ancho_doblado: s.width,
            ancho_desdoblado: s.widthFlat || null,
            largo_doblado: s.length,
            largo_desdoblado: s.foldLength || null,
            fuelle: s.fuelle, fuelle_izquierdo: s.sideMeasures.Izquierda || null,
            fuelle_derecho: s.sideMeasures.Derecha || null, fuelle_inferior: s.sideMeasures.Abajo || null,
            fuelle_superior: s.sideMeasures.Arriba || null, tipo_troquel: s.troquel,
            tipo_sello: s.sello, pestana: s.pestana,
            acabado_especial: [...s.finishes.filter(v => v !== "otro"), ...(s.finishes.includes("otro") && s.otherFinish ? [s.otherFinish.trim().toLowerCase()] : [])].join(","),
            otras_caracteristicas: s.troquel === "sello_doble_fondo"
              ? `Sello doble fondo. ${s.notes}`.trim()
              : s.notes,
          }
        } : {
          especificacion_bobina: {
            ancho: s.width,
            tipo_ancho: s.widthType,
            diametro: s.diameter || null,
            diametro_nucleo: s.coreDiameter || null,
            longitud: s.meters || null,
            tipo_nucleo: s.coreType,
            peso: s.weight || null,
            configuracion_pelicula: s.filmConfig,
            otras_caracteristicas: s.notes,
          }
        }),
      },
    };
  }, [categoryId, form]);

  const payloadKey = JSON.stringify(payload);
  const weightPayload = payload?.datos_especificacion ?? null;
  const isReadyForFeasibility = Boolean(open && payload && form.material && form.layers && form.micraje);

  // Calcula el peso usando el endpoint existente; no duplica la fórmula en el frontend.
  useEffect(() => {
    let vigente = true;

    const cantidad = Number(form.quantity);

    // Para convertir desde kg, consultamos primero el peso de una unidad.
    const cantidadParaCalculo = quantityUnit === "kg" ? 1 : cantidad;

    if (
      !open ||
      !categoryId ||
      !weightPayload ||
      !form.quantity.trim() ||
      !Number.isFinite(cantidad) ||
      cantidad <= 0 ||
      !form.material ||
      !form.micraje ||
      !form.width ||
      (form.productType === "bolsa" ? !form.length : !form.meters)
    ) {
      setWeights(null);
      setCalculatingWeight(false);
      setWeightError("");
      return;
    }

    const timer = window.setTimeout(async () => {
      setCalculatingWeight(true);
      setWeightError("");

      try {
        console.log(
          "PAYLOAD PESO:",
          JSON.stringify(
            {
              cantidad,
              datos_especificacion: weightPayload,
            },
            null,
            2,
          ),
        );
        const resultado = await api.post<PesosProductoResponse>(
          "/comercial/cotizaciones/calcular-peso/",
          {
            cantidad: cantidadParaCalculo,
            datos_especificacion: weightPayload,
          },
        );

        console.log("Respuesta del cálculo de peso:", resultado);
        console.log("Payload enviado:", {
          cantidad,
          datos_especificacion: weightPayload,
        });

        if (vigente) {
          const datos = resultado;

          setWeights(datos);

          if (!datos.exito || datos.peso_unitario_kg == null || datos.peso_total_kg == null) {
            setWeightError(
              datos.mensaje || "El servidor no devolvió los pesos calculados.",
            );
          } else {
            setWeightError("");
          }
        }
      } catch {
        if (vigente) {
          setWeights(null);
          setWeightError(
            "No se pudo calcular el peso. Verifica los datos de la especificación.",
          );
        }
      } finally {
        if (vigente) setCalculatingWeight(false);
      }
    }, 400);

    return () => {
      vigente = false;
      window.clearTimeout(timer);
    };
  }, [
    open,
    categoryId,
    form.quantity,
    form.material,
    form.micraje,
    form.width,
    form.length,
    form.meters,
    form.productType,
    quantityUnit,
    weightPayload,
  ]);
  useEffect(() => {
    if (!isReadyForFeasibility || !payload) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setChecking(true); setFeasibilityError(null);
      try {
        const result = await viabilidadApi.evaluarProducto(payload, controller.signal);
        setFeasibility(result); setEvaluatedKey(payloadKey);
      }
      catch (e) {
        if (!controller.signal.aborted) {
          const error = e as { response?: { data?: { detail?: string; mensaje?: string } }; details?: unknown; message?: string };
          const response = error.response?.data;
          const details = error.details;
          const detailText = typeof details === "string" ? details : details && typeof details === "object" ? Object.values(details as Record<string, unknown>).flat().map(String).join(" ") : "";
          setFeasibilityError(response?.mensaje || response?.detail || detailText || error.message || "No se pudo consultar la viabilidad."); setEvaluatedKey(payloadKey);
        }
      } finally { if (!controller.signal.aborted) setChecking(false); }
    }, 450);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [open, payload, payloadKey, isReadyForFeasibility]);

  if (!open) return null;
  const set = <K extends keyof Wizard>(key: K, value: Wizard[K]) => setForm(current => ({ ...current, [key]: value }));
  const activeCategories = categories.filter(c => c.activo);
  const field = (label: string, key: keyof Wizard, props: { type?: string; required?: boolean; placeholder?: string; options?: string[] } = {}) => (
    <label className="block"><span className={labelClass}>{label}{props.required && <b className="text-red-500"> *</b>}</span>
      {props.options ? <select className={inputClass} value={String(form[key])} required={props.required} onChange={e => set(key, e.target.value as never)}><option value="">Seleccionar</option>{props.options.map(v => <option key={v} value={v}>{v}</option>)}</select> :
        <input className={inputClass} type={props.type ?? "text"} min={props.type === "number" ? "0" : undefined} step={props.type === "number" ? "any" : undefined} required={props.required} placeholder={props.placeholder} value={String(form[key] ?? "")} onChange={e => set(key, e.target.value as never)} />}
    </label>
  );
  const sectionTitle = (title: string, subtitle: string) => <div className="mb-4"><h3 className="font-semibold text-slate-800">{title}</h3><p className="text-xs text-slate-500">{subtitle}</p></div>;
  const toggle = (label: string, checked: boolean, onChange: (value: boolean) => void) => <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="h-4 w-4 accent-blue-600" />{label}</label>;

  // Copia especificaciones de una referencia homologada a este formulario;
  // no cambia ni homologa el producto de referencia.
  const loadReference = async () => {
    const chosen = commercialProducts.find(p => p.id === Number(referenceId));
    if (!chosen) return;
    try {
      const catalog = await (await import("./productos.api")).productosApi.buscarCatalogo({ q: chosen.codigo, por_pagina: 20 });
      const ref = catalog.productos.find(p => p.producto_id === chosen.id);
      if (!ref) { setError("La ficha homologada no tiene una versión visible en el catálogo."); return; }
      const category = activeCategories.find(c => c.nombre === ref.categoria);
      setForm(prev => ({
        ...prev, name: prev.name || ref.producto_nombre, categoria: category ? String(category.id) : prev.categoria,
        material: ref.material, layers: ref.capas || prev.layers, micraje: String(ref.micraje ?? ""), impression: ref.impresion,
        color: ref.color_bolsa, width: String(ref.especificacion_bolsa?.ancho_doblado ?? ref.especificacion_bobina?.ancho ?? ""),
        widthFlat: String(ref.especificacion_bolsa?.ancho_desdoblado ?? ""), length: String(ref.especificacion_bolsa?.largo_doblado ?? ""),
        meters: String(ref.especificacion_bobina?.longitud ?? ""), diameter: String(ref.especificacion_bobina?.diametro ?? ""),
        coreDiameter: String(ref.especificacion_bobina?.diametro_nucleo ?? ""), coreType: ref.especificacion_bobina?.tipo_nucleo ?? prev.coreType,
        weight: String(ref.especificacion_bobina?.peso ?? ""), sello: ref.especificacion_bolsa?.tipo_sello ?? prev.sello,
        troquel: ref.especificacion_bolsa?.tipo_troquel ?? prev.troquel
      }));
      if (ref.especificacion_bobina) set("productType", "bobina");
      else if (ref.especificacion_bolsa) set("productType", "bolsa");
      setError("");
    } catch { setError("No se pudo cargar la referencia homologada."); }
  };

  // Construye el contrato de creación del módulo Productos y lo envía a la API.
  const save = async () => {
    setError("");
    if (!categoryId) { setError("Selecciona una categoría activa del catálogo."); setStep(0); return; }
    if (!form.name.trim()) { setError("Indica el nombre o denominación del producto."); setStep(0); return; }
    if (!form.width || !form.length && form.productType === "bolsa" || !form.meters && form.productType === "bobina") {
      setError("Completa las dimensiones requeridas para el tipo de producto."); setStep(1); return;
    }
    const description = [
      `Aplicación prevista: ${form.application}`,
      form.use && `Uso específico: ${form.use}`,
      form.content && `Contenido: ${form.content}`,
    ].filter(Boolean).join("\n");
    const versionObservations = [form.notes, form.designId ? `Diseño asociado: ${form.designId}` : ""].filter(Boolean).join("\n");
    const request: ProductoComercialCreate = {
      producto: { categoria: categoryId, subcategoria: Number(form.subcategoria) || null, nombre: form.name.trim(), descripcion: description, unidad_medida: form.unit },
      version: {
        material: form.material, capas: form.layers, apto_alimento: form.food, micraje: form.micraje || null,
        color_bolsa: form.color, impresion: form.impression, tipo_impresion: form.printType,
        cara_impresion: form.impression ? form.printFace : null, tratamiento_impresion: form.printTreatment,
        color_impresion: form.printColors.split(",").map(v => v.trim()).filter(Boolean), diseno: Number(form.designId) || null,
        metros: form.productType === "bobina" ? form.meters || null : null, observaciones: versionObservations
      },
      ...(form.productType === "bolsa" ? {
        especificacion_bolsa: {
          ancho_doblado: form.width, ancho_desdoblado: form.widthFlat || null,
          largo_doblado: form.length, largo_desdoblado: form.foldLength || null, fuelle: form.fuelle,
          fuelle_izquierdo: form.sideMeasures.Izquierda || null, fuelle_derecho: form.sideMeasures.Derecha || null,
          fuelle_inferior: form.sideMeasures.Abajo || null, fuelle_superior: form.sideMeasures.Arriba || null,
          tipo_troquel: form.troquel, tipo_sello: form.sello, pestana: form.pestana,
          acabado_especial: [...form.finishes.filter(v => v !== "otro"), ...(form.finishes.includes("otro") && form.otherFinish.trim() ? [form.otherFinish.trim().toLowerCase()] : [])].join(","), otras_caracteristicas: form.notes
        }
      } : {
        especificacion_bobina: {
          ancho: form.width,
          configuracion_pelicula: form.filmConfig,
          diametro: form.diameter || null, diametro_nucleo: form.coreDiameter || null, tipo_nucleo: form.coreType,
          peso: form.weight || null, longitud: form.meters || null, otras_caracteristicas: form.notes
        }
      }),
      ...(form.productType === "bolsa" ? { presentacion: { unidades_por_fajo: Number(form.unitsPerPack) || 0, paquetes_por_jaba: Number(form.packagesPerJaba) || 0, jabas_por_bulto: Number(form.jabasPerBundle) || 0 } } : {}),
    };
    try { const producto = await create.mutateAsync(request); onSuccess?.(producto); onClose(); }
    catch (e) {
      const response = (e as { response?: { data?: Record<string, unknown> } }).response?.data;
      const detail = response ? Object.values(response).flat().map(String).join(" ") : "";
      setError(detail || "No se pudo guardar el producto comercial. Revisa los datos e inténtalo otra vez.");
    }
  };

  // Validaciones de navegación entre pasos, antes de permitir avanzar.

  const validateStep = (stepToValidate: number): string | null => {
    if (stepToValidate === 0) {
      if (!form.name.trim()) {
        return "Ingresa el nombre o denominación del producto.";
      }
      if (!form.categoria) {
        return "Selecciona una categoría para continuar.";
      }
    }

    if (stepToValidate === 1) {
      if (!form.material || !form.layers) {
        return "Selecciona el material y el número de capas.";
      }
      if (!form.micraje.trim() || Number(form.micraje) <= 0) {
        return "Ingresa un espesor mayor que cero.";
      }
      if (!form.width.trim() || Number(form.width) <= 0) {
        return "Ingresa un ancho mayor que cero.";
      }
      if (
        form.productType === "bobina" &&
        (!form.meters.trim() || Number(form.meters) <= 0)
      ) {
        return "Ingresa una longitud de bobina mayor que cero.";
      }
      if (form.productType === "bolsa" && form.finishes.length > 1) {
        return "Solo puedes seleccionar un acabado especial.";
      }
      if (
        form.productType === "bolsa" &&
        form.finishes.includes("otro") &&
        !form.otherFinish.trim()
      ) {
        return "Especifica el acabado especial seleccionado.";
      }
    }

    if (stepToValidate === 2 && form.impression) {
      if (!form.printFace) {
        return "Selecciona una o dos caras de impresión.";
      }
      if (!form.colorsFaceA.trim() || Number(form.colorsFaceA) <= 0) {
        return "Indica una cantidad válida de colores para la cara A.";
      }
      if (form.printFace === "dos_caras") {
        if (!form.colorsFaceB.trim() || Number(form.colorsFaceB) <= 0) {
          return "Indica una cantidad válida de colores para la cara B.";
        }
      }
    }

    return null;
  };

  const advance = () => {
    setError("");

    const validationError = validateStep(step);

    if (validationError) {
      setError(validationError);
      return;
    }

    setStep(current => Math.min(current + 1, steps.length - 1));
  };


  // Contenido de cada paso del wizard:
  // 0 Aplicación · 1 Características físicas · 2 Impresión · 3 Diseño
  // 4 Cantidad/presentación · 5 Observaciones y resumen.
  const stepBody = () => {
    if (step === 0) return <div className="grid gap-4 sm:grid-cols-2">
      {field("Nombre / denominación", "name", { required: true })}
      <label className="block">
        <span className={labelClass}>Categoría *</span>

        <select
          className={inputClass}
          value={form.categoria}
          required
          onChange={(e) => {
            const categoriaSeleccionada = activeCategories.find(
              (c) => String(c.id) === e.target.value
            );

            const nombreCategoria = categoriaSeleccionada?.nombre
              .trim()
              .toLowerCase();

            const nuevoTipo =
              nombreCategoria?.includes("bobina")
                ? "bobina"
                : nombreCategoria?.includes("bolsa")
                  ? "bolsa"
                  : null;

            setForm((current) => ({
              ...current,
              categoria: e.target.value,
              subcategoria: "",
              ...(nuevoTipo
                ? { productType: nuevoTipo }
                : {}),
            }));
          }}
        >
          <option value="">Seleccionar categoría</option>

          {activeCategories.map((categoria) => (
            <option key={categoria.id} value={String(categoria.id)}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="block"><span className={labelClass}>Aplicación prevista</span><select className={inputClass} value={form.application} onChange={e => set("application", e.target.value)}>{applications.map(a => <option key={a}>{a}</option>)}</select></label>
      {field("Uso específico", "use", { placeholder: "Ej. Empaque general" })}
      {field("¿Qué contendrá?", "content")}

      <div className="sm:col-span-2 rounded-lg border border-blue-100 bg-blue-50/70 p-3"><label className={labelClass}>Usar producto homologado como referencia (no lo homologa)</label><div className="flex flex-col gap-2 sm:flex-row"><select className={inputClass} value={referenceId} onChange={e => setReferenceId(e.target.value)}><option value="">Empezar desde cero</option>{commercialProducts.map(p => <option key={p.id} value={p.id}>{p.codigo} · {p.nombre}</option>)}</select><button type="button" onClick={loadReference} disabled={!referenceId} className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium disabled:opacity-50">Cargar referencia</button></div></div>
    </div>;

    if (step === 1) return <div className="space-y-5">{sectionTitle("Material y dimensiones", "Especificación asociada a la primera versión del producto")}
      <div className="grid gap-4 sm:grid-cols-3">
        {field("Material", "material", {
          options: materials,
          required: true,
        })}

        {field("Capas", "layers", {
          options: layers.map(([v]) => v),
          required: true,
        })}

        {field("Espesor (micras)", "micraje", {
          type: "number",
          required: true,
        })}

        {field("Color", "color")}

        {form.productType === "bolsa" ? (
          <>
            {field("Ancho doblado (cm)", "width", {
              type: "number",
              required: true,
            })}

            {field("Ancho desdoblado (cm)", "widthFlat", {
              type: "number",
            })}

            {field("Largo doblado (cm)", "length", {
              type: "number",
              required: true,
            })}

            {field("Largo desdoblado (cm)", "foldLength", {
              type: "number",
            })}
          </>
        ) : (
          <>
            {field("Ancho de bobina (cm)", "width", {
              type: "number",
              required: true,
            })}

            <label className="block">
              <span className={labelClass}>Tipo de ancho</span>
              <select
                className={inputClass}
                value={form.widthType}
                onChange={e => {
                  const value = e.target.value;

                  if (value === "doblado" || value === "desdoblado") {
                    set("widthType", value);
                  }
                }}
              >
                <option value="desdoblado">Ancho desdoblado</option>
                <option value="doblado">Ancho doblado</option>
              </select>
            </label>

            {field("Metros por rollo", "meters", {
              type: "number",
              required: true,
            })}
          </>
        )}
      </div>

      {form.productType === "bolsa" && (
        <div className="border-t border-slate-200 pt-4">
          <h4 className="mb-3 text-sm font-semibold">
            Fuelles · Posición y simetría
          </h4>

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(250px,350px)]">
            {/* IZQUIERDA: posiciones y medidas */}
            <div className="min-w-0">
              <div className="grid grid-cols-2 gap-3">
                {sides.map(side => (
                  <label
                    key={side}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={form.sides.includes(side)}
                      onChange={e =>
                        setForm(f => {
                          const nuevasPosiciones = e.target.checked
                            ? [...f.sides, side]
                            : f.sides.filter(x => x !== side);

                          return {
                            ...f,
                            sides: nuevasPosiciones,
                            fuelle: nuevasPosiciones.length > 0,
                          };
                        })
                      }
                    />
                    {side}
                  </label>
                ))}
              </div>

              {form.sides.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {form.sides.map(side => (
                    <label key={side} className="block">
                      <span className={labelClass}>
                        Fuelle {side} (cm)
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        className={inputClass}
                        value={form.sideMeasures[side]}
                        onChange={e =>
                          setForm(f => ({
                            ...f,
                            sideMeasures: {
                              ...f.sideMeasures,
                              [side]: e.target.value,
                            },
                          }))
                        }
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* DERECHA: dibujo dinámico */}
            <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-3">
              <FuelleSVG sides={form.sides} />
              <p className="mt-1 text-center text-xs text-slate-500">
                Las líneas azules indican las posiciones seleccionadas.
              </p>
            </div>
          </div>

          {/* TROQUEL */}
          <div className="mt-5 border-t border-slate-200 pt-4">
            <h4 className="mb-3 text-sm font-semibold">
              Troquel · Una sola opción
            </h4>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {troqueles.map(t => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => set("troquel", t.value)}
                  aria-pressed={form.troquel === t.value}
                  className={`flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-colors ${form.troquel === t.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-800 hover:border-blue-300"
                    }`}
                >
                  <TroquelSVG type={t.value} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SELLO Y PESTAÑA */}
          <div className="mt-5 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
            {field("Tipo de sello", "sello", {
              options: ["fondo", "lateral"],
            })}
            {field("Pestaña", "pestana", {
              options: ["sin_pestana", "con_pestana"],
            })}
          </div>
        </div>

      )}

      {form.productType === "bolsa" && <div className="space-y-4 border-t border-slate-200 pt-4"><h4 className="text-sm font-semibold text-slate-800">Presentación y empaquetado</h4><div className="grid gap-3 sm:grid-cols-4"><label className="block"><span className={labelClass}>Unidad base</span><input className={`${inputClass} bg-slate-50`} value="Bolsa" readOnly /></label>{field("Bolsas por paquete/fajo", "unitsPerPack", { type: "number" })}{field("Paquetes por jaba", "packagesPerJaba", { type: "number" })}{field("Jabas por bulto", "jabasPerBundle", { type: "number" })}</div><div><h4 className="mb-2 text-sm font-semibold text-slate-800">Acabados opcionales</h4><div className="flex flex-wrap gap-x-5 gap-y-2">{finishOptions.map(option => <label key={option} className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" className="h-4 w-4 accent-blue-600" checked={form.finishes.includes(option)} onChange={e => set("finishes", e.target.checked ? [...form.finishes, option] : form.finishes.filter(v => v !== option))} />{finishLabels[option]}</label>)}</div>{form.finishes.includes("otro") && <input className={`${inputClass} mt-3 max-w-md`} value={form.otherFinish} onChange={e => set("otherFinish", e.target.value)} placeholder="Especifica otro acabado" />}</div></div>}
      {/* Configuración exclusiva para bobinas */}
      {form.productType === "bobina" && (
        <div className="space-y-5 border-t border-slate-200 pt-5">
          {/* Fuelles para bobinas */}

          {/* Fuelles exclusivos de bobina */}
          <section className="border-b border-slate-200 pb-5">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">
              Fuelle de bobina · Izquierdo y derecho
            </h4>

            <div className="flex flex-wrap gap-x-5 gap-y-3">
              {(["Izquierda", "Derecha"] as const).map((side) => (
                <label
                  key={side}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={form.bobinaSides.includes(side)}
                    onChange={(e) =>
                      setForm((current) => {
                        const nextSides = e.target.checked
                          ? [...current.bobinaSides, side]
                          : current.bobinaSides.filter((item) => item !== side);

                        return {
                          ...current,
                          bobinaSides: nextSides,
                          bobinaCommonSideMeasure:
                            nextSides.length === 0 ? "" : current.bobinaCommonSideMeasure,
                          bobinaSideMeasures:
                            nextSides.length === 0
                              ? { Izquierda: "", Derecha: "" }
                              : current.bobinaSideMeasures,
                        };
                      })
                    }
                    className="h-4 w-4 accent-blue-600"
                  />
                  Fuelle {side.toLowerCase()}
                </label>
              ))}
            </div>

            {form.bobinaSides.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-5">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="bobinaSideSymmetry"
                      checked={form.bobinaSideSymmetry === "simetrico"}
                      onChange={() => set("bobinaSideSymmetry", "simetrico")}
                    />
                    Simétrico
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="bobinaSideSymmetry"
                      checked={form.bobinaSideSymmetry === "asimetrico"}
                      onChange={() => set("bobinaSideSymmetry", "asimetrico")}
                    />
                    Asimétrico
                  </label>
                </div>

                {form.bobinaSideSymmetry === "simetrico" ? (
                  <label className="block">
                    <span className={labelClass}>Medida común del fuelle (cm)</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={inputClass}
                      value={form.bobinaCommonSideMeasure}
                      onChange={(e) => set("bobinaCommonSideMeasure", e.target.value)}
                    />
                  </label>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {form.bobinaSides.map((side) => (
                      <label key={side} className="block">
                        <span className={labelClass}>
                          Fuelle {side.toLowerCase()} (cm)
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className={inputClass}
                          value={form.bobinaSideMeasures[side]}
                          onChange={(e) =>
                            setForm((current) => ({
                              ...current,
                              bobinaSideMeasures: {
                                ...current.bobinaSideMeasures,
                                [side]: e.target.value,
                              },
                            }))
                          }
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {form.bobinaSides.length === 0 && (
              <p className="mt-2 text-xs text-slate-500">
                Sin fuelles seleccionados.
              </p>
            )}
          </section>

          {/* Configuración de película */}
          <section>
            <h4 className="mb-3 text-sm font-semibold text-slate-800">
              Configuración de película / acabado
            </h4>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { value: "tubular", label: "Tubular" },
                { value: "corte_lateral", label: "Corte lateral" },
                { value: "corte_separacion", label: "Corte y separación" },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => set("filmConfig", option.value as Wizard["filmConfig"])}
                  aria-pressed={form.filmConfig === option.value}
                  className={`rounded-xl border p-5 text-sm font-semibold transition ${form.filmConfig === option.value
                    ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                    }`}
                >
                  <span className="mb-3 block text-2xl">
                    <FilmConfigSVG
                      type={option.value as FilmConfigSVGProps["type"]}
                    />

                    <span>{option.label}</span>
                  </span>
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          {/* Aditivos y acabados adicionales */}
          <section className="border-t border-slate-200 pt-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-800">
              Aditivos y acabados adicionales
            </h4>

            <div className="flex flex-wrap gap-x-5 gap-y-3">
              {[
                { value: "film_aromatizado", label: "Aromatizante" },
                { value: "antideslizante", label: "Antideslizante" },
                { value: "proteccion_uv", label: "Protección UV" },
                { value: "otro", label: "Otro" },
              ].map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-blue-600"
                    checked={form.bobinaFinishes.includes(option.value)}
                    onChange={e =>
                      set(
                        "bobinaFinishes",
                        e.target.checked
                          ? [...form.bobinaFinishes, option.value]
                          : form.bobinaFinishes.filter(
                            value => value !== option.value
                          )
                      )
                    }
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </section>
        </div>
      )}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">La factibilidad se calcula con el servicio de viabilidad de INCORE. Los criterios y rutas corresponden a la configuración productiva vigente.</div>
    </div >;

    if (step === 2) return (
      <div className="space-y-5">
        {sectionTitle(
          "Impresión",
          "Define los datos de impresión guardados en la versión técnica"
        )}

        {toggle(
          "Producto con impresión",
          form.impression,
          (value) => {
            setForm((current) => ({
              ...current,
              impression: value,
              printFace: value ? current.printFace : "una_cara",
              colorsFaceA: value ? current.colorsFaceA : "",
              colorsFaceB: "",
            }));
          }
        )}

        {form.impression && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Número de caras
              </label>

              <div className="flex flex-wrap gap-5">
                {[
                  ["una_cara", "Una cara"],
                  ["dos_caras", "Dos caras"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    <input
                      type="radio"
                      name="printFace"
                      value={value}
                      checked={form.printFace === value}
                      onChange={() =>
                        setForm((current) => ({
                          ...current,
                          printFace: value,
                          colorsFaceB:
                            value === "una_cara"
                              ? ""
                              : current.colorsFaceB,
                        }))
                      }
                      className="h-4 w-4 accent-blue-600"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div
              className={`grid gap-4 ${form.printFace === "dos_caras"
                ? "sm:grid-cols-2"
                : "sm:grid-cols-1"
                }`}
            >
              {field("Colores cara A", "colorsFaceA", {
                type: "number",
                required: true,
                placeholder: "Cantidad de colores",
              })}

              {form.printFace === "dos_caras" &&
                field("Colores cara B", "colorsFaceB", {
                  type: "number",
                  required: true,
                  placeholder: "Cantidad de colores",
                })}
            </div>
            {/* Datos técnicos de impresión por cara */}
            <div
              className={`grid gap-4 ${form.printFace === "dos_caras"
                ? "sm:grid-cols-2"
                : "sm:grid-cols-1"
                }`}
            >
              <div className="space-y-4 rounded-xl border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-800">
                  Cara A
                </h4>

                <label className="block">
                  <span className={labelClass}>N.º de rodillo cara A</span>
                  <input
                    className={inputClass}
                    value={form.printRollerFaceA}
                    onChange={e => set("printRollerFaceA", e.target.value)}
                    placeholder="Número o código del rodillo"
                  />
                </label>

                <label className="block">
                  <span className={labelClass}>Tipo de impresión cara A</span>
                  <select
                    className={inputClass}
                    value={form.printTypeFaceA}
                    onChange={e => set("printTypeFaceA", e.target.value)}
                  >
                    <option value="corrida">Corrida</option>
                    <option value="dimensionada">Dimensionada</option>
                  </select>
                </label>

                <label className="block">
                  <span className={labelClass}>Denominación arte cara A</span>
                  <input
                    className={inputClass}
                    value={form.printArtNameFaceA}
                    onChange={e => set("printArtNameFaceA", e.target.value)}
                    placeholder="Nombre del arte"
                  />
                </label>
              </div>

              {form.printFace === "dos_caras" && (
                <div className="space-y-4 rounded-xl border border-slate-200 p-4">
                  <h4 className="text-sm font-semibold text-slate-800">
                    Cara B
                  </h4>

                  <label className="block">
                    <span className={labelClass}>N.º de rodillo cara B</span>
                    <input
                      className={inputClass}
                      value={form.printRollerFaceB}
                      onChange={e => set("printRollerFaceB", e.target.value)}
                      placeholder="Número o código del rodillo"
                    />
                  </label>

                  <label className="block">
                    <span className={labelClass}>Tipo de impresión cara B</span>
                    <select
                      className={inputClass}
                      value={form.printTypeFaceB}
                      onChange={e => set("printTypeFaceB", e.target.value)}
                    >
                      <option value="corrida">Corrida</option>
                      <option value="dimensionada">Dimensionada</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className={labelClass}>Denominación arte cara B</span>
                    <input
                      className={inputClass}
                      value={form.printArtNameFaceB}
                      onChange={e => set("printArtNameFaceB", e.target.value)}
                      placeholder="Nombre del arte"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Referencia del diseño */}
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <label className="block">
                <span className={labelClass}>
                  Archivo de referencia del logo o diseño (máx. 1,5 MB)
                </span>

                <input
                  type="file"
                  accept="image/*,.pdf"
                  className={inputClass}
                  onChange={e => {
                    const file = e.target.files?.[0] ?? null;

                    if (file && file.size > 1.5 * 1024 * 1024) {
                      setError("El archivo de referencia no debe superar 1,5 MB.");
                      e.target.value = "";
                      set("referenceFile", null);
                      return;
                    }

                    setError("");
                    set("referenceFile", file);
                  }}
                />

                {form.referenceFile && (
                  <p className="mt-1 text-xs text-slate-500">
                    Archivo seleccionado: {form.referenceFile.name}
                  </p>
                )}
              </label>

              <label className="block">
                <span className={labelClass}>
                  Referencia / comentarios de diseño
                </span>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={form.designReference}
                  onChange={e => set("designReference", e.target.value)}
                  placeholder="Indicaciones adicionales del diseño..."
                />
              </label>

              <p className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-slate-600">
                En homologación será obligatorio el arte definitivo con medidas
                proporcionadas por el proveedor de clichés.
              </p>
            </div>

          </div>
        )}
        {/* Arte y diseño integrado */}
      </div>
    );

    if (step === 3) return (
      <div className="space-y-5">
        {sectionTitle("Cantidad y peso", "Indica la cantidad para consultar el peso con el cálculo existente de INCORE.")}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Cantidad a calcular *</span>

            <input
              className={inputClass}
              type="number"
              min="0.01"
              step="any"
              value={form.quantity}
              onChange={e => set("quantity", e.target.value)}
              placeholder={
                quantityUnit === "kg"
                  ? "Peso solicitado en kg"
                  : quantityUnit === "rollos"
                    ? "Cantidad de rollos"
                    : "Cantidad de bolsas"
              }
            />            <label className="block">
              <span className={labelClass}>Unidad para calcular</span>

              <select
                className={inputClass}
                value={quantityUnit}
                onChange={(e) =>
                  setQuantityUnit(e.target.value as typeof quantityUnit)
                }
              >
                <option value="unidad">Unidades</option>
                <option value="kg">Kg</option>
                {form.productType === "bobina" && (
                  <option value="rollos">Rollos</option>
                )}
              </select>
            </label>
          </label>
        </div>

        {form.productType === "bolsa" && (
          <p className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-slate-700">
            Presentación configurada en Características físicas: {form.unitsPerPack || "0"} bolsas por paquete/fajo · {form.packagesPerJaba || "0"} paquetes por jaba · {form.jabasPerBundle || "0"} jabas por bulto.
          </p>
        )}

        {calculatingWeight && (
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600" role="status">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Calculando peso…
          </div>
        )}

        {weightError && (
          <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {weightError}
          </div>
        )}

        {weights?.exito && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold text-emerald-800">
                {quantityUnit === "kg" ? "Peso solicitado" : "Peso unitario"}
              </p>

              <p className="mt-1 text-xl font-bold text-emerald-950">
                {quantityUnit === "kg"
                  ? `${Number(form.quantity).toLocaleString("es-BO", {
                    maximumFractionDigits: 3,
                  })} kg`
                  : `${Number(weights.peso_unitario_kg).toLocaleString("es-BO", {
                    maximumFractionDigits: 6,
                  })} kg`}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold text-emerald-800">
                {quantityUnit === "kg" ? "Cantidad estimada" : "Peso total"}
              </p>

              <p className="mt-1 text-xl font-bold text-emerald-950">
                {quantityUnit === "kg"
                  ? `${Math.round(
                    Number(form.quantity) /
                    Number(weights.peso_unitario_kg)
                  ).toLocaleString("es-BO")} ${form.productType === "bobina" ? "rollos" : "unidades"
                  }`
                  : `${Number(weights.peso_total_kg).toLocaleString("es-BO", {
                    maximumFractionDigits: 3,
                  })} kg`}
              </p>
            </div>
          </div>
        )}

        {!form.quantity.trim() && (
          <p className="text-xs text-slate-500">Introduce una cantidad para calcular el peso. El cálculo requiere categoría, material, espesor y dimensiones válidas.</p>
        )}
      </div>
    );
    return <div className="space-y-5">
      {sectionTitle(
        "Observaciones",
        "Añade información adicional sobre las características del producto."
      )}

      {/* Observaciones en la parte superior */}
      <div>
        <label className={labelClass}>
          Observaciones adicionales del requerimiento
        </label>

        <textarea
          className={`${inputClass} min-h-24 resize-y`}
          rows={4}
          value={form.notes}
          onChange={e => set("notes", e.target.value)}
          placeholder="Describe detalles técnicos, acabados u otras indicaciones..."
        />
      </div>

      {/* Resumen sin contenedor exterior */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-800">
          Resumen de especificaciones
        </h3>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            {
              label: "Nombre",
              value: form.name || "Sin nombre",
            },
            {
              label: "Material",
              value: form.material || "No definido",
            },
            ...(form.productType === "bolsa"
              ? [
                {
                  label: "Ancho doblado (bolsa)",
                  value: form.width
                    ? `${form.width} cm`
                    : "No definido",
                },
                {
                  label: "Ancho desdoblado (bolsa)",
                  value: form.widthFlat
                    ? `${form.widthFlat} cm`
                    : "No definido",
                },
              ]
              : [
                {
                  label:
                    form.widthType === "desdoblado"
                      ? "Ancho desdoblado (bobina)"
                      : "Ancho doblado (bobina)",
                  value: form.width
                    ? `${form.width} cm`
                    : "No definido",
                },
              ]),
            ...(form.productType === "bolsa"
              ? [
                {
                  label: "Largo desdoblado",
                  value: form.foldLength
                    ? `${form.foldLength} cm`
                    : "No definido",
                },
              ]
              : []),
            {
              label: "Espesor",
              value: form.micraje ? `${form.micraje} µm` : "No definido",
            },
            ...(form.productType === "bolsa"
              ? [
                {
                  label: "Fuelle de bolsa",
                  value: form.fuelle
                    ? "Con fuelle"
                    : "Sin fuelle",
                },
              ]
              : [
                {
                  label: "Fuelle izquierdo (bobina)",
                  value: form.bobinaSides.includes("Izquierda")
                    ? form.bobinaSideSymmetry === "simetrico"
                      ? form.bobinaCommonSideMeasure
                        ? `${form.bobinaCommonSideMeasure} cm`
                        : "Medida pendiente"
                      : form.bobinaSideMeasures.Izquierda
                        ? `${form.bobinaSideMeasures.Izquierda} cm`
                        : "Medida pendiente"
                    : "Sin fuelle",
                },
                {
                  label: "Fuelle derecho (bobina)",
                  value: form.bobinaSides.includes("Derecha")
                    ? form.bobinaSideSymmetry === "simetrico"
                      ? form.bobinaCommonSideMeasure
                        ? `${form.bobinaCommonSideMeasure} cm`
                        : "Medida pendiente"
                      : form.bobinaSideMeasures.Derecha
                        ? `${form.bobinaSideMeasures.Derecha} cm`
                        : "Medida pendiente"
                    : "Sin fuelle",
                },
              ]),
            ...(form.productType === "bolsa"
              ? [{
                label: "Troquel",
                value:
                  troqueles.find(t => t.value === form.troquel)?.label ??
                  form.troquel,
              }]
              : []),
            {
              label: "Capas",
              value: form.layers || "No definido",
            },
            {
              label: "Impresión",
              value: form.impression ? "Con impresión" : "Sin impresión",
            },
            {
              label: "Estado",
              value: "No homologado",
            },
          ].map(item => (
            <div
              key={item.label}
              className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-200"
            >
              <p className="mb-2 text-xs font-semibold text-slate-500">
                {item.label}
              </p>

              <p className="break-words text-lg font-bold text-slate-800">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  };

  // Estructura compartida del modal: encabezado, navegación, panel de viabilidad y acciones.
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-2 sm:p-4">
    <div className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h2 className="text-base font-bold text-slate-800 sm:text-lg">Producto comercial nuevo · {steps[step]}</h2><button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></header>
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {error && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <nav className="mb-5 flex gap-2 overflow-x-auto pb-1">{steps.map((name, i) => <button type="button" key={name}
          onClick={() => {
            setError("");

            // Permitir regresar sin validar.
            if (i <= step) {
              setStep(i);
              return;
            }

            // Validar los pasos que se quieren dejar atrás.
            for (let currentStep = step; currentStep < i; currentStep++) {
              const validationError = validateStep(currentStep);

              if (validationError) {
                setError(validationError);
                return;
              }
            }

            setStep(i);
          }}
          className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-bold ${i === step ? "border-blue-600 bg-blue-50 text-blue-700" : i < step ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500"}`}>{i < step && <Check className="mr-1 inline h-3 w-3" />}{i + 1}. {name}</button>)}</nav>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_285px]"><div className="min-h-[330px] rounded-xl border border-slate-200 bg-white p-4 sm:p-5">{stepBody()}</div><aside className="rounded-xl border border-slate-200 bg-slate-50 p-3"><ViabilidadPreviaPanel resultado={evaluatedKey === payloadKey ? feasibility : null} cargando={checking || (isReadyForFeasibility && evaluatedKey !== payloadKey)} error={evaluatedKey === payloadKey ? feasibilityError : null} /></aside></div>
      </div>
      <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 px-4 py-3 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={create.isPending} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancelar</button>{step > 0 && <button type="button" onClick={() => { setStep(v => v - 1); setError(""); }} className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold"><ChevronLeft className="h-4 w-4" />Atrás</button>}{step < steps.length - 1 ? <button type="button" onClick={advance} className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Siguiente<ChevronRight className="h-4 w-4" /></button> : <button type="button" disabled={create.isPending} onClick={save} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{create.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}{create.isPending ? "Guardando…" : "Guardar producto y añadir"}</button>}</footer>
    </div>
  </div>;
}
