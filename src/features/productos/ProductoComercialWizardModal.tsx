import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, ChevronLeft, ChevronRight, LoaderCircle, X } from "lucide-react";
import { api } from "@/api/api.config";
import { useProductos, useProductosCategorias, useCreateProductoComercial } from "@/features/productos/productos.hooks";
import { viabilidadApi } from "@/features/viabilidad/viabilidad.api";
import type { EvaluarViabilidadPayload, EvaluarViabilidadResponse } from "@/features/viabilidad/viabilidad.types";
import ViabilidadPreviaPanel from "@/features/viabilidad/requerimientos/ViabilidadPreviaPanel";
import type { ProductoComercialCreate } from "./productos.types";

const steps = ["Aplicación", "Características físicas", "Impresión", "Arte y diseño", "Cantidad y peso", "Observaciones"];
const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1.5 block text-xs font-semibold text-slate-600";

// Datos mínimos que el wizard necesita para listar diseños del módulo Recursos.
type Design = { id: number; nombre: string; estado: string };

// Estado local del formulario. Se transforma al guardar en ProductoComercialCreate;
// no representa una entidad paralela ni se persiste en localStorage.
type Wizard = {
  name: string; productType: "bolsa" | "bobina"; categoria: string; subcategoria: string;
  application: string; use: string; content: string; food: boolean;
  material: string; layers: string; micraje: string; color: string;
  width: string; widthFlat: string; length: string; foldLength: string;
  fuelle: boolean; sides: string[]; sideMeasures: Record<string, string>;
  troquel: string; sello: string; pestana: string; meters: string; diameter: string;
  coreDiameter: string; coreType: string; weight: string; impression: boolean;
  printType: string; printTreatment: string; printFace: string; printColors: string;
  designId: string; unit: "unidad" | "fajo" | "metro"; unitsPerPack: string;
  packagesPerJaba: string; jabasPerBundle: string; finishes: string[]; otherFinish: string; notes: string;
};
const initialForm: Wizard = {
  name: "", productType: "bolsa", categoria: "", subcategoria: "", application: "Comercio y supermercados",
  use: "", content: "", food: false, material: "PEBD", layers: "monocapa", micraje: "", color: "",
  width: "", widthFlat: "", length: "", foldLength: "", fuelle: false, sides: [],
  sideMeasures: { Arriba: "", Abajo: "", Izquierda: "", Derecha: "" }, troquel: "normal", sello: "fondo",
  pestana: "sin_pestana", meters: "", diameter: "", coreDiameter: "", coreType: "", weight: "",
  impression: false, printType: "corrida", printTreatment: "solido", printFace: "una_cara", printColors: "",
  designId: "", unit: "unidad", unitsPerPack: "0", packagesPerJaba: "0", jabasPerBundle: "0",
  finishes: [], otherFinish: "", notes: "",
};

// Opciones de presentación del formulario. Los valores enviados al backend
// permanecen separados de las etiquetas legibles que ve el usuario.
const materials = ["PEBD", "PEAD", "PP", "BOPP", "OTRO"];
const layers = [["monocapa", "Monocapa"], ["bicapa", "Bicapa"], ["tricapa", "Tricapa"]];
const applications = ["Empaque primario alimenticio", "Empaque secundario alimenticio", "Empaque industrial", "Agricultura y horticultura", "Comercio y supermercados", "Textil y confecciones", "Presentación de marca", "Agrupación y transporte", "Higiene y limpieza", "Otros usos"];
const sides = ["Arriba", "Abajo", "Izquierda", "Derecha"];
const troqueles = [
  { value: "normal", label: "Plana" },
  { value: "camiseta", label: "Camiseta" },
  { value: "boutique", label: "Boutique" },
  { value: "con_asa", label: "Con asa" },
  { value: "refuerzo", label: "Boutique reforzada" },
  { value: "solapa", label: "Solapa" },
  { value: "adhesiva", label: "Cinta adhesiva" },
  { value: "cierre_facil", label: "Cinta cierre fácil" },
  { value: "doble_fondo", label: "Sello doble fondo" },
];
const finishOptions = ["aromatizada", "perforada", "antideslizante", "oxobiodegradable", "otro"];
const finishLabels: Record<string, string> = { aromatizada: "Aromatizada", perforada: "Perforada", antideslizante: "Antideslizante", oxobiodegradable: "Oxobiodegradable", otro: "Otro" };

