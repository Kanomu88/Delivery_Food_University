# แก้ไขหน้า Vendor Reports ให้แสดงข้อมูลได้

## ปัญหาที่พบ
- หน้า `/vendor/reports` ไม่แสดงข้อมูลหลังจากแอดมินอนุมัติร้านค้า
- API response structure ไม่ตรงกับที่ frontend คาดหวัง
- Vendor อาจไม่มี orders เพื่อแสดงในรายงาน

## การแก้ไข

### 1. แก้ไข Backend API Response
**ไฟล์: `backend/controllers/vendorController.js`**

แก้ไขฟังก์ชัน `getSalesReport()` ให้ส่งข้อมูลครบถ้วน:
- เพิ่ม `averageOrderValue`
- แก้ไข `dailySales` format ให้ตรงกับที่ frontend ต้องการ

```javascript
// เพิ่ม
const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

// ส่ง dailySales ในรูปแบบที่ถูกต้อง
dailySales: dailySales.map(day => ({
  date: day.date,
  revenue: day.revenue,
  orders: day.orders,
}))
```

### 2. แก้ไข Frontend Data Handling
**ไฟล์: `frontend/src/pages/VendorReportsPage.jsx`**

แก้ไขการ extract data จาก API response:
```javascript
// Extract data from response
const salesData = sales.data || sales;
const popularData = popular.data || popular;

// เพิ่ม console.log เพื่อ debug
console.log('Sales data:', salesData);
console.log('Popular data:', popularData);
```

### 3. สร้างสคริปต์สำหรับสร้าง Test Orders
**ไฟล์: `backend/scripts/createTestOrders.js`**

สคริปต์นี้จะสร้าง test orders สำหรับ vendor เพื่อให้มีข้อมูลแสดงในรายงาน:
- สร้าง 20 orders ในช่วง 30 วันที่ผ่านมา
- Random items และ quantities
- Random statuses (completed, ready, preparing)
- คำนวณ total revenue และ statistics

## วิธีแก้ปัญหา

### ขั้นตอนที่ 1: ตรวจสอบว่า Vendor มี Orders หรือไม่
```bash
node scripts/testVendorReports.js
```

สคริปต์นี้จะ:
- ✅ ตรวจสอบข้อมูล vendor ใน database
- ✅ ตรวจสอบจำนวน orders
- ✅ ทดสอบ API endpoints ทั้งหมด
- ✅ แสดงข้อมูลที่ได้จาก API

### ขั้นตอนที่ 2: สร้าง Test Orders (ถ้าไม่มี Orders)
```bash
node backend/scripts/createTestOrders.js
```

สคริปต์นี้จะ:
- ✅ สร้าง 20 test orders สำหรับ vendor1
- ✅ กระจาย orders ในช่วง 30 วันที่ผ่านมา
- ✅ แสดง statistics (total revenue, average order value)
- ✅ แสดง orders by date

### ขั้นตอนที่ 3: ทดสอบหน้า Vendor Reports
1. Login ด้วยบัญชี vendor1
2. ไปที่หน้า `/vendor/reports`
3. ตรวจสอบว่าแสดงข้อมูล:
   - ✅ Total Revenue
   - ✅ Total Orders
   - ✅ Average Order Value
   - ✅ Sales Trend Chart
   - ✅ Popular Menus Table

## API Endpoints ที่เกี่ยวข้อง

### Vendor Reports
```
GET /api/vendors/reports/sales
  Query params:
    - startDate: YYYY-MM-DD
    - endDate: YYYY-MM-DD
  
  Response:
    {
      success: true,
      data: {
        totalRevenue: number,
        totalOrders: number,
        averageOrderValue: number,
        dailySales: [
          { date: string, revenue: number, orders: number }
        ]
      }
    }

GET /api/vendors/reports/popular-menus
  Query params:
    - startDate: YYYY-MM-DD
    - endDate: YYYY-MM-DD
    - limit: number (default: 10)
  
  Response:
    {
      success: true,
      data: {
        popularMenus: [
          {
            _id: string,
            name: string,
            totalQuantity: number,
            totalRevenue: number,
            orderCount: number
          }
        ]
      }
    }
```

## การทดสอบ

### 1. ทดสอบ API
```bash
# ตรวจสอบข้อมูล vendor และทดสอบ API
node scripts/testVendorReports.js
```

### 2. สร้าง Test Data
```bash
# สร้าง test orders
node backend/scripts/createTestOrders.js
```

### 3. ทดสอบบน Browser
1. เปิด browser และ login ด้วย vendor1
2. ไปที่ `/vendor/reports`
3. เปิด Developer Console (F12)
4. ตรวจสอบ console.log output
5. ตรวจสอบ Network tab สำหรับ API calls

## สาเหตุที่อาจทำให้ไม่แสดงข้อมูล

1. **Vendor ยังไม่ได้รับการอนุมัติ**
   - ตรวจสอบ vendor status ต้องเป็น 'approved'
   - แอดมินต้องอนุมัติผ่านหน้า `/admin/vendors`

2. **Vendor ไม่มี Orders**
   - ใช้สคริปต์ `createTestOrders.js` เพื่อสร้าง test data
   - หรือสร้าง orders จริงผ่านระบบ

3. **Vendor ไม่มี Menu Items**
   - ตรวจสอบว่า vendor มี menu items ที่ available
   - เพิ่ม menu items ผ่านหน้า `/vendor/menu`

4. **Date Range ไม่ถูกต้อง**
   - ตรวจสอบว่า date range ครอบคลุมช่วงที่มี orders
   - Default คือ 7 วันที่ผ่านมา

## บัญชีทดสอบ

```
Vendor:
- Username: vendor1
- Password: vendor123

Admin:
- Username: admin
- Password: admin123

Customer:
- Username: customer1
- Password: customer123
```

## หมายเหตุ

- หลังจากแอดมินอนุมัติ vendor แล้ว vendor สามารถ:
  - ✅ เพิ่ม/แก้ไข menu items
  - ✅ รับ orders จากลูกค้า
  - ✅ ดูรายงานยอดขาย
  - ✅ ดูเมนูยอดนิยม

- ถ้ายังไม่มี orders จริง ให้ใช้สคริปต์สร้าง test data ก่อน
- รายงานจะแสดงเฉพาะ orders ที่ status ไม่ใช่ 'cancelled'
- Chart จะแสดงเฉพาะวันที่มี orders
