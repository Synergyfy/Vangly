export const messageKeys = {
  all: ["messages"] as const,
  templates: {
    all: () => [...messageKeys.all, "templates"] as const,
    list: () => [...messageKeys.templates.all(), "list"] as const,
    details: () => [...messageKeys.templates.all(), "detail"] as const,
    detail: (id: string) => [...messageKeys.templates.details(), id] as const,
  },
};
