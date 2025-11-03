import { NextRequest, NextResponse } from 'next/server';
import { LoginRequest, AuthResponse } from '@/lib/auth/types';
import {
  validateEmail,
  findUserByEmail,
  comparePassword,
  generateToken
} from '@/lib/auth/database-utils';

export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    const body: LoginRequest = await request.json();
    const { email, password, rememberMe } = body;

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

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if this is an admin trying to log in through regular login
    if (user.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin users must use the admin login portal' },
        { status: 403 }
      );
    }

    // Check if user account is approved
    if (!user.isApproved) {
      return NextResponse.json(
        { success: false, message: 'Your signup request is still pending. Please wait for admin approval.' },
        { status: 403 }
      );
    }

    // Generate token
    const userForToken = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mobileNumber: user.mobileNumber,
      profileImage: user.profileImage,
      isAdmin: user.isAdmin,
      isApproved: user.isApproved
    };
    const token = generateToken(userForToken);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          mobileNumber: user.mobileNumber,
          profileImage: user.profileImage,
          isAdmin: user.isAdmin,
          isApproved: user.isApproved,
          createdAt: user.createdAt,
        },
        token,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}