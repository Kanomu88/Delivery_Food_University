# 🚀 คำแนะนำ Deploy Backend แยก

## ปัญหา
Backend project แยกอยู่ที่ https://vercel.com/esp32s-projects/university-canteen-backend
ต้องอัพเดต Report API endpoints

## วิธี Deploy Backend

### ขั้นตอนที่ 1: คัดลอกโค้ด Report API

จาก `backend/api/index.js` ในโปรเจคนี้ คัดลอกส่วนนี้ไปใส่ใน backend project:

```javascript
// Report Request Schema
const reportRequestSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'rejected'], default: 'pending' },
  reportData: { type: mongoose.Schema.Types.Mixed, default: null },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt: Date,
  notes: String,
}, { timestamps: true });

const ReportRequest = mongoose.models.ReportRequest || mongoose.model('ReportRequest', reportRequestSchema);

// Report routes - Vendor request report
app.post('/api/reports/request', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, error: { message: 'Only vendors can request reports' } });
    }

    const reportRequest = await ReportRequest.create({
      vendorId: req.user._id,
      requestedBy: req.user._id,
      status: 'pending',
    });

    res.status(201).json({ success: true, data: { reportRequest } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Report routes - Admin get all requests
app.get('/api/reports/requests', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Only admins can access this' } });
    }

    const { status } = req.query;
    const query = status ? { status } : {};

    const reportRequests = await ReportRequest.find(query)
      .populate('vendorId', 'name email')
      .populate('requestedBy', 'name email')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { reportRequests, total: reportRequests.length } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Report routes - Admin get vendors list
app.get('/api/reports/vendors', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Only admins can access this' } });
    }

    const vendors = await User.find({ role: 'vendor', isActive: true })
      .select('name email')
      .sort({ name: 1 });

    res.json({ success: true, data: { vendors } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Report routes - Admin generate report
app.post('/api/reports/generate/:requestId', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Only admins can generate reports' } });
    }

    const { vendorId, startDate, endDate } = req.body;
    const reportRequest = await ReportRequest.findById(req.params.requestId);
    
    if (!reportRequest) {
      return res.status(404).json({ success: false, error: { message: 'Report request not found' } });
    }

    // Get vendor info
    const vendor = await User.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, error: { message: 'Vendor not found' } });
    }

    // Get vendor's menus
    const vendorMenus = await Menu.find({ vendor: vendorId }).select('_id name price');
    const menuIds = vendorMenus.map(m => m._id);

    // Build date range
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Get orders
    const orders = await Order.find({
      'items.menu': { $in: menuIds },
      paymentStatus: 'paid',
      createdAt: { $gte: start, $lte: end }
    });

    // Calculate statistics
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    // Calculate popular menus
    const menuStats = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const menuId = item.menu?.toString();
        if (menuIds.some(id => id.toString() === menuId)) {
          if (!menuStats[menuId]) {
            menuStats[menuId] = {
              name: item.name,
              quantity: 0,
              revenue: 0
            };
          }
          menuStats[menuId].quantity += item.quantity;
          menuStats[menuId].revenue += item.price * item.quantity;
        }
      });
    });

    const popularMenus = Object.values(menuStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Prepare report data
    const reportData = {
      vendor: {
        id: vendor._id,
        name: vendor.name,
        location: vendor.address || 'N/A'
      },
      period: { startDate: start, endDate: end },
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      },
      popularMenus,
      generatedAt: new Date(),
      generatedBy: req.user._id
    };

    // Update report request
    reportRequest.status = 'completed';
    reportRequest.reportData = reportData;
    reportRequest.processedBy = req.user._id;
    reportRequest.processedAt = new Date();
    await reportRequest.save();

    res.json({ success: true, data: { reportRequest, reportData } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Report routes - Admin update report
app.put('/api/reports/update/:requestId', authenticate, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Only admins can update reports' } });
    }

    const { reportData } = req.body;
    const reportRequest = await ReportRequest.findById(req.params.requestId);
    
    if (!reportRequest) {
      return res.status(404).json({ success: false, error: { message: 'Report request not found' } });
    }

    reportRequest.reportData = {
      ...reportRequest.reportData,
      ...reportData,
      lastModifiedAt: new Date(),
      lastModifiedBy: req.user._id
    };

    await reportRequest.save();

    res.json({ success: true, data: { reportRequest } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});
```

### ขั้นตอนที่ 2: Deploy Backend

1. ไปที่ backend project ของคุณ
2. เพิ่มโค้ดด้านบนก่อน `export default app;`
3. Commit และ push:
```bash
git add .
git commit -m "Add report API endpoints"
git push origin main
```

4. หรือใช้ Vercel CLI:
```bash
vercel --prod
```

### ขั้นตอนที่ 3: Deploy Frontend

หลังจาก backend พร้อมแล้ว ให้ deploy frontend:

```bash
git add .
git commit -m "Update frontend to use backend report API"
git push origin main
vercel --prod
```

## ทดสอบ

### Test Vendor Request Report
```bash
curl -X POST https://university-canteen-backend.vercel.app/api/reports/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VENDOR_TOKEN"
```

### Test Admin Get Requests
```bash
curl https://university-canteen-backend.vercel.app/api/reports/requests \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## หมายเหตุ

- Backend URL: https://university-canteen-backend.vercel.app
- Frontend URL: https://university-canteen-ordering-system.vercel.app
- ต้องอัพเดต backend ก่อน แล้วค่อย deploy frontend
