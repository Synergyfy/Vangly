import axios, { type AxiosInstance } from "axios";
import type {
  PublicFormEntity,
  PublicScanEntity,
  PublicSubmitInput,
  PublicSubmitResultEntity,
  TrackScanInput,
} from "@/types/api/public-forms";

const PUBLIC_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const publicClient: AxiosInstance = axios.create({
  baseURL: PUBLIC_BASE,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

export async function getPublicForm(publicId: string): Promise<PublicFormEntity> {
  const { data } = await publicClient.get<PublicFormEntity>(`/f/${publicId}`);
  return data;
}

export async function trackPublicScan(
  publicId: string,
  input: TrackScanInput = {},
): Promise<PublicScanEntity> {
  const { data } = await publicClient.post<PublicScanEntity>(
    `/f/${publicId}/track`,
    input,
  );
  return data;
}

export async function submitPublicForm(
  publicId: string,
  input: PublicSubmitInput,
): Promise<PublicSubmitResultEntity> {
  const { data } = await publicClient.post<PublicSubmitResultEntity>(
    `/f/${publicId}`,
    input,
  );
  return data;
}
