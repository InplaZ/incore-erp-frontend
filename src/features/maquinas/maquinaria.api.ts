
// ============================================================
// PETICIONES HTTP - MÓDULO MAQUINARIA
// ============================================================

import { api } from "@/api/api.config";

import type {
  Equipo,
  EquipoCreate,
  Maquinaria,
  MaquinariaCreate,
  AreaProduccion,
  CapacidadExtrusion,
  CapacidadExtrusionCreate,
  CapacidadFlexografia,
  CapacidadFlexografiaCreate,
  CapacidadConfeccion,
  CapacidadConfeccionCreate,
  CapacidadRefilado,
  CapacidadRefiladoCreate,
} from "./maquinaria.types";

// ============================================================
// EQUIPOS
// ============================================================

export const equiposApi = {
  list: async (): Promise<Equipo[]> =>
    api.get("/recursos/equipos/"),

  get: async (id: number): Promise<Equipo> =>
    api.get(`/recursos/equipos/${id}/`),

  create: async (data: EquipoCreate): Promise<Equipo> =>
    api.post("/recursos/equipos/", data),

  update: async (
    id: number,
    data: Partial<EquipoCreate>
  ): Promise<Equipo> =>
    api.patch(`/recursos/equipos/${id}/`, data),

  delete: async (id: number): Promise<void> =>
    api.delete(`/recursos/equipos/${id}/`),
};

// ============================================================
// MAQUINARIAS
// ============================================================

export const maquinariasApi = {
  list: async (): Promise<Maquinaria[]> =>
    api.get("/recursos/maquinarias/"),

  get: async (id: number): Promise<Maquinaria> =>
    api.get(`/recursos/maquinarias/${id}/`),

  create: async (data: MaquinariaCreate): Promise<Maquinaria> =>
    api.post("/recursos/maquinarias/", data),

  update: async (
    id: number,
    data: Partial<MaquinariaCreate>
  ): Promise<Maquinaria> =>
    api.patch(`/recursos/maquinarias/${id}/`, data),

  delete: async (id: number): Promise<void> =>
    api.delete(`/recursos/maquinarias/${id}/`),
};

// ============================================================
// ÁREAS DE PRODUCCIÓN
// ============================================================

export const areasProduccionApi = {
  list: async (): Promise<AreaProduccion[]> =>
    api.get("/recursos/areas-produccion/"),

  get: async (id: number): Promise<AreaProduccion> =>
    api.get(`/recursos/areas-produccion/${id}/`),
};

// ============================================================
// CAPACIDAD DE EXTRUSIÓN
// Una maquinaria puede tener varios registros por material.
// ============================================================

export const capacidadesExtrusionApi = {
  list: async (): Promise<CapacidadExtrusion[]> =>
    api.get("/recursos/capacidades-extrusion/"),

  get: async (id: number): Promise<CapacidadExtrusion> =>
    api.get(`/recursos/capacidades-extrusion/${id}/`),

  create: async (
    data: CapacidadExtrusionCreate
  ): Promise<CapacidadExtrusion> =>
    api.post("/recursos/capacidades-extrusion/", data),

  update: async (
    id: number,
    data: Partial<CapacidadExtrusionCreate>
  ): Promise<CapacidadExtrusion> =>
    api.patch(`/recursos/capacidades-extrusion/${id}/`, data),

  delete: async (id: number): Promise<void> =>
    api.delete(`/recursos/capacidades-extrusion/${id}/`),
};

// ============================================================
// CAPACIDAD DE FLEXOGRAFÍA
// Relación OneToOne con maquinaria.
// ============================================================

export const capacidadesFlexografiaApi = {
  list: async (): Promise<CapacidadFlexografia[]> =>
    api.get("/recursos/capacidades-flexografia/"),

  get: async (id: number): Promise<CapacidadFlexografia> =>
    api.get(`/recursos/capacidades-flexografia/${id}/`),

  create: async (
    data: CapacidadFlexografiaCreate
  ): Promise<CapacidadFlexografia> =>
    api.post("/recursos/capacidades-flexografia/", data),

  update: async (
    id: number,
    data: Partial<CapacidadFlexografiaCreate>
  ): Promise<CapacidadFlexografia> =>
    api.patch(`/recursos/capacidades-flexografia/${id}/`, data),

  delete: async (id: number): Promise<void> =>
    api.delete(`/recursos/capacidades-flexografia/${id}/`),
};

// ============================================================
// CAPACIDAD DE CONFECCIÓN
// ============================================================

export const capacidadesConfeccionApi = {
  list: async (): Promise<CapacidadConfeccion[]> =>
    api.get("/recursos/capacidades-confeccion/"),

  get: async (id: number): Promise<CapacidadConfeccion> =>
    api.get(`/recursos/capacidades-confeccion/${id}/`),

  create: async (
    data: CapacidadConfeccionCreate
  ): Promise<CapacidadConfeccion> =>
    api.post("/recursos/capacidades-confeccion/", data),

  update: async (
    id: number,
    data: Partial<CapacidadConfeccionCreate>
  ): Promise<CapacidadConfeccion> =>
    api.patch(`/recursos/capacidades-confeccion/${id}/`, data),

  delete: async (id: number): Promise<void> =>
    api.delete(`/recursos/capacidades-confeccion/${id}/`),
};

// ============================================================
// CAPACIDAD DE REFILADO
// ============================================================

export const capacidadesRefiladoApi = {
  list: async (): Promise<CapacidadRefilado[]> =>
    api.get("/recursos/capacidades-refilado/"),

  get: async (id: number): Promise<CapacidadRefilado> =>
    api.get(`/recursos/capacidades-refilado/${id}/`),

  create: async (
    data: CapacidadRefiladoCreate
  ): Promise<CapacidadRefilado> =>
    api.post("/recursos/capacidades-refilado/", data),

  update: async (
    id: number,
    data: Partial<CapacidadRefiladoCreate>
  ): Promise<CapacidadRefilado> =>
    api.patch(`/recursos/capacidades-refilado/${id}/`, data),

  delete: async (id: number): Promise<void> =>
    api.delete(`/recursos/capacidades-refilado/${id}/`),
};
