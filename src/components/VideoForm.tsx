import { useState } from "react";

const VideoForm = () => {
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const handleGenerate = async () => {
    // Later: Connect to AI API
    setVideoUrl("https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4");
  };

  return (
    <div className="video-form">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your vision..."
      />
      <button onClick={handleGenerate}>✨ Generate Video</button>

      {videoUrl && (
        <video src={videoUrl} controls />
      )}
    </div>
  );
};

export default VideoForm;
