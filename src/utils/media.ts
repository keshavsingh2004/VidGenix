import { exec } from 'child_process';
import { promisify } from 'util';
import ffmpeg from 'fluent-ffmpeg';
import shell from 'shelljs';

const execAsync = promisify(exec);

// Get ffmpeg path with multiple fallbacks
function getFfmpegPath(): string {
  const possiblePaths = [
    shell.which('ffmpeg')?.toString(),
    '/usr/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
    process.env.FFMPEG_PATH // Allow environment variable override
  ].filter(Boolean);

  const ffmpegPath = possiblePaths[0];

  if (!ffmpegPath) {
    throw new Error('FFmpeg not found. Please ensure ffmpeg is installed and accessible.');
  }

  // Verify ffmpeg is actually executable
  try {
    shell.exec(`${ffmpegPath} -version`, { silent: true });
  } catch {
    throw new Error(`FFmpeg found at ${ffmpegPath} but is not executable. Please check permissions.`);
  }

  return ffmpegPath;
}

// Initialize ffmpeg path
const FFMPEG_PATH = getFfmpegPath();
ffmpeg.setFfmpegPath(FFMPEG_PATH);

export async function combineAudioFiles(audioFiles: string[], outputPath: string): Promise<void> {
  try {
    // Verify all input files exist
    for (const file of audioFiles) {
      if (!shell.test('-f', file)) {
        throw new Error(`Input file not found: ${file}`);
      }
    }

    const inputFiles = audioFiles.map(file => `-i "${file}"`).join(' ');
    const filterComplex = audioFiles.map((_, i) => `[${i}:0]`).join('') + `concat=n=${audioFiles.length}:v=0:a=1[out]`;
    const command = `${FFMPEG_PATH} ${inputFiles} -filter_complex "${filterComplex}" -map "[out]" "${outputPath}"`;

    const { stderr } = await execAsync(command, { shell: '/bin/bash' });

    if (stderr && stderr.toLowerCase().includes('error')) {
      throw new Error(`FFmpeg error: ${stderr}`);
    }
  } catch (error) {
    console.error('Error combining audio files:', error);
    if (error instanceof Error) {
      if (error.message.includes('No such file')) {
        throw new Error('FFmpeg not found. Please ensure ffmpeg is installed correctly.');
      }
      if (error.message.includes('Permission denied')) {
        throw new Error('FFmpeg permission error. Please check file permissions.');
      }
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