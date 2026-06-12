"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "vangly-toast group toast group-[.toaster]:bg-white group-[.toaster]:text-[var(--text-primary)] group-[.toaster]:border-[var(--border-light)] group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-[var(--text-secondary)]",
          actionButton:
            "group-[.toast]:bg-[var(--brand-primary)] group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-[var(--bg-main)] group-[.toast]:text-[var(--text-primary)]",
        },
      }}
      {...props}
    />
  );
}
