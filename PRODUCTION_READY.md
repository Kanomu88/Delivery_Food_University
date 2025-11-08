# 🚀 University Canteen Ordering System - Production Deployment

## ✅ สถานะปัจจุบัน

**Frontend บน Vercel**: ✅ Deploy สำเร็จแล้ว!
- **URL**: https://university-canteen-ordering-system.vercel.app
- **Status**: Ready และใช้งานได้

**Backend**: ⚠️ ต้อง deploy แยกต่างหาก (แนะนำ Railway หรือ Render)

## 🎯 ทำไมต้อง Deploy แยก?

Vercel Serverless Functions มีข้อจำกัด:
1. ❌ ไม่รองรับ WebSocket (Socket.io) แบบ persistent connections
2. ❌ File uploads จะหายเมื่อ function restart
3. ❌ Cold start delay ทุกครั้งที่เรียก API

**Railway/Render** รองรับ:
1. ✅ WebSocket และ Socket.io
2. ✅ File storage ถาวร
3. ✅ Always-on server (ไม่มี cold start)
4. ✅ Free tier ที่ใช้งานได้จริง

## 📦 ขั้นตอนการ Deploy Backend ไป Railway (แนะนำ)

### 1. สร้าง Account ที่ Railway

ไปที่ [railway.app](https://railway.app) และ Sign up ด้วย GitHub

### 2. Deploy Backend

```bash
# ติดตั้ง Railway CLI
npm install -g @railway/cli

# Login
railway login

# สร้างโปรเจคใหม่
railway init

# Deploy backend
cd backend
railway up
```

หรือใช้ Web Interface:
1. ไปที่ Railway Dashboard
2. คลิก **New Project**
3. เลือก **Deploy from GitHub repo**
4. เลือก repository นี้
5. เลือก **backend** folder เป็น root directory
6. ตั้งค่า Environment Variables (ด้านล่าง)
7. Deploy!

### 3. ตั้งค่า Environment Variables บน Railway

```
MONGODB_URI=mongodb+srv://jackeiei101_db_user:1234@deliveryfood.ntp7snv.mongodb.net/DeliveryFood?retryWrites=true&w=majority
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_REFRESH_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
NODE_ENV=production
PORT=5000
CLIENT_URL=https://university-canteen-ordering-system.vercel.app
```

### 4. อัพเดท Frontend ให้เชื่อมต่อ Backend ใหม่

แก้ไขไฟล์ `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-url.railway.app/api
```

จากนั้น redeploy frontend:

```bash
vercel --prod
```

## 🎉 เสร็จแล้ว!

หลังจากทำตามขั้นตอนข้างต้น คุณจะได้:

- ✅ **Frontend**: https://university-canteen-ordering-system.vercel.app
- ✅ **Backend**: https://your-backend.railway.app
- ✅ **Database**: MongoDB Atlas (เชื่อมต่ออยู่แล้ว)
- ✅ **Real-time**: Socket.io ทำงานได้
- ✅ **File Upload**: ทำงานได้ปกติ

## 🔗 URLs ที่สำคัญ

### Frontend (Vercel)
- **Production**: https://university-canteen-ordering-system.vercel.app
- **Dashboard**: https://vercel.com/esp32s-projects/university-canteen-ordering-system

### Backend (ต้อง Deploy เอง)
- **Railway**: https://railway.app
- **Render**: https://render.com

## 📝 Alternative: Deploy ทั้งหมดบน Railway

ถ้าต้องการ deploy ทั้ง frontend และ backend บน Railway:

1. สร้าง 2 services:
   - Service 1: Backend (Node.js)
   - Service 2: Frontend (Static Site)

2. ตั้งค่า Build Command สำหรับ Frontend:
   ```
   cd frontend && npm install && npm run build
   ```

3. ตั้งค่า Start Command:
   - Backend: `npm start`
   - Frontend: ใช้ static file server

## 🆘 ต้องการความช่วยเหลือ?

### ตรวจสอบ Frontend
```bash
# เปิดใน browser
start https://university-canteen-ordering-system.vercel.app

# ดู logs
vercel logs https://university-canteen-ordering-system.vercel.app
```

### ตรวจสอบ Backend (หลัง deploy บน Railway)
```bash
# ดู logs
railway logs

# เปิด dashboard
railway open
```

## 📊 สรุป

| Component | Platform | Status | URL |
|-----------|----------|--------|-----|
| Frontend | Vercel | ✅ Ready | https://university-canteen-ordering-system.vercel.app |
| Backend | ⚠️ ต้อง Deploy | Pending | - |
| Database | MongoDB Atlas | ✅ Ready | Connected |

---

**หมายเหตุ**: Frontend deploy สำเร็จแล้วและพร้อมใช้งาน แต่ต้อง deploy backend แยกเพื่อให้ระบบทำงานได้เต็มรูปแบบ
