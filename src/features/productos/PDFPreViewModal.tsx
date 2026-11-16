
import { useEffect, useState } from "react";
import { X, Download, FileText, LoaderCircle } from "lucide-react";

interface PdfPreviewModalProps {
  pdf: Blob;
  nombreArchivo: string;
  descripcion: string;
  onClose: () => void;
}

export default function PdfPreviewModal({
  pdf,
  nombreArchivo,
  descripcion,
  onClose,
}: PdfPreviewModalProps) {
  const [urlPDF, setUrlPDF] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(pdf);
    setUrlPDF(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [pdf]);

  const descargarPDF = () => {
    if (!urlPDF) return;

    const link = document.createElement("a");
    link.href = urlPDF;
    link.download = nombreArchivo;
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Vista previa del PDF"
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
              <p className="text-xs text-slate-500">{descripcion}</p>
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
          {urlPDF ? (
            <iframe
              title={nombreArchivo}
              src={urlPDF}
              className="h-[65vh] min-h-[400px] w-full rounded-lg bg-white"
            />
          ) : (
            <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-500">
              <LoaderCircle size={18} className="animate-spin" />
              Cargando PDF...
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
            disabled={!urlPDF}
            onClick={descargarPDF}
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
