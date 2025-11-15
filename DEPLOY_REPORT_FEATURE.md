# คู่มือการ Deploy ฟีเจอร์ระบบรายงาน

## 📋 Pre-deployment Checklist

### 1. ตรวจสอบไฟล์ที่เปลี่ยนแปลง
```bash
# Backend files
backend/models/ReportRequest.js
backend/models/Notification.js
backend/controllers/reportController.js
backend/routes/reportRoutes.js
backend/server.js

# Frontend files
frontend/src/pages/AdminReportsPage.jsx
frontend/src/pages/AdminReportsPage.css
frontend/src/pages/VendorReportsPage.jsx
frontend/src/pages/VendorReportsPage.css
frontend/src/components/admin/ReportGeneratorModal.jsx
frontend/src/components/admin/ReportGeneratorModal.css
frontend/src/components/admin/ReportEditorModal.jsx
frontend/src/components/admin/ReportEditorModal.css
frontend/src/i18n/locales/th.json
frontend/src/App.jsx
```

### 2. ตรวจสอบ Dependencies
```bash
# Frontend
cd frontend
npm install jspdf
```

### 3. ทดสอบในสภาพแวดล้อม Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🚀 Deployment Steps

### Step 1: Commit Changes to Git

```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add report request and generation system

- Add ReportRequest model
- Add report API endpoints (request, generate, update, export)
- Add AdminReportsPage for managing report requests
- Add ReportGeneratorModal for creating reports
- Add ReportEditorModal for editing and exporting reports
- Add request report button in VendorReportsPage
- Add PDF and Text export functionality
- Add Thai translations for report features
- Add notification system for report requests"

# Push to repository
git push origin main
```

### Step 2: Deploy Backend (Vercel)

#### Option A: Automatic Deployment (Recommended)
Vercel จะ deploy อัตโนมัติเมื่อ push ไปยัง main branch

#### Option B: Manual Deployment
```bash
cd backend
vercel --prod
```

### Step 3: Deploy Frontend (Vercel)

#### Option A: Automatic Deployment (Recommended)
Vercel จะ deploy อัตโนมัติเมื่อ push ไปยัง main branch

#### Option B: Manual Deployment
```bash
cd frontend
npm run build
vercel --prod
```

### Step 4: Verify Deployment

#### 4.1 ตรวจสอบ Backend
```bash
# Test API endpoint
curl https://your-backend-url.vercel.app/api/reports/vendors \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### 4.2 ตรวจสอบ Frontend
1. เปิด https://your-frontend-url.vercel.app
2. Login ด้วยบัญชีร้านค้า
3. ไปที่ `/vendor/reports`
4. ตรวจสอบว่ามีปุ่ม "ขอรายงานจากแอดมิน"

#### 4.3 ตรวจสอบ Admin Features
1. Login ด้วยบัญชีแอดมิน
2. ไปที่ `/admin/reports`
3. ตรวจสอบว่าหน้าโหลดได้

## 🔧 Environment Variables

### Backend (.env)
ไม่ต้องเพิ่ม environment variables ใหม่

### Frontend (.env)
ไม่ต้องเพิ่ม environment variables ใหม่

## 📊 Database Migration

### สร้าง Indexes (Optional but Recommended)
```javascript
// Connect to MongoDB
use your_database_name

// Create indexes for ReportRequest collection
db.reportrequests.createIndex({ vendorId: 1 })
db.reportrequests.createIndex({ status: 1 })
db.reportrequests.createIndex({ createdAt: -1 })

// Verify indexes
db.reportrequests.getIndexes()
```

## 🧪 Post-deployment Testing

### 1. Smoke Tests

#### Test 1: Vendor Request Report
```bash
# Login as vendor
# Navigate to /vendor/reports
# Click "ขอรายงานจากแอดมิน" button
# Verify success message
```

#### Test 2: Admin View Requests
```bash
# Login as admin
# Navigate to /admin/reports
# Verify report requests are displayed
```

#### Test 3: Admin Generate Report
```bash
# Login as admin
# Navigate to /admin/reports
# Click "สร้างรายงาน" on a pending request
# Select vendor and date range
# Click "สร้างรายงาน"
# Verify report is generated
```

#### Test 4: Export PDF
```bash
# Login as admin
# Navigate to /admin/reports
# Click "แก้ไข/ดูรายงาน" on a completed report
# Click "ส่งออก PDF"
# Verify PDF is downloaded
```

### 2. Integration Tests

#### Test API Endpoints
```bash
# Test request report endpoint
curl -X POST https://your-backend-url.vercel.app/api/reports/request \
  -H "Authorization: Bearer VENDOR_TOKEN" \
  -H "Content-Type: application/json"

