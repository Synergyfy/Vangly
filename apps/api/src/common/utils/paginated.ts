export interface Pagination {
  page: number;
  perPage: number;
  offset: number;
  limit: number;
}

export interface PaginatedMeta {
  page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export function paginationFromQuery(
  rawPage: number | undefined,
  rawPerPage: number | undefined,
  defaults: { page?: number; perPage?: number; maxPerPage?: number } = {},
): Pagination {
  const page = Math.max(1, rawPage ?? defaults.page ?? 1);
  const maxPerPage = defaults.maxPerPage ?? 100;
  const perPage = Math.min(
    maxPerPage,
    Math.max(1, rawPerPage ?? defaults.perPage ?? 20),
  );
  return {
    page,
    perPage,
    offset: (page - 1) * perPage,
    limit: perPage,
  };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  perPage: number,
): PaginatedResponse<T> {
  return {
    data,
    meta: {
      page,
      per_page: perPage,
      total,
    },
  };
}
