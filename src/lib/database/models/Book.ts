import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  _id: string;
  userId: string;
  title: string;
  author: string;
  isbn?: string;
  genre: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  description?: string;
  images: string[];
  location?: string;
  city: string;
  status: 'available' | 'exchanged' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [100, 'Author name cannot be more than 100 characters'],
    },
    isbn: {
      type: String,
      trim: true,
      match: [/^(?:\d{9}[\dX]|\d{13})$/, 'Please enter a valid ISBN'],
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      enum: [
        'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Romance',
        'Thriller', 'Biography', 'History', 'Science', 'Philosophy', 'Self-Help',
        'Children', 'Young Adult', 'Classic', 'Poetry', 'Drama', 'Other'
      ],
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    images: [{
      type: String,
      required: true,
    }],
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot be more than 200 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City name cannot be more than 100 characters'],
    },
    status: {
      type: String,
      enum: ['available', 'exchanged', 'pending'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
BookSchema.index({ userId: 1 });
BookSchema.index({ genre: 1 });
BookSchema.index({ city: 1 });
BookSchema.index({ status: 1 });
BookSchema.index({ createdAt: -1 });
BookSchema.index({ title: 'text', author: 'text', description: 'text' });

// Prevent re-compilation in development
const Book = mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);

export default Book;