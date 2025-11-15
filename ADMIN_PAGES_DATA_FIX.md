# แก้ไขปัญหาหน้า Admin/Vendors และ Admin/Users ไม่แสดงข้อมูล

## ปัญหาที่พบ
- หน้า `/admin/vendors` และ `/admin/users` ไม่แสดงข้อมูล
- Users ในฐานข้อมูลไม่มี `username` และ `status` fields
- Vendors บางตัวไม่มี user ที่เชื่อมโยง (orphaned vendors)
- Vendors ไม่มี `shopName`, `status`, และ `isAcceptingOrders` fields

## การแก้ไข

### 1. สร้างสคริปต์ตรวจสอบข้อมูล
**ไฟล์: `scripts/checkAdminData.js`**

สคริปต์นี้จะตรวจสอบ:
- ✅ จำนวน users และ vendors ในฐานข้อมูล
- ✅ Users ที่ไม่มี username หรือ status
- ✅ Vendors ที่ไม่มี user เชื่อมโยง
- ✅ Vendors ที่ไม่มี fields จำเป็น

### 2. สร้างสคริปต์แก้ไขข้อมูล
**ไฟล์: `backend/scripts/fixUsersAndVendors.js`**

สคริปต์นี้จะ:
- ✅ เพิ่ม `username` ให้ users (จาก email)
- ✅ เพิ่ม `status = 'active'` ให้ users
- ✅ เพิ่ม `firstName` และ `lastName` ให้ users
- ✅ ลบ vendors ที่ไม่มี user เชื่อมโยง
- ✅ เพิ่ม `shopName` ให้ vendors
- ✅ เพิ่ม `status = 'approved'` ให้ vendors
- ✅ เพิ่ม `isAcceptingOrders = true` ให้ vendors
- ✅ เพิ่ม `description` ให้ vendors

## วิธีแก้ปัญหา

### ขั้นตอนที่ 1: ตรวจสอบข้อมูลปัจจุบัน
```bash
node scripts/checkAdminData.js
```

ผลลัพธ์จะแสดง:
- จำนวน users และ vendors
- Users/Vendors ที่มีปัญหา
- รายละเอียดของแต่ละ record

### ขั้นตอนที่ 2: แก้ไขข้อมูล
```bash
node backend/scripts/fixUsersAndVendors.js
```

สคริปต์จะ:
1. แก้ไข users ทั้งหมด (เพิ่ม username, status)
2. ลบ vendors ที่ orphaned
3. แก้ไข vendors ที่เหลือ (เพิ่ม shopName, status, etc.)
4. แสดงผลการแก้ไข

### ขั้นตอนที่ 3: เริ่ม Backend Server
```bash
# ใน terminal แยก
cd backend
npm run dev
```

หรือ
```bash
npm run dev
```

### ขั้นตอนที่ 4: ทดสอบ API
```bash
# ใน terminal อีกอัน
node scripts/quickTestAdmin.js
```

สคริปต์จะทดสอบ:
- ✅ Server connection
- ✅ Admin login
- ✅ Get users API
- ✅ Get vendors API

### ขั้นตอนที่ 5: ทดสอบบน Browser
1. เปิด browser ไปที่ `http://localhost:5173`
2. Login ด้วยบัญชี admin:
   - Email: `admin@test.com`
   - Password: `admin123`
3. ไปที่หน้า `/admin/users` - ควรเห็น 3 users
4. ไปที่หน้า `/admin/vendors` - ควรเห็น 1 vendor

## ผลลัพธ์หลังแก้ไข

### Users (3 users)
```
- admin (admin@test.com) - admin - active
- vendor1 (vendor1@test.com) - vendor - active
- customer1 (customer1@test.com) - customer - active
```

### Vendors (1 vendor)
```
- ร้านvendor1 - approved - Owner: vendor1
```

## ฟีเจอร์ที่ใช้งานได้

### หน้า Admin/Users
- ✅ แสดงรายการ users ทั้งหมด
- ✅ แสดง username, email, role, status
- ✅ ค้นหาด้วย username, email, ชื่อ
- ✅ กรองตาม role (customer, vendor, admin)
- ✅ กรองตาม status (active, suspended, banned)
- ✅ แบน/ยกเลิกแบน users

### หน้า Admin/Vendors
- ✅ แสดงรายการ vendors ทั้งหมด
- ✅ แสดง shopName, owner, email, status
- ✅ ค้นหาด้วย shopName, owner, email
- ✅ กรองตาม status (pending, approved, suspended)
- ✅ อนุมัติ/ระงับ/ยกเลิกระงับ vendors
- ✅ ดูรายละเอียด vendors

## การสร้าง Users และ Vendors เพิ่มเติม

### สร้าง Customer ใหม่
```bash
# ผ่าน API หรือ Register page
POST /api/auth/register
{
  "email": "customer2@test.com",
  "password": "customer123",
  "name": "Customer 2",
  "role": "customer"
}
```

### สร้าง Vendor ใหม่
```bash
# 1. Register user with role vendor
POST /api/auth/register
{
  "email": "vendor2@test.com",
  "password": "vendor123",
  "name": "Vendor 2",
  "role": "vendor"
}

# 2. Create vendor profile (auto-created on first login)
# หรือสร้างผ่าน script
```

## บัญชีทดสอบ

```
Admin:
- Email: admin@test.com
- Password: admin123
- Username: admin

Vendor:
- Email: vendor1@test.com
- Password: vendor123
- Username: vendor1

Customer:
- Email: customer1@test.com
- Password: customer123
- Username: customer1
```

## หมายเหตุ

### ข้อมูลที่จำเป็นสำหรับ Users
- ✅ `email` (unique)
- ✅ `password` (hashed)
- ✅ `username` (unique)
- ✅ `role` (customer, vendor, admin)
- ✅ `status` (active, suspended, banned)
- ✅ `firstName` และ `lastName` (optional)

### ข้อมูลที่จำเป็นสำหรับ Vendors
- ✅ `userId` (reference to User)
- ✅ `shopName`
- ✅ `status` (pending, approved, suspended)
- ✅ `isAcceptingOrders` (boolean)
- ✅ `description` (optional)

### การ Login
- ระบบรองรับ login ด้วย `email` หรือ `username`
- Password ต้อง match กับที่เก็บใน database (bcrypt hashed)

### การแก้ไข Schema
ถ้าต้องการเปลี่ยน schema ในอนาคต:
1. อัปเดต model files (`backend/models/`)
2. รันสคริปต์ migration เพื่ออัปเดตข้อมูลเก่า
3. ทดสอบให้แน่ใจว่าข้อมูลถูกต้อง

## Troubleshooting

### ถ้าหน้า Admin ยังไม่แสดงข้อมูล
1. ตรวจสอบว่า backend server รันอยู่
2. เปิด Browser Console (F12) ดู errors
3. เปิด Network tab ดู API responses
4. ตรวจสอบว่า login สำเร็จและมี token
5. ตรวจสอบว่า user มี role = 'admin'

### ถ้า API ส่ง error
1. ตรวจสอบ backend logs
2. ตรวจสอบว่าข้อมูลใน database ถูกต้อง
3. รันสคริปต์ `checkAdminData.js` อีกครั้ง
4. ถ้าจำเป็นให้รัน `fixUsersAndVendors.js` อีกครั้ง

### ถ้าต้องการ reset ข้อมูล
```bash
# ลบข้อมูลทั้งหมดและสร้างใหม่
node backend/scripts/recreateUsers.js
```
