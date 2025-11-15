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

async function cleanupOldUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!\n');

    // Find old users to delete
    const oldUsers = await User.find({ 
      email: { $in: ['customer@test.com', 'vendor@test.com'] } 
    });

    console.log('Found old users to delete:');
    oldUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });

    // Delete old vendor's menus first
    const oldVendorUser = await User.findOne({ email: 'vendor@test.com' });
    if (oldVendorUser) {
      const oldVendor = await Vendor.findOne({ userId: oldVendorUser._id });
      if (oldVendor) {
        const deletedMenus = await Menu.deleteMany({ vendorId: oldVendor._id });
        console.log(`\n✅ Deleted ${deletedMenus.deletedCount} menus from old vendor`);
        
        await Vendor.deleteOne({ _id: oldVendor._id });
        console.log('✅ Deleted old vendor profile');
      }
    }

    // Delete old users
    const result = await User.deleteMany({ 
      email: { $in: ['customer@test.com', 'vendor@test.com'] } 
    });
    
    console.log(`✅ Deleted ${result.deletedCount} old users\n`);

    // List remaining users
    console.log('Remaining users:');
    const remainingUsers = await User.find({});
    remainingUsers.forEach(user => {
      console.log(`  ✓ ${user.email} (${user.role})`);
    });

    console.log('\n✅ Cleanup completed successfully!');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanupOldUsers();
