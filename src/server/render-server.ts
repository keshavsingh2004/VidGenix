import express from 'express';
import { renderVideo } from '@revideo/renderer';
import path from 'path';
import cors from 'cors';

interface RenderRequest {
  metadata: {
    [key: string]: unknown;
  };
}

const app = express();
app.use(express.json());
app.use(cors());

// Fix express route handler types
app.post('/render', async (
  req: express.Request<unknown, unknown, RenderRequest>,
  res: express.Response
) => {
  try {
    const { metadata } = req.body;
    const outFile = `video-${Date.now()}.mp4` as const;

    console.log('Starting render...');
    const videoPath = await renderVideo({
      projectFile: path.join(process.cwd(), 'revideo', 'project.ts'),
      variables: metadata,
      settings: {
        outFile,
        outDir: path.join(process.cwd(), 'output'),
        workers: 4,
        logProgress: true,
        ffmpeg: {
          ffmpegLogLevel: 'error',
        },
        puppeteer: {
          args: ['--no-sandbox'],
        }
      }
    });

    console.log('Render complete:', videoPath);
    res.json({ success: true, videoPath });
  } catch (error: unknown) {
    console.error('Render error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Fix port handling
const port = Number(process.env.RENDER_PORT) || 4000;
app.listen(port, () => {
  console.log(`Render server listening on port ${port}`);
});