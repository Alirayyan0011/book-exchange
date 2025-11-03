'use client';

import React, { useState, useEffect } from 'react';
import { X, BookOpen, ArrowRightLeft, Loader2 } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  images: string[];
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

interface UserBook {
  id: string;
  title: string;
  author: string;
  images: string[];
  status: string;
}

interface ExchangeRequestModalProps {
  book: Book;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExchangeRequestModal({
  book,
  onClose,
  onSuccess
}: ExchangeRequestModalProps) {
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserBooks();
  }, []);

  const fetchUserBooks = async () => {
    try {
      const response = await fetch('/api/user/books', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Only show available books
        const availableBooks = data.books.filter((b: UserBook) => b.status === 'available');
        setUserBooks(availableBooks);
      }
    } catch (error) {
      console.error('Failed to fetch user books:', error);
      setError('Failed to load your books');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBookId) {
      setError('Please select a book to offer');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/exchanges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          requestedBookId: book.id,
          offeredBookId: selectedBookId,
          message: message.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'Failed to send exchange request');
      }
    } catch (error) {
      console.error('Failed to send exchange request:', error);
      setError('Failed to send exchange request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Request Book Exchange</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Exchange Overview */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
              {/* Requested Book */}
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-2">You want:</p>
                <div className="border border-slate-200 rounded-lg p-3 flex items-center space-x-3">
                  <img
                    src={book.images[0]}
                    alt={book.title}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 truncate">{book.title}</h3>
                    <p className="text-sm text-slate-600 truncate">by {book.author}</p>
                    <p className="text-xs text-slate-500 truncate">Owner: {book.owner.name}</p>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 mt-8">
                <ArrowRightLeft className="h-6 w-6 text-slate-400" />
              </div>

              {/* Offered Book Placeholder */}
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-2">You offer:</p>
                <div className="border border-dashed border-slate-300 rounded-lg p-3 h-[92px] flex items-center justify-center">
                  <p className="text-sm text-slate-400">Select a book below</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Select Book */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select one of your books to offer *
              </label>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : userBooks.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-lg">
                  <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-600 text-sm mb-2">You don't have any available books</p>
                  <button
                    type="button"
                    onClick={() => window.location.href = '/books'}
                    className="text-sm text-slate-800 hover:underline"
                  >
                    Add a book to your collection
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                  {userBooks.map((userBook) => (
                    <label
                      key={userBook.id}
                      className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedBookId === userBook.id
                          ? 'border-slate-800 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="offeredBook"
                        value={userBook.id}
                        checked={selectedBookId === userBook.id}
                        onChange={(e) => setSelectedBookId(e.target.value)}
                        className="text-slate-800 focus:ring-slate-500"
                      />
                      <img
                        src={userBook.images[0]}
                        alt={userBook.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 truncate">{userBook.title}</h4>
                        <p className="text-sm text-slate-600 truncate">by {userBook.author}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Optional Message */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message to book owner (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Introduce yourself and explain why you're interested in this exchange..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">{message.length}/500 characters</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedBookId || userBooks.length === 0}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Exchange Request</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
