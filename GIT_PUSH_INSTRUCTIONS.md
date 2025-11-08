# 📦 วิธี Push Code ขึ้น GitHub

## ✅ สิ่งที่ทำเสร็จแล้ว:

1. ✅ สร้าง Git repository
2. ✅ เพิ่ม .gitignore
3. ✅ Commit code ทั้งหมด (168 files)
4. ✅ เปลี่ยน branch เป็น main
5. ✅ เพิ่ม remote origin

---

## 🔑 ขั้นตอนที่คุณต้องทำ:

### 1. Login GitHub ใน Terminal

เปิด Terminal และรันคำสั่ง:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2. Push Code ขึ้น GitHub

มี 2 วิธี:

#### วิธีที่ 1: ใช้ HTTPS (แนะนำ)

```bash
git push -u origin main
```

จากนั้นใส่ username และ password (Personal Access Token)

**หมายเหตุ**: GitHub ไม่รองรับ password ปกติแล้ว ต้องใช้ Personal Access Token

#### วิธีที่ 2: ใช้ SSH

```bash
# เปลี่ยน remote เป็น SSH
git remote set-url origin git@github.com:Kanomu88/Delivery_Food_University.git

# Push
git push -u origin main
```

---

## 🔐 สร้าง Personal Access Token (ถ้าใช้ HTTPS)

1. ไปที่ GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. เลือก scopes: `repo` (ทั้งหมด)
5. Generate token
6. Copy token (จะแสดงครั้งเดียว!)
7. ใช้ token นี้แทน password เมื่อ push

---

## 📝 คำสั่งที่รันแล้ว:

```bash
# 1. สร้าง git repository
git init

# 2. เพิ่มไฟล์ทั้งหมด
git add .

# 3. Commit
git commit -m "Initial commit: University Canteen Ordering System - Production Ready"

# 4. เปลี่ยน branch เป็น main
git branch -M main

# 5. เพิ่ม remote
git remote add origin https://github.com/Kanomu88/Delivery_Food_University.git
```

---

## 🚀 หลัง Push สำเร็จ:

### ตรวจสอบว่า Push สำเร็จ:

```bash
git remote -v
git log --oneline
```

### ดู Repository บน GitHub:

```
https://github.com/Kanomu88/Delivery_Food_University
```

---

## 📊 ข้อมูลที่ Push:

- **Files**: 168 files
- **Lines**: 36,205 insertions
- **Commit Message**: "Initial commit: University Canteen Ordering System - Production Ready"
- **Branch**: main

---

## 🔄 การ Push ครั้งต่อไป:

หลังจาก push ครั้งแรกสำเร็จแล้ว ครั้งต่อไปใช้:

```bash
# 1. เพิ่มไฟล์ที่แก้ไข
git add .

# 2. Commit
git commit -m "Your commit message"

# 3. Push
git push
```

---

## ⚠️ แก้ปัญหา Permission Denied:

### ถ้าเจอ error 403:

1. **ตรวจสอบว่า login ถูก account**
   ```bash
   git config user.name
   git config user.email
   ```

2. **ใช้ Personal Access Token แทน password**

3. **หรือเปลี่ยนเป็น SSH**
   ```bash
   git remote set-url origin git@github.com:Kanomu88/Delivery_Food_University.git
   ```

---

## 📝 สรุป:

**คำสั่งที่คุณต้องรัน:**

```bash
# ตั้งค่า Git (ครั้งแรกเท่านั้น)
git config --global user.name "Kanomu88"
git config --global user.email "your.email@example.com"

# Push code
git push -u origin main
```

จากนั้นใส่ username และ Personal Access Token

---

**หมายเหตุ**: Repository พร้อม push แล้ว! แค่ต้อง authenticate ด้วย GitHub account ของคุณ
