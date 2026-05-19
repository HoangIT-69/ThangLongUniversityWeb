import type { AuthResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const STORAGE_KEY = "tlu-auth";

export interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  role: AuthResponse["role"];
  name?: string | null;
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function setStoredAuth(auth: StoredAuth | null) {
  if (typeof window === "undefined") return;
  if (!auth) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const body = text ? tryParseJson(text) : null;

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : response.statusText || "Request failed";
    throw new Error(message);
  }

  return body as T;
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  return apiRequestWithRetry<T>(path, init, true);
}

async function apiRequestWithRetry<T>(path: string, init: RequestInit, allowRefresh: boolean): Promise<T> {
  const auth = getStoredAuth();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (auth?.accessToken) headers.set("Authorization", `Bearer ${auth.accessToken}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });
  } catch (error) {
    throw new Error(
      `Khong ket noi duoc backend tai ${API_BASE_URL}. Kiem tra Spring Boot dang chay, VITE_API_BASE_URL va CORS.`,
      { cause: error },
    );
  }

  if (response.status === 401 && allowRefresh && auth?.refreshToken && !path.startsWith("/api/auth/")) {
    const refreshed = await refreshAccessToken(auth);
    if (refreshed) {
      return apiRequestWithRetry<T>(path, init, false);
    }
  }

  return parseResponse<T>(response);
}

async function refreshAccessToken(auth: StoredAuth): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: auth.refreshToken }),
    });
    if (!response.ok) {
      setStoredAuth(null);
      return false;
    }

    const next = (await response.json()) as AuthResponse;
    setStoredAuth({
      accessToken: next.accessToken,
      refreshToken: next.refreshToken,
      role: next.role,
      name: auth.name ?? null,
    });
    return true;
  } catch {
    setStoredAuth(null);
    return false;
  }
}

export function jsonBody(value: unknown) {
  return JSON.stringify(value);
}
