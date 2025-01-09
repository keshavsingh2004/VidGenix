// Type for JSON values that can be stored in error data
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type UploadData = {
  key: string;
  url: string;
  name: string;
  size: number;
};

type ErrorData = {
  message?: string;
  code?: string;
  details?: { [key: string]: JsonValue }; // Change Record<string, unknown> to use JsonValue
  [key: string]: JsonValue | undefined; // Allow any JSON-compatible value
};

export type UploadError = {
  code: string;
  message: string;
  data?: ErrorData;
};

export type UploadFileResponse = {
  data: UploadData;
  error: null;
} | {
  data: null;
  error: UploadError;
};

// Make the utility type more specific
export type UploadThingResponse<T> = T extends {
  data: { key: string; url: string; name: string; size: number } | null;
  error: { code: string; message: string; data?: JsonValue } | null;
}
  ? UploadFileResponse
  : never;
