import { API_ERROR_CODE, type ApiErrorCode } from './api-error-codes';

export class ApiError extends Error {
  readonly httpStatus: number;
  readonly code: ApiErrorCode;

  constructor(httpStatus: number, code: ApiErrorCode, message: string) {
    super(message);
    this.httpStatus = httpStatus;
    this.code = code;
  }
}

export function toApiErrorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json({ error: { code: error.code, message: error.message } }, { status: error.httpStatus });
  }

  console.error(error);
  return Response.json(
    { error: { code: API_ERROR_CODE.INTERNAL_ERROR, message: 'Something went wrong.' } },
    { status: 500 },
  );
}
