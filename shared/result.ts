export type ErrorCode = "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL";
export type OkResult<T> = { ok: true; data: T };
export type ErrResult = { ok: false; error: { code: ErrorCode; message: string } };
export type Result<T> = OkResult<T> | ErrResult;
