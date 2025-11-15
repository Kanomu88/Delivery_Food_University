# แก้ไขหน้า Admin/Vendors และ Admin/Users ให้ใช้งานได้จริง

## สรุปการแก้ไข

### 1. สร้าง Role Middleware
- สร้างไฟล์ `backend/middleware/roleMiddleware.js`
- เพิ่มฟังก์ชัน `authorize()` สำหรับตรวจสอบสิทธิ์การเข้าถึงตาม role

### 2. แก้ไข Admin Controller
- แก้ไขฟังก์ชัน `getAllUsers()` ให้ใช้ `.select('-password -refreshToken')` แทน `.toPublicJSON()`
- แก้ไขฟังก์ชัน `toggleUserBan()` ให้ลบข้อมูล sensitive ออกจาก response
- เพิ่มฟังก์ชัน `unsuspendVendor()` สำหรับยกเลิกการระงับร้านค้า

### 3. แก้ไข Admin Routes
- เพิ่ม import `unsuspendVendor` จาก controller
- เพิ่ม route `PUT /admin/vendors/:id/unsuspend`

### 4. แก้ไข Admin Service (Frontend)
- เพิ่มฟังก์ชัน `unsuspendVendor()` สำหรับเรียก API ยกเลิกระงับร้านค้า

### 5. แก้ไข AdminVendorsPage
- แก้ไขฟังก์ชัน `handleActionConfirm()` ให้เรียก `unsuspendVendor()` แทน `suspendVendor()` เมื่อ action เป็น 'unsuspend'

## ฟีเจอร์ที่ใช้งานได้

### หน้า Admin/Users
- ✅ แสดงรายการผู้ใช้ทั้งหมด
- ✅ ค้นหาผู้ใช้ด้วยชื่อผู้ใช้, อีเมล, ชื่อ-นามสกุล
- ✅ กรองตาม role (customer, vendor, admin)
- ✅ กรองตาม status (active, suspended, banned)
- ✅ แบน/ยกเลิกแบนผู้ใช้ (ไม่สามารถแบน admin ได้)
- ✅ แสดง badge สีตาม role และ status

### หน้า Admin/Vendors
- ✅ แสดงรายการร้านค้าทั้งหมด
- ✅ ค้นหาร้านค้าด้วยชื่อร้าน, เจ้าของ, อีเมล
- ✅ กรองตาม status (pending, approved, suspended)
- ✅ อนุมัติร้านค้าที่รอการอนุมัติ
- ✅ ระงับร้านค้าที่กำลังใช้งาน
- ✅ ยกเลิกระงับร้านค้าที่ถูกระงับ
- ✅ ดูรายละเอียดร้านค้า (ชื่อ, เจ้าของ, คำอธิบาย, ยอดขาย, รายได้)
- ✅ แสดง badge สีตาม status

## API Endpoints

### User Management
```
GET    /api/admin/users              - ดึงรายการผู้ใช้ทั้งหมด
PUT    /api/admin/users/:id/ban      - แบน/ยกเลิกแบนผู้ใช้
```

### Vendor Management
```
GET    /api/admin/vendors                - ดึงรายการร้านค้าทั้งหมด
PUT    /api/admin/vendors/:id/approve    - อนุมัติร้านค้า
PUT    /api/admin/vendors/:id/suspend    - ระงับร้านค้า
PUT    /api/admin/vendors/:id/unsuspend  - ยกเลิกระงับร้านค้า
```

### Reports
```
GET    /api/admin/reports            - ดึงรายงานระบบ
```

## การทดสอบ

รันสคริปต์ทดสอบ:
```bash
node scripts/testAdminPages.js
```

สคริปต์จะทดสอบ:
- ✅ Login ด้วยบัญชี admin
- ✅ ดึงรายการผู้ใช้ทั้งหมด
- ✅ กรองผู้ใช้ตาม role และ status
- ✅ แบน/ยกเลิกแบนผู้ใช้
- ✅ ดึงรายการร้านค้าทั้งหมด
- ✅ กรองร้านค้าตาม status
- ✅ อนุมัติ/ระงับ/ยกเลิกระงับร้านค้า
- ✅ ดึงรายงานระบบ

## การใช้งาน

### สำหรับ Admin
1. เข้าสู่ระบบด้วยบัญชี admin
2. ไปที่เมนู "ผู้ดูแลระบบ" > "จัดการผู้ใช้" หรือ "จัดการร้านค้า"
3. ใช้ search box และ filters เพื่อค้นหาและกรองข้อมูล
4. คลิกปุ่มต่างๆ เพื่อจัดการผู้ใช้หรือร้านค้า

### บัญชีทดสอบ
```
Admin:
- Username: admin
- Password: admin123
```

## หมายเหตุ
- ไม่สามารถแบนผู้ใช้ที่เป็น admin ได้
- การอนุมัติร้านค้าจะเปลี่ยน status จาก pending เป็น approved
- การระงับร้านค้าจะเปลี่ยน status เป็น suspended
- การยกเลิกระงับร้านค้าจะเปลี่ยน status กลับเป็น approved
- ทุก action จะแสดง notification แจ้งผลการดำเนินการ
