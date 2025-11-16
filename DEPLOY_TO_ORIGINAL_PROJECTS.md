# Deploy to Original Vercel Projects

## 🎯 Target URLs
```
Frontend: https://frontend-ten-mu-38.vercel.app
Backend:  https://backend-one-alpha-39.vercel.app
```

## 📝 ขั้นตอนการ Deploy

### Option 1: Deploy ผ่าน Vercel Dashboard (แนะนำ)

#### Frontend
1. ไปที่ https://vercel.com/dashboard
2. เลือก project **frontend-ten-mu-38**
3. ไปที่ tab **Deployments**
4. คลิก **Redeploy** บน deployment ล่าสุด
5. หรือคลิก **Deploy** เพื่อ deploy จาก GitHub branch ล่าสุด

#### Backend
1. ไปที่ https://vercel.com/dashboard
2. เลือก project **backend-one-alpha-39**
3. ไปที่ tab **Deployments**
4. คลิก **Redeploy** บน deployment ล่าสุด

### Option 2: Deploy ผ่าน Vercel CLI

#### ขั้นตอนที่ 1: Link Projects

```bash
# Frontend
cd frontend
vercel link
# เลือก project: frontend-ten-mu-38

# Backend
cd ../backend
vercel link
# เลือก project: backend-one-alpha-39
```

#### ขั้นตอนที่ 2: Deploy

```bash
# Deploy Frontend
cd frontend
vercel --prod

# Deploy Backend
cd ../backend
vercel --prod
```

### Option 3: Auto-Deploy จาก GitHub

ถ้าคุณได้เชื่อมต่อ Vercel กับ GitHub repository แล้ว:

1. Vercel จะ auto-deploy เมื่อคุณ push ไปยัง main branch
2. รอ 2-5 นาที
3. ตรวจสอบ deployment status ใน Vercel Dashboard

## ⚙️ Environment Variables

### Frontend Environment Variables

ไปที่ Vercel Dashboard > frontend-ten-mu-38 > Settings > Environment Variables

ตรวจสอบว่ามี:
```
Name: VITE_API_URL
Value: https://backend-one-alpha-39.vercel.app/api
Environment: Production, Preview, Development
```

### Backend Environment Variables

ไปที่ Vercel Dashboard > backend-one-alpha-39 > Settings > Environment Variables

ตรวจสอบว่ามี:
```
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=production
FRONTEND_URL=https://frontend-ten-mu-38.vercel.app
CLIENT_URL=https://frontend-ten-mu-38.vercel.app
PORT=5000
```

## 🔧 CORS Configuration

Backend ได้รับการอัพเดทให้รองรับ frontend URL แล้ว:

```javascript
// backend/server.js
const corsOptions = {
  origin: [
    'https://frontend-ten-mu-38.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## 🧪 Testing After Deployment

### 1. Test Backend
```bash
curl https://backend-one-alpha-39.vercel.app/
```

### 2. Test Frontend
เปิดเบราว์เซอร์:
```
https://frontend-ten-mu-38.vercel.app
```

### 3. Test Login
1. ไปที่ https://frontend-ten-mu-38.vercel.app/login
2. Login ด้วย:
   ```
   Email: admin@university.ac.th
   Password: password123
   ```
3. ✅ ควร login สำเร็จ ไม่มี CORS error

## 📊 Deployment Checklist

### Before Deploy
- [x] Code committed to GitHub
- [x] Environment variables updated
- [x] CORS configuration updated
- [x] Frontend build successful

### After Deploy
- [ ] Frontend accessible
- [ ] Backend API responding
- [ ] Login works
- [ ] No CORS errors
- [ ] Mobile menu works
- [ ] All features functional

## 🔍 Troubleshooting

### ถ้ายังมี CORS Error

#### 1. ตรวจสอบ Backend Deployment
```bash
# ตรวจสอบว่า backend deploy แล้ว
curl https://backend-one-alpha-39.vercel.app/
```

#### 2. ตรวจสอบ Environment Variables
- ไปที่ Vercel Dashboard
- Settings > Environment Variables
- ตรวจสอบว่า VITE_API_URL ถูกต้อง

#### 3. Hard Refresh Browser
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

#### 4. Clear Browser Cache
```
Ctrl + Shift + Delete
```

### ถ้า Deploy ไม่สำเร็จ

#### 1. ตรวจสอบ Build Logs
- ไปที่ Vercel Dashboard
- เลือก Deployment
- ดู Build Logs

#### 2. ตรวจสอบ vercel.json
```json
// frontend/vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}

// backend/vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ]
}
```

## ✨ Summary

การ deploy ไปยัง projects เดิม:

1. ✅ Code อัพเดทแล้ว
2. ✅ Environment variables ถูกต้อง
3. ✅ CORS configuration อัพเดทแล้ว
4. ⏳ รอ deploy ผ่าน Vercel Dashboard หรือ CLI
5. ⏳ Test หลัง deploy

**Next Steps:**
1. Deploy frontend ไปยัง frontend-ten-mu-38
2. Deploy backend ไปยัง backend-one-alpha-39
3. Test login และ features ทั้งหมด

---
*Updated: 2024-11-16*
*Status: Ready to Deploy*
