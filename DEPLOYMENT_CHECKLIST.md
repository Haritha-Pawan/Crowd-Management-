# Quick Deployment Checklist for Render

## ✅ Pre-Deployment Setup (Do Once)

### 1. GitHub Setup
- [ ] Push all code to GitHub (main branch)
- [ ] Ensure `.gitignore` has `.env` and `node_modules`
- [ ] Verify repo is accessible from Render

### 2. Database Setup
- [ ] Create MongoDB Atlas account (https://cloud.mongodb.com)
- [ ] Create a free cluster
- [ ] Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
- [ ] Whitelist all IPs (0.0.0.0/0) for Render access

### 3. API Keys & Secrets (Collect these)
- [ ] MongoDB URI
- [ ] JWT Secret (generate 32+ char random string)
- [ ] Twilio Account SID (if using SMS)
- [ ] Twilio Auth Token
- [ ] Twilio Phone Number
- [ ] Gmail/Email address (if using email)
- [ ] Gmail App Password (not regular password)

---

## 🚀 Step-by-Step Deployment

### Step 1: Create Backend Service (5 minutes)
1. Go to https://render.com/dashboard
2. Click **"New +" → "Web Service"**
3. Select your GitHub repository
4. Fill in:
   - Name: `crowd-management-api`
   - Root Directory: `Crowd/Backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free` (or Starter $7/mo for better performance)
5. Click **"Create Web Service"**
6. **⏳ Wait for deployment** (may take 2-3 minutes)

### Step 2: Add Backend Environment Variables (2 minutes)
1. In Render dashboard, go to your backend service
2. Click **"Environment"** on the left
3. Click **"Add Environment Variable"** and add:
   ```
   PORT = 5000
   NODE_ENV = production
   MONGODB_URI = mongodb+srv://user:password@cluster.mongodb.net/dbname
   JWT_SECRET = (generate random 32+ char string)
   FRONTEND_URL = (leave blank for now, update after frontend deployed)
   TWILIO_ACCOUNT_SID = your_sid
   TWILIO_AUTH_TOKEN = your_token
   TWILIO_PHONE_NUMBER = your_number
   NODEMAILER_EMAIL = your_email@gmail.com
   NODEMAILER_PASSWORD = your_app_password
   ```
4. Click **"Save Changes"** (service will auto-redeploy)

### Step 3: Create Frontend Service (5 minutes)
1. In dashboard, click **"New +" → "Static Site"**
2. Select your GitHub repository
3. Fill in:
   - Name: `crowd-management-frontend`
   - Root Directory: `Crowd/Frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Click **"Create Static Site"**
5. **⏳ Wait for deployment** (may take 2-3 minutes)

### Step 4: Get Render URLs & Update Variables (2 minutes)
1. Go to backend service → click service name at top
   - Copy the URL (e.g., `https://crowd-management-api.onrender.com`)
2. Go to frontend service → click service name at top
   - Copy the URL (e.g., `https://crowd-management-frontend.onrender.com`)
3. Go back to **backend** → **Environment**
   - Update `FRONTEND_URL` = the frontend URL
4. Go to **frontend** → **Environment** (if available)
   - Add `VITE_API_BASE_URL` = the backend URL
   - Add `VITE_SOCKET_URL` = the backend URL
5. Click **"Save Changes"**

### Step 5: Test & Verify (5 minutes)
- [ ] Open frontend URL in browser
- [ ] Check browser console (F12) for errors
- [ ] Try logging in
- [ ] Try an API call
- [ ] Check Render logs for errors: click service → **"Logs"**

---

## 🔧 If Something Goes Wrong

### Backend won't start?
1. Go to **Backend Service → Logs**
2. Look for error messages
3. Common issues:
   - MongoDB connection string is wrong
   - Missing environment variables
   - Port is already in use

### Frontend won't load?
1. Go to **Frontend Service → Logs** (Build section)
2. Check if `npm run build` succeeded
3. Try running locally: `cd Crowd/Frontend && npm run build`
4. Verify `dist` folder exists

### Frontend can't connect to backend?
1. Open frontend URL → F12 (Developer Tools)
2. Check Network tab for failed API calls
3. Check if backend URL is correct in environment variables
4. Verify backend service is running (check backend logs)

### WebSocket/Socket.IO not working?
1. Ensure backend environment has `FRONTEND_URL` set
2. Check CORS in server.js includes frontend URL
3. Frontend must use `https://` (not `http://`)
4. Check browser console for connection errors

---

## 📊 Monitoring After Deployment

- **Logs**: Click service → Logs (check every few hours initially)
- **Metrics**: Click service → Metrics (CPU, Memory, Requests)
- **Errors**: Setup email notifications in Render settings
- **Database**: Check MongoDB Atlas for connection activity

---

## 💡 Cost Optimization Tips

- **Free Tier**: Backend + Frontend + Database free for first month
- **Auto-sleep**: Free services sleep after 15 min inactivity (500 free hours/month)
- **Upgrade**: Starter plan ($7/mo) prevents auto-sleep
- **Database**: Free MongoDB Atlas free tier has limits

---

## 🎯 Final Checklist Before Going Live

- [ ] Backend service is running (check logs, no errors)
- [ ] Frontend service is running (check logs, no errors)
- [ ] Can access frontend URL
- [ ] Can login to frontend
- [ ] Can make API calls (check Network tab)
- [ ] WebSocket connection working
- [ ] Email notifications working
- [ ] SMS notifications working
- [ ] Database is accessible
- [ ] File uploads working (if applicable)
- [ ] All features tested end-to-end

---

## 📞 Support Links

- Render Status: https://status.render.com
- Render Docs: https://render.com/docs
- Contact Render: https://render.com/support
- GitHub Status: https://www.githubstatus.com

---

## 🔐 Important Security Notes

- **Never commit `.env` files** with real credentials
- Use Render's environment variable system for secrets
- Update JWT_SECRET to a random strong value
- MongoDB Atlas whitelist only necessary IPs (or use IP range)
- Enable 2FA on MongoDB Atlas and Render accounts
- Monitor logs regularly for suspicious activity
- Keep dependencies updated (npm audit)
