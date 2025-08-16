import { useState } from "react";

const Hero = () => {
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    console.log("User prompt:", prompt);
    // later: send this prompt to backend/AI API
  };

  return (
    <section className="hero">
      <h1>POPEYE</h1>
      <div className="hero-badge">⚡ Developed by Antony Shibu Paul</div>

      <h2>
        Create Stunning <span>AI Videos</span> in Seconds
      </h2>
      <p>
        Type in the box below to see your ideas come to life! 
      </p>
    </section>
  );
};

export default Hero;
