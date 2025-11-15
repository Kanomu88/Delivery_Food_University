import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
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
  phone: String,
  address: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const vendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  location: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Vendor = mongoose.model('Vendor', vendorSchema);

async function recreateUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    // Delete existing test users
    console.log('\nDeleting existing test users...');
    await User.deleteMany({ 
      email: { $in: ['vendor1@test.com', 'admin@test.com', 'customer1@test.com'] } 
    });
    console.log('Deleted existing users');

    // Create new users with current JWT_SECRET
    const hashedPassword = await bcrypt.hash('password123', 10);
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);

    console.log('\nCreating new users...');
    
    // Create vendor user
    const vendorUser = await User.create({
      email: 'vendor1@test.com',
      password: hashedPassword,
      name: 'ร้านอาหารทดสอบ 1',
      role: 'vendor',
      phone: '0812345678',
      isActive: true,
    });
    console.log('✅ Created vendor user:', vendorUser.email);

    // Create vendor profile
    const vendor = await Vendor.create({
      userId: vendorUser._id,
      name: 'ร้านอาหารทดสอบ 1',
      location: 'โรงอาหารกลาง',
      isActive: true,
    });
    console.log('✅ Created vendor profile');

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@test.com',
      password: hashedAdminPassword,
      name: 'Admin',
      role: 'admin',
      isActive: true,
    });
    console.log('✅ Created admin user:', adminUser.email);

    // Create customer user
    const customerUser = await User.create({
      email: 'customer1@test.com',
      password: hashedPassword,
      name: 'ลูกค้าทดสอบ 1',
      role: 'customer',
      phone: '0898765432',
      isActive: true,
    });
    console.log('✅ Created customer user:', customerUser.email);

    console.log('\n✅ All users recreated successfully!');
    console.log('\nLogin credentials:');
    console.log('Vendor: vendor1@test.com / password123');
    console.log('Admin: admin@test.com / admin123');
    console.log('Customer: customer1@test.com / password123');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

recreateUsers();
