# 🗑️ วิธีลบ Vercel Projects ที่ไม่ใช้

## Projects ที่ต้องลบ:

### 1. university-canteen-frontend
```
https://vercel.com/esp32s-projects/university-canteen-frontend
```

### 2. frontend
```
https://vercel.com/esp32s-projects/frontend
```

## ✅ Projects ที่ใช้งาน (ห้ามลบ):

### 1. university-canteen-ordering-system (Frontend)
```
https://vercel.com/esp32s-projects/university-canteen-ordering-system
```

### 2. university-canteen-backend (Backend)
```
https://vercel.com/esp32s-projects/university-canteen-backend
```

---

## 🗑️ วิธีลบ Projects:

### ขั้นตอนที่ 1: ลบ university-canteen-frontend

1. **เปิดลิงก์**:
   ```
   https://vercel.com/esp32s-projects/university-canteen-frontend/settings
   ```

2. **Scroll ลงไปด้านล่างสุด**

3. **หา section "Delete Project"**

4. **คลิกปุ่ม "Delete"**

5. **พิมพ์ชื่อ project เพื่อยืนยัน**: `university-canteen-frontend`

6. **คลิก "Delete"** อีกครั้ง

### ขั้นตอนที่ 2: ลบ frontend

1. **เปิดลิงก์**:
   ```
   https://vercel.com/esp32s-projects/frontend/settings
   ```

2. **Scroll ลงไปด้านล่างสุด**

3. **หา section "Delete Project"**

4. **คลิกปุ่ม "Delete"**

5. **พิมพ์ชื่อ project เพื่อยืนยัน**: `frontend`

6. **คลิก "Delete"** อีกครั้ง

---

## ⚠️ คำเตือน:

### ห้ามลบ Projects เหล่านี้:
- ❌ **university-canteen-ordering-system** (Frontend ที่ใช้งาน)
- ❌ **university-canteen-backend** (Backend ที่ใช้งาน)

### ลบได้:
- ✅ **university-canteen-frontend** (ไม่ใช้แล้ว)
- ✅ **frontend** (ไม่ใช้แล้ว)

---

## 📊 หลังจากลบแล้ว:

คุณจะมีเพียง 2 projects:

### 1. Frontend (Production)
- **Project**: university-canteen-ordering-system
- **URL**: https://university-canteen-ordering-system.vercel.app
- **Dashboard**: https://vercel.com/esp32s-projects/university-canteen-ordering-system

### 2. Backend (Production)
- **Project**: university-canteen-backend
- **URL**: https://university-canteen-backend.vercel.app
- **Dashboard**: https://vercel.com/esp32s-projects/university-canteen-backend

---

## 💡 ทำไมต้องลบ?

### ปัญหาของ Projects ที่ไม่ใช้:
- 🔴 สับสน - มีหลาย projects ที่ชื่อคล้ายกัน
- 🔴 Deploy ผิด project - อาจจะ deploy ไปยัง project ที่ไม่ใช้
- 🔴 เสียทรัพยากร - ใช้ quota ของ Vercel โดยไม่จำเป็น

### ประโยชน์หลังจากลบ:
- ✅ ชัดเจน - มีเพียง 2 projects ที่ใช้งาน
- ✅ ไม่สับสน - รู้ว่าต้อง deploy ไปที่ไหน
- ✅ ประหยัด - ไม่เสียทรัพยากรโดยไม่จำเป็น

---

## 🎯 Checklist:

### ก่อนลบ:
- [ ] ตรวจสอบว่า university-canteen-ordering-system ทำงานปกติ
- [ ] ตรวจสอบว่า university-canteen-backend ทำงานปกติ
- [ ] แน่ใจว่าจะลบ projects ที่ถูกต้อง

### ขณะลบ:
- [ ] ลบ university-canteen-frontend
- [ ] ลบ frontend
- [ ] ตรวจสอบว่าลบสำเร็จ

### หลังลบ:
- [ ] ตรวจสอบว่ามีเพียง 2 projects เหลืออยู่
- [ ] ทดสอบ frontend ยังทำงานปกติ
- [ ] ทดสอบ backend ยังทำงานปกติ

---

**สร้างเมื่อ**: ${new Date().toLocaleString('th-TH')}
**Projects ที่ต้องลบ**: 2 projects
**Projects ที่เหลือ**: 2 projects
**Action Required**: ลบ projects ที่ไม่ใช้ใน Vercel Dashboard

**หมายเหตุ**: การลบ project ไม่สามารถย้อนกลับได้ กรุณาตรวจสอบให้แน่ใจก่อนลบ
