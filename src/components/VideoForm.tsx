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
      // Send the prompt to our new backend API endpoint
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      // If the response is not successful, throw an error
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      // Get the response data from the successful response
      const data = await response.json();
      // Assuming 'videoData' from the backend is the URL or a string to display
      setVideoUrl(data.videoData);

    } catch (e: any) {
      // Display any errors to the user
      setError(e.message);
      console.error("Failed to generate video:", e);
    } finally {
      // Ensure the loading state is turned off, whether it succeeded or failed
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