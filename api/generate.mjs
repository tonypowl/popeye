// api/generate.mjs

export default async function handler(req, res) {
  // Replace with the base URL for the Kling AI API
  const KLING_API_BASE_URL = "https://api.klingai.com"; 
  const KLING_API_KEY = process.env.KLING_API_KEY;

  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST allowed" });
    return;
  }

  const { prompt } = req.body;
  if (!prompt) {
    res.status(400).json({ error: "Missing prompt" });
    return;
  }

  // Set the headers for the API requests
  const headers = {
    'Authorization': `Bearer ${KLING_API_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    // Step 1: Create a video generation task
    const createResponse = await fetch(`${KLING_API_BASE_URL}/v1/videos/text2video`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt: prompt,
        duration: 5, // Default duration is 5 seconds
        model_name: "kling-v1-6",
        aspect_ratio: "16:9",
      }),
    });

    const createData = await createResponse.json();

    if (!createResponse.ok || createData.code !== 0) {
      console.error("Kling AI Task Creation Error:", createData);
      return res.status(500).json({ error: createData.message || "Failed to create Kling AI task." });
    }

    const taskId = createData.data.task_id;

    // Step 2: Poll for the video result
    let taskStatus = '';
    let pollingAttempts = 0;
    const maxPollingAttempts = 30; // Max 30 attempts, with 10s delay = 5 minutes timeout

    while (taskStatus !== 'succeed' && taskStatus !== 'failed' && pollingAttempts < maxPollingAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds
      pollingAttempts++;

      const statusResponse = await fetch(`${KLING_API_BASE_URL}/v1/videos/text2video/${taskId}`, {
        method: 'GET',
        headers: headers,
      });

      const statusData = await statusResponse.json();
      taskStatus = statusData.data.task_status;
      
      console.log(`Polling task ${taskId}... Status: ${taskStatus}`);

      if (taskStatus === 'succeed') {
        const videoUrl = statusData.data.task_result.videos[0].url;
        return res.status(200).json({ videoUrl: videoUrl });
      }
      
      if (taskStatus === 'failed') {
        console.error("Kling AI Task Failed:", statusData.data.task_status_msg);
        return res.status(500).json({ error: statusData.data.task_status_msg || "Video generation failed." });
      }
    }

    // If the loop finishes without a successful result, it's a timeout
    res.status(504).json({ error: "Video generation timed out." });

  } catch (err) {
    console.error("Internal Server Error:", err);
    res.status(500).json({ error: err.message || "An unexpected error occurred." });
  }
}