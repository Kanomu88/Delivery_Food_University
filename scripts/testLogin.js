import axios from 'axios';

const API_URL = 'https://university-canteen-backend.vercel.app/api';

const testLogin = async () => {
    try {
        console.log('🧪 Testing Login Functionality...\n');

        // Test accounts
        const accounts = [
            { email: 'customer@test.com', password: 'password123', role: 'customer' },
            { email: 'vendor1@canteen.com', password: 'password123', role: 'vendor' },
            { email: 'admin@canteen.com', password: 'password123', role: 'admin' },
        ];

        for (const account of accounts) {
            console.log(`\n🔐 Testing ${account.role} login...`);
            console.log(`   Email: ${account.email}`);

            try {
                const response = await axios.post(`${API_URL}/auth/login`, {
                    email: account.email,
                    password: account.password
                });

                if (response.data.success) {
                    console.log(`   ✅ Login successful!`);
                    console.log(`   User: ${response.data.data.user.name}`);
                    console.log(`   Role: ${response.data.data.user.role}`);
                    console.log(`   Token: ${response.data.data.accessToken.substring(0, 30)}...`);
                } else {
                    console.log(`   ❌ Login failed: ${response.data.error?.message}`);
                }
            } catch (error) {
                console.log(`   ❌ Error: ${error.response?.data?.error?.message || error.message}`);
                if (error.response?.data) {
                    console.log(`   Response:`, error.response.data);
                }
            }
        }

        // Test wrong password
        console.log(`\n\n🔒 Testing wrong password...`);
        try {
            await axios.post(`${API_URL}/auth/login`, {
                email: 'customer@test.com',
                password: 'wrongpassword'
            });
            console.log(`   ❌ Should have failed but didn't!`);
        } catch (error) {
            console.log(`   ✅ Correctly rejected: ${error.response?.data?.error?.message}`);
        }

        // Test non-existent user
        console.log(`\n🔒 Testing non-existent user...`);
        try {
            await axios.post(`${API_URL}/auth/login`, {
                email: 'notexist@test.com',
                password: 'password123'
            });
            console.log(`   ❌ Should have failed but didn't!`);
        } catch (error) {
            console.log(`   ✅ Correctly rejected: ${error.response?.data?.error?.message}`);
        }

        console.log('\n\n🎉 Login tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
};

testLogin();
