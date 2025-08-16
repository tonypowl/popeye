import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const response = await fetch("https://api.stability.ai/v2beta/video/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY!}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        prompt,
        duration: 5,
        resolution: "512x512",
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    const data = await response.json();
    // Stability should return a URL for the video
    return res.status(200).json({ videoUrl: data.video_url });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
