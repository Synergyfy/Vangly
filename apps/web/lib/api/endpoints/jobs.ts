import { api } from "../client";
import type { JobView } from "@/types/api/teams";

export async function getJob(jobId: string): Promise<JobView> {
  const { data } = await api.get<JobView>(`/api/jobs/${jobId}`);
  return data;
}
