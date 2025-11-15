# 🎯 วิธีแก้ไขปัญหา Backend 404

## ปัญหา
Backend บน Vercel (https://university-canteen-backend.vercel.app) เชื่อมกับ Git repository แยก
ไม่ได้ใช้โฟลเดอร์ `backend/` ในโปรเจคนี้

## วิธีแก้ไข (เลือก 1 วิธี)

### วิธีที่ 1: แก้ไขผ่าน GitHub/GitLab (แนะนำ) ⭐

1. **ไปที่ Vercel Dashboard**
   - เปิด: https://vercel.com/esp32s-projects/university-canteen-backend
   - คลิก "Settings" → "Git"
   - จะเห็น Git Repository URL (เช่น github.com/xxx/backend)

2. **ไปที่ Git Repository นั้น**
   - เปิด repository ที่เห็นใน Vercel
   - ไปที่ไฟล์ `api/index.js` หรือ `index.js`

3. **แก้ไขไฟล์**
   - คลิก Edit (ไอคอนดินสอ)
   - หาบรรทัด `export default app;`
   - คัดลอกโค้ดจากไฟล์ `backend/api/index.js` บรรทัด 770-970 ในโปรเจคนี้
   - วางก่อน `export default app;`

4. **Commit**
   - Commit message: "Add report API endpoints"
   - Vercel จะ auto-deploy

### วิธีที่ 2: Clone Backend Repo และแก้ไข

```bash
# 1. หา Git URL จาก Vercel Dashboard
# 2. Clone repo
git clone <BACKEND_GIT_URL>
cd <backend-folder>

# 3. คัดลอกโค้ด report API จากโปรเจคนี้
# ไปวางใน api/index.js ก่อน export default app;

# 4. Commit และ Push
git add .
git commit -m "Add report API endpoints"
git push origin main
```

### วิธีที่ 3: ใช้ Backend ในโปรเจคนี้แทน

ถ้าคุณต้องการใช้ backend ในโฟลเดอร์ `backend/` ของโปรเจคนี้:

1. **Unlink backend project เดิม**
   ```bash
   cd backend
   vercel unlink
   ```

2. **Link กับ project ใหม่หรือสร้างใหม่**
   ```bash
   vercel link
   # เลือก: Create new project
   # ตั้งชื่อ: university-canteen-backend-new
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **อัพเดต frontend .env**
   ```
   VITE_API_URL=https://university-canteen-backend-new.vercel.app/api
   ```

5. **Deploy frontend**
   ```bash
   cd ..
   vercel --prod
   ```

## โค้ดที่ต้องเพิ่มใน Backend

คัดลอกจากไฟล์ `backend/api/index.js` บรรทัด 770-970:

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

// Report API endpoints (5 endpoints)
app.post('/api/reports/request', authenticate, async (req, res) => { ... });
app.get('/api/reports/requests', authenticate, async (req, res) => { ... });
app.get('/api/reports/vendors', authenticate, async (req, res) => { ... });
app.post('/api/reports/generate/:requestId', authenticate, async (req, res) => { ... });
app.put('/api/reports/update/:requestId', authenticate, async (req, res) => { ... });
```

## ทดสอบหลัง Deploy

```bash
# Test backend
curl https://university-canteen-backend.vercel.app/

# ควรได้:
# {"message":"University Canteen Backend API","status":"running","version":"1.0.0"}
```

## คำแนะนำ

**วิธีที่ 1 เร็วที่สุด** - แก้ไขผ่าน GitHub/GitLab โดยตรง
**วิธีที่ 3 ดีที่สุดในระยะยาว** - ใช้ backend ในโปรเจคนี้ เพื่อให้จัดการง่าย

บอกฉันว่าคุณต้องการใช้วิธีไหน ฉันจะช่วยทีละขั้นตอน! 🚀
