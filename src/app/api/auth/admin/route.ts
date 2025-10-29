import { NextRequest, NextResponse } from 'next/server';
import { AdminLoginRequest, AuthResponse } from '@/lib/auth/types';
import {
  validateEmail,
  findUserByEmail,
  comparePassword,
  generateToken,
  verifyAdminCode
} from '@/lib/auth/database-utils';

export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    const body: AdminLoginRequest = await request.json();
    const { email, password, adminCode, rememberMe } = body;

    // Validation
    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!adminCode?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Admin code is required' },
        { status: 400 }
      );
    }

    if (adminCode.length < 4) {
      return NextResponse.json(
        { success: false, message: 'Admin code must be at least 4 characters' },
        { status: 400 }
      );
    }

    // Verify admin code first
    if (!verifyAdminCode(adminCode)) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin code' },
        { status: 401 }
      );
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    // Verify user is admin
    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const userForToken = {
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin
    };
    const token = generateToken(userForToken);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Admin authentication successful',
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
        },
        token,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}