// api/generate.mjs

import { VertexAI } from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';
import { promises as fs } from 'fs'; // Import Node.js file system promises
import { tmpdir } from 'os'; // Import temporary directory utility
import { join } from 'path'; // Import path utility

// Vertex AI authentication and client setup
const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const GOOGLE_LOCATION = 'asia-south1'; // Ensure this matches your GCP project region
const MODEL_ID = 'veo-2.0-generate-001'; // Veo model for text-to-video

const VEO_API_ENDPOINT = `${GOOGLE_LOCATION}-aiplatform.googleapis.com`;

let authClient;
let credentialsFilePath; // To store the path to our temporary credentials file

// This block will run once per cold start of the serverless function
// to set up the authentication client.
if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON) {
  try {
    const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON;
    console.log("Attempting to parse and use GOOGLE_SERVICE_ACCOUNT_KEY_JSON.");

    // Create a temporary file to store the credentials
    credentialsFilePath = join(tmpdir(), `gcp-credentials-${Date.now()}.json`);
    await fs.writeFile(credentialsFilePath, credentialsJson);
    console.log("Temporary credentials file created at:", credentialsFilePath);

    authClient = new GoogleAuth({
      keyFile: credentialsFilePath, // Point to the temporary file
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      projectId: GOOGLE_PROJECT_ID,
    });
  } catch (setupError) {
    console.error("ERROR: Failed to set up GoogleAuth with temporary file:", setupError.message);
    // Fallback if temporary file creation or auth setup fails
    authClient = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      projectId: GOOGLE_PROJECT_ID,
    });
  }
} else {
  console.error("ERROR: GOOGLE_SERVICE_ACCOUNT_KEY_JSON environment variable is not set.");
  authClient = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    projectId: GOOGLE_PROJECT_ID,
  });
}

export default async function handler(req, res) {
  console.log("Using Google Cloud Project ID:", GOOGLE_PROJECT_ID);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const projectId = await authClient.getProjectId();
    console.log("Successfully obtained project ID from authClient:", projectId);

    const accessToken = await authClient.getAccessToken();
    console.log("Successfully obtained access token. Token starts with:", accessToken.token.substring(0, 10), "...");

    const headers = {
      'Authorization': `Bearer ${accessToken.token}`,
      'Content-Type': 'application/json',
    };

    const predictUrl = `https://${VEO_API_ENDPOINT}/v1/projects/${projectId}/locations/${GOOGLE_LOCATION}/publishers/google/models/${MODEL_ID}:predict`;
    console.log("Calling Veo Prediction API URL:", predictUrl);

    const instance = {
      prompt: prompt,
      // Add other Veo-specific parameters here as needed, based on documentation
      // For example:
      // duration: "5s",
      // resolution: "512x512",
    };

    const predictResponse = await fetch(predictUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ instances: [instance] }),
    });

    const predictData = await predictResponse.json();

    if (!predictResponse.ok) {
      console.error('Veo Prediction API Error:', predictResponse.status, predictData);
      return res.status(predictResponse.status).json({ error: predictData.error?.message || 'Failed to get Veo prediction.' });
    }
    
    const videoResult = predictData.predictions?.[0]?.bytesBase64Encoded || 'Video generation in progress or no direct video data returned.';

    return res.status(200).json({ videoData: videoResult });

  } catch (error) {
    console.error('Vertex AI API Error Details:', error);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    if (error.details) {
      console.error('Error Details:', error.details);
    }
    if (error.message && error.message.includes("does not have permission")) {
        return res.status(403).json({ error: "Permission denied. Ensure your service account has 'Vertex AI User' role." });
    }
    return res.status(500).json({ error: error.message || 'An unexpected error occurred with the Vertex AI API.' });
  } finally {
    // Clean up the temporary file after the function execution
    // Note: In Vercel, the function container might be reused, so this cleanup
    // isn't strictly necessary for every invocation but good practice.
    if (credentialsFilePath) {
      try {
        await fs.unlink(credentialsFilePath);
        console.log("Temporary credentials file deleted.");
      } catch (cleanupError) {
        console.warn("Failed to delete temporary credentials file:", cleanupError.message);
      }
    }
  }
}
