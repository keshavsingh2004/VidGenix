import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

async function updateMetadata(newMetadata: any) {
  try {
    const metadataPath = path.join(process.cwd(), 'revideo', 'metadata.json');

    // Remove existing metadata.json if it exists
    try {
      await fs.unlink(metadataPath);
    } catch (error) {
      // Ignore error if file doesn't exist
    }

    const metadata = {
      ...newMetadata,
      lastModified: {
        user: 'keshavsingh2004'
      }
    };

    await fs.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2)
    );

    return metadata;
  } catch (error) {
    console.error('Error updating metadata:', error);
    throw error;
  }
}

async function renderVideo(metadata: any): Promise<string> {
  try {
    const response = await fetch('http://localhost:4000/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metadata }),
    });

    if (!response.ok) {
      throw new Error(`Render server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.videoPath;
  } catch (error) {
    console.error('Render error:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.metadata) {
      return NextResponse.json({
        error: 'Invalid request. Include metadata in the request.'
      }, { status: 400 });
    }

    // Handle metadata update
    const updatedMetadata = await updateMetadata(body.metadata);

    // If only updating metadata (no render needed)
    if (!body.streamProgress) {
      return NextResponse.json({
        success: true,
        message: 'Metadata updated successfully',
        metadata: updatedMetadata
      });
    }

    // If render is requested
    try {
      const videoPath = await renderVideo(updatedMetadata);
      return NextResponse.json({
        success: true,
        message: 'Video rendered successfully',
        videoPath
      });
    } catch (error) {
      console.error('Render error:', error);
      return NextResponse.json({
        error: 'Video render failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}