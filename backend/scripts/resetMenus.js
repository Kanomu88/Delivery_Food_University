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

const sampleMenus = [
  // อาหารจานหลัก
  { name: 'ข้าวผัดกระเพรา', description: 'ข้าวผัดกระเพราไก่ ไข่ดาว', price: 45, category: 'อาหารจานหลัก', imageUrl: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400' },
  { name: 'ข้าวผัดอเมริกัน', description: 'ข้าวผัดอเมริกันพร้อมไข่ดาว', price: 50, category: 'อาหารจานหลัก', imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
  { name: 'ผัดไทย', description: 'ผัดไทยกุ้งสด', price: 55, category: 'อาหารจานหลัก', imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400' },
  { name: 'ข้าวขาหมู', description: 'ข้าวขาหมูตุ๋นเปื่อย', price: 60, category: 'อาหารจานหลัก', imageUrl: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400' },
  { name: 'ข้าวมันไก่', description: 'ข้าวมันไก่ทอด พร้อมน้ำจิ้ม', price: 50, category: 'อาหารจานหลัก', imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400' },
  { name: 'ก๋วยเตี๋ยวเนื้อ', description: 'ก๋วยเตี๋ยวเนื้อน้ำใส', price: 45, category: 'อาหารจานหลัก', imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400' },
  { name: 'ข้าวหมูแดง', description: 'ข้าวหมูแดงหมูกรอบ', price: 50, category: 'อาหารจานหลัก', imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400' },
  { name: 'ส้มตำ', description: 'ส้มตำไทย เผ็ดร้อน', price: 40, category: 'อาหารจานหลัก', imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400' },

  // ของว่าง
  { name: 'ปอเปี๊ยะทอด', description: 'ปอเปี๊ยะทอดกรอบ 5 ชิ้น', price: 30, category: 'ของว่าง', imageUrl: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=400' },
  { name: 'ไก่ทอด', description: 'ไก่ทอดกรอบ 3 ชิ้น', price: 35, category: 'ของว่าง', imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400' },
  { name: 'ขนมปังปิ้ง', description: 'ขนมปังปิ้งเนยนม', price: 25, category: 'ของว่าง', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
  { name: 'ทอดมันปลา', description: 'ทอดมันปลา 5 ชิ้น', price: 35, category: 'ของว่าง', imageUrl: 'https://images.unsplash.com/photo-1625937286074-9ca519d5d9df?w=400' },

  // เครื่องดื่ม
  { name: 'ชาเย็น', description: 'ชาเย็นหวานมัน', price: 20, category: 'เครื่องดื่ม', imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400' },
  { name: 'กาแฟเย็น', description: 'กาแฟเย็นหอมกรุ่น', price: 25, category: 'เครื่องดื่ม', imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },
  { name: 'น้ำส้ม', description: 'น้ำส้มคั้นสด', price: 30, category: 'เครื่องดื่ม', imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' },
  { name: 'น้ำเปล่า', description: 'น้ำเปล่า', price: 10, category: 'เครื่องดื่ม', imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400' },
  { name: 'โกโก้เย็น', description: 'โกโก้เย็นหวานมัน', price: 25, category: 'เครื่องดื่ม', imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400' },

  // ของหวาน
  { name: 'ขนมถ้วย', description: 'ขนมถ้วย 3 ชิ้น', price: 20, category: 'ของหวาน', imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
  { name: 'กล้วยทอด', description: 'กล้วยทอดกรอบ', price: 25, category: 'ของหวาน', imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400' },
  { name: 'ไอศกรีม', description: 'ไอศกรีมวานิลลา', price: 30, category: 'ของหวาน', imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
  { name: 'ขนมครก', description: 'ขนมครก 5 ชิ้น', price: 20, category: 'ของหวาน', imageUrl: 'https://images.unsplash.com/photo-1587241321921-91a834d82e01?w=400' },
];

async function resetMenus() {
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

    // Delete all old menus
    const deleteResult = await Menu.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} old menus\n`);

    // Create new menus for current vendor
    console.log('Creating new menus...');
    const menusToCreate = sampleMenus.map(menu => ({
      ...menu,
      vendorId: vendor._id,
      isAvailable: true,
    }));

    const createdMenus = await Menu.insertMany(menusToCreate);
    console.log(`✅ Created ${createdMenus.length} new menus\n`);

    // Show summary by category
    const categories = ['อาหารจานหลัก', 'ของว่าง', 'เครื่องดื่ม', 'ของหวาน'];
    console.log('Summary by category:');
    for (const category of categories) {
      const count = createdMenus.filter(m => m.category === category).length;
      console.log(`  ${category}: ${count} รายการ`);
    }

    console.log('\n✅ Menu reset completed successfully!');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetMenus();
