# ปัญหาหน้า Admin/Users ไม่แสดงข้อมูล

## ปัญหาที่พบ

### API Response Structure ไม่ตรงกัน

**ที่ Frontend คาดหวัง:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {...}
  }
}
```

**ที่ Backend ส่งมาจริง:**
```json
{
  "success": true,
  "data": [
    {...user1...},
    {...user2...},
    {...user3...}
  ]
}
```

## สาเหตุ

Backend deployment บน Vercel ยังใช้ code เก่าที่ส่ง users เป็น array โดยตรง แทนที่จะ wrap ใน object

## วิธีแก้ไข

### Option 1: Redeploy Backend (แนะนำ)

```bash
# ใน backend directory
git add .
git commit -m "Fix admin users API response structure"
git push

# Vercel จะ redeploy อัตโนมัติ
```

### Option 2: แก้ไข Frontend ให้รองรับทั้ง 2 format

แก้ไข `frontend/src/pages/AdminUsersPage.jsx`:

```javascript
const fetchUsers = async () => {
  try {
    setLoading(true);
    const params = {};
    if (roleFilter !== 'all') params.role = roleFilter;
    if (statusFilter !== 'all') params.status = statusFilter;
    
    const response = await adminService.getAllUsers(params);
    
    // รองรับทั้ง 2 format
    const usersData = response.data?.users || response.data || [];
    setUsers(usersData);
  } catch (error) {
    showNotification(t('admin.users.loadError'), 'error');
  } finally {
    setLoading(false);
  }
};
```

## ทดสอบ

### ทดสอบ API Response
```bash
node scripts/debugAdminUsersPage.js
```

**ผลลัพธ์ที่ควรได้:**
```
✅ API call successful
📊 Users data:
   Count: 3
   Users list:
   1. admin (admin) - active
   2. vendor1 (vendor) - active
   3. customer1 (customer) - active
```

### ทดสอบบน Browser
1. Login ด้วย admin@test.com / password123
2. ไปที่ `/admin/users`
3. เปิด Developer Console (F12)
4. ดู Network tab → ดู response จาก `/api/admin/users`
5. ตรวจสอบ structure

## แก้ไขด่วน

ให้ฉันแก้ไข Frontend ให้รองรับทั้ง 2 format:
