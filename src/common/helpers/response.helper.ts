import { HttpStatus } from "@nestjs/common";
import { CursorPaginationMeta, HttpResponse, OffsetPaginationMeta } from "src/types/response.types";

export class ResponseHelper {
  /**
   * Success response
   */
  static success<T>(
    data: T,
    message: string = "Success",
    statusCode: number = HttpStatus.OK,
  ): HttpResponse<T> {
    return {
      success: true,
      data,
      message,
      statusCode,
    };
  }

  /**
   * Created response (201)
   */
  static created<T>(data: T, message: string = "Resource created successfully"): HttpResponse<T> {
    return {
      success: true,
      data,
      message,
      statusCode: HttpStatus.CREATED,
    };
  }

  /**
   * No content response
   */
  static noContent(message: string = "Operation completed successfully"): HttpResponse<null> {
    return {
      success: true,
      data: null,
      message,
      statusCode: HttpStatus.OK,
    };
  }

  /**
   * Offset-based paginated response (for user lists, matches, etc.)
   */
  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
    message: string = "Data retrieved successfully",
  ): HttpResponse<{
    items: T[];
    pagination: OffsetPaginationMeta;
  }> {
    return {
      success: true,
      data: {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      message,
      statusCode: HttpStatus.OK,
    };
  }

  /**
   * Cursor-based paginated response (for messages, infinite scroll)
   */
  static cursorPaginated<T>(
    items: T[],
    hasMore: boolean,
    nextCursor: string | null,
    prevCursor: string | null = null,
    message: string = "Data retrieved successfully",
  ): HttpResponse<{
    items: T[];
    pagination: CursorPaginationMeta;
  }> {
    return {
      success: true,
      data: {
        items,
        pagination: {
          hasMore,
          nextCursor,
          ...(prevCursor && { prevCursor }),
        },
      },
      message,
      statusCode: HttpStatus.OK,
    };
  }
}
