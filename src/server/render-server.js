// /server/render-server.js
const express = require('express');
const { renderVideo } = require('@revideo/renderer');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/render', async (req, res) => {
  try {
    const { metadata } = req.body;
    const outFile = `video-${Date.now()}.mp4`;

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
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.RENDER_PORT || 4000;
app.listen(port, () => {
  console.log(`Render server listening on port ${port}`);
});