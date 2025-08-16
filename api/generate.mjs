// api/generate.mjs

export default async function handler(req, res) {
  console.log("Function handler started.");

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
    const response = await fetch("https://api.stability.ai/v2beta/video/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY ?? ""}`,
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
      // This will log the specific error from Stability AI to your Vercel logs
      const apiError = await response.text();
      console.error("Stability AI API Error:", response.status, apiError);
      res.status(500).json({ error: `API Error: ${response.status} - ${apiError}` });
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Video = Buffer.from(arrayBuffer).toString("base64");

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ videoBase64: base64Video });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    // This will log any other unexpected error to your Vercel logs
    console.error("Internal Server Error:", err);
    res.status(500).json({ error: message });
  }
}