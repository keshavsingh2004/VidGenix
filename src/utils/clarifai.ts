import { ClarifaiResponse } from '../types/clarifai';
const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");
import { waitForToken, withRetry } from './rate-limiter';

const stub = ClarifaiStub.grpc();

export async function postModelOutputs(
  userId: string,
  appId: string,
  modelId: string,
  modelVersionId: string,
  rawText: string,
  metadata: any
): Promise<ClarifaiResponse> {
  return withRetry(async () => {
    await waitForToken(modelId);
    console.log(`Making prediction for ${modelId}`);

    return new Promise<ClarifaiResponse>((resolve, reject) => {
      stub.PostModelOutputs(
        {
          user_app_id: { user_id: userId, app_id: appId },
          model_id: modelId,
          version_id: modelVersionId,
          inputs: [{ data: { text: { raw: rawText } } }]
        },
        metadata,
        (err: any, response: ClarifaiResponse) => {
          if (err) {
            reject(new Error(`Model ${modelId} error: ${err.message}`));
            return;
          }

          if (response.status.code !== 10000) {
            reject(new Error(`Model ${modelId} failed: ${response.status.description}`));
            return;
          }

          resolve(response);
        }
      );
    });
  });
}