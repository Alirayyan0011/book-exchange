import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database/connection';
import Conversation from '@/lib/database/models/Conversation';
import Book from '@/lib/database/models/Book';
import User from '@/lib/database/models/User';
import { verifyToken } from '@/lib/auth/utils';

// POST - Send a message in a conversation
export async function POST(request: NextRequest) {
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

    const { bookId, ownerId, message } = await request.json();

    // Validate input
    if (!bookId || !ownerId || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { success: false, message: 'Message too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    // Prevent messaging yourself
    if (decoded.id === ownerId) {
      return NextResponse.json(
        { success: false, message: 'Cannot message yourself' },
        { status: 400 }
      );
    }

    // Fetch book and user details
    const book = await Book.findById(bookId);
    if (!book) {
      return NextResponse.json(
        { success: false, message: 'Book not found' },
        { status: 404 }
      );
    }

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const owner = await User.findById(ownerId);
    if (!owner) {
      return NextResponse.json(
        { success: false, message: 'Owner not found' },
        { status: 404 }
      );
    }

    const currentUserName = `${currentUser.firstName} ${currentUser.lastName}`;
    const ownerName = `${owner.firstName} ${owner.lastName}`;

    // Determine who is the interested user and who is the owner
    const isCurrentUserOwner = book.userId.toString() === decoded.id;
    const interestedUserId = isCurrentUserOwner ? ownerId : decoded.id;
    const interestedUserName = isCurrentUserOwner ? ownerName : currentUserName;
    const actualOwnerId = isCurrentUserOwner ? decoded.id : ownerId;
    const actualOwnerName = isCurrentUserOwner ? currentUserName : ownerName;

    // Find or create conversation
    let conversation = await Conversation.findOne({
      bookId,
      interestedUserId,
      ownerId: actualOwnerId
    });

    const newMessage = {
      senderId: decoded.id,
      senderName: currentUserName,
      message: message.trim(),
      createdAt: new Date()
    };

    if (conversation) {
      // Add message to existing conversation
      conversation.messages.push(newMessage);
      conversation.lastMessageAt = new Date();
      await conversation.save();
    } else {
      // Create new conversation
      conversation = await Conversation.create({
        bookId,
        bookTitle: book.title,
        interestedUserId,
        interestedUserName,
        ownerId: actualOwnerId,
        ownerName: actualOwnerName,
        messages: [newMessage],
        lastMessageAt: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
      conversation
    });
  } catch (error) {
    console.error('Error in POST /api/conversations/messages:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
