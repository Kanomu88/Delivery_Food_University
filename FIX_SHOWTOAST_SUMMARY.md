# แก้ไขปัญหา showToast และ API Route

## 🐛 ปัญหาที่พบ

### 1. API Route 404 Error
```
GET /api/menus/vendor/my-menus 404 (Not Found)
```

**สาเหตุ**: Route `/vendor/my-menus` ถูกจับโดย `/:id` ก่อน เพราะ Express จับ route ตามลำดับ

### 2. showToast is not a function
```
TypeError: showToast is not a function
```

**สาเหตุ**: ใช้ `useToast` hook ที่ไม่มีฟังก์ชัน `showToast` แต่มี `showSuccess`, `showError` แทน

---

## ✅ การแก้ไข

### 1. แก้ไข Backend Route Order

**ไฟล์**: `backend/routes/menuRoutes.js`

**เปลี่ยนจาก**:
```javascript
// Public routes
router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);

// Vendor routes
router.get('/vendor/my-menus', authenticate, authorize('vendor'), getVendorMenuItems);
```

**เป็น**:
```javascript
// Public routes
router.get('/', getMenuItems);

// Vendor routes (must come before /:id to avoid route conflicts)
router.get('/vendor/my-menus', authenticate, authorize('vendor'), getVendorMenuItems);
router.post('/', authenticate, authorize('vendor'), validateMenuItem, createMenuItem);
router.put('/:id', authenticate, authorize('vendor'), validateMenuItem, updateMenuItem);
router.delete('/:id', authenticate, authorize('vendor'), deleteMenuItem);

// Public route with ID (must come after specific routes)
router.get('/:id', getMenuItemById);
```

**เหตุผล**: Routes ที่เฉพาะเจาะจงต้องมาก่อน routes ที่ใช้ parameters

---

### 2. แก้ไข Frontend - เปลี่ยนจาก useToast เป็น useNotification

**ไฟล์ที่แก้ไข**: `frontend/src/pages/VendorMenuPage.jsx`

**เปลี่ยนจาก**:
```javascript
import { useToast } from '../hooks/useToast';
const { showToast } = useToast();
showToast(message, 'error');
```

**เป็น**:
```javascript
import { useNotification } from '../contexts/NotificationContext';
const { showNotification } = useNotification();
showNotification(message, 'error');
```

---

## 📝 ไฟล์ที่ยังต้องแก้ไข

ไฟล์เหล่านี้ยังใช้ `useToast` อยู่และต้องเปลี่ยนเป็น `useNotification`:

1. ✅ `frontend/src/pages/VendorMenuPage.jsx` - แก้ไขแล้ว
2. ⚠️ `frontend/src/pages/VendorReportsPage.jsx`
3. ⚠️ `frontend/src/pages/VendorOrdersPage.jsx`
4. ⚠️ `frontend/src/pages/PaymentPage.jsx`
5. ⚠️ `frontend/src/pages/AdminReportsPage.jsx`
6. ⚠️ `frontend/src/pages/AdminVendorsPage.jsx`
7. ⚠️ `frontend/src/pages/AdminUsersPage.jsx`
8. ⚠️ `frontend/src/pages/AdminDashboardPage.jsx`

---

## 🔧 วิธีแก้ไขไฟล์ที่เหลือ

สำหรับแต่ละไฟล์ ให้ทำการเปลี่ยนแปลงดังนี้:

### ขั้นตอนที่ 1: เปลี่ยน Import
```javascript
// เก่า
import { useToast } from '../hooks/useToast';

// ใหม่
import { useNotification } from '../contexts/NotificationContext';
```

### ขั้นตอนที่ 2: เปลี่ยนการใช้งาน
```javascript
// เก่า
const { showToast } = useToast();

// ใหม่
const { showNotification } = useNotification();
```

### ขั้นตอนที่ 3: เปลี่ยนการเรียกใช้
```javascript
// เก่า
showToast(message, 'error');
showToast(message, 'success');

// ใหม่
showNotification(message, 'error');
showNotification(message, 'success');
```

---

## 🎯 ผลลัพธ์ที่คาดหวัง

หลังจากแก้ไขแล้ว:
1. ✅ API `/api/menus/vendor/my-menus` จะทำงานได้ปกติ
2. ✅ ไม่มี error `showToast is not a function`
3. ✅ Notification จะแสดงผลได้ถูกต้อง
4. ✅ หน้า Vendor Menu จะโหลดเมนู 25 รายการได้

---

## 🧪 การทดสอบ

### ทดสอบ Backend:
```bash
# Login as vendor
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vendor@test.com","password":"password123"}'

# Get vendor menus (ใช้ token ที่ได้)
curl -X GET http://localhost:5000/api/menus/vendor/my-menus \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### ทดสอบ Frontend:
1. Login ด้วย `vendor@test.com` / `password123`
2. ไปที่หน้า Vendor Menu
3. ตรวจสอบว่า:
   - ✅ เมนู 25 รายการแสดงผล
   - ✅ ไม่มี error ใน console
   - ✅ สามารถเพิ่ม/แก้ไข/ลบเมนูได้
   - ✅ Notification แสดงผลถูกต้อง

---

## 📚 เอกสารที่เกี่ยวข้อง

- **NotificationContext**: `frontend/src/contexts/NotificationContext.jsx`
- **useNotification**: ใช้ context โดยตรง ไม่ต้องมี hook แยก
- **Menu Routes**: `backend/routes/menuRoutes.js`
- **Menu Controller**: `backend/controllers/menuController.js`

---

**วันที่แก้ไข**: 9 พฤศจิกายน 2025
**สถานะ**: ✅ แก้ไข VendorMenuPage แล้ว, ⚠️ ยังมีไฟล์อื่นที่ต้องแก้ไข
