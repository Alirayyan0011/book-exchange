#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  const envLines = envFile.split('\n');

  envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in environment variables');
  console.log('Please make sure you have a .env.local file with MONGODB_URI set');
  process.exit(1);
}

// User Schema (matching the one in the app)
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot be more than 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot be more than 50 characters'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', UserSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    };
  }

  return { isValid: true };
}

async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function createAdminUser() {
  console.log('\n🛡️  === BookShare Admin User Creator ===\n');

  try {
    await connectDB();

    const firstName = await question('👤 Enter admin first name: ');
    if (!firstName.trim()) {
      console.log('❌ First name is required');
      process.exit(1);
    }

    const lastName = await question('👤 Enter admin last name: ');
    if (!lastName.trim()) {
      console.log('❌ Last name is required');
      process.exit(1);
    }

    const email = await question('📧 Enter admin email: ');
    if (!email.trim()) {
      console.log('❌ Email is required');
      process.exit(1);
    }

    if (!validateEmail(email)) {
      console.log('❌ Please enter a valid email address');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log(`❌ A user with email ${email} already exists`);

      const overwrite = await question('⚠️  Do you want to update this user to admin? (y/N): ');
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log('🚫 Operation cancelled');
        process.exit(0);
      }

      // Update existing user to admin
      existingUser.firstName = firstName.trim();
      existingUser.lastName = lastName.trim();
      existingUser.isAdmin = true;
      await existingUser.save();

      console.log('\n✅ User updated to admin successfully!');
      console.log(`📧 Email: ${email}`);
      console.log(`👤 Name: ${firstName} ${lastName}`);
      console.log(`🛡️  Role: Administrator`);
      console.log('\nAdmin can now login using the admin portal with their existing password.');

      process.exit(0);
    }

    const password = await question('🔒 Enter admin password: ');
    if (!password) {
      console.log('❌ Password is required');
      process.exit(1);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      console.log(`❌ ${passwordValidation.message}`);
      process.exit(1);
    }

    const confirmPassword = await question('🔒 Confirm admin password: ');
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match');
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const adminUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isAdmin: true,
    });

    await adminUser.save();

    console.log('\n🎉 Admin user created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${firstName} ${lastName}`);
    console.log(`🛡️  Role: Administrator`);
    console.log(`🆔 User ID: ${adminUser._id}`);
    console.log(`📅 Created: ${adminUser.createdAt}`);

    console.log('\n🔐 Admin Login Credentials:');
    console.log(`   • Email: ${email}`);
    console.log(`   • Password: [the password you entered]`);
    console.log(`   • Admin Code: ${process.env.ADMIN_CODE || 'ADMIN123'}`);

    console.log('\n🌐 Admin can now login at: http://localhost:3000/admin/login');

  } catch (error) {
    if (error.code === 11000) {
      console.log('❌ Email already exists in database');
    } else if (error.name === 'ValidationError') {
      console.log('❌ Validation Error:', error.message);
    } else {
      console.log('❌ Error creating admin user:', error.message);
    }
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    rl.close();
  }
}

async function listAdmins() {
  console.log('\n👥 === Current Admin Users ===\n');

  try {
    await connectDB();

    const admins = await User.find({ isAdmin: true }).select('-password');

    if (admins.length === 0) {
      console.log('📭 No admin users found');
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.firstName} ${admin.lastName}`);
        console.log(`   📧 ${admin.email}`);
        console.log(`   🆔 ${admin._id}`);
        console.log(`   📅 Created: ${admin.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    }
  } catch (error) {
    console.log('❌ Error fetching admin users:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--list') || args.includes('-l')) {
    await listAdmins();
    return;
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log('\n🛡️  BookShare Admin User Creator\n');
    console.log('Usage:');
    console.log('  npm run create-admin       Create a new admin user');
    console.log('  npm run create-admin -- -l List existing admin users');
    console.log('  npm run create-admin -- -h Show this help message');
    console.log('');
    return;
  }

  await createAdminUser();
}

// Check if the script is being run directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script error:', error.message);
    process.exit(1);
  });
}

module.exports = { createAdminUser, listAdmins };