
// ============================================================
// CONSULTAS Y MUTACIONES CON REACT QUERY
// MÓDULO DE MAQUINARIA
// ============================================================

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  equiposApi,
  maquinariasApi,
  areasProduccionApi,
  capacidadesExtrusionApi,
  capacidadesFlexografiaApi,
  capacidadesConfeccionApi,
  capacidadesRefiladoApi,
} from "./maquinaria.api";

import type {
  EquipoCreate,
  MaquinariaCreate,
  CapacidadExtrusionCreate,
  CapacidadFlexografiaCreate,
  CapacidadConfeccionCreate,
  CapacidadRefiladoCreate,
} from "./maquinaria.types";

// ============================================================
// QUERY KEYS
// ============================================================

export const maquinariaQueryKeys = {
  all: ["maquinaria"] as const,

  equipos: () =>
    [...maquinariaQueryKeys.all, "equipos"] as const,

  lista: () =>
    [...maquinariaQueryKeys.all, "lista"] as const,

  maquinaria: (id: number) =>
    [...maquinariaQueryKeys.all, "detalle", id] as const,

  areas: () =>
    [...maquinariaQueryKeys.all, "areas"] as const,

  capacidades: () =>
    [...maquinariaQueryKeys.all, "capacidades"] as const,

  extrusion: () =>
    [...maquinariaQueryKeys.capacidades(), "extrusion"] as const,

  flexografia: () =>
    [...maquinariaQueryKeys.capacidades(), "flexografia"] as const,

  confeccion: () =>
    [...maquinariaQueryKeys.capacidades(), "confeccion"] as const,

  refilado: () =>
    [...maquinariaQueryKeys.capacidades(), "refilado"] as const,
};

// ============================================================
// EQUIPOS
// ============================================================

export function useEquipos() {
  return useQuery({
    queryKey: maquinariaQueryKeys.equipos(),
    queryFn: equiposApi.list,
  });
}

export function useCreateEquipo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EquipoCreate) =>
      equiposApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: maquinariaQueryKeys.all,
      });
    },
  });
}

export function useUpdateEquipo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<EquipoCreate>;
    }) => equiposApi.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: maquinariaQueryKeys.all,
      });
    },
  });
}

// ============================================================
// MAQUINARIAS
// ============================================================

export function useMaquinarias() {
  return useQuery({
    queryKey: maquinariaQueryKeys.lista(),
    queryFn: maquinariasApi.list,
  });
}

export function useMaquinaria(id: number, enabled = true) {
  return useQuery({
    queryKey: maquinariaQueryKeys.maquinaria(id),
    queryFn: () => maquinariasApi.get(id),
    enabled: enabled && !!id,
  });
}

export function useCreateMaquinaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MaquinariaCreate) =>
      maquinariasApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: maquinariaQueryKeys.all,
      });
    },
  });
}

export function useUpdateMaquinaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<MaquinariaCreate>;
    }) => maquinariasApi.update(id, data),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: maquinariaQueryKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: maquinariaQueryKeys.maquinaria(variables.id),
      });
    },
  });
}

export function useDeleteMaquinaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      maquinariasApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: maquinariaQueryKeys.all,
      });
    },
  });
}

// ============================================================
// ÁREAS DE PRODUCCIÓN
// ============================================================

export function useAreasProduccion() {
  return useQuery({
    queryKey: maquinariaQueryKeys.areas(),
    queryFn: areasProduccionApi.list,
  });
}

// ============================================================
// CAPACIDADES DE EXTRUSIÓN
// ============================================================

export function useCapacidadesExtrusion() {
  return useQuery({
    queryKey: maquinariaQueryKeys.extrusion(),
    queryFn: capacidadesExtrusionApi.list,
  });
}

export function useCreateCapacidadExtrusion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CapacidadExtrusionCreate) =>
      capacidadesExtrusionApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: maquinariaQueryKeys.capacidades(),
      });
    },
  });
}

export function useUpdateCapacidadExtrusion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CapacidadExtrusionCreate>;
    }) => capacidadesExtrusionApi.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: maquinariaQueryKeys.capacidades(),
      });
    },
  });
}

export function useDeleteCapacidadExtrusion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      capacidadesExtrusionApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: maquinariaQueryKeys.capacidades(),
      });
    },
  });
}

// ============================================================
// CAPACIDADES DE FLEXOGRAFÍA
// ============================================================

export function useCapacidadesFlexografia() {
  return useQuery({
    queryKey: maquinariaQueryKeys.flexografia(),
    queryFn: capacidadesFlexografiaApi.list,
  });
}

export function useCreateCapacidadFlexografia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CapacidadFlexografiaCreate) =>
      capacidadesFlexografiaApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: maquinariaQueryKeys.capacidades(),
      });
    },
  });
}

export function useUpdateCapacidadFlexografia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CapacidadFlexografiaCreate>;
    }) => capacidadesFlexografiaApi.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: maquinariaQueryKeys.capacidades(),
      });
    },
  });
}

export function useDeleteCapacidadFlexografia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      capacidadesFlexografiaApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: maquinariaQueryKeys.capacidades(),
      });
    },
  });
}

// ============================================================
// CAPACIDADES DE CONFECCIÓN
// ============================================================

export function useCapacidadesConfeccion() {
  return useQuery({
    queryKey: maquinariaQueryKeys.confeccion(),
    queryFn: capacidadesConfeccionApi.list,
  });
}

export function useCreateCapacidadConfeccion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CapacidadConfeccionCreate) =>
      capacidadesConfeccionApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: maquinariaQueryKeys.capacidades(),
      });
    },
  });
}

export function useUpdateCapacidadConfeccion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CapacidadConfeccionCreate>;
    }) => capacidadesConfeccionApi.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: maquinariaQueryKeys.capacidades(),
      });
    },
  });
}

export function useDeleteCapacidadConfeccion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      capacidadesConfeccionApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: maquinariaQueryKeys.capacidades(),
      });
    },
  });
}

// ============================================================
// CAPACIDADES DE REFILADO
// ============================================================

export function useCapacidadesRefilado() {
  return useQuery({
    queryKey: maquinariaQueryKeys.refilado(),
    queryFn: capacidadesRefiladoApi.list,
  });
}

export function useCreateCapacidadRefilado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CapacidadRefiladoCreate) =>
      capacidadesRefiladoApi.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: maquinariaQueryKeys.capacidades(),
      });
    },
  });
}

export function useUpdateCapacidadRefilado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CapacidadRefiladoCreate>;
    }) => capacidadesRefiladoApi.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: maquinariaQueryKeys.capacidades(),
      });
    },
  });
}

export function useDeleteCapacidadRefilado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      capacidadesRefiladoApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: maquinariaQueryKeys.capacidades(),
      });
    },
  });
}
