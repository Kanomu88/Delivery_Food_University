# 🚀 คู่มือ Redeploy Vercel

คู่มือนี้สำหรับ redeploy ทั้ง backend และ frontend บน Vercel

## 📋 ข้อกำหนดเบื้องต้น

1. ติดตั้ง Vercel CLI แล้ว
2. Login Vercel แล้ว (`vercel login`)
3. อยู่ใน project directory

## 🔄 ขั้นตอนการ Redeploy

### วิธีที่ 1: Redeploy ทั้งหมด (แนะนำ)

คัดลอกคำสั่งนี้ไปวางใน Kiro:

```
ตอนนี้ redeploy Vercel ทั้ง backend และ frontend ที
```

Kiro จะทำตามลำดับ:
1. Deploy backend
2. อัปเดต frontend/.env ด้วย backend URL ใหม่
3. Deploy frontend

---

### วิธีที่ 2: Deploy ทีละส่วน (Manual)

#### Step 1: Deploy Backend

```bash
cd backend
vercel --prod --yes
```

**Output ตัวอย่าง:**
```
✅  Production: https://university-canteen-backend-XXXXXX.vercel.app
```

**📝 บันทึก Backend URL ที่ได้**

---

#### Step 2: อัปเดต Frontend Environment

แก้ไขไฟล์ `frontend/.env`:

```env
VITE_API_URL=https://university-canteen-backend-XXXXXX.vercel.app/api
```

⚠️ **สำคัญ:** เปลี่ยน `XXXXXX` เป็น URL จริงจาก Step 1 และต้องมี `/api` ท้าย URL

---

#### Step 3: Deploy Frontend

```bash
cd ..
vercel --prod --yes
```

**Output ตัวอย่าง:**
```
✅  Production: https://university-canteen-ordering-system-XXXXXX.vercel.app
```

---

## 🎯 คำสั่งสำหรับ Kiro (Copy & Paste)

### คำสั่งที่ 1: Deploy Backend
```
ใช้ executePwsh ไปที่ backend แล้วรัน: vercel --prod --yes
```

### คำสั่งที่ 2: อัปเดต Frontend .env
```
อัปเดตไฟล์ frontend/.env ให้ VITE_API_URL ชี้ไปที่ backend URL ใหม่ที่ได้จากการ deploy
```

### คำสั่งที่ 3: Deploy Frontend
```
ใช้ executePwsh รัน: vercel --prod --yes
```

---

## 📊 ตรวจสอบการ Deploy

### ตรวจสอบ Backend
```bash
curl https://university-canteen-backend-XXXXXX.vercel.app/api
```

ควรได้ response:
```json
{
  "message": "University Canteen Backend API",
  "status": "running",
  "version": "1.0.0"
}
```

### ตรวจสอบ Frontend
เปิดเว็บไซต์: `https://university-canteen-ordering-system-XXXXXX.vercel.app`

---

## 🔧 Troubleshooting

### ปัญหา: Backend 404
**สาเหตุ:** API endpoint ไม่ถูกต้อง

**แก้ไข:**
1. ตรวจสอบ `backend/api/index.js` มี endpoints ครบ
2. ตรวจสอบ `backend/vercel.json` config ถูกต้อง

### ปัญหา: Frontend ไม่เชื่อมต่อ Backend
**สาเหตุ:** `frontend/.env` ไม่ถูกต้อง

**แก้ไข:**
1. ตรวจสอบ `VITE_API_URL` ใน `frontend/.env`
2. ต้องมี `/api` ท้าย URL
3. Redeploy frontend อีกครั้ง

### ปัญหา: 401 Unauthorized
**สาเหตุ:** Token หมดอายุ

**แก้ไข:**
1. Logout และ Login ใหม่
2. Clear localStorage
3. ลองอีกครั้ง

---

## 📝 URLs ปัจจุบัน

**Backend:**
- Production: https://university-canteen-backend-gkyxxp1e1-esp32s-projects.vercel.app
- Dashboard: https://vercel.com/esp32s-projects/university-canteen-backend

**Frontend:**
- Production: https://university-canteen-ordering-system-ljvceohzd-esp32s-projects.vercel.app
- Dashboard: https://vercel.com/esp32s-projects/university-canteen-ordering-system

---

## 🎨 คำสั่งเดียวสำหรับ Kiro

คัดลอกข้อความนี้ส่งให้ Kiro:

```
ทำตามขั้นตอนนี้:
1. Deploy backend: cd backend && vercel --prod --yes
2. บันทึก backend URL ที่ได้
3. อัปเดต frontend/.env ให้ VITE_API_URL ชี้ไปที่ backend URL ใหม่ (ต้องมี /api ท้าย)
4. Deploy frontend: cd .. && vercel --prod --yes
5. แสดง URLs ทั้งสองให้ฉัน
```

---

## ✅ Checklist หลัง Deploy

- [ ] Backend API ตอบสนอง (curl test)
- [ ] Frontend เปิดได้
- [ ] Login ได้
- [ ] สั่งอาหารได้
- [ ] ชำระเงินได้
- [ ] Vendor dashboard ทำงาน
- [ ] Admin dashboard ทำงาน

---

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ Vercel Dashboard
2. ดู logs ใน Vercel
3. ตรวจสอบ browser console
4. ตรวจสอบ network tab

---

**อัปเดตล่าสุด:** 2024-11-09
**Version:** 1.0.0
