import { exec } from 'child_process';
import { promisify } from 'util';
import ffmpeg from 'fluent-ffmpeg';

const execAsync = promisify(exec);

export async function combineAudioFiles(audioFiles: string[], outputPath: string): Promise<void> {
  const inputFiles = audioFiles.map(file => `-i "${file}"`).join(' ');
  const filterComplex = audioFiles.map((_, i) => `[${i}:0]`).join('') + `concat=n=${audioFiles.length}:v=0:a=1[out]`;

  const command = `ffmpeg ${inputFiles} -filter_complex "${filterComplex}" -map "[out]" "${outputPath}"`;

  try {
    await execAsync(command);
  } catch (error) {
    console.error('Error combining audio files:', error);
    throw error;
  }
}

export async function createVideoSlideshow(
  imagePaths: string[],
  audioPath: string,
  outputPath: string,
  totalDuration: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const imageDuration = totalDuration / imagePaths.length;

    const command = ffmpeg();

    // Add images with duration
    imagePaths.forEach(imagePath => {
      command.input(imagePath).inputOptions([`-loop 1`, `-t ${imageDuration}`]);
    });

    // Add audio
    command.input(audioPath);

    // Configure output
    command
      .complexFilter([
        {
          filter: 'concat',
          options: {
            n: imagePaths.length,
            v: 1,
            a: 0
          },
          outputs: 'v'
        }
      ])
      .outputOptions([
        '-map [v]',
        `-map ${imagePaths.length}:a`,
        '-shortest'
      ])
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', reject)
      .run();
  });
}

export async function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err: Error | null, metadata: { format: { duration?: number } }) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(metadata.format.duration || 0);
    });
  });
}