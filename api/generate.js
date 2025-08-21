import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // === THE FIX IS ON THIS LINE ===
    // Use the specific "gemini-1.0-pro" model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    // For the latest model, you could also use "gemini-1.5-pro-latest"

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // As noted before, this is a placeholder. A real video API would be asynchronous.
    console.log("Successfully received response from Gemini API:", text);
    res.status(200).json({ videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" });

  } catch (error) {
    // The detailed error will be logged here in your Vercel function logs
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to communicate with the AI model." });
  }
}