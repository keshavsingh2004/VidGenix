export interface GenerationContext {
  imagesDir: string;
  audioDir: string;
  sanitizedTitle: string;
  timestamp: string;
}

export interface GenerationMetadata {
  [key: string]: string | number | boolean | null | undefined | Record<string, unknown>;
}

export interface APIError {
  message: string;
  code: string | number;
  details: Record<string, unknown>;
}

export interface GenerationResult {
  fullPath: string;
  path: string;
  metadata: Record<string, unknown>;
}
