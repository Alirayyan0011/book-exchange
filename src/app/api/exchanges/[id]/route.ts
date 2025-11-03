import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/utils';
import connectDB from '@/lib/database/connection';
import Exchange from '@/lib/database/models/Exchange';
import Book from '@/lib/database/models/Book';

// PATCH - Update exchange status (accept, reject, complete, cancel)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Authenticate
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectDB();

    const userId = decoded.id;
    const { id } = await params;
    const { action, responseMessage } = await request.json();

    if (!action) {
      return NextResponse.json(
        { success: false, message: 'Action is required' },
        { status: 400 }
      );
    }

    // Find the exchange
    const exchange = await Exchange.findById(id);
    if (!exchange) {
      return NextResponse.json(
        { success: false, message: 'Exchange not found' },
        { status: 404 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'accept':
        // Only owner can accept
        if (exchange.ownerId !== userId) {
          return NextResponse.json(
            { success: false, message: 'Only the book owner can accept this request' },
            { status: 403 }
          );
        }

        if (exchange.status !== 'pending') {
          return NextResponse.json(
            { success: false, message: 'This exchange request is no longer pending' },
            { status: 400 }
          );
        }

        // Check if books are still available
        const requestedBook = await Book.findById(exchange.requestedBookId);
        const offeredBook = await Book.findById(exchange.offeredBookId);

        if (!requestedBook || requestedBook.status !== 'available') {
          return NextResponse.json(
            { success: false, message: 'Your book is no longer available' },
            { status: 400 }
          );
        }

        if (!offeredBook || offeredBook.status !== 'available') {
          return NextResponse.json(
            { success: false, message: 'The offered book is no longer available' },
            { status: 400 }
          );
        }

        exchange.status = 'accepted';
        exchange.responseMessage = responseMessage?.trim() || undefined;

        // Update book statuses to pending (exchange in progress)
        await Book.findByIdAndUpdate(exchange.requestedBookId, { status: 'pending' });
        await Book.findByIdAndUpdate(exchange.offeredBookId, { status: 'pending' });

        // Reject all other pending exchanges for these books
        await Exchange.updateMany(
          {
            _id: { $ne: id },
            status: 'pending',
            $or: [
              { requestedBookId: exchange.requestedBookId },
              { requestedBookId: exchange.offeredBookId },
              { offeredBookId: exchange.requestedBookId },
              { offeredBookId: exchange.offeredBookId }
            ]
          },
          {
            status: 'rejected',
            responseMessage: 'The book is no longer available for exchange'
          }
        );

        await exchange.save();

        return NextResponse.json(
          {
            success: true,
            message: 'Exchange request accepted',
            exchange
          },
          { status: 200 }
        );

      case 'reject':
        // Only owner can reject
        if (exchange.ownerId !== userId) {
          return NextResponse.json(
            { success: false, message: 'Only the book owner can reject this request' },
            { status: 403 }
          );
        }

        if (exchange.status !== 'pending') {
          return NextResponse.json(
            { success: false, message: 'This exchange request is no longer pending' },
            { status: 400 }
          );
        }

        exchange.status = 'rejected';
        exchange.responseMessage = responseMessage?.trim() || undefined;
        await exchange.save();

        return NextResponse.json(
          {
            success: true,
            message: 'Exchange request rejected',
            exchange
          },
          { status: 200 }
        );

      case 'complete':
        // Either party can mark as completed
        if (exchange.ownerId !== userId && exchange.requesterId !== userId) {
          return NextResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 403 }
          );
        }

        if (exchange.status !== 'accepted') {
          return NextResponse.json(
            { success: false, message: 'Only accepted exchanges can be completed' },
            { status: 400 }
          );
        }

        exchange.status = 'completed';
        await exchange.save();

        // Update book statuses to exchanged
        await Book.findByIdAndUpdate(exchange.requestedBookId, { status: 'exchanged' });
        await Book.findByIdAndUpdate(exchange.offeredBookId, { status: 'exchanged' });

        return NextResponse.json(
          {
            success: true,
            message: 'Exchange marked as completed',
            exchange
          },
          { status: 200 }
        );

      case 'cancel':
        // Only requester can cancel
        if (exchange.requesterId !== userId) {
          return NextResponse.json(
            { success: false, message: 'Only the requester can cancel this exchange' },
            { status: 403 }
          );
        }

        if (exchange.status === 'completed') {
          return NextResponse.json(
            { success: false, message: 'Completed exchanges cannot be cancelled' },
            { status: 400 }
          );
        }

        const previousStatus = exchange.status;
        exchange.status = 'cancelled';
        await exchange.save();

        // If the exchange was accepted, make the books available again
        if (previousStatus === 'accepted') {
          await Book.findByIdAndUpdate(exchange.requestedBookId, { status: 'available' });
          await Book.findByIdAndUpdate(exchange.offeredBookId, { status: 'available' });
        }

        return NextResponse.json(
          {
            success: true,
            message: 'Exchange request cancelled',
            exchange
          },
          { status: 200 }
        );

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Exchange update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
