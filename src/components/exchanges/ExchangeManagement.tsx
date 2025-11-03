'use client';

import React, { useState, useEffect } from 'react';
import UserSidebar from '@/components/user/Sidebar';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ArrowRightLeft,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  LogOut,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface Exchange {
  id: string;
  requestedBook: {
    id: string;
    title: string;
    image: string;
    status: string;
  };
  offeredBook: {
    id: string;
    title: string;
    image: string;
    status: string;
  };
  requester: {
    id: string;
    name: string;
  };
  owner: {
    id: string;
    name: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  message?: string;
  responseMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  isSender: boolean;
}

export default function ExchangeManagement() {
  const { user: authUser, logout } = useAuth();
  const router = useRouter();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState<{[key: string]: string}>({});

  const [user, setUser] = useState({
    name: 'Loading...',
    email: ''
  });

  useEffect(() => {
    if (authUser) {
      setUser({
        name: `${authUser.firstName} ${authUser.lastName}`,
        email: authUser.email
      });
    }
  }, [authUser]);

  useEffect(() => {
    fetchExchanges();
  }, [filter]);

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/exchanges?type=${filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExchanges(data.exchanges || []);
      }
    } catch (error) {
      console.error('Failed to fetch exchanges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (exchangeId: string, action: 'accept' | 'reject' | 'complete' | 'cancel') => {
    setActionLoading(exchangeId);

    try {
      const response = await fetch(`/api/exchanges/${exchangeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action,
          responseMessage: responseMessage[exchangeId]?.trim() || undefined
        })
      });

      if (response.ok) {
        await fetchExchanges();
        setResponseMessage(prev => {
          const newState = { ...prev };
          delete newState[exchangeId];
          return newState;
        });
      } else {
        const data = await response.json();
        alert(data.message || 'Action failed');
      }
    } catch (error) {
      console.error('Failed to update exchange:', error);
      alert('Failed to update exchange');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'completed':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredExchanges = statusFilter === 'all'
    ? exchanges
    : exchanges.filter(ex => ex.status === statusFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <UserSidebar
        activeItem="my-exchanges"
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      <div className={`transition-all duration-300 flex flex-col min-h-screen ${
        isSidebarCollapsed ? 'pl-16' : 'pl-64'
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-light text-slate-800">Exchange Requests</h1>
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

        {/* Filters */}
        <div className="px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Requests
              </button>
              <button
                onClick={() => setFilter('sent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'sent'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Sent by Me
              </button>
              <button
                onClick={() => setFilter('received')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'received'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Received
              </button>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : filteredExchanges.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-slate-200">
              <ArrowRightLeft className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No exchange requests</h3>
              <p className="text-sm text-slate-500">
                {filter === 'sent'
                  ? 'You haven\'t sent any exchange requests yet'
                  : filter === 'received'
                  ? 'You haven\'t received any exchange requests yet'
                  : 'No exchange requests found'}
              </p>
              {filter === 'sent' && (
                <button
                  onClick={() => router.push('/exchanges')}
                  className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
                >
                  Browse Books
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExchanges.map((exchange) => (
                <div
                  key={exchange.id}
                  className="bg-white rounded-lg border border-slate-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(exchange.status)}
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(exchange.status)}`}>
                          {exchange.status.charAt(0).toUpperCase() + exchange.status.slice(1)}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">{formatDate(exchange.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">
                        {exchange.isSender ? 'To:' : 'From:'} {exchange.isSender ? exchange.owner.name : exchange.requester.name}
                      </p>
                    </div>
                  </div>

                  {/* Books Exchange */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Book 1 */}
                    <div className="border border-slate-200 rounded-lg p-3">
                      <p className="text-xs text-slate-600 mb-2">
                        {exchange.isSender ? 'You want:' : 'They want your:'}
                      </p>
                      <div className="flex items-center space-x-3">
                        <img
                          src={exchange.requestedBook.image}
                          alt={exchange.requestedBook.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 text-sm truncate">
                            {exchange.requestedBook.title}
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center">
                      <ArrowRightLeft className="h-6 w-6 text-slate-400" />
                    </div>

                    {/* Book 2 */}
                    <div className="border border-slate-200 rounded-lg p-3">
                      <p className="text-xs text-slate-600 mb-2">
                        {exchange.isSender ? 'You offer:' : 'They offer:'}
                      </p>
                      <div className="flex items-center space-x-3">
                        <img
                          src={exchange.offeredBook.image}
                          alt={exchange.offeredBook.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 text-sm truncate">
                            {exchange.offeredBook.title}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  {exchange.message && (
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">
                        {exchange.isSender ? 'Your message:' : 'Their message:'}
                      </p>
                      <p className="text-sm text-slate-900">{exchange.message}</p>
                    </div>
                  )}

                  {exchange.responseMessage && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Response:</p>
                      <p className="text-sm text-slate-900">{exchange.responseMessage}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {exchange.status === 'pending' && !exchange.isSender && (
                    <div className="space-y-3">
                      <textarea
                        placeholder="Optional: Add a response message..."
                        value={responseMessage[exchange.id] || ''}
                        onChange={(e) => setResponseMessage(prev => ({
                          ...prev,
                          [exchange.id]: e.target.value
                        }))}
                        maxLength={500}
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none text-sm"
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleAction(exchange.id, 'accept')}
                          disabled={actionLoading === exchange.id}
                          className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === exchange.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              <span>Accept Exchange</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleAction(exchange.id, 'reject')}
                          disabled={actionLoading === exchange.id}
                          className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === exchange.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="h-4 w-4" />
                              <span>Reject</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {exchange.status === 'pending' && exchange.isSender && (
                    <button
                      onClick={() => handleAction(exchange.id, 'cancel')}
                      disabled={actionLoading === exchange.id}
                      className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === exchange.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          <span>Cancel Request</span>
                        </>
                      )}
                    </button>
                  )}

                  {exchange.status === 'accepted' && (
                    <button
                      onClick={() => handleAction(exchange.id, 'complete')}
                      disabled={actionLoading === exchange.id}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === exchange.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Package className="h-4 w-4" />
                          <span>Mark as Completed</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
