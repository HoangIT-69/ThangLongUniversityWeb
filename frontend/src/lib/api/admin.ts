import { apiRequest } from "./client";
import type { MajorResponse, PeriodResponse, RoomResponse } from "./types";

export const adminApi = {
  listMajors: () => apiRequest<MajorResponse[]>("/api/admin/majors"),
  deleteMajor: (id: number | string) => apiRequest<string>(`/api/admin/majors/${id}`, { method: "DELETE" }),

  listRooms: () => apiRequest<RoomResponse[]>("/api/admin/rooms"),
  deleteRoom: (id: number | string) => apiRequest<string>(`/api/admin/rooms/${id}`, { method: "DELETE" }),

  listPeriods: () => apiRequest<PeriodResponse[]>("/api/admin/periods"),
  deletePeriod: (id: number | string) => apiRequest<string>(`/api/admin/periods/${id}`, { method: "DELETE" }),
};
