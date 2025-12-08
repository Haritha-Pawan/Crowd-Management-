README: Running the Render automation script

Overview
========
This repository contains `render-deploy.ps1` which will set environment variables
on your Render services (backend + frontend) and trigger deployments. The script
assumes the two services already exist in your Render account with the names
`crowd-management-api` and `crowd-management-frontend`. If you prefer, you can
create services with different names and set them in `render-secrets.json`.

Before you run
==============
1. Copy `render-secrets.example.json` to `render-secrets.json`:
   ```powershell
   Copy-Item .\render-secrets.example.json .\render-secrets.json
   ```
2. Edit `render-secrets.json` and fill real values:
   - `RENDER_API_KEY`: Create one in Render Dashboard → Account → API Keys
   - `MONGODB_URI`, `JWT_SECRET`, `NODEMAILER_*`, `TWILIO_*` etc.
   - Optionally change `BACKEND_SERVICE_NAME` / `FRONTEND_SERVICE_NAME` if you
     named services differently in the Render dashboard.

3. (Recommended) Manually create the two services in Render UI first:
   - Backend (Web Service):
     - Name: `crowd-management-api`
     - Root Directory: `Crowd/Backend`
     - Environment: Node
     - Build Command: `npm install`
     - Start Command: `npm start`
   - Frontend (Static Site):
     - Name: `crowd-management-frontend`
     - Root Directory: `Crowd/Frontend`
     - Build Command: `npm install && npm run build`
     - Publish Directory: `dist`

   Creating services manually is fast and makes the script more robust because
   Render's create-service payloads are sensitive to exact repo access settings.

Run the script
==============
Open PowerShell in the repository root and run:

```powershell
# If using Windows PowerShell 5.1
.\render-deploy.ps1

# If using PowerShell Core (pwsh)
pwsh .\render-deploy.ps1
```

The script will:
- Read `render-secrets.json` (use env var RENDER_API_KEY as fallback)
- Upsert environment variables into the target services via Render API
- Trigger a deploy for each service and wait until completion
- Print service URLs and deploy results

If something fails
===================
- If the script cannot find a service by name, create the service in Render UI
  first (see "Before you run" above).
- If an API call fails, the script prints the HTTP error; copy the message and
  share it (or paste it into a browser) — I'll help you interpret and fix it.

Security
========
- `render-secrets.json` contains secrets. DO NOT commit it to Git. Add it to
  `.gitignore` if not already ignored.
- You can instead set your Render API key in an environment variable
  `RENDER_API_KEY` and leave it out of `render-secrets.json`.

What I can do next
==================
- Help you run the script step-by-step and interpret logs
- Extend the script to create services via Render API (less reliable)
- After successful deploys, verify the health endpoints and WebSocket
  connectivity for you

