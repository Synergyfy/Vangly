import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./auth-token";
import type { AuthResponse } from "@/types/api/auth";

export interface ApiErrorBody {
  message: string;
  code?: string;
  details?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseURL) {
  // Surface this at module load so misconfiguration fails fast in dev.
  // We don't throw because the build can still produce a bundle for static
  // pages that never reach the client.
  console.warn(
    "[vangly] NEXT_PUBLIC_API_BASE_URL is not defined. API calls will fail.",
  );
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  refreshInFlight = (async () => {
    try {
      const { data } = await axios.post<AuthResponse>(
        `${baseURL ?? ""}/api/auth/refresh`,
        { refresh_token: refreshToken },
        { headers: { "Content-Type": "application/json" } },
      );
      setTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      clearTokens();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

function attachAuthHeader(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
}

function normalizeError(error: AxiosError<ApiErrorBody>): ApiError {
  const status = error.response?.status ?? 0;
  const body: ApiErrorBody = error.response?.data ?? {
    message: error.message || "Network error",
  };
  return new ApiError(status, body);
}

function createClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: baseURL ?? "",
    timeout: 15_000,
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use(attachAuthHeader);

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorBody>) => {
      const original = error.config as
        | (AxiosRequestConfig & { _retry?: boolean })
        | undefined;
      const status = error.response?.status;

      if (
        status === 401 &&
        original &&
        !original._retry &&
        !original.url?.includes("/api/auth/refresh") &&
        !original.url?.includes("/api/auth/login") &&
        getRefreshToken()
      ) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          original._retry = true;
          return instance.request(original);
        }
      }

      return Promise.reject(normalizeError(error));
    },
  );

  return instance;
}

export const api = createClient();
