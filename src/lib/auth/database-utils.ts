import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/database/connection';
import User, { IUser } from '@/lib/database/models/User';
import { User as UserType } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_CODE = process.env.ADMIN_CODE || 'ADMIN123';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: Omit<UserType, 'createdAt'>): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
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
};

export const verifyAdminCode = (code: string): boolean => {
  return code === ADMIN_CODE;
};

// Database operations
export const createUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}): Promise<UserType> => {
  await connectDB();

  const hashedPassword = await hashPassword(userData.password);

  const user = new User({
    email: userData.email.toLowerCase(),
    firstName: userData.firstName,
    lastName: userData.lastName,
    password: hashedPassword,
    isAdmin: userData.isAdmin || false,
  });

  const savedUser = await user.save();

  return {
    id: savedUser._id.toString(),
    email: savedUser.email,
    firstName: savedUser.firstName,
    lastName: savedUser.lastName,
    mobileNumber: savedUser.mobileNumber,
    profileImage: savedUser.profileImage,
    isAdmin: savedUser.isAdmin,
    createdAt: savedUser.createdAt,
  };
};

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  await connectDB();
  return await User.findOne({ email: email.toLowerCase() });
};

export const findUserById = async (id: string): Promise<IUser | null> => {
  await connectDB();
  return await User.findById(id);
};

export const getAllUsers = async (): Promise<UserType[]> => {
  await connectDB();
  const users = await User.find().sort({ createdAt: -1 });

  return users.map(user => ({
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    mobileNumber: user.mobileNumber,
    profileImage: user.profileImage,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
  }));
};

// Create default admin user
export const createDefaultAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@bookshare.com';
    const existingAdmin = await findUserByEmail(adminEmail);

    if (!existingAdmin) {
      await createUser({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: 'Admin123!',
        isAdmin: true,
      });
      console.log('✅ Default admin created: admin@bookshare.com / Admin123!');
    } else {
      console.log('✅ Default admin already exists');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};