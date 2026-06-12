import { mutationOptions } from "@tanstack/react-query";
import {
  createUser,
  deleteUser,
  updateUser,
} from "../endpoints/users";
import type { CreateUserInput, UpdateUserInput } from "@/types/api/users";

export const userMutations = {
  create: () =>
    mutationOptions({
      mutationFn: (input: CreateUserInput) => createUser(input),
    }),
  update: () =>
    mutationOptions({
      mutationFn: (vars: { id: string; input: UpdateUserInput }) =>
        updateUser(vars.id, vars.input),
    }),
  delete: () =>
    mutationOptions({
      mutationFn: (id: string) => deleteUser(id),
    }),
};
