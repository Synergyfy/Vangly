import { mutationOptions } from "@tanstack/react-query";
import {
  forgotPin as forgotPinFn,
  login as loginFn,
  logout as logoutFn,
  resetPin as resetPinFn,
} from "../endpoints/auth";
import type {
  ForgotPinInput,
  ForgotPinResponse,
  LoginInput,
  LogoutInput,
  ResetPinInput,
  ResetPinResponse,
  AuthResponse,
} from "@/types/api/auth";

export const authMutations = {
  login: () =>
    mutationOptions<AuthResponse, Error, LoginInput>({
      mutationFn: (input) => loginFn(input),
    }),
  logout: () =>
    mutationOptions<void, Error, LogoutInput | undefined>({
      mutationFn: (input) => logoutFn(input ?? {}),
    }),
  forgotPin: () =>
    mutationOptions<ForgotPinResponse, Error, ForgotPinInput>({
      mutationFn: (input) => forgotPinFn(input),
    }),
  resetPin: () =>
    mutationOptions<ResetPinResponse, Error, ResetPinInput>({
      mutationFn: (input) => resetPinFn(input),
    }),
};
