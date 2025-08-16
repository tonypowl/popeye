import { useState } from "react";

const VideoForm = () => {
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setVideoUrl("");

    // Mock: If API is slow/limited, show placeholder video and log prompt
    setTimeout(() => {
      console.log("[MOCK] Would send prompt to backend/API:", prompt);
      setVideoUrl("https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4");
      setLoading(false);
      setError("");
    }, 1500);

    // In production, you would:
    // 1. Send the prompt to your backend API (e.g., /api/generate)
    // 2. The backend would call the AI service (e.g., Hugging Face, Pika Labs)
    // 3. Return the generated video URL or blob to the frontend
    // 4. Display the video to the user
  };

  return (
    <div className="video-form">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your vision..."
      />

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "⏳ Generating..." : "✨ Generate Video"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {videoUrl && (
        <video
          src={videoUrl}
          controls
          autoPlay
          loop
          style={{ marginTop: "1rem", width: "100%" }}
        />
      )}
    </div>
  );
};

export default VideoForm;
