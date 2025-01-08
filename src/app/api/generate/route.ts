import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { LRUCache } from 'lru-cache';
import { ensureDir, createProjectDirectories } from '@/utils/file';
import { generateImage, generateAudio, generateScript } from '@/utils/generation';
import { combineAudioFiles, createVideoSlideshow, getAudioDuration } from '@/utils/media';
import { GenerationResult } from '@/types/types';

const responseCache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 60,
});

export async function POST(req: Request) {
  try {
    const { title } = await req.json();

    // Check available memory before starting
    const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
    if (usedMemory > 200) { // 200MB threshold
      return NextResponse.json({
        error: 'Server is currently busy. Please try again later.',
        details: 'Memory usage too high'
      }, { status: 503 });
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const cacheKey = title;
    const cached = responseCache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    // Setup project structure
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const { projectDir, imagesDir, audioDir, videoDir, sanitizedTitle } = createProjectDirectories(title, timestamp);
    await Promise.all([ensureDir(imagesDir), ensureDir(audioDir), ensureDir(videoDir)]);

    // Generate script
    const script = await generateScript(title);
    await writeFile(path.join(projectDir, 'script.txt'), script);

    // Parse script
    const scenes = script.match(/\[(.*?)\]/g)?.map(scene => scene.slice(1, -1)) || [];
    const narrations = script.match(/Narrator: "(.*?)"/g)?.map(narration =>
      narration.replace('Narrator: "', '').replace('"', '')
    ) || [];

    const context = { imagesDir, audioDir, sanitizedTitle, timestamp };
    const metadata = {}; // Add any metadata you need to pass

    // Process images in smaller chunks if there are many
    const CHUNK_SIZE = 3;
    const processImagesInChunks = async (scenes: string[]) => {
      const results = [];
      for (let i = 0; i < scenes.length; i += CHUNK_SIZE) {
        const chunk = scenes.slice(i, i + CHUNK_SIZE);
        const chunkResults = await Promise.all(
          chunk.map(scene => generateImage(scene, metadata, context))
        );
        results.push(...chunkResults);
        // Add delay between chunks to allow memory cleanup
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      return results;
    };

    // Generate assets with chunked processing
    const [generatedImages, generatedAudio] = await Promise.all([
      processImagesInChunks(scenes),
      Promise.all(narrations.map(narration => generateAudio(narration, metadata, context)))
    ]);

    // Process audio and create video
    const combinedAudioPath = path.join(audioDir, 'combined_audio.mp3');
    await combineAudioFiles(
      generatedAudio.filter((result): result is GenerationResult => result !== null)
        .map(result => result.fullPath),
      combinedAudioPath
    );

    const audioLength = await getAudioDuration(combinedAudioPath);
    const videoOutputPath = path.join(videoDir, 'final_video.mp4');

    await createVideoSlideshow(
      generatedImages.map(result => result.fullPath),
      combinedAudioPath,
      videoOutputPath,
      audioLength
    );

    const response = {
      success: true,
      data: {
        projectDir: `/generated/${sanitizedTitle}_${timestamp}`,
        script,
        scenes: generatedImages,
        narrations: [
          ...generatedAudio,
          { narration: 'Combined Audio', path: `/generated/${sanitizedTitle}_${timestamp}/audio/combined_audio.mp3` }
        ],
        video: `/generated/${sanitizedTitle}_${timestamp}/video/final_video.mp4`,
        metadata: {
          timestamp: new Date().toISOString(),
          totalDuration: audioLength,
          durationPerScene: audioLength / generatedImages.length
        }
      }
    };

    responseCache.set(cacheKey, response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in video generation process:', error);
    if (error instanceof Error && error.message.includes('SIGKILL')) {
      return NextResponse.json({
        error: 'Video generation failed due to resource constraints',
        details: 'Please try with shorter content or reduced quality'
      }, { status: 503 });
    }
    return NextResponse.json({
      error: 'Generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}