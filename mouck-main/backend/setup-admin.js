// Setup admin user for the quiz platform
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quiz_platform';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✓ MongoDB Connected'))
.catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
});

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function setupAdmin() {
    try {
        const adminEmail = 'tn8673436@gmail.com';
        const adminPassword = 'Ved@4567';
        const adminName = 'Quiz Admin';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('✓ Admin user already exists:', adminEmail);
            await mongoose.connection.close();
            process.exit(0);
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const adminUser = new User({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            isAdmin: true
        });

        await adminUser.save();
        console.log('✓ Admin user created successfully!');
        console.log('Email:', adminEmail);
        console.log('Password: (hidden for security)');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('✗ Error setting up admin:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
}

setupAdmin();
