import { NextResponse } from 'next/server';
import { authenticateToken, AuthenticatedRequest } from '@/lib/auth/middleware';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary/config';
import Book from '@/lib/database/models/Book';
import connectDB from '@/lib/database/connection';

async function handleGetBooks(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID not found' },
        { status: 400 }
      );
    }

    const books = await Book.find({ userId }).sort({ createdAt: -1 });

    const booksList = books.map(book => ({
      id: book._id.toString(),
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      condition: book.condition,
      description: book.description,
      images: book.images,
      location: book.location,
      city: book.city,
      status: book.status,
      createdAt: book.createdAt,
    }));

    return NextResponse.json(
      {
        success: true,
        message: 'Books retrieved successfully',
        books: booksList,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Books fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleCreateBook(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID not found' },
        { status: 400 }
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

    // Validate required fields
    if (!title || !author || !genre || !city) {
      return NextResponse.json(
        { success: false, message: 'Title, author, genre, and city are required' },
        { status: 400 }
      );
    }

    // Handle image uploads
    const imageFiles: File[] = [];
    const imageEntries = formData.getAll('images') as File[];

    for (const file of imageEntries) {
      if (file && file.size > 0) {
        imageFiles.push(file);
      }
    }

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one image is required' },
        { status: 400 }
      );
    }

    if (imageFiles.length > 5) {
      return NextResponse.json(
        { success: false, message: 'Maximum 5 images allowed' },
        { status: 400 }
      );
    }

    // Validate image sizes
    for (const file of imageFiles) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: 'Each image must be less than 5MB' },
          { status: 400 }
        );
      }
    }

    // Upload images to Cloudinary
    const imageUrls: string[] = [];
    try {
      for (const file of imageFiles) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadResult = await uploadToCloudinary(buffer, 'book-exchange/books');
        imageUrls.push(uploadResult.url);
      }
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
      return NextResponse.json(
        { success: false, message: 'Failed to upload images' },
        { status: 500 }
      );
    }

    // Create book document
    const bookData = {
      userId,
      title: title.trim(),
      author: author.trim(),
      isbn: isbn?.trim() || undefined,
      genre,
      condition,
      description: description?.trim() || undefined,
      location: location?.trim() || undefined,
      city: city.trim(),
      images: imageUrls,
      status: 'available',
    };

    const newBook = await Book.create(bookData);

    const responseBook = {
      id: newBook._id.toString(),
      title: newBook.title,
      author: newBook.author,
      isbn: newBook.isbn,
      genre: newBook.genre,
      condition: newBook.condition,
      description: newBook.description,
      images: newBook.images,
      location: newBook.location,
      city: newBook.city,
      status: newBook.status,
      createdAt: newBook.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Book added successfully',
        book: responseBook,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Book creation error:', error);

    // If it's a validation error
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

export const GET = authenticateToken(handleGetBooks);
export const POST = authenticateToken(handleCreateBook);