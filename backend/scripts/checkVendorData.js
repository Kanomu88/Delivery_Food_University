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

async function checkVendorData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!\n');

    // Find vendor user
    const vendorUser = await User.findOne({ email: 'vendor1@test.com' });
    if (!vendorUser) {
      console.error('❌ Vendor user not found!');
      return;
    }

    console.log('✅ Vendor User:');
    console.log(`   Email: ${vendorUser.email}`);
    console.log(`   Name: ${vendorUser.name}`);
    console.log(`   Role: ${vendorUser.role}`);
    console.log(`   ID: ${vendorUser._id}\n`);

    // Find vendor profile
    const vendor = await Vendor.findOne({ userId: vendorUser._id });
    if (!vendor) {
      console.error('❌ Vendor profile not found!');
      return;
    }

    console.log('✅ Vendor Profile:');
    console.log(`   Name: ${vendor.name}`);
    console.log(`   Location: ${vendor.location}`);
    console.log(`   Is Active: ${vendor.isActive}`);
    console.log(`   Accepting Orders: ${vendor.acceptingOrders}`);
    console.log(`   ID: ${vendor._id}\n`);

    // Find menus
    const menus = await Menu.find({ vendorId: vendor._id });
    console.log(`✅ Menus: ${menus.length} รายการ`);
    
    if (menus.length > 0) {
      console.log('\nMenu List:');
      menus.forEach((menu, index) => {
        console.log(`   ${index + 1}. ${menu.name} - ฿${menu.price} (${menu.category})`);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Done! Database connection closed.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkVendorData();
