import { mutationOptions } from "@tanstack/react-query";
import {
  createDomain,
  deleteDomain,
  updateDomain,
  verifyDomain,
} from "../endpoints/domains";
import type {
  CreateCustomDomainInput,
  UpdateCustomDomainInput,
} from "@/types/api/domains";

export const domainMutations = {
  create: () =>
    mutationOptions({
      mutationFn: (input: CreateCustomDomainInput) => createDomain(input),
    }),
  verify: () =>
    mutationOptions({
      mutationFn: (id: string) => verifyDomain(id),
    }),
  update: () =>
    mutationOptions({
      mutationFn: (vars: { id: string; input: UpdateCustomDomainInput }) =>
        updateDomain(vars.id, vars.input),
    }),
  delete: () =>
    mutationOptions({
      mutationFn: (id: string) => deleteDomain(id),
    }),
};
