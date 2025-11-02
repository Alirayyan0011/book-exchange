import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage {
  senderId: string;
  senderName: string;
  message: string;
  createdAt: Date;
}

export interface IConversation extends Document {
  bookId: string;
  bookTitle: string;
  interestedUserId: string;
  interestedUserName: string;
  ownerId: string;
  ownerName: string;
  messages: IMessage[];
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  senderId: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ConversationSchema = new Schema<IConversation>({
  bookId: {
    type: String,
    required: true,
    index: true
  },
  bookTitle: {
    type: String,
    required: true
  },
  interestedUserId: {
    type: String,
    required: true,
    index: true
  },
  interestedUserName: {
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
  messages: {
    type: [MessageSchema],
    default: []
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for finding conversations between specific users about a specific book
ConversationSchema.index({ bookId: 1, interestedUserId: 1, ownerId: 1 }, { unique: true });

// Index for finding all conversations for a user (either as interested party or owner)
ConversationSchema.index({ interestedUserId: 1, lastMessageAt: -1 });
ConversationSchema.index({ ownerId: 1, lastMessageAt: -1 });

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
