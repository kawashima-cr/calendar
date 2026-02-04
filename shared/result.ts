export type ErrorCode = "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL";
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode; message: string } };
