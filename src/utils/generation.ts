import { GenerationContext, GenerationMetadata, APIError, GenerationResult } from '@/types/types';
import path from 'path';
import Groq from "groq-sdk";
import fs from 'fs';
import https from 'https';
import { Readable } from 'stream';
// Remove these imports
// import { createClient } from "@deepgram/sdk";
// import { AssemblyAI } from 'assemblyai';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function webStreamToNodeStream(webStream: ReadableStream): Promise<Readable> {
  const reader = webStream.getReader();
  return new Readable({
    async read() {
      try {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
        } else {
          this.push(Buffer.from(value));
        }
      } catch (error) {
        this.destroy(error as Error);
      }
    },
    destroy(error, callback) {
      reader.cancel().then(() => callback(error)).catch(callback);
    }
  });
}

// Remove generatePlaceholderImage function and its dependencies

export function createProjectDirectories(title: string, timestamp: string) {
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const projectDir = path.join(process.cwd(), 'public', 'generated', sanitizedTitle + '_' + timestamp);
  const imagesDir = path.join(projectDir, 'images');
  const audioDir = path.join(projectDir, 'audio');
  const videoDir = path.join(projectDir, 'video');

  return {
    projectDir,
    imagesDir,
    audioDir,
    videoDir,
    sanitizedTitle
  };
}

export async function generateImage(
  scene: string,
  metadata: GenerationMetadata,
  context: GenerationContext
): Promise<GenerationResult> {
  console.log(`🎨 Generating image for scene: "${scene}"...`);
  const { imagesDir, sanitizedTitle, timestamp } = context;

  return withRetry(async () => {
    try {
      const response = await fetch(process.env.IMAGE_GENERATION_API_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'image/png, image/jpeg'
        },
        body: JSON.stringify({
          prompt: scene,
          steps: 8,
          width: 1024,
          height: 768,
          format: 'png'
        }),
        signal: AbortSignal.timeout(45000) // Increased timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Image generation API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Image generation failed: ${errorText || response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('image/')) {
        throw new Error(`Unexpected content type: ${contentType}`);
      }

      const imageBuffer = await response.arrayBuffer();
      if (!imageBuffer || imageBuffer.byteLength === 0) {
        throw new Error('No valid image data received');
      }

      const safeSceneName = scene.slice(0, 50).replace(/[^a-z0-9]/gi, '_');
      const imagePath = path.join(imagesDir, `scene_${safeSceneName}.png`);

      await fs.promises.writeFile(imagePath, Buffer.from(imageBuffer));

      console.log(`✅ Generated image for scene: "${scene}"`);
      return {
        scene,
        path: `/generated/${sanitizedTitle}_${timestamp}/images/scene_${safeSceneName}.png`,
        fullPath: imagePath,
        metadata,
        text: scene
      };
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  }, 5, 10000); // Increased retries to 5 and initial delay to 10 seconds
}

export async function generateAudio(
  narration: string,
  metadata: GenerationMetadata,
  context: GenerationContext
): Promise<GenerationResult> {
  console.log(`🎵 Generating audio for narration...`);
  const { audioDir, sanitizedTitle, timestamp } = context;

  return withRetry(async () => {
    return new Promise((resolve, reject) => {
      try {
        const audioPath = path.join(audioDir, `narration.mp3`);

        const options = {
          hostname: 'api.deepgram.com',
          path: '/v1/speak?model=aura-asteria-en',
          method: 'POST',
          headers: {
            'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
            'Content-Type': 'text/plain',
          }
        };

        const req = https.request(options, (res) => {
          if (res.statusCode === 429) {
            reject(new Error('Rate limit exceeded'));
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`Deepgram API error: ${res.statusCode} ${res.statusMessage}`));
            return;
          }
          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', async () => {
            try {
              const audioBuffer = Buffer.concat(chunks);
              await fs.promises.writeFile(audioPath, audioBuffer);
              console.log(`✅ Generated audio file`);
              resolve({
                text: narration,
                path: `/generated/${sanitizedTitle}_${timestamp}/audio/narration.mp3`,
                fullPath: audioPath,
                metadata
              });
            } catch (error) {
              reject(error);
            }
          });
        });

        req.on('error', reject);
        req.write(narration);
        req.end();

      } catch (error) {
        reject(error);
      }
    });
  }, 5, 2000);
}

