export interface GenerationContext {
  imagesDir: string;
  audioDir: string;
  sanitizedTitle: string;
  timestamp: string;
}

export interface GenerationMetadata {
  [key: string]: any;
}

export interface APIError extends Error {
  code?: string;
  statusCode?: number;
  response?: any;
}

export interface GenerationResult {
  scene?: string;
  narration?: string;
  path: string;
  fullPath: string;
}