# Test get report requests endpoint
curl https://your-backend-url.vercel.app/api/reports/requests \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Test get vendors endpoint
curl https://your-backend-url.vercel.app/api/reports/vendors \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 3. Performance Tests

#### Load Testing
```bash
# Test with multiple concurrent requests
# Monitor response times
# Check for memory leaks
```

## 🐛 Troubleshooting

### Issue 1: API Endpoint Not Found (404)
**Cause**: Routes not properly registered
**Solution**: 
1. Check `backend/server.js` has `app.use('/api/reports', reportRoutes)`
2. Verify `reportRoutes` is imported correctly
3. Redeploy backend

### Issue 2: Unauthorized (401)
**Cause**: Authentication token missing or invalid
**Solution**:
1. Check token is being sent in Authorization header
2. Verify token is valid and not expired
3. Check middleware is properly configured

### Issue 3: Vendor Not Found
**Cause**: User doesn't have vendor profile
**Solution**:
1. Ensure user has role 'vendor'
2. Ensure vendor profile exists in database
3. Check vendorId is correctly linked to userId

### Issue 4: PDF Not Downloading
**Cause**: Browser blocking download or jsPDF error
**Solution**:
1. Check browser console for errors
2. Verify jsPDF is installed: `npm list jspdf`
3. Try different browser
4. Use Text export as alternative

### Issue 5: Report Has No Data
**Cause**: No orders in selected date range
**Solution**:
1. Select different date range
2. Verify orders exist in database
3. Check order status is 'completed'

## 📈 Monitoring

### Key Metrics to Monitor

#### Backend
- API response times
- Error rates
- Database query performance
- Memory usage

#### Frontend
- Page load times
- Component render times
- Bundle size
- User interactions

### Logging

#### Backend Logs
```javascript
// Check Vercel logs
vercel logs your-backend-url.vercel.app

// Look for:
// - Report request creation
// - Report generation
// - Notification sending
// - Errors
```

#### Frontend Logs
```javascript
// Check browser console
// Look for:
// - API call errors
// - Component errors
// - PDF generation errors
```

## 🔄 Rollback Plan

### If Issues Occur

#### Step 1: Identify the Issue
- Check error logs
- Identify affected functionality
- Assess impact

#### Step 2: Quick Fix or Rollback
**Option A: Quick Fix**
```bash
# Fix the issue
git add .
git commit -m "fix: [description]"
git push origin main
```

**Option B: Rollback**
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback in Vercel dashboard
# Go to Deployments > Select previous deployment > Promote to Production
```

## 📝 Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Database indexes created

### Deployment
- [ ] Code committed to Git
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Deployment verified

### Post-deployment
- [ ] Smoke tests completed
- [ ] Integration tests completed
- [ ] Performance acceptable
- [ ] No critical errors in logs
- [ ] Users notified of new feature

## 🎉 Success Criteria

Deployment is successful when:
1. ✅ Vendor can request reports
2. ✅ Admin receives notifications
3. ✅ Admin can view report requests
4. ✅ Admin can generate reports
5. ✅ Admin can edit reports
6. ✅ Admin can export PDF/Text
7. ✅ No critical errors in logs
8. ✅ Performance is acceptable
9. ✅ All tests passing

## 📞 Support Contacts

### Technical Issues
- Backend: Check Vercel logs
- Frontend: Check browser console
- Database: Check MongoDB Atlas logs

### Escalation
1. Check documentation
2. Review error logs
3. Test in development environment
4. Contact development team

## 🔐 Security Checklist

### Pre-deployment Security Review
- [ ] Authentication required for all endpoints
- [ ] Authorization checks in place
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting configured
- [ ] Sensitive data encrypted

## 📚 Additional Resources

### Documentation
- [REPORT_SYSTEM_FEATURE.md](./REPORT_SYSTEM_FEATURE.md) - Feature documentation
- [TEST_REPORT_SYSTEM.md](./TEST_REPORT_SYSTEM.md) - Testing guide
- [REPORT_FEATURE_SUMMARY.md](./REPORT_FEATURE_SUMMARY.md) - Development summary

### External Resources
- [Vercel Documentation](https://vercel.com/docs)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)

---

**Note**: This deployment guide assumes you're using Vercel for hosting. Adjust steps accordingly if using different hosting platform.
