import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function ensureDir(dirPath: string) {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    if ((error as any).code !== 'EEXIST') {
      throw error;
    }
  }
}

export async function saveBase64File(base64Content: string, filePath: string) {
  const buffer = Buffer.from(base64Content, 'base64');
  await writeFile(filePath, buffer);
  return filePath;
}

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