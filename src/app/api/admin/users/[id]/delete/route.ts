import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedRequest } from '@/lib/auth/middleware';
import connectDB from '@/lib/database/connection';
import User from '@/lib/database/models/User';
import Book from '@/lib/database/models/Book';
import { deleteFromCloudinary } from '@/lib/cloudinary/config';

async function handleDeleteUser(req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    await connectDB();

    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Get all books associated with this user
    const userBooks = await Book.find({ userId });

    // Delete all images from Cloudinary for each book
    for (const book of userBooks) {
      for (const imageUrl of book.images) {
        try {
          // Extract public_id from Cloudinary URL
          const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
          await deleteFromCloudinary(`book-exchange/books/${publicId}`);
        } catch (error) {
          console.log('Error deleting image from Cloudinary:', error);
          // Continue with deletion even if image deletion fails
        }
      }
    }

    // Delete all books associated with this user
    const deletedBooksResult = await Book.deleteMany({ userId });

    // Delete user's profile image from Cloudinary if exists
    if (user.profileImage) {
      try {
        const publicId = user.profileImage.split('/').slice(-2).join('/').split('.')[0];
        await deleteFromCloudinary(`book-exchange/profiles/${publicId}`);
      } catch (error) {
        console.log('Error deleting profile image:', error);
        // Continue with user deletion even if profile image deletion fails
      }
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    return NextResponse.json(
      {
        success: true,
        message: `User deleted successfully. ${deletedBooksResult.deletedCount} books and associated images were also removed.`,
        deletedBooks: deletedBooksResult.deletedCount,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const DELETE = async (req: Request, context: { params: Promise<{ id: string }> }) => {
  const authenticatedHandler = requireAdmin(async (authReq: AuthenticatedRequest) => {
    return handleDeleteUser(authReq, context);
  });
  return authenticatedHandler(req as any);
};