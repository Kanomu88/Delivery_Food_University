import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.production') });

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  image: String,
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  available: { type: Boolean, default: true },
  preparationTime: Number,
  tags: [String],
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
  phone: String,
  address: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Menu = mongoose.models.Menu || mongoose.model('Menu', menuSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

const sampleMenus = [
  // ร้านอาหารไทย
  {
    name: 'ข้าวผัดกุ้ง',
    description: 'ข้าวผัดกุ้งสดใหม่ ปรุงรสชาติกลมกล่อม',
    price: 45,
    category: 'อาหารไทย',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
    preparationTime: 15,
    tags: ['ยอดนิยม', 'เผ็ด'],
  },
  {
    name: 'ผัดไทยกุ้งสด',
    description: 'ผัดไทยรสชาติต้นตำรับ กุ้งสดใหญ่',
    price: 50,
    category: 'อาหารไทย',
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400',
    preparationTime: 20,
    tags: ['ยอดนิยม'],
  },
  {
    name: 'ต้มยำกุ้ง',
    description: 'ต้มยำกุ้งน้ำข้น รสจัดจ้าน',
    price: 60,
    category: 'อาหารไทย',
    image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400',
    preparationTime: 25,
    tags: ['เผ็ด', 'ยอดนิยม'],
  },
  {
    name: 'ส้มตำไทย',
    description: 'ส้มตำไทยรสชาติดั้งเดิม',
    price: 35,
    category: 'อาหารไทย',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400',
    preparationTime: 10,
    tags: ['เผ็ด'],
  },
  {
    name: 'ข้าวมันไก่',
    description: 'ข้าวมันไก่ต้มนุ่ม เสิร์ฟพร้อมน้ำจิ้ม',
    price: 40,
    category: 'อาหารไทย',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400',
    preparationTime: 15,
    tags: ['ยอดนิยม'],
  },
  // ร้านอาหารญี่ปุ่น
  {
    name: 'ราเมนหมูชาชู',
    description: 'ราเมนน้ำซุปเข้มข้น หมูชาชูนุ่ม',
    price: 85,
    category: 'อาหารญี่ปุ่น',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    preparationTime: 20,
    tags: ['ยอดนิยม'],
  },
  {
    name: 'ข้าวหน้าแซลมอน',
    description: 'ข้าวญี่ปุ่นหน้าแซลมอนสดใหม่',
    price: 95,
    category: 'อาหารญี่ปุ่น',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
    preparationTime: 15,
    tags: ['ยอดนิยม'],
  },
  {
    name: 'ซูชิรวม',
    description: 'ซูชิหลากหลายชนิด สดใหม่ทุกวัน',
    price: 120,
    category: 'อาหารญี่ปุ่น',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
    preparationTime: 25,
    tags: ['พรีเมียม'],
  },
  {
    name: 'ข้าวหน้าไก่เทอริยากิ',
    description: 'ข้าวหน้าไก่เทอริยากิ รสชาติหวานมัน',
    price: 75,
    category: 'อาหารญี่ปุ่น',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
    preparationTime: 15,
    tags: [],
  },
  // ร้านอาหารฟาสต์ฟู้ด
  {
    name: 'เบอร์เกอร์เนื้อชีส',
    description: 'เบอร์เกอร์เนื้อชั้นดี พร้อมชีสละลาย',
    price: 65,
    category: 'ฟาสต์ฟู้ด',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    preparationTime: 15,
    tags: ['ยอดนิยม'],
  },
  {
    name: 'ไก่ทอดกรอบ',
    description: 'ไก่ทอดกรอบนอกนุ่มใน',
    price: 55,
    category: 'ฟาสต์ฟู้ด',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400',
    preparationTime: 20,
    tags: ['ยอดนิยม'],
  },
  {
    name: 'พิซซ่าชีส',
    description: 'พิซซ่าชีสเยิ้ม หน้าหนา',
    price: 120,
    category: 'ฟาสต์ฟู้ด',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    preparationTime: 25,
    tags: [],
  },
  {
    name: 'เฟรนช์ฟรายส์',
    description: 'มันฝรั่งทอดกรอบ เสิร์ฟร้อนๆ',
    price: 35,
    category: 'ฟาสต์ฟู้ด',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
    preparationTime: 10,
    tags: [],
  },
  // เครื่องดื่ม
  {
    name: 'ชาเขียวเย็น',
    description: 'ชาเขียวสดชื่น',
    price: 25,
    category: 'เครื่องดื่ม',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    preparationTime: 5,
    tags: [],
  },
  {
    name: 'กาแฟเย็น',
    description: 'กาแฟเข้มข้น หอมกรุ่น',
    price: 30,
    category: 'เครื่องดื่ม',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
    preparationTime: 5,
    tags: ['ยอดนิยม'],
  },
  {
    name: 'น้ำส้มคั้น',
    description: 'น้ำส้มคั้นสดใหม่',
    price: 35,
    category: 'เครื่องดื่ม',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
    preparationTime: 5,
    tags: [],
  },
];

async function seedMenus() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // หา vendors ทั้งหมด
    const vendors = await User.find({ role: 'vendor' });
    
    if (vendors.length === 0) {
      console.log('No vendors found. Please create vendors first.');
      process.exit(1);
    }

    console.log(`Found ${vendors.length} vendors`);

    // ลบเมนูเก่าทั้งหมด
    await Menu.deleteMany({});
    console.log('Cleared existing menus');

    // สร้างเมนูใหม่ แบ่งให้แต่ละ vendor
    const menusPerVendor = Math.ceil(sampleMenus.length / vendors.length);
    let menuIndex = 0;

    for (const vendor of vendors) {
      const vendorMenus = sampleMenus.slice(menuIndex, menuIndex + menusPerVendor);
      
      for (const menuData of vendorMenus) {
        await Menu.create({
          ...menuData,
          vendor: vendor._id,
        });
      }

      console.log(`Created ${vendorMenus.length} menus for vendor: ${vendor.name}`);
      menuIndex += menusPerVendor;
    }

    const totalMenus = await Menu.countDocuments();
    console.log(`\n✅ Successfully created ${totalMenus} menus`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding menus:', error);
    process.exit(1);
  }
}

seedMenus();
