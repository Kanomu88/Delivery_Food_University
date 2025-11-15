import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.production') });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const vendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  location: String,
  isActive: { type: Boolean, default: true },
  acceptingOrders: { type: Boolean, default: true },
}, { timestamps: true });

const Vendor = mongoose.model('Vendor', vendorSchema);

const menuSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  imageUrl: String,
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const Menu = mongoose.model('Menu', menuSchema);

const newMenus = [
  // อาหารจานหลัก (5 รายการ)
  { name: 'ข้าวผัดกระเพรา', description: 'ข้าวผัดกระเพราไก่ ไข่ดาว', price: 45, category: 'อาหารจานหลัก', imageUrl: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400' },
  { name: 'ข้าวผัดอเมริกัน', description: 'ข้าวผัดอเมริกันพร้อมไข่ดาว', price: 50, category: 'อาหารจานหลัก', imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
  { name: 'ผัดไทย', description: 'ผัดไทยกุ้งสด', price: 55, category: 'อาหารจานหลัก', imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400' },
  { name: 'ข้าวขาหมู', description: 'ข้าวขาหมูตุ๋นเปื่อย', price: 60, category: 'อาหารจานหลัก', imageUrl: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400' },
  { name: 'ข้าวมันไก่', description: 'ข้าวมันไก่ทอด พร้อมน้ำจิ้ม', price: 50, category: 'อาหารจานหลัก', imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400' },

  // ของว่าง (2 รายการ)
  { name: 'ไก่ทอด', description: 'ไก่ทอดกรอบ 3 ชิ้น', price: 35, category: 'ของว่าง', imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400' },
  { name: 'ทอดมันปลา', description: 'ทอดมันปลา 5 ชิ้น', price: 35, category: 'ของว่าง', imageUrl: 'https://images.unsplash.com/photo-1625937286074-9ca519d5d9df?w=400' },

  // เครื่องดื่ม (3 รายการ)
  { name: 'ชาเย็น', description: 'ชาเย็นหวานมัน', price: 20, category: 'เครื่องดื่ม', imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400' },
  { name: 'กาแฟเย็น', description: 'กาแฟเย็นหอมกรุ่น', price: 25, category: 'เครื่องดื่ม', imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },
  { name: 'น้ำเปล่า', description: 'น้ำเปล่า', price: 10, category: 'เครื่องดื่ม', imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400' },
];

async function add10Menus() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!\n');

    // Find vendor1@test.com
    const vendorUser = await User.findOne({ email: 'vendor1@test.com' });
    if (!vendorUser) {
      console.error('❌ Vendor user not found!');
      return;
    }

    const vendor = await Vendor.findOne({ userId: vendorUser._id });
    if (!vendor) {
      console.error('❌ Vendor profile not found!');
      return;
    }

    console.log(`Found vendor: ${vendor.name}`);
    console.log(`Vendor ID: ${vendor._id}\n`);

    // Delete ALL menus (including other vendors)
    const deleteResult = await Menu.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} old menus (all vendors)\n`);

    // Create 10 new menus for current vendor only
    console.log('Creating 10 new menus for ร้านอาหารทดสอบ 1...');
    const menusToCreate = newMenus.map(menu => ({
      ...menu,
      vendorId: vendor._id,
      isAvailable: true,
    }));

    const createdMenus = await Menu.insertMany(menusToCreate);
    console.log(`✅ Created ${createdMenus.length} new menus\n`);

    // Show summary by category
    const categories = ['อาหารจานหลัก', 'ของว่าง', 'เครื่องดื่ม'];
    console.log('Summary by category:');
    for (const category of categories) {
      const count = createdMenus.filter(m => m.category === category).length;
      console.log(`  ${category}: ${count} รายการ`);
    }

    console.log('\n✅ Menu setup completed successfully!');
    console.log(`\nTotal menus: ${createdMenus.length} รายการ`);
    console.log(`Vendor: ${vendor.name}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

add10Menus();
