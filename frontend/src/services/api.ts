import axios, { AxiosInstance } from "axios";
import { AuthResponse, CaseListResponse, CaseResponse, CaseDetailResponse, User } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const SERVER_BASE = API_BASE.replace(/\/api\/?$/, "");

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getFileUrl = (filePath?: string, fileName?: string) => {
  if (!filePath && !fileName) return "";
  const name = fileName || (filePath ? filePath.split(/[\/\\]/).pop() : "");
  return `${SERVER_BASE}/uploads/${name}`;
};

export const authService = {
  register: (name: string, email: string, password: string, role: "manager" | "agent") =>
    api.post<AuthResponse>("/auth/register", { name, email, password, role }),
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),
  getCurrentUser: () =>
    api.get("/auth/me"),
  getAgents: () =>
    api.get<{ success: boolean; data: User[] }>("/auth/agents"),
};

export const caseService = {
  listCases: (page = 1, limit = 10, status?: string, agentId?: string, search?: string) =>
    api.get<CaseListResponse>("/cases", { params: { page, limit, status, agentId, search } }),
  createCase: (clientName: string, subjectName: string, caseType: string, dueDate: string, assignedTo?: string) =>
    api.post<CaseResponse>("/cases", { clientName, subjectName, caseType, dueDate, assignedTo }),
  getCaseById: (caseId: string) =>
    api.get<CaseDetailResponse>(`/cases/${caseId}`),
  addComment: (caseId: string, message: string) =>
    api.post(`/cases/${caseId}/comments`, { message }),
  uploadDocument: (caseId: string, file: File, description?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (description) formData.append("description", description);
    return api.post(`/cases/${caseId}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  assignCase: (caseId: string, assignedTo: string) =>
    api.post(`/cases/${caseId}/assign`, { assignedTo }),
  setCaseInProgress: (caseId: string) =>
    api.patch(`/cases/${caseId}/in-progress`, {}),
  submitCase: (caseId: string, note?: string) =>
    api.patch(`/cases/${caseId}/submit`, { note }),
  reviewCase: (caseId: string, status: "Cleared" | "Discrepant", note?: string) =>
    api.patch(`/cases/${caseId}/review`, { status, note }),
};

export default api;
