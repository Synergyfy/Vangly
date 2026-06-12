import { mutationOptions } from "@tanstack/react-query";
import {
  bulkCreateContacts,
  createContact,
  deleteContact,
  updateContact,
} from "../endpoints/contacts";
import type {
  BulkCreateContactInput,
  CreateContactInput,
  UpdateContactInput,
} from "@/types/api/contacts";

export const contactMutations = {
  create: () =>
    mutationOptions({
      mutationFn: (input: CreateContactInput) => createContact(input),
    }),
  update: () =>
    mutationOptions({
      mutationFn: (vars: { id: string; input: UpdateContactInput }) =>
        updateContact(vars.id, vars.input),
    }),
  delete: () =>
    mutationOptions({
      mutationFn: (id: string) => deleteContact(id),
    }),
  bulkCreate: () =>
    mutationOptions({
      mutationFn: (input: BulkCreateContactInput) => bulkCreateContacts(input),
    }),
};
