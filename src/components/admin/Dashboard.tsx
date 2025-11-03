'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from './Sidebar';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  MessageCircle,
  User,
  BookOpen,
  ArrowDownLeft,
  ArrowLeftRight,
  Settings,
  BarChart3,
  Shield,
  LogOut
} from 'lucide-react';

const AdminDashboard = () => {
  const { user: authUser, logout } = useAuth();
  const router = useRouter();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [adminUser, setAdminUser] = useState({
    name: 'Loading...',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeExchanges: 0,
    totalBooks: 0,
    pendingUsers: 0,
    monthlyGrowth: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentBooks, setRecentBooks] = useState<any[]>([]);

  useEffect(() => {
    if (authUser) {
      setAdminUser({
        name: `${authUser.firstName} ${authUser.lastName}`,
        email: authUser.email
      });
    }
  }, [authUser]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalUsers: data.stats.totalUsers,
          activeExchanges: data.stats.activeExchanges,
          totalBooks: data.stats.totalBooks,
          pendingUsers: data.stats.pendingUsers,
          monthlyGrowth: data.stats.monthlyGrowth
        });
        setRecentUsers(data.recentUsers || []);
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
    router.push('/admin/login');
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Sidebar */}
      <AdminSidebar
        activeItem="dashboard"
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 flex flex-col min-h-screen ${
        isSidebarCollapsed ? 'pl-16' : 'pl-64'
      }`}>
        {/* Header */}
        <header className="bg-slate-800 shadow-lg border-b border-slate-700">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-light text-white">Admin Dashboard</h1>
              <div className="flex items-center space-x-4">
                <span className="text-slate-300 font-light">Welcome, {adminUser.name}</span>
                <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Administrator
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-2xl font-light text-slate-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <ArrowLeftRight className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Active Exchanges</p>
                <p className="text-2xl font-light text-slate-900">{stats.activeExchanges}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Books</p>
                <p className="text-2xl font-light text-slate-900">{stats.totalBooks.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Pending Users</p>
                <p className="text-2xl font-light text-slate-900">{stats.pendingUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Monthly Growth</p>
                <p className="text-2xl font-light text-slate-900">+{stats.monthlyGrowth}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Recent Users</h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center text-slate-600">Loading...</div>
              ) : recentUsers.length > 0 ? (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-600">{user.email}</p>
                        <p className="text-xs text-slate-500">{user.joined}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-600">No recent users</div>
              )}
              <button
                onClick={() => router.push('/admin/users')}
                className="w-full mt-4 text-center text-sm text-slate-600 hover:text-slate-900 font-medium"
              >
                View All Users
              </button>
            </div>
          </div>

          {/* Recent Books */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Recent Books Added</h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center text-slate-600">Loading...</div>
              ) : recentBooks.length > 0 ? (
                <div className="space-y-4">
                  {recentBooks.map((book) => (
                    <div key={book.id} className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-purple-100">
                        <BookOpen className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{book.title}</p>
                        <p className="text-xs text-slate-600">by {book.author}</p>
                        <p className="text-xs text-slate-500 mt-1">Added by {book.addedBy} • {book.addedAt}</p>
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
                <div className="text-center text-slate-600">No books added yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/admin/users')}
              className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Users className="h-8 w-8 text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">User Management</span>
            </button>
            <button
              onClick={() => router.push('/admin/profile')}
              className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <User className="h-8 w-8 text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">Profile</span>
            </button>
            <button
              onClick={() => router.push('/admin/chat')}
              className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <MessageCircle className="h-8 w-8 text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">Chat</span>
            </button>
            <button
              onClick={() => router.push('/admin/dashboard')}
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

export default AdminDashboard;