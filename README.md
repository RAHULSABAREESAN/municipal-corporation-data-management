<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bdbe5719-0d85-4a20-a223-790818a3bc7e

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` and `GOOGLE_MAPS_PLATFORM_KEY` to your own API keys. `.env.local` is ignored by Git.
3. Run the app:
   `npm run dev`

Complaint submissions require a live camera photo and location permission. The photo is stamped with its capture coordinates and time. Camera and location access work on `localhost` or when the app is served over HTTPS.

api used -> (google map plat form )api key have been useed 
gemenai asst -> gemiai api key 
