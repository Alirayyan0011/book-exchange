import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken, AuthenticatedRequest } from '@/lib/auth/middleware';
import connectDB from '@/lib/database/connection';
import Exchange from '@/lib/database/models/Exchange';
import Book from '@/lib/database/models/Book';
import User from '@/lib/database/models/User';

// GET - Fetch all exchanges for the authenticated user
async function handleGetExchanges(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID not found' },
        { status: 400 }
      );
    }

    const url = new URL(req.url);
    const type = url.searchParams.get('type'); // 'sent', 'received', or 'all'

    let query: any = {};

    if (type === 'sent') {
      query.requesterId = userId;
    } else if (type === 'received') {
      query.ownerId = userId;
    } else {
      // Return both sent and received
      query = {
        $or: [
          { requesterId: userId },
          { ownerId: userId }
        ]
      };
    }

    const exchanges = await Exchange.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Get book details for each exchange
    const exchangesWithDetails = await Promise.all(
      exchanges.map(async (exchange: any) => {
        const requestedBook = await Book.findById(exchange.requestedBookId).select('images status').lean() as any;
        const offeredBook = await Book.findById(exchange.offeredBookId).select('images status').lean() as any;

        return {
          id: exchange._id.toString(),
          requestedBook: {
            id: exchange.requestedBookId,
            title: exchange.requestedBookTitle,
            image: (requestedBook?.images && Array.isArray(requestedBook.images) && requestedBook.images[0]) || '',
            status: requestedBook?.status || 'unknown'
          },
          offeredBook: {
            id: exchange.offeredBookId,
            title: exchange.offeredBookTitle,
            image: (offeredBook?.images && Array.isArray(offeredBook.images) && offeredBook.images[0]) || '',
            status: offeredBook?.status || 'unknown'
          },
          requester: {
            id: exchange.requesterId,
            name: exchange.requesterName
          },
          owner: {
            id: exchange.ownerId,
            name: exchange.ownerName
          },
          status: exchange.status,
          message: exchange.message,
          responseMessage: exchange.responseMessage,
          createdAt: exchange.createdAt,
          updatedAt: exchange.updatedAt,
          isSender: exchange.requesterId === userId
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        exchanges: exchangesWithDetails
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Exchanges fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new exchange request
async function handleCreateExchange(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID not found' },
        { status: 400 }
      );
    }

    const { requestedBookId, offeredBookId, message } = await req.json();

    // Validate required fields
    if (!requestedBookId || !offeredBookId) {
      return NextResponse.json(
        { success: false, message: 'Requested book and offered book are required' },
        { status: 400 }
      );
    }

    // Check if books exist
    const requestedBook = await Book.findById(requestedBookId);
    if (!requestedBook) {
      return NextResponse.json(
        { success: false, message: 'Requested book not found' },
        { status: 404 }
      );
    }

    const offeredBook = await Book.findById(offeredBookId);
    if (!offeredBook) {
      return NextResponse.json(
        { success: false, message: 'Offered book not found' },
        { status: 404 }
      );
    }

    // Validate that the offered book belongs to the requester
    if (offeredBook.userId.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: 'You can only offer your own books' },
        { status: 403 }
      );
    }

    // Validate that the requested book doesn't belong to the requester
    if (requestedBook.userId.toString() === userId) {
      return NextResponse.json(
        { success: false, message: 'You cannot request your own book' },
        { status: 400 }
      );
    }

    // Check if the requested book is available
    if (requestedBook.status !== 'available') {
      return NextResponse.json(
        { success: false, message: 'This book is not available for exchange' },
        { status: 400 }
      );
    }

    // Check if there's already a pending exchange for this combination
    const existingExchange = await Exchange.findOne({
      requestedBookId,
      offeredBookId,
      requesterId: userId,
      status: 'pending'
    });

    if (existingExchange) {
      return NextResponse.json(
        { success: false, message: 'You already have a pending exchange request for this book' },
        { status: 400 }
      );
    }

    // Get user details
    const requester = await User.findById(userId);
    const owner = await User.findById(requestedBook.userId);

    if (!requester || !owner) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Create exchange request
    const exchange = await Exchange.create({
      requestedBookId,
      requestedBookTitle: requestedBook.title,
      offeredBookId,
      offeredBookTitle: offeredBook.title,
      requesterId: userId,
      requesterName: `${requester.firstName} ${requester.lastName}`,
      ownerId: requestedBook.userId.toString(),
      ownerName: `${owner.firstName} ${owner.lastName}`,
      status: 'pending',
      message: message?.trim() || undefined
    }) as any;

    return NextResponse.json(
      {
        success: true,
        message: 'Exchange request sent successfully',
        exchange: {
          id: exchange._id?.toString() || '',
          status: exchange.status,
          createdAt: exchange.createdAt
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Exchange creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = authenticateToken(handleGetExchanges);
export const POST = authenticateToken(handleCreateExchange);
