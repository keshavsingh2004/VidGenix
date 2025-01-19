export interface GenerationContext {
  projectDir: string;  // Add this line
  imagesDir: string;
  audioDir: string;
  sanitizedTitle: string;
  timestamp: string;
}

export interface Word {
  word: string;
  start: number;
  end: number;
  confidence: number;
  punctuated_word: string;
}

export interface GenerationMetadata {
  audioUrl?: string;
  images?: string[];
  words?: Word[];
  [key: string]: string | number | boolean | null | undefined | Record<string, unknown> | Array<any>;
}

export interface APIError {
  message: string;
  code: string | number;
  details: Record<string, unknown>;
}

export interface GenerationResult {
  fullPath: string;
  path: string;
  metadata: GenerationMetadata; // Change this to use GenerationMetadata type
  text: string; // Add narration text
}
