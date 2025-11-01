import { NextResponse } from 'next/server';
import { authenticateToken, AuthenticatedRequest } from '@/lib/auth/middleware';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary/config';
import Book from '@/lib/database/models/Book';
import connectDB from '@/lib/database/connection';

async function handleUpdateBook(req: AuthenticatedRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    await connectDB();

    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID not found' },
        { status: 400 }
      );
    }

    const bookId = params.id;
    if (!bookId) {
      return NextResponse.json(
        { success: false, message: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Find the book and verify ownership
    const existingBook = await Book.findOne({ _id: bookId, userId });
    if (!existingBook) {
      return NextResponse.json(
        { success: false, message: 'Book not found or unauthorized' },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const isbn = formData.get('isbn') as string;
    const genre = formData.get('genre') as string;
    const condition = formData.get('condition') as string;
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const city = formData.get('city') as string;
    const status = formData.get('status') as string;

    // Validate required fields
    if (!title || !author || !genre || !city) {
      return NextResponse.json(
        { success: false, message: 'Title, author, genre, and city are required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      title: title.trim(),
      author: author.trim(),
      isbn: isbn?.trim() || undefined,
      genre,
      condition,
      description: description?.trim() || undefined,
      location: location?.trim() || undefined,
      city: city.trim(),
    };

    // Update status if provided
    if (status && ['available', 'exchanged', 'pending'].includes(status)) {
      updateData.status = status;
    }

    // Handle new image uploads
    const newImageFiles: File[] = [];
    const imageEntries = formData.getAll('newImages') as File[];

    for (const file of imageEntries) {
      if (file && file.size > 0) {
        newImageFiles.push(file);
      }
    }

    // Handle image deletions
    const imagesToDelete = formData.getAll('deleteImages') as string[];

    let currentImages = [...existingBook.images];

    // Remove deleted images
    if (imagesToDelete.length > 0) {
      for (const imageUrl of imagesToDelete) {
        try {
          // Extract public_id from Cloudinary URL
          const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
          await deleteFromCloudinary(`book-exchange/books/${publicId}`);
          currentImages = currentImages.filter(img => img !== imageUrl);
        } catch (error) {
          console.log('Error deleting image:', error);
        }
      }
    }

    // Upload new images
    if (newImageFiles.length > 0) {
      if (currentImages.length + newImageFiles.length > 5) {
        return NextResponse.json(
          { success: false, message: 'Maximum 5 images allowed' },
          { status: 400 }
        );
      }

      for (const file of newImageFiles) {
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { success: false, message: 'Each image must be less than 5MB' },
            { status: 400 }
          );
        }

        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const uploadResult = await uploadToCloudinary(buffer, 'book-exchange/books');
          currentImages.push(uploadResult.url);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return NextResponse.json(
            { success: false, message: 'Failed to upload new images' },
            { status: 500 }
          );
        }
      }
    }

    // Ensure at least one image remains
    if (currentImages.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one image is required' },
        { status: 400 }
      );
    }

    updateData.images = currentImages;

    // Update the book
    const updatedBook = await Book.findOneAndUpdate(
      { _id: bookId, userId },
      updateData,
      { new: true }
    );

    if (!updatedBook) {
      return NextResponse.json(
        { success: false, message: 'Failed to update book' },
        { status: 500 }
      );
    }

    const responseBook = {
      id: updatedBook._id.toString(),
      title: updatedBook.title,
      author: updatedBook.author,
      isbn: updatedBook.isbn,
      genre: updatedBook.genre,
      condition: updatedBook.condition,
      description: updatedBook.description,
      images: updatedBook.images,
      location: updatedBook.location,
      city: updatedBook.city,
      status: updatedBook.status,
      createdAt: updatedBook.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Book updated successfully',
        book: responseBook,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Book update error:', error);

    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleDeleteBook(req: AuthenticatedRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    await connectDB();

    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID not found' },
        { status: 400 }
      );
    }

    const bookId = params.id;
    if (!bookId) {
      return NextResponse.json(
        { success: false, message: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Find the book and verify ownership
    const book = await Book.findOne({ _id: bookId, userId });
    if (!book) {
      return NextResponse.json(
        { success: false, message: 'Book not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete images from Cloudinary
    for (const imageUrl of book.images) {
      try {
        const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await deleteFromCloudinary(`book-exchange/books/${publicId}`);
      } catch (error) {
        console.log('Error deleting image:', error);
      }
    }

    // Delete the book
    await Book.findOneAndDelete({ _id: bookId, userId });

    return NextResponse.json(
      {
        success: true,
        message: 'Book deleted successfully',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Book deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = await params;
  const authenticatedHandler = authenticateToken(async (authReq: AuthenticatedRequest) => {
    return handleUpdateBook(authReq, { params: resolvedParams });
  });
  return authenticatedHandler(req as any);
};

export const DELETE = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = await params;
  const authenticatedHandler = authenticateToken(async (authReq: AuthenticatedRequest) => {
    return handleDeleteBook(authReq, { params: resolvedParams });
  });
  return authenticatedHandler(req as any);
};