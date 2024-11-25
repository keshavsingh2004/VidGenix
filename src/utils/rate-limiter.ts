import { RateLimiter } from 'limiter';

// Reduced global rate limit
const globalLimiter = new RateLimiter({
  tokensPerInterval: 10,  // reduced from 15
  interval: 'second'
});

// Adjusted model-specific rate limits
const modelLimiters = new Map<string, RateLimiter>([
  ['dall-e-3', new RateLimiter({ tokensPerInterval: 3, interval: 'second' })],
  ['gpt-4o', new RateLimiter({ tokensPerInterval: 5, interval: 'second' })],
  ['speech-synthesis', new RateLimiter({ tokensPerInterval: 4, interval: 'second' })]
]);

export async function waitForToken(modelId?: string): Promise<void> {
  // First wait for global limiter
  await globalLimiter.removeTokens(1);

  // Then wait for model-specific limiter if specified
  if (modelId && modelLimiters.has(modelId)) {
    await modelLimiters.get(modelId)!.removeTokens(1);
  }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 5,  // increased from 3
  initialDelay = 2000  // increased from 1000
): Promise<T> {
  let lastError;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if we should retry based on error type
      const shouldRetry = error instanceof Error && (
        error.message.includes('rate limit') ||
        error.message.includes('Account limits') ||
        error.message.includes('Model is deploying')
      );

      if (!shouldRetry || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff with jitter
      const jitter = Math.random() * 1000;
      await wait(delay + jitter);
      delay *= 2;
    }
  }
  throw lastError;
}