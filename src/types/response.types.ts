export interface HttpResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

export interface OffsetPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CursorPaginationMeta {
  hasMore: boolean;
  nextCursor: string | Date | null;
  prevCursor?: string | Date | null;
}

export interface SocketResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  statusCode: number;
}
