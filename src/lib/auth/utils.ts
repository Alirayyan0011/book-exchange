import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_CODE = process.env.ADMIN_CODE || 'ADMIN123';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: Omit<User, 'createdAt'>): string => {
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

// In-memory user storage (replace with database in production)
export const users: Map<string, User & { password: string }> = new Map();

export const createUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}): Promise<User> => {
  const hashedPassword = await hashPassword(userData.password);
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const user: User & { password: string } = {
    id: userId,
    email: userData.email.toLowerCase(),
    firstName: userData.firstName,
    lastName: userData.lastName,
    mobileNumber: undefined,
    profileImage: undefined,
    isAdmin: userData.isAdmin || false,
    isApproved: userData.isAdmin ? true : false, // Admins auto-approved, users need approval
    password: hashedPassword,
    createdAt: new Date(),
  };

  users.set(userId, user);
  users.set(userData.email.toLowerCase(), user); // Also store by email for lookup

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const findUserByEmail = (email: string): (User & { password: string }) | undefined => {
  return users.get(email.toLowerCase());
};

export const findUserById = (id: string): (User & { password: string }) | undefined => {
  return users.get(id);
};

// Create default admin user
export const createDefaultAdmin = async () => {
  const adminEmail = 'admin@bookshare.com';
  if (!findUserByEmail(adminEmail)) {
    await createUser({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: 'Admin123!',
      isAdmin: true,
    });
    console.log('Default admin created: admin@bookshare.com / Admin123!');
  }
};

// Initialize default admin
createDefaultAdmin();