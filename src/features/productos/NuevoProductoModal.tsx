
import { useState } from "react";
import {
  X,
  Package,
  FileText,
  ImagePlus,
  Upload,
  LoaderCircle,
  Save,
} from "lucide-react";

import type { Producto } from "@/features/productos/productos.types";
import {
  useCreateProducto,
  useProductosCategorias,
  useProductosSubcategorias,
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

const createInitialForm = (producto?: Producto | null) => ({
  categoria: producto ? String(producto.categoria) : "",
  subcategoria: producto?.subcategoria ? String(producto.subcategoria) : "",
  unidad_medida: producto?.unidad_medida ?? "unidad" as Producto["unidad_medida"],
  nombre: producto?.nombre ?? "",
  descripcion: producto?.descripcion ?? "",
  pais_origen: producto?.pais_origen ?? "",
});

export default function NuevoProductoModal({
  open,
  onClose,
  onSuccess,
  producto,
}: NuevoProductoModalProps) {
  const isEditing = Boolean(producto);

  const [form, setForm] = useState(() => createInitialForm(producto));

  const [fotoPrincipal, setFotoPrincipal] = useState<File | null>(null);
  const [fotoAnverso, setFotoAnverso] = useState<File | null>(null);
  const [fotoReverso, setFotoReverso] = useState<File | null>(null);
  const [error, setError] = useState("");

  const createMutation = useCreateProducto();
  const updateMutation = useUpdateProducto();
  const { data: categorias = [], isLoading: cargandoCategorias } = useProductosCategorias();
  const categoriaId = form.categoria ? Number(form.categoria) : undefined;
  const { data: subcategorias = [], isLoading: cargandoSubcategorias } = useProductosSubcategorias(categoriaId);

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

    const data = new FormData();
    data.append("categoria", form.categoria);
    if (form.subcategoria) data.append("subcategoria", form.subcategoria);
    data.append("unidad_medida", form.unidad_medida);
    data.append("nombre", form.nombre.trim());
    data.append("descripcion", form.descripcion.trim());
    data.append("pais_origen", form.pais_origen.trim());
    if (fotoPrincipal) data.append("imagen", fotoPrincipal);
    if (fotoAnverso) data.append("imagen_anverso", fotoAnverso);
    if (fotoReverso) data.append("imagen_reverso", fotoReverso);

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
                Información general del catálogo
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
                    disabled={cargandoCategorias}
                    required
                    className={inputClass}
                  >
                    <option value="">{cargandoCategorias ? "Cargando categorías…" : "Seleccionar categoría"}</option>
                    {categorias.filter(item => item.activo).map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Subcategoría</label>
                  <select
                    name="subcategoria"
                    value={form.subcategoria}
                    onChange={handleChange}
                    disabled={!form.categoria || cargandoSubcategorias}
                    className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100`}
                  >
                    <option value="">{cargandoSubcategorias ? "Cargando subcategorías…" : "Sin subcategoría"}</option>
                    {subcategorias.filter(item => item.activo).map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Unidad de medida <span className="text-red-500">*</span></label>
                  <select name="unidad_medida" value={form.unidad_medida} onChange={handleChange} required className={inputClass}>
                    <option value="unidad">Unidad</option>
                    <option value="fajo">Fajo</option>
                    <option value="metro">Metro</option>
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

            {/* 2. Fotografías */}
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
