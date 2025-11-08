import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
  phone: String,
  address: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

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

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Menu = mongoose.models.Menu || mongoose.model('Menu', menuSchema);

// Seed data
const seedData = async () => {
  try {
    console.log('🌱 Starting to seed data...');

    // Clear existing data
    await User.deleteMany({});
    await Menu.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = await User.create({
      email: 'admin@canteen.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      phone: '0812345678',
    });

    const vendor1 = await User.create({
      email: 'vendor1@canteen.com',
      password: hashedPassword,
      name: 'ร้านข้าวมันไก่',
      role: 'vendor',
      phone: '0823456789',
    });

    const vendor2 = await User.create({
      email: 'vendor2@canteen.com',
      password: hashedPassword,
      name: 'ร้านก่วยเตี๋ยว',
      role: 'vendor',
      phone: '0834567890',
    });

    const vendor3 = await User.create({
      email: 'vendor3@canteen.com',
      password: hashedPassword,
      name: 'ร้านอาหารตามสั่ง',
      role: 'vendor',
      phone: '0845678901',
    });

    const customer = await User.create({
      email: 'customer@test.com',
      password: hashedPassword,
      name: 'Test Customer',
      role: 'customer',
      phone: '0856789012',
      address: 'มหาวิทยาลัย',
    });

    console.log('✅ Created users');

    // Create menus
    const menus = [
      // ร้านข้าวมันไก่
      {
        name: 'ข้าวมันไก่ทอด',
        description: 'ข้าวมันไก่ทอดกรอบ เสิร์ฟพร้อมน้ำจิ้มรสเด็ด',
        price: 45,
        category: 'อาหารจานหลัก',
        vendor: vendor1._id,
        available: true,
        preparationTime: 15,
        tags: ['ไก่', 'ข้าว', 'ทอด'],
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
      },
      {
        name: 'ข้าวมันไก่ต้ม',
        description: 'ข้าวมันไก่ต้มนุ่ม เนื้อไก่ชุ่มฉ่ำ',
        price: 40,
        category: 'อาหารจานหลัก',
        vendor: vendor1._id,
        available: true,
        preparationTime: 15,
        tags: ['ไก่', 'ข้าว', 'ต้ม'],
        image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400',
      },
      {
        name: 'ข้าวมันไก่ผสม',
        description: 'ข้าวมันไก่ทั้งทอดและต้ม คุ้มค่า',
        price: 50,
        category: 'อาหารจานหลัก',
        vendor: vendor1._id,
        available: true,
        preparationTime: 15,
        tags: ['ไก่', 'ข้าว', 'ผสม'],
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
      },

      // ร้านก่วยเตี๋ยว
      {
        name: 'ก่วยเตี๋ยวหมูน้ำใส',
        description: 'ก่วยเตี๋ยวหมูน้ำใส น้ำซุปกระดูกหมูเข้มข้น',
        price: 35,
        category: 'ก่วยเตี๋ยว',
        vendor: vendor2._id,
        available: true,
        preparationTime: 10,
        tags: ['ก่วยเตี๋ยว', 'หมู', 'น้ำใส'],
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
      },
      {
        name: 'ก่วยเตี๋ยวหมูน้ำตก',
        description: 'ก่วยเตี๋ยวหมูน้ำตก รสจัดจ้าน',
        price: 40,
        category: 'ก่วยเตี๋ยว',
        vendor: vendor2._id,
        available: true,
        preparationTime: 10,
        tags: ['ก่วยเตี๋ยว', 'หมู', 'น้ำตก'],
        image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
      },
      {
        name: 'ก่วยเตี๋ยวเรือ',
        description: 'ก่วยเตี๋ยวเรือ รสชาติต้นตำรับ',
        price: 45,
        category: 'ก่วยเตี๋ยว',
        vendor: vendor2._id,
        available: true,
        preparationTime: 12,
        tags: ['ก่วยเตี๋ยว', 'เรือ'],
        image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400',
      },
      {
        name: 'บะหมี่หมูแดง',
        description: 'บะหมี่หมูแดง เส้นเหนียวนุ่ม',
        price: 40,
        category: 'ก่วยเตี๋ยว',
        vendor: vendor2._id,
        available: true,
        preparationTime: 10,
        tags: ['บะหมี่', 'หมูแดง'],
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400',
      },

      // ร้านอาหารตามสั่ง
      {
        name: 'ข้าวผัดกระเพราหมูสับ',
        description: 'ข้าวผัดกระเพราหมูสับ เผ็ดร้อนจัดจ้าน',
        price: 45,
        category: 'อาหารจานหลัก',
        vendor: vendor3._id,
        available: true,
        preparationTime: 12,
        tags: ['ข้าวผัด', 'กระเพรา', 'หมู'],
        image: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400',
      },
      {
        name: 'ข้าวผัดกระเพราไก่',
        description: 'ข้าวผัดกระเพราไก่ ไข่ดาว',
        price: 45,
        category: 'อาหารจานหลัก',
        vendor: vendor3._id,
        available: true,
        preparationTime: 12,
        tags: ['ข้าวผัด', 'กระเพรา', 'ไก่'],
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400',
      },
      {
        name: 'ผัดกะเพราทะเล',
        description: 'ผัดกะเพราทะเล อาหารทะเลสดใหม่',
        price: 60,
        category: 'อาหารจานหลัก',
        vendor: vendor3._id,
        available: true,
        preparationTime: 15,
        tags: ['ผัด', 'กะเพรา', 'ทะเล'],
        image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400',
      },
      {
        name: 'ผัดไทยกุ้งสด',
        description: 'ผัดไทยกุ้งสด รสชาติต้นตำรับ',
        price: 50,
        category: 'อาหารจานหลัก',
        vendor: vendor3._id,
        available: true,
        preparationTime: 12,
        tags: ['ผัดไทย', 'กุ้ง'],
        image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400',
      },
      {
        name: 'ต้มยำกุ้ง',
        description: 'ต้มยำกุ้ง รสเผ็ดเปรี้ยว',
        price: 55,
        category: 'ต้ม',
        vendor: vendor3._id,
        available: true,
        preparationTime: 15,
        tags: ['ต้มยำ', 'กุ้ง', 'เผ็ด'],
        image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400',
      },

      // เครื่องดื่ม
      {
        name: 'น้ำเปล่า',
        description: 'น้ำดื่มบรรจุขวด',
        price: 10,
        category: 'เครื่องดื่ม',
        vendor: vendor1._id,
        available: true,
        preparationTime: 1,
        tags: ['น้ำ'],
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
      },
      {
        name: 'โค้ก',
        description: 'โคคา-โคล่า เย็นๆ',
        price: 15,
        category: 'เครื่องดื่ม',
        vendor: vendor2._id,
        available: true,
        preparationTime: 1,
        tags: ['น้ำอัดลม'],
        image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
      },
      {
        name: 'ชาเย็น',
        description: 'ชาเย็นหวานมัน',
        price: 20,
        category: 'เครื่องดื่ม',
        vendor: vendor3._id,
        available: true,
        preparationTime: 3,
        tags: ['ชา', 'เย็น'],
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
      },
    ];

    await Menu.insertMany(menus);
    console.log('✅ Created menus');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📝 Test Accounts:');
    console.log('Admin: admin@canteen.com / password123');
    console.log('Vendor 1: vendor1@canteen.com / password123');
    console.log('Vendor 2: vendor2@canteen.com / password123');
    console.log('Vendor 3: vendor3@canteen.com / password123');
    console.log('Customer: customer@test.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run
connectDB().then(seedData);
