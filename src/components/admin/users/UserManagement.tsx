'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, BookOpen, ArrowRightLeft, Mail, Phone, Calendar, CheckCircle, XCircle, AlertCircle, LogOut, Trash2 } from 'lucide-react';
import AdminSidebar from '@/components/admin/Sidebar';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

interface UserStats {
  totalBooks: number;
  availableBooks: number;
  exchangedBooks: number;
  pendingBooks: number;
  successfulExchanges: number;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber?: string;
  profileImage?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  stats: UserStats;
}

export default function UserManagement() {
  const { user: authUser, logout } = useAuth();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('all');

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users?status=${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        setMessage(data.message || 'Failed to fetch users');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error fetching users');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingUsers(prev => new Set([...prev, userId]));

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setMessageType('success');

        // Remove user from list or update their status
        if (action === 'reject') {
          setUsers(prev => prev.filter(user => user.id !== userId));
        } else {
          setUsers(prev => prev.map(user =>
            user.id === userId ? { ...user, isApproved: true } : user
          ));
        }
      } else {
        setMessage(data.message || `Failed to ${action} user`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`Error ${action}ing user`);
      setMessageType('error');
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This will permanently delete the user and ALL their books. This action cannot be undone.`)) {
      return;
    }

    try {
      setProcessingUsers(prev => new Set([...prev, userId]));

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setMessageType('success');

        // Remove user from list
        setUsers(prev => prev.filter(user => user.id !== userId));
      } else {
        setMessage(data.message || 'Failed to delete user');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error deleting user');
      setMessageType('error');
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTabCount = () => {
    if (activeTab === 'pending') {
      return users.filter(user => !user.isApproved).length;
    } else if (activeTab === 'approved') {
      return users.filter(user => user.isApproved).length;
    }
    return users.length;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeItem="user-management"
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
              <p className="text-sm text-slate-600 mt-1">Manage user registrations and monitor user activity</p>
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
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="border-b border-slate-200">
              <nav className="flex">
                <button
                  onClick={() => {
                    setActiveTab('all');
                    setMessage('');
                  }}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'all'
                      ? 'border-slate-800 text-slate-800'
                      : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  All Users ({users.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('pending');
                    setMessage('');
                  }}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'pending'
                      ? 'border-slate-800 text-slate-800'
                      : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  Signup Requests ({users.filter(u => !u.isApproved).length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('approved');
                    setMessage('');
                  }}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'approved'
                      ? 'border-slate-800 text-slate-800'
                      : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <UserCheck className="h-4 w-4 inline mr-2" />
                  Approved Users ({users.filter(u => u.isApproved).length})
                </button>
              </nav>
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
                  <p className="text-slate-600 font-light">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    {activeTab === 'pending' ? 'No pending requests' :
                     activeTab === 'approved' ? 'No approved users' : 'No users found'}
                  </h3>
                  <p className="text-slate-600">
                    {activeTab === 'pending' ? 'All signup requests have been processed.' :
                     activeTab === 'approved' ? 'No users have been approved yet.' : 'No users are registered yet.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Books & Exchanges
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                                {user.profileImage ? (
                                  <img
                                    src={user.profileImage}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-slate-600 font-medium text-sm">
                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-slate-500">
                                  ID: {user.id.slice(-8)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 text-slate-400 mr-2" />
                                <span>{user.email}</span>
                              </div>
                              {user.mobileNumber && (
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 text-slate-400 mr-2" />
                                  <span>{user.mobileNumber}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center text-slate-600">
                                <BookOpen className="h-4 w-4 mr-1" />
                                <span>{user.stats.totalBooks} books</span>
                              </div>
                              <div className="flex items-center text-slate-600">
                                <ArrowRightLeft className="h-4 w-4 mr-1" />
                                <span>{user.stats.successfulExchanges} exchanges</span>
                              </div>
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              Available: {user.stats.availableBooks} •
                              Exchanged: {user.stats.exchangedBooks} •
                              Pending: {user.stats.pendingBooks}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isApproved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.isApproved ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approved
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Pending
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(user.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {activeTab === 'pending' && !user.isApproved && (
                                <>
                                  <button
                                    onClick={() => handleUserAction(user.id, 'approve')}
                                    disabled={processingUsers.has(user.id)}
                                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 transition-colors text-xs"
                                  >
                                    {processingUsers.has(user.id) ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                    ) : (
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                    )}
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleUserAction(user.id, 'reject')}
                                    disabled={processingUsers.has(user.id)}
                                    className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400 transition-colors text-xs"
                                  >
                                    {processingUsers.has(user.id) ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                    ) : (
                                      <XCircle className="h-3 w-3 mr-1" />
                                    )}
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                                disabled={processingUsers.has(user.id)}
                                className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400 transition-colors text-xs"
                              >
                                {processingUsers.has(user.id) ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                ) : (
                                  <Trash2 className="h-3 w-3 mr-1" />
                                )}
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}