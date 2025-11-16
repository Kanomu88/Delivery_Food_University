# แก้ไขปัญหาการแสดงสถิติร้านค้าเสร็จสมบูรณ์

## ปัญหา
ในหน้า Admin > Vendors > รายละเอียดร้านค้า ข้อมูล "ออเดอร์ทั้งหมด" และ "รายได้ทั้งหมด" แสดงเป็น 0 ไม่ตรงกับความเป็นจริง

## การตรวจสอบ
ใช้ script `checkVendorOrders.js` ตรวจสอบข้อมูลจริงในฐานข้อมูล:

```bash
node scripts/checkVendorOrders.js
```

ผลลัพธ์:
- Vendor: ร้านvendor1
- Menus: 9 รายการ
- Orders: 2 orders
- Total Revenue: ฿120 (จาก paid orders)

## สาเหตุ
Backend API `/api/admin/vendors` ไม่ได้คำนวณและส่งข้อมูล `totalOrders` และ `totalRevenue` กลับมา

## การแก้ไข

### Backend API (`backend/api/index.js`)
เพิ่มการคำนวณสถิติสำหรับแต่ละ vendor:

```javascript
app.get('/api/admin/vendors', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Only admins can access this' } });
    }

    const { status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.shopName = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const vendors = await Vendor.find(query)
      .populate('userId', 'username email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Calculate orders and revenue for each vendor
    const vendorsWithStats = await Promise.all(vendors.map(async (vendor) => {
      // Get vendor's menus
      const vendorMenus = await Menu.find({ vendorId: vendor._id }).select('_id');
      const menuIds = vendorMenus.map(m => m._id);

      // Get orders containing vendor's menus
      const orders = await Order.find({
        'items.menu': { $in: menuIds },
        paymentStatus: 'paid'
      });

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

      return {
        ...vendor.toObject(),
        totalOrders,
        totalRevenue
      };
    }));

    const total = await Vendor.countDocuments(query);

    res.json({
      success: true,
      data: {
        vendors: vendorsWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});
```

## การทดสอบ

### ทดสอบ Production API
```bash
node scripts/testProductionVendors.js
```

ผลลัพธ์:
```json
{
  "success": true,
  "data": {
    "vendors": [
      {
        "_id": "6918ed8505bb8d77f627a962",
        "shopName": "ร้านvendor1",
        "status": "approved",
        "totalOrders": 2,
        "totalRevenue": 120
      }
    ]
  }
}
```

✅ ข้อมูลถูกต้อง!

## Deployment

### Backend
```bash
cd backend
vercel --prod --yes
```

### Frontend
```bash
cd frontend
vercel --prod --yes
```

## URLs
- **Frontend**: https://frontend-ten-mu-38.vercel.app/
- **Backend**: https://backend-one-alpha-39.vercel.app/

## การตรวจสอบ
1. Login ด้วยบัญชี admin: admin@test.com / password123
2. ไปที่ Admin > Vendors
3. คลิก "ดูรายละเอียด" ของร้านค้า
4. ตรวจสอบว่าแสดง:
   - ออเดอร์ทั้งหมด: 2
   - รายได้ทั้งหมด: ฿120

## สถานะ
✅ แก้ไขเสร็จสมบูรณ์
✅ Backend คำนวณสถิติถูกต้อง
✅ Frontend แสดงข้อมูลถูกต้อง
✅ Deploy ไปยัง production แล้ว
