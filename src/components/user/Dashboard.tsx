'use client';

import React, { useState, useEffect } from 'react';
import UserSidebar from './Sidebar';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  ArrowDownLeft,
  ArrowLeftRight,
  Plus,
  Search,
  MessageCircle,
  User,
  TrendingUp,
  AlertTriangle,
  LogOut,
  BarChart3
} from 'lucide-react';

const UserDashboard = () => {
  const { user: authUser, logout } = useAuth();
  const router = useRouter();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: 'Loading...',
    email: '',
    booksShared: 0,
    booksReceived: 0,
    activeExchanges: 0
  });
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    exchangedBooks: 0,
    pendingBooks: 0
  });
  const [recentBooks, setRecentBooks] = useState<any[]>([]);

  useEffect(() => {
    if (authUser) {
      setUser(prev => ({
        ...prev,
        name: `${authUser.firstName} ${authUser.lastName}`,
        email: authUser.email
      }));
    }
  }, [authUser]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/user/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalBooks: data.stats.totalBooks,
          availableBooks: data.stats.availableBooks,
          exchangedBooks: data.stats.exchangedBooks,
          pendingBooks: data.stats.pendingBooks
        });
        setUser(prev => ({
          ...prev,
          booksShared: data.stats.booksShared,
          booksReceived: data.stats.booksReceived,
          activeExchanges: data.stats.activeExchanges
        }));
        setRecentBooks(data.recentBooks || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <UserSidebar
        activeItem="dashboard"
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
              <h1 className="text-2xl font-light text-slate-800">Dashboard</h1>
              <div className="flex items-center space-x-4">
                <span className="text-slate-600 font-light">Welcome, {user.name}</span>
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

        <div className="flex-1 p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Books Shared</p>
                <p className="text-2xl font-light text-slate-900">{user.booksShared}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <ArrowDownLeft className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Books Received</p>
                <p className="text-2xl font-light text-slate-900">{user.booksReceived}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100">
                <ArrowLeftRight className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Active Exchanges</p>
                <p className="text-2xl font-light text-slate-900">{user.activeExchanges}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Books */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">My Recent Books</h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center text-slate-600">Loading...</div>
              ) : recentBooks.length > 0 ? (
                <div className="space-y-4">
                  {recentBooks.map((book) => (
                    <div key={book.id} className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{book.title}</p>
                        <p className="text-xs text-slate-600">by {book.author}</p>
                        <p className="text-xs text-slate-500 mt-1">Added {book.addedAt}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.status === 'available' ? 'bg-green-100 text-green-800' :
                        book.status === 'exchanged' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {book.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-600">
                  <p className="mb-4">You haven't added any books yet</p>
                  <button
                    onClick={() => router.push('/books')}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-light hover:bg-slate-900 transition-colors"
                  >
                    Add Your First Book
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Book Statistics</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-blue-100">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-slate-900">Total Books</span>
                  </div>
                  <span className="text-2xl font-light text-slate-900">{stats.totalBooks}</span>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-green-100">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-slate-900">Available</span>
                  </div>
                  <span className="text-2xl font-light text-slate-900">{stats.availableBooks}</span>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-purple-100">
                      <ArrowLeftRight className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-slate-900">Exchanged</span>
                  </div>
                  <span className="text-2xl font-light text-slate-900">{stats.exchangedBooks}</span>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-amber-100">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <span className="font-medium text-slate-900">Pending</span>
                  </div>
                  <span className="text-2xl font-light text-slate-900">{stats.pendingBooks}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={() => router.push('/books')}
              className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <BookOpen className="h-8 w-8 text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">My Books</span>
            </button>
            <button
              onClick={() => router.push('/exchanges')}
              className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ArrowLeftRight className="h-8 w-8 text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">Exchanges</span>
            </button>
            <button
              onClick={() => router.push('/chat')}
              className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <MessageCircle className="h-8 w-8 text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">Chat</span>
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <User className="h-8 w-8 text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">Profile</span>
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <BarChart3 className="h-8 w-8 text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">Dashboard</span>
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;