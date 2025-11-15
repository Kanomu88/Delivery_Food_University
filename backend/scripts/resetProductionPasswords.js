import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.production') });

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

async function resetProductionPasswords() {
  try {
    console.log('🌐 Connecting to PRODUCTION MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const passwords = {
      'admin@test.com': 'admin123',
      'vendor1@test.com': 'vendor123',
      'customer1@test.com': 'customer123'
    };

    console.log('🔐 Resetting passwords...\n');

    for (const [email, password] of Object.entries(passwords)) {
      const user = await User.findOne({ email });
      
      if (!user) {
        console.log(`❌ User not found: ${email}`);
        continue;
      }

      console.log(`Processing: ${email}`);
      console.log(`  Current password hash: ${user.password?.substring(0, 30)}...`);
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(`  New password hash: ${hashedPassword.substring(0, 30)}...`);
      
      // Update password
      await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      
      console.log(`✅ Password reset for ${email} → ${password}\n`);
    }

    // Verify passwords
    console.log('🔍 Verifying passwords...\n');

    for (const [email, password] of Object.entries(passwords)) {
      const user = await User.findOne({ email });
      
      if (user) {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          console.log(`✅ ${email} → ${password} (verified)`);
        } else {
          console.log(`❌ ${email} → password verification failed!`);
        }
      }
    }

    await mongoose.disconnect();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All passwords have been reset!');
    console.log('='.repeat(60));
    console.log('\n📝 Login credentials:');
    console.log('\nAdmin:');
    console.log('  Email: admin@test.com');
    console.log('  Password: admin123');
    console.log('\nVendor:');
    console.log('  Email: vendor1@test.com');
    console.log('  Password: vendor123');
    console.log('\nCustomer:');
    console.log('  Email: customer1@test.com');
    console.log('  Password: customer123');
    console.log('\n🎯 Next steps:');
    console.log('  1. Test login: node scripts/checkProductionVendorData.js');
    console.log('  2. Login at: https://frontend-ten-mu-38.vercel.app');
    console.log('  3. Check vendor reports at: /vendor/reports');
    console.log('  4. Check admin pages at: /admin/users and /admin/vendors');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetProductionPasswords();
