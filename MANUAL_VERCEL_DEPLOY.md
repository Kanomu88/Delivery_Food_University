    # Manual Vercel Deployment Guide

## 🚀 Deploy ด้วย Vercel CLI

### ขั้นตอนที่ 1: Login Vercel

```bash
vercel login
```

เลือกวิธี login:
- Email
- GitHub
- GitLab
- Bitbucket

### ขั้นตอนที่ 2: Deploy Frontend

```bash
# ไปที่ folder frontend
cd frontend

# Deploy to production
vercel --prod

# ตอบคำถาม:
# ? Set up and deploy "frontend"? [Y/n] Y
# ? Which scope do you want to deploy to? [เลือก account ของคุณ]
# ? Link to existing project? [Y/n] Y
# ? What's the name of your existing project? frontend-ten-mu-38
# ? In which directory is your code located? ./
```

### ขั้นตอนที่ 3: Deploy Backend

```bash
# กลับไป root และไปที่ folder backend
cd ..
cd backend

# Deploy to production
vercel --prod

# ตอบคำถาม:
# ? Set up and deploy "backend"? [Y/n] Y
# ? Which scope do you want to deploy to? [เลือก account ของคุณ]
# ? Link to existing project? [Y/n] Y
# ? What's the name of your existing project? backend-one-alpha-39
# ? In which directory is your code located? ./
```

### ขั้นตอนที่ 4: ตรวจสอบ Environment Variables

#### Frontend Environment Variables
ไปที่ Vercel Dashboard > frontend-ten-mu-38 > Settings > Environment Variables

ตรวจสอบว่ามี:
```
VITE_API_URL=https://backend-one-alpha-39.vercel.app/api
```

#### Backend Environment Variables
ไปที่ Vercel Dashboard > backend-one-alpha-39 > Settings > Environment Variables

ตรวจสอบว่ามี:
```
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=production
FRONTEND_URL=https://frontend-ten-mu-38.vercel.app
PORT=5000
```

### ขั้นตอนที่ 5: Redeploy หลังตั้งค่า Environment Variables

```bash
# Frontend
cd frontend
vercel --prod

# Backend
cd ../backend
vercel --prod
```

## 🔧 คำสั่งที่ใช้บ่อย

### ดู Deployments
```bash
vercel ls
```

### ดู Logs
```bash
# Frontend logs
vercel logs https://frontend-ten-mu-38.vercel.app

# Backend logs
vercel logs https://backend-one-alpha-39.vercel.app
```

### ลบ Deployment
```bash
vercel rm [deployment-url]
```

### ดู Project Info
```bash
vercel inspect [deployment-url]
```

## 📋 Deployment Checklist

### ก่อน Deploy
- [x] Vercel CLI ติดตั้งแล้ว
- [x] Login Vercel แล้ว
- [x] Frontend build สำเร็จ
- [x] Backend configuration ถูกต้อง
- [x] Environment variables พร้อม

### หลัง Deploy
- [ ] Frontend accessible
- [ ] Backend API responding
- [ ] CORS working
- [ ] Database connected
- [ ] Test login
- [ ] Test all features

## 🎯 URLs

```
Frontend: https://frontend-ten-mu-38.vercel.app/
Backend:  https://backend-one-alpha-39.vercel.app/
API:      https://backend-one-alpha-39.vercel.app/api
```

## 🧪 Testing

### Test Backend API
```bash
curl https://backend-one-alpha-39.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@university.ac.th","password":"password123"}'
```

### Test Frontend
เปิดเบราว์เซอร์:
```
https://frontend-ten-mu-38.vercel.app/
```

## 🔍 Troubleshooting

### ปัญหา: Cannot find project
**วิธีแก้:**
```bash
# Link project manually
vercel link
```

### ปัญหา: Build failed
**วิธีแก้:**
```bash
# Check build locally first
npm run build

# Then deploy
vercel --prod
```

### ปัญหา: Environment variables not working
**วิธีแก้:**
1. ไปที่ Vercel Dashboard
2. Settings > Environment Variables
3. เพิ่ม/แก้ไข variables
4. Redeploy

---
*Last Updated: 2024-11-16*
