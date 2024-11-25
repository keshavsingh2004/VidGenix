export interface ClarifaiResponse {
  outputs: Array<{
    data: {
      image?: {
        base64: string;
      };
      audio?: {
        base64: string;
      };
      text?: {
        raw: string;
      };
    };
  }>;
  status: {
    code: number;
    description: string;
  };
}

export interface ImageGenerationContext {
  imagesDir: string;
  sanitizedTitle: string;
  timestamp: string;
}

export interface AudioGenerationContext {
  audioDir: string;
  sanitizedTitle: string;
  timestamp: string;
}