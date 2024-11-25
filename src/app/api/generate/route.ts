import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { exec } from 'child_process';
import path from 'path';
const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");

// Add these interfaces at the top of the file after imports
interface ClarifaiResponse {
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

// Initialize Clarifai stub only
const stub = ClarifaiStub.grpc();

// Helper function to create directory if it doesn't exist
async function ensureDir(dirPath: string) {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    if ((error as any).code !== 'EEXIST') {
      throw error;
    }
  }
}

// Helper function to save base64 content to file
async function saveBase64File(base64Content: string, filePath: string) {
  const buffer = Buffer.from(base64Content, 'base64');
  await writeFile(filePath, buffer);
  return filePath;
}

// Add retry helper function
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Modified postModelOutputs function with retry logic
const postModelOutputs = async (userId: string, appId: string, modelId: string, modelVersionId: string, rawText: string, metadata: any, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting model prediction for ${modelId} (Attempt ${attempt}/${maxRetries})`);
      return await new Promise((resolve, reject) => {
        stub.PostModelOutputs(
          {
            user_app_id: {
              user_id: userId,
              app_id: appId
            },
            model_id: modelId,
            version_id: modelVersionId,
            inputs: [
              {
                data: {
                  text: {
                    raw: rawText
                  }
                }
              }
            ]
          },
          metadata,
          async (err: any, response: any) => {
            if (err) {
              console.error(`Model ${modelId} error:`, err);
              reject(err);
              return;
            }

            // Check for specific deployment status
            if (response.status.code !== 10000) {
              console.error(`Model ${modelId} prediction failed with status code ${response.status.code}: ${response.status.description}`);
              const error = new Error(`Model ${modelId} prediction failed: ${response.status.description}`);
              if (response.status.description.includes('Model is deploying')) {
                if (attempt < maxRetries) {
                  console.log(`Model ${modelId} is deploying, retrying in 10s... (Attempt ${attempt}/${maxRetries})`);
                  await wait(10000); // Wait 10 seconds before retry
                  reject(error);
                  return;
                }
              }
              reject(error);
              return;
            }
            console.log(`Model ${modelId} prediction successful`);
            resolve(response);
          }
        );
      });
    } catch (error) {
      console.error(`Attempt ${attempt} failed for model ${modelId}:`, error);
      if (attempt === maxRetries) throw error;
      // Only continue retrying if it's a deployment error
      if (!(error instanceof Error) || !error.message.includes('Model is deploying')) {
        throw error;
      }
    }
  }
};

// Helper function to combine audio files
async function combineAudioFiles(audioFiles: string[], outputPath: string) {
  try {
    // Create a file list for concatenation
    const listPath = path.join(path.dirname(outputPath), 'audiolist.txt');
    const fileList = audioFiles.map(file => `file '${file}'`).join('\n');
    await writeFile(listPath, fileList);

    // Concatenate the MP3 files using 128k bitrate
    await new Promise((resolve, reject) => {
      exec(`ffmpeg -f concat -safe 0 -i "${listPath}" -c:a libmp3lame -ar 44100 -ab 128k "${outputPath}"`, (error) => {
        if (error) reject(error);
        else resolve(true);
      });
    });

    // Clean up the temporary list file
    await writeFile(listPath, '');

  } catch (error) {
    console.error('Error combining audio files:', error);
    throw error;
  }
}

// Helper function to create video slideshow
async function createVideoSlideshow(
  imageFiles: string[],
  audioFile: string,
  outputPath: string,
  totalDuration: number
) {
  try {
    // Calculate exact duration for each image
    const durationPerImage = totalDuration / imageFiles.length;

    // Create a temporary file listing all images and their durations
    const listPath = path.join(path.dirname(outputPath), 'imagelist.txt');
    const fileList = imageFiles.map(file =>
      `file '${file}'\nduration ${durationPerImage.toFixed(3)}`
    ).join('\n');
    // Add the last image one more time (required by FFmpeg)
    const completeList = fileList + `\nfile '${imageFiles[imageFiles.length - 1]}'`;
    await writeFile(listPath, completeList);

    // Create video from images and combine with audio, forcing output duration to match audio
    await new Promise((resolve, reject) => {
      const command = `ffmpeg -y -f concat -safe 0 -i "${listPath}" -i "${audioFile}" -c:v libx264 -preset medium -tune stillimage -crf 23 -c:a aac -b:a 128k -pix_fmt yuv420p -r 30 -shortest "${outputPath}"`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('FFmpeg stderr:', stderr);
          reject(error);
        } else {
          resolve(true);
        }
      });
    });

    // Clean up temporary files
    await writeFile(listPath, '');

  } catch (error) {
    console.error('Error creating video slideshow:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    console.log('Starting video generation process...');
    const { title, PAT } = await req.json();
    console.log(`Processing request for title: "${title}"`);

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!PAT) {
      return NextResponse.json({ error: 'Clarifai PAT is required' }, { status: 400 });
    }

    // Initialize metadata with PAT from request
    const metadata = new grpc.Metadata();
    metadata.set("authorization", "Key " + PAT);

    // Create timestamp for unique folder names
    console.log('Creating project directories...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const projectDir = path.join(process.cwd(), 'public', 'generated', sanitizedTitle + '_' + timestamp);

    // Create directories
    const imagesDir = path.join(projectDir, 'images');
    const audioDir = path.join(projectDir, 'audio');
    const videoDir = path.join(projectDir, 'video');
    await ensureDir(imagesDir);
    await ensureDir(audioDir);
    await ensureDir(videoDir);

    // 1. Generate script using GPT-4
    console.log('Generating script using GPT-4...');
    let scriptResponse: any;
    try {
      scriptResponse = await postModelOutputs(
        'openai',
        'chat-completion',
        'gpt-4o',
        '1cd39c6a109f4f0e94f1ac3fe233c207',
        `Create a short video script about "${title}" with clear scene descriptions in [brackets] and narration. Format:
            [Scene description]
            Narrator: "Narration text"
            Keep it concise with 3-4 scenes.`,
        metadata
      );
    } catch (error) {
      console.error('Error generating script:', error);
      throw new Error(`Failed to generate script: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const script = scriptResponse.outputs[0].data.text.raw;
    console.log('Script generated:', script);

    // Save script
    await writeFile(path.join(projectDir, 'script.txt'), script);

    // Parse script to get scenes and narrations
    const scenes = script.match(/\[(.*?)\]/g)?.map((scene: string) => scene.slice(1, -1)) || [];
    const narrations = script.match(/Narrator: "(.*?)"/g)?.map((narration: string) =>
      narration.replace('Narrator: "', '').replace('"', '')
    ) || [];

    // 2. Generate and save images
    console.log('Generating images for each scene...');
    const imagePromises = scenes.map(async (scene: string, index: number) => {
      console.log(`Generating image ${index + 1}/${scenes.length} for scene: "${scene}"`);
      let lastError;
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          console.log(`Attempt ${attempt}/5 for scene ${index + 1}`);
          const response = await new Promise<ClarifaiResponse>((resolve, reject) => {
            stub.PostModelOutputs(
              {
                user_app_id: {
                  "user_id": "openai",
                  "app_id": "dall-e"
                },
                model_id: "dall-e-3",
                version_id: "dc9dcb6ee67543cebc0b9a025861b868",
                inputs: [
                  {
                    data: {
                      text: {
                        raw: scene
                      }
                    }
                  }
                ]
              },
              metadata,
              (err: any, response: ClarifaiResponse) => {
                if (err) {
                  console.error('Image generation error:', err);
                  reject(err);
                  return;
                }

                if (response.status.code !== 10000) {
                  const statusMessage = `Post model failed: ${response.status.description}`;
                  console.error('Image generation status:', statusMessage);
                  reject(new Error(statusMessage));
                  return;
                }

                if (!response.outputs?.[0]?.data?.image?.base64) {
                  reject(new Error('No image data in response'));
                  return;
                }

                resolve(response);
              }
            );
          });

          const base64Image = response.outputs[0].data.image?.base64;
          const imagePath = path.join(imagesDir, `scene_${index + 1}.jpg`);
          await saveBase64File(base64Image!, imagePath);
          return {
            scene,
            path: `/generated/${sanitizedTitle}_${timestamp}/images/scene_${index + 1}.jpg`
          };
        } catch (error) {
          lastError = error;
          console.error(`Attempt ${attempt} failed for scene ${index + 1}:`, error);
          if (attempt < 5) {
            const delay = attempt * 2000;
            console.log(`Waiting ${delay}ms before retry...`);
            await wait(delay);
            continue;
          }
        }
      }
      throw lastError || new Error(`Failed to generate image for scene ${index + 1}`);
    });

    // 3. Generate and save audio
    console.log('Generating audio for each narration...');
    const audioPromises = narrations.map(async (narration: string, index: number) => {
      console.log(`Generating audio ${index + 1}/${narrations.length} for narration: "${narration}"`);
      const response = await postModelOutputs(
        'eleven-labs',
        'audio-generation',
        'speech-synthesis',
        'f2cead3a965f4c419a61a4a9b501095c',
        narration,
        metadata
      );

      const base64Audio = (response as any).outputs[0].data.audio.base64;
      const audioPath = path.join(audioDir, `narration_${index + 1}.mp3`);
      await saveBase64File(base64Audio, audioPath);
      return {
        narration,
        path: `/generated/${sanitizedTitle}_${timestamp}/audio/narration_${index + 1}.mp3`,
        fullPath: audioPath
      };
    });

    console.log('Waiting for all assets to be generated...');
    const [imageResults, audioResults] = await Promise.all([
      Promise.all(imagePromises),
      Promise.all(audioPromises)
    ]);
    console.log('All assets generated successfully');

    // Combine audio files
    console.log('Combining audio files...');
    const combinedAudioPath = path.join(audioDir, 'combined_audio.mp3');
    await combineAudioFiles(
      audioResults.map(result => result.fullPath),
      combinedAudioPath
    );

    // Get audio duration
    console.log('Getting audio duration...');
    const audioLength = await new Promise<number>((resolve, reject) => {
      exec(`ffprobe -i "${combinedAudioPath}" -show_entries format=duration -v quiet -of csv="p=0"`,
        (error, stdout) => {
          if (error) reject(error);
          else resolve(parseFloat(stdout));
        });
    });
    console.log(`Total audio duration: ${audioLength} seconds`);

    // Calculate duration per image
    const durationPerImage = audioLength / imageResults.length;

    // Create video slideshow
    console.log('Creating final video slideshow...');
    const videoOutputPath = path.join(videoDir, 'final_video.mp4');
    await createVideoSlideshow(
      imageResults.map(result => path.join(process.cwd(), 'public', result.path.slice(1))),
      combinedAudioPath,
      videoOutputPath,
      audioLength  // Pass the total audio duration instead of duration per image
    );
    console.log('Video slideshow created successfully');

    // Create manifest file
    console.log('Saving manifest file...');
    const manifest = {
      title,
      timestamp,
      script,
      scenes: imageResults,
      narrations: audioResults.map(({ narration, path }) => ({ narration, path })),
      video: `/generated/${sanitizedTitle}_${timestamp}/video/final_video.mp4`
    };
    await writeFile(
      path.join(projectDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    console.log('Video generation process completed successfully');
    // Return paths and metadata
    return NextResponse.json({
      success: true,
      data: {
        projectDir: `/generated/${sanitizedTitle}_${timestamp}`,
        script,
        scenes: imageResults,
        narrations: [
          ...audioResults.map(({ narration, path }) => ({ narration, path })),
          {
            narration: 'Combined Audio',
            path: `/generated/${sanitizedTitle}_${timestamp}/audio/combined_audio.mp3`
          }
        ],
        video: `/generated/${sanitizedTitle}_${timestamp}/video/final_video.mp4`,
        metadata: {
          timestamp: new Date().toISOString(),
          user: "keshavsingh2004",
          totalDuration: audioLength,
          durationPerScene: durationPerImage
        }
      }
    });

  } catch (error) {
    console.error('Error in video generation process:', error);
    return NextResponse.json({
      error: 'Generation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      step: 'script_generation' // Add context about where the error occurred
    }, { status: 500 });
  }
}