import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
  firstName: String,
  lastName: String,
  phone: String,
  status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
  language: { type: String, enum: ['th', 'en'], default: 'th' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Vendor Schema
const vendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopName: { type: String, required: true },
  description: String,
  logo: String,
  status: { type: String, enum: ['pending', 'approved', 'suspended'], default: 'approved' },
  isAcceptingOrders: { type: Boolean, default: true },
}, { timestamps: true });

const Vendor = mongoose.model('Vendor', vendorSchema);

async function createTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing test users
    await User.deleteMany({ email: { $in: ['customer@test.com', 'admin@test.com', 'vendor@test.com'] } });
    console.log('🗑️  Cleared existing test users');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);

    // 1. Create Customer
    const customer = await User.create({
      username: 'customer1',
      email: 'customer@test.com',
      password: hashedPassword,
      role: 'customer',
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      phone: '0812345678',
      status: 'active',
      language: 'th'
    });
    console.log('✅ Created Customer:', customer.username);

    // 2. Create Admin
    const admin = await User.create({
      username: 'admin1',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      firstName: 'ผู้ดูแล',
      lastName: 'ระบบ',
      phone: '0823456789',
      status: 'active',
      language: 'th'
    });
    console.log('✅ Created Admin:', admin.username);

    // 3. Create Vendor User
    const vendorUser = await User.create({
      username: 'vendor1',
      email: 'vendor@test.com',
      password: hashedPassword,
      role: 'vendor',
      firstName: 'สมหญิง',
      lastName: 'ขายดี',
      phone: '0834567890',
      status: 'active',
      language: 'th'
    });
    console.log('✅ Created Vendor User:', vendorUser.username);

    // 4. Create Vendor Shop
    const vendor = await Vendor.create({
      userId: vendorUser._id,
      shopName: 'ร้านอาหารตามสั่ง',
      description: 'อาหารไทยรสชาติต้นตำรับ สดใหม่ทุกวัน',
      status: 'approved',
      isAcceptingOrders: true
    });
    console.log('✅ Created Vendor Shop:', vendor.shopName);

    console.log('\n📋 Test Accounts Summary:');
    console.log('═══════════════════════════════════════════════');
    console.log('\n👤 Customer Account:');
    console.log('   Email: customer@test.com');
    console.log('   Password: password123');
    console.log('   Role: customer');
    console.log('\n👨‍💼 Admin Account:');
    console.log('   Email: admin@test.com');
    console.log('   Password: password123');
    console.log('   Role: admin');
    console.log('\n🏪 Vendor Account:');
    console.log('   Email: vendor@test.com');
    console.log('   Password: password123');
    console.log('   Role: vendor');
    console.log('   Shop: ร้านอาหารตามสั่ง');
    console.log('\n═══════════════════════════════════════════════');

    await mongoose.connection.close();
    console.log('\n✅ Done! Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestUsers();
