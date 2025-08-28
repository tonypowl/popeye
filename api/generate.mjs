// api/generate.mjs

// This example uses the official Google Cloud Node.js client library.
import { VertexAI } from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';

// Vertex AI authentication and client setup
const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const GOOGLE_LOCATION = 'asia-south1'; // Or your chosen region
const MODEL_ID = 'veo-2.0-generate-001'; // Veo model for text-to-video

// Explicitly define the API endpoint for Veo, as it might differ from generic generative models
const VEO_API_ENDPOINT = `${GOOGLE_LOCATION}-aiplatform.googleapis.com`;

// Explicitly pass projectId to GoogleAuth
let authClient;
if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON) {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON);
    console.log("Parsed Google Credentials successfully."); // Debug log
    // console.log("Credentials object keys:", Object.keys(credentials)); // Further debug
    authClient = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      projectId: GOOGLE_PROJECT_ID,
    });
  } catch (parseError) {
    console.error("ERROR: Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY_JSON:", parseError.message);
    // If parsing fails, authClient will remain undefined or improperly initialized
    // This will cause subsequent authClient calls to fail.
    authClient = new GoogleAuth({ // Fallback to default auth, which will likely fail without proper env
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
    console.log("Successfully obtained project ID from authClient:", projectId); // Debug log

    const accessToken = await authClient.getAccessToken();
    console.log("Successfully obtained access token. Token starts with:", accessToken.token.substring(0, 10), "..."); // Debug log

    const headers = {
      'Authorization': `Bearer ${accessToken.token}`,
      'Content-Type': 'application/json',
    };

    const predictUrl = `https://${VEO_API_ENDPOINT}/v1/projects/${projectId}/locations/${GOOGLE_LOCATION}/publishers/google/models/${MODEL_ID}:predict`;
    console.log("Calling Veo Prediction API URL:", predictUrl); // Debug log

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
  }
}