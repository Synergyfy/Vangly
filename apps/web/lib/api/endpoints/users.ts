import { api } from "../client";
import type {
  AdminUser,
  CreateUserInput,
  ListUsersParams,
  UpdateUserInput,
} from "@/types/api/users";

export async function listUsers(
  params: ListUsersParams = {},
): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[]>("/api/users", { params });
  return data;
}

export async function getUser(id: string): Promise<AdminUser> {
  const { data } = await api.get<AdminUser>(`/api/users/${id}`);
  return data;
}

export async function createUser(input: CreateUserInput): Promise<AdminUser> {
  const { data } = await api.post<AdminUser>("/api/users", input);
  return data;
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<AdminUser> {
  const { data } = await api.patch<AdminUser>(`/api/users/${id}`, input);
  return data;
}

export async function deleteUser(id: string): Promise<{ ok: true }> {
  const { data } = await api.delete<{ ok: true }>(`/api/users/${id}`);
  return data;
}
