import { GoogleGenerativeAI } from "@google/generative-ai";

// This is the main function that Vercel will run when the /api/generate endpoint is called
export default async function handler(req, res) {
  // 1. Ensure this is a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Securely get the API key from environment variables
  // Make sure you have GEMINI_API_KEY set in your Vercel project settings
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // 3. Get the user's prompt from the request body
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // --- IMPORTANT NOTE FOR REAL VIDEO GENERATION ---
    // The Gemini API for video (Veo) is asynchronous. A real implementation would be:
    // 1. Start a video generation job here.
    // 2. The API would immediately return a job ID.
    // 3. You would need another API endpoint (e.g., /api/status) that the frontend
    //    could periodically call with the job ID to check if the video is ready.
    //
    // For now, to confirm our backend is working, we will log the Gemini text response
    // and return the same placeholder video you were using before.

    console.log("Successfully received response from Gemini API:", text);

    // 5. Send a successful response back to the frontend
    res.status(200).json({ videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" });

  } catch (error) {
    // 6. Handle any errors from the Gemini API
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to generate video. Please try again." });
  }
}