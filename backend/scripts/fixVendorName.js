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

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function fixVendorName() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // หา vendor ที่ไม่มี name
    const vendors = await User.find({ role: 'vendor' });
    
    for (const vendor of vendors) {
      if (!vendor.name || vendor.name === 'undefined') {
        vendor.name = 'ร้านอาหารมหาวิทยาลัย';
        await vendor.save();
        console.log(`Updated vendor: ${vendor.email} -> ${vendor.name}`);
      } else {
        console.log(`Vendor already has name: ${vendor.name}`);
      }
    }

    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixVendorName();
