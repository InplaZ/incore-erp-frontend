import { useState } from "react";
import {
    Check,
    ChevronDown,
    Edit3,
    MessageCircle,
    RotateCcw,
    Trash2,
    X,
} from "lucide-react";

import { useUpdateActividadComercial } from "../comercial.hooks";

import type {
    ActividadComercial,
    EstadoActividad,
} from "../comercial.types";

interface ActividadMenuProps {
    actividad: ActividadComercial;
    onEdit?: () => void;
    onDelete?: () => void;
    onRegistrarComunicacion?: () => void;
}

export default function ActividadMenu({
    actividad,
    onEdit,
    onDelete,
    onRegistrarComunicacion,
}: ActividadMenuProps) {
    const [open, setOpen] = useState(false);

    const updateActividad = useUpdateActividadComercial();

    const actualizarEstado = async (
        estado: EstadoActividad,
        completar = false,
    ) => {
        try {
            await updateActividad.mutateAsync({
                id: actividad.id,
                data: {
                    estado,
                    fecha_completada: completar
                        ? new Date().toISOString()
                        : null,
                },
            });

            setOpen(false);
        } catch (error) {
            console.error(
                "Error al actualizar actividad:",
                error,
            );
        }
    };

    const handleReabrir = async () => {
        await actualizarEstado("pendiente", false);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                disabled={updateActividad.isPending}
                className="
          rounded-md p-1.5
          text-muted-foreground
          transition-colors
          hover:bg-secondary
          hover:text-foreground
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
                aria-label="Acciones de actividad"
            >
                <ChevronDown className="h-4 w-4" />
            </button>

            {open && (
                <div
                    className="
            absolute right-0 top-full z-30 mt-2
            w-52
            overflow-hidden
            rounded-lg
            border border-border
            bg-card
            p-1
            shadow-lg
          "
                >
                    {actividad.estado === "pendiente" && (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    onRegistrarComunicacion?.();
                                }}
                                className="
                                    flex w-full items-center gap-2
                                    rounded-md px-3 py-2
                                    text-left text-sm
                                    text-foreground
                                    hover:bg-secondary
                                "
                            >
                                <MessageCircle className="h-4 w-4" />
                                Registrar comunicación
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    actualizarEstado("completada", true)
                                }
                                className="
                  flex w-full items-center gap-2
                  rounded-md px-3 py-2
                  text-left text-sm
                  text-foreground
                  hover:bg-secondary
                "
                            >
                                <Check className="h-4 w-4" />
                                Marcar como completada
                            </button>
                        </>
                    )}

                    {actividad.estado === "en_proceso" && (
                        <button
                            type="button"
                            onClick={() =>
                                actualizarEstado("completada", true)
                            }
                            className="
                flex w-full items-center gap-2
                rounded-md px-3 py-2
                text-left text-sm
                text-foreground
                hover:bg-secondary
              "
                        >
                            <Check className="h-4 w-4" />
                            Completar actividad
                        </button>
                    )}

                    {actividad.estado === "completada" && (
                        <button
                            type="button"
                            onClick={handleReabrir}
                            className="
                flex w-full items-center gap-2
                rounded-md px-3 py-2
                text-left text-sm
                text-foreground
                hover:bg-secondary
              "
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reabrir actividad
                        </button>
                    )}

                    {actividad.estado !== "completada" && (
                        <button
                            type="button"
                            onClick={() =>
                                actualizarEstado("cancelada")
                            }
                            className="
                flex w-full items-center gap-2
                rounded-md px-3 py-2
                text-left text-sm
                text-destructive
                hover:bg-destructive/10
              "
                        >
                            <X className="h-4 w-4" />
                            Cancelar actividad
                        </button>
                    )}

                    <div className="my-1 border-t border-border" />

                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onEdit?.();
                        }}
                        className="
              flex w-full items-center gap-2
              rounded-md px-3 py-2
              text-left text-sm
              text-foreground
              hover:bg-secondary
            "
                    >
                        <Edit3 className="h-4 w-4" />
                        Editar
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            onDelete?.();
                        }}
                        className="
              flex w-full items-center gap-2
              rounded-md px-3 py-2
              text-left text-sm
              text-destructive
              hover:bg-destructive/10
            "
                    >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                    </button>
                </div>
            )}
        </div>
    );
}