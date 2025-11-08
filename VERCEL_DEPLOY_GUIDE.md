# 🚀 คู่มือ Deploy University Canteen Ordering System บน Vercel

## ✅ สิ่งที่เตรียมไว้ให้แล้ว

1. ✅ `vercel.json` - Configuration สำหรับ Vercel
2. ✅ `api/index.js` - Serverless API handler
3. ✅ `.env` - Environment variables (root level)
4. ✅ `frontend/.env.production` - Frontend production config
5. ✅ `.vercelignore` - ไฟล์ที่ไม่ต้อง upload

## 📋 ขั้นตอนการ Deploy (3 ขั้นตอนง่ายๆ)

### ขั้นตอนที่ 1: ติดตั้ง Vercel CLI

```bash
npm install -g vercel
```

### ขั้นตอนที่ 2: Login เข้า Vercel

```bash
vercel login
```

เลือกวิธี login ที่คุณต้องการ (GitHub, GitLab, Bitbucket, หรือ Email)

### ขั้นตอนที่ 3: Deploy โปรเจค

```bash
# Deploy แบบ preview ก่อน (ทดสอบ)
vercel

# หรือ Deploy production เลย
vercel --prod
```

เมื่อรันคำสั่ง `vercel` ครั้งแรก จะถามคำถาม:
- **Set up and deploy?** → Yes
- **Which scope?** → เลือก account ของคุณ
- **Link to existing project?** → No
- **What's your project's name?** → university-canteen-ordering-system (หรือชื่อที่คุณต้องการ)
- **In which directory is your code located?** → ./ (กด Enter)

## 🔧 ตั้งค่า Environment Variables (สำคัญ!)

หลังจาก deploy ครั้งแรกเสร็จ ให้ไปที่:

**Vercel Dashboard** → **Project** → **Settings** → **Environment Variables**

เพิ่ม variables เหล่านี้:

### สำหรับ Production:
```
MONGODB_URI = mongodb+srv://jackeiei101_db_user:1234@deliveryfood.ntp7snv.mongodb.net/DeliveryFood?retryWrites=true&w=majority
JWT_SECRET = university-canteen-production-secret-key-2024-change-this
JWT_REFRESH_SECRET = university-canteen-refresh-secret-key-2024-change-this
JWT_EXPIRE = 15m
JWT_REFRESH_EXPIRE = 7d
NODE_ENV = production
```

**หมายเหตุ**: แนะนำให้เปลี่ยน JWT_SECRET และ JWT_REFRESH_SECRET เป็นค่าที่ปลอดภัยกว่านี้

### หลังจากตั้งค่า Environment Variables แล้ว:

```bash
# Redeploy เพื่อให้ environment variables มีผล
vercel --prod
```

## 🌐 URL ที่จะได้

หลัง deploy สำเร็จ คุณจะได้:
- **Production URL**: `https://university-canteen-ordering-system.vercel.app`
- **API Endpoint**: `https://university-canteen-ordering-system.vercel.app/api`

## ✅ ตรวจสอบหลัง Deploy

1. เปิด URL ที่ได้ → ควรเห็นหน้า Home Page
2. ทดสอบ API: `https://your-project.vercel.app/api` → ควรได้ JSON response
3. ทดสอบ Login/Register
4. ทดสอบดูเมนู
5. ทดสอบสั่งอาหาร

## 🔍 ดู Logs และ Debug

```bash
# ดู deployment logs
vercel logs

# ดูรายการ deployments ทั้งหมด
vercel ls

# ดู environment variables
vercel env ls
```

หรือดูใน Vercel Dashboard:
**Deployments** → เลือก deployment → **Logs**

## ⚠️ ข้อจำกัดของ Vercel Serverless

1. **Socket.io**: Vercel ไม่รองรับ WebSocket แบบ persistent connections
   - Real-time notifications จะไม่ทำงาน
   - แนะนำใช้ polling หรือ deploy backend แยกไปที่ Railway/Render

2. **File Uploads**: Serverless functions มีข้อจำกัด file storage
   - รูปภาพที่ upload จะหายเมื่อ function restart
   - แนะนำใช้ Cloudinary หรือ AWS S3

3. **Cold Start**: ครั้งแรกที่เรียก API อาจช้า 1-2 วินาที

## 🎯 Alternative: Deploy แบบแยกส่วน (แนะนำสำหรับ Production จริง)

### Frontend → Vercel
```bash
cd frontend
vercel --prod
```

### Backend → Railway (รองรับ Socket.io และ File Upload)

1. ไปที่ [Railway.app](https://railway.app)
2. Sign up ด้วย GitHub
3. **New Project** → **Deploy from GitHub repo**
4. เลือก repository นี้
5. เลือก **backend** folder
6. ตั้งค่า Environment Variables เหมือนด้านบน
7. Deploy!

จากนั้นอัพเดท `VITE_API_URL` ใน frontend:
```
VITE_API_URL=https://your-backend.railway.app/api
```

## 📞 คำสั่งที่เป็นประโยชน์

```bash
# Deploy production
vercel --prod

# Deploy preview (ทดสอบก่อน)
vercel

# ดู logs แบบ real-time
vercel logs --follow

# ลบ deployment
vercel rm [deployment-url]

# เปิด project ใน browser
vercel open

# ดูข้อมูล project
vercel inspect
```

## 🎉 เสร็จแล้ว!

หลังจาก deploy สำเร็จ คุณจะได้:
- ✅ Website ที่ใช้งานได้จริง
- ✅ API ที่ทำงานบน Vercel
- ✅ Database เชื่อมต่อกับ MongoDB Atlas
- ✅ HTTPS ฟรีจาก Vercel
- ✅ Auto-deploy เมื่อ push code ใหม่ (ถ้าเชื่อม GitHub)

## 🆘 แก้ปัญหา

### ปัญหา: API ไม่ทำงาน
- ตรวจสอบ Environment Variables ใน Vercel Dashboard
- ดู logs: `vercel logs`
- ตรวจสอบว่า MongoDB Atlas whitelist IP 0.0.0.0/0

### ปัญหา: Frontend ไม่เชื่อมต่อ Backend
- ตรวจสอบ `VITE_API_URL` ใน frontend/.env.production
- ตรวจสอบ CORS settings ใน backend

### ปัญหา: Build failed
- ตรวจสอบ dependencies ใน package.json
- ลอง build local ก่อน: `npm run build`
- ดู build logs ใน Vercel Dashboard

---

**หมายเหตุ**: ไฟล์นี้มีข้อมูลครบถ้วนสำหรับการ deploy แล้ว คุณสามารถเริ่ม deploy ได้เลย! 🚀
