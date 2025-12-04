# Render Deployment Guide for Crowd Management Application

## Overview
This guide covers deploying both the Backend (Node.js/Express) and Frontend (React/Vite) to Render.

---

## Prerequisites
- GitHub account with your repository pushed
- Render account (sign up at https://render.com)
- MongoDB Atlas account for database (or use Render's managed database)
- All environment variables documented

---

## Part 1: Backend Deployment (Express API)

### Step 1: Prepare Backend for Production

1. **Update `server.js` CORS configuration** to use environment variable:
   ```javascript
   const corsOptions = {
     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
     credentials: true
   };
   app.use(cors(corsOptions));
   ```

2. **Create `.env.example`** in `/Crowd/Backend/` to document required variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=https://your-frontend-domain.onrender.com
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_phone
   NODEMAILER_EMAIL=your_email@gmail.com
   NODEMAILER_PASSWORD=your_app_password
   NODE_ENV=production
   ```

3. **Update `package.json`** in Backend:
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     }
   }
   ```

### Step 2: Create Render Backend Web Service

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `crowd-management-api`
   - **Root Directory**: `Crowd/Backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free or Paid (based on needs)

5. Click **"Create Web Service"**

### Step 3: Set Backend Environment Variables

1. In the Render dashboard, go to your backend service
2. Click **"Environment"** tab
3. Add all variables from `.env.example`:
   - `PORT` = `5000` (Render will override this)
   - `MONGODB_URI` = your MongoDB connection string
   - `JWT_SECRET` = generate a strong secret
   - `FRONTEND_URL` = `https://your-frontend-domain.onrender.com`
   - Other API keys (Twilio, Nodemailer, etc.)
4. Click **"Save"**

### Step 4: Update Database Configuration (if using MongoDB Atlas)

1. Create/login to MongoDB Atlas (https://cloud.mongodb.com)
2. Create a cluster and get connection string
3. Whitelist Render's IP (or allow all IPs: 0.0.0.0/0)
4. Add connection string to backend environment variables

---

## Part 2: Frontend Deployment (React/Vite)

### Step 1: Prepare Frontend for Production

1. **Create `.env.production`** in `/Crowd/Frontend/`:
   ```
   VITE_API_BASE_URL=https://your-backend-domain.onrender.com
   VITE_SOCKET_URL=https://your-backend-domain.onrender.com
   ```

2. **Update API calls** in your React components to use:
   ```javascript
   const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
   ```

3. **Create `render.yaml`** for static site configuration in `/Crowd/Frontend/`:
   ```yaml
   services:
     - type: web
       name: crowd-management-frontend
       env: static
       buildCommand: npm install && npm run build
       staticPublishPath: ./dist
   ```

4. **Update `vite.config.js`** if needed for build optimization:
   ```javascript
   export default {
     build: {
       outDir: 'dist',
       sourcemap: false,
       minify: 'terser'
     },
     server: {
       proxy: {
         '/api': {
           target: 'http://localhost:5000',
           changeOrigin: true
         }
       }
     }
   }
   ```

### Step 2: Create Render Frontend Static Site

1. Go to Render Dashboard
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `crowd-management-frontend`
   - **Root Directory**: `Crowd/Frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Click **"Create Static Site"**

### Step 3: Set Frontend Environment Variables

1. In Render dashboard, go to frontend service
2. Click **"Environment"** tab
3. Add:
   - `VITE_API_BASE_URL` = `https://your-backend-domain.onrender.com`
   - `VITE_SOCKET_URL` = `https://your-backend-domain.onrender.com`
4. Save and redeploy

---

## Part 3: Connect Frontend to Backend

### Step 1: Update CORS in Backend

Ensure your backend `server.js` has proper CORS:
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
};
app.use(cors(corsOptions));
```

### Step 2: Update Socket.IO Configuration

In `server.js`, update Socket.IO CORS:
```javascript
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});
```

### Step 3: Update Frontend Socket Connection

In your React components using Socket.IO:
```javascript
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

---

## Part 4: Deployment Checklist

### Before Deploying:
- [ ] All sensitive data moved to `.env` files
- [ ] `.gitignore` includes `.env` and `node_modules`
- [ ] MongoDB connection string working
- [ ] All npm dependencies installed locally and tested
- [ ] Frontend build command runs without errors
- [ ] Backend starts without errors

### During Deployment:
- [ ] Push all changes to GitHub
- [ ] Create backend service on Render
- [ ] Set all backend environment variables
- [ ] Wait for backend deployment to complete
- [ ] Create frontend service on Render
- [ ] Set all frontend environment variables
- [ ] Verify both services are live

### After Deployment:
- [ ] Test backend API endpoints
- [ ] Test frontend loads and connects to backend
- [ ] Check browser console for errors
- [ ] Verify WebSocket connections (Socket.IO)
- [ ] Test authentication flows
- [ ] Monitor error logs on Render dashboard

---

## Part 5: Environment Variables Needed

### Backend Environment Variables:
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-key-min-32-chars
FRONTEND_URL=https://your-frontend.onrender.com

# Twilio (if using SMS)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Nodemailer (if using email)
NODEMAILER_EMAIL=your-email@gmail.com
NODEMAILER_PASSWORD=your-app-specific-password
```

### Frontend Environment Variables:
```
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_SOCKET_URL=https://your-backend.onrender.com
```

---

## Troubleshooting

### Backend won't start:
1. Check logs: Render dashboard → Logs
2. Verify all environment variables are set
3. Check MongoDB connection string
4. Ensure `server.js` is in `/Crowd/Backend/`

### Frontend won't load:
1. Check build logs for build errors
2. Verify `npm run build` works locally
3. Confirm `dist` folder is created
4. Clear browser cache and reload

### Frontend can't connect to backend:
1. Check CORS configuration on backend
2. Verify `VITE_API_BASE_URL` is correct
3. Check browser Network tab for failed requests
4. Verify backend is actually running

### WebSocket connection fails:
1. Ensure Socket.IO CORS is configured correctly
2. Backend URL must be HTTPS (Render automatically provides this)
3. Check frontend environment variables

---

## Render Service URLs

Once deployed, you'll get URLs like:
- **Backend**: `https://crowd-management-api.onrender.com`
- **Frontend**: `https://crowd-management-frontend.onrender.com`

Use the backend URL in frontend environment variables.

---

## Next Steps for Production

1. **Enable HTTPS** (Render does this automatically)
2. **Monitor logs** regularly for errors
3. **Setup backups** for MongoDB
4. **Scale services** if traffic increases
5. **Setup CI/CD** for automatic deployments on Git push
6. **Add custom domain** (optional, via Render settings)

---

## Useful Resources

- Render Docs: https://render.com/docs
- Render Node.js Guide: https://render.com/docs/deploy-node
- Render Static Sites: https://render.com/docs/static-sites
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