export default function ProductoComercialWizardModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess?: () => void }) {
  // Estado de navegación y datos temporales de esta creación.
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Wizard>(initialForm);
  const [referenceId, setReferenceId] = useState("");
  const [error, setError] = useState("");
  const [designs, setDesigns] = useState<Design[]>([]);
  const [feasibility, setFeasibility] = useState<EvaluarViabilidadResponse | null>(null);
  const [evaluatedKey, setEvaluatedKey] = useState("");
  const [feasibilityError, setFeasibilityError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const create = useCreateProductoComercial();
  const { data: categories = [] } = useProductosCategorias();
  const { data: products = [] } = useProductos();
  const categoryId = Number(form.categoria) || undefined;
  const commercialProducts = useMemo(() => products.filter(p => p.estado_homologacion === "homologado"), [products]);

  // Catálogos vivos: diseños desde Recursos y productos desde la API de Productos.
  useEffect(() => {
    if (!open) return;
    api.get<Design[]>("/recursos/disenos/").then(setDesigns).catch(() => setDesigns([]));
  }, [open]);

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
          tratamiento_impresion: s.printTreatment, cara_impresion: s.impression ? s.printFace : "",
          opacidad: "", tratamientos_acabados_especiales: s.finishes, otras_caracteristicas: s.notes,
        },
        ...(s.productType === "bolsa" ? { especificacion_bolsa: {
          ancho_doblado: s.width, ancho_desdoblado: s.widthFlat || null,
          largo_doblado: s.length, largo_desdoblado: s.foldLength || null,
          fuelle: s.fuelle, fuelle_izquierdo: s.sideMeasures.Izquierda || null,
          fuelle_derecho: s.sideMeasures.Derecha || null, fuelle_inferior: s.sideMeasures.Abajo || null,
          fuelle_superior: s.sideMeasures.Arriba || null, tipo_troquel: s.troquel,
          tipo_sello: s.sello, pestana: s.pestana,
          acabado_especial: [...s.finishes.filter(v => v !== "otro"), ...(s.finishes.includes("otro") && s.otherFinish ? [s.otherFinish.trim().toLowerCase()] : [])].join(","),
          otras_caracteristicas: s.troquel === "doble_fondo" ? `Sello doble fondo. ${s.notes}`.trim() : s.notes,
        } } : { especificacion_bobina: {
          ancho: s.width, diametro: s.diameter || null, diametro_nucleo: s.coreDiameter || null,
          longitud: s.meters || null, tipo_nucleo: s.coreType, peso: s.weight || null,
          otras_caracteristicas: s.notes,
        } }),
      },
    };
  }, [categoryId, form]);

  const payloadKey = JSON.stringify(payload);
  const isReadyForFeasibility = Boolean(open && payload && form.material && form.layers && form.micraje);

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
  const categoryName = activeCategories.find(c => c.id === categoryId)?.nombre ?? "";
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
      setForm(prev => ({ ...prev, name: prev.name || ref.producto_nombre, categoria: category ? String(category.id) : prev.categoria,
        material: ref.material, layers: ref.capas || prev.layers, micraje: String(ref.micraje ?? ""), impression: ref.impresion,
        color: ref.color_bolsa, width: String(ref.especificacion_bolsa?.ancho_doblado ?? ref.especificacion_bobina?.ancho ?? ""),
        widthFlat: String(ref.especificacion_bolsa?.ancho_desdoblado ?? ""), length: String(ref.especificacion_bolsa?.largo_doblado ?? ""),
        meters: String(ref.especificacion_bobina?.longitud ?? ""), diameter: String(ref.especificacion_bobina?.diametro ?? ""),
        coreDiameter: String(ref.especificacion_bobina?.diametro_nucleo ?? ""), coreType: ref.especificacion_bobina?.tipo_nucleo ?? prev.coreType,
        weight: String(ref.especificacion_bobina?.peso ?? ""), sello: ref.especificacion_bolsa?.tipo_sello ?? prev.sello,
        troquel: ref.especificacion_bolsa?.tipo_troquel ?? prev.troquel }));
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
      version: { material: form.material, capas: form.layers, apto_alimento: form.food, micraje: form.micraje || null,
        color_bolsa: form.color, impresion: form.impression, tipo_impresion: form.printType,
        cara_impresion: form.impression ? form.printFace : null, tratamiento_impresion: form.printTreatment,
        color_impresion: form.printColors.split(",").map(v => v.trim()).filter(Boolean), diseno: Number(form.designId) || null,
        metros: form.productType === "bobina" ? form.meters || null : null, observaciones: versionObservations },
      ...(form.productType === "bolsa" ? { especificacion_bolsa: { ancho_doblado: form.width, ancho_desdoblado: form.widthFlat || null,
        largo_doblado: form.length, largo_desdoblado: form.foldLength || null, fuelle: form.fuelle,
        fuelle_izquierdo: form.sideMeasures.Izquierda || null, fuelle_derecho: form.sideMeasures.Derecha || null,
        fuelle_inferior: form.sideMeasures.Abajo || null, fuelle_superior: form.sideMeasures.Arriba || null,
        tipo_troquel: form.troquel, tipo_sello: form.sello, pestana: form.pestana,
          acabado_especial: [...form.finishes.filter(v => v !== "otro"), ...(form.finishes.includes("otro") && form.otherFinish.trim() ? [form.otherFinish.trim().toLowerCase()] : [])].join(","), otras_caracteristicas: form.notes } } : { especificacion_bobina: { ancho: form.width,
        diametro: form.diameter || null, diametro_nucleo: form.coreDiameter || null, tipo_nucleo: form.coreType,
        peso: form.weight || null, longitud: form.meters || null, otras_caracteristicas: form.notes } }),
      ...(form.productType === "bolsa" ? { presentacion: { unidades_por_fajo: Number(form.unitsPerPack) || 0, paquetes_por_jaba: Number(form.packagesPerJaba) || 0, jabas_por_bulto: Number(form.jabasPerBundle) || 0 } } : {}),
    };
    try { await create.mutateAsync(request); onSuccess?.(); onClose(); }
    catch (e) {
      const response = (e as { response?: { data?: Record<string, unknown> } }).response?.data;
      const detail = response ? Object.values(response).flat().map(String).join(" ") : "";
      setError(detail || "No se pudo guardar el producto comercial. Revisa los datos e inténtalo otra vez.");
    }
  };

  // Validaciones de navegación entre pasos, antes de permitir avanzar.
  const advance = () => {
    setError("");
    if (step === 0 && (!form.name.trim() || !categoryId)) {
      setError("Completa la denominación y selecciona la categoría del catálogo.");
      return;
    }
    if (step === 1 && (!form.material || !form.layers || !form.micraje || !form.width || (form.productType === "bolsa" ? !form.length : !form.meters))) {
      setError("Completa material, capas, espesor y dimensiones obligatorias antes de continuar.");
      return;
    }
    if (step === 2 && form.impression && !form.printFace) {
      setError("Selecciona las caras de impresión de la versión.");
      return;
    }
    setStep(v => Math.min(v + 1, 5));
  };

  // Contenido de cada paso del wizard:
  // 0 Aplicación · 1 Características físicas · 2 Impresión · 3 Diseño
  // 4 Cantidad/presentación · 5 Observaciones y resumen.
  const stepBody = () => {
    if (step === 0) return <div className="grid gap-4 sm:grid-cols-2">
      {field("Nombre / denominación", "name", { required: true })}
      <label className="block"><span className={labelClass}>Tipo de producto</span><select className={inputClass} value={form.productType} onChange={e => {set("productType", e.target.value as Wizard["productType"]);set("categoria", "");set("subcategoria", "");}}><option value="bolsa">Bolsa</option><option value="bobina">Bobina / rollo</option></select></label>
      <label className="block"><span className={labelClass}>Aplicación prevista</span><select className={inputClass} value={form.application} onChange={e=>set("application",e.target.value)}>{applications.map(a=><option key={a}>{a}</option>)}</select></label>
      {field("Uso específico", "use", { placeholder: "Ej. Empaque general" })}
      {field("¿Qué contendrá?", "content")}
      <label className="block"><span className={labelClass}>Contacto directo con alimentos</span><select className={inputClass} value={form.food?"si":"no"} onChange={e=>set("food",e.target.value==="si")}><option value="no">No</option><option value="si">Sí</option></select></label>
      <div className="sm:col-span-2 rounded-lg border border-blue-100 bg-blue-50/70 p-3"><label className={labelClass}>Usar producto homologado como referencia (no lo homologa)</label><div className="flex flex-col gap-2 sm:flex-row"><select className={inputClass} value={referenceId} onChange={e=>setReferenceId(e.target.value)}><option value="">Empezar desde cero</option>{commercialProducts.map(p=><option key={p.id} value={p.id}>{p.codigo} · {p.nombre}</option>)}</select><button type="button" onClick={loadReference} disabled={!referenceId} className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium disabled:opacity-50">Cargar referencia</button></div></div>
    </div>;
    if (step === 1) return <div className="space-y-5">{sectionTitle("Material y dimensiones", "Especificación asociada a la primera versión del producto")}
      <div className="grid gap-4 sm:grid-cols-3">{field("Material", "material", { options: materials, required: true })}{field("Capas", "layers", { options: layers.map(([v])=>v), required: true })}{field("Espesor (micras)", "micraje", { type: "number", required: true })}{field("Color", "color")}{field(form.productType === "bolsa" ? "Ancho doblado (cm)" : "Ancho de bobina (cm)", "width", { type: "number", required: true })}
      {form.productType === "bolsa" ? <>{field("Ancho desdoblado (cm)", "widthFlat", { type: "number" })}{field("Largo doblado (cm)", "length", { type: "number", required: true })}{field("Largo desdoblado (cm)", "foldLength", { type: "number" })}</> : <>{field("Metros por rollo", "meters", { type: "number", required: true })}{field("Diámetro del rollo", "diameter", { type: "number" })}{field("Diámetro del núcleo", "coreDiameter", { type: "number" })}{field("Tipo de núcleo", "coreType")}{field("Peso (kg)", "weight", { type: "number" })}</>}</div>
      {form.productType === "bolsa" && <div className="border-t border-slate-200 pt-4"><h4 className="mb-3 text-sm font-semibold">Fuelles · Posición y simetría</h4><div className="flex flex-wrap gap-4">{sides.map(side=><label key={side} className="flex gap-2 text-sm"><input type="checkbox" checked={form.sides.includes(side)} onChange={e=>setForm(f=>({...f,sides:e.target.checked?[...f.sides,side]:f.sides.filter(x=>x!==side),fuelle:e.target.checked||f.sides.filter(x=>x!==side).length>0}))}/>{side}</label>)}</div>{form.sides.length>0&&<div className="mt-3 grid gap-3 sm:grid-cols-2">{form.sides.map(side=><label key={side} className="block"><span className={labelClass}>Fuelle {side} (cm)</span><input type="number" min="0" step="any" className={inputClass} value={form.sideMeasures[side]} onChange={e=>setForm(f=>({...f,sideMeasures:{...f.sideMeasures,[side]:e.target.value}}))}/></label>)}</div>}
      <div className="mt-5 border-t border-slate-200 pt-4"><h4 className="mb-3 text-sm font-semibold">Troquel · Una sola opción</h4><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{troqueles.map(t=><button type="button" key={t.label} onClick={()=>set("troquel",t.value)} aria-pressed={form.troquel===t.value} className={`flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border p-3 text-xs font-bold ${form.troquel===t.value?"border-blue-500 bg-blue-50 text-blue-700":"border-slate-200 bg-white text-slate-800"}`}><svg viewBox="0 0 64 72" aria-hidden="true" className="h-16 w-14"><path d="M10 7h44v58H10z" fill="#e8f1fa" stroke="#617a94" strokeWidth="1.5"/>{t.value==="camiseta"&&<path d="M10 9 3 18l7 5m44-14 7 9-7 5" fill="none" stroke="#617a94" strokeWidth="2"/>}{t.value==="con_asa"&&<path d="M25 16v-5a7 7 0 0 1 14 0v5" fill="none" stroke="#617a94" strokeWidth="3"/>}{t.value==="refuerzo"&&<path d="M15 12h34v11H15z" fill="#c6d8e8" stroke="#617a94"/>}{t.value==="solapa"&&<path d="M10 7h44v12H10z" fill="#c6d8e8" stroke="#617a94"/>}{t.value==="adhesiva"&&<path d="M10 10h44v7H10z" fill="#b9cee0"/>}{t.value==="cierre_facil"&&<><path d="M10 12h44v7H10z" fill="#b9cee0"/><circle cx="16" cy="15" r="2" fill="#617a94"/></>}{t.value==="doble_fondo"&&<path d="M10 7h44v7H10zm0 54h44v4H10z" fill="#91b9d5"/>}</svg>{t.label}</button>)}</div></div>
      <div className="grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">{field("Tipo de sello", "sello", { options: ["fondo", "lateral"] })}{field("Pestaña", "pestana", { options: ["sin_pestana", "con_pestana"] })}</div></div>}
      {form.productType === "bolsa" && <div className="space-y-4 border-t border-slate-200 pt-4"><h4 className="text-sm font-semibold text-slate-800">Presentación y empaquetado</h4><div className="grid gap-3 sm:grid-cols-4"><label className="block"><span className={labelClass}>Unidad base</span><input className={`${inputClass} bg-slate-50`} value="Bolsa" readOnly /></label>{field("Bolsas por paquete/fajo", "unitsPerPack", { type: "number" })}{field("Paquetes por jaba", "packagesPerJaba", { type: "number" })}{field("Jabas por bulto", "jabasPerBundle", { type: "number" })}</div><div><h4 className="mb-2 text-sm font-semibold text-slate-800">Acabados opcionales</h4><div className="flex flex-wrap gap-x-5 gap-y-2">{finishOptions.map(option=><label key={option} className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" className="h-4 w-4 accent-blue-600" checked={form.finishes.includes(option)} onChange={e=>set("finishes",e.target.checked?[...form.finishes,option]:form.finishes.filter(v=>v!==option))}/>{finishLabels[option]}</label>)}</div>{form.finishes.includes("otro")&&<input className={`${inputClass} mt-3 max-w-md`} value={form.otherFinish} onChange={e=>set("otherFinish",e.target.value)} placeholder="Especifica otro acabado"/>}</div></div>}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">La factibilidad se calcula con el servicio de viabilidad de INCORE. Los criterios y rutas corresponden a la configuración productiva vigente.</div>
    </div>;
    if (step === 2) return <div className="space-y-5">{sectionTitle("Impresión", "Define los datos de impresión guardados en la versión técnica")}{toggle("Producto con impresión", form.impression, v=>set("impression",v))}{form.impression&&<div className="grid gap-4 sm:grid-cols-2">{field("Tipo de impresión", "printType", { options: ["corrida", "dimensionada"] })}{field("Caras", "printFace", { options: ["una_cara", "dos_caras"] })}{field("Tratamiento", "printTreatment", { options: ["solido", "degradado", "trameado"] })}{field("Colores (separados por coma)", "printColors")}</div>}</div>;
    if (step === 3) return <div className="space-y-4">{sectionTitle("Arte y diseño", "Selecciona un diseño registrado en Recursos, si ya existe")}
      <label className="block"><span className={labelClass}>Diseño asociado</span><select className={inputClass} value={form.designId} onChange={e=>set("designId",e.target.value)}><option value="">Sin diseño asociado</option>{designs.filter(d=>d.estado==="aprobado"||d.estado==="vigente").map(d=><option key={d.id} value={d.id}>{d.nombre}</option>)}</select></label>
      <p className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-slate-600">La selección vincula el diseño existente a la versión. El archivo y sus revisiones se administran desde el módulo de Recursos.</p></div>;
    if (step === 4) return <div className="space-y-5">{sectionTitle("Cantidad y presentación", "Registra unidades de venta y equivalencias disponibles")}
      <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className={labelClass}>Unidad única de venta</span><select className={inputClass} value={form.unit} onChange={e=>set("unit",e.target.value as Wizard["unit"])}><option value="unidad">Unidades</option><option value="fajo">Fajos</option><option value="metro">Metros</option></select></label>
      {form.productType==="bolsa"&&<p className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-slate-700 sm:col-span-2">Presentación configurada en Características físicas: {form.unitsPerPack || "0"} bolsas por paquete/fajo · {form.packagesPerJaba || "0"} paquetes por jaba · {form.jabasPerBundle || "0"} jabas por bulto.</p>}
      {form.productType==="bobina"&&<label className="block"><span className={labelClass}>Peso por rollo (kg)</span><input className={inputClass} value={form.weight} readOnly /></label>}</div>
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">El prototipo muestra una estimación de peso. INCORE no tiene una fórmula comercial validada para todos los materiales y acabados; el asistente guarda el peso informado cuando corresponde y no sustituye el cálculo productivo.</p></div>;
    return <div className="space-y-4">{sectionTitle("Observaciones", "Notas de la ficha técnica inicial")}{<textarea className={`${inputClass} min-h-40 resize-y`} value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Observaciones técnicas o comerciales" />}
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2"><div><p className={labelClass}>Producto</p><p className="text-sm font-medium">{form.name || "Sin nombre"}</p></div><div><p className={labelClass}>Categoría</p><p className="text-sm font-medium">{categoryName || "Sin categoría"}</p></div><div><p className={labelClass}>Material y capas</p><p className="text-sm font-medium">{form.material} · {form.layers}</p></div><div><p className={labelClass}>Estado inicial</p><p className="text-sm font-semibold text-amber-700">No homologado</p></div></div></div>;
  };

  // Estructura compartida del modal: encabezado, navegación, panel de viabilidad y acciones.
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-2 sm:p-4">
    <div className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h2 className="text-base font-bold text-slate-800 sm:text-lg">Producto comercial nuevo · {steps[step]}</h2><button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5"/></button></header>
      <div className="flex-1 overflow-y-auto p-4 sm:p-5"><nav className="mb-5 flex gap-2 overflow-x-auto pb-1">{steps.map((name,i)=><button type="button" key={name} onClick={()=>setStep(i)} className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-bold ${i===step?"border-blue-600 bg-blue-50 text-blue-700":i<step?"border-emerald-200 bg-emerald-50 text-emerald-700":"border-slate-200 bg-slate-100 text-slate-500"}`}>{i<step&&<Check className="mr-1 inline h-3 w-3"/>}{i+1}. {name}</button>)}</nav>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_285px]"><div className="min-h-[330px] rounded-xl border border-slate-200 bg-white p-4 sm:p-5">{stepBody()}{error&&<div role="alert" className="mt-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0"/>{error}</div>}</div><aside className="rounded-xl border border-slate-200 bg-slate-50 p-3"><ViabilidadPreviaPanel resultado={evaluatedKey===payloadKey?feasibility:null} cargando={checking || (isReadyForFeasibility && evaluatedKey!==payloadKey)} error={evaluatedKey===payloadKey?feasibilityError:null}/></aside></div>
      </div>
      <footer className="flex flex-col-reverse gap-2 border-t border-slate-200 px-4 py-3 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={create.isPending} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancelar</button>{step>0&&<button type="button" onClick={()=>{setStep(v=>v-1);setError("");}} className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold"><ChevronLeft className="h-4 w-4"/>Atrás</button>}{step<5?<button type="button" onClick={advance} className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Siguiente<ChevronRight className="h-4 w-4"/></button>:<button type="button" disabled={create.isPending} onClick={save} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{create.isPending?<LoaderCircle className="h-4 w-4 animate-spin"/>:null}{create.isPending?"Guardando…":"Guardar producto y añadir"}</button>}</footer>
    </div>
  </div>;
}
