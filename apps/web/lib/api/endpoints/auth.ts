import { api } from "../client";
import type {
  AuthResponse,
  ForgotPinInput,
  ForgotPinResponse,
  LoginInput,
  ResetPinInput,
  ResetPinResponse,
  User,
} from "@/types/api/auth";

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/api/auth/login", input);
  return data;
}

export async function me(): Promise<User> {
  const { data } = await api.get<User>("/api/auth/me");
  return data;
}

export async function logout(): Promise<void> {
  // The refresh cookie is sent automatically via withCredentials.
  // The server reads req.cookies.harvite_refresh to revoke the family,
  // then clears both cookies via Set-Cookie headers.
  await api.post<void>("/api/auth/logout", {});
}

export async function forgotPin(input: ForgotPinInput): Promise<ForgotPinResponse> {
  const { data } = await api.post<ForgotPinResponse>(
    "/api/auth/forgot-pin",
    input,
  );
  return data;
}

export async function resetPin(input: ResetPinInput): Promise<ResetPinResponse> {
  const { data } = await api.post<ResetPinResponse>(
    "/api/auth/reset-pin",
    input,
  );
  return data;
}
