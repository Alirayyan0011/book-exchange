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

  useEffect(() => {
    if (authUser) {
      setAdminUser({
        name: `${authUser.firstName} ${authUser.lastName}`,
        email: authUser.email
      });
    }
  }, [authUser]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  const [stats] = useState({
    totalUsers: 1247,
    activeExchanges: 89,
    totalBooks: 3456,
    pendingReports: 12,
    monthlyGrowth: 15.3
  });

  const [recentUsers] = useState([
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', joined: '2 days ago', status: 'active' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', joined: '1 week ago', status: 'active' },
    { id: 3, name: 'Carol White', email: 'carol@example.com', joined: '3 days ago', status: 'pending' }
  ]);

  const [recentActivity] = useState([
    { id: 1, type: 'user_registered', description: 'New user Alice Johnson registered', time: '2 minutes ago' },
    { id: 2, type: 'book_exchanged', description: 'Book exchange completed between Bob and Carol', time: '1 hour ago' },
    { id: 3, type: 'report_filed', description: 'User reported inappropriate content', time: '3 hours ago' },
    { id: 4, type: 'book_added', description: '15 new books added to the platform', time: '1 day ago' }
  ]);

  const [pendingReports] = useState([
    { id: 1, type: 'Inappropriate Content', reporter: 'User #1234', reported: 'User #5678', time: '2 hours ago' },
    { id: 2, type: 'Spam Activity', reporter: 'User #3456', reported: 'User #7890', time: '1 day ago' }
  ]);

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
                <p className="text-sm font-medium text-slate-600">Pending Reports</p>
                <p className="text-2xl font-light text-slate-900">{stats.pendingReports}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Recent Users</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-600">{user.email}</p>
                      <p className="text-xs text-slate-500">{user.joined}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-center text-sm text-slate-600 hover:text-slate-900 font-medium">
                View All Users
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">System Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'user_registered' ? 'bg-blue-100' :
                      activity.type === 'book_exchanged' ? 'bg-green-100' :
                      activity.type === 'report_filed' ? 'bg-red-100' : 'bg-purple-100'
                    }`}>
                      {activity.type === 'user_registered' && (
                        <User className="h-4 w-4 text-blue-600" />
                      )}
                      {activity.type === 'book_exchanged' && (
                        <ArrowLeftRight className="h-4 w-4 text-green-600" />
                      )}
                      {activity.type === 'report_filed' && (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      {activity.type === 'book_added' && (
                        <Plus className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900">{activity.description}</p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pending Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-medium text-slate-900">Pending Reports</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pendingReports.map((report) => (
                  <div key={report.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-red-600">{report.type}</span>
                      <span className="text-xs text-slate-500">{report.time}</span>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">
                      {report.reporter} reported {report.reported}
                    </p>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200">
                        Review
                      </button>
                      <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200">
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-center text-sm text-slate-600 hover:text-slate-900 font-medium">
                View All Reports
              </button>
            </div>
          </div>
        </div>

        {/* Admin Tools */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Admin Tools</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <button className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Users className="h-8 w-8 text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">Manage Users</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <BookOpen className="h-8 w-8 text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">Book Catalog</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <BarChart3 className="h-8 w-8 text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">Analytics</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <AlertTriangle className="h-8 w-8 text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">Reports</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Settings className="h-8 w-8 text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">Settings</span>
            </button>
            <button className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <MessageCircle className="h-8 w-8 text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">Messages</span>
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;