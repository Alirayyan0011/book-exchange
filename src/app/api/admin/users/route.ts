import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedRequest } from '@/lib/auth/middleware';
import connectDB from '@/lib/database/connection';
import User from '@/lib/database/models/User';
import Book from '@/lib/database/models/Book';

async function handleGetUsers(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const url = new URL(req.url);
    const status = url.searchParams.get('status'); // 'all', 'pending', 'approved'

    let query = {};

    if (status === 'pending') {
      query = { isApproved: false, isAdmin: false };
    } else if (status === 'approved') {
      query = { isApproved: true, isAdmin: false };
    } else {
      // For 'all', exclude admins but include all approval statuses
      query = { isAdmin: false };
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Get book counts and exchange statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user: any) => {
        const userId = user._id.toString();

        // Count total books added by user
        const totalBooks = await Book.countDocuments({ userId });

        // Count books by status
        const availableBooks = await Book.countDocuments({ userId, status: 'available' });
        const exchangedBooks = await Book.countDocuments({ userId, status: 'exchanged' });
        const pendingBooks = await Book.countDocuments({ userId, status: 'pending' });

        return {
          id: userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          mobileNumber: user.mobileNumber,
          profileImage: user.profileImage,
          isApproved: user.isApproved,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          stats: {
            totalBooks,
            availableBooks,
            exchangedBooks,
            pendingBooks,
            successfulExchanges: exchangedBooks, // For now, using exchanged books as successful exchanges
          }
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        users: usersWithStats,
        totalUsers: usersWithStats.length,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAdmin(handleGetUsers);