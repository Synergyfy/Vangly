"use client";

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";

export type FieldErrors = Record<string, string | undefined>;

export interface UseFieldErrorsResult {
  errors: FieldErrors;
  setError: (field: string, message: string) => void;
  setErrors: (next: FieldErrors) => void;
  clearError: (field: string) => void;
  clearAll: () => void;
  bindField: <T>(
    field: string,
    setValue: Dispatch<SetStateAction<T>>,
  ) => (value: T) => void;
}

export function useFieldErrors(): UseFieldErrorsResult {
  const [errors, setErrors] = useState<FieldErrors>({});

  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      if (prev[field] === undefined) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setErrors({});
  }, []);

  const bindField = useCallback(
    <T,>(field: string, setValue: Dispatch<SetStateAction<T>>) =>
      (value: T) => {
        setValue(value);
        setErrors((prev) => {
          if (prev[field] === undefined) return prev;
          const next = { ...prev };
          delete next[field];
          return next;
        });
      },
    [],
  );

  return { errors, setError, setErrors, clearError, clearAll, bindField };
}
