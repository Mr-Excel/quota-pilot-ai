export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const createErrorResponse = (error: unknown) => {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
      },
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        message: error.message,
      },
    };
  }

  return {
    success: false,
    error: {
      message: "An unexpected error occurred",
    },
  };
};

