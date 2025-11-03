import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExchange extends Document {
  requestedBookId: string; // Book that requester wants
  requestedBookTitle: string;
  offeredBookId: string; // Book that requester is offering
  offeredBookTitle: string;
  requesterId: string; // User requesting the exchange
  requesterName: string;
  ownerId: string; // Owner of the requested book
  ownerName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  message?: string; // Optional message from requester
  responseMessage?: string; // Optional response from owner
  createdAt: Date;
  updatedAt: Date;
}

const ExchangeSchema = new Schema<IExchange>({
  requestedBookId: {
    type: String,
    required: true,
    index: true
  },
  requestedBookTitle: {
    type: String,
    required: true
  },
  offeredBookId: {
    type: String,
    required: true,
    index: true
  },
  offeredBookTitle: {
    type: String,
    required: true
  },
  requesterId: {
    type: String,
    required: true,
    index: true
  },
  requesterName: {
    type: String,
    required: true
  },
  ownerId: {
    type: String,
    required: true,
    index: true
  },
  ownerName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500
  },
  responseMessage: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
ExchangeSchema.index({ requesterId: 1, status: 1, createdAt: -1 });
ExchangeSchema.index({ ownerId: 1, status: 1, createdAt: -1 });
ExchangeSchema.index({ requestedBookId: 1, status: 1 });
ExchangeSchema.index({ offeredBookId: 1, status: 1 });

const Exchange: Model<IExchange> =
  mongoose.models.Exchange ||
  mongoose.model<IExchange>('Exchange', ExchangeSchema);

export default Exchange;
