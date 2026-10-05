import { useEffect, useMemo, useState } from "react";
import {
  X,
  FileText,
  User,
  Package,
  Route,
  Calendar,
  DollarSign,
  Percent,
  Calculator,
} from "lucide-react";

import type {
  CuentaComercial,
  Moneda,
  ProductoBusquedaResultado,
} from "@/features/comercial/comercial.types";

import type  EvaluarViabilidadResponse  from "@/features/comercial/comercial.hooks";

interface CotizacionModalProps {
  open: boolean;
  onClose: () => void;

  cuenta?: CuentaComercial;
  producto?: ProductoBusquedaResultado | null;

  productType?: "bolsa" | "bobina";

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

export default function CotizacionModal({
  open,
  onClose,
  cuenta,
  producto,
  productType,
  cantidadUnidades,
  cantidadKg,
  fechaEntrega,
  observaciones,
  resultadoViabilidad,
  onCrear,
}: CotizacionModalProps) {
  const [cantidad, setCantidad] = useState("");
  const [moneda, setMoneda] = useState<Moneda>("BOB");
  const [precioLista, setPrecioLista] = useState("");
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState("0");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [observacionesCotizacion, setObservacionesCotizacion] =
    useState("");

  /*
   * Inicializar la cantidad con la cantidad solicitada
   * en el requerimiento.
   */
  useEffect(() => {
    if (!open) return;

    if (productType === "bobina") {
      setCantidad(cantidadKg || "");
    } else {
      setCantidad(cantidadUnidades || "");
    }

    setObservacionesCotizacion(observaciones || "");

    /*
     * Por ahora dejamos la fecha de vencimiento
     * independiente de la fecha de entrega.
     */
    setFechaVencimiento("");
  }, [
    open,
    productType,
    cantidadUnidades,
    cantidadKg,
    observaciones,
  ]);

  /*
   * Cálculo visual de precios.
   *
   * El backend seguirá siendo la fuente definitiva
   * para calcular estos valores.
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

    if (!Number.isFinite(cantidadNumerica) || cantidadNumerica < 0) {
      return 0;
    }

    return cantidadNumerica * precioUnitario;
  }, [cantidad, precioUnitario]);

  const rutaDescripcion = useMemo(() => {
    if (!resultadoViabilidad?.ruta?.length) {
      return "Ruta no disponible";
    }

    return resultadoViabilidad.ruta
      .map((proceso: string) => {
        const nombres: Record<string, string> = {
          extrusion: "Extrusión",
          flexografia: "Flexografía",
          confeccion: "Confección",
        };

        return nombres[proceso] || proceso;
      })
      .join(" → ");
  }, [resultadoViabilidad]);

  const nombreCliente =
    cuenta?.razon_social ||
    cuenta?.nombre_comercial ||
    cuenta?.nombre ||
    "Cliente no disponible";

  const nombreProducto =
    producto?.producto_nombre ||
    producto?.nombre ||
    producto?.descripcion ||
    "Producto seleccionado";

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

    /*
     * Por ahora solo dejamos preparado el flujo.
     * La conexión con el backend la hacemos después
     * de aprobar la interfaz.
     */
    console.log("Datos de cotización:", data);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Crear cotización
              </h2>

              <p className="text-sm text-gray-500">
                Define las condiciones económicas para el cliente
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="overflow-y-auto px-6 py-5">

          {/* RESUMEN */}
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-500" />

              <h3 className="text-sm font-semibold text-gray-800">
                Resumen de la solicitud
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">

              {/* CLIENTE */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-gray-500">
                  <User className="h-4 w-4" />

                  <span className="text-xs font-medium uppercase">
                    Cliente
                  </span>
                </div>

                <p className="truncate text-sm font-semibold text-gray-900">
                  {nombreCliente}
                </p>
              </div>

              {/* PRODUCTO */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-gray-500">
                  <Package className="h-4 w-4" />

                  <span className="text-xs font-medium uppercase">
                    Producto
                  </span>
                </div>

                <p className="truncate text-sm font-semibold text-gray-900">
                  {nombreProducto}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {productType === "bobina" ? "Bobina" : "Bolsa"}
                </p>
              </div>

              {/* CANTIDAD */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-gray-500">
                  <Calculator className="h-4 w-4" />

                  <span className="text-xs font-medium uppercase">
                    Cantidad
                  </span>
                </div>

                <p className="text-sm font-semibold text-gray-900">
                  {cantidad || "—"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {productType === "bobina" ? "kg" : "unidades"}
                </p>
              </div>

              {/* FECHA ENTREGA */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-gray-500">
                  <Calendar className="h-4 w-4" />

                  <span className="text-xs font-medium uppercase">
                    Entrega solicitada
                  </span>
                </div>

                <p className="text-sm font-semibold text-gray-900">
                  {fechaEntrega || "No definida"}
                </p>
              </div>
            </div>
          </section>

          {/* VIABILIDAD */}
          <section className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">

              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100">
                <Route className="h-4 w-4 text-green-600" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-green-800">
                  Producto técnicamente viable
                </p>

                <p className="mt-1 text-sm text-green-700">
                  Ruta de producción:
                </p>

                <p className="mt-1 text-sm font-semibold text-green-900">
                  {rutaDescripcion}
                </p>
              </div>
            </div>
          </section>

          {/* DATOS ECONÓMICOS */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />

              <h3 className="text-sm font-semibold text-gray-800">
                Condiciones económicas
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* CANTIDAD */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Cantidad
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Ej. 10000"
                />

                <p className="mt-1 text-xs text-gray-500">
                  {productType === "bobina"
                    ? "Cantidad expresada en kg"
                    : "Cantidad expresada en unidades"}
                </p>
              </div>

              {/* MONEDA */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Moneda
                </label>

                <select
                  value={moneda}
                  onChange={(e) =>
                    setMoneda(e.target.value as Moneda)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Precio de lista
                </label>

                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={precioLista}
                    onChange={(e) =>
                      setPrecioLista(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="0.00"
                  />
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  Precio unitario antes del descuento
                </p>
              </div>

              {/* DESCUENTO */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Descuento
                </label>

                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={descuentoPorcentaje}
                    onChange={(e) =>
                      setDescuentoPorcentaje(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="0"
                  />
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  Descuento aplicado sobre el precio de lista
                </p>
              </div>

              {/* PRECIO UNITARIO */}
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-medium uppercase text-blue-600">
                  Precio unitario
                </p>

                <p className="mt-1 text-xl font-bold text-blue-900">
                  {moneda} {precioUnitario.toFixed(2)}
                </p>

                <p className="mt-1 text-xs text-blue-700">
                  Precio después del descuento
                </p>
              </div>

              {/* TOTAL */}
              <div className="rounded-xl border border-gray-300 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase text-gray-500">
                  Total cotización
                </p>

                <p className="mt-1 text-xl font-bold text-gray-900">
                  {moneda} {precioTotal.toFixed(2)}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Cantidad × precio unitario
                </p>
              </div>

              {/* FECHA VENCIMIENTO */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Validez de la cotización
                </label>

                <input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) =>
                    setFechaVencimiento(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Fecha hasta la cual se mantiene vigente esta cotización.
                </p>
              </div>

              {/* OBSERVACIONES */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Observaciones
                </label>

                <textarea
                  value={observacionesCotizacion}
                  onChange={(e) =>
                    setObservacionesCotizacion(e.target.value)
                  }
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Observaciones adicionales de la cotización..."
                />
              </div>
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">

          <div className="text-xs text-gray-500">
            Los precios serán calculados y validados nuevamente por el sistema.
          </div>

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
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
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />

              Crear cotización
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}