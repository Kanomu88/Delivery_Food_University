# ปัญหา Admin Vendors API ส่งข้อมูลผิด

## ปัญหาที่พบ

API `/api/admin/vendors` ส่ง **User data** มาแทนที่จะเป็น **Vendor data**

### ที่ได้รับจริง (ผิด):
```json
{
  "success": true,
  "data": [
    {
      "_id": "6918ed8505bb8d77f627a960",
      "email": "vendor1@test.com",
      "name": "ร้านอาหารทดสอบ 1",
      "role": "vendor",  // ← นี่คือ User data
      ...
    }
  ]
}
```

### ที่ควรได้รับ (ถูก):
```json
{
  "success": true,
  "data": {
    "vendors": [
      {
        "_id": "...",
        "shopName": "ร้านvendor1",  // ← นี่คือ Vendor data
        "status": "approved",
        "userId": {...},
        ...
      }
    ]
  }
}
```

## สาเหตุ

Backend deployment บน Vercel ยังใช้ code เก่าที่มี bug ใน `/api/admin/vendors` endpoint

## วิธีแก้ไข

### Option 1: Redeploy Backend (แนะนำ)

```bash
# ใน backend directory
cd backend
vercel --prod
```

### Option 2: ตรวจสอบ Backend Routes

ตรวจสอบว่า `backend/routes/adminRoutes.js` ใช้ controller ถูกต้อง:

```javascript
import {
  getAllUsers,
  toggleUserBan,
  getAllVendors,  // ← ต้องเป็น getAllVendors ไม่ใช่ getAllUsers
  approveVendor,
  suspendVendor,
  unsuspendVendor,
  getAllOrders,
  getSystemReports,
} from '../controllers/adminController.js';

router.get('/vendors', getAllVendors);  // ← ต้องเรียก getAllVendors
```

## ข้อมูลในฐานข้อมูล

มี vendor อยู่จริง:
- **Shop Name:** ร้านvendor1
- **Status:** approved
- **Owner:** vendor1@test.com
- **User ID:** 6918ed8505bb8d77f627a960

## ทดสอบ

```bash
# ทดสอบ API
node scripts/testAdminVendorsAPI.js

# ตรวจสอบ database
node scripts/checkVendorsInDB.js
```

## สรุป

- ✅ Database มี vendor อยู่
- ✅ Frontend code ถูกต้อง
- ❌ Backend API ส่งข้อมูลผิด (ส่ง users แทน vendors)
- 🔧 ต้อง redeploy backend

## ขั้นตอนแก้ไข

1. Redeploy backend:
   ```bash
   cd backend
   vercel --prod
   ```

2. รอ deploy เสร็จ (2-3 นาที)

3. ทดสอบอีกครั้ง:
   ```bash
   node scripts/testAdminVendorsAPI.js
   ```

4. ทดสอบบน browser:
   - Login ด้วย admin@test.com
   - ไปที่ `/admin/vendors`
   - ควรเห็น "ร้านvendor1"
