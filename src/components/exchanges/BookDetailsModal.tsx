'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, User, MessageCircle, Mail } from 'lucide-react';

interface BookOwner {
  id: string;
  name: string;
  email: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  genre: string;
  condition: string;
  description?: string;
  images: string[];
  location?: string;
  city: string;
  status: 'available' | 'exchanged' | 'pending';
  createdAt: Date;
  owner: BookOwner;
}

interface BookDetailsModalProps {
  book: Book;
  onClose: () => void;
  onChatWithOwner: () => void;
  currentUserName?: string;
}

export default function BookDetailsModal({
  book,
  onClose,
  onChatWithOwner,
  currentUserName
}: BookDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? book.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === book.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleEmailOwner = () => {
    const subject = encodeURIComponent(`Book Exchange Interest: ${book.title}`);
    const body = encodeURIComponent(`Hi! I'm interested in exchanging books with you. I saw your book "${book.title}" on the book exchange platform and would like to discuss a potential exchange. Please let me know if you're interested.\n\nBest regards,\n${currentUserName || ''}`);
    window.open(`mailto:${book.owner.email}?subject=${subject}&body=${body}`);
  };

  const conditionLabels: { [key: string]: string } = {
    'excellent': 'Excellent - Like new',
    'good': 'Good - Minor wear',
    'fair': 'Fair - Some wear',
    'poor': 'Poor - Heavy wear'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-semibold text-slate-900">Book Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image Carousel */}
            <div>
              <div className="relative aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden">
                <img
                  src={book.images[currentImageIndex]}
                  alt={`${book.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Image Navigation - Show only if more than 1 image */}
                {book.images.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {book.images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Navigation - Show if more than 1 image */}
              {book.images.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {book.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index
                          ? 'border-slate-800 shadow-md'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Book Details */}
            <div className="flex flex-col">
              {/* Title and Author */}
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{book.title}</h1>
                <p className="text-lg text-slate-600">by {book.author}</p>
              </div>

              {/* Genre and Condition Badges */}
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                  {book.genre}
                </span>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  book.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                  book.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                  book.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {conditionLabels[book.condition] || book.condition}
                </span>
              </div>

              {/* ISBN */}
              {book.isbn && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-1">ISBN</h3>
                  <p className="text-slate-900">{book.isbn}</p>
                </div>
              )}

              {/* Description */}
              {book.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Description</h3>
                  <p className="text-slate-900 leading-relaxed whitespace-pre-line">
                    {book.description}
                  </p>
                </div>
              )}

              {/* Location */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Location</h3>
                <div className="flex items-center text-slate-900">
                  <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                  <span>
                    {book.city}
                    {book.location && <span className="text-slate-600"> • {book.location}</span>}
                  </span>
                </div>
              </div>

              {/* Owner Info */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Owner</h3>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-slate-500" />
                  <span className="text-slate-900">{book.owner.name}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto space-y-3">
                <button
                  onClick={onChatWithOwner}
                  className="w-full flex items-center justify-center space-x-2 bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-900 transition-colors font-medium"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Chat with Owner</span>
                </button>

                <button
                  onClick={handleEmailOwner}
                  className="w-full flex items-center justify-center space-x-2 bg-white text-slate-700 border border-slate-300 px-6 py-3 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  <Mail className="h-5 w-5" />
                  <span>Email Owner</span>
                </button>
              </div>

              {/* Status Badge */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    book.status === 'available' ? 'bg-green-100 text-green-800' :
                    book.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
