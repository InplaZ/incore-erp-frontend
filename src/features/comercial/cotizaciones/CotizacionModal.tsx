import { useMemo, useState } from "react";

import {
  X,
  User,
  Package,
  Route,
  Calendar,
  DollarSign,
  Percent,
  Calculator,
  ArrowRight,
} from "lucide-react";

import type {
  CuentaComercial,
  Moneda,
  ProductoBusquedaResultado,
  ProductType,
} from "@/features/comercial/comercial.types";

import type { EvaluarViabilidadResponse } from "@/features/viabilidad/viabilidad.types";

interface CotizacionModalProps {
  open: boolean;
  onClose: () => void;

  cuenta?: CuentaComercial;
  producto?: ProductoBusquedaResultado | null;
  productoNombre?: string;

  productType?: ProductType;

  cantidadUnidades?: string;
  cantidadKg?: string;

  fechaEntrega?: string;
  observaciones?: string;

  resultadoViabilidad?: EvaluarViabilidadResponse | null;

  onCrear?: (data: CotizacionFormData) => void;
}

export interface CotizacionFormData {
  cantidad: string;
  moneda: Moneda;
  precioLista: string;
  descuentoPorcentaje: string;
  precioUnitario: string;
  precioTotal: string;
  fechaVencimiento: string;
  observaciones: string;
}

const nombresProceso: Record<string, string> = {
  extrusion: "Extrusión",
  flexografia: "Flexografía",
  confeccion: "Confección",
};

function obtenerNombreProceso(proceso: string) {
  return (
    nombresProceso[proceso.toLowerCase()] ??
    proceso.charAt(0).toUpperCase() + proceso.slice(1)
  );
}

