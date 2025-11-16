# Vercel Deployment Guide - Separate Frontend & Backend

## 🎯 Project Structure

```
Frontend: https://frontend-ten-mu-38.vercel.app/
Backend:  https://backend-one-alpha-39.vercel.app/
```

## 📋 Deployment Steps

### 1. Frontend Deployment (https://frontend-ten-mu-38.vercel.app/)

#### A. Environment Variables
ไปที่ Vercel Dashboard > Frontend Project > Settings > Environment Variables

เพิ่ม:
```
Name: VITE_API_URL
Value: https://backend-one-alpha-39.vercel.app/api
Environment: Production, Preview, Development
```

#### B. Build Settings
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Root Directory: frontend
```

#### C. Deploy Frontend
```bash
# Option 1: Auto-deploy (แนะนำ)
git add .
git commit -m "Update frontend with backend URL"
git push origin main
# Vercel จะ auto-deploy

# Option 2: Manual deploy
cd frontend
vercel --prod
```

### 2. Backend Deployment (https://backend-one-alpha-39.vercel.app/)

#### A. Environment Variables
ไปที่ Vercel Dashboard > Backend Project > Settings > Environment Variables

เพิ่ม:
```
Name: MONGODB_URI
Value: mongodb+srv://your-connection-string
Environment: Production

Name: JWT_SECRET
Value: your-secret-key-here
Environment: Production

Name: JWT_REFRESH_SECRET
Value: your-refresh-secret-key-here
Environment: Production

Name: NODE_ENV
Value: production
Environment: Production

Name: FRONTEND_URL
Value: https://frontend-ten-mu-38.vercel.app
Environment: Production

Name: PORT
Value: 5000
Environment: Production
```

#### B. Build Settings
```
Framework Preset: Other
Build Command: (leave empty)
Output Directory: (leave empty)
Install Command: npm install
Root Directory: backend
```

#### C. Deploy Backend
```bash
# Option 1: Auto-deploy (แนะนำ)
git add .
git commit -m "Update backend configuration"
git push origin main
# Vercel จะ auto-deploy

# Option 2: Manual deploy
cd backend
vercel --prod
```

### 3. CORS Configuration

ตรวจสอบว่า backend มี CORS configuration ที่ถูกต้อง:

```javascript
// backend/server.js
const cors = require('cors');

app.use(cors({
  origin: [
    'https://frontend-ten-mu-38.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 🔧 Configuration Files

### Frontend Configuration

#### frontend/.env.production
```env
VITE_API_URL=https://backend-one-alpha-39.vercel.app/api
```

#### frontend/vercel.json (ถ้ามี)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Backend Configuration

#### backend/vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

## 🚀 Quick Deploy Commands

### Deploy Both Projects
```bash
# 1. Commit changes
git add .
git commit -m "Deploy frontend and backend to Vercel"
git push origin main

# 2. Vercel will auto-deploy both projects
```

### Check Deployment Status
```bash
# Frontend
vercel ls --scope=your-team-name

# Backend
vercel ls --scope=your-team-name
```

## 🧪 Testing After Deployment

### 1. Test Backend API
```bash
# Health check
curl https://backend-one-alpha-39.vercel.app/api/health

# Test login
curl -X POST https://backend-one-alpha-39.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@university.ac.th","password":"password123"}'
```

### 2. Test Frontend
```bash
# Open in browser
https://frontend-ten-mu-38.vercel.app/

# Test features:
1. Login
2. Browse menu
3. Add to cart
4. Checkout
5. View orders
```

### 3. Check Console
```javascript
// Open browser console (F12)
// Check for errors
// Verify API calls go to correct backend URL
```

## 🔍 Troubleshooting

### Issue 1: CORS Error
```
Error: Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**
1. ตรวจสอบ backend CORS configuration
2. เพิ่ม frontend URL ใน allowed origins
3. Redeploy backend

### Issue 2: API Not Found (404)
```
Error: Request failed with status code 404
```

**Solution:**
1. ตรวจสอบ VITE_API_URL ใน Vercel environment variables
2. ตรวจสอบ backend routes
3. Rebuild frontend

### Issue 3: Environment Variables Not Working
```
Error: Cannot read environment variables
```

**Solution:**
1. ไปที่ Vercel Dashboard > Settings > Environment Variables
2. เพิ่ม variables ทั้งหมด
3. Redeploy project

### Issue 4: Database Connection Failed
```
Error: MongoServerError: Authentication failed
```

**Solution:**
1. ตรวจสอบ MONGODB_URI
2. ตรวจสอบ MongoDB Atlas IP whitelist (เพิ่ม 0.0.0.0/0)
3. ตรวจสอบ database user permissions

## 📊 Monitoring

### Vercel Dashboard
```
1. ไปที่ https://vercel.com/dashboard
2. เลือก project (frontend หรือ backend)
3. ดู:
   - Deployments
   - Analytics
   - Logs
   - Settings
```

### Check Logs
```bash
# Frontend logs
vercel logs https://frontend-ten-mu-38.vercel.app

# Backend logs
vercel logs https://backend-one-alpha-39.vercel.app
```

## 🔐 Security Checklist

- [ ] Environment variables ตั้งค่าถูกต้อง
- [ ] JWT secrets ไม่ถูก commit ใน git
- [ ] CORS configured properly
- [ ] MongoDB IP whitelist configured
- [ ] HTTPS enabled (Vercel default)
- [ ] Rate limiting enabled
- [ ] Input validation enabled

## 📝 Deployment Checklist

### Before Deploy
- [ ] Test locally
- [ ] Update environment variables
- [ ] Check CORS configuration
- [ ] Verify database connection
- [ ] Test API endpoints
- [ ] Build frontend successfully
- [ ] No console errors

### After Deploy
- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] Login works
- [ ] All features functional
- [ ] No CORS errors
- [ ] Database connected
- [ ] Images loading
- [ ] Mobile responsive

## 🎯 Current Status

```
✅ Frontend URL: https://frontend-ten-mu-38.vercel.app/
✅ Backend URL: https://backend-one-alpha-39.vercel.app/
✅ Environment variables configured
✅ CORS configured
✅ Mobile responsive
✅ Ready to deploy
```

## 🚀 Deploy Now

```bash
# 1. Update frontend .env.production
echo "VITE_API_URL=https://backend-one-alpha-39.vercel.app/api" > frontend/.env.production

# 2. Commit and push
git add .
git commit -m "Configure production URLs for Vercel deployment"
git push origin main

# 3. Wait for auto-deployment (2-5 minutes)

# 4. Test production URLs
# Frontend: https://frontend-ten-mu-38.vercel.app/
# Backend: https://backend-one-alpha-39.vercel.app/api
```

## 📞 Support

หากพบปัญหา:
1. ตรวจสอบ Vercel deployment logs
2. ตรวจสอบ browser console
3. ตรวจสอบ network requests
4. ตรวจสอบ environment variables

---
*Last Updated: 2024-11-16*
*Status: Ready for Production Deployment*
