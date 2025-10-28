'use client';

import React, { useState } from 'react';
import UserSidebar from './Sidebar';
import {
  BookOpen,
  ArrowDownLeft,
  ArrowLeftRight,
  Plus,
  Search,
  MessageCircle,
  User,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

const UserDashboard = () => {
  const [user] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    booksShared: 12,
    booksReceived: 8,
    activeExchanges: 3
  });

  const [recentActivity] = useState([
    { id: 1, type: 'shared', book: 'The Great Gatsby', user: 'Alice Johnson', date: '2 days ago' },
    { id: 2, type: 'received', book: '1984', user: 'Bob Smith', date: '1 week ago' },
    { id: 3, type: 'requested', book: 'To Kill a Mockingbird', user: 'Carol White', date: '3 days ago' }
  ]);

  const [myBooks] = useState([
    { id: 1, title: 'The Catcher in the Rye', author: 'J.D. Salinger', status: 'Available' },
    { id: 2, title: 'Pride and Prejudice', author: 'Jane Austen', status: 'Exchanged' },
    { id: 3, title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', status: 'Available' }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <UserSidebar activeItem="dashboard" />

      {/* Main Content */}
      <div className="pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-light text-slate-800">Dashboard</h1>
              <div className="flex items-center space-x-4">
                <span className="text-slate-600 font-light">Welcome, {user.name}</span>
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
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'shared' ? 'bg-blue-100' :
                      activity.type === 'received' ? 'bg-green-100' : 'bg-amber-100'
                    }`}>
                      {activity.type === 'shared' && (
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                      )}
                      {activity.type === 'received' && (
                        <ArrowDownLeft className="h-4 w-4 text-green-600" />
                      )}
                      {activity.type === 'requested' && (
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">
                        <span className="font-medium">
                          {activity.type === 'shared' ? 'Shared' :
                           activity.type === 'received' ? 'Received' : 'Requested'}
                        </span>{' '}
                        "{activity.book}" {activity.type !== 'requested' ? 'with' : 'from'} {activity.user}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* My Books */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-900">My Books</h3>
              <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-light hover:bg-slate-900 transition-colors">
                Add Book
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {myBooks.map((book) => (
                  <div key={book.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">{book.title}</h4>
                      <p className="text-sm text-slate-600">by {book.author}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      book.status === 'Available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {book.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Plus className="h-8 w-8 text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">Add Book</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Search className="h-8 w-8 text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">Browse Books</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <MessageCircle className="h-8 w-8 text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">Messages</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <User className="h-8 w-8 text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">Profile</span>
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;