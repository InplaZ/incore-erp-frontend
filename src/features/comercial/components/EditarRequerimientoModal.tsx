import { useEffect, useState } from "react";
import { X, Save, } from "lucide-react";

import {
  useSolicitudComercial,
  useUpdateSolicitudComercial,
  useUpdateEspecificacionProducto,
  useUpdateEspecificacionBolsa,
  useUpdateEspecificacionBobina,
  useCuentasComerciales,
} from "../comercial.hooks";

import {
  useProductosCategorias,
} from "../../productos/productos.hooks";

import {
  variantesColorApi,
} from "../comercial.api";

import type {
  SolicitudComercialUpdate,
  EspecificacionProductoSolicitadoUpdate,
  EspecificacionBolsaSolicitadaUpdate,
  EspecificacionBobinaSolicitadaUpdate,
  VarianteColorSolicitadaUpdate,
  PrioridadSolicitud,
  EstadoSolicitud,
  MaterialProducto,
  Opacidad,
  TipoImpresion,
  TratamientoAcabadoEspecial,
  TratamientoImpresion,
  TipoSello,
  TipoTroquel,
  PosicionImpresion,
  TipoCapa,
  CaraImpresion,
  TipoPestana,
  ProductType,
} from "../comercial.types";

interface EditarRequerimientoModalProps {
  open: boolean;
  requerimientoId: number | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const prioridades: { value: PrioridadSolicitud; label: string }[] = [
  { value: "baja", label: "Baja" },
  { value: "normal", label: "Normal" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

const estados: { value: EstadoSolicitud; label: string }[] = [
  { value: "recibida", label: "Recibida" },
  { value: "en_negociacion", label: "En negociación" },
  { value: "en_viabilidad", label: "En viabilidad" },
  { value: "aprobada", label: "Aprobada" },
  { value: "rechazada", label: "Rechazada" },
  { value: "convertida", label: "Convertida" },
  { value: "cancelada", label: "Cancelada" },
];

const materiales: { value: MaterialProducto; label: string }[] = [
  { value: "PEAD", label: "PEAD" },
  { value: "PEBD", label: "PEBD" },
  { value: "PP", label: "PP" },
  { value: "BOPP", label: "BOPP" },
  { value: "OTRO", label: "Otro" },
];

const opacidades: { value: Opacidad; label: string }[] = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
];

const tiposImpresion: { value: TipoImpresion; label: string }[] = [
  { value: "corrida", label: "Corrida" },
  { value: "dimensionada", label: "Dimensionada" },
];

const tratamientosImpresion: { value: TratamientoImpresion; label: string }[] = [
  { value: "solido", label: "Sólido" },
  { value: "degradado", label: "Degradado" },
  { value: "trameado", label: "Trameado" },
];

const posicionesImpresion: { value: PosicionImpresion; label: string }[] = [
  { value: "centrada", label: "Centrada" },
  { value: "personalizada", label: "Personalizada" },
];

const tiposCapa: { value: TipoCapa; label: string }[] = [
  { value: "monocapa", label: "Monocapa" },
  { value: "bicapa", label: "Bicapa" },
  { value: "tricapa", label: "Tricapa" },
];

const carasImpresion: { value: CaraImpresion; label: string }[] = [
  { value: "anverso", label: "Anverso" },
  { value: "reverso", label: "Reverso" },
  { value: "ambas", label: "Ambas" },
];

const tiposTroquel: { value: TipoTroquel; label: string }[] = [
  { value: "camiseta", label: "Camiseta" },
  { value: "normal", label: "Normal" },
  { value: "rinonera", label: "Riñonera" },
  { value: "con_asa", label: "Con asa" },
  { value: "refuerzo", label: "Refuerzo" },
  { value: "solapa", label: "Solapa" },
  { value: "adhesiva", label: "Adhesiva" },
  { value: "cierre_facil", label: "Cierre fácil" },
];

const tiposSello: { value: TipoSello; label: string }[] = [
  { value: "ninguno", label: "Ninguno" },
  { value: "fondo", label: "Fondo" },
  { value: "lateral", label: "Lateral" },
];

const tiposPestana: { value: TipoPestana; label: string }[] = [
  { value: "sin_pestana", label: "Sin pestaña" },
  { value: "superior", label: "Superior" },
  { value: "inferior", label: "Inferior" },
  { value: "ambas", label: "Ambas" },
];

const tratamientosAcabados: { value: TratamientoAcabadoEspecial; label: string; description: string }[] = [
  { value: "film_aromatizado", label: "Film aromatizado", description: "Aroma incorporado al material" },
  { value: "oxobiodegradable", label: "Oxobiodegradable", description: "Tratamiento oxobiodegradable" },
  { value: "perforada", label: "Perforada", description: "Perforaciones en el material" },
  { value: "precorte", label: "Precorte", description: "Cortes preparados" },
];

function getClientName(client: {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  razon_social: string;
  tipo_persona: string;
}) {
  if (client.tipo_persona === "juridica") {
    return client.razon_social || "Sin razón social";
  }
  return [client.nombres, client.apellido_paterno, client.apellido_materno]
    .filter(Boolean)
    .join(" ");
}

export default function EditarRequerimientoModal({
  open,
  requerimientoId,
  onClose,
  onSuccess,
}: EditarRequerimientoModalProps) {
  // Hooks para obtener datos
  const { data: requerimientoDetalle, isLoading: loadingDetalle } = useSolicitudComercial(
    requerimientoId || 0
  );
  const { data: clientes = [], isLoading: loadingClientes } = useCuentasComerciales();
  const { data: categorias = [], isLoading: loadingCategorias } = useProductosCategorias();

  // Hooks para actualización
  const updateSolicitud = useUpdateSolicitudComercial();
  const updateEspecificacionProducto = useUpdateEspecificacionProducto();
  const updateEspecificacionBolsa = useUpdateEspecificacionBolsa();
  const updateEspecificacionBobina = useUpdateEspecificacionBobina();

  // Estado local del formulario
  const [solicitud, setSolicitud] = useState<Partial<SolicitudComercialUpdate>>({});
  const [especificacionProducto, setEspecificacionProducto] = useState<Partial<EspecificacionProductoSolicitadoUpdate>>({});
  const [especificacionBolsa, setEspecificacionBolsa] = useState<Partial<EspecificacionBolsaSolicitadaUpdate>>({});
  const [especificacionBobina, setEspecificacionBobina] = useState<Partial<EspecificacionBobinaSolicitadaUpdate>>({});
  const [variantesColor, setVariantesColor] = useState<Partial<VarianteColorSolicitadaUpdate>[]>([]);

  const [activeTab, setActiveTab] = useState<"solicitud" | "producto" | "especificaciones">("solicitud");
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos cuando el modal se abre y hay datos disponibles
  useEffect(() => {
    if (!open || !requerimientoDetalle) return;

    const { solicitud: sol, especificacionProducto: espProd, especificacionBolsa: espBolsa, especificacionBobina: espBobina } = requerimientoDetalle;

    // Cargar datos de solicitud
    setSolicitud({
      cuenta_comercial: sol.cuenta_comercial,
      descripcion: sol.descripcion,
      cantidad_unidades: sol.cantidad_unidades,
      cantidad_kg: sol.cantidad_kg,
      fecha_entrega: sol.fecha_entrega,
      lugar_entrega: sol.lugar_entrega,
      observaciones: sol.observaciones,
      prioridad: sol.prioridad,
      estado: sol.estado,
    });

    // Cargar datos de especificación de producto
    if (espProd) {
      setEspecificacionProducto({
        categoria_producto: espProd.categoria_producto,
        material: espProd.material,
        capas: espProd.capas,
        apto_alimento: espProd.apto_alimento,
        micraje: espProd.micraje,
        color_bolsa: espProd.color_bolsa,
        impresion: espProd.impresion,
        color_impresion: espProd.color_impresion,
        tipo_impresion: espProd.tipo_impresion,
        tratamiento_impresion: espProd.tratamiento_impresion,
        posicion_impresion: espProd.posicion_impresion,
        distancia_impresion_superior: espProd.distancia_impresion_superior,
        distancia_impresion_inferior: espProd.distancia_impresion_inferior,
        distancia_impresion_izquierda: espProd.distancia_impresion_izquierda,
        distancia_impresion_derecha: espProd.distancia_impresion_derecha,
        otras_caracteristicas: espProd.otras_caracteristicas,
        cara_impresion: espProd.cara_impresion,
        opacidad: espProd.opacidad,
        tratamientos_acabados_especiales: espProd.tratamientos_acabados_especiales,
      });

      // Cargar variantes de color
      setVariantesColor(espProd.variantes_color.map(v => ({
        id: v.id,
        color: v.color,
        cantidad: v.cantidad,
      })));
    }

    // Cargar datos de especificación de bolsa
    if (espBolsa) {
      setEspecificacionBolsa({
        ancho_doblado: espBolsa.ancho_doblado,
        ancho_desdoblado: espBolsa.ancho_desdoblado,
        largo_doblado: espBolsa.largo_doblado,
        largo_desdoblado: espBolsa.largo_desdoblado,
        fuelle: espBolsa.fuelle,
        fuelle_izquierdo: espBolsa.fuelle_izquierdo,
        fuelle_derecho: espBolsa.fuelle_derecho,
        fuelle_inferior: espBolsa.fuelle_inferior,
        fuelle_superior: espBolsa.fuelle_superior,
        tipo_troquel: espBolsa.tipo_troquel,
        tipo_sello: espBolsa.tipo_sello,
        pestana: espBolsa.pestana,
        otras_caracteristicas: espBolsa.otras_caracteristicas,
      });
    }

    // Cargar datos de especificación de bobina
    if (espBobina) {
      setEspecificacionBobina({
        ancho: espBobina.ancho,
        diametro: espBobina.diametro,
        diametro_nucleo: espBobina.diametro_nucleo,
        longitud: espBobina.longitud,
        tipo_nucleo: espBobina.tipo_nucleo,
        peso: espBobina.peso,
        otras_caracteristicas: espBobina.otras_caracteristicas,
      });
    }
  }, [open, requerimientoDetalle]);

  const isPending =
    updateSolicitud.isPending ||
    updateEspecificacionProducto.isPending ||
    updateEspecificacionBolsa.isPending ||
    updateEspecificacionBobina.isPending;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requerimientoId || !requerimientoDetalle) return;

    setIsSaving(true);
    try {
      // Actualizar solicitud principal
      await updateSolicitud.mutateAsync({
        id: requerimientoId,
        data: solicitud as SolicitudComercialUpdate,
      });

      // Actualizar especificación de producto si existe
      if (requerimientoDetalle.especificacionProducto) {
        await updateEspecificacionProducto.mutateAsync({
          id: requerimientoDetalle.especificacionProducto.id,
          data: especificacionProducto as EspecificacionProductoSolicitadoUpdate,
        });

        // Actualizar variantes de color
        for (const variante of variantesColor) {
          if (variante.id) {
            await variantesColorApi.update(variante.id, variante as VarianteColorSolicitadaUpdate);
          }
        }
      }

      // Actualizar especificación de bolsa si existe
      if (requerimientoDetalle.especificacionBolsa) {
        await updateEspecificacionBolsa.mutateAsync({
          id: requerimientoDetalle.especificacionBolsa.id,
          data: especificacionBolsa as EspecificacionBolsaSolicitadaUpdate,
        });
      }

      // Actualizar especificación de bobina si existe
      if (requerimientoDetalle.especificacionBobina) {
        await updateEspecificacionBobina.mutateAsync({
          id: requerimientoDetalle.especificacionBobina.id,
          data: especificacionBobina as EspecificacionBobinaSolicitadaUpdate,
        });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error al actualizar requerimiento:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSolicitudChange = (field: keyof SolicitudComercialUpdate, value: any) => {
    setSolicitud(prev => ({ ...prev, [field]: value }));
  };

  const handleProductoChange = (field: keyof EspecificacionProductoSolicitadoUpdate, value: any) => {
    setEspecificacionProducto(prev => ({ ...prev, [field]: value }));
  };

  const handleBolsaChange = (field: keyof EspecificacionBolsaSolicitadaUpdate, value: any) => {
    setEspecificacionBolsa(prev => ({ ...prev, [field]: value }));
  };

  const handleBobinaChange = (field: keyof EspecificacionBobinaSolicitadaUpdate, value: any) => {
    setEspecificacionBobina(prev => ({ ...prev, [field]: value }));
  };

  const handleVarianteColorChange = (index: number, field: keyof VarianteColorSolicitadaUpdate, value: any) => {
    setVariantesColor(prev => {
      const nuevas = [...prev];
      nuevas[index] = { ...nuevas[index], [field]: value };
      return nuevas;
    });
  };

  const toggleTratamiento = (value: TratamientoAcabadoEspecial) => {
    const current = especificacionProducto.tratamientos_acabados_especiales || [];
    if (current.includes(value)) {
      handleProductoChange("tratamientos_acabados_especiales", current.filter(item => item !== value));
    } else {
      handleProductoChange("tratamientos_acabados_especiales", [...current, value]);
    }
  };

  if (!open || !requerimientoId) {
    return null;
  }

  const productType: ProductType = requerimientoDetalle?.especificacionBolsa ? "bag" :
    requerimientoDetalle?.especificacionBobina ? "roll" : "other";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Editar Requerimiento #{requerimientoId}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Modifica los datos del requerimiento comercial.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("solicitud")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "solicitud"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Solicitud
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("producto")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "producto"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Producto
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("especificaciones")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "especificaciones"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Especificaciones
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="max-h-[60vh] overflow-y-auto">
          <div className="p-6">
            {loadingDetalle ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />
              </div>
            ) : (
              <>
                {/* Tab: Solicitud */}
                {activeTab === "solicitud" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Cliente</label>
                        <select
                          value={solicitud.cuenta_comercial || ""}
                          onChange={(e) => handleSolicitudChange("cuenta_comercial", Number(e.target.value))}
                          disabled={loadingClientes || isPending}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        >
                          <option value="">Seleccionar cliente</option>
                          {clientes.map((cliente) => (
                            <option key={cliente.id} value={cliente.id}>
                              {getClientName(cliente)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Prioridad</label>
                        <select
                          value={solicitud.prioridad || "normal"}
                          onChange={(e) => handleSolicitudChange("prioridad", e.target.value as PrioridadSolicitud)}
                          disabled={isPending}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        >
                          {prioridades.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Estado</label>
                        <select
                          value={solicitud.estado || "recibida"}
                          onChange={(e) => handleSolicitudChange("estado", e.target.value as EstadoSolicitud)}
                          disabled={isPending}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        >
                          {estados.map((e) => (
                            <option key={e.value} value={e.value}>{e.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Fecha de entrega</label>
                        <input
                          type="date"
                          value={solicitud.fecha_entrega?.split("T")[0] || ""}
                          onChange={(e) => handleSolicitudChange("fecha_entrega", e.target.value)}
                          disabled={isPending}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Descripción</label>
                      <textarea
                        value={solicitud.descripcion || ""}
                        onChange={(e) => handleSolicitudChange("descripcion", e.target.value)}
                        disabled={isPending}
                        rows={3}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Cantidad unidades</label>
                        <input
                          type="text"
                          value={solicitud.cantidad_unidades || ""}
                          onChange={(e) => handleSolicitudChange("cantidad_unidades", e.target.value)}
                          disabled={isPending}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Cantidad kg</label>
                        <input
                          type="text"
                          value={solicitud.cantidad_kg || ""}
                          onChange={(e) => handleSolicitudChange("cantidad_kg", e.target.value)}
                          disabled={isPending}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Lugar de entrega</label>
                      <input
                        type="text"
                        value={solicitud.lugar_entrega || ""}
                        onChange={(e) => handleSolicitudChange("lugar_entrega", e.target.value)}
                        disabled={isPending}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Observaciones</label>
                      <textarea
                        value={solicitud.observaciones || ""}
                        onChange={(e) => handleSolicitudChange("observaciones", e.target.value)}
                        disabled={isPending}
                        rows={2}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Tab: Producto */}
                {activeTab === "producto" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Categoría</label>
                        <select
                          value={especificacionProducto.categoria_producto || ""}
                          onChange={(e) => handleProductoChange("categoria_producto", Number(e.target.value))}
                          disabled={loadingCategorias || isPending}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        >
                          <option value="">Seleccionar categoría</option>
                          {categorias.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Material</label>
                        <select
                          value={especificacionProducto.material || ""}
                          onChange={(e) => handleProductoChange("material", e.target.value as MaterialProducto)}
                          disabled={isPending}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        >
                          {materiales.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Tipo de capa</label>
                        <select
                          value={especificacionProducto.capas || ""}
                          onChange={(e) => handleProductoChange("capas", e.target.value as TipoCapa)}
                          disabled={isPending}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        >
                          <option value="">Seleccionar</option>
                          {tiposCapa.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Micraje</label>
                        <input
                          type="text"
                          value={especificacionProducto.micraje || ""}
                          onChange={(e) => handleProductoChange("micraje", e.target.value)}
                          disabled={isPending}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Color de bolsa</label>
                        <input
                          type="text"
                          value={especificacionProducto.color_bolsa || ""}
                          onChange={(e) => handleProductoChange("color_bolsa", e.target.value)}
                          disabled={isPending}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Opacidad</label>
                        <select
                          value={especificacionProducto.opacidad || ""}
                          onChange={(e) => handleProductoChange("opacidad", e.target.value as Opacidad)}
                          disabled={isPending}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        >
                          <option value="">Seleccionar</option>
                          {opacidades.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="apto_alimento"
                        checked={especificacionProducto.apto_alimento || false}
                        onChange={(e) => handleProductoChange("apto_alimento", e.target.checked)}
                        disabled={isPending}
                        className="rounded border-border"
                      />
                      <label htmlFor="apto_alimento" className="text-sm">Apto para alimentos</label>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Otras características</label>
                      <textarea
                        value={especificacionProducto.otras_caracteristicas || ""}
                        onChange={(e) => handleProductoChange("otras_caracteristicas", e.target.value)}
                        disabled={isPending}
                        rows={2}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>

                    {/* Variantes de color */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">Colores y cantidades</label>
                      <div className="space-y-2">
                        {variantesColor.map((variante, index) => (
                          <div key={index} className="grid gap-2 sm:grid-cols-3">
                            <input
                              type="text"
                              value={variante.color || ""}
                              onChange={(e) => handleVarianteColorChange(index, "color", e.target.value)}
                              placeholder="Color"
                              disabled={isPending}
                              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                            <input
                              type="text"
                              value={variante.cantidad || ""}
                              onChange={(e) => handleVarianteColorChange(index, "cantidad", e.target.value)}
                              placeholder="Cantidad"
                              disabled={isPending}
                              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Especificaciones */}
                {activeTab === "especificaciones" && (
                  <div className="space-y-4">
                    {productType === "bag" && especificacionBolsa && (
                      <>
                        <h3 className="font-semibold">Especificaciones de Bolsa</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-sm font-medium">Ancho doblado</label>
                            <input
                              type="text"
                              value={especificacionBolsa.ancho_doblado || ""}
                              onChange={(e) => handleBolsaChange("ancho_doblado", e.target.value)}
                              disabled={isPending}
                              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium">Largo doblado</label>
                            <input
                              type="text"
                              value={especificacionBolsa.largo_doblado || ""}
                              onChange={(e) => handleBolsaChange("largo_doblado", e.target.value)}
                              disabled={isPending}
                              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium">Tipo troquel</label>
                            <select
                              value={especificacionBolsa.tipo_troquel || ""}
                              onChange={(e) => handleBolsaChange("tipo_troquel", e.target.value as TipoTroquel)}
                              disabled={isPending}
                              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            >
                              <option value="">Seleccionar</option>
                              {tiposTroquel.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium">Tipo sello</label>
                            <select
                              value={especificacionBolsa.tipo_sello || "ninguno"}
                              onChange={(e) => handleBolsaChange("tipo_sello", e.target.value as TipoSello)}
                              disabled={isPending}
                              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            >
                              {tiposSello.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="fuelle"
                            checked={especificacionBolsa.fuelle || false}
                            onChange={(e) => handleBolsaChange("fuelle", e.target.checked)}
                            disabled={isPending}
                            className="rounded border-border"
                          />
                          <label htmlFor="fuelle" className="text-sm">Tiene fuelle</label>
                        </div>

                        {especificacionBolsa.fuelle && (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-1.5 block text-sm font-medium">Fuelle izquierdo</label>
                              <input
                                type="text"
                                value={especificacionBolsa.fuelle_izquierdo || ""}
                                onChange={(e) => handleBolsaChange("fuelle_izquierdo", e.target.value)}
                                disabled={isPending}
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="mb-1.5 block text-sm font-medium">Fuelle derecho</label>
                              <input
                                type="text"
                                value={especificacionBolsa.fuelle_derecho || ""}
                                onChange={(e) => handleBolsaChange("fuelle_derecho", e.target.value)}
                                disabled={isPending}
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {productType === "roll" && especificacionBobina && (
                      <>
                        <h3 className="font-semibold">Especificaciones de Bobina</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-sm font-medium">Ancho</label>
                            <input
                              type="text"
                              value={especificacionBobina.ancho || ""}
                              onChange={(e) => handleBobinaChange("ancho", e.target.value)}
                              disabled={isPending}
                              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium">Longitud</label>
                            <input
                              type="text"
                              value={especificacionBobina.longitud || ""}
                              onChange={(e) => handleBobinaChange("longitud", e.target.value)}
                              disabled={isPending}
                              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium">Diámetro</label>
                            <input
                              type="text"
                              value={especificacionBobina.diametro || ""}
                              onChange={(e) => handleBobinaChange("diametro", e.target.value)}
                              disabled={isPending}
                              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium">Diámetro núcleo</label>
                            <input
                              type="text"
                              value={especificacionBobina.diametro_nucleo || ""}
                              onChange={(e) => handleBobinaChange("diametro_nucleo", e.target.value)}
                              disabled={isPending}
                              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium">Tipo núcleo</label>
                            <input
                              type="text"
                              value={especificacionBobina.tipo_nucleo || ""}
                              onChange={(e) => handleBobinaChange("tipo_nucleo", e.target.value)}
                              disabled={isPending}
                              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium">Peso</label>
                            <input
                              type="text"
                              value={especificacionBobina.peso || ""}
                              onChange={(e) => handleBobinaChange("peso", e.target.value)}
                              disabled={isPending}
                              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Impresión */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Impresión</h3>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="impresion"
                          checked={especificacionProducto.impresion || false}
                          onChange={(e) => handleProductoChange("impresion", e.target.checked)}
                          disabled={isPending}
                          className="rounded border-border"
                        />
                        <label htmlFor="impresion" className="text-sm">Requiere impresión</label>
                      </div>

                      {especificacionProducto.impresion && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-sm font-medium">Colores de impresión</label>
                            <input
                              type="text"
                              value={Array.isArray(especificacionProducto.color_impresion)
                                ? especificacionProducto.color_impresion.join(", ")
                                : especificacionProducto.color_impresion || ""}
                              onChange={(e) => handleProductoChange("color_impresion", e.target.value.split(", ").filter(Boolean))}
                              disabled={isPending}
                              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium">Tipo impresión</label>
                            <select
                              value={especificacionProducto.tipo_impresion || ""}
                              onChange={(e) => handleProductoChange("tipo_impresion", e.target.value as TipoImpresion)}
                              disabled={isPending}
                              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            >
                              <option value="">Seleccionar</option>
                              {tiposImpresion.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium">Tratamiento impresión</label>
                            <select
                              value={especificacionProducto.tratamiento_impresion || ""}
                              onChange={(e) => handleProductoChange("tratamiento_impresion", e.target.value as TratamientoImpresion)}
                              disabled={isPending}
                              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            >
                              <option value="">Seleccionar</option>
                              {tratamientosImpresion.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium">Posición impresión</label>
                            <select
                              value={especificacionProducto.posicion_impresion || ""}
                              onChange={(e) => handleProductoChange("posicion_impresion", e.target.value as PosicionImpresion)}
                              disabled={isPending}
                              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            >
                              <option value="">Seleccionar</option>
                              {posicionesImpresion.map((p) => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium">Cara impresión</label>
                            <select
                              value={especificacionProducto.cara_impresion || ""}
                              onChange={(e) => handleProductoChange("cara_impresion", e.target.value as CaraImpresion)}
                              disabled={isPending}
                              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            >
                              <option value="">Seleccionar</option>
                              {carasImpresion.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tratamientos acabados */}
                    <div>
                      <label className="mb-2 block text-sm font-medium">Tratamientos y acabados</label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {tratamientosAcabados.map((t) => {
                          const selected = (especificacionProducto.tratamientos_acabados_especiales || []).includes(t.value);
                          return (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => toggleTratamiento(t.value)}
                              disabled={isPending}
                              className={`flex items-start gap-2 rounded-md border p-3 text-left text-sm ${selected ? "border-primary bg-primary/5" : "border-border"
                                }`}
                            >
                              <span className={`mt-0.5 h-4 w-4 rounded border ${selected ? "border-primary bg-primary" : "border-border"
                                }`} />
                              <div>
                                <span className="font-medium">{t.label}</span>
                                <p className="text-xs text-muted-foreground">{t.description}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isPending}
                      className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isPending || loadingDetalle}
                      className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">

        </div>
      </div>
    </div>
  );
}