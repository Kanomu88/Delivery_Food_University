# การ Deploy ไปยัง Vercel

## ขั้นตอนการ Deploy

### 1. เตรียม Vercel CLI
```bash
npm install -g vercel
```

### 2. Login เข้า Vercel
```bash
vercel login
```

### 3. Deploy โปรเจค
```bash
vercel
```

หรือ deploy แบบ production ทันที:
```bash
vercel --prod
```

### 4. ตั้งค่า Environment Variables บน Vercel

ไปที่ Vercel Dashboard → Project Settings → Environment Variables และเพิ่ม:

#### Backend Variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key สำหรับ JWT
- `JWT_EXPIRE` - เวลาหมดอายุของ token (เช่น 7d)
- `NODE_ENV` - production
- `PORT` - 5000

#### Frontend Variables:
- `VITE_API_URL` - URL ของ backend API (เช่น https://your-project.vercel.app/api)

### 5. Redeploy หลังตั้งค่า Environment Variables
```bash
vercel --prod
```

## โครงสร้างการ Deploy

โปรเจคนี้จะถูก deploy แบบ monorepo:
- **Frontend**: Static site (React + Vite) → `/`
- **Backend**: Serverless functions (Node.js + Express) → `/api/*`

## หมายเหตุสำคัญ

1. **MongoDB Atlas**: ตรวจสอบว่า IP ของ Vercel ถูก whitelist ใน MongoDB Atlas (แนะนำให้เปิด 0.0.0.0/0 สำหรับ production)

2. **File Uploads**: Vercel serverless functions มีข้อจำกัดเรื่อง file storage ถ้าต้องการ upload รูปภาพ แนะนำให้ใช้:
   - Cloudinary
   - AWS S3
   - Vercel Blob Storage

3. **WebSocket (Socket.io)**: Vercel serverless functions ไม่รองรับ WebSocket แบบ persistent connections ถ้าต้องการ real-time features แนะนำให้:
   - Deploy backend แยกไปที่ Railway, Render, หรือ Heroku
   - ใช้ Vercel Edge Functions
   - ใช้ Pusher หรือ Ably แทน Socket.io

4. **Cold Start**: Serverless functions อาจมี cold start delay ครั้งแรกที่เรียกใช้

## Alternative: Deploy แยกส่วน

### Frontend Only (แนะนำ)
```bash
cd frontend
vercel
```

### Backend แยกไปที่ Railway/Render
1. สร้าง account ที่ Railway.app หรือ Render.com
2. Connect GitHub repository
3. เลือก backend folder
4. ตั้งค่า environment variables
5. Deploy

จากนั้นอัพเดท `VITE_API_URL` ใน frontend ให้ชี้ไปที่ backend URL ใหม่

## คำสั่งที่เป็นประโยชน์

```bash
# ดู deployment logs
vercel logs

# ดูรายการ deployments
vercel ls

# ลบ deployment
vercel rm [deployment-url]

# ดู environment variables
vercel env ls

# เพิ่ม environment variable
vercel env add [name]
```

## ตรวจสอบหลัง Deploy

- ✅ Frontend โหลดได้ปกติ
- ✅ API endpoints ทำงานได้
- ✅ Authentication ทำงานได้
- ✅ Database connection สำเร็จ
- ✅ CORS settings ถูกต้อง
- ✅ Environment variables ครบถ้วน

## Support

หากมีปัญหาในการ deploy สามารถดู logs ได้ที่:
- Vercel Dashboard → Deployments → [เลือก deployment] → Logs
- หรือใช้คำสั่ง `vercel logs`
