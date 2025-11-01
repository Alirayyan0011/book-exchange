import { NextResponse } from 'next/server';
import connectDB from '@/lib/database/connection';
import Book from '@/lib/database/models/Book';
import User from '@/lib/database/models/User';

export async function GET() {
  try {
    await connectDB();

    // Fetch all available books with user information
    const books = await Book.find({ status: 'available' })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    // Transform the data for the frontend
    const transformedBooks = books.map((book: any) => ({
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
      owner: {
        id: book.userId._id.toString(),
        name: `${book.userId.firstName} ${book.userId.lastName}`,
        email: book.userId.email,
      }
    }));

    return NextResponse.json(
      {
        success: true,
        books: transformedBooks,
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