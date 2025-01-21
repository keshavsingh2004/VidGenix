import { NextResponse } from 'next/server';
import { writeFile, readFile, stat } from 'fs/promises';
import { UTFile } from 'uploadthing/server';
import path from 'path';
import { LRUCache } from 'lru-cache';
import { ensureDir, createProjectDirectories } from '@/utils/file';
import { generateImage, generateAudio, generateScript, generateCaptions } from '@/utils/generation';
import { createVideoSlideshow, getAudioDuration } from '@/utils/media';
import { GenerationResult } from '@/types/types';
import { utapi } from '@/utils/uploadthing';
import { UploadFileResponse, UploadData, UploadThingResponse } from '@/types/uploadthing';

const responseCache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 60,
});

// Add type guard
function isSuccessfulUpload(response: UploadFileResponse): response is { data: UploadData; error: null } {
  return response.data !== null;
}

// Add utility function for typed file upload
async function uploadVideoFile(videoPath: string): Promise<{ data: UploadData; error: null }> {
  try {
    // Verify file exists and is readable
    const stats = await stat(videoPath);
    console.log('Video file stats:', {
      size: stats.size,
      path: videoPath,
      exists: true
    });

    if (stats.size === 0) {
      throw new Error('Video file is empty');
    }

    // Read file buffer
    const buffer = await readFile(videoPath);
    console.log('Read buffer size:', buffer.length);

    // Create UTFile instance
    const file = new UTFile([buffer], "final_video.mp4", {
      type: 'video/mp4',
      lastModified: stats.mtimeMs
    });

    console.log('Starting upload with file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Attempt upload with error capture
    const uploadResults = await utapi.uploadFiles([file]).catch(error => {
      console.error('Upload error details:', error);
      throw error;
    });

    console.log('Upload results:', uploadResults);

    const uploadResult = uploadResults[0] as UploadThingResponse<typeof uploadResults[0]>;
    if (!isSuccessfulUpload(uploadResult)) {
      console.error('Upload failed:', uploadResult.error);
      throw new Error(`Failed to upload video: ${uploadResult.error?.message || 'Unknown error'}`);
    }

    return uploadResult;
  } catch (error) {
    console.error('Error in uploadVideoFile:', error);
    throw error;
  }
}

// Add new utility functions for uploads
async function uploadFile(filePath: string, fileName: string): Promise<string> {
  const buffer = await readFile(filePath);
  const file = new UTFile([buffer], fileName, {
    type: path.extname(fileName) === '.mp3' ? 'audio/mp3' : 'image/png',
    lastModified: Date.now()
  });

  const uploadResults = await utapi.uploadFiles([file]);
  const uploadResult = uploadResults[0] as UploadThingResponse<typeof uploadResults[0]>;

  if (!isSuccessfulUpload(uploadResult)) {
    throw new Error(`Failed to upload file: ${uploadResult.error?.message || 'Unknown error'}`);
  }

  return uploadResult.data.url;
}

async function uploadAllAssets(
  generatedImages: GenerationResult[],
  combinedAudioPath: string
): Promise<{ imageUrls: string[], audioUrl: string }> {
  // Upload all images
  const imageUrls = await Promise.all(
    generatedImages.map((image, index) =>
      uploadFile(image.fullPath, `image-${index}.png`)
    )
  );

  // Upload only combined audio
  const audioUrl = await uploadFile(combinedAudioPath, 'combined_audio.mp3');

  return { imageUrls, audioUrl };
}

export async function POST(req: Request) {
  try {
    const { title } = await req.json();

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

    // Parse script with improved regex
    const scenes = Array.from(script.matchAll(/\[(.*?)\]/g)).map(match => match[1].trim());
    const narrations = Array.from(script.matchAll(/Narrator:\s*"([^"]+)"/g)).map(match => match[1].trim());

    if (scenes.length === 0 || narrations.length === 0) {
      console.error('Parsing failed. Script content:', script);
      throw new Error('Failed to parse script - invalid format or missing content');
    }

    // Ensure we have matching scenes and narrations
    while (narrations.length < scenes.length) {
      narrations.push('No narration provided');
    }

    // Combine all narrations into a single string with proper spacing
    const fullNarration = narrations.join('. ');

    const context = {
      projectDir,
      imagesDir,
      audioDir,
      sanitizedTitle,
      timestamp
    };
    const metadata = {}; // Add any metadata you need to pass

    // Generate assets
    const [generatedImages, generatedAudio] = await Promise.all([
      Promise.all(scenes.map(scene => generateImage(
        scene,
        metadata,
        context
      ))),
      generateAudio(fullNarration, metadata, context)
    ]);

    // Generate transcripts/captions
    const captions = await generateCaptions(
      generatedAudio.fullPath,
      metadata,
      context
    );

    const audioLength = await getAudioDuration(generatedAudio.fullPath);
    const videoOutputPath = path.join(videoDir, 'final_video.mp4');

    await createVideoSlideshow(
      generatedImages.map(result => result.fullPath),
      generatedAudio.fullPath,
      videoOutputPath,
      audioLength
    );

    // Upload all assets first
    const { imageUrls, audioUrl } = await uploadAllAssets(generatedImages, generatedAudio.fullPath);

    // Upload final video
    const uploadResult = await uploadVideoFile(videoOutputPath);

    // Generate metadata.json with correct URLs
    const sceneDuration = audioLength / scenes.length;
    const metadataContent = {
      audioUrl,
      images: imageUrls.map((url, index) => ({
        url,
        startTime: index * sceneDuration,
        duration: sceneDuration
      })),
      words: captions.metadata.words || []
    };

    // Save metadata.json
    const metadataPath = path.join(projectDir, 'metadata.json');
    await writeFile(metadataPath, JSON.stringify(metadataContent, null, 2));

    const response = {
      success: true,
      data: {
        projectDir: `/generated/${sanitizedTitle}_${timestamp}`,
        script,
        scenes: generatedImages.map((image, index) => ({
          ...image,
          url: imageUrls[index],
          narration: narrations[index],
          startTime: index * sceneDuration,
          duration: sceneDuration
        })),
        audio: {
          url: audioUrl,
          duration: audioLength
        },
        captions: {
          path: captions.path,
          text: captions.text
        },
        video: uploadResult.data.url,
        metadata: {
          ...metadataContent,
          timestamp: new Date().toISOString(),
          totalDuration: audioLength,
          durationPerScene: sceneDuration,
          videoKey: uploadResult.data.key
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