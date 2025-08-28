// api/generate.mjs

// This example uses the official Google Cloud Node.js client library.
// You would need to install it: npm install @google-cloud/vertexai google-auth-library
import { VertexAI } from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';

// Vertex AI authentication and client setup
const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const GOOGLE_LOCATION = 'us-central1'; // Or your chosen region
const MODEL_ID = 'veo-1.0-generate'; // Veo model for text-to-video

// This is the standard way to authenticate on Google Cloud, using the
// GOOGLE_APPLICATION_CREDENTIALS environment variable.
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

export default async function handler(req, res) {
  // Log the project ID being used for debugging
  console.log("Using Google Cloud Project ID:", GOOGLE_PROJECT_ID);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const projectId = await auth.getProjectId();
    const vertexAI = new VertexAI({
      project: projectId,
      location: GOOGLE_LOCATION,
    });
    const generativeModel = vertexAI.getGenerativeModel({
      model: MODEL_ID,
    });

    const request = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      // The Veo model parameters may vary and are in preview.
      // You'll need to check the latest documentation for correct values.
      generationConfig: {
        max_output_tokens: 1024, // Example parameter, adjust as needed
      },
    };

    const result = await generativeModel.generateContent(request);
    // The Veo API's response structure for video generation is complex and in preview.
    // This example assumes it returns a text field that might contain a URL or ID.
    // You will need to inspect the actual 'result' object in your logs to parse it correctly.
    const videoResponse = result.response.candidates[0].content.parts[0].text;
    
    // For now, we'll return this raw text. In a real app, you'd parse this for a video URL.
    return res.status(200).json({ videoData: videoResponse });

  } catch (error) {
    // Enhanced error logging
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