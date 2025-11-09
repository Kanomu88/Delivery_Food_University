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
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  name: { type: String, required: true },
  nameEn: String,
  description: String,
  descriptionEn: String,
  price: { type: Number, required: true },
  image: String,
  category: String,
  allergenInfo: String,
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Vendor = mongoose.model('Vendor', vendorSchema);
const MenuItem = mongoose.model('MenuItem', menuItemSchema);

const sampleMenus = [
  // อาหารจานหลัก (Main Dishes)
  {
    name: 'ข้าวผัดกุ้ง',
    nameEn: 'Shrimp Fried Rice',
    description: 'ข้าวผัดกุ้งสดใหม่ ปรุงรสชาติกลมกล่อม เสิร์ฟพร้อมผักสด',
    descriptionEn: 'Fresh shrimp fried rice with vegetables',
    price: 50,
    category: 'main_dish',
    allergenInfo: 'กุ้ง, ไข่',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400'
  },
  {
    name: 'ข้าวผัดไก่',
    nameEn: 'Chicken Fried Rice',
    description: 'ข้าวผัดไก่หอมกรุ่น ผัดกับผักสดใหม่',
    descriptionEn: 'Aromatic chicken fried rice with fresh vegetables',
    price: 45,
    category: 'main_dish',
    allergenInfo: 'ไข่',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400'
  },
  {
    name: 'ผัดกะเพราหมูสับ',
    nameEn: 'Stir-fried Basil with Minced Pork',
    description: 'หมูสับผัดกะเพราใบโหระพา เสิร์ฟพร้อมไข่ดาว',
    descriptionEn: 'Spicy stir-fried minced pork with basil and fried egg',
    price: 45,
    category: 'main_dish',
    allergenInfo: 'ไข่',
    image: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400'
  },
  {
    name: 'ข้าวขาหมู',
    nameEn: 'Braised Pork Leg Rice',
    description: 'ขาหมูตุ๋นนุ่ม ราดน้ำซอสเข้มข้น เสิร์ฟกับข้าวสวย',
    descriptionEn: 'Tender braised pork leg with rice',
    price: 55,
    category: 'main_dish',
    allergenInfo: 'ไม่มี',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'
  },
  {
    name: 'ข้าวมันไก่',
    nameEn: 'Chicken Rice',
    description: 'ข้าวมันไก่ต้มนุ่ม เสิร์ฟพร้อมน้ำจิ้มรสเด็ด',
    descriptionEn: 'Hainanese chicken rice with special sauce',
    price: 45,
    category: 'main_dish',
    allergenInfo: 'ไม่มี',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400'
  },
  {
    name: 'ก๋วยเตี๋ยวเนื้อตุ๋น',
    nameEn: 'Beef Noodle Soup',
    description: 'ก๋วยเตี๋ยวเนื้อตุ๋นนุ่ม น้ำซุปกลมกล่อม',
    descriptionEn: 'Tender beef noodle soup',
    price: 50,
    category: 'main_dish',
    allergenInfo: 'ไข่',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400'
  },
  {
    name: 'ข้าวหมูแดง',
    nameEn: 'BBQ Pork Rice',
    description: 'หมูแดงหั่นชิ้นพอดีคำ ราดน้ำซอสหวาน',
    descriptionEn: 'BBQ pork with sweet sauce over rice',
    price: 45,
    category: 'main_dish',
    allergenInfo: 'ไม่มี',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400'
  },
  {
    name: 'ผัดไทยกุ้งสด',
    nameEn: 'Pad Thai with Shrimp',
    description: 'ผัดไทยรสชาติต้นตำรับ กุ้งสดใหญ่ เส้นเหนียวนุ่ม',
    descriptionEn: 'Authentic Pad Thai with fresh large shrimp',
    price: 55,
    category: 'main_dish',
    allergenInfo: 'กุ้ง, ไข่, ถั่ว',
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400'
  },
  {
    name: 'ต้มยำกุ้ง',
    nameEn: 'Tom Yum Goong',
    description: 'ต้มยำกุ้งน้ำข้น รสจัดจ้าน เผ็ดร้อน เปรี้ยว',
    descriptionEn: 'Spicy and sour Thai soup with shrimp',
    price: 60,
    category: 'main_dish',
    allergenInfo: 'กุ้ง',
    image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400'
  },
  {
    name: 'ส้มตำไทย',
    nameEn: 'Thai Papaya Salad',
    description: 'ส้มตำรสชาติต้นตำรับ เผ็ดร้อนกำลังดี',
    descriptionEn: 'Traditional spicy green papaya salad',
    price: 35,
    category: 'main_dish',
    allergenInfo: 'กุ้ง, ถั่ว',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400'
  },
  {
    name: 'แกงเขียวหวานไก่',
    nameEn: 'Green Curry Chicken',
    description: 'แกงเขียวหวานไก่ กะทิเข้มข้น เครื่องแกงหอมกรุ่น',
    descriptionEn: 'Thai green curry with chicken in coconut milk',
    price: 50,
    category: 'main_dish',
    allergenInfo: 'นม',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400'
  },
  
  // ของว่าง (Snacks)
  {
    name: 'ขนมปังปิ้งเนยนม',
    nameEn: 'Butter Toast',
    description: 'ขนมปังปิ้งกรอบ ทาเนยสด โรยนมข้นหวาน',
    descriptionEn: 'Crispy toast with butter and condensed milk',
    price: 25,
    category: 'snack',
    allergenInfo: 'นม, ไข่, ข้าวสาลี',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'
  },
  {
    name: 'ปาท่องโก๋',
    nameEn: 'Chinese Donut',
    description: 'ปาท่องโก๋ทอดกรอบ เสิร์ฟพร้อมน้ำเต้าหู้',
    descriptionEn: 'Crispy Chinese donut with soy milk',
    price: 20,
    category: 'snack',
    allergenInfo: 'ข้าวสาลี, ถั่วเหลือง',
    image: 'https://images.unsplash.com/photo-1541599468348-e96984315921?w=400'
  },
  {
    name: 'ไก่ทอด',
    nameEn: 'Fried Chicken',
    description: 'ไก่ทอดกรอบนอกนุ่มใน เสิร์ฟพร้อมซอสมะนาว',
    descriptionEn: 'Crispy fried chicken with lime sauce',
    price: 35,
    category: 'snack',
    allergenInfo: 'ไข่, ข้าวสาลี',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400'
  },
  {
    name: 'ปอเปี๊ยะทอด',
    nameEn: 'Spring Rolls',
    description: 'ปอเปี๊ยะทอดกรอบ ไส้ผักและเนื้อสัตว์',
    descriptionEn: 'Crispy spring rolls with vegetables and meat',
    price: 30,
    category: 'snack',
    allergenInfo: 'ข้าวสาลี',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400'
  },
  
  // เครื่องดื่ม (Beverages)
  {
    name: 'ชาเย็น',
    nameEn: 'Thai Iced Tea',
    description: 'ชาไทยเย็นชื่นใจ หอมกลิ่นชา หวานกำลังดี',
    descriptionEn: 'Sweet Thai iced tea',
    price: 20,
    category: 'beverage',
    allergenInfo: 'นม',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'
  },
  {
    name: 'กาแฟเย็น',
    nameEn: 'Iced Coffee',
    description: 'กาแฟเย็นหอมกรุ่น ชื่นใจ',
    descriptionEn: 'Refreshing iced coffee',
    price: 25,
    category: 'beverage',
    allergenInfo: 'นม',
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400'
  },
  {
    name: 'น้ำส้มคั้น',
    nameEn: 'Fresh Orange Juice',
    description: 'น้ำส้มคั้นสด 100% ไม่ใส่น้ำตาล',
    descriptionEn: '100% fresh orange juice, no sugar added',
    price: 30,
    category: 'beverage',
    allergenInfo: 'ไม่มี',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400'
  },
  {
    name: 'น้ำเปล่า',
    nameEn: 'Water',
    description: 'น้ำดื่มบรรจุขวด',
    descriptionEn: 'Bottled water',
    price: 10,
    category: 'beverage',
    allergenInfo: 'ไม่มี',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400'
  },
  {
    name: 'โกโก้เย็น',
    nameEn: 'Iced Chocolate',
    description: 'โกโก้เย็นหอมมัน รสชาติเข้มข้น',
    descriptionEn: 'Rich and creamy iced chocolate',
    price: 25,
    category: 'beverage',
    allergenInfo: 'นม',
    image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400'
  },
  {
    name: 'น้ำมะนาว',
    nameEn: 'Lime Juice',
    description: 'น้ำมะนาวสดชื่น เปรี้ยวหวานกำลังดี',
    descriptionEn: 'Refreshing lime juice',
    price: 20,
    category: 'beverage',
    allergenInfo: 'ไม่มี',
    image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=400'
  },
  
  // ของหวาน (Desserts)
  {
    name: 'ข้าวเหนียวมะม่วง',
    nameEn: 'Mango Sticky Rice',
    description: 'ข้าวเหนียวหอมมะลิ ราดกะทิ เสิร์ฟพร้อมมะม่วงสุก',
    descriptionEn: 'Sweet sticky rice with ripe mango and coconut milk',
    price: 40,
    category: 'dessert',
    allergenInfo: 'นม',
    image: 'https://images.unsplash.com/photo-1598511726623-d2e9996892f0?w=400'
  },
  {
    name: 'บัวลอย',
    nameEn: 'Sweet Rice Balls in Coconut Milk',
    description: 'บัวลอยสีสันสดใส ในน้ำกะทิหวานมัน',
    descriptionEn: 'Colorful rice balls in sweet coconut milk',
    price: 25,
    category: 'dessert',
    allergenInfo: 'นม',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400'
  },
  {
    name: 'ทับทิมกรอบ',
    nameEn: 'Red Rubies in Coconut Milk',
    description: 'ทับทิมกรอบเย็นชื่นใจ ในน้ำกะทิหวาน',
    descriptionEn: 'Water chestnuts in sweet coconut milk with ice',
    price: 30,
    category: 'dessert',
    allergenInfo: 'นม',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400'
  },
  {
    name: 'กล้วยบวชชี',
    nameEn: 'Banana in Coconut Milk',
    description: 'กล้วยน้ำว้าสุกบวชในน้ำกะทิหวาน',
    descriptionEn: 'Ripe banana in sweet coconut milk',
    price: 25,
    category: 'dessert',
    allergenInfo: 'นม',
    image: 'https://images.unsplash.com/photo-1587241321921-91a834d82ffc?w=400'
  }
];

