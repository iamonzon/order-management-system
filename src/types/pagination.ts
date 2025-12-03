export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export function parsePaginationParams(query: {
  page?: string;
  limit?: string;
}): PaginationParams {
  const page = Math.max(1, parseInt(query.page || String(DEFAULT_PAGE), 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));
  return { page, limit };
}
