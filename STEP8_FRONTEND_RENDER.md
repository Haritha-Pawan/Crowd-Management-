# Step 8: Create Frontend Service on Render

## Instructions to Deploy Frontend

### 1. Verify Backend is Running First
- Before deploying frontend, make sure:
  - Backend service on Render is fully deployed
  - You have the backend URL (e.g., `https://crowd-management-api.onrender.com`)
  - Test by visiting backend URL in browser

### 2. Go to Render Dashboard
- Visit: https://render.com/dashboard
- You should already be logged in

### 3. Create New Static Site
- Click the **"New +"** button (top right)
- Select **"Static Site"** (NOT Web Service this time)

### 4. Connect Your GitHub Repository
- Look for "Crowd-Management-" in the repository list
- Click **"Connect"**

### 5. Configure the Frontend Service
Fill in the following details:

**Basic Settings:**
- **Name**: `crowd-management-frontend`
- **Root Directory**: `Crowd/Frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Branch**: `main` (or the branch you pushed to)

### 6. Add Environment Variables (IMPORTANT!)
Before clicking "Create Static Site", add these:

```
VITE_API_BASE_URL = https://YOUR-BACKEND-URL.onrender.com
VITE_SOCKET_URL = https://YOUR-BACKEND-URL.onrender.com
```

Replace `YOUR-BACKEND-URL` with the actual backend URL from Step 7.

For example:
```
VITE_API_BASE_URL = https://crowd-management-api.onrender.com
VITE_SOCKET_URL = https://crowd-management-api.onrender.com
```

### 7. Click "Create Static Site"
- Render will start building your frontend
- You'll see build logs in real-time
- **WAIT** for the build to complete (usually 2-3 minutes)
- Look for: ✅ "Your site is live"

### 8. Verify Frontend is Running
Once deployed:
1. Go to your service page
2. Look for the service URL at the top (e.g., `https://crowd-management-frontend.onrender.com`)
3. Click on it to open in browser
4. You should see your Crowd Management application

### 9. Update Backend FRONTEND_URL (Important!)
Now that frontend is deployed, update backend environment variables:

1. Go to your **Backend Service** in Render
2. Click **"Environment"** tab
3. Find the `FRONTEND_URL` variable
4. Update it to: `https://YOUR-FRONTEND-URL.onrender.com`
5. Click **"Save Changes"**
6. Backend will automatically redeploy

---

## Testing the Deployment

### Test Frontend
- [ ] Open frontend URL
- [ ] Check browser console (F12) for any errors
- [ ] Try navigating between pages
- [ ] Check Network tab to verify API calls are working

### Test API Connectivity
- [ ] Try logging in
- [ ] Check Network tab (F12) to see API requests
- [ ] Requests should go to your backend URL
- [ ] Should see 200 status codes (not 404 or 500)

### Test WebSocket (Socket.IO)
- [ ] In browser console, check for WebSocket connection
- [ ] Look for messages like "Socket connected"
- [ ] Real-time features (notifications, etc.) should work

### Test Full Features
- [ ] User authentication (login/logout)
- [ ] Create/update/delete operations
- [ ] File uploads (if applicable)
- [ ] Real-time notifications
- [ ] All dashboard features

---

## Troubleshooting Frontend Deployment

### Build fails with errors
1. Go to **Build Logs** tab
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - JavaScript syntax errors
   - Missing dependencies
4. Fix locally, commit, and push to GitHub
5. Click **"Manual Deploy"** → **"Deploy latest commit"** in Render

### Frontend loads but API calls fail
1. Open browser console (F12)
2. Check Network tab
3. If requests show 404 or timeout:
   - Verify `VITE_API_BASE_URL` is correct
   - Check if backend is running
   - Check if backend URL is accessible from browser
4. Update environment variables and redeploy

### WebSocket connection fails
1. Check browser console for errors
2. Verify `VITE_SOCKET_URL` is correct and uses HTTPS
3. Ensure backend CORS includes frontend URL
4. Check that backend is accessible

### Static site shows 404
1. Check "Publish Directory" is set to `dist`
2. Verify `npm run build` creates `Crowd/Frontend/dist` folder
3. Check build logs for errors

### Pages won't load after navigation
1. This happens with React Router on static sites
2. Need to add a redirect configuration
3. Create `public/_redirects` file with:
   ```
   /*    /index.html   200
   ```
4. Commit and redeploy

---

## Connecting Frontend and Backend

### How it works:
1. **Frontend** sends requests to `VITE_API_BASE_URL` for API calls
2. **Backend** has CORS configured to allow requests from `FRONTEND_URL`
3. **Socket.IO** establishes WebSocket connection to `VITE_SOCKET_URL`

### If connection fails:
1. **Backend logs**: Check backend logs in Render for CORS errors
2. **Frontend logs**: Check browser console for connection errors
3. **Network tab**: Check actual requests and responses
4. **Environment variables**: Double-check both frontend and backend URLs

---

## After Both Services are Deployed

### Verify Everything Works
- [ ] Frontend loads without errors
- [ ] Can log in successfully
- [ ] API calls work (check Network tab)
- [ ] WebSocket connects (check console)
- [ ] All features work (CRUD, uploads, etc.)

### Monitor for Errors
- Check both backend and frontend logs regularly
- Fix any errors that appear
- Monitor database performance
- Check file storage if using uploads

### Next Steps
- Add custom domain (optional)
- Setup auto-deploy on git push (already enabled)
- Scale if needed
- Monitor usage and costs
- Setup notifications for errors

---

## Useful Links for This Step
- Render Static Sites Docs: https://render.com/docs/static-sites
- Render Environment Variables: https://render.com/docs/environment-variables
- React Router with Static Sites: https://render.com/docs/deploy-static-site#react-router
- Custom Redirects: https://render.com/docs/redirects-rewrites
