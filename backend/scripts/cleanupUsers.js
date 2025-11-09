import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

// Schemas
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
}, { timestamps: true });

const vendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shopName: String,
  description: String,
  location: String,
  phone: String,
  isApproved: Boolean,
}, { timestamps: true });

const menuItemSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  name: String,
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Vendor = mongoose.model('Vendor', vendorSchema);
const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const Order = mongoose.model('Order', orderSchema);

// บัญชีที่ต้องการเก็บไว้
const KEEP_ACCOUNTS = [
  'customer@test.com',
  'vendor@test.com',
  'admin@test.com'
];

async function cleanupUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. แสดงผู้ใช้ทั้งหมดก่อนลบ
    const allUsers = await User.find({}).sort({ email: 1 });
    console.log('📋 ผู้ใช้ทั้งหมดในระบบ:');
    console.log('═══════════════════════════════════════════════');
    allUsers.forEach((user, index) => {
      const keepStatus = KEEP_ACCOUNTS.includes(user.email) ? '✅ เก็บไว้' : '❌ จะลบ';
      console.log(`${index + 1}. ${user.email} (${user.role}) - ${keepStatus}`);
    });
    console.log(`\nจำนวนทั้งหมด: ${allUsers.length} บัญชี\n`);

    // 2. หาผู้ใช้ที่จะลบ
    const usersToDelete = await User.find({ 
      email: { $nin: KEEP_ACCOUNTS } 
    });

    if (usersToDelete.length === 0) {
      console.log('✅ ไม่มีผู้ใช้ที่ต้องลบ\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`🗑️  พบผู้ใช้ที่จะลบ: ${usersToDelete.length} บัญชี`);
    console.log('─'.repeat(50));
    usersToDelete.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role})`);
    });
    console.log('');

    // 3. ลบข้อมูลที่เกี่ยวข้อง
    const userIdsToDelete = usersToDelete.map(u => u._id);

    // หา Vendors ที่เกี่ยวข้อง
    const vendorsToDelete = await Vendor.find({ 
      userId: { $in: userIdsToDelete } 
    });
    const vendorIdsToDelete = vendorsToDelete.map(v => v._id);

    console.log('🗑️  กำลังลบข้อมูลที่เกี่ยวข้อง...\n');

    // ลบ Orders
    const deletedOrders = await Order.deleteMany({
      $or: [
        { userId: { $in: userIdsToDelete } },
        { vendorId: { $in: vendorIdsToDelete } }
      ]
    });
    console.log(`   ✓ ลบ Orders: ${deletedOrders.deletedCount} รายการ`);

    // ลบ MenuItems
    const deletedMenus = await MenuItem.deleteMany({
      vendorId: { $in: vendorIdsToDelete }
    });
    console.log(`   ✓ ลบ Menu Items: ${deletedMenus.deletedCount} รายการ`);

    // ลบ Vendors
    const deletedVendors = await Vendor.deleteMany({
      userId: { $in: userIdsToDelete }
    });
    console.log(`   ✓ ลบ Vendors: ${deletedVendors.deletedCount} ร้านค้า`);

    // ลบ Users
    const deletedUsers = await User.deleteMany({
      email: { $nin: KEEP_ACCOUNTS }
    });
    console.log(`   ✓ ลบ Users: ${deletedUsers.deletedCount} บัญชี\n`);

    // 4. แสดงผู้ใช้ที่เหลือ
    const remainingUsers = await User.find({}).sort({ email: 1 });
    console.log('═══════════════════════════════════════════════');
    console.log('✅ ผู้ใช้ที่เหลือในระบบ:');
    console.log('═══════════════════════════════════════════════\n');

    for (const user of remainingUsers) {
      console.log(`📧 Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Username: ${user.username}`);
      
      if (user.role === 'vendor') {
        const vendor = await Vendor.findOne({ userId: user._id });
        if (vendor) {
          console.log(`   Shop: ${vendor.shopName}`);
          const menuCount = await MenuItem.countDocuments({ vendorId: vendor._id });
          console.log(`   Menus: ${menuCount} รายการ`);
        }
      }
      console.log('');
    }

    console.log('═══════════════════════════════════════════════');
    console.log(`\n✅ สรุป:`);
    console.log(`   - ลบผู้ใช้: ${deletedUsers.deletedCount} บัญชี`);
    console.log(`   - เหลือผู้ใช้: ${remainingUsers.length} บัญชี`);
    console.log(`   - ลบร้านค้า: ${deletedVendors.deletedCount} ร้าน`);
    console.log(`   - ลบเมนู: ${deletedMenus.deletedCount} รายการ`);
    console.log(`   - ลบออเดอร์: ${deletedOrders.deletedCount} รายการ\n`);

    await mongoose.connection.close();
    console.log('✅ Done! Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupUsers();
