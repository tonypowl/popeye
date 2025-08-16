// api/generate.ts
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
        Accept: "video/mp4",
        "Content-Type": "application/json",
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

    // convert binary response to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64Video = Buffer.from(arrayBuffer).toString("base64");

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ videoBase64: base64Video });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
