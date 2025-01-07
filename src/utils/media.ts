import { exec } from 'child_process';
import { promisify } from 'util';
import ffmpeg from 'fluent-ffmpeg';
import { which } from 'shelljs';

const execAsync = promisify(exec);

// Get ffmpeg path
const FFMPEG_PATH = which('ffmpeg')?.toString() || '/usr/bin/ffmpeg';
ffmpeg.setFfmpegPath(FFMPEG_PATH);

export async function combineAudioFiles(audioFiles: string[], outputPath: string): Promise<void> {
  try {
    const inputFiles = audioFiles.map(file => `-i "${file}"`).join(' ');
    const filterComplex = audioFiles.map((_, i) => `[${i}:0]`).join('') + `concat=n=${audioFiles.length}:v=0:a=1[out]`;
    const command = `${FFMPEG_PATH} ${inputFiles} -filter_complex "${filterComplex}" -map "[out]" "${outputPath}"`;

    await execAsync(command, { shell: '/bin/bash' });
  } catch (error) {
    console.error('Error combining audio files:', error);
    if (error instanceof Error && error.message.includes('Permission denied')) {
      console.error('FFmpeg permission error. Please ensure ffmpeg is installed and has proper permissions.');
    }
    throw error;
  }
}

export async function createVideoSlideshow(
  imagePaths: string[],
  audioPath: string,
  outputPath: string,
  totalDuration: number
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
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
      .setFfmpegPath(FFMPEG_PATH)
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
      .on('error', (err) => {
        console.error('Video generation error:', err);
        if (err.message.includes('Permission denied')) {
          console.error('FFmpeg permission error. Please ensure ffmpeg is installed and has proper permissions.');
        }
        reject(err);
      })
      .on('end', () => resolve())
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