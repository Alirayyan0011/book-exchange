import { NextResponse } from 'next/server';
import { authenticateToken, AuthenticatedRequest } from '@/lib/auth/middleware';
import { findUserById } from '@/lib/auth/database-utils';

async function handleGetProfile(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID not found' },
        { status: 400 }
      );
    }

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const userProfile = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    };
    return NextResponse.json(
      {
        success: true,
        message: 'Profile retrieved successfully',
        user: userProfile,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = authenticateToken(handleGetProfile);