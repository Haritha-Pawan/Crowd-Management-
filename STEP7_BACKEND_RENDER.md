# Step 7: Create Backend Service on Render

## Instructions to Deploy Backend

### 1. Go to Render Dashboard
- Visit: https://render.com/dashboard
- Login with your GitHub account (if not already logged in)

### 2. Create New Web Service
- Click the **"New +"** button (top right)
- Select **"Web Service"**

### 3. Connect Your GitHub Repository
- Look for "Crowd-Management-" in the repository list
- Click **"Connect"** next to your repository
- If you don't see it, click **"Configure account"** to reconnect GitHub

### 4. Configure the Backend Service
Fill in the following details:

**Basic Settings:**
- **Name**: `crowd-management-api`
- **Root Directory**: `Crowd/Backend`
- **Environment**: `Node`
- **Region**: `Oregon` (or closest to your users)
- **Branch**: `main` (or the branch you pushed to)
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Plan:**
- **Free** (first option) - Good for testing, auto-sleeps after 15 min inactivity
- **Starter** ($7/month) - Better for production, always running

### 5. Add Environment Variables
**IMPORTANT:** Before clicking "Create Web Service", scroll down to "Advanced" and add these variables:

```
PORT = 5000
NODE_ENV = production
MONGODB_URI = mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DATABASE_NAME
JWT_SECRET = (generate a random 32+ character string - use an online tool like https://generate-random.org/)
FRONTEND_URL = https://your-frontend.onrender.com (you'll update this after frontend is deployed)
TWILIO_ACCOUNT_SID = (get from Twilio dashboard if using SMS)
TWILIO_AUTH_TOKEN = (get from Twilio dashboard)
TWILIO_PHONE_NUMBER = (your Twilio phone number)
NODEMAILER_EMAIL = your-email@gmail.com
NODEMAILER_PASSWORD = (Gmail app-specific password, not your regular password)
```

### 6. Click "Create Web Service"
- Render will start deploying immediately
- You'll see deployment logs in real-time
- **WAIT** for the deployment to complete (should take 2-3 minutes)
- Look for message: ✅ "Server running on port 5000"

### 7. Verify Backend is Running
Once deployed:
1. Go to your service page
2. Look for the service URL at the top (e.g., `https://crowd-management-api.onrender.com`)
3. Click on it to open in browser
4. You should see: `{"status":"Server is running...","environment":"production"}`

### 8. Save Your Backend URL
- Copy the URL: `https://crowd-management-api.onrender.com` (yours will be different)
- You'll need this for the frontend deployment next

---

## Troubleshooting Backend Deployment

### Build fails with "npm install" error
- Check `package.json` is in `Crowd/Backend/`
- Verify all dependencies are listed
- Run `npm install` locally to verify

### Server won't start
1. Go to **Logs** tab
2. Look for error messages
3. Common issues:
   - Missing `MONGODB_URI` environment variable
   - Invalid MongoDB connection string
   - Port already in use
4. Fix the issue and click **"Manual Deploy"** → **"Deploy latest commit"**

### Service keeps restarting
1. Check logs for "MongoDB Connected" message
2. Verify MongoDB connection string is correct
3. Check if MongoDB cluster is running and accessible

### Port issues
- Render automatically assigns the port
- Our `server.js` reads `process.env.PORT` so it will work correctly
- You should NOT need to change anything

---

## Next Steps (After Backend is Running)
1. Note your backend URL
2. Proceed to Step 8: Create Frontend Service
3. Update frontend environment variables with backend URL
4. Deploy frontend

---

## Useful Links for This Step
- Render Node.js Docs: https://render.com/docs/deploy-node
- Render Environment Variables: https://render.com/docs/environment-variables
- MongoDB Atlas: https://cloud.mongodb.com/
- Twilio Console: https://www.twilio.com/console
