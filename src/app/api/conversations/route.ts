import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database/connection';
import Conversation from '@/lib/database/models/Conversation';
import { verifyToken } from '@/lib/auth/utils';

// GET - Fetch a conversation or all conversations for a user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

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

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const ownerId = searchParams.get('ownerId');

    // If bookId and ownerId are provided, fetch specific conversation
    if (bookId && ownerId) {
      const conversation = await Conversation.findOne({
        bookId,
        $or: [
          { interestedUserId: decoded.id, ownerId },
          { interestedUserId: ownerId, ownerId: decoded.id }
        ]
      });

      return NextResponse.json({
        success: true,
        conversation: conversation || null
      });
    }

    // Otherwise, fetch all conversations for the user
    const conversations = await Conversation.find({
      $or: [
        { interestedUserId: decoded.id },
        { ownerId: decoded.id }
      ]
    }).sort({ lastMessageAt: -1 });

    return NextResponse.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error in GET /api/conversations:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
