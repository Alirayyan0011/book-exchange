import { NextRequest, NextResponse } from 'next/server';
import { SignupRequest, AuthResponse } from '@/lib/auth/types';
import {
  validateEmail,
  validatePassword,
  findUserByEmail,
  createUser,
  generateToken
} from '@/lib/auth/database-utils';

export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    const body: SignupRequest = await request.json();
    const { firstName, lastName, email, password, confirmPassword, agreeToTerms } = body;

    // Validation
    if (!firstName?.trim()) {
      return NextResponse.json(
        { success: false, message: 'First name is required' },
        { status: 400 }
      );
    }

    if (!lastName?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Last name is required' },
        { status: 400 }
      );
    }

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

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, message: passwordValidation.message },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (!agreeToTerms) {
      return NextResponse.json(
        { success: false, message: 'You must agree to the terms and conditions' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await createUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      isAdmin: false,
    });

    // Generate token
    const token = generateToken(newUser);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: {
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          isAdmin: newUser.isAdmin,
          createdAt: newUser.createdAt,
        },
        token,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}