
import { useEffect, useState } from "react";
import {
  X,
  Package,
  FileText,
  Ruler,
  Boxes,
  ImagePlus,
  Upload,
  LoaderCircle,
  Save,
} from "lucide-react";

import type { Producto } from "@/features/productos/productos.types";
import {
  useCreateProducto,
  useUpdateProducto,
} from "@/features/productos/productos.hooks";

interface NuevoProductoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  producto?: Producto | null;
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-inplaz-500 focus:ring-2 focus:ring-inplaz-100";

const labelClass =
  "mb-1.5 block text-sm font-medium text-slate-700";

const sectionClass =
  "overflow-hidden rounded-xl border border-slate-200 bg-white";

const sectionHeaderClass =
  "flex items-center gap-2 border-b border-slate-100 px-5 py-4";

const numberClass = `${inputClass} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;

export default function NuevoProductoModal({
  open,
  onClose,
  onSuccess,
  producto,
}: NuevoProductoModalProps) {
  const isEditing = Boolean(producto);

  const [form, setForm] = useState({
    categoria: "",
    subcategoria: "",
    nombre: "",
    descripcion: "",
    pais_origen: "",
    material: "",
    color: "",
    color_impresion: "",
    tipo_impresion: "",
    ancho_doblado: "",
    ancho_desdoblado: "",
    largo_doblado: "",
    largo_desdoblado: "",
    troquel: "",
    sello: "",
    impresion_anverso: "",
    impresion_reverso: "",
    cantidad_unidad: "1",
    cantidad_fajo: "0",
    cantidad_bulto: "0",
  });

  const [fotoPrincipal, setFotoPrincipal] = useState<File | null>(null);
  const [fotoAnverso, setFotoAnverso] = useState<File | null>(null);
  const [fotoReverso, setFotoReverso] = useState<File | null>(null);
  const [error, setError] = useState("");

  const createMutation = useCreateProducto();
  const updateMutation = useUpdateProducto();

  useEffect(() => {
    if (!open) return;

    setForm({
      categoria: producto ? String(producto.categoria) : "",
      subcategoria: producto?.subcategoria
        ? String(producto.subcategoria)
        : "",
      nombre: producto?.nombre ?? "",
      descripcion: producto?.descripcion ?? "",
      pais_origen: producto?.pais_origen ?? "",
      material: "",
      color: "",
      color_impresion: "",
      tipo_impresion: "",
      ancho_doblado: "",
      ancho_desdoblado: "",
      largo_doblado: "",
      largo_desdoblado: "",
      troquel: "",
      sello: "",
      impresion_anverso: "",
      impresion_reverso: "",
      cantidad_unidad: "1",
      cantidad_fajo: "0",
      cantidad_bulto: "0",
    });

    setFotoPrincipal(null);
    setFotoAnverso(null);
    setFotoReverso(null);
    setError("");
  }, [open, producto]);

  if (!open) return null;

  const isSaving =
    createMutation.isPending || updateMutation.isPending;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "categoria" ? { subcategoria: "" } : {}),
    }));
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0] ?? null;

    if (file && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Utiliza imágenes JPG, PNG o WEBP.");
      e.target.value = "";
      return;
    }

    if (file && file.size > 5 * 1024 * 1024) {
      setError("Cada imagen debe pesar como máximo 5 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setter(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!form.categoria) {
      setError("Selecciona una categoría.");
      return;
    }

    const data = {
      categoria: Number(form.categoria),
      subcategoria: form.subcategoria
        ? Number(form.subcategoria)
        : null,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      pais_origen: form.pais_origen.trim(),
    };

    try {
      // Solo se envían los campos generales que existen
      // en el Producto actual del backend.
      if (producto) {
        await updateMutation.mutateAsync({
          id: producto.id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error al guardar el producto:", err);
      setError(
        "No se pudo guardar el producto. Verifica los datos e inténtalo nuevamente."
      );
    }
  };

  const renderImageField = (
    id: string,
    title: string,
    description: string,
    file: File | null,
    setter: (file: File | null) => void
  ) => (
    <div className="rounded-xl border border-dashed border-slate-300 p-4 transition hover:border-inplaz-500">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          {file ? (
            <ImagePlus className="h-5 w-5" />
          ) : (
            <Package className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>

          <label
            htmlFor={id}
            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Upload className="h-3.5 w-3.5" />
            Seleccionar imagen
          </label>

          <input
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleImageChange(e, setter)}
          />

          {file && (
            <div className="mt-2 flex items-center gap-2">
              <span className="truncate text-xs text-inplaz-700">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => setter(null)}
                className="text-xs text-red-600 hover:underline"
              >
                Quitar
              </button>
            </div>
          )}

          <p className="mt-2 text-xs text-slate-400">
            JPG, PNG o WEBP · Máx. 5 MB
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-[2px] sm:p-5">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-inplaz-100 text-inplaz-700">
              <Package className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {isEditing ? "Editar producto" : "Nuevo producto"}
              </h2>
              <p className="text-sm text-slate-500">
                Información general y especificaciones del producto
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cerrar"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-6 overflow-y-auto bg-slate-50/70 p-4 sm:p-6">
            {/* 1. Información general */}
            <section className={sectionClass}>
              <div className={sectionHeaderClass}>
                <FileText className="h-4 w-4 text-inplaz-700" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Información general
                  </h3>
                  <p className="text-xs text-slate-500">
                    Identificación y clasificación
                  </p>
                </div>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className={labelClass}>Código del producto</label>
                  <input
                    value={isEditing ? producto?.codigo ?? "" : ""}
                    readOnly
                    placeholder="Se generará automáticamente"
                    className={`${inputClass} cursor-not-allowed bg-slate-50`}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Asignado por el sistema al guardar.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Seleccionar categoría</option>
                    {/* Conectar con el endpoint de categorías */}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Subcategoría</label>
                  <select
                    name="subcategoria"
                    value={form.subcategoria}
                    onChange={handleChange}
                    disabled={!form.categoria}
                    className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100`}
                  >
                    <option value="">Sin subcategoría</option>
                    {/* Conectar con el endpoint de subcategorías */}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>País de origen</label>
                  <input
                    name="pais_origen"
                    value={form.pais_origen}
                    onChange={handleChange}
                    placeholder="Ej. Bolivia"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className={labelClass}>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Describe el producto..."
                    className={`${inputClass} resize-y`}
                  />
                </div>
              </div>
            </section>

            {/* 2. Características técnicas */}
            <section className={sectionClass}>
              <div className={sectionHeaderClass}>
                <Ruler className="h-4 w-4 text-inplaz-700" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Características técnicas
                  </h3>
                  <p className="text-xs text-slate-500">
                    Material, dimensiones, acabado e impresión
                  </p>
                </div>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className={labelClass}>Material</label>
                  <select name="material" value={form.material} onChange={handleChange} className={inputClass}>
                    <option value="">Seleccionar material</option>
                    <option value="PEBD">PEBD</option>
                    <option value="PEAD">PEAD</option>
                    <option value="PP">PP</option>
                    <option value="BOPP">BOPP</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Color del producto</label>
                  <input name="color" value={form.color} onChange={handleChange} placeholder="Ej. Blanco" className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Color de impresión</label>
                  <input name="color_impresion" value={form.color_impresion} onChange={handleChange} placeholder="Ej. Azul y negro" className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Ancho doblado (cm)</label>
                  <input type="number" min="0" step="any" name="ancho_doblado" value={form.ancho_doblado} onChange={handleChange} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Ancho desdoblado (cm)</label>
                  <input type="number" min="0" step="any" name="ancho_desdoblado" value={form.ancho_desdoblado} onChange={handleChange} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Largo doblado (cm)</label>
                  <input type="number" min="0" step="any" name="largo_doblado" value={form.largo_doblado} onChange={handleChange} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Largo desdoblado (cm)</label>
                  <input type="number" min="0" step="any" name="largo_desdoblado" value={form.largo_desdoblado} onChange={handleChange} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Tipo de troquel</label>
                  <input name="troquel" value={form.troquel} onChange={handleChange} placeholder="Tipo de troquel" className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Tipo de sello</label>
                  <input name="sello" value={form.sello} onChange={handleChange} placeholder="Tipo de sello" className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Tipo de impresión</label>
                  <select name="tipo_impresion" value={form.tipo_impresion} onChange={handleChange} className={inputClass}>
                    <option value="">Seleccionar tipo</option>
                    <option value="corrida">Corrida</option>
                    <option value="registro">Registro</option>
                    <option value="sin_impresion">Sin impresión</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Impresión anverso</label>
                  <select name="impresion_anverso" value={form.impresion_anverso} onChange={handleChange} className={inputClass}>
                    <option value="">Seleccionar opción</option>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Impresión reverso</label>
                  <select name="impresion_reverso" value={form.impresion_reverso} onChange={handleChange} className={inputClass}>
                    <option value="">Seleccionar opción</option>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 3. Cantidades y presentaciones */}
            <section className={sectionClass}>
              <div className={sectionHeaderClass}>
                <Boxes className="h-4 w-4 text-inplaz-700" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Cantidades y presentaciones
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define las equivalencias comerciales
                  </p>
                </div>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Cantidad por unidad</label>
                  <input type="number" min="1" step="1" name="cantidad_unidad" value={form.cantidad_unidad} onChange={handleChange} className={numberClass} required />
                  <p className="mt-1 text-xs text-slate-500">Unidades mínimas.</p>
                </div>

                <div>
                  <label className={labelClass}>Unidades por fajo</label>
                  <input type="number" min="0" step="1" name="cantidad_fajo" value={form.cantidad_fajo} onChange={handleChange} className={numberClass} />
                  <p className="mt-1 text-xs text-slate-500">Piezas por fajo.</p>
                </div>

                <div>
                  <label className={labelClass}>Fajos por bulto</label>
                  <input type="number" min="0" step="1" name="cantidad_bulto" value={form.cantidad_bulto} onChange={handleChange} className={numberClass} />
                  <p className="mt-1 text-xs text-slate-500">Fajos por bulto.</p>
                </div>
              </div>
            </section>

            {/* 4. Fotografías */}
            <section className={sectionClass}>
              <div className={sectionHeaderClass}>
                <ImagePlus className="h-4 w-4 text-inplaz-700" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Fotografías del producto
                  </h3>
                  <p className="text-xs text-slate-500">
                    Imagen general y vistas del producto
                  </p>
                </div>
              </div>

              <div className="grid gap-4 p-5 lg:grid-cols-3">
                {renderImageField(
                  "foto-principal",
                  "Foto principal",
                  "Imagen general del producto",
                  fotoPrincipal,
                  setFotoPrincipal
                )}

                {renderImageField(
                  "foto-anverso",
                  "Foto anverso",
                  "Vista frontal del producto",
                  fotoAnverso,
                  setFotoAnverso
                )}

                {renderImageField(
                  "foto-reverso",
                  "Foto reverso",
                  "Vista posterior del producto",
                  fotoReverso,
                  setFotoReverso
                )}
              </div>
            </section>

            {error && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Pie */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {isSaving ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Registrar producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
