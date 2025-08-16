// api/generate.mjs

export default async function handler(req, res) {
  const VADOO_API_KEY = process.env.VADOO_API_KEY;
  const VADOO_API_URL = "https://viralapi.vadoo.tv/api/generate_video";

  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST allowed" });
    return;
  }

  const { prompt } = req.body;
  if (!prompt) {
    res.status(400).json({ error: "Missing prompt" });
    return;
  }

  try {
    const headers = {
      'X-API-KEY': VADOO_API_KEY,
      'Content-Type': 'application/json',
    };

    const requestBody = {
      topic: "Custom",
      prompt: prompt,
      duration: "30-60",
      language: "English",
      aspect_ratio: "9:16",
    };

    const response = await fetch(VADOO_API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Vadoo AI API Error:", response.status, responseData);
      return res.status(500).json({ error: responseData.message || "Failed to create Vadoo AI video." });
    }

    // The API returns a video ID immediately, the final video URL is sent to the webhook
    const videoId = responseData.vid;
    res.status(200).json({ videoId: videoId, message: "Video generation started. You will receive the video at your webhook URL shortly." });

  } catch (err) {
    console.error("Internal Server Error:", err);
    res.status(500).json({ error: err.message || "An unexpected error occurred." });
  }
}