import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedRequest } from '@/lib/auth/middleware';
import connectDB from '@/lib/database/connection';
import User from '@/lib/database/models/User';
import Book from '@/lib/database/models/Book';

async function handleGetDashboardStats(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await connectDB();

    // Get total users (excluding admins)
    const totalUsers = await User.countDocuments({ isAdmin: false });

    // Get pending users
    const pendingUsers = await User.countDocuments({ isAdmin: false, isApproved: false });

    // Get total books
    const totalBooks = await Book.countDocuments();

    // Get books by status
    const availableBooks = await Book.countDocuments({ status: 'available' });
    const exchangedBooks = await Book.countDocuments({ status: 'exchanged' });
    const pendingBooks = await Book.countDocuments({ status: 'pending' });

    // Get recent users (last 5)
    const recentUsers = await User.find({ isAdmin: false })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentUsersFormatted = recentUsers.map((user: any) => ({
      id: user._id.toString(),
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      joined: formatRelativeTime(user.createdAt),
      status: user.isApproved ? 'approved' : 'pending'
    }));

    // Get recent books (last 5)
    const recentBooks = await Book.find()
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentBooksFormatted = recentBooks.map((book: any) => ({
      id: book._id.toString(),
      title: book.title,
      author: book.author,
      addedBy: `${book.userId.firstName} ${book.userId.lastName}`,
      addedAt: formatRelativeTime(book.createdAt),
      status: book.status
    }));

    // Calculate monthly growth (compare with last month)
    const currentDate = new Date();
    const lastMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const currentMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const lastMonthUsers = await User.countDocuments({
      isAdmin: false,
      createdAt: { $lt: currentMonthDate }
    });

    const currentMonthUsers = await User.countDocuments({
      isAdmin: false,
      createdAt: { $gte: currentMonthDate }
    });

    const monthlyGrowth = lastMonthUsers > 0
      ? ((currentMonthUsers / lastMonthUsers) * 100).toFixed(1)
      : '0';

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalUsers,
          pendingUsers,
          totalBooks,
          availableBooks,
          exchangedBooks,
          pendingBooks,
          activeExchanges: exchangedBooks, // Using exchanged books as active exchanges for now
          monthlyGrowth: parseFloat(monthlyGrowth)
        },
        recentUsers: recentUsersFormatted,
        recentBooks: recentBooksFormatted
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Dashboard stats fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}

export const GET = requireAdmin(handleGetDashboardStats);
