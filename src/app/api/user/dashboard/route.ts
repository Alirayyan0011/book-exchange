import { NextResponse } from 'next/server';
import { authenticateToken, AuthenticatedRequest } from '@/lib/auth/middleware';
import connectDB from '@/lib/database/connection';
import Book from '@/lib/database/models/Book';

async function handleGetDashboardStats(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID not found' },
        { status: 400 }
      );
    }

    // Get user's books statistics
    const totalBooks = await Book.countDocuments({ userId });
    const availableBooks = await Book.countDocuments({ userId, status: 'available' });
    const exchangedBooks = await Book.countDocuments({ userId, status: 'exchanged' });
    const pendingBooks = await Book.countDocuments({ userId, status: 'pending' });

    // Get user's recent books (last 5)
    const recentBooks = await Book.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentBooksFormatted = recentBooks.map((book: any) => ({
      id: book._id.toString(),
      title: book.title,
      author: book.author,
      status: book.status,
      addedAt: formatRelativeTime(book.createdAt)
    }));

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalBooks,
          availableBooks,
          exchangedBooks,
          pendingBooks,
          booksShared: exchangedBooks, // Books that have been exchanged away
          booksReceived: 0, // TODO: Implement when exchange system is complete
          activeExchanges: pendingBooks // Books in pending exchange status
        },
        recentBooks: recentBooksFormatted
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('User dashboard stats fetch error:', error);
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

export const GET = authenticateToken(handleGetDashboardStats);
