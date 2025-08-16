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

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate video");
      }

      setVideoUrl(data.videoUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
        <video src={videoUrl} controls autoPlay loop style={{ marginTop: "1rem", width: "100%" }} />
      )}
    </div>
  );
};

export default VideoForm;
