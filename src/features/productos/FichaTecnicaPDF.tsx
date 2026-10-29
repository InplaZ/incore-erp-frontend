
import { useEffect, useMemo, useState } from "react";
import { X, Download, FileText, LoaderCircle } from "lucide-react";
import { jsPDF } from "jspdf";
import type { Producto } from "./productos.types";
import type { ProductoBusquedaResultado } from "@/features/comercial/comercial.types";

interface FichaTecnicaPDFProps {
  producto: Producto;
  categoria: string;
  version?: ProductoBusquedaResultado;
  onClose: () => void;
}

const valor = (v: unknown, fallback = "No registrado"): string => {
  if (v === null || v === undefined || v === "") return fallback;
  if (typeof v === "boolean") return v ? "Sí" : "No";
  return String(v);
};

export default function FichaTecnicaPDF({
  producto,
  categoria,
  version,
  onClose,
}: FichaTecnicaPDFProps) {
  const [urlPDF, setUrlPDF] = useState<string | null>(null);
  const [errorPDF, setErrorPDF] = useState(false);

  const nombreArchivo = `FT_${producto.codigo || producto.id}.pdf`;

  const pdf = useMemo(() => {
    const doc = new jsPDF("p", "mm", "a4");
    const W = 210;
    const H = 297;
    const M = 12;
    const ancho = W - M * 2;
    const bolsa = version?.especificacion_bolsa;
    const bobina = version?.especificacion_bobina;

    let y = 14;

    const texto = (
      contenido: string,
      x = M,
      tamano = 9,
      negrita = false,
      color: [number, number, number] = [45, 57, 75],
    ) => {
      doc.setFont("helvetica", negrita ? "bold" : "normal");
      doc.setFontSize(tamano);
      doc.setTextColor(...color);
      doc.text(contenido, x, y);
    };

    const comprobarEspacio = (necesario = 12) => {
      if (y + necesario > 280) {
        doc.addPage();
        y = 16;
      }
    };

    const seccion = (titulo: string) => {
      comprobarEspacio(12);
      y += 2;
      doc.setFillColor(220, 225, 233);
      doc.rect(M, y, ancho, 8, "F");
      y += 5.3;
      texto(titulo, M + 3, 8.5, true);
      y += 6;
    };

    const campo = (
      etiqueta: string,
      dato: unknown,
      fallback = "No registrado",
    ) => {
      const valorTexto =
        dato === null || dato === undefined || dato === ""
          ? fallback
          : typeof dato === "boolean"
            ? dato
              ? "Sí"
              : "No"
            : String(dato);

      const xEtiqueta = M + 3;
      const xValor = M + 63;
      const anchoValor = W - M - xValor;

      doc.setFontSize(9);

      const lineas = doc.splitTextToSize(valorTexto, anchoValor);

      comprobarEspacio(Math.max(5, lineas.length * 4.5) + 1);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(75, 91, 111);
      doc.text(etiqueta, xEtiqueta, y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(35, 49, 72);
      doc.text(lineas, xValor, y);

      y += Math.max(5, lineas.length * 4.5) + 1;
    };

    // Encabezado corporativo
    doc.setDrawColor(20, 42, 83);
    doc.setLineWidth(1.5);
    doc.line(0, 2, W, 2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 42, 83);
    doc.text("INPLAZ SRL", M, 12);

    doc.setDrawColor(205, 215, 230);
    doc.setLineWidth(0.3);
    doc.line(M, 17, W - M, 17);

    // Bloque principal
    y = 22;
    doc.setFillColor(20, 42, 83);
    doc.rect(M, y, ancho, 38, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("INPLAZ", M + 5, y + 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("INDUSTRIA PLASTIC Z", M + 5, y + 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("FICHA TÉCNICA", M + 110, y + 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `${producto.codigo}  ·  V${valor(version?.version_numero, "1")}`,
      M + 110,
      y + 22,
    );

    y += 45;

    // Nombre del producto
    seccion(
      `${producto.nombre}`.toUpperCase().slice(0, 90),
    );

    // Descripción
    seccion("DESCRIPCIÓN");
    campo("Descripción", producto.descripcion, "Empaque general");

    // Material
    seccion("ESPECIFICACIONES TÉCNICAS · MATERIAL");
    campo("Material", version?.material);
    campo("Color", version?.color_bolsa);
    campo("Contacto alimentos", "No");

    // Dimensiones
    seccion("DIMENSIONES Y PRESENTACIÓN");

    campo(
      "Tipo de producto",
      bolsa ? "Bolsa" : bobina ? "Bobina" : categoria,
    );

    if (bolsa) {
      campo(
        "Ancho total desarrollado",
        bolsa.ancho_desdoblado ?? bolsa.ancho_doblado,
        "Pendiente",
      );
      campo("Largo", bolsa.largo_doblado, "Pendiente");
      campo("Espesor", version?.micraje, "Pendiente");
      campo("Sello", bolsa.tipo_sello, "Pendiente");
      campo("Troquel / acabado", bolsa.tipo_troquel, "Pendiente");

      campo(
        "Fuelles / pliegue",
        (bolsa as Record<string, unknown>).fuelle,
        "Sin fuelles",
      );
    } else if (bobina) {
      campo("Ancho", bobina.ancho, "Pendiente");
      campo("Longitud", bobina.longitud, "Pendiente");
      campo("Diámetro", bobina.diametro, "Pendiente");
      campo("Tipo de núcleo", bobina.tipo_nucleo, "Pendiente");
      campo("Espesor", version?.micraje, "Pendiente");
    } else {
      campo("Dimensiones", "Pendiente");
      campo("Espesor", version?.micraje, "Pendiente");
    }

    // Impresión
    seccion("DISEÑO DE IMPRESIÓN Y ESTRUCTURA");
    campo(
      "Tipo impresión",
      version?.impresion
        ? version?.tipo_impresion
        : "Sin impresión",
      "Sin impresión",
    );
    campo("Diseño cara A", "No aplica");
    campo("Diseño cara B", "No aplica");

    // Empaquetado
    seccion("UNIDADES DE EMPAQUETADO");
    campo("Unidades por paquete", undefined, "Pendiente");
    campo("Paquetes por jaba", undefined, "Pendiente");
    campo("Jabas por bulto", undefined, "Pendiente");

    // Almacenamiento y usos
    seccion("CONDICIONES DE ALMACENAMIENTO");
    campo(
      "Condiciones",
      "Almacenar en ambiente fresco y seco; proteger de luz solar directa, calor y daños mecánicos.",
    );

    seccion("USOS RECOMENDADOS Y VENTAJAS");
    campo("Uso", "Según especificación aprobada");

    // Pie de página en todas las páginas
    const paginas = doc.getNumberOfPages();

    for (let pagina = 1; pagina <= paginas; pagina++) {
      doc.setPage(pagina);
      doc.setDrawColor(205, 215, 230);
      doc.line(M, 284, W - M, 284);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(90, 100, 115);
      doc.text(
        "INPLAZ SRL  |  El Alto, La Paz, Bolivia  |  Documento emitido por INREACH V",
        M,
        290,
      );
      doc.text(`${pagina}/${paginas}`, W - M, 290, { align: "right" });
    }

    return doc;
  }, [producto, categoria, version]);

  useEffect(() => {
    let url: string | null = null;

    try {
      url = URL.createObjectURL(pdf.output("blob"));
      setUrlPDF(url);
      setErrorPDF(false);
    } catch {
      setErrorPDF(true);
      setUrlPDF(null);
    }

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [pdf]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Vista previa de ficha técnica"
        className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b px-5 py-3">
          <div className="flex items-center gap-3">
            <FileText className="text-emerald-700" size={22} />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Vista previa · {nombreArchivo}
              </h2>
              <p className="text-xs text-slate-500">
                Ficha técnica de {producto.nombre}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-auto bg-slate-100 p-4">
          {errorPDF ? (
            <p className="p-8 text-center text-sm text-red-600">
              No se pudo generar el PDF.
            </p>
          ) : urlPDF ? (
            <iframe
              title={`Ficha técnica ${producto.codigo}`}
              src={urlPDF}
              className="h-[65vh] min-h-[400px] w-full rounded-lg bg-white"
            />
          ) : (
            <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-500">
              <LoaderCircle size={18} className="animate-spin" />
              Generando PDF...
            </div>
          )}
        </main>

        <footer className="flex justify-end gap-2 border-t px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cerrar
          </button>

          <button
            type="button"
            disabled={!urlPDF || errorPDF}
            onClick={() => pdf.save(nombreArchivo)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            <Download size={17} />
            Descargar PDF
          </button>
        </footer>
      </section>
    </div>
  );
}