async function createSampleMenus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find vendor
    const vendorUser = await User.findOne({ email: 'vendor@test.com' });
    if (!vendorUser) {
      console.log('❌ Vendor user not found. Please run createTestUsers.js first.');
      process.exit(1);
    }

    const vendor = await Vendor.findOne({ userId: vendorUser._id });
    if (!vendor) {
      console.log('❌ Vendor shop not found. Please run createTestUsers.js first.');
      process.exit(1);
    }

    console.log('✅ Found vendor:', vendor.shopName);

    // Clear existing menus
    await MenuItem.deleteMany({ vendorId: vendor._id });
    console.log('🗑️  Cleared existing menus');

    // Create sample menus
    const menus = sampleMenus.map(menu => ({
      ...menu,
      vendorId: vendor._id
    }));

    const createdMenus = await MenuItem.insertMany(menus);
    console.log(`✅ Created ${createdMenus.length} sample menu items`);

    console.log('\n📋 Sample Menus Created:');
    console.log('═══════════════════════════════════════════════');
    
    const categories = {
      main_dish: 'อาหารจานหลัก',
      snack: 'ของว่าง',
      beverage: 'เครื่องดื่ม',
      dessert: 'ของหวาน'
    };

    for (const [key, label] of Object.entries(categories)) {
      const items = createdMenus.filter(m => m.category === key);
      if (items.length > 0) {
        console.log(`\n${label}:`);
        items.forEach(item => {
          console.log(`   - ${item.name} (${item.nameEn}) - ฿${item.price}`);
        });
      }
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log(`\n✅ Total: ${createdMenus.length} menu items created for "${vendor.shopName}"`);

    await mongoose.connection.close();
    console.log('\n✅ Done! Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createSampleMenus();
