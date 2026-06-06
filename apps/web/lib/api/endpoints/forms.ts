import { api } from "../client";
import type {
  CloneFormInput,
  CreateFormInput,
  FormEntity,
  FormResponse,
  FormVersion,
  ListFormResponsesParams,
  ListFormsParams,
  PaginatedResponse,
  UpdateFormInput,
} from "@/types/api/teams";

export async function listTeamForms(
  teamId: string,
  params: ListFormsParams = {},
): Promise<PaginatedResponse<FormEntity>> {
  const { data } = await api.get<PaginatedResponse<FormEntity>>(
    `/api/teams/${teamId}/forms`,
    { params },
  );
  return data;
}

export async function getForm(formId: string): Promise<FormEntity> {
  const { data } = await api.get<FormEntity>(`/api/forms/${formId}`);
  return data;
}

export async function createForm(
  teamId: string,
  input: CreateFormInput,
): Promise<FormEntity> {
  const { data } = await api.post<FormEntity>(`/api/teams/${teamId}/forms`, input);
  return data;
}

export async function updateForm(
  formId: string,
  input: UpdateFormInput,
): Promise<FormEntity> {
  const { data } = await api.patch<FormEntity>(`/api/forms/${formId}`, input);
  return data;
}

export async function publishForm(formId: string): Promise<FormEntity> {
  const { data } = await api.post<FormEntity>(`/api/forms/${formId}/publish`);
  return data;
}

export async function archiveForm(formId: string): Promise<FormEntity> {
  const { data } = await api.post<FormEntity>(`/api/forms/${formId}/archive`);
  return data;
}

export async function duplicateForm(formId: string): Promise<FormEntity> {
  const { data } = await api.post<FormEntity>(`/api/forms/${formId}/duplicate`);
  return data;
}

export async function cloneForm(
  formId: string,
  input: CloneFormInput,
): Promise<FormEntity> {
  const { data } = await api.post<FormEntity>(`/api/forms/${formId}/clone`, input);
  return data;
}

export async function listFormVersions(formId: string): Promise<FormVersion[]> {
  const { data } = await api.get<FormVersion[]>(`/api/forms/${formId}/versions`);
  return data;
}

export async function listFormResponses(
  formId: string,
  params: ListFormResponsesParams = {},
): Promise<PaginatedResponse<FormResponse>> {
  const { data } = await api.get<PaginatedResponse<FormResponse>>(
    `/api/forms/${formId}/responses`,
    { params },
  );
  return data;
}

export function exportFormResponsesUrl(formId: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  return `${base}/api/forms/${formId}/responses/export`;
}
