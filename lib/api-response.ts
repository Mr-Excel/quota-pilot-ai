export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: { message: string; code?: string } };

export const createSuccessResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
});

export const createErrorResponse = (message: string, code?: string): ApiResponse => ({
  success: false,
  error: { message, code },
});

