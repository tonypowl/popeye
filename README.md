# POPEYE
## Overview
This project is a simple **text-to-video generator** attempt, built with React (Vite + TypeScript) on the frontend and a lightweight Node.js backend.  
The goal was to let users type a prompt and generate a short video.

## AI Model Attempts 🎥
I explored several AI text-to-video models and APIs:

- **Kling AI** – required reference input, not usable for free.
- **Stability AI** – no proper text-to-video model available.
- **Pika Labs** – works but credits run out quickly.
- **Vadoo AI** – gave 400 free credits, but not enough to test properly.
- **Hugging Face Endpoints** – inference worked, but usage was paid.

In short, I ran into a wall with **API credits and paywalls**.  
Because of this, the project can’t generate real videos on demand in its current form.

## What Happens Instead ✨
To keep the project functional, I added a **placeholder video** that plays when you submit a prompt.  
This way, the app still demonstrates the flow:  
1. User enters a prompt.  
2. Backend call happens.  
3. A video (placeholder) is shown.

It’s not the real AI output, but it makes the app demo-able.

## Deployment
The app is deployed on **Vercel**, so you can try it live.  
Frontend: React + Vite  
Backend: Node.js (API route)

## Notes
This project was more of an experiment to see how far I could go with free/limited APIs.  
If you could suggest a free open-source text-to-video model that  i could use or provide me with the reauired funds, the backend can be updated to replace the placeholder with real generated content in a few hours.

---

👉 For now, think of it as a **prototype / proof of concept**.  
It shows the workflow, but video generation itself is blocked by credit limits.
