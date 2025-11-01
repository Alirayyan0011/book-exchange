'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Plus, Upload, Camera, MapPin, LogOut, Edit3, Trash2, X } from 'lucide-react';
import UserSidebar from '@/components/user/Sidebar';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

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
}

export default function BooksLayout() {
  const { user: authUser, logout } = useAuth();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'my-books'>('add');

  // Books state
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Book Form State
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    condition: 'good',
    description: '',
    location: '',
    city: ''
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    condition: 'good',
    description: '',
    location: '',
    city: '',
    status: 'available'
  });
  const [editSelectedImages, setEditSelectedImages] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch books from API
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/books', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 images
    const maxImages = 5;
    const currentCount = selectedImages.length;
    const availableSlots = maxImages - currentCount;

    if (availableSlots <= 0) {
      setMessage(`You can only upload up to ${maxImages} images`);
      setMessageType('error');
      return;
    }

    const filesToAdd = files.slice(0, availableSlots);

    // Validate file sizes
    for (const file of filesToAdd) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Each image should be less than 5MB');
        setMessageType('error');
        return;
      }
    }

    setSelectedImages(prev => [...prev, ...filesToAdd]);

    // Create previews
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    try {
      // Validate required fields
      if (!formData.title || !formData.author || !formData.genre || !formData.city) {
        setMessage('Please fill in all required fields');
        setMessageType('error');
        setUploading(false);
        return;
      }

      if (selectedImages.length === 0) {
        setMessage('Please add at least one image of your book');
        setMessageType('error');
        setUploading(false);
        return;
      }

      // Create FormData
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      selectedImages.forEach((image, index) => {
        formDataToSend.append(`images`, image);
      });

      // Make API call to create book
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/books', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!data.success) {
        setMessage(data.message || 'Failed to add book');
        setMessageType('error');
        setUploading(false);
        return;
      }

      setMessage('Book added successfully!');
      setMessageType('success');

      // Add new book to the list
      setBooks(prev => [data.book, ...prev]);

      // Reset form
      setFormData({
        title: '',
        author: '',
        isbn: '',
        genre: '',
        condition: 'good',
        description: '',
        location: '',
        city: ''
      });
      setSelectedImages([]);
      setImagePreviews([]);

      // Switch to My Books tab
      setTimeout(() => {
        setActiveTab('my-books');
      }, 1500);

    } catch (error) {
      setMessage('Error adding book. Please try again.');
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  // Edit Modal Functions
  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setEditFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      genre: book.genre,
      condition: book.condition,
      description: book.description || '',
      location: book.location || '',
      city: book.city,
      status: book.status
    });
    setEditExistingImages([...book.images]);
    setEditSelectedImages([]);
    setEditImagePreviews([]);
    setImagesToDelete([]);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingBook(null);
    setEditFormData({
      title: '',
      author: '',
      isbn: '',
      genre: '',
      condition: 'good',
      description: '',
      location: '',
      city: '',
      status: 'available'
    });
    setEditExistingImages([]);
    setEditSelectedImages([]);
    setEditImagePreviews([]);
    setImagesToDelete([]);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxImages = 5;
    const currentCount = editExistingImages.length - imagesToDelete.length + editSelectedImages.length;
    const availableSlots = maxImages - currentCount;

    if (availableSlots <= 0) {
      setMessage(`You can only have up to ${maxImages} images total`);
      setMessageType('error');
      return;
    }

    const filesToAdd = files.slice(0, availableSlots);

    for (const file of filesToAdd) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Each image should be less than 5MB');
        setMessageType('error');
        return;
      }
    }

    setEditSelectedImages(prev => [...prev, ...filesToAdd]);

    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEditImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const imageUrl = editExistingImages[index];
      setImagesToDelete(prev => [...prev, imageUrl]);
    } else {
      setEditSelectedImages(prev => prev.filter((_, i) => i !== index));
      setEditImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    try {
      if (!editingBook) return;

      if (!editFormData.title || !editFormData.author || !editFormData.genre || !editFormData.city) {
        setMessage('Please fill in all required fields');
        setMessageType('error');
        setUploading(false);
        return;
      }

      const remainingImages = editExistingImages.length - imagesToDelete.length + editSelectedImages.length;
      if (remainingImages === 0) {
        setMessage('At least one image is required');
        setMessageType('error');
        setUploading(false);
        return;
      }

      const formDataToSend = new FormData();
      Object.entries(editFormData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      editSelectedImages.forEach((image) => {
        formDataToSend.append('newImages', image);
      });

      imagesToDelete.forEach((imageUrl) => {
        formDataToSend.append('deleteImages', imageUrl);
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/user/books/${editingBook.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!data.success) {
        setMessage(data.message || 'Failed to update book');
        setMessageType('error');
        setUploading(false);
        return;
      }

      setMessage('Book updated successfully!');
      setMessageType('success');

      setBooks(prev => prev.map(book =>
        book.id === editingBook.id ? data.book : book
      ));

      closeEditModal();

    } catch (error) {
      setMessage('Error updating book. Please try again.');
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/user/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Book deleted successfully');
        setMessageType('success');
        setBooks(prev => prev.filter(book => book.id !== bookId));
      } else {
        setMessage(data.message || 'Failed to delete book');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error deleting book');
      setMessageType('error');
    }
  };

  const genres = [
    'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Romance',
    'Thriller', 'Biography', 'History', 'Science', 'Philosophy', 'Self-Help',
    'Children', 'Young Adult', 'Classic', 'Poetry', 'Drama', 'Other'
  ];

  const conditions = [
    { value: 'excellent', label: 'Excellent - Like new' },
    { value: 'good', label: 'Good - Minor wear' },
    { value: 'fair', label: 'Fair - Some wear' },
    { value: 'poor', label: 'Poor - Heavy wear' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <UserSidebar
        activeItem="my-books"
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 flex flex-col min-h-screen ${
        isSidebarCollapsed ? 'pl-16' : 'pl-64'
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-light text-slate-800">My Books</h1>
              <div className="flex items-center space-x-4">
                <span className="text-slate-600 font-light">
                  Welcome, {authUser?.firstName} {authUser?.lastName}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
              <div className="border-b border-slate-200">
                <nav className="flex">
                  <button
                    onClick={() => {
                      setActiveTab('add');
                      setMessage('');
                    }}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'add'
                        ? 'border-slate-800 text-slate-800'
                        : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <Plus className="h-4 w-4 inline mr-2" />
                    Add Book
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('my-books');
                      setMessage('');
                    }}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'my-books'
                        ? 'border-slate-800 text-slate-800'
                        : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <BookOpen className="h-4 w-4 inline mr-2" />
                    My Books ({books.length})
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'add' && (
                  <div>
                    {message && (
                      <div className={`mb-6 p-4 rounded-lg ${
                        messageType === 'success'
                          ? 'bg-green-50 border border-green-200 text-green-800'
                          : 'bg-red-50 border border-red-200 text-red-800'
                      }`}>
                        {message}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Book Images */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                          Book Images *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Book image ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-slate-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          {selectedImages.length < 5 && (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <Camera className="h-6 w-6 mb-2" />
                              <span className="text-xs">Add Image</span>
                            </button>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <p className="text-xs text-slate-500">
                          Add up to 5 images. Each image should be less than 5MB.
                        </p>
                      </div>

                      {/* Book Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Book Title *
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                            placeholder="Enter book title"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Author *
                          </label>
                          <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                            placeholder="Enter author name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            ISBN (Optional)
                          </label>
                          <input
                            type="text"
                            name="isbn"
                            value={formData.isbn}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                            placeholder="Enter ISBN"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Genre *
                          </label>
                          <select
                            name="genre"
                            value={formData.genre}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                            required
                          >
                            <option value="">Select a genre</option>
                            {genres.map(genre => (
                              <option key={genre} value={genre}>{genre}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Condition *
                          </label>
                          <select
                            name="condition"
                            value={formData.condition}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                            required
                          >
                            {conditions.map(condition => (
                              <option key={condition.value} value={condition.value}>
                                {condition.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                            placeholder="Enter your city"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Specific Location (Optional)
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                          placeholder="e.g., Near Central Library, Downtown area"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                          placeholder="Describe the book's condition, any special notes, etc."
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={uploading}
                          className="px-6 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 text-sm"
                        >
                          {uploading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Adding Book...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              <span>Add Book</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'my-books' && (
                  <div>
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
                        <p className="text-slate-600 font-light">Loading your books...</p>
                      </div>
                    ) : books.length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No books yet</h3>
                        <p className="text-slate-600 mb-4">Start by adding your first book to share with others.</p>
                        <button
                          onClick={() => setActiveTab('add')}
                          className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors"
                        >
                          Add Your First Book
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {books.map((book) => (
                          <div key={book.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-[3/4] bg-slate-100">
                              <img
                                src={book.images[0]}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4">
                              <h3 className="font-medium text-slate-900 mb-1">{book.title}</h3>
                              <p className="text-sm text-slate-600 mb-2">by {book.author}</p>
                              <p className="text-xs text-slate-500 mb-2">{book.genre}</p>
                              <div className="flex items-center justify-between mb-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  book.status === 'available'
                                    ? 'bg-green-100 text-green-800'
                                    : book.status === 'exchanged'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {book.status === 'available' ? 'Available' :
                                   book.status === 'exchanged' ? 'Exchanged' : 'Pending'}
                                </span>
                                <div className="flex items-center text-xs text-slate-500">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {book.city}
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <button
                                  onClick={() => openEditModal(book)}
                                  className="flex items-center space-x-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                                >
                                  <Edit3 className="h-3 w-3" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteBook(book.id)}
                                  className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-slate-900">Edit Book</h2>
                <button
                  onClick={closeEditModal}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
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

              <form onSubmit={handleEditSubmit} className="space-y-6">
                {/* Images Section */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Book Images *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    {/* Existing Images */}
                    {editExistingImages.map((imageUrl, index) => (
                      !imagesToDelete.includes(imageUrl) && (
                        <div key={`existing-${index}`} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Book image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeEditImage(index, true)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      )
                    ))}

                    {/* New Images */}
                    {editImagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <img
                          src={preview}
                          alt={`New book image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeEditImage(index, false)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {/* Add Image Button */}
                    {(editExistingImages.length - imagesToDelete.length + editSelectedImages.length) < 5 && (
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Camera className="h-6 w-6 mb-2" />
                        <span className="text-xs">Add Image</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditImageSelect}
                    className="hidden"
                  />
                  <p className="text-xs text-slate-500">
                    Add up to 5 images total. Each image should be less than 5MB.
                  </p>
                </div>

                {/* Book Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Book Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Author *
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={editFormData.author}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      ISBN (Optional)
                    </label>
                    <input
                      type="text"
                      name="isbn"
                      value={editFormData.isbn}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Genre *
                    </label>
                    <select
                      name="genre"
                      value={editFormData.genre}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                      required
                    >
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Condition *
                    </label>
                    <select
                      name="condition"
                      value={editFormData.condition}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                      required
                    >
                      {conditions.map(condition => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                      required
                    >
                      <option value="available">Available</option>
                      <option value="pending">Pending Exchange</option>
                      <option value="exchanged">Exchanged</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={editFormData.city}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Specific Location (Optional)
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={editFormData.location}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                    placeholder="e.g., Near Central Library, Downtown area"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all text-sm"
                    placeholder="Describe the book's condition, any special notes, etc."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-6 py-2 text-slate-600 hover:text-slate-800 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 text-sm"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Update Book</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}