export async function generateScript(title: string) {
  console.log(`🤖 Generating script for topic: "${title}"...`);
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a family-friendly educational content creator. Generate only safe, appropriate content suitable for all ages."
        },
        {
          role: "user",
          content: `Create an educational video script about "${title}" with exactly 4 scenes. Use this exact format:

Scene description should be enclosed in square brackets, followed by "Narrator:" on the next line.

For example:
[A colorful animated scene showing the basics of photosynthesis]
Narrator: "Plants are nature's incredible food factories..."

[Close-up of leaves absorbing sunlight]
Narrator: "When sunlight hits the leaves..."

Requirements:
- Create exactly 4 scenes
- Each scene must start with square brackets []
- Each narration must start with "Narrator:" followed by the text in quotes
- Keep content educational and family-friendly
- Make scene descriptions clear and detailed
- Include engaging narration for each scene`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      top_p: 0.8,
    });

    const scriptText = completion.choices[0]?.message?.content;

    if (!scriptText) {
      throw new Error('No script text in response');
    }

    console.log('📝 Generated Script:', scriptText);
    return scriptText;
  } catch (error) {
    console.error('❌ Script generation error:', error);
    throw error;
  }
}

interface Word {
  text: string;
  start: number;
  end: number;
}

interface AssemblyAIUploadResponse {
  id: string;
  status: string;
  audio_url: string;
}

// Type guard for AssemblyAI upload response
function isUploadResponse(response: string | AssemblyAIUploadResponse): response is AssemblyAIUploadResponse {
  return typeof response === 'object' && 'audio_url' in response;
}

export async function generateCaptions(
  audioPath: string,
  metadata: GenerationMetadata,
  context: GenerationContext
): Promise<GenerationResult> {
  console.log('=== Starting Caption Generation ===');
  console.log(`📝 Input audio path: "${audioPath}"`);

  const { projectDir, sanitizedTitle, timestamp } = context;

  return withRetry(async () => {
    try {
      const apiKey = process.env.DEEPGRAM_API_KEY;
      if (!apiKey) {
        throw new Error('DEEPGRAM_API_KEY is not defined');
      }

      const audioData = await fs.promises.readFile(audioPath);

      const url = new URL('https://api.deepgram.com/v1/listen');
      url.searchParams.append('model', 'nova-2');
      url.searchParams.append('smart_format', 'true');
      url.searchParams.append('punctuate', 'true');
      url.searchParams.append('diarize', 'false');
      url.searchParams.append('utterances', 'true');
      url.searchParams.append('language', 'en');

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'audio/mp3',
        },
        body: audioData
      });

      if (!response.ok) {
        throw new Error(`Deepgram API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.results?.channels?.[0]?.alternatives?.[0]?.words) {
        throw new Error('No words found in transcription result');
      }

      // Extract only the words array
      const words = result.results.channels[0].alternatives[0].words;
      const transcript = result.results.channels[0].alternatives[0].transcript;

      // Save only the words array
      const transcriptionPath = path.join(projectDir, 'transcription.json');
      await fs.promises.writeFile(
        transcriptionPath,
        JSON.stringify({ words }, null, 2)
      );

      console.log('💾 Words data saved to:', transcriptionPath);
      console.log('=== Caption Generation Complete ===');

      return {
        text: transcript || '',
        path: `/generated/${sanitizedTitle}_${timestamp}/transcription.json`,
        fullPath: transcriptionPath,
        metadata: {
          ...metadata,
          words
        }
      };
    } catch (error) {
      console.error('❌ Caption generation error:', error);
      throw error;
    }
  }, 3, 5000);
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  initialDelay: number
): Promise<T> {
  let lastError: Error;
  let delay = initialDelay;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${i + 1} failed: ${lastError.message}`);

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  throw lastError!;
}
