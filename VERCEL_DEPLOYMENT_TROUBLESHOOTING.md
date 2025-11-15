# 🔧 Vercel Deployment Troubleshooting

## ปัญหา: API Endpoints ยัง 404 หลัง Deploy

### สถานการณ์
- โค้ดถูก commit และ push ไปยัง GitHub แล้ว
- Vercel ควรจะ auto-deploy แต่ API endpoints ยังไม่ทำงาน
- Error: `404 Not Found` สำหรับ `/api/vendors/reports/sales` และ `/api/vendors/reports/popular-menus`

### สาเหตุที่เป็นไปได้

#### 1. Vercel ยังไม่ได้ Rebuild
**อาการ**: โค้ดใหม่อยู่ใน Git แต่ production ยังใช้โค้ดเก่า

**วิธีแก้**:
```bash
# Option 1: Empty commit เพื่อ trigger redeploy
git commit --allow-empty -m "chore: Trigger Vercel redeploy"
git push origin main

# Option 2: Redeploy ผ่าน Vercel Dashboard
# 1. ไปที่ https://vercel.com/dashboard
# 2. เลือก project: university-canteen-backend
# 3. ไปที่ Deployments tab
# 4. คลิก "..." บน deployment ล่าสุด
# 5. เลือก "Redeploy"
```

#### 2. Vercel Build Cache
**อาการ**: Vercel ใช้ cached build แทนที่จะ build ใหม่

**วิธีแก้**:
```bash
# Redeploy โดยไม่ใช้ cache
# ใน Vercel Dashboard:
# 1. ไปที่ Deployments
# 2. คลิก "Redeploy"
# 3. เลือก "Redeploy without cache"
```

#### 3. Environment Variables ไม่ถูกต้อง
**อาการ**: API ทำงานใน local แต่ไม่ทำงานใน production

**วิธีแก้**:
```bash
# ตรวจสอบ Environment Variables ใน Vercel:
# 1. ไปที่ Project Settings
# 2. เลือก Environment Variables
# 3. ตรวจสอบว่ามี:
#    - MONGODB_URI
#    - JWT_SECRET
#    - JWT_EXPIRE
```

#### 4. API Routes ไม่ถูก Export
**อาการ**: Endpoints ใหม่ไม่ทำงาน แต่ endpoints เก่าทำงานปกติ

**วิธีแก้**:
ตรวจสอบว่า `backend/api/index.js` มี:
```javascript
// ต้องมี export default app ที่ท้ายไฟล์
export default app;
```

### ✅ วิธีตรวจสอบว่า Deploy สำเร็จ

#### 1. ตรวจสอบ Vercel Dashboard
```
https://vercel.com/dashboard
```
- ดูสถานะ deployment ล่าสุด
- ตรวจสอบว่าเป็น "Ready" (สีเขียว)
- ดู Build Logs สำหรับ errors

#### 2. ทดสอบ API Endpoint
```bash
# Test health check
curl https://university-canteen-backend.vercel.app/

# Test vendor reports (ต้องมี token)
curl https://university-canteen-backend.vercel.app/api/vendors/reports/sales \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3. ตรวจสอบ Response Headers
```bash
curl -I https://university-canteen-backend.vercel.app/api/vendors/reports/sales
```
- ถ้าเป็น `404` = endpoint ไม่มี
- ถ้าเป็น `401` = endpoint มี แต่ต้องการ authentication
- ถ้าเป็น `200` = ทำงานปกติ

### 🚀 ขั้นตอนแก้ปัญหาแบบเร่งด่วน

#### Step 1: Force Redeploy
```bash
cd /path/to/project
git commit --allow-empty -m "chore: Force redeploy"
git push origin main
```

#### Step 2: รอ 2-3 นาที
Vercel ใช้เวลาประมาณ 2-3 นาที ในการ build และ deploy

#### Step 3: Clear Browser Cache
```bash
# Chrome/Edge
Ctrl + Shift + Delete (Windows)
Cmd + Shift + Delete (Mac)

# หรือใช้ Incognito/Private mode
```

#### Step 4: ทดสอบอีกครั้ง
```bash
# เปิด browser console (F12)
# ไปที่ Network tab
# รีเฟรชหน้า
# ดู API calls
```

### 📊 Timeline ปกติ

```
0:00 - Git push
0:30 - Vercel detect changes
1:00 - Start building
2:00 - Build complete
2:30 - Deploy to edge network
3:00 - Ready (ทั่วโลก)
```

### 🐛 Common Issues

#### Issue 1: "Module not found"
**Cause**: Missing dependencies
**Fix**:
```bash
cd backend
npm install
git add package.json package-lock.json
git commit -m "fix: Update dependencies"
git push
```

#### Issue 2: "Cannot find module"
**Cause**: Import path ไม่ถูกต้อง
**Fix**: ตรวจสอบ import statements ใน `backend/api/index.js`

#### Issue 3: "Timeout"
**Cause**: Function execution เกิน 10 วินาที (Vercel limit)
**Fix**: Optimize database queries หรือ upgrade Vercel plan

### 💡 Tips

#### 1. ใช้ Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy manually
cd backend
vercel --prod

# View logs
vercel logs university-canteen-backend.vercel.app
```

#### 2. Enable Deployment Protection
```bash
# ใน Vercel Dashboard:
# Settings > Deployment Protection
# เปิด "Vercel Authentication" เพื่อป้องกัน unauthorized access
```

#### 3. Monitor Deployments
```bash
# ติดตั้ง Vercel GitHub App
# จะได้รับ notification เมื่อ deployment สำเร็จหรือล้มเหลว
```

### 📝 Checklist

#### Pre-deployment
- [ ] โค้ดทดสอบใน local แล้ว
- [ ] ไม่มี syntax errors
- [ ] Dependencies ครบถ้วน
- [ ] Environment variables ถูกต้อง

#### During deployment
- [ ] Git push สำเร็จ
- [ ] Vercel detect changes
- [ ] Build ไม่มี errors
- [ ] Deploy สำเร็จ

#### Post-deployment
- [ ] API endpoints ตอบกลับ
- [ ] ไม่มี 404 errors
- [ ] ไม่มี 500 errors
- [ ] Performance ดี

### 🔍 Debug Commands

```bash
# ตรวจสอบ Git status
git status
git log --oneline -5

# ตรวจสอบ remote
git remote -v

# ตรวจสอบ branch
git branch -a

# ตรวจสอบ last commit
git show HEAD

# ตรวจสอบ file content
git show HEAD:backend/api/index.js | grep "vendors/reports"
```

### 📞 Support

#### Vercel Support
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Status: https://www.vercel-status.com/

#### Project-specific
- Check GitHub Issues
- Review deployment logs
- Contact development team

---

## Current Status

**Last Update**: ${new Date().toLocaleString('th-TH')}

**Actions Taken**:
1. ✅ Added vendor reports endpoints to `backend/api/index.js`
2. ✅ Committed changes to Git
3. ✅ Pushed to GitHub
4. ✅ Triggered empty commit for redeploy
5. 🔄 Waiting for Vercel to rebuild (2-3 minutes)

**Next Steps**:
1. Wait for Vercel deployment to complete
2. Test API endpoints
3. Verify frontend works correctly
4. Monitor for any errors

**ETA**: 2-3 minutes from last push
