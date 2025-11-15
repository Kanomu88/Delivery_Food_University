# 📋 ขั้นตอนการ Deploy (ทำตามลำดับ)

## ✅ สิ่งที่เตรียมไว้แล้ว

1. ✅ Frontend แก้ไข URL ชี้ไปที่ `https://university-canteen-backend.vercel.app/api`
2. ✅ โค้ด Report API พร้อมใช้งานในไฟล์ `REPORT_API_CODE.js`

## 🚀 ขั้นตอนที่ 1: อัพเดต Backend

### วิธีที่ 1: ผ่าน Vercel Dashboard (แนะนำ)

1. ไปที่ https://vercel.com/esp32s-projects/university-canteen-backend
2. คลิก "Settings" → "Git"
3. ดู Git Repository ที่เชื่อมต่ออยู่
4. ไปที่ repository นั้น
5. แก้ไขไฟล์ `api/index.js` หรือ `index.js` (ขึ้นอยู่กับโครงสร้าง)
6. คัดลอกโค้ดจากไฟล์ `REPORT_API_CODE.js` ในโปรเจคนี้
7. วางก่อน `export default app;`
8. Commit และ Push
9. Vercel จะ auto-deploy ให้อัตโนมัติ

### วิธีที่ 2: ผ่าน Vercel CLI

ถ้าคุณมี backend project อยู่ใน local:

```bash
# ไปที่ backend project
cd path/to/backend-project

# แก้ไขไฟล์ api/index.js หรือ index.js
# คัดลอกโค้ดจาก REPORT_API_CODE.js ไปใส่

# Commit
git add .
git commit -m "Add report API endpoints"
git push origin main

# หรือ deploy ด้วย Vercel CLI
vercel --prod
```

## 🚀 ขั้นตอนที่ 2: Deploy Frontend

หลังจาก backend พร้อมแล้ว (รอ 1-2 นาที):

```bash
# ใน project นี้
git push origin main
vercel --prod
```

## 🧪 ขั้นตอนที่ 3: ทดสอบ

### 1. ทดสอบ Backend API
```bash
# Test health check
curl https://university-canteen-backend.vercel.app/

# ควรได้ response:
# {"message":"University Canteen Backend API","status":"running","version":"1.0.0"}
```

### 2. ทดสอบ Vendor Reports
```
URL: https://university-canteen-ordering-system.vercel.app/vendor/reports
Login: vendor1@test.com / password123
คลิกปุ่ม "📊 ขอรายงานจากแอดมิน"
```

### 3. ทดสอบ Admin Reports
```
URL: https://university-canteen-ordering-system.vercel.app/admin/reports
Login: admin@test.com / admin123
ดูรายการคำขอและสร้างรายงาน
```

## ⚠️ หมายเหตุสำคัญ

1. **ต้องอัพเดต Backend ก่อน** แล้วค่อย deploy frontend
2. ถ้า backend ยังไม่พร้อม frontend จะ error 404
3. รอ 1-2 นาทีหลัง deploy backend ให้ Vercel propagate
4. ถ้ายังไม่ทำงาน ลอง clear cache: Ctrl + Shift + R

## 📝 Checklist

- [ ] คัดลอกโค้ดจาก `REPORT_API_CODE.js`
- [ ] ไปที่ backend project
- [ ] แก้ไขไฟล์ `api/index.js` หรือ `index.js`
- [ ] วางโค้ดก่อน `export default app;`
- [ ] Commit และ Push backend
- [ ] รอ backend deploy เสร็จ (1-2 นาที)
- [ ] Push frontend: `git push origin main`
- [ ] Deploy frontend: `vercel --prod`
- [ ] ทดสอบระบบ

## 🆘 ถ้ามีปัญหา

### Backend ไม่มี Git Repository
- Deploy ผ่าน Vercel CLI โดยตรง
- หรือสร้าง Git repo ใหม่และเชื่อมต่อกับ Vercel

### ไม่แน่ใจว่า Backend อยู่ที่ไหน
1. ไปที่ https://vercel.com/esp32s-projects/university-canteen-backend
2. คลิก "Settings" → "Git"
3. จะเห็น Git Repository URL

### Frontend ยัง Error 404
- ตรวจสอบว่า backend deploy เสร็จแล้ว
- ลองเรียก API โดยตรง: `curl https://university-canteen-backend.vercel.app/api/reports/vendors`
- ถ้ายัง 404 แสดงว่า backend ยังไม่มี endpoint นี้

## ✨ เมื่อเสร็จแล้ว

ระบบรายงานจะทำงานได้เต็มรูปแบบ:
- ✅ Vendor ขอรายงานได้
- ✅ Admin ดูรายการคำขอได้
- ✅ Admin สร้างรายงานได้
- ✅ Admin แก้ไขรายงานได้
- ✅ Admin ส่งออก PDF/Text ได้