export default function CotizacionModal({
  open,
  onClose,
  cuenta,
  producto,
  productoNombre,
  productType,
  cantidadUnidades,
  fechaEntrega,
  observaciones,
  resultadoViabilidad,
  onCrear,
}: CotizacionModalProps) {
  const [cantidad, setCantidad] = useState(cantidadUnidades || "");
  const [moneda, setMoneda] = useState<Moneda>("BOB");
  const [precioLista, setPrecioLista] = useState("");
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState("0");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [observacionesCotizacion, setObservacionesCotizacion] =
    useState(observaciones || "");

  /*
   * =====================================================
   * INICIALIZACIÓN
   * =====================================================
   */

  /*
   * =====================================================
   * CÁLCULOS
   * =====================================================
   */
  const precioUnitario = useMemo(() => {
    const lista = Number(precioLista);
    const descuento = Number(descuentoPorcentaje);

    if (!Number.isFinite(lista) || lista < 0) {
      return 0;
    }

    if (!Number.isFinite(descuento) || descuento < 0) {
      return lista;
    }

    return lista - lista * (descuento / 100);
  }, [precioLista, descuentoPorcentaje]);

  const precioTotal = useMemo(() => {
    const cantidadNumerica = Number(cantidad);

    if (
      !Number.isFinite(cantidadNumerica) ||
      cantidadNumerica < 0
    ) {
      return 0;
    }

    return cantidadNumerica * precioUnitario;
  }, [cantidad, precioUnitario]);

  /*
   * =====================================================
   * DATOS DE PRESENTACIÓN
   * =====================================================
   */

  const nombreCliente =
    cuenta?.tipo_persona === "juridica"
      ? cuenta.razon_social
      : [
        cuenta?.nombres,
        cuenta?.apellido_paterno,
        cuenta?.apellido_materno,
      ]
        .filter(Boolean)
        .join(" ") || "Cliente no disponible";

  const nombreProducto =
    producto?.producto_nombre || productoNombre || "Producto seleccionado";

  const codigoProducto =
    producto?.producto_codigo || "Sin código";

  const versionProducto =
    producto?.version_numero
      ? `Versión ${producto.version_numero}`
      : "";

  const tipoProducto =
    productType === "bag"
      ? "Bolsa"
      : productType === "roll"
        ? "Bobina"
        : "Producto";

  const rutaDescripcion =
    resultadoViabilidad?.ruta?.length
      ? resultadoViabilidad.ruta
        .map(obtenerNombreProceso)
        .join(" → ")
      : "Ruta no disponible";

  /*
   * =====================================================
   * CREAR COTIZACIÓN
   * =====================================================
   */

  const handleCrear = () => {
    const data: CotizacionFormData = {
      cantidad,
      moneda,
      precioLista,
      descuentoPorcentaje,
      precioUnitario: precioUnitario.toFixed(2),
      precioTotal: precioTotal.toFixed(2),
      fechaVencimiento,
      observaciones: observacionesCotizacion,
    };

    if (onCrear) {
      onCrear(data);
      return;
    }

    console.log("Datos de cotización:", data);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-card shadow-xl">

        {/* =====================================================
            ENCABEZADO
            ===================================================== */}

        <div className="flex items-center justify-between border-b border-border px-6 py-4">

          <div className="flex items-center gap-3">

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Crear cotización
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Define las condiciones económicas del producto viable.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* =====================================================
            CONTENIDO
            ===================================================== */}

        <div className="overflow-y-auto px-6 py-6">

          {/* ===================================================
              RESUMEN DEL PRODUCTO
              =================================================== */}

          <section>

            <div className="mb-4 flex items-center gap-3">

              <Package className="h-5 w-5 text-primary" />

              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Resumen de la solicitud
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Información del cliente y producto seleccionado.
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {/* CLIENTE */}

              <div className="rounded-lg border border-border bg-card p-4">

                <div className="flex items-start gap-3">

                  <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                  <div className="min-w-0">

                    <p className="text-xs font-medium text-muted-foreground">
                      Cliente
                    </p>

                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {nombreCliente}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {cuenta?.telefono || ""}
                    </p>


                  </div>

                </div>

              </div>

              {/* PRODUCTO */}

              <div className="rounded-lg border border-border bg-card p-4">

                <div className="flex items-start gap-3">

                  <Package className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                  <div className="min-w-0">

                    <p className="text-xs font-medium text-muted-foreground">
                      Producto
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-foreground">
                      {nombreProducto}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">

                      <span>{tipoProducto}</span>

                      <span>
                        Código: {codigoProducto}
                      </span>

                      {versionProducto && (
                        <span>{versionProducto}</span>
                      )}

                    </div>

                  </div>

                </div>

              </div>

              {/* CANTIDAD */}

              <div className="rounded-lg border border-border bg-card p-4">

                <div className="flex items-start gap-3">

                  <Calculator className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                  <div>

                    <p className="text-xs font-medium text-muted-foreground">
                      Cantidad solicitada
                    </p>

                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {cantidad || "—"}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {productType === "roll"
                        ? "Kilogramos"
                        : "Unidades"}
                    </p>

                  </div>

                </div>

              </div>

              {/* ENTREGA */}

              <div className="rounded-lg border border-border bg-card p-4">

                <div className="flex items-start gap-3">

                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                  <div>

                    <p className="text-xs font-medium text-muted-foreground">
                      Fecha de entrega solicitada
                    </p>

                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {fechaEntrega || "No definida"}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* ===================================================
              VIABILIDAD
              =================================================== */}

          <section className="mt-8">

            <div className="mb-4 flex items-center gap-3">

              <Route className="h-5 w-5 text-emerald-600" />

              <div>

                <h3 className="text-sm font-semibold text-foreground">
                  Viabilidad técnica
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Ruta de producción determinada por la evaluación.
                </p>

              </div>

            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">

                  <Route className="h-4 w-4 text-emerald-600" />

                </div>

                <div>

                  <p className="text-xs font-medium text-emerald-700">
                    Ruta propuesta
                  </p>

                  <p className="mt-1 text-sm font-semibold text-emerald-900">
                    {rutaDescripcion}
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* ===================================================
              CONDICIONES ECONÓMICAS
              =================================================== */}

          <section className="mt-8">

            <div className="mb-4 flex items-center gap-3">

              <DollarSign className="h-5 w-5 text-primary" />

              <div>

                <h3 className="text-sm font-semibold text-foreground">
                  Condiciones económicas
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Define el precio y las condiciones de la cotización.
                </p>

              </div>

            </div>

            <div className="rounded-lg border border-border p-5">

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* CANTIDAD */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Cantidad
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cantidad}
                    onChange={(e) =>
                      setCantidad(e.target.value)
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Ej. 10000"
                  />

                  <p className="mt-1 text-xs text-muted-foreground">
                    {productType === "roll"
                      ? "Cantidad expresada en kg."
                      : "Cantidad expresada en unidades."}
                  </p>

                </div>

                {/* MONEDA */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Moneda
                  </label>

                  <select
                    value={moneda}
                    onChange={(e) =>
                      setMoneda(
                        e.target.value as Moneda,
                      )
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="BOB">
                      Bolivianos (BOB)
                    </option>

                    <option value="USD">
                      Dólares (USD)
                    </option>
                  </select>

                </div>

                {/* PRECIO LISTA */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Precio de lista
                  </label>

                  <div className="relative">

                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={precioLista}
                      onChange={(e) =>
                        setPrecioLista(
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="0.00"
                    />

                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Precio unitario antes del descuento.
                  </p>

                </div>

                {/* DESCUENTO */}

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Descuento
                  </label>

                  <div className="relative">

                    <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={descuentoPorcentaje}
                      onChange={(e) =>
                        setDescuentoPorcentaje(
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="0"
                    />

                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Porcentaje aplicado sobre el precio de lista.
                  </p>

                </div>

              </div>

              {/* RESULTADO ECONÓMICO */}

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

                <div className="rounded-lg border border-border bg-muted/30 p-4">

                  <p className="text-xs font-medium text-muted-foreground">
                    Precio unitario
                  </p>

                  <p className="mt-1 text-xl font-semibold text-foreground">
                    {moneda} {precioUnitario.toFixed(2)}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Precio después del descuento.
                  </p>

                </div>

                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">

                  <p className="text-xs font-medium text-emerald-700">
                    Total de la cotización
                  </p>

                  <p className="mt-1 text-xl font-semibold text-emerald-800">
                    {moneda} {precioTotal.toFixed(2)}
                  </p>

                  <p className="mt-1 text-xs text-emerald-700">
                    Cantidad × precio unitario.
                  </p>

                </div>

              </div>

              {/* VALIDEZ */}

              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Validez de la cotización
                </label>

                <input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) =>
                    setFechaVencimiento(
                      e.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                />

                <p className="mt-1 text-xs text-muted-foreground">
                  Fecha hasta la cual se mantiene vigente la cotización.
                </p>
              </div>

              {/* OBSERVACIONES */}

              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Observaciones
                </label>

                <textarea
                  value={observacionesCotizacion}
                  onChange={(e) =>
                    setObservacionesCotizacion(
                      e.target.value,
                    )
                  }
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Observaciones adicionales de la cotización..."
                />

              </div>
            </div>
          </section>
        </div>

        {/* =====================================================
            FOOTER
            ===================================================== */}

        <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs text-muted-foreground">
            Los precios serán validados nuevamente por el sistema.
          </p>
          <div className="flex items-center justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleCrear}
              disabled={
                !cantidad ||
                !precioLista ||
                Number(precioLista) < 0 ||
                Number(cantidad) <= 0
              }
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Crear cotización

              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
