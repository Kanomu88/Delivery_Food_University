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
  role: String,
}, { timestamps: true });

const vendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shopName: String,
}, { timestamps: true });

const menuItemSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Vendor = mongoose.model('Vendor', vendorSchema);
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}).sort({ role: 1, email: 1 });
    
    console.log('═══════════════════════════════════════════════');
    console.log('👥 ผู้ใช้ทั้งหมดในระบบ');
    console.log('═══════════════════════════════════════════════\n');

    const roleIcons = {
      admin: '👨‍💼',
      vendor: '🏪',
      customer: '👤'
    };

    const roleNames = {
      admin: 'แอดมิน',
      vendor: 'ร้านค้า',
      customer: 'ลูกค้า'
    };

    for (const user of users) {
      const icon = roleIcons[user.role] || '👤';
      const roleName = roleNames[user.role] || user.role;
      
      console.log(`${icon} ${roleName.toUpperCase()}`);
      console.log('─'.repeat(50));
      console.log(`   Email:    ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Role:     ${user.role}`);
      console.log(`   Created:  ${user.createdAt.toLocaleDateString('th-TH')}`);
      
      if (user.role === 'vendor') {
        const vendor = await Vendor.findOne({ userId: user._id });
        if (vendor) {
          console.log(`   Shop:     ${vendor.shopName}`);
          const menuCount = await MenuItem.countDocuments({ vendorId: vendor._id });
          console.log(`   Menus:    ${menuCount} รายการ`);
        }
      }
      console.log('');
    }

    console.log('═══════════════════════════════════════════════');
    console.log(`\n📊 สรุป: มีผู้ใช้ทั้งหมด ${users.length} บัญชี\n`);

    const roleCount = {};
    users.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });

    console.log('จำนวนตาม Role:');
    Object.entries(roleCount).forEach(([role, count]) => {
      const icon = roleIcons[role] || '👤';
      const roleName = roleNames[role] || role;
      console.log(`   ${icon} ${roleName}: ${count} บัญชี`);
    });

    console.log('\n═══════════════════════════════════════════════\n');

    await mongoose.connection.close();
    console.log('✅ Done! Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listUsers();
