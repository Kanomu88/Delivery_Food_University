import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
const Vendor = mongoose.model('Vendor', new mongoose.Schema({}, { strict: false }));
const MenuItem = mongoose.model('MenuItem', new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  name: String,
  nameEn: String,
  description: String,
  descriptionEn: String,
  price: Number,
  category: String,
  image: String,
  isAvailable: Boolean,
  allergenInfo: String,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true }));

const menuItems = [
  {
    name: 'ข้าวผัดกุ้ง',
    nameEn: 'Shrimp Fried Rice',
    description: 'ข้าวผัดกุ้งสดใหม่ หอมกลิ่นกระเทียม',
    descriptionEn: 'Fresh shrimp fried rice with garlic',
    price: 50,
    category: 'rice',
    image: '/images/menus/fried-rice.jpg',
    allergenInfo: 'กุ้ง, ไข่'
  },
  {
    name: 'ผัดกะเพราหมูสับ',
    nameEn: 'Stir-fried Basil with Minced Pork',
    description: 'ผัดกะเพราหมูสับเผ็ดร้อน ไข่ดาว',
    descriptionEn: 'Spicy stir-fried basil with minced pork and fried egg',
    price: 45,
    category: 'rice',
    image: '/images/menus/basil-pork.jpg',
    allergenInfo: 'ไข่'
  },
  {
    name: 'ก๋วยเตี๋ยวหมูตุ๋น',
    nameEn: 'Braised Pork Noodle Soup',
    description: 'ก๋วยเตี๋ยวหมูตุ๋นน้ำใส รสชาติกลมกล่อม',
    descriptionEn: 'Clear soup noodles with braised pork',
    price: 40,
    category: 'noodles',
    image: '/images/menus/pork-noodle.jpg',
    allergenInfo: 'ไข่'
  },
  {
    name: 'ข้าวมันไก่',
    nameEn: 'Chicken Rice',
    description: 'ข้าวมันไก่ต้มนุ่ม เสิร์ฟพร้อมน้ำจิ้ม',
    descriptionEn: 'Steamed chicken with rice and sauce',
    price: 45,
    category: 'rice',
    image: '/images/menus/chicken-rice.jpg',
    allergenInfo: 'ถั่วเหลือง'
  },
  {
    name: 'ส้มตำไทย',
    nameEn: 'Thai Papaya Salad',
    description: 'ส้มตำไทยรสจัดจ้าน เผ็ดร้อน',
    descriptionEn: 'Spicy Thai papaya salad',
    price: 35,
    category: 'appetizer',
    image: '/images/menus/papaya-salad.jpg',
    allergenInfo: 'กุ้ง, ถั่วลิสง'
  },
  {
    name: 'ไก่ทอดหาดใหญ่',
    nameEn: 'Hat Yai Fried Chicken',
    description: 'ไก่ทอดหาดใหญ่กรอบนอกนุ่มใน',
    descriptionEn: 'Crispy Hat Yai style fried chicken',
    price: 55,
    category: 'appetizer',
    image: '/images/menus/fried-chicken.jpg',
    allergenInfo: 'ไข่'
  },
  {
    name: 'ต้มยำกุ้ง',
    nameEn: 'Tom Yum Goong',
    description: 'ต้มยำกุ้งน้ำข้น รสเผ็ดเปรี้ยว',
    descriptionEn: 'Spicy and sour shrimp soup',
    price: 60,
    category: 'soup',
    image: '/images/menus/tom-yum.jpg',
    allergenInfo: 'กุ้ง'
  },
  {
    name: 'ข้าวเหนียวมะม่วง',
    nameEn: 'Mango Sticky Rice',
    description: 'ข้าวเหนียวมะม่วงหวานมัน',
    descriptionEn: 'Sweet mango with sticky rice',
    price: 40,
    category: 'dessert',
    image: '/images/menus/mango-sticky-rice.jpg',
    allergenInfo: 'นม'
  },
  {
    name: 'น้ำมะนาวโซดา',
    nameEn: 'Lime Soda',
    description: 'น้ำมะนาวโซดาสดชื่น',
    descriptionEn: 'Refreshing lime soda',
    price: 25,
    category: 'beverage',
    image: '/images/menus/lime-soda.jpg',
    allergenInfo: ''
  },
  {
    name: 'ชาเย็น',
    nameEn: 'Thai Iced Tea',
    description: 'ชาเย็นหวานมัน รสชาติเข้มข้น',
    descriptionEn: 'Sweet Thai iced tea',
    price: 20,
    category: 'beverage',
    image: '/images/menus/thai-tea.jpg',
    allergenInfo: 'นม'
  }
];

async function createVendorMenus() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find vendor1
    const vendorUser = await User.findOne({ username: 'vendor1' });
    if (!vendorUser) {
      console.log('❌ Vendor user not found');
      return;
    }

    const vendor = await Vendor.findOne({ userId: vendorUser._id });
    if (!vendor) {
      console.log('❌ Vendor profile not found');
      return;
    }

    console.log('✅ Found vendor:', vendor.shopName);
    console.log('   Vendor ID:', vendor._id);

    // Check existing menu items
    const existingMenus = await MenuItem.find({ vendorId: vendor._id });
    console.log(`\nExisting menu items: ${existingMenus.length}`);

    if (existingMenus.length > 0) {
      console.log('\n⚠️ Vendor already has menu items. Delete them first? (y/n)');
      console.log('Deleting existing menus...');
      await MenuItem.deleteMany({ vendorId: vendor._id });
      console.log('✅ Deleted existing menus');
    }

    // Create new menu items
    console.log('\n📝 Creating menu items...');
    const menusToCreate = menuItems.map(item => ({
      ...item,
      vendorId: vendor._id,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const result = await MenuItem.insertMany(menusToCreate);
    console.log(`✅ Created ${result.length} menu items\n`);

    // Display created menus
    console.log('Created menus:');
    result.forEach((menu, index) => {
      console.log(`  ${index + 1}. ${menu.name} (${menu.nameEn}) - ฿${menu.price} - ${menu.category}`);
    });

    // Summary by category
    const byCategory = result.reduce((acc, menu) => {
      acc[menu.category] = (acc[menu.category] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Summary by category:');
    Object.entries(byCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} items`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createVendorMenus();
