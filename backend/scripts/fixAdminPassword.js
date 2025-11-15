import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.production') });

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

async function fixAdminPassword() {
    try {
        console.log('🌐 Connecting to PRODUCTION MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected\n');

        // Find admin user
        const admin = await User.findOne({ email: 'admin@test.com' });

        if (!admin) {
            console.log('❌ Admin user not found');
            await mongoose.disconnect();
            return;
        }

        console.log('✅ Found admin user');
        console.log('   Email:', admin.email);
        console.log('   Current password hash:', admin.password?.substring(0, 30) + '...');

        // Import bcrypt dynamically
        const bcrypt = await import('bcrypt');

        // Hash new password
        const newPassword = 'password123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        console.log('\n🔐 Setting new password...');
        console.log('   New password:', newPassword);
        console.log('   New hash:', hashedPassword.substring(0, 30) + '...');

        // Update password
        await User.updateOne(
            { _id: admin._id },
            { $set: { password: hashedPassword } }
        );

        console.log('✅ Password updated successfully');

        // Verify
        console.log('\n🔍 Verifying password...');
        const updatedAdmin = await User.findOne({ email: 'admin@test.com' });
        const match = await bcrypt.compare(newPassword, updatedAdmin.password);

        if (match) {
            console.log('✅ Password verification successful!');
        } else {
            console.log('❌ Password verification failed!');
        }

        await mongoose.disconnect();

        console.log('\n' + '='.repeat(60));
        console.log('✅ Admin password has been fixed!');
        console.log('='.repeat(60));
        console.log('\n📝 Login credentials:');
        console.log('   Email: admin@test.com');
        console.log('   Password: password123');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixAdminPassword();
