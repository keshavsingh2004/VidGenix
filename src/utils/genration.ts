import { ClarifaiResponse, ImageGenerationContext, AudioGenerationContext } from '../types/clarifai';
import path from 'path';
import { saveBase64File } from './file';
import { postModelOutputs } from './clarifai';

export async function generateImage(
  scene: string,
  metadata: any,
  context: ImageGenerationContext
) {
  const { imagesDir, sanitizedTitle, timestamp } = context;

  try {
    const response = await postModelOutputs(
      'openai',
      'dall-e',
      'dall-e-3',
      'dc9dcb6ee67543cebc0b9a025861b868',
      scene,
      metadata
    );

    if (!response.outputs?.[0]?.data?.image?.base64) {
      throw new Error('No image data in response');
    }

    const base64Image = response.outputs[0].data.image.base64;
    const safeSceneName = scene.slice(0, 50).replace(/[^a-z0-9]/gi, '_');
    const imagePath = path.join(imagesDir, `scene_${safeSceneName}.jpg`);
    await saveBase64File(base64Image, imagePath);

    return {
      scene,
      path: `/generated/${sanitizedTitle}_${timestamp}/images/scene_${safeSceneName}.jpg`,
      fullPath: imagePath
    };
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
}

export async function generateAudio(
  narration: string,
  metadata: any,
  context: AudioGenerationContext
) {
  const { audioDir, sanitizedTitle, timestamp } = context;

  try {
    const response = await postModelOutputs(
      'eleven-labs',
      'audio-generation',
      'speech-synthesis',
      'f2cead3a965f4c419a61a4a9b501095c',
      narration,
      metadata
    );

    if (!response.outputs?.[0]?.data?.audio?.base64) {
      throw new Error('No audio data in response');
    }

    const base64Audio = response.outputs[0].data.audio.base64;
    const safeNarrationName = narration.slice(0, 50).replace(/[^a-z0-9]/gi, '_');
    const audioPath = path.join(audioDir, `narration_${safeNarrationName}.mp3`);
    await saveBase64File(base64Audio, audioPath);

    return {
      narration,
      path: `/generated/${sanitizedTitle}_${timestamp}/audio/narration_${safeNarrationName}.mp3`,
      fullPath: audioPath
    };
  } catch (error) {
    console.error('Audio generation error:', error);
    throw error;
  }
}

export async function generateScript(title: string, metadata: any) {
  try {
    const response = await postModelOutputs(
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

    if (!response.outputs?.[0]?.data?.text?.raw) {
      throw new Error('No script text in response');
    }

    return response.outputs[0].data.text.raw;
  } catch (error) {
    console.error('Script generation error:', error);
    throw error;
  }
}