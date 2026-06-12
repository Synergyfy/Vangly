import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import type { AuthResponse } from "@/types/api/auth";

export interface ApiErrorBody {
  message: string;
  code?: string;
  details?: unknown;
  error?: {
    message?: string;
    code?: string;
    details?: unknown;
  };
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

  refreshInFlight = (async () => {
    try {
      // The refresh cookie is sent automatically by the browser (withCredentials).
      // No body required — the server reads req.cookies.vangly_refresh and
      // sets a fresh vangly_access + vangly_refresh cookie pair in the response.
      await axios.post<AuthResponse>(
        `${baseURL ?? ""}/api/auth/refresh`,
        {},
        { withCredentials: true, headers: { "Content-Type": "application/json" } },
      );
      return true;
    } catch {
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
    // withCredentials ensures the browser sends the httpOnly auth cookies on
    // every cross-origin request to the API server.
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  // No Authorization header interceptor needed — the vangly_access cookie is
  // forwarded automatically via withCredentials.

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
        !original.url?.includes("/api/auth/login")
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
