'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, MapPin, User, Clock, Heart, Mail, LogOut } from 'lucide-react';
import UserSidebar from '@/components/user/Sidebar';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import BookDetailsModal from './BookDetailsModal';
import ChatModal from './ChatModal';

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

export default function ExchangesLayout() {
  const { user: authUser, logout } = useAuth();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // State
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');

  // Modal state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, selectedGenre, selectedCity, selectedCondition]);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();

      if (data.success) {
        setBooks(data.books);
      } else {
        setMessage(data.message || 'Failed to fetch books');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error fetching books');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = [...books];

    // Filter by search term (title, author, or description)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        book.description?.toLowerCase().includes(term) ||
        book.owner.name.toLowerCase().includes(term)
      );
    }

    // Filter by genre
    if (selectedGenre) {
      filtered = filtered.filter(book => book.genre === selectedGenre);
    }

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(book => book.city === selectedCity);
    }

    // Filter by condition
    if (selectedCondition) {
      filtered = filtered.filter(book => book.condition === selectedCondition);
    }

    setFilteredBooks(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setSelectedCity('');
    setSelectedCondition('');
  };

  const handleContactOwner = (ownerEmail: string, bookTitle: string) => {
    const subject = encodeURIComponent(`Book Exchange Interest: ${bookTitle}`);
    const body = encodeURIComponent(`Hi! I'm interested in exchanging books with you. I saw your book "${bookTitle}" on the book exchange platform and would like to discuss a potential exchange. Please let me know if you're interested.\n\nBest regards,\n${authUser?.firstName} ${authUser?.lastName}`);
    window.open(`mailto:${ownerEmail}?subject=${subject}&body=${body}`);
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
  };

  const handleCloseModal = () => {
    setSelectedBook(null);
    setShowChatModal(false);
  };

  const handleChatWithOwner = () => {
    setShowChatModal(true);
  };

  // Get unique values for filters
  const genres = [...new Set(books.map(book => book.genre))].sort();
  const cities = [...new Set(books.map(book => book.city))].sort();
  const conditions = [...new Set(books.map(book => book.condition))].sort();

  const conditionLabels: { [key: string]: string } = {
    'excellent': 'Excellent - Like new',
    'good': 'Good - Minor wear',
    'fair': 'Fair - Some wear',
    'poor': 'Poor - Heavy wear'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <UserSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeItem="exchanges"
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Book Exchanges</h1>
              <p className="text-sm text-slate-600 mt-1">Discover and exchange books with other readers</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                Welcome, {authUser?.firstName}
              </span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-slate-900 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h2>
              <button
                onClick={clearFilters}
                className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                    placeholder="Book, author, or owner..."
                  />
                </div>
              </div>

              {/* Genre Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Genre
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="">All Genres</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Condition Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Condition
                </label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="">All Conditions</option>
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>
                      {conditionLabels[condition] || condition}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-slate-900">
                  Available Books
                </h2>
                <span className="text-sm text-slate-600">
                  {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} available
                </span>
              </div>
            </div>

            <div className="p-6">
              {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                  messageType === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {message}
                </div>
              )}

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto mb-4"></div>
                  <p className="text-slate-600 font-light">Loading available books...</p>
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    {books.length === 0 ? 'No books available' : 'No books match your filters'}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {books.length === 0
                      ? 'There are no books available for exchange at the moment.'
                      : 'Try adjusting your search criteria to find more books.'
                    }
                  </p>
                  {books.length > 0 && (
                    <button
                      onClick={clearFilters}
                      className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredBooks.map((book) => (
                    <div key={book.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div
                        className="aspect-[3/4] bg-slate-100 cursor-pointer"
                        onClick={() => handleBookClick(book)}
                      >
                        <img
                          src={book.images[0]}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-slate-900 mb-1 overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.2em',
                          maxHeight: '2.4em'
                        }}>{book.title}</h3>
                        <p className="text-sm text-slate-600 mb-2">by {book.author}</p>

                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">
                            {book.genre}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            book.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                            book.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                            book.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {book.condition}
                          </span>
                        </div>

                        <div className="flex items-center text-xs text-slate-500 mb-3">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{book.city}</span>
                          {book.location && (
                            <span className="ml-1">• {book.location}</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div className="flex items-center text-xs text-slate-500">
                            <User className="h-3 w-3 mr-1" />
                            <span className="truncate">{book.owner.name}</span>
                          </div>
                          <button
                            onClick={() => handleContactOwner(book.owner.email, book.title)}
                            className="flex items-center space-x-1 px-3 py-1 text-xs bg-slate-800 text-white rounded hover:bg-slate-900 transition-colors"
                          >
                            <Mail className="h-3 w-3" />
                            <span>Contact</span>
                          </button>
                        </div>

                        {book.description && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <p className="text-xs text-slate-600 overflow-hidden" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: '1.2em',
                              maxHeight: '2.4em'
                            }}>
                              {book.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Book Details Modal */}
      {selectedBook && !showChatModal && (
        <BookDetailsModal
          book={selectedBook}
          onClose={handleCloseModal}
          onChatWithOwner={handleChatWithOwner}
          currentUserName={`${authUser?.firstName} ${authUser?.lastName}`}
        />
      )}

      {/* Chat Modal */}
      {selectedBook && showChatModal && authUser && (
        <ChatModal
          book={selectedBook}
          currentUserId={authUser.id}
          currentUserName={`${authUser.firstName} ${authUser.lastName}`}
          onClose={handleCloseModal}
          onBack={() => setShowChatModal(false)}
        />
      )}
    </div>
  );
}