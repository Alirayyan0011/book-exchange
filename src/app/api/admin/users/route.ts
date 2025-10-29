import { NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getAllUsers } from '@/lib/auth/database-utils';

async function handleGetUsers(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const allUsers = await getAllUsers();

    return NextResponse.json(
      {
        success: true,
        message: 'Users retrieved successfully',
        users: allUsers,
        totalUsers: allUsers.length,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGetUsers);