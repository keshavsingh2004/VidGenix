import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { grpc } from "clarifai-nodejs-grpc";
import { LRUCache } from 'lru-cache';
import { ensureDir, createProjectDirectories } from '@/utils/file';
import { generateImage, generateAudio, generateScript } from '@/utils/genration';
import { combineAudioFiles, createVideoSlideshow, getAudioDuration } from '@/utils/media';

const responseCache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 60,
});

export async function POST(req: Request) {
  try {
    const { title, PAT } = await req.json();

    if (!title || !PAT) {
      return NextResponse.json(
        { error: !title ? 'Title is required' : 'Clarifai PAT is required' },
        { status: 400 }
      );
    }

    const cacheKey = `${title}-${PAT}`;
    const cached = responseCache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const metadata = new grpc.Metadata();
    metadata.set("authorization", "Key " + PAT);

    // Setup project structure
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const { projectDir, imagesDir, audioDir, videoDir, sanitizedTitle } = createProjectDirectories(title, timestamp);
    await Promise.all([ensureDir(imagesDir), ensureDir(audioDir), ensureDir(videoDir)]);

    // Generate script
    const script = await generateScript(title, metadata);
    await writeFile(path.join(projectDir, 'script.txt'), script);

    // Parse script
    const scenes = script.match(/\[(.*?)\]/g)?.map(scene => scene.slice(1, -1)) || [];
    const narrations = script.match(/Narrator: "(.*?)"/g)?.map(narration =>
      narration.replace('Narrator: "', '').replace('"', '')
    ) || [];

    // Generate assets
    const [generatedImages, generatedAudio] = await Promise.all([
      Promise.all(scenes.map(scene => generateImage(scene, metadata, { imagesDir, sanitizedTitle, timestamp }))),
      Promise.all(narrations.map(narration => generateAudio(narration, metadata, { audioDir, sanitizedTitle, timestamp })))
    ]);

    // Process audio and create video
    const combinedAudioPath = path.join(audioDir, 'combined_audio.mp3');
    await combineAudioFiles(generatedAudio.map(result => result.fullPath), combinedAudioPath);

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
    return NextResponse.json({
      error: 'Generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